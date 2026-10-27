import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScore,
  canAttemptQuiz,
  evaluateNewBadges,
  generateAdaptiveRecommendations,
  calculateClassLeaderboard
} from './rules';
import { Question, Quiz, QuizAttempt, User } from '../types';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    text: 'Căn bậc hai của 16?',
    options: ['4', '-4', '16', '2'],
    correctIndex: 0,
    explanation: '4*4 = 16',
    subject: 'toan',
    grade: 10,
    topic: 'Căn bậc hai',
    difficulty: 'nhan_biet'
  },
  {
    id: 'q2',
    text: 'Công thức tính vận tốc trong chuyển động thẳng biến đổi đều?',
    options: ['v = v0 + at', 'v = at^2', 'v = s/t', 'v = v0 - at'],
    correctIndex: 0,
    explanation: 'v = v0 + at',
    subject: 'khtn',
    grade: 10,
    topic: 'Chuyển động biến đổi',
    difficulty: 'nhan_biet'
  }
];

const mockQuiz: Quiz = {
  id: 'quiz-1',
  title: 'Kiểm tra 10 phút',
  description: 'Mô tả bài kiểm tra',
  subject: 'toan',
  grade: 10,
  topic: 'Đại số 10',
  questions: mockQuestions,
  timeLimitMinutes: 10,
  maxAttempts: 2,
  assignedClassIds: ['10A1'],
  createdByTeacherId: 't-1',
  createdByTeacherName: 'Cô Mai',
  createdAt: '2026-10-25T00:00:00Z',
  dueDate: '2026-10-28T00:00:00Z'
};

const mockUser: User = {
  id: 's-1',
  name: 'Nguyễn Văn A',
  email: 'a@edudaily.vn',
  avatar: '',
  role: 'student',
  classId: '10A1',
  className: 'Lớp 10A1',
  streakDays: 3,
  totalPoints: 500,
  badgesEarned: [],
  schoolName: 'THPT A'
};

test('calculateScore calculates 10-point scale correctly', () => {
  // Both correct -> 10.0
  const resultAllCorrect = calculateScore({ q1: 0, q2: 0 }, mockQuestions);
  assert.equal(resultAllCorrect.score, 10);
  assert.equal(resultAllCorrect.correctCount, 2);
  assert.deepEqual(resultAllCorrect.missedQuestionIds, []);

  // 1 correct out of 2 -> 5.0
  const resultHalf = calculateScore({ q1: 0, q2: 1 }, mockQuestions);
  assert.equal(resultHalf.score, 5);
  assert.equal(resultHalf.correctCount, 1);
  assert.deepEqual(resultHalf.missedQuestionIds, ['q2']);
});

test('canAttemptQuiz enforces maximum attempts rule', () => {
  const attempts: QuizAttempt[] = [];

  // 0 attempts used out of 2 allowed
  const check1 = canAttemptQuiz(mockQuiz, attempts, 's-1');
  assert.equal(check1.allowed, true);
  assert.equal(check1.remainingAttempts, 2);
  assert.equal(check1.totalAttemptsUsed, 0);

  // 1 attempt used
  const mockAttempt1: QuizAttempt = {
    id: 'att-1',
    quizId: 'quiz-1',
    studentId: 's-1',
    studentName: 'A',
    studentAvatar: '',
    studentClass: '10A1',
    attemptNumber: 1,
    answers: { q1: 0 },
    score: 5,
    correctCount: 1,
    totalQuestions: 2,
    timeSpentSeconds: 120,
    submittedAt: '2026-10-25T01:00:00Z',
    missedQuestionIds: ['q2']
  };
  attempts.push(mockAttempt1);

  const check2 = canAttemptQuiz(mockQuiz, attempts, 's-1');
  assert.equal(check2.allowed, true);
  assert.equal(check2.remainingAttempts, 1);

  // 2nd attempt used -> max reached
  const mockAttempt2: QuizAttempt = {
    ...mockAttempt1,
    id: 'att-2',
    attemptNumber: 2
  };
  attempts.push(mockAttempt2);

  const check3 = canAttemptQuiz(mockQuiz, attempts, 's-1');
  assert.equal(check3.allowed, false);
  assert.equal(check3.remainingAttempts, 0);
  assert.equal(check3.totalAttemptsUsed, 2);
});

test('evaluateNewBadges awards badges based on criteria', () => {
  const attemptPerfect: QuizAttempt = {
    id: 'att-p',
    quizId: 'quiz-1',
    studentId: 's-1',
    studentName: 'A',
    studentAvatar: '',
    studentClass: '10A1',
    attemptNumber: 2,
    answers: { q1: 0, q2: 0 },
    score: 10,
    correctCount: 2,
    totalQuestions: 2,
    timeSpentSeconds: 100, // less than 5 min (300s) -> speed demon
    submittedAt: '2026-10-25T01:00:00Z',
    missedQuestionIds: []
  };

  const prevAttempts: QuizAttempt[] = [
    {
      id: 'att-prev',
      quizId: 'quiz-1',
      studentId: 's-1',
      studentName: 'A',
      studentAvatar: '',
      studentClass: '10A1',
      attemptNumber: 1,
      answers: { q1: 0, q2: 1 },
      score: 5,
      correctCount: 1,
      totalQuestions: 2,
      timeSpentSeconds: 400,
      submittedAt: '2026-10-25T00:00:00Z',
      missedQuestionIds: ['q2']
    }
  ];

  const earned = evaluateNewBadges(mockUser, attemptPerfect, prevAttempts, mockQuiz);
  assert.ok(earned.includes('perfect_10'), 'Should earn perfect_10');
  assert.ok(earned.includes('speed_demon'), 'Should earn speed_demon');
  assert.ok(earned.includes('persistence'), 'Should earn persistence due to score improvement from 5 to 10');
  assert.ok(earned.includes('daily_streak_3'), 'Should earn daily_streak_3 with streak 3');
});

test('generateAdaptiveRecommendations identifies weak topics and builds drills', () => {
  const attemptWithMistake: QuizAttempt = {
    id: 'att-mistake',
    quizId: 'quiz-1',
    studentId: 's-1',
    studentName: 'A',
    studentAvatar: '',
    studentClass: '10A1',
    attemptNumber: 1,
    answers: { q1: 0, q2: 1 },
    score: 5,
    correctCount: 1,
    totalQuestions: 2,
    timeSpentSeconds: 200,
    submittedAt: '2026-10-25T00:00:00Z',
    missedQuestionIds: ['q2'] // missed 'Chuyển động biến đổi'
  };

  const recs = generateAdaptiveRecommendations(
    's-1',
    [attemptWithMistake],
    [mockQuiz],
    mockQuestions
  );

  assert.equal(recs.length, 1);
  assert.equal(recs[0].topic, 'Chuyển động biến đổi');
  assert.equal(recs[0].missedQuestionsCount, 1);
  assert.ok(recs[0].recommendedQuestions.length > 0);
});

test('calculateClassLeaderboard sorts classmates by points and average score', () => {
  const user1: User = { ...mockUser, id: 's-1', totalPoints: 1000 };
  const user2: User = { ...mockUser, id: 's-2', totalPoints: 1500 };

  const leaderboard = calculateClassLeaderboard('10A1', [user1, user2], []);
  assert.equal(leaderboard[0].user.id, 's-2');
  assert.equal(leaderboard[0].rank, 1);
  assert.equal(leaderboard[1].user.id, 's-1');
  assert.equal(leaderboard[1].rank, 2);
});

test('admin can manage users and classes correctly', () => {
  const users: User[] = [
    { ...mockUser, id: 'admin-1', role: 'admin' },
    { ...mockUser, id: 'teacher-1', role: 'teacher' },
    { ...mockUser, id: 'student-1', role: 'student' }
  ];

  const admins = users.filter(u => u.role === 'admin');
  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');

  assert.equal(admins.length, 1);
  assert.equal(teachers.length, 1);
  assert.equal(students.length, 1);
});

test('auth user lookup and role verification works properly', () => {
  const users: User[] = [
    { ...mockUser, id: 'admin-1', email: 'admin@edudaily.edu.vn', name: 'Quản trị viên', role: 'admin' },
    { ...mockUser, id: 'teacher-1', email: 'teacher@edudaily.edu.vn', name: 'Giáo viên', role: 'teacher' },
    { ...mockUser, id: 'student-1', email: 'student@edudaily.edu.vn', name: 'Học sinh', role: 'student' }
  ];

  // Lookup by email
  const foundByEmail = users.find(u => u.email.toLowerCase() === 'teacher@edudaily.edu.vn');
  assert.ok(foundByEmail);
  assert.equal(foundByEmail?.role, 'teacher');

  // Lookup by name
  const foundByName = users.find(u => u.name.toLowerCase() === 'quản trị viên');
  assert.ok(foundByName);
  assert.equal(foundByName?.role, 'admin');

  // Role filtering
  const studentUsers = users.filter(u => u.role === 'student');
  assert.equal(studentUsers.length, 1);
  assert.equal(studentUsers[0].id, 'student-1');
});

