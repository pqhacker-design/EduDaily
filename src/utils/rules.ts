import { Question, Quiz, QuizAttempt, User, RemedialRecommendation, Subject } from '../types';

/**
 * Calculates score on a 10.0 scale and identifies correct vs missed questions.
 */
export function calculateScore(
  answers: Record<string, number>,
  questions: Question[]
): {
  score: number;
  correctCount: number;
  missedQuestionIds: string[];
  total: number;
} {
  if (!questions || questions.length === 0) {
    return { score: 0, correctCount: 0, missedQuestionIds: [], total: 0 };
  }

  let correctCount = 0;
  const missedQuestionIds: string[] = [];

  for (const q of questions) {
    const selected = answers[q.id];
    if (selected !== undefined && selected === q.correctIndex) {
      correctCount++;
    } else {
      missedQuestionIds.push(q.id);
    }
  }

  // Vietnamese standard 10-point scale rounded to 1 decimal place
  const rawScore = (correctCount / questions.length) * 10;
  const score = Math.round(rawScore * 10) / 10;

  return {
    score,
    correctCount,
    missedQuestionIds,
    total: questions.length
  };
}

/**
 * Validates whether a student can take or retake a quiz based on maxAttempts.
 */
export function canAttemptQuiz(
  quiz: Quiz,
  allAttempts: QuizAttempt[],
  studentId: string
): {
  allowed: boolean;
  remainingAttempts: number;
  totalAttemptsUsed: number;
} {
  const userAttempts = allAttempts.filter(
    a => a.quizId === quiz.id && a.studentId === studentId
  );
  const totalAttemptsUsed = userAttempts.length;
  const remainingAttempts = Math.max(0, quiz.maxAttempts - totalAttemptsUsed);

  return {
    allowed: remainingAttempts > 0,
    remainingAttempts,
    totalAttemptsUsed
  };
}

/**
 * Evaluates whether any new badges should be unlocked after a quiz attempt.
 */
export function evaluateNewBadges(
  student: User,
  latestAttempt: QuizAttempt,
  previousAttemptsForQuiz: QuizAttempt[],
  quiz: Quiz
): string[] {
  const newBadges: string[] = [];
  const currentBadges = new Set(student.badgesEarned || []);

  // 1. Perfect 10 badge
  if (latestAttempt.score === 10 && !currentBadges.has('perfect_10')) {
    newBadges.push('perfect_10');
  }

  // 2. Speed Demon: completed in less than half the allowed time with score >= 8.5
  const timeLimitSeconds = quiz.timeLimitMinutes * 60;
  if (
    latestAttempt.timeSpentSeconds <= timeLimitSeconds / 2 &&
    latestAttempt.score >= 8.5 &&
    !currentBadges.has('speed_demon')
  ) {
    newBadges.push('speed_demon');
  }

  // 3. Persistence: retried and improved score compared to previous attempt
  if (previousAttemptsForQuiz.length > 0) {
    const highestPrevScore = Math.max(...previousAttemptsForQuiz.map(a => a.score));
    if (latestAttempt.score > highestPrevScore && !currentBadges.has('persistence')) {
      newBadges.push('persistence');
    }
  }

  // 4. Streak badges
  if (student.streakDays >= 3 && !currentBadges.has('daily_streak_3')) {
    newBadges.push('daily_streak_3');
  }
  if (student.streakDays >= 7 && !currentBadges.has('daily_streak_7')) {
    newBadges.push('daily_streak_7');
  }

  return newBadges;
}

/**
 * Generates adaptive remedial recommendations based on student's mistakes in recent tests.
 */
export function generateAdaptiveRecommendations(
  studentId: string,
  attempts: QuizAttempt[],
  quizzes: Quiz[],
  allCurriculumQuestions: Question[]
): RemedialRecommendation[] {
  const studentAttempts = attempts.filter(a => a.studentId === studentId);
  if (studentAttempts.length === 0) return [];

  // Map of topic -> { subject: Subject; missedCount: number; totalEncountered: number }
  const topicStats: Record<string, { subject: Subject; missedCount: number; totalEncountered: number }> = {};
  const missedQuestionSet = new Set<string>();

  for (const attempt of studentAttempts) {
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    if (!quiz) continue;

    for (const q of quiz.questions) {
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { subject: q.subject, missedCount: 0, totalEncountered: 0 };
      }
      topicStats[q.topic].totalEncountered++;

      if (attempt.missedQuestionIds.includes(q.id)) {
        topicStats[q.topic].missedCount++;
        missedQuestionSet.add(q.id);
      }
    }
  }

  const recommendations: RemedialRecommendation[] = [];

  for (const [topic, stats] of Object.entries(topicStats)) {
    if (stats.missedCount > 0) {
      const errorRate = Math.round((stats.missedCount / stats.totalEncountered) * 100);

      // Find matching curriculum practice questions for this topic or subject
      const matching = allCurriculumQuestions.filter(
        q => q.topic.toLowerCase() === topic.toLowerCase() || q.subject === stats.subject
      );

      // Pick up to 3 questions, prioritizing ones the student hasn't mastered yet
      const selectedQuestions = matching.slice(0, 3);

      recommendations.push({
        id: `remedial-${topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        subject: stats.subject,
        topic,
        reason: `Bạn đã làm sai ${stats.missedCount}/${stats.totalEncountered} câu (${errorRate}% lỗi) trong chủ đề này. Cần củng cố kiến thức nền tảng!`,
        missedQuestionsCount: stats.missedCount,
        recommendedQuestions: selectedQuestions.length > 0 ? selectedQuestions : allCurriculumQuestions.slice(0, 3),
        estimatedMinutes: 5
      });
    }
  }

  // Sort by highest missed count
  return recommendations.sort((a, b) => b.missedQuestionsCount - a.missedQuestionsCount);
}

/**
 * Computes class leaderboard ranking.
 */
export function calculateClassLeaderboard(
  classId: string,
  users: User[],
  attempts: QuizAttempt[]
): {
  user: User;
  averageScore: number;
  testsCompleted: number;
  rank: number;
}[] {
  const classmates = users.filter(u => u.role === 'student' && u.classId === classId);

  const stats = classmates.map(user => {
    const userAttempts = attempts.filter(a => a.studentId === user.id);
    const testsCompleted = userAttempts.length;
    const totalScore = userAttempts.reduce((sum, a) => sum + a.score, 0);
    const averageScore = testsCompleted > 0 ? Math.round((totalScore / testsCompleted) * 10) / 10 : 0;

    return {
      user,
      averageScore,
      testsCompleted,
      rank: 1
    };
  });

  // Sort by total points first, then average score, then streak
  stats.sort((a, b) => {
    if (b.user.totalPoints !== a.user.totalPoints) {
      return b.user.totalPoints - a.user.totalPoints;
    }
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    return b.user.streakDays - a.user.streakDays;
  });

  // Assign ranks
  return stats.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}
