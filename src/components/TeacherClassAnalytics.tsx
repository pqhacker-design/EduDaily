import React, { useState } from 'react';
import { User, Quiz, QuizAttempt, ClassInfo, Question } from '../types';
import { SUBJECT_METADATA } from '../data/curriculumBank';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Award, 
  ArrowUpRight, 
  ChevronRight,
  HelpCircle,
  Sparkles,
  PieChart,
  UserCheck
} from 'lucide-react';
import { StudentProfileDetailModal } from './StudentProfileDetailModal';

interface TeacherClassAnalyticsProps {
  currentTeacher: User;
  allUsers: User[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  classes: ClassInfo[];
  onReviewAttempt?: (quiz: Quiz, attempt: QuizAttempt) => void;
}

export const TeacherClassAnalytics: React.FC<TeacherClassAnalyticsProps> = ({
  currentTeacher,
  allUsers,
  quizzes,
  attempts,
  classes,
  onReviewAttempt
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '10A1');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('all');
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'excellent' | 'good' | 'warning' | 'pending'>('all');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<User | null>(null);

  // Selected Class details
  const activeClass = classes.find(c => c.id === selectedClassId);
  const classStudents = allUsers.filter(u => u.role === 'student' && u.classId === selectedClassId);

  // Quizzes assigned to this class
  const classQuizzes = quizzes.filter(q => q.assignedClassIds.includes(selectedClassId));
  const activeQuiz = classQuizzes.find(q => q.id === selectedQuizId);

  // Filtered attempts for this class
  const classAttempts = attempts.filter(a => 
    a.studentClass === selectedClassId && (selectedQuizId === 'all' || a.quizId === selectedQuizId)
  );

  // Students who have completed at least 1 attempt
  const studentsWithSubmissions = new Set(classAttempts.map(a => a.studentId));
  const submissionRate = classStudents.length > 0 
    ? Math.round((studentsWithSubmissions.size / classStudents.length) * 100)
    : 0;

  // Average class score
  const avgClassScore = classAttempts.length > 0
    ? Math.round((classAttempts.reduce((sum, a) => sum + a.score, 0) / classAttempts.length) * 10) / 10
    : 0;

  const highestClassScore = classAttempts.length > 0
    ? Math.max(...classAttempts.map(a => a.score))
    : 0;

  const lowestClassScore = classAttempts.length > 0
    ? Math.min(...classAttempts.map(a => a.score))
    : 0;

  // Grade Tier Distribution
  const gradeDistribution = {
    excellent: 0, // 9.0 - 10
    good: 0,      // 8.0 - 8.9
    fair: 0,      // 6.5 - 7.9
    average: 0,   // 5.0 - 6.4
    poor: 0       // < 5.0
  };

  // Group latest score per student for accurate distribution
  classStudents.forEach(student => {
    const sAttempts = classAttempts.filter(a => a.studentId === student.id);
    if (sAttempts.length > 0) {
      // Use best score or latest
      const bestScore = Math.max(...sAttempts.map(a => a.score));
      if (bestScore >= 9.0) gradeDistribution.excellent++;
      else if (bestScore >= 8.0) gradeDistribution.good++;
      else if (bestScore >= 6.5) gradeDistribution.fair++;
      else if (bestScore >= 5.0) gradeDistribution.average++;
      else gradeDistribution.poor++;
    }
  });

  // Calculate question error rate analysis for the selected quiz or across recent quizzes
  interface QuestionStat {
    question: Question;
    quizTitle: string;
    totalAnswered: number;
    wrongCount: number;
    errorRate: number;
    mostCommonWrongOption?: string;
  }

  const questionStats: QuestionStat[] = [];
  const relevantQuizzes = activeQuiz ? [activeQuiz] : classQuizzes;

  relevantQuizzes.forEach(quiz => {
    quiz.questions.forEach(q => {
      let totalAnswered = 0;
      let wrongCount = 0;
      const optionCounts: Record<number, number> = {};

      classAttempts
        .filter(a => a.quizId === quiz.id)
        .forEach(att => {
          if (att.answers && att.answers[q.id] !== undefined) {
            totalAnswered++;
            const selectedOption = att.answers[q.id];
            if (selectedOption !== q.correctIndex) {
              wrongCount++;
              optionCounts[selectedOption] = (optionCounts[selectedOption] || 0) + 1;
            }
          }
        });

      if (totalAnswered > 0) {
        // find most common wrong option
        let commonWrongIdx = -1;
        let maxCount = 0;
        Object.entries(optionCounts).forEach(([idxStr, count]) => {
          if (count > maxCount) {
            maxCount = count;
            commonWrongIdx = parseInt(idxStr, 10);
          }
        });

        questionStats.push({
          question: q,
          quizTitle: quiz.title,
          totalAnswered,
          wrongCount,
          errorRate: Math.round((wrongCount / totalAnswered) * 100),
          mostCommonWrongOption: commonWrongIdx >= 0 ? q.options[commonWrongIdx] : undefined
        });
      }
    });
  });

  // Sort by highest error rate first
  questionStats.sort((a, b) => b.errorRate - a.errorRate);

  // Filter students for the roster table
  const filteredStudents = classStudents.filter(student => {
    const sAttempts = classAttempts.filter(a => a.studentId === student.id);
    const hasSubmitted = sAttempts.length > 0;
    const bestScore = hasSubmitted ? Math.max(...sAttempts.map(a => a.score)) : 0;

    // Search filter
    const matchesSearch = student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(studentSearchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter
    if (studentStatusFilter === 'pending') return !hasSubmitted;
    if (studentStatusFilter === 'excellent') return hasSubmitted && bestScore >= 8.5;
    if (studentStatusFilter === 'good') return hasSubmitted && bestScore >= 6.5 && bestScore < 8.5;
    if (studentStatusFilter === 'warning') return hasSubmitted && bestScore < 6.5;

    return true;
  });

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = ['STT', 'Họ và tên', 'Email', 'Lớp', 'Tình trạng', 'Số bài hoàn thành', 'Điểm cao nhất', 'Điểm trung bình'];
    const rows = classStudents.map((s, index) => {
      const sAttempts = classAttempts.filter(a => a.studentId === s.id);
      const hasDone = sAttempts.length > 0;
      const best = hasDone ? Math.max(...sAttempts.map(a => a.score)).toFixed(1) : 'Chưa nộp';
      const avg = hasDone ? (sAttempts.reduce((sum, a) => sum + a.score, 0) / sAttempts.length).toFixed(1) : 'Chưa nộp';
      const statusText = !hasDone ? 'Chưa làm bài' : Number(best) >= 8.5 ? 'Xuất sắc' : Number(best) >= 6.5 ? 'Khá' : 'Cần bồi dưỡng';

      return [
        index + 1,
        `"${s.name}"`,
        s.email,
        activeClass?.name || s.className,
        statusText,
        sAttempts.length,
        best,
        avg
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_Diem_Thong_Ke_${activeClass?.name || 'Lop'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Trung Tâm Báo Cáo & Phân Tích Thống Kê Học Tập</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Thống Kê Chi Tiết Lớp Học & Học Sinh
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Theo dõi phổ điểm, tỷ lệ hoàn thành, phát hiện nhanh các câu hỏi học sinh hay sai để bổ trợ kịp thời theo khung chương trình GDPT 2018.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center space-x-2 transition-all shadow-sm"
            title="Xuất bảng điểm ra file CSV tương thích Excel"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-md"
            title="In báo cáo tổng kết"
          >
            <Printer className="w-4 h-4" />
            <span>In Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-500">Lớp:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Khối {c.grade})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-500">Bài thi:</span>
            <select
              value={selectedQuizId}
              onChange={e => setSelectedQuizId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 max-w-xs truncate"
            >
              <option value="all">Toàn bộ bài kiểm tra ({classQuizzes.length} bài)</option>
              {classQuizzes.map(q => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Sĩ số: <strong className="text-slate-900">{classStudents.length} học sinh</strong> • Lượt nộp: <strong className="text-blue-600">{classAttempts.length} lượt</strong>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Tỷ lệ hoàn thành</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {submissionRate}%
          </div>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            {studentsWithSubmissions.size}/{classStudents.length} học sinh đã nộp
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Điểm TB toàn lớp</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 mt-2">
            {avgClassScore > 0 ? `${avgClassScore}/10` : '—'}
          </div>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            Thang điểm 10 chuẩn GDPT
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Điểm cao nhất</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            {highestClassScore > 0 ? `${highestClassScore}/10` : '—'}
          </div>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            Thấp nhất: {lowestClassScore > 0 ? `${lowestClassScore}/10` : '—'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Cần bồi dưỡng</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
            {gradeDistribution.poor + (classStudents.length - studentsWithSubmissions.size)} em
          </div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
            Dưới 5.0 hoặc chưa làm bài
          </span>
        </div>
      </div>

      {/* Grade Tier Distribution Chart & Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <span>Phổ Điểm Toàn Lớp (Phân Bố Kết Quả)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thống kê tỷ lệ học sinh theo các mức xếp loại chất lượng chuẩn giáo dục phổ thông.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-center">
            <span className="text-xs font-bold text-emerald-800 block">Xuất sắc (9 - 10)</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {gradeDistribution.excellent}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
              {classStudents.length > 0 ? Math.round((gradeDistribution.excellent / classStudents.length) * 100) : 0}% lớp
            </span>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-center">
            <span className="text-xs font-bold text-blue-800 block">Giỏi (8 - 8.9)</span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {gradeDistribution.good}
            </div>
            <span className="text-[11px] text-blue-700 font-semibold block mt-0.5">
              {classStudents.length > 0 ? Math.round((gradeDistribution.good / classStudents.length) * 100) : 0}% lớp
            </span>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 text-center">
            <span className="text-xs font-bold text-indigo-800 block">Khá (6.5 - 7.9)</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">
              {gradeDistribution.fair}
            </div>
            <span className="text-[11px] text-indigo-700 font-semibold block mt-0.5">
              {classStudents.length > 0 ? Math.round((gradeDistribution.fair / classStudents.length) * 100) : 0}% lớp
            </span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-center">
            <span className="text-xs font-bold text-amber-800 block">Trung bình (5 - 6.4)</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {gradeDistribution.average}
            </div>
            <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
              {classStudents.length > 0 ? Math.round((gradeDistribution.average / classStudents.length) * 100) : 0}% lớp
            </span>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
            <span className="text-xs font-bold text-rose-800 block">Dưới 5.0 (Cần ôn)</span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {gradeDistribution.poor}
            </div>
            <span className="text-[11px] text-rose-700 font-semibold block mt-0.5">
              {classStudents.length > 0 ? Math.round((gradeDistribution.poor / classStudents.length) * 100) : 0}% lớp
            </span>
          </div>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex mt-4">
          <div style={{ width: `${classStudents.length > 0 ? (gradeDistribution.excellent / classStudents.length) * 100 : 0}%` }} className="bg-emerald-500 h-full"></div>
          <div style={{ width: `${classStudents.length > 0 ? (gradeDistribution.good / classStudents.length) * 100 : 0}%` }} className="bg-blue-500 h-full"></div>
          <div style={{ width: `${classStudents.length > 0 ? (gradeDistribution.fair / classStudents.length) * 100 : 0}%` }} className="bg-indigo-500 h-full"></div>
          <div style={{ width: `${classStudents.length > 0 ? (gradeDistribution.average / classStudents.length) * 100 : 0}%` }} className="bg-amber-500 h-full"></div>
          <div style={{ width: `${classStudents.length > 0 ? (gradeDistribution.poor / classStudents.length) * 100 : 0}%` }} className="bg-rose-500 h-full"></div>
        </div>
      </div>

      {/* Missed Questions & Learning Gaps Diagnostics */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Chẩn Đoán Câu Hỏi Khó & Lỗ Hổng Kiến Thức Của Cả Lớp</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các câu hỏi có tỷ lệ học sinh làm sai cao nhất. Thầy/Cô nên chú ý giảng giải lại trên lớp.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
            {questionStats.filter(q => q.errorRate >= 40).length} câu cần củng cố
          </span>
        </div>

        {questionStats.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center border border-slate-100 rounded-2xl">
            Chưa có đủ lượt làm bài để phân tích câu hỏi khó.
          </p>
        ) : (
          <div className="space-y-3">
            {questionStats.slice(0, 5).map((stat, i) => (
              <div 
                key={stat.question.id || i}
                className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-200 text-slate-700">
                        {stat.question.topic || 'Chủ đề'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Thuộc bài: {stat.quizTitle}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm leading-snug">
                      Câu {i + 1}: {stat.question.text}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                      stat.errorRate >= 60 ? 'bg-rose-100 text-rose-700' : stat.errorRate >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {stat.errorRate}% sai
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {stat.wrongCount}/{stat.totalAnswered} học sinh sai
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-700 font-bold">Đáp án đúng:</span>
                    <span className="font-semibold text-slate-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {stat.question.options[stat.question.correctIndex]}
                    </span>
                  </div>
                  {stat.mostCommonWrongOption && (
                    <div className="text-slate-500">
                      Hay chọn nhầm: <strong className="text-rose-600">{stat.mostCommonWrongOption}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Progress Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Sổ Theo Dõi Tiến Độ & Đánh Giá Từng Học Sinh ({filteredStudents.length} em)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click vào học sinh để xem hồ sơ năng lực chi tiết, biểu đồ điểm số và lịch sử bài làm.
            </p>
          </div>

          {/* Search & Filter pills */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên học sinh..."
                value={studentSearchTerm}
                onChange={e => setStudentSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={studentStatusFilter}
              onChange={e => setStudentStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="all">Tất cả học sinh</option>
              <option value="excellent">Xuất sắc (≥8.5)</option>
              <option value="good">Khá (6.5 - 8.4)</option>
              <option value="warning">Cần chú ý (&lt;6.5)</option>
              <option value="pending">Chưa làm bài</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4 text-center">Tình trạng</th>
                <th className="py-3 px-4 text-center">Bài đã làm</th>
                <th className="py-3 px-4 text-center">Điểm cao nhất</th>
                <th className="py-3 px-4 text-center">Điểm trung bình</th>
                <th className="py-3 px-4 text-center">Chuỗi học</th>
                <th className="py-3 px-4 text-right">Chi tiết hồ sơ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(student => {
                const sAttempts = classAttempts.filter(a => a.studentId === student.id);
                const hasDone = sAttempts.length > 0;
                const bestScore = hasDone ? Math.max(...sAttempts.map(a => a.score)) : null;
                const avg = hasDone 
                  ? (sAttempts.reduce((sum, a) => sum + a.score, 0) / sAttempts.length).toFixed(1)
                  : null;

                const statusBadge = !hasDone
                  ? { label: 'Chưa nộp', color: 'bg-slate-100 text-slate-600' }
                  : Number(bestScore) >= 8.5
                  ? { label: 'Xuất sắc', color: 'bg-emerald-100 text-emerald-800' }
                  : Number(bestScore) >= 6.5
                  ? { label: 'Khá', color: 'bg-blue-100 text-blue-800' }
                  : { label: 'Cần chú ý', color: 'bg-amber-100 text-amber-800' };

                return (
                  <tr 
                    key={student.id} 
                    onClick={() => setSelectedStudentForModal(student)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.avatar}
                          alt=""
                          className="w-8 h-8 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                            {student.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{student.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {sAttempts.length} lượt
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {bestScore !== null ? (
                        <span className={`font-black text-sm ${bestScore >= 8 ? 'text-emerald-600' : 'text-blue-600'}`}>
                          {bestScore.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {avg !== null ? `${avg}/10` : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-orange-600">
                      🔥 {student.streakDays} ngày
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentForModal(student);
                        }}
                        className="px-3 py-1 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 text-xs font-bold transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Xem hồ sơ</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Learning Profile Deep-Dive Modal */}
      {selectedStudentForModal && (
        <StudentProfileDetailModal
          isOpen={true}
          onClose={() => setSelectedStudentForModal(null)}
          student={selectedStudentForModal}
          classInfo={activeClass}
          allQuizzes={quizzes}
          allAttempts={attempts}
          onReviewAttempt={onReviewAttempt}
        />
      )}

    </div>
  );
};
