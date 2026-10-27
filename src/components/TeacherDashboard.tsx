import React, { useState } from 'react';
import { User, Quiz, QuizAttempt, ClassInfo } from '../types';
import { SUBJECT_METADATA } from '../data/curriculumBank';
import { INITIAL_CLASSES } from '../data/initialData';
import { 
  Users, 
  BookOpen, 
  PlusCircle, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  Calendar,
  Search,
  Eye,
  Brain,
  TrendingUp,
  FileText,
  Lightbulb,
  X,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { StudentProfileDetailModal } from './StudentProfileDetailModal';

interface TeacherDashboardProps {
  currentTeacher: User;
  allUsers: User[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  classes?: ClassInfo[];
  onCreateQuiz: () => void;
  onReviewStudentAttempt: (quiz: Quiz, attempt: QuizAttempt) => void;
  onViewReports?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentTeacher,
  allUsers,
  quizzes,
  attempts,
  classes = INITIAL_CLASSES,
  onCreateQuiz,
  onReviewStudentAttempt,
  onViewReports
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '10A1');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingQuizDetails, setViewingQuizDetails] = useState<Quiz | null>(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<User | null>(null);

  // Class students
  const classStudents = allUsers.filter(u => u.role === 'student' && u.classId === selectedClassId);
  
  // Quizzes assigned to this class
  const classQuizzes = quizzes.filter(q => q.assignedClassIds.includes(selectedClassId));

  // Filtered attempts for this class
  const classAttempts = attempts.filter(a => a.studentClass === selectedClassId);

  // Overall class stats
  const totalSubmissions = classAttempts.length;
  const avgClassScore = totalSubmissions > 0
    ? Math.round((classAttempts.reduce((sum, a) => sum + a.score, 0) / totalSubmissions) * 10) / 10
    : 0;

  // Selected quiz for detailed gradebook
  const activeQuiz = classQuizzes.find(q => q.id === selectedQuizId);

  return (
    <div className="space-y-6 pb-12">
      {/* Teacher Welcome Header & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Cổng Quản Trị Giáo Viên & Giám Sát Học Tập</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Chào mừng {currentTeacher.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Theo dõi tiến độ làm bài chi tiết, số lượt làm lại, tỷ lệ hoàn thành và giao đề trắc nghiệm chuẩn GDPT 2018 cho học sinh.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onViewReports && (
            <button
              type="button"
              onClick={onViewReports}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center space-x-1.5 transition-all shadow-sm"
              title="Mở trung tâm báo cáo và phân tích thống kê lớp học"
            >
              <BarChart3 className="w-4 h-4 text-amber-300" />
              <span>Báo Cáo & Thống Kê</span>
            </button>
          )}

          <button
            onClick={onCreateQuiz}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all hover:scale-102"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo & Giao Đề Mới</span>
          </button>
        </div>
      </div>

      {/* Class Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Chọn lớp giảng dạy:
          </span>
          <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
            {classes.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedClassId === c.id
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Sĩ số lớp: <strong className="text-slate-900">{classStudents.length} học sinh</strong>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Đề thi đã giao</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {classQuizzes.length} bài
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
            Theo khung GDPT 2018
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Tổng lượt học sinh nộp</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalSubmissions} lượt
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            Bao gồm cả bài làm lại
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Điểm trung bình toàn lớp</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">
            {avgClassScore > 0 ? `${avgClassScore}/10` : '—'}
          </div>
          <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
            Thang điểm 10 tiêu chuẩn
          </span>
        </div>
      </div>

      {/* Quizzes Assigned List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Các bài kiểm tra đã giao cho lớp {selectedClassId}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click vào một bài để lọc bảng điểm chi tiết của học sinh bên dưới.
            </p>
          </div>

          <button
            onClick={() => setSelectedQuizId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              selectedQuizId === 'all'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Xem tất cả bài
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classQuizzes.map(quiz => {
            const meta = SUBJECT_METADATA[quiz.subject] || SUBJECT_METADATA.toan;
            const quizAttempts = classAttempts.filter(a => a.quizId === quiz.id);
            const studentsSubmitted = new Set(quizAttempts.map(a => a.studentId)).size;
            const isSelected = selectedQuizId === quiz.id;

            return (
              <div
                key={quiz.id}
                onClick={() => setSelectedQuizId(isSelected ? 'all' : quiz.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.bgLight}`}>
                    {meta.name}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {quiz.timeLimitMinutes} phút
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {quiz.title}
                </h4>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Đã nộp:</span>
                    <span className="font-black text-slate-800">
                      {studentsSubmitted}/{classStudents.length} học sinh
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Số lần làm tối đa:</span>
                    <span className="font-bold text-blue-600">
                      {quiz.maxAttempts} lần
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingQuizDetails(quiz);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Xem câu hỏi & đáp án ({quiz.questions?.length || 0} câu)</span>
                  </button>
                  <span className="text-[10px] text-slate-400">Click lọc bảng điểm</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Progress Matrix & Gradebook */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Sổ Theo Dõi Tiến Độ Chi Tiết Từng Học Sinh (Lớp {selectedClassId})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeQuiz ? `Đang lọc theo bài: "${activeQuiz.title}"` : 'Tất cả các bài kiểm tra được giao'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4 text-center">Tình trạng nộp</th>
                <th className="py-3 px-4 text-center">Số lượt đã dùng</th>
                <th className="py-3 px-4 text-center">Điểm cao nhất</th>
                <th className="py-3 px-4 text-center">Thời gian làm</th>
                <th className="py-3 px-4 text-center">Câu làm sai</th>
                <th className="py-3 px-4 text-right">Chi tiết bài làm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents
                .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(student => {
                  // Find student's attempts
                  const studentAttempts = classAttempts.filter(
                    a => a.studentId === student.id && (selectedQuizId === 'all' || a.quizId === selectedQuizId)
                  );
                  const hasDone = studentAttempts.length > 0;
                  const latestAttempt = studentAttempts[studentAttempts.length - 1];
                  const highestScore = hasDone ? Math.max(...studentAttempts.map(a => a.score)) : null;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={student.avatar}
                            alt=""
                            className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{student.name}</span>
                            <span className="text-[10px] text-slate-400">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {hasDone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đã nộp bài
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Chưa làm bài
                          </span>
                        )}
                      </td>

                      {/* Attempts used */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-700">
                          {studentAttempts.length} lượt
                        </span>
                      </td>

                      {/* Highest score */}
                      <td className="py-3.5 px-4 text-center">
                        {highestScore !== null ? (
                          <span className={`text-sm font-black ${
                            highestScore >= 8 ? 'text-emerald-600' : 'text-blue-600'
                          }`}>
                            {highestScore.toFixed(1)}/10
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Time taken */}
                      <td className="py-3.5 px-4 text-center text-slate-600">
                        {latestAttempt ? (
                          `${Math.floor(latestAttempt.timeSpentSeconds / 60)}p ${latestAttempt.timeSpentSeconds % 60}s`
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Missed questions */}
                      <td className="py-3.5 px-4 text-center">
                        {latestAttempt ? (
                          <span className={`font-bold ${
                            latestAttempt.missedQuestionIds.length > 0 ? 'text-red-600' : 'text-emerald-600'
                          }`}>
                            {latestAttempt.missedQuestionIds.length} câu
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForProfile(student)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs inline-flex items-center space-x-1 transition-colors"
                            title="Xem hồ sơ học tập và phân tích phong độ cá nhân"
                          >
                            <UserIcon className="w-3.5 h-3.5" />
                            <span>Hồ sơ</span>
                          </button>

                          {latestAttempt ? (
                            <button
                              onClick={() => {
                                const relatedQuiz = quizzes.find(q => q.id === latestAttempt.quizId);
                                if (relatedQuiz) {
                                  onReviewStudentAttempt(relatedQuiz, latestAttempt);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold inline-flex items-center space-x-1"
                              title="Xem chi tiết bài thi học sinh"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Bài làm</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-300">Chưa làm</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quiz Questions & Answers Detail Modal */}
      {viewingQuizDetails && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col my-auto overflow-hidden animate-scaleIn">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20">
                  {viewingQuizDetails.topic || 'Đề kiểm tra'} • Lớp {viewingQuizDetails.grade}
                </span>
                <h3 className="text-base sm:text-lg font-black mt-1">
                  {viewingQuizDetails.title}
                </h3>
                <p className="text-xs text-blue-100">
                  Thời gian: {viewingQuizDetails.timeLimitMinutes}p • Tối đa {viewingQuizDetails.maxAttempts} lần làm lại • Giao cho lớp: {viewingQuizDetails.assignedClassIds.join(', ')}
                </p>
              </div>
              <button
                onClick={() => setViewingQuizDetails(null)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-700">
                  Nội dung chi tiết {viewingQuizDetails.questions.length} câu hỏi và đáp án:
                </span>
                <span className="text-[10px] text-slate-400">
                  Chuẩn hóa theo SGK GDPT 2018
                </span>
              </div>

              {viewingQuizDetails.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-xs">
                      Câu {idx + 1}: {q.text}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {q.difficulty === 'van_dung_cao' ? 'Vận dụng cao' : q.difficulty === 'van_dung' ? 'Vận dụng' : 'Thông hiểu'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctIndex;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 border ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="truncate">{opt}</span>
                          {isCorrect && (
                            <span className="text-[10px] text-emerald-700 font-black ml-auto flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đáp án đúng</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-700 text-[11px] flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-900">Lời giải chi tiết: </strong>
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setViewingQuizDetails(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Learning Profile Deep-Dive Modal */}
      {selectedStudentForProfile && (
        <StudentProfileDetailModal
          isOpen={true}
          onClose={() => setSelectedStudentForProfile(null)}
          student={selectedStudentForProfile}
          classInfo={classes.find(c => c.id === selectedClassId)}
          allQuizzes={quizzes}
          allAttempts={attempts}
          onReviewAttempt={onReviewStudentAttempt}
        />
      )}
    </div>
  );
};
