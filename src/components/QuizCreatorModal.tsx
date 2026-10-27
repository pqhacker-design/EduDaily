import React, { useState } from 'react';
import { Quiz, Question, Subject, Grade, Difficulty, User, ClassInfo } from '../types';
import { SUBJECT_METADATA, CURRICULUM_QUESTIONS } from '../data/curriculumBank';
import { generateAIQuestions, generateAIQuestionsWithMeta } from '../services/geminiService';
import { INITIAL_CLASSES } from '../data/initialData';
import { 
  PlusCircle, 
  Sparkles, 
  BookOpen, 
  Clock, 
  RotateCcw, 
  Users, 
  Trash2, 
  X, 
  Check, 
  Loader2,
  Calendar,
  Layers,
  Brain,
  CheckCircle2,
  Lightbulb,
  Edit3
} from 'lucide-react';
import { AIRefineQuestionModal } from './AIRefineQuestionModal';

interface QuizCreatorModalProps {
  currentTeacher: User;
  classes?: ClassInfo[];
  onClose: () => void;
  onSaveQuiz: (newQuiz: Quiz) => void;
}

export const QuizCreatorModal: React.FC<QuizCreatorModalProps> = ({
  currentTeacher,
  classes = INITIAL_CLASSES,
  onClose,
  onSaveQuiz
}) => {
  const [tab, setTab] = useState<'ai' | 'bank' | 'manual'>('ai');

  // Basic info
  const [title, setTitle] = useState('Kiểm tra 15 phút: Đại số & Hệ thức lượng Lớp 10');
  const [description, setDescription] = useState('Đề kiểm tra nhanh đánh giá mức độ thông hiểu và vận dụng kiến thức chuẩn GDPT 2018.');
  const [subject, setSubject] = useState<Subject>('toan');
  const [grade, setGrade] = useState<Grade>(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);
  const [maxAttempts, setMaxAttempts] = useState(2);
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>(['10A1']);

  // AI Generator state
  const [aiTopic, setAiTopic] = useState('Bất phương trình bậc nhất hai ẩn');
  const [aiCount, setAiCount] = useState(4);
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>('thong_hieu');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiNotice, setAiNotice] = useState<{ message: string; isAI: boolean } | null>(null);

  // Manual questions list or drafted questions
  const [questions, setQuestions] = useState<Question[]>(
    CURRICULUM_QUESTIONS.filter(q => q.subject === 'toan' && q.grade === 10).slice(0, 4)
  );

  const [manualText, setManualText] = useState('');
  const [manualOptions, setManualOptions] = useState(['', '', '', '']);
  const [manualCorrectIndex, setManualCorrectIndex] = useState(0);
  const [manualExplanation, setManualExplanation] = useState('');

  // AI Refine question state
  const [refiningIndex, setRefiningIndex] = useState<number | null>(null);

  // Handle AI generation
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setAiNotice(null);
    try {
      const result = await generateAIQuestionsWithMeta({
        subject,
        grade,
        topic: aiTopic,
        questionCount: aiCount,
        difficulty: aiDifficulty
      });

      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        setTitle(`Kiểm tra ${timeLimitMinutes}p: ${aiTopic} Lớp ${grade}`);
        setAiNotice({ message: result.message, isAI: result.isAIGenerated });
      }
    } catch (err) {
      console.error(err);
      setAiNotice({ 
        message: 'Đã nạp câu hỏi từ Ngân hàng đề thi GDPT 2018.', 
        isAI: false 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle class assignment
  const toggleClass = (classId: string) => {
    setAssignedClassIds(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  // Add manual question
  const handleAddManualQuestion = () => {
    if (!manualText.trim() || manualOptions.some(o => !o.trim())) return;

    const newQ: Question = {
      id: `manual-q-${Date.now()}`,
      text: manualText,
      options: manualOptions,
      correctIndex: manualCorrectIndex,
      explanation: manualExplanation || 'Lời giải chi tiết theo chương trình GDPT 2018.',
      subject,
      grade,
      topic: aiTopic || 'Kiến thức trọng tâm',
      difficulty: aiDifficulty
    };

    setQuestions(prev => [...prev, newQ]);
    setManualText('');
    setManualOptions(['', '', '', '']);
    setManualExplanation('');
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveAndAssign = () => {
    if (!title.trim() || questions.length === 0 || assignedClassIds.length === 0) return;

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title,
      description,
      subject,
      grade,
      topic: aiTopic || 'Kiểm tra định kỳ',
      questions,
      timeLimitMinutes,
      maxAttempts,
      assignedClassIds,
      createdByTeacherId: currentTeacher.id,
      createdByTeacherName: currentTeacher.name,
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      isDailyChallenge: false
    };

    onSaveQuiz(newQuiz);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col my-auto"
        role="dialog"
        aria-label="Tạo và giao bài kiểm tra mới"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-3xl">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Tạo & Giao Bài Kiểm Tra Cho Học Sinh
              </h2>
              <p className="text-xs text-slate-500">
                Quy định thời gian làm bài, số lần làm lại và nội dung bám sát GDPT 2018
              </p>
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* General Config Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tiêu đề bài kiểm tra:
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Kiểm tra 15 phút Toán Lớp 10..."
              />
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Môn học (Theo chương trình GDPT):
              </label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value as Subject)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(SUBJECT_METADATA).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.name}</option>
                ))}
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Khối lớp:
              </label>
              <select
                value={grade}
                onChange={e => setGrade(Number(e.target.value) as Grade)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value={6}>Lớp 6 (THCS)</option>
                <option value={7}>Lớp 7 (THCS)</option>
                <option value={8}>Lớp 8 (THCS)</option>
                <option value={9}>Lớp 9 (THCS)</option>
                <option value={10}>Lớp 10 (THPT)</option>
                <option value={11}>Lớp 11 (THPT)</option>
                <option value={12}>Lớp 12 (THPT)</option>
              </select>
            </div>

            {/* Time limit & Max attempts */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Thời gian làm bài (Phút):
              </label>
              <select
                value={timeLimitMinutes}
                onChange={e => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 phút (Trắc nghiệm nhanh)</option>
                <option value={10}>10 phút (Kiểm tra 10p)</option>
                <option value={15}>15 phút (Chuẩn 15p)</option>
                <option value={20}>20 phút</option>
                <option value={30}>30 phút</option>
                <option value={45}>45 phút (1 tiết)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                Số lần làm lại tối đa:
              </label>
              <select
                value={maxAttempts}
                onChange={e => setMaxAttempts(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 lần duy nhất (Không cho làm lại)</option>
                <option value={2}>2 lần (Cho làm lại 1 lần để cải thiện)</option>
                <option value={3}>3 lần</option>
                <option value={5}>5 lần (Luyện tập thoải mái)</option>
              </select>
            </div>

            {/* Assign to classes */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
              <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Giao cho các lớp học sinh:
              </label>
              <div className="flex flex-wrap gap-2">
                {classes.map(c => {
                  const isAssigned = assignedClassIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleClass(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                        isAssigned
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isAssigned && <Check className="w-3.5 h-3.5" />}
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Question Source Tabs */}
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setTab('ai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 ${
                  tab === 'ai' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Tạo đề AI (Gemini Thinking)</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('bank')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 ${
                  tab === 'bank' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ngân hàng GDPT 2018</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('manual')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 ${
                  tab === 'manual' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tự thêm câu hỏi</span>
              </button>
            </div>

            {/* AI Generator Panel */}
            {tab === 'ai' && (
              <div className="mt-4 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Trí tuệ nhân tạo Gemini sẽ tự động sinh các câu hỏi trắc nghiệm bám sát SGK:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Chủ đề bài học:
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={e => setAiTopic(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                      placeholder="Ví dụ: Bất phương trình, Thì tiếng Anh, Định luật Newton..."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Số lượng câu:
                    </label>
                    <select
                      value={aiCount}
                      onChange={e => setAiCount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-bold"
                    >
                      <option value={3}>3 câu</option>
                      <option value={4}>4 câu (Chuẩn)</option>
                      <option value={5}>5 câu</option>
                      <option value={10}>10 câu</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-black shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang phân tích chương trình GDPT & soạn câu hỏi...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Tự Động Sinh Câu Hỏi Chuẩn GDPT 2018</span>
                    </>
                  )}
                </button>

                {aiNotice && (
                  <div className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 border transition-all ${
                    aiNotice.isAI 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  }`}>
                    {aiNotice.isAI ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                    <span className="font-semibold">{aiNotice.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* Bank Selector */}
            {tab === 'bank' && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs text-slate-600 font-semibold">
                  Chọn nhanh các câu hỏi chuẩn có sẵn trong ngân hàng câu hỏi GDPT 2018:
                </p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {CURRICULUM_QUESTIONS.filter(q => q.subject === subject).map(q => {
                    const isAdded = questions.some(item => item.id === q.id);
                    return (
                      <div
                        key={q.id}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex-1 pr-3 truncate">
                          <span className="font-bold text-slate-800 block truncate">{q.text}</span>
                          <span className="text-[10px] text-slate-400">{q.topic} • Lớp {q.grade}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (isAdded) {
                              setQuestions(prev => prev.filter(item => item.id !== q.id));
                            } else {
                              setQuestions(prev => [...prev, q]);
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            isAdded ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-600 text-white'
                          }`}
                        >
                          {isAdded ? 'Xóa' : '+ Thêm'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manual input */}
            {tab === 'manual' && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nội dung câu hỏi:</label>
                  <textarea
                    rows={2}
                    value={manualText}
                    onChange={e => setManualText(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                    placeholder="Nhập nội dung câu hỏi..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {manualOptions.map((opt, i) => (
                    <div key={i}>
                      <label className="font-bold text-slate-600 block text-[10px]">Phương án {String.fromCharCode(65 + i)}:</label>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const copy = [...manualOptions];
                          copy[i] = e.target.value;
                          setManualOptions(copy);
                        }}
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block text-[11px] mb-1">Đáp án đúng:</label>
                    <select
                      value={manualCorrectIndex}
                      onChange={e => setManualCorrectIndex(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold"
                    >
                      <option value={0}>Phương án A</option>
                      <option value={1}>Phương án B</option>
                      <option value={2}>Phương án C</option>
                      <option value={3}>Phương án D</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block text-[11px] mb-1">Lời giải chi tiết:</label>
                    <input
                      type="text"
                      value={manualExplanation}
                      onChange={e => setManualExplanation(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
                      placeholder="Giải thích vì sao chọn đáp án này..."
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddManualQuestion}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                >
                  + Thêm câu hỏi này vào đề
                </button>
              </div>
            )}
          </div>

          {/* Current Questions in this Quiz */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>Nội Dung Đề Thi: Câu Hỏi & Đáp Án Chi Tiết</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {questions.length} câu
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mỗi câu tương ứng {(10 / Math.max(1, questions.length)).toFixed(1)} điểm • Thầy/cô có thể dùng AI để thay đổi câu hỏi chưa phù hợp
                </p>
              </div>

              {questions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuestions([])}
                  className="text-xs text-red-600 hover:text-red-700 font-bold"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {questions.length === 0 ? (
              <div className="text-center p-8 bg-amber-50/70 border border-dashed border-amber-300 rounded-3xl space-y-2">
                <Brain className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-amber-900">
                  Đề thi chưa có câu hỏi nào.
                </p>
                <p className="text-[11px] text-amber-700">
                  Hãy nhấn tab "Tạo đề AI" để Gemini tự động sinh câu hỏi hoặc chọn từ ngân hàng GDPT.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const diffLabel = 
                    q.difficulty === 'van_dung_cao' ? 'Vận dụng cao' :
                    q.difficulty === 'van_dung' ? 'Vận dụng' :
                    q.difficulty === 'thong_hieu' ? 'Thông hiểu' : 'Nhận biết';
                  
                  const diffBadge = 
                    q.difficulty === 'van_dung_cao' ? 'bg-red-50 text-red-700 border-red-200' :
                    q.difficulty === 'van_dung' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    q.difficulty === 'thong_hieu' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                  return (
                    <div
                      key={q.id || idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition-all space-y-3"
                    >
                      {/* Question Top Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {idx + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${diffBadge}`}>
                            {diffLabel}
                          </span>
                          {q.topic && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600 truncate max-w-xs">
                              {q.topic}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1.5">
                          {/* AI Refine Button */}
                          <button
                            type="button"
                            onClick={() => setRefiningIndex(idx)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-xs flex items-center space-x-1.5 transition-all hover:scale-102"
                            title="Yêu cầu AI Gemini sửa, tăng giảm độ khó hoặc đổi mới câu hỏi này"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>AI Thay Đổi Câu Hỏi</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Xóa câu hỏi khỏi đề"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                        {q.text}
                      </p>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = optIdx === q.correctIndex;
                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl text-xs flex items-start space-x-2 border transition-all ${
                                isCorrect
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold shadow-xs'
                                  : 'bg-slate-50/70 text-slate-700 border-slate-200'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <div className="flex-1 leading-snug">
                                <span>{opt}</span>
                              </div>
                              {isCorrect && (
                                <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-200 text-emerald-800 shrink-0">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Đáp án đúng</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-slate-700 text-[11px] flex items-start space-x-2">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-900">Lời giải chi tiết: </span>
                            <span className="leading-relaxed">{q.explanation}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* AI Refine Modal */}
        {refiningIndex !== null && questions[refiningIndex] && (
          <AIRefineQuestionModal
            isOpen={true}
            question={questions[refiningIndex]}
            questionIndex={refiningIndex}
            onClose={() => setRefiningIndex(null)}
            onApplyRefinedQuestion={(newQ) => {
              setQuestions(prev => {
                const copy = [...prev];
                copy[refiningIndex] = newQ;
                return copy;
              });
              setRefiningIndex(null);
            }}
          />
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleSaveAndAssign}
            disabled={questions.length === 0 || assignedClassIds.length === 0}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-blue-500/25 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Giao Bài Ngay ({assignedClassIds.join(', ')})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
