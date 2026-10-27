export type Role = 'student' | 'teacher' | 'admin';

export type Subject = 
  | 'toan' 
  | 'van' 
  | 'anh' 
  | 'khtn' 
  | 'ly' 
  | 'hoa' 
  | 'sinh' 
  | 'su_dia' 
  | 'tin';

export type Grade = 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Difficulty = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  classId: string;
  className: string;
  streakDays: number;
  totalPoints: number;
  badgesEarned: string[]; // Badge codes
  schoolName: string;
  subjectSpecialty?: string; // For teachers
  password?: string; // Stored user password
  initialPassword?: string; // Initial password set by admin
}

export interface Question {
  id: string;
  text: string;
  options: [string, string, string, string] | string[];
  correctIndex: number;
  explanation: string;
  subject: Subject;
  grade: Grade;
  topic: string;
  difficulty: Difficulty;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  grade: Grade;
  topic: string;
  questions: Question[];
  timeLimitMinutes: number; // e.g. 10 min
  maxAttempts: number; // e.g. 2 attempts allowed
  assignedClassIds: string[]; // e.g. ['10A1', '10A2']
  createdByTeacherId: string;
  createdByTeacherName: string;
  createdAt: string;
  dueDate: string;
  isDailyChallenge?: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  studentClass: string;
  attemptNumber: number;
  answers: Record<string, number>; // questionId -> selectedIndex
  score: number; // 0.0 - 10.0 scale
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  submittedAt: string;
  missedQuestionIds: string[];
}

export interface AppNotification {
  id: string;
  studentId: string; // specific student ID or 'all'
  title: string;
  message: string;
  type: 'new_quiz' | 'badge_earned' | 'reminder' | 'rank_up';
  quizId?: string;
  createdAt: string;
  read: boolean;
}

export interface Badge {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  requirement: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  grade: Grade;
  teacherId: string;
  teacherName: string;
  academicYear: string;
}

export interface RemedialRecommendation {
  id: string;
  subject: Subject;
  topic: string;
  reason: string;
  missedQuestionsCount: number;
  recommendedQuestions: Question[];
  estimatedMinutes: number;
}
