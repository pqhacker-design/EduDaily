import React, { useState } from 'react';
import { User, Quiz, QuizAttempt, RemedialRecommendation } from '../types';
import { SUBJECT_METADATA } from '../data/curriculumBank';
import { canAttemptQuiz } from '../utils/rules';
import { 
  Flame, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  Eye, 
  Brain, 
  ArrowRight,
  BookOpen,
  Calendar,
  Zap,
  Target
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  recommendations: RemedialRecommendation[];
  onStartQuiz: (quiz: Quiz) => void;
  onReviewQuiz: (quiz: Quiz, attempt: QuizAttempt) => void;
  onStartRemedial: (rec: RemedialRecommendation) => void;
  onViewLeaderboard: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  quizzes,
  attempts,
  recommendations,
  onStartQuiz,
  onReviewQuiz,
  onStartRemedial,
  onViewLeaderboard
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Quizzes assigned to student's class
  const classQuizzes = quizzes.filter(
    q => q.assignedClassIds.includes(currentUser.classId) || q.isDailyChallenge
  );

  const dailyChallenge = quizzes.find(q => q.isDailyChallenge);
  const dailyAttempt = dailyChallenge 
    ? attempts.find(a => a.quizId === dailyChallenge.id && a.studentId === currentUser.id)
    : undefined;

  // Filtered regular quizzes
  const filteredQuizzes = classQuizzes.filter(quiz => {
    const userAttempts = attempts.filter(a => a.quizId === quiz.id && a.studentId === currentUser.id);
    const hasCompleted = userAttempts.length > 0;

    if (filter === 'pending') return !hasCompleted || userAttempts.length < quiz.maxAttempts;
    if (filter === 'completed') return hasCompleted;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner with Streak Motivation */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-bold mb-3">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Chương trình Giáo dục phổ thông 2018</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Chào {currentUser.name}! 👋
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Hôm nay bạn đã sẵn sàng bứt phá kiến thức cùng các bài trắc nghiệm nhanh hàng ngày chưa?
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20">
              <Flame className="w-5 h-5 text-orange-400 fill-orange-400 animate-pulse" />
              <div className="text-xs">
                <span className="font-bold text-white block text-sm leading-none">
                  Chuỗi {currentUser.streakDays} ngày
                </span>
                <span className="text-blue-200 text-[10px]">Làm 1 bài hôm nay để giữ chuỗi!</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20">
              <Target className="w-5 h-5 text-emerald-300" />
              <div className="text-xs">
                <span className="font-bold text-white block text-sm leading-none">
                  {currentUser.className}
                </span>
                <span className="text-blue-200 text-[10px]">{currentUser.schoolName}</span>
              </div>
            </div>

            <button
              onClick={onViewLeaderboard}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-extrabold shadow-md transition-all hover:scale-105"
            >
              Xem thi đua lớp 🏆
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Adaptive Reinforcement Banner (If student has weaknesses identified) */}
      {recommendations.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border border-amber-200/80 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20 shrink-0">
                <Brain className="w-6 h-6 animate-pulse-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                    Gợi ý thích ứng AI
                  </span>
                  <span className="text-xs font-semibold text-amber-800">
                    Củng cố điểm yếu từ kết quả vừa làm
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Bài tập bổ trợ: {recommendations[0].topic}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                  {recommendations[0].reason}
                </p>
              </div>
            </div>

            <button
              onClick={() => onStartRemedial(recommendations[0])}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Luyện bù lỗ hổng ngay (5 phút)</span>
            </button>
          </div>
        </div>
      )}

      {/* Daily Challenge Spotlight Card */}
      {dailyChallenge && (
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Thử Thách Nhanh Hôm Nay
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {dailyChallenge.timeLimitMinutes} phút duy nhất
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{dailyChallenge.title}</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {dailyChallenge.description}
              </p>
              <div className="mt-3 flex items-center space-x-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  {dailyChallenge.questions.length} câu trắc nghiệm
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  Chỉ 1 lượt làm duy nhất
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  Đặt lại mỗi 24h
                </span>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              {dailyAttempt ? (
                <div className="flex items-center space-x-2">
                  <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    ✓ Đã hoàn thành ({dailyAttempt.score}/10 điểm)
                  </div>
                  <button
                    onClick={() => onReviewQuiz(dailyChallenge, dailyAttempt)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem lại</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onStartQuiz(dailyChallenge)}
                  className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-102"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Bắt đầu thử thách ngay</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Quizzes List Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Nhiệm Vụ & Bài Kiểm Tra Của Lớp
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đề thi có quy định thời gian làm bài và số lần làm lại theo quy định của giáo viên.
            </p>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({classQuizzes.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cần làm
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã nộp
            </button>
          </div>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuizzes.map(quiz => {
            const subjectMeta = SUBJECT_METADATA[quiz.subject] || SUBJECT_METADATA.toan;
            const userAttempts = attempts.filter(a => a.quizId === quiz.id && a.studentId === currentUser.id);
            const { allowed, remainingAttempts, totalAttemptsUsed } = canAttemptQuiz(quiz, attempts, currentUser.id);
            const latestAttempt = userAttempts[userAttempts.length - 1];
            const highestScore = userAttempts.length > 0 ? Math.max(...userAttempts.map(a => a.score)) : null;

            return (
              <div
                key={quiz.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${subjectMeta.bgLight}`}>
                      {subjectMeta.name} • Lớp {quiz.grade}
                    </span>

                    <span className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{quiz.timeLimitMinutes} phút</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {quiz.description}
                  </p>

                  {/* Metadata info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Lượt làm quy định:</span>
                      <span className="font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                        <RotateCcw className="w-3 h-3 text-blue-500" />
                        {quiz.maxAttempts} lần tối đa
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Tình trạng lượt làm:</span>
                      <span className={`font-bold text-xs flex items-center gap-1 mt-0.5 ${
                        remainingAttempts > 0 ? 'text-blue-600' : 'text-slate-500'
                      }`}>
                        {remainingAttempts > 0 ? (
                          `Còn ${remainingAttempts}/${quiz.maxAttempts} lần`
                        ) : (
                          'Đã hết lượt làm lại'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Previous attempt score banner */}
                  {userAttempts.length > 0 && (
                    <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        Điểm cao nhất: <strong className="text-emerald-600 font-bold">{highestScore}/10</strong>
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        (Đã làm {totalAttemptsUsed} lần)
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Bởi: {quiz.createdByTeacherName}
                  </span>

                  <div className="flex items-center space-x-2">
                    {latestAttempt && (
                      <button
                        onClick={() => onReviewQuiz(quiz, latestAttempt)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem lời giải</span>
                      </button>
                    )}

                    {allowed ? (
                      <button
                        onClick={() => onStartQuiz(quiz)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
                      >
                        {userAttempts.length > 0 ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Làm lại bài</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Làm bài</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed">
                        Đã khóa đề
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
