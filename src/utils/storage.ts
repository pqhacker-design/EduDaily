import { User, Quiz, QuizAttempt, AppNotification, Badge, ClassInfo } from '../types';
import { INITIAL_USERS, INITIAL_QUIZZES, INITIAL_ATTEMPTS, INITIAL_NOTIFICATIONS, BADGES, INITIAL_CLASSES } from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'edudaily_current_user_id_v3',
  USERS: 'edudaily_users_v3',
  CLASSES: 'edudaily_classes_v3',
  QUIZZES: 'edudaily_quizzes_v3',
  ATTEMPTS: 'edudaily_attempts_v3',
  NOTIFICATIONS: 'edudaily_notifications_v3',
};

export function getStoredClasses(): ClassInfo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading classes from storage', e);
  }
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  return INITIAL_CLASSES;
}

export function saveClasses(classes: ClassInfo[]): void {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
}

export function getStoredUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (data) {
      const parsed: User[] = JSON.parse(data);
      let updated = false;

      // Always ensure the official admin Ngô Thanh Hùng (pqhacker@gmail.com) exists
      const officialAdmin = INITIAL_USERS.find(u => u.email === 'pqhacker@gmail.com') || INITIAL_USERS[0];
      const hasOfficialAdmin = parsed.some(u => u.email === 'pqhacker@gmail.com');
      
      if (!hasOfficialAdmin) {
        // Remove any old demo admin
        const filtered = parsed.filter(u => u.id !== 'admin-01');
        filtered.unshift(officialAdmin);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
        return filtered;
      }

      parsed.forEach(u => {
        if (!u.password) {
          u.password = '123456';
          updated = true;
        }
        if (!u.initialPassword) {
          u.initialPassword = u.password;
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading users from storage', e);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  const users = getStoredUsers();
  const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  if (!currentId) return null;
  const found = users.find(u => u.id === currentId);
  return found || null;
}

export function setCurrentUserId(userId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
}

export function clearCurrentUserId(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
}

export function getStoredQuizzes(): Quiz[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading quizzes from storage', e);
  }
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
  return INITIAL_QUIZZES;
}

export function saveQuizzes(quizzes: Quiz[]): void {
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
}

export function getStoredAttempts(): QuizAttempt[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading attempts from storage', e);
  }
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(INITIAL_ATTEMPTS));
  return INITIAL_ATTEMPTS;
}

export function saveAttempts(attempts: QuizAttempt[]): void {
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading notifications from storage', e);
  }
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  return INITIAL_NOTIFICATIONS;
}

export function saveNotifications(notifications: AppNotification[]): void {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(INITIAL_ATTEMPTS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
}

export function getAllBadges(): Badge[] {
  return BADGES;
}
