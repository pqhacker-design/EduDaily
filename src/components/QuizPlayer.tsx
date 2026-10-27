import React, { useState, useEffect } from 'react';
import { Quiz, Question } from '../types';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  X,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface QuizPlayerProps {
  quiz: Quiz;
  attemptNumber: number;
  onSubmit: (answers: Record<string, number>, timeSpentSeconds: number) => void;
  onCancel: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  attemptNumber,
  onSubmit,
  onCancel
}) => {
  const totalSeconds = quiz.timeLimitMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining <= 0) {
      // Time is up -> Auto submit!
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const currentQuestion: Question = quiz.questions[currentQuestionIndex];
  const timeSpentSeconds = totalSeconds - secondsRemaining;

  const handleSelectOption = (index: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: index
    }));
  };

  const toggleFlagQuestion = (qId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleSubmit = () => {
    setShowConfirmModal(false);
    onSubmit(answers, timeSpentSeconds);
  };

  // Format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = secondsRemaining < 60;

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.questions.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-between overflow-y-auto">
      {/* Top Bar / HUD */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 sticky top-0 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              aria-label="Thoát khỏi bài thi"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">
                {quiz.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="text-blue-600 font-bold flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  Lần làm: {attemptNumber}/{quiz.maxAttempts}
                </span>
                <span>•</span>
                <span>Đã làm: {answeredCount}/{totalQuestions} câu</span>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm transition-all ${
            isUrgent 
              ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
              : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-slate-500'}`} />
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Main Body with Question and Quick Navigation */}
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col md:flex-row gap-6">
        
        {/* Left Column: Current Question Card */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                Câu {currentQuestionIndex + 1} / {totalQuestions}
              </span>

              <button
                onClick={() => toggleFlagQuestion(currentQuestion.id)}
                className={`flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  flaggedQuestions[currentQuestion.id]
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${flaggedQuestions[currentQuestion.id] ? 'fill-amber-500' : ''}`} />
                <span>{flaggedQuestions[currentQuestion.id] ? 'Đã gắn cờ xem lại' : 'Gắn cờ'}</span>
              </button>
            </div>

            {/* Question Content */}
            <div className="mt-5">
              <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {currentQuestion.text}
              </p>
              <div className="text-xs text-slate-400 mt-1">
                Chủ đề: {currentQuestion.topic}
              </div>
            </div>

            {/* Multiple Choice Options (A, B, C, D) */}
            <div className="mt-6 space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start space-x-3.5 group ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 text-blue-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}>
                      {letter}
                    </div>
                    <div className="text-sm font-medium pt-0.5 leading-snug flex-1">
                      {option}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Câu trước</span>
            </button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center space-x-1"
              >
                <span>Câu tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Nộp bài thi</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Sheet / Palette */}
        <aside className="w-full md:w-64 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm h-fit">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
            Danh sách câu hỏi
          </h3>

          <div className="grid grid-cols-5 gap-2">
            {quiz.questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = currentQuestionIndex === idx;
              const isFlagged = flaggedQuestions[q.id];

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`relative h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'ring-2 ring-blue-600 ring-offset-2 bg-blue-600 text-white'
                      : isAnswered
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-label={`Đi tới câu ${idx + 1}`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-200"></span>
              <span>Đã trả lời</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-md bg-slate-100"></span>
              <span>Chưa trả lời</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-md bg-amber-500"></span>
              <span>Đã gắn cờ xem lại</span>
            </div>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md flex items-center justify-center space-x-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp bài ngay ({answeredCount}/{totalQuestions})</span>
          </button>
        </aside>
      </main>

      {/* Confirmation Submit Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-center text-slate-900">
              Xác nhận nộp bài thi
            </h3>
            <p className="text-xs text-center text-slate-600 mt-2 leading-relaxed">
              Bạn đã hoàn thành <strong className="text-blue-600">{answeredCount}/{totalQuestions} câu hỏi</strong>.
              {answeredCount < totalQuestions && (
                <span className="text-amber-600 font-bold block mt-1">
                  ⚠️ Còn {totalQuestions - answeredCount} câu chưa làm!
                </span>
              )}
            </p>

            <div className="mt-6 flex space-x-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md"
              >
                Đồng ý nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Warning Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-center text-slate-900">
              Bạn có chắc muốn thoát?
            </h3>
            <p className="text-xs text-center text-slate-600 mt-2 leading-relaxed">
              Thời gian vẫn đang đếm ngược. Nếu thoát ngay bây giờ, các câu trả lời chưa nộp sẽ không được lưu lại.
            </p>

            <div className="mt-6 flex space-x-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 shadow-sm"
              >
                Ở lại làm bài
              </button>
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Thoát bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
