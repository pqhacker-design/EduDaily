import React, { useState } from 'react';
import { RemedialRecommendation, Question } from '../types';
import confetti from 'canvas-confetti';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  X, 
  Sparkles, 
  Trophy, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface AdaptivePracticeModalProps {
  recommendation: RemedialRecommendation;
  onClose: () => void;
  onComplete: (bonusPoints: number) => void;
}

export const AdaptivePracticeModal: React.FC<AdaptivePracticeModalProps> = ({
  recommendation,
  onClose,
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const questions = recommendation.recommendedQuestions;
  const currentQ: Question = questions[currentIndex] || questions[0];

  const handleSelect = (optionIndex: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return; // already answered
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
      try {
        confetti({ particleCount: 60, spread: 60 });
      } catch (e) {}
    }
  };

  const correctCount = Object.keys(selectedAnswers).filter(
    (idx) => selectedAnswers[Number(idx)] === questions[Number(idx)].correctIndex
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col my-auto"
        role="dialog"
        aria-label="Luyện tập bổ trợ kiến thức"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-t-3xl">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Brain className="w-5 h-5 animate-pulse-slow" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                Bài tập bổ trợ thích ứng
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Khắc phục: {recommendation.topic}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {!isFinished ? (
            <div className="space-y-4">
              {/* Stepper info */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Câu {currentIndex + 1} / {questions.length}</span>
                <span className="text-indigo-600 font-bold">
                  Phản hồi tức thì & Giải thích chi tiết
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question Text */}
              <div className="mt-3">
                <p className="text-base font-bold text-slate-900 leading-relaxed">
                  {currentQ.text}
                </p>
              </div>

              {/* Choices */}
              <div className="space-y-2 mt-4">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentIndex] === idx;
                  const isAnswered = selectedAnswers[currentIndex] !== undefined;
                  const isCorrect = idx === currentQ.correctIndex;

                  let btnStyle = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800';
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'border-red-400 bg-red-50 text-red-950';
                    } else {
                      btnStyle = 'border-slate-200 opacity-60 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-start space-x-3 text-xs sm:text-sm font-medium ${btnStyle}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0 text-slate-700">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 pt-0.5">{opt}</span>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant explanation */}
              {showExplanation && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs animate-fadeIn">
                  <div className="flex items-center space-x-1.5 font-black text-indigo-900 mb-1">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span>Giải thích phương pháp:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-normal">
                    {currentQ.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Finished celebration */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-black text-slate-900">
                Chúc mừng bạn đã hoàn thành bài tập bổ trợ!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Bạn đã làm đúng <strong className="text-emerald-600">{correctCount}/{questions.length} câu</strong>. Lỗ hổng kiến thức về <strong>{recommendation.topic}</strong> đã được củng cố vững chắc.
              </p>

              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>+50 Điểm Thưởng Tự Học Vào Hồ Sơ Cá Nhân</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Đóng
          </button>

          {!isFinished ? (
            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentIndex] === undefined}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black flex items-center space-x-1.5 shadow-sm"
            >
              <span>{currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài bổ trợ'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                onComplete(50);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm"
            >
              Nhận điểm thưởng & Trở về
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
