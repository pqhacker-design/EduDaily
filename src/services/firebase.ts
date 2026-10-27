import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, ClassInfo, Quiz, QuizAttempt, AppNotification } from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_CLASSES, 
  INITIAL_QUIZZES, 
  INITIAL_ATTEMPTS, 
  INITIAL_NOTIFICATIONS 
} from '../data/initialData';
import { resetAllData } from '../utils/storage';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error Handling per Firestore Skill Guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or initializing.");
    }
    return false;
  }
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  CLASSES: 'classes',
  QUIZZES: 'quizzes',
  ATTEMPTS: 'attempts',
  NOTIFICATIONS: 'notifications'
} as const;

/**
 * Seed initial data if collections are empty in Firestore, or if admin pqhacker@gmail.com is missing
 */
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    const adminHung = INITIAL_USERS.find(u => u.email === 'pqhacker@gmail.com') || INITIAL_USERS[0];

    if (usersSnap.empty) {
      console.log('Seeding initial official admin to Firestore...');
      const batch = writeBatch(db);
      INITIAL_USERS.forEach(u => {
        batch.set(doc(db, COLLECTIONS.USERS, u.id), u);
      });
      await batch.commit();
      console.log('Official admin seeded to Firestore!');
    } else {
      // Check if admin Ngô Thanh Hùng exists in remote Firestore
      const hasAdminHung = usersSnap.docs.some(d => (d.data() as User).email === 'pqhacker@gmail.com');
      if (!hasAdminHung) {
        await setDoc(doc(db, COLLECTIONS.USERS, adminHung.id), adminHung, { merge: true });
        console.log('Ensured admin Ngô Thanh Hùng exists in Firestore!');
      }
    }
  } catch (error) {
    console.error('Failed to seed initial data:', error);
  }
}

/**
 * Wipe all old demo data from Firestore and local storage, retaining only the official admin
 */
export async function wipeAllDemoDataFromFirestore(): Promise<void> {
  try {
    const batch = writeBatch(db);

    // List of known demo IDs to purge
    const demoUserIds = ['s-01', 's-02', 's-03', 's-04', 's-05', 's-06', 't-01', 't-02', 'admin-01'];
    const demoClassIds = ['10A1', '10A2', '9B', '11A3'];
    const demoQuizIds = ['quiz-toan-10-01', 'quiz-anh-10-01', 'quiz-ly-10-01', 'quiz-daily-challenge'];
    const demoAttemptIds = ['att-01', 'att-02', 'att-03'];
    const demoNotifIds = ['notif-01', 'notif-02', 'notif-03'];

    demoUserIds.forEach(id => batch.delete(doc(db, COLLECTIONS.USERS, id)));
    demoClassIds.forEach(id => batch.delete(doc(db, COLLECTIONS.CLASSES, id)));
    demoQuizIds.forEach(id => batch.delete(doc(db, COLLECTIONS.QUIZZES, id)));
    demoAttemptIds.forEach(id => batch.delete(doc(db, COLLECTIONS.ATTEMPTS, id)));
    demoNotifIds.forEach(id => batch.delete(doc(db, COLLECTIONS.NOTIFICATIONS, id)));

    // Ensure official admin exists
    const adminHung = INITIAL_USERS[0];
    batch.set(doc(db, COLLECTIONS.USERS, adminHung.id), adminHung, { merge: true });

    await batch.commit();
    resetAllData();
    console.log('Successfully wiped all demo data from Firestore!');
  } catch (error) {
    console.error('Failed to wipe demo data from Firestore:', error);
  }
}

// Real-time Subscriptions (returns full list on every snapshot, ensuring deletes reflect instantly)
export function subscribeToUsers(onUpdate: (users: User[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.USERS),
    (snapshot) => {
      const data: User[] = [];
      snapshot.forEach(docSnap => data.push(docSnap.data() as User));
      onUpdate(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.USERS);
    }
  );
}

export function subscribeToClasses(onUpdate: (classes: ClassInfo[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.CLASSES),
    (snapshot) => {
      const data: ClassInfo[] = [];
      snapshot.forEach(docSnap => data.push(docSnap.data() as ClassInfo));
      onUpdate(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.CLASSES);
    }
  );
}

export function subscribeToQuizzes(onUpdate: (quizzes: Quiz[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.QUIZZES),
    (snapshot) => {
      const data: Quiz[] = [];
      snapshot.forEach(docSnap => data.push(docSnap.data() as Quiz));
      onUpdate(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.QUIZZES);
    }
  );
}

export function subscribeToAttempts(onUpdate: (attempts: QuizAttempt[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.ATTEMPTS),
    (snapshot) => {
      const data: QuizAttempt[] = [];
      snapshot.forEach(docSnap => data.push(docSnap.data() as QuizAttempt));
      onUpdate(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.ATTEMPTS);
    }
  );
}

export function subscribeToNotifications(onUpdate: (notifs: AppNotification[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    (snapshot) => {
      const data: AppNotification[] = [];
      snapshot.forEach(docSnap => data.push(docSnap.data() as AppNotification));
      onUpdate(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.NOTIFICATIONS);
    }
  );
}

// Firestore Mutations
export async function syncUserToFirestore(user: User): Promise<void> {
  const path = `${COLLECTIONS.USERS}/${user.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function batchSyncUsersToFirestore(newUsers: User[]): Promise<void> {
  if (!newUsers.length) return;
  try {
    const batch = writeBatch(db);
    newUsers.forEach(u => {
      batch.set(doc(db, COLLECTIONS.USERS, u.id), u, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.USERS);
  }
}

export async function deleteUserFromFirestore(userId: string): Promise<void> {
  const path = `${COLLECTIONS.USERS}/${userId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncClassToFirestore(cls: ClassInfo): Promise<void> {
  const path = `${COLLECTIONS.CLASSES}/${cls.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.CLASSES, cls.id), cls, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteClassFromFirestore(classId: string): Promise<void> {
  const path = `${COLLECTIONS.CLASSES}/${classId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.CLASSES, classId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncQuizToFirestore(quiz: Quiz): Promise<void> {
  const path = `${COLLECTIONS.QUIZZES}/${quiz.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.QUIZZES, quiz.id), quiz, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncAttemptToFirestore(attempt: QuizAttempt): Promise<void> {
  const path = `${COLLECTIONS.ATTEMPTS}/${attempt.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.ATTEMPTS, attempt.id), attempt, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncNotificationToFirestore(notif: AppNotification): Promise<void> {
  const path = `${COLLECTIONS.NOTIFICATIONS}/${notif.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notif.id), notif, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
