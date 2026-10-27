import React, { useState } from 'react';
import { User, Quiz, QuizAttempt, RemedialRecommendation, Subject } from '../types';
import { SUBJECT_METADATA } from '../data/curriculumBank';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  BookOpen, 
  ArrowRight,
  Brain,
  History,
  Award,
  Search,
  Filter,
  Flame,
  Printer,
  Copy,
  Check,
  Eye,
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';

interface PerformanceAnalyticsProps {
  currentUser: User;
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  recommendations: RemedialRecommendation[];
  onStartRemedial: (rec: RemedialRecommendation) => void;
  onReviewAttempt: (quiz: Quiz, attempt: QuizAttempt) => void;
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  currentUser,
  quizzes,
  attempts,
  recommendations,
  onStartRemedial,
  onReviewAttempt
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'trends' | 'quiz_reports' | 'progress' | 'remedial'>('trends');
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedGradeTierFilter, setSelectedGradeTierFilter] = useState<string>('all');
  const [copiedReportId, setCopiedReportId] = useState<string | null>(null);

  const userAttempts = attempts.filter(a => a.studentId === currentUser.id);

  // Overall calculations
  const totalTests = userAttempts.length;
  const avgScore = totalTests > 0 
    ? Math.round((userAttempts.reduce((sum, a) => sum + a.score, 0) / totalTests) * 10) / 10 
    : 0;

  const totalTimeSeconds = userAttempts.reduce((sum, a) => sum + a.timeSpentSeconds, 0);
  const totalMinutes = Math.round(totalTimeSeconds / 60);

  // Highest score
  const highestScore = totalTests > 0 ? Math.max(...userAttempts.map(a => a.score)) : 0;

  // Re-attempt improvement rate
  const quizAttemptMap = new Map<string, QuizAttempt[]>();
  userAttempts.forEach(a => {
    const list = quizAttemptMap.get(a.quizId) || [];
    list.push(a);
    quizAttemptMap.set(a.quizId, list);
  });

  let totalImprovement = 0;
  let improvedQuizCount = 0;
  quizAttemptMap.forEach((quizAtts) => {
    if (quizAtts.length > 1) {
      quizAtts.sort((a, b) => a.attemptNumber - b.attemptNumber);
      const firstScore = quizAtts[0].score;
      const lastScore = quizAtts[quizAtts.length - 1].score;
      if (lastScore > firstScore) {
        totalImprovement += (lastScore - firstScore);
        improvedQuizCount++;
      }
    }
  });

  const avgImprovement = improvedQuizCount > 0 ? (totalImprovement / improvedQuizCount).toFixed(1) : '0';

  // Personal score tier distribution
  const scoreDistribution = {
    excellent: userAttempts.filter(a => a.score >= 9.0).length,
    good: userAttempts.filter(a => a.score >= 8.0 && a.score < 9.0).length,
    fair: userAttempts.filter(a => a.score >= 6.5 && a.score < 8.0).length,
    average: userAttempts.filter(a => a.score >= 5.0 && a.score < 6.5).length,
    poor: userAttempts.filter(a => a.score < 5.0).length,
  };

  // Accuracy by subject
  const subjectScores: Record<Subject, { totalScore: number; count: number; totalQuestions: number; correctQuestions: number }> = {
    toan: { totalScore: 0, count: 0, totalQuestions: 0, correctQuestions: 0 },
    van: { totalScore: 0, count: 0, totalQuestions: 0, correctQuestions: 0 },
    anh: { totalScore: 0, count: 0, totalQuestions: 0, correctQuestions: 0 },
    khtn: { totalScore: 0, count: 0, totalQuestions: 0, correctQuestions: 0 },
    ly: { totalScore: 0, count: 0, totalQuestions: 0, correctQuestions: 0 },
    hoa: { totalScore: 0, count: 0, totalQuestions: 0, correctQuestions: 0 },
    sinh: { totalScore: 0, count: 0, totalQuestions: 0, correctQuestions: 0 },
    su_dia: { totalScore: 0, count: 0, totalQuestions: 0, correctQuestions: 0 },
    tin: { totalScore: 0, count: 0, totalQuestions: 0, correctQuestions: 0 },
  };

  for (const att of userAttempts) {
    const quiz = quizzes.find(q => q.id === att.quizId);
    if (!quiz) continue;

    const sub = quiz.subject;
    if (subjectScores[sub]) {
      subjectScores[sub].totalScore += att.score;
      subjectScores[sub].count += 1;
      subjectScores[sub].totalQuestions += att.totalQuestions;
      subjectScores[sub].correctQuestions += att.correctCount;
    }
  }

  const activeSubjects = (Object.keys(subjectScores) as Subject[]).filter(
    s => subjectScores[s].count > 0
  );

  // Filtered detailed quiz reports
  const filteredAttempts = userAttempts.slice().reverse().filter(att => {
    const quiz = quizzes.find(q => q.id === att.quizId);
    if (!quiz) return false;

    // Search term
    const matchesSearch = quiz.title.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                          quiz.topic.toLowerCase().includes(reportSearchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // Subject filter
    if (selectedSubjectFilter !== 'all' && quiz.subject !== selectedSubjectFilter) return false;

    // Score tier filter
    if (selectedGradeTierFilter === 'high' && att.score < 8.0) return false;
    if (selectedGradeTierFilter === 'mid' && (att.score < 6.5 || att.score >= 8.0)) return false;
    if (selectedGradeTierFilter === 'low' && att.score >= 6.5) return false;

    return true;
  });

  // Copy single report summary
  const handleCopyReport = (quiz: Quiz, att: QuizAttempt) => {
    const text = `PHIẾU KẾT QUẢ BÀI KIỂM TRA EDỦDAILY:\n` +
      `- Bài thi: ${quiz.title}\n` +
      `- Học sinh: ${currentUser.name} (${currentUser.className})\n` +
      `- Điểm số: ${att.score}/10 (${att.correctCount}/${att.totalQuestions} câu đúng)\n` +
      `- Thời gian làm bài: ${Math.floor(att.timeSpentSeconds / 60)} phút ${att.timeSpentSeconds % 60} giây\n` +
      `- Lần nộp: Lần ${att.attemptNumber}/${quiz.maxAttempts}\n` +
      `- Ngày hoàn thành: ${new Date(att.submittedAt).toLocaleString('vi-VN')}`;

    navigator.clipboard.writeText(text);
    setCopiedReportId(att.id);
    setTimeout(() => setCopiedReportId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold mb-2">
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span>Trung Tâm Báo Cáo Kết Quả & Phân Tích Hiệu Suất Học Tập</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Báo Cáo Học Tập Cá Nhân & Xu Hướng
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
            Xem chi tiết kết quả từng bài trắc nghiệm, theo dõi biểu đồ tiến bộ điểm số, mức độ làm chủ các môn GDPT 2018 và lộ trình khắc phục lỗ hổng kiến thức.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>In Phiếu Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('trends')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'trends'
              ? 'bg-white text-purple-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Xu Hướng & Phong Độ</span>
        </button>

        <button
          onClick={() => setActiveSubTab('quiz_reports')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'quiz_reports'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Báo Cáo Chi Tiết Bài Thi ({userAttempts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('progress')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'progress'
              ? 'bg-white text-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Tiến Độ Môn Học GDPT</span>
        </button>

        <button
          onClick={() => setActiveSubTab('remedial')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'remedial'
              ? 'bg-white text-amber-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Lộ Trình Bổ Trợ ({recommendations.length})</span>
        </button>
      </div>

      {/* Top 4 Core Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Điểm trung bình</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {avgScore > 0 ? `${avgScore}/10` : '—'}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
            Cao nhất: {highestScore > 0 ? `${highestScore}/10` : '—'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Số bài đã nộp</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalTests} bài
          </div>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            {quizAttemptMap.size} bài kiểm tra khác nhau
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Tiến bộ làm lại</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">
            +{avgImprovement} đ
          </div>
          <span className="text-[11px] text-purple-700 font-semibold mt-1 block">
            {improvedQuizCount} bài cải thiện điểm số
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Thời gian rèn luyện</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {totalMinutes} phút
          </div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
            ~{totalTests > 0 ? Math.round(totalTimeSeconds / totalTests) : 0}s mỗi bài thi
          </span>
        </div>
      </div>

      {/* SUB-TAB 1: XU HƯỚNG & PHONG ĐỘ */}
      {activeSubTab === 'trends' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Chronological Score Trend Graph */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span>Biểu Đồ Xu Hướng Phong Độ Điểm Số</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi sự tăng trưởng điểm số qua các lần làm bài theo trình tự thời gian.
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-bold">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Điểm Giỏi (≥ 8.0)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Điểm Khá (6.5 - 7.9)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Cần rèn (&lt; 6.5)</span>
              </div>
            </div>

            {userAttempts.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">
                Bạn chưa có bài thi nào. Hãy hoàn thành bài kiểm tra đầu tiên để xem biểu đồ xu hướng!
              </p>
            ) : (
              <div className="space-y-3">
                <div className="h-44 flex items-end gap-2 pt-6 pb-2 px-3 bg-slate-50/70 rounded-2xl border border-slate-200 overflow-x-auto">
                  {userAttempts.map((att, i) => {
                    const quiz = quizzes.find(q => q.id === att.quizId);
                    const heightPercent = Math.max((att.score / 10) * 100, 12);
                    const isHigh = att.score >= 8.0;
                    const isMed = att.score >= 6.5 && att.score < 8.0;
                    const barColor = isHigh ? 'bg-emerald-500' : isMed ? 'bg-blue-500' : 'bg-amber-500';

                    return (
                      <div 
                        key={att.id || i} 
                        onClick={() => quiz && onReviewAttempt(quiz, att)}
                        className="flex-1 min-w-[38px] max-w-[56px] flex flex-col items-center h-full justify-end group relative cursor-pointer"
                        title={`${quiz?.title || 'Bài thi'}: ${att.score} điểm (Lần ${att.attemptNumber}) - Click xem lại`}
                      >
                        <span className="text-[11px] font-black text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                          {att.score.toFixed(1)}
                        </span>
                        <div 
                          className={`w-full rounded-t-xl transition-all ${barColor} group-hover:brightness-110 shadow-xs group-hover:scale-105`}
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                        <span className="text-[10px] text-slate-500 mt-1.5 font-bold truncate w-full text-center">
                          L{att.attemptNumber}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-medium">
                  <span>← Bài thi cũ nhất</span>
                  <span className="text-slate-600 font-bold">Nhấp vào cột để xem lại bài thi chi tiết</span>
                  <span>Bài thi mới nhất →</span>
                </div>
              </div>
            )}
          </div>

          {/* Personal Score Distribution & Habits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Distribution */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Phổ Điểm Cá Nhân (Xếp Loại Bài Thi)</span>
              </h3>
              
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-emerald-700">Xuất sắc (9.0 - 10.0)</span>
                    <span className="text-slate-800">{scoreDistribution.excellent} bài ({totalTests > 0 ? Math.round((scoreDistribution.excellent / totalTests) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div style={{ width: `${totalTests > 0 ? (scoreDistribution.excellent / totalTests) * 100 : 0}%` }} className="h-full bg-emerald-500"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-blue-700">Giỏi (8.0 - 8.9)</span>
                    <span className="text-slate-800">{scoreDistribution.good} bài ({totalTests > 0 ? Math.round((scoreDistribution.good / totalTests) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div style={{ width: `${totalTests > 0 ? (scoreDistribution.good / totalTests) * 100 : 0}%` }} className="h-full bg-blue-500"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-indigo-700">Khá (6.5 - 7.9)</span>
                    <span className="text-slate-800">{scoreDistribution.fair} bài ({totalTests > 0 ? Math.round((scoreDistribution.fair / totalTests) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div style={{ width: `${totalTests > 0 ? (scoreDistribution.fair / totalTests) * 100 : 0}%` }} className="h-full bg-indigo-500"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-amber-700">Trung bình (5.0 - 6.4)</span>
                    <span className="text-slate-800">{scoreDistribution.average} bài ({totalTests > 0 ? Math.round((scoreDistribution.average / totalTests) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div style={{ width: `${totalTests > 0 ? (scoreDistribution.average / totalTests) * 100 : 0}%` }} className="h-full bg-amber-500"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-rose-700">Cần bồi dưỡng (&lt; 5.0)</span>
                    <span className="text-slate-800">{scoreDistribution.poor} bài ({totalTests > 0 ? Math.round((scoreDistribution.poor / totalTests) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div style={{ width: `${totalTests > 0 ? (scoreDistribution.poor / totalTests) * 100 : 0}%` }} className="h-full bg-rose-500"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth & Habit Card */}
            <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 rounded-3xl border border-indigo-100 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  <span>Kỷ Luật & Thói Quen Học Tập Hàng Ngày</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Duy trì chuỗi học tập liên tục là phương pháp hiệu quả nhất để ghi nhớ kiến thức dài hạn theo chương trình GDPT 2018.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-indigo-100">
                    <span className="font-bold text-slate-700">Chuỗi ngày học liên tục (Streak):</span>
                    <span className="font-black text-orange-600 text-sm">🔥 {currentUser.streakDays} ngày</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-indigo-100">
                    <span className="font-bold text-slate-700">Tổng điểm thi đua tích lũy:</span>
                    <span className="font-black text-blue-600 text-sm">{currentUser.totalPoints.toLocaleString()} đ</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-indigo-100">
                    <span className="font-bold text-slate-700">Số huy hiệu đạt được:</span>
                    <span className="font-black text-purple-600 text-sm">{currentUser.badgesEarned.length} huy hiệu</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Trường: <strong className="text-slate-800">{currentUser.schoolName}</strong></span>
                <span>Lớp: <strong className="text-blue-700">{currentUser.className}</strong></span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 2: BÁO CÁO CHI TIẾT TỪNG BÀI THI */}
      {activeSubTab === 'quiz_reports' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm bài kiểm tra..."
                value={reportSearchTerm}
                onChange={e => setReportSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedSubjectFilter}
                onChange={e => setSelectedSubjectFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="all">Tất cả môn học</option>
                <option value="toan">Toán học</option>
                <option value="van">Ngữ văn</option>
                <option value="anh">Tiếng Anh</option>
                <option value="khtn">Khoa học tự nhiên</option>
              </select>

              <select
                value={selectedGradeTierFilter}
                onChange={e => setSelectedGradeTierFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="all">Tất cả mức điểm</option>
                <option value="high">Điểm Giỏi (≥ 8.0)</option>
                <option value="mid">Điểm Khá (6.5 - 7.9)</option>
                <option value="low">Cần ôn tập (&lt; 6.5)</option>
              </select>
            </div>
          </div>

          {/* Results List */}
          {filteredAttempts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Không tìm thấy kết quả bài thi phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAttempts.map((att) => {
                const quiz = quizzes.find(q => q.id === att.quizId);
                if (!quiz) return null;
                const meta = SUBJECT_METADATA[quiz.subject] || SUBJECT_METADATA.toan;
                const accuracy = Math.round((att.correctCount / att.totalQuestions) * 100);

                return (
                  <div
                    key={att.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.bgLight}`}>
                          {meta.name}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          Khối {quiz.grade} • Lần nộp {att.attemptNumber}/{quiz.maxAttempts}
                        </span>
                        <span className="text-[11px] text-slate-400">• {new Date(att.submittedAt).toLocaleString('vi-VN')}</span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 leading-snug">
                        {quiz.title}
                      </h4>

                      <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đúng <strong>{att.correctCount}/{att.totalQuestions}</strong> câu ({accuracy}%)</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{Math.floor(att.timeSpentSeconds / 60)}p {att.timeSpentSeconds % 60}s</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className={`text-xl font-black ${att.score >= 8.0 ? 'text-emerald-600' : att.score >= 6.5 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {att.score.toFixed(1)}/10
                        </span>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          {att.score >= 8.5 ? 'Xuất sắc' : att.score >= 7.0 ? 'Khá giỏi' : 'Cần rèn luyện'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyReport(quiz, att)}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                          title="Sao chép phiếu kết quả bài thi"
                        >
                          {copiedReportId === att.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => onReviewAttempt(quiz, att)}
                          className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center space-x-1 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem lại bài</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 3: TIẾN ĐỘ MÔN HỌC GDPT 2018 */}
      {activeSubTab === 'progress' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 animate-fadeIn">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Khung Năng Lực & Độ Thành Thạo Môn Học (GDPT 2018)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đánh giá tỷ lệ trả lời đúng theo chuẩn kiến thức kỹ năng từng môn học.
            </p>
          </div>

          {activeSubjects.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Chưa có dữ liệu bài làm. Hãy làm bài trắc nghiệm để hệ thống ghi nhận tiến độ môn học!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSubjects.map(subKey => {
                const meta = SUBJECT_METADATA[subKey];
                const stats = subjectScores[subKey];
                const avg = stats.count > 0 ? (stats.totalScore / stats.count) : 0;
                const percentage = Math.round((avg / 10) * 100);

                let statusBadge = { label: 'Thành thạo tốt', color: 'bg-emerald-100 text-emerald-800' };
                if (percentage < 65) {
                  statusBadge = { label: 'Cần củng cố', color: 'bg-rose-100 text-rose-800' };
                } else if (percentage < 80) {
                  statusBadge = { label: 'Khá', color: 'bg-blue-100 text-blue-800' };
                }

                return (
                  <div key={subKey} className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {meta.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Đã làm: <strong>{stats.count} bài thi</strong></span>
                      <span>Đúng: <strong>{stats.correctQuestions}/{stats.totalQuestions} câu</strong></span>
                      <span className="font-black text-slate-900">{avg.toFixed(1)}/10</span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${percentage >= 80 ? 'bg-emerald-500' : percentage >= 65 ? 'bg-blue-500' : 'bg-rose-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: LỘ TRÌNH BỔ TRỢ CÁ NHÂN HÓA */}
      {activeSubTab === 'remedial' && (
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 p-6 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Lộ Trình Bổ Trợ Tự Động (Adaptive Learning)
              </h3>
              <p className="text-xs text-slate-500">
                Phân tích từ những câu hỏi bạn từng trả lời sai để đưa ra bài luyện tập khắc phục tức thì.
              </p>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-8 bg-white/70 rounded-2xl border border-indigo-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">
                Tuyệt vời! Hiện tại bạn không có lỗ hổng kiến thức nghiêm trọng nào.
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Hãy tiếp tục duy trì các bài kiểm tra hàng ngày để nâng cao chuỗi điểm 10!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => {
                const meta = SUBJECT_METADATA[rec.subject] || SUBJECT_METADATA.toan;
                return (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl border border-indigo-100 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-bold border mt-0.5 ${meta.bgLight}`}>
                        {meta.name}
                      </span>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          Chủ đề: {rec.topic}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {rec.reason}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onStartRemedial(rec)}
                      className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-xs flex items-center space-x-1.5 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Luyện tập bổ trợ ({rec.recommendedQuestions.length} câu)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
