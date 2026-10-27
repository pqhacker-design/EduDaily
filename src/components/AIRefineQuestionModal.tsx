import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { refineAIQuestion } from '../services/geminiService';
import { 
  Sparkles, 
  X, 
  Check, 
  Loader2, 
  RotateCcw, 
  HelpCircle, 
  Brain, 
  SlidersHorizontal, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Edit3
} from 'lucide-react';

interface AIRefineQuestionModalProps {
  isOpen: boolean;
  question: Question | null;
  questionIndex: number;
  onClose: () => void;
  onApplyRefinedQuestion: (updatedQuestion: Question) => void;
}

export const AIRefineQuestionModal: React.FC<AIRefineQuestionModalProps> = ({
  isOpen,
  question,
  questionIndex,
  onClose,
  onApplyRefinedQuestion
}) => {
  const [promptText, setPromptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [candidateQuestion, setCandidateQuestion] = useState<Question | null>(null);
  const [notice, setNotice] = useState<{ message: string; isAI: boolean } | null>(null);

  // Editable candidate fields
  const [editText, setEditText] = useState('');
  const [editOptions, setEditOptions] = useState<string[]>(['', '', '', '']);
  const [editCorrectIndex, setEditCorrectIndex] = useState(0);
  const [editExplanation, setEditExplanation] = useState('');

  useEffect(() => {
    if (question) {
      setCandidateQuestion(null);
      setNotice(null);
      setPromptText('');
      setEditText(question.text);
      setEditOptions([...question.options]);
      setEditCorrectIndex(question.correctIndex);
      setEditExplanation(question.explanation);
    }
  }, [question]);

  if (!isOpen || !question) return null;

  const quickPresets = [
    { label: '⚡ Tăng độ khó (Vận dụng cao)', prompt: 'Nâng cao độ khó của câu hỏi lên mức Vận dụng cao, yêu cầu tư duy lập luận nhiều bước theo chuẩn GDPT 2018.' },
    { label: '🌍 Lồng ghép thực tế đời sống', prompt: 'Chuyển đổi bối cảnh bài toán sang tình huống thực tiễn đời sống sinh động, giúp học sinh liên hệ thực tế.' },
    { label: '🔢 Đổi số liệu (Chống sao chép)', prompt: 'Giữ nguyên cấu trúc dạng bài nhưng thay đổi hoàn toàn các số liệu và cập nhật lại các phương án tính toán tương ứng.' },
    { label: '📖 Viết lại lời giải chi tiết hơn', prompt: 'Giữ nguyên câu hỏi nhưng hoàn thiện lại đề bài cho chuẩn xác sư phạm và viết lời giải phương pháp từng bước thật chi tiết.' },
    { label: '🎯 Đơn giản hóa (Nhận biết)', prompt: 'Hạ bớt độ phức tạp, chuyển sang dạng nhận biết hoặc thông hiểu nền tảng cho học sinh dễ tiếp cận.' },
    { label: '🔄 Đổi câu hỏi khác cùng chủ đề', prompt: 'Thay thế hoàn toàn bằng một câu hỏi trắc nghiệm mới bám sát cùng chủ đề bài học.' }
  ];

  const handleRunRefine = async (customPrompt?: string) => {
    const instruction = customPrompt || promptText || 'Tinh chỉnh câu hỏi cho hay hơn, chính xác sư phạm theo SGK GDPT 2018.';
    setIsProcessing(true);
    setNotice(null);

    try {
      const result = await refineAIQuestion({
        originalQuestion: question,
        prompt: instruction,
        subject: question.subject,
        grade: question.grade,
        topic: question.topic
      });

      if (result && result.question) {
        setCandidateQuestion(result.question);
        setEditText(result.question.text);
        setEditOptions([...result.question.options]);
        setEditCorrectIndex(result.question.correctIndex);
        setEditExplanation(result.question.explanation);
        setNotice({ message: result.message, isAI: result.isAI });
      }
    } catch (err: any) {
      console.error(err);
      setNotice({ message: 'Không thể kết nối AI, vui lòng thử lại hoặc chỉnh sửa trực tiếp.', isAI: false });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    const finalQ: Question = {
      ...(candidateQuestion || question),
      text: editText,
      options: editOptions,
      correctIndex: editCorrectIndex,
      explanation: editExplanation
    };

    onApplyRefinedQuestion(finalQ);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col my-auto overflow-hidden animate-scaleIn"
        role="dialog"
        aria-label="AI thay đổi và tinh chỉnh câu hỏi"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md shadow-xs border border-white/20">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  AI Thay Đổi & Tinh Chỉnh Câu Hỏi {questionIndex + 1}
                </h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-400 text-slate-900">
                  Gemini Flash AI
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">
                Nhập yêu cầu để AI tự động viết lại, đổi bối cảnh, tăng độ khó hoặc đổi mới câu hỏi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* Current Question Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Câu hỏi hiện tại đang có trong đề:
              </span>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {question.topic}
              </span>
            </div>
            
            <p className="text-xs font-bold text-slate-900 leading-relaxed">
              {question.text}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {question.options.map((opt, i) => (
                <div 
                  key={i}
                  className={`p-2 rounded-xl text-xs flex items-center space-x-2 border ${
                    i === question.correctIndex 
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold' 
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                    i === question.correctIndex ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="truncate">{opt}</span>
                  {i === question.correctIndex && (
                    <span className="text-[10px] font-bold text-emerald-600 ml-auto">(Đúng)</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Section */}
          <div className="space-y-3">
            <div>
              <label className="font-black text-slate-800 uppercase tracking-wider text-[11px] block mb-1.5 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-600" />
                Gợi ý lệnh thay đổi nhanh cho giáo viên:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPromptText(preset.prompt);
                      handleRunRefine(preset.prompt);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-800 font-bold text-[11px] transition-all hover:scale-102 text-left"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Hoặc nhập hướng dẫn điều chỉnh chi tiết cho AI:
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  placeholder="Ví dụ: Đổi câu hỏi này sang dạng bài toán thực tế có hình ảnh vận tốc xe chạy, hoặc tăng độ khó lên mức vận dụng cao..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-xs leading-relaxed"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRunRefine()}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini AI đang phân tích và tạo câu hỏi mới...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bắt Đầu Thay Đổi Câu Hỏi Với Gemini AI</span>
                </>
              )}
            </button>

            {notice && (
              <div className={`p-3 rounded-2xl text-xs flex items-center space-x-2 border transition-all ${
                notice.isAI 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}>
                {notice.isAI ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                )}
                <span className="font-semibold">{notice.message}</span>
              </div>
            )}
          </div>

          {/* Result / Editable Preview Section */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                Nội dung câu hỏi mới (Xem trước & Tùy chỉnh trực tiếp):
              </span>
              <span className="text-[10px] text-slate-400">
                Thầy/cô có thể chỉnh sửa câu chữ bên dưới
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Đề câu hỏi mới:</label>
              <textarea
                rows={2}
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-900"
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {editOptions.map((opt, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700">
                      Phương án {String.fromCharCode(65 + i)}:
                    </span>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="editCorrect"
                        checked={editCorrectIndex === i}
                        onChange={() => setEditCorrectIndex(i)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={`text-[10px] font-bold ${editCorrectIndex === i ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {editCorrectIndex === i ? '✓ Đáp án đúng' : 'Chọn đúng'}
                      </span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={e => {
                      const copy = [...editOptions];
                      copy[i] = e.target.value;
                      setEditOptions(copy);
                    }}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs bg-white font-medium ${
                      editCorrectIndex === i 
                        ? 'border-emerald-400 bg-emerald-50/30' 
                        : 'border-slate-200'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Lời giải thích & phương pháp chi tiết:
              </label>
              <textarea
                rows={2}
                value={editExplanation}
                onChange={e => setEditExplanation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Giữ nguyên câu cũ
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-500/25 flex items-center space-x-2 transition-all hover:scale-102"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Áp Dụng Câu Hỏi Này Vào Đề Thi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
