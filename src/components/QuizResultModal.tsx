import React, { useEffect } from 'react';
import { Quiz, QuizAttempt, Badge, RemedialRecommendation } from '../types';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Zap, 
  X, 
  BookOpen, 
  Brain,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

interface QuizResultModalProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  newBadgesEarned: Badge[];
  canRetake: boolean;
  remainingAttempts: number;
  onRetake: () => void;
  onClose: () => void;
  onStartRemedial?: (rec: RemedialRecommendation) => void;
  remedialRec?: RemedialRecommendation;
}

export const QuizResultModal: React.FC<QuizResultModalProps> = ({
  quiz,
  attempt,
  newBadgesEarned,
  canRetake,
  remainingAttempts,
  onRetake,
  onClose,
  onStartRemedial,
  remedialRec
}) => {
  useEffect(() => {
    // Fire celebration confetti if score >= 8
    if (attempt.score >= 8) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [attempt.score]);

  // Format time spent
  const minutes = Math.floor(attempt.timeSpentSeconds / 60);
  const seconds = attempt.timeSpentSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  // Score grade
  const isExcellent = attempt.score >= 9;
  const isGood = attempt.score >= 7 && attempt.score < 9;
  const isAverage = attempt.score >= 5 && attempt.score < 7;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col my-auto"
        role="dialog"
        aria-label="Báo cáo kết quả bài kiểm tra"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-3xl">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Báo Cáo Kết Quả Chi Tiết
              </h2>
              <p className="text-xs text-slate-500">{quiz.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Đóng báo cáo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Score Hero Summary */}
          <div className={`rounded-3xl p-6 text-center text-white relative overflow-hidden shadow-lg ${
            isExcellent
              ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700'
              : isGood
              ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700'
              : 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700'
          }`}>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                {isExcellent ? 'Xuất sắc! Hoàn thành xuất sắc' : isGood ? 'Tốt! Đạt yêu cầu' : 'Cần ôn luyện thêm'}
              </span>

              <div className="text-5xl sm:text-6xl font-black tracking-tight my-2">
                {attempt.score.toFixed(1)}
                <span className="text-2xl sm:text-3xl font-medium text-white/80">/10</span>
              </div>

              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/20 text-xs sm:text-sm font-semibold">
                <div>
                  <span className="text-white/70 block text-[11px]">Đúng</span>
                  <span className="font-bold">{attempt.correctCount} / {attempt.totalQuestions} câu</span>
                </div>
                <div>
                  <span className="text-white/70 block text-[11px]">Thời gian làm</span>
                  <span className="font-bold">{timeFormatted}</span>
                </div>
                <div>
                  <span className="text-white/70 block text-[11px]">Lần làm</span>
                  <span className="font-bold">{attempt.attemptNumber} / {quiz.maxAttempts}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Newly Unlocked Badges */}
          {newBadgesEarned.length > 0 && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-center space-x-2 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Bạn vừa mở khóa huy hiệu mới!</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {newBadgesEarned.map(b => (
                  <div key={b.id} className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center space-x-3 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                      🏆
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{b.title}</h4>
                      <p className="text-[11px] text-slate-500">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adaptive Practice Recommendation Prompt */}
          {remedialRec && onStartRemedial && attempt.score < 10 && (
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700">
                    Bài tập bổ trợ tự động cho bạn
                  </h4>
                  <p className="text-sm font-bold text-slate-900">
                    Củng cố kiến thức: {remedialRec.topic}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hệ thống đã chuẩn bị {remedialRec.recommendedQuestions.length} câu hỏi ôn tập tương tự để bạn tự khắc phục câu sai.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onStartRemedial(remedialRec);
                }}
                className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <span>Luyện bù ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Retake & Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-700 block">
                Quy định số lần làm lại:
              </span>
              <span className="text-xs text-slate-500">
                {canRetake ? (
                  `Bạn còn ${remainingAttempts} lần làm lại để cải thiện điểm số.`
                ) : (
                  'Bạn đã sử dụng hết số lần làm lại cho bài kiểm tra này.'
                )}
              </span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {canRetake && (
                <button
                  onClick={() => {
                    onClose();
                    onRetake();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Làm lại bài ({remainingAttempts} lần còn lại)</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
              >
                Quay về trang chủ
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Xem lại từng câu hỏi & Lời giải chi tiết
            </h3>

            <div className="space-y-4">
              {quiz.questions.map((q, idx) => {
                const selected = attempt.answers[q.id];
                const isCorrect = selected === q.correctIndex;
                const wasAnswered = selected !== undefined;

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-4.5 transition-all ${
                      isCorrect
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : 'bg-red-50/20 border-red-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700">
                        Câu {idx + 1}: {q.topic}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-md ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Đúng (+{(10 / quiz.questions.length).toFixed(1)} đ)
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            {wasAnswered ? 'Sai' : 'Chưa chọn'}
                          </>
                        )}
                      </span>
                    </div>

                    {/* Question text */}
                    <p className="text-sm font-bold text-slate-900 mt-2.5 leading-relaxed">
                      {q.text}
                    </p>

                    {/* Options list */}
                    <div className="mt-3 space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isStudentChoice = selected === optIdx;
                        const isActualCorrect = q.correctIndex === optIdx;
                        const letter = String.fromCharCode(65 + optIdx);

                        let badgeColor = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (isActualCorrect) {
                          badgeColor = 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-bold';
                        } else if (isStudentChoice && !isCorrect) {
                          badgeColor = 'bg-red-100/70 border-red-300 text-red-900 line-through';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${badgeColor}`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-800">
                                {letter}
                              </span>
                              <span>{opt}</span>
                            </div>

                            <div>
                              {isActualCorrect && (
                                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                                  Đáp án đúng
                                </span>
                              )}
                              {isStudentChoice && !isCorrect && (
                                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-200 text-red-900">
                                  Lựa chọn của bạn
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="mt-3.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
                      <span className="font-black text-blue-900 block mb-1">
                        💡 Lời giải chi tiết & Phương pháp giải:
                      </span>
                      <p className="text-slate-700 leading-relaxed font-normal">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Đóng báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};
