import React from 'react';
import { User, Quiz, QuizAttempt, ClassInfo } from '../types';
import { SUBJECT_METADATA } from '../data/curriculumBank';
import { 
  X, 
  User as UserIcon, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Calendar,
  Flame,
  FileText,
  BarChart3,
  ExternalLink
} from 'lucide-react';

interface StudentProfileDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User;
  classInfo?: ClassInfo;
  allQuizzes: Quiz[];
  allAttempts: QuizAttempt[];
  onReviewAttempt?: (quiz: Quiz, attempt: QuizAttempt) => void;
}

export const StudentProfileDetailModal: React.FC<StudentProfileDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  classInfo,
  allQuizzes,
  allAttempts,
  onReviewAttempt
}) => {
  if (!isOpen) return null;

  // Filter student attempts
  const studentAttempts = allAttempts.filter(a => a.studentId === student.id);
  const totalCompleted = studentAttempts.length;

  const avgScore = totalCompleted > 0
    ? Math.round((studentAttempts.reduce((sum, a) => sum + a.score, 0) / totalCompleted) * 10) / 10
    : 0;

  const highestScore = totalCompleted > 0
    ? Math.max(...studentAttempts.map(a => a.score))
    : 0;

  const totalTimeSeconds = studentAttempts.reduce((sum, a) => sum + a.timeSpentSeconds, 0);
  const totalMinutes = Math.round(totalTimeSeconds / 60);

  // Group by unique quizzes attempted
  const attemptedQuizIds = new Set(studentAttempts.map(a => a.quizId));
  
  // Calculate improvement delta for quizzes taken multiple times
  let totalImprovement = 0;
  let reattemptCount = 0;
  attemptedQuizIds.forEach(quizId => {
    const attemptsForQuiz = studentAttempts.filter(a => a.quizId === quizId).sort((a, b) => a.attemptNumber - b.attemptNumber);
    if (attemptsForQuiz.length > 1) {
      const firstScore = attemptsForQuiz[0].score;
      const lastScore = attemptsForQuiz[attemptsForQuiz.length - 1].score;
      if (lastScore > firstScore) {
        totalImprovement += (lastScore - firstScore);
        reattemptCount++;
      }
    }
  });

  const avgImprovement = reattemptCount > 0 ? (totalImprovement / reattemptCount).toFixed(1) : '0';

  // Academic status tag
  const getStatusBadge = () => {
    if (totalCompleted === 0) return { label: 'Chưa làm bài', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    if (avgScore >= 8.5) return { label: 'Xuất sắc', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (avgScore >= 7.0) return { label: 'Học lực Khá', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (avgScore >= 5.0) return { label: 'Trung bình', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'Cần hỗ trợ & bồi dưỡng', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  const status = getStatusBadge();

  return (
    <div 
      className="fixed inset-0 z-70 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col my-auto overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-start justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <img 
              src={student.avatar} 
              alt={student.name} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">{student.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5 font-mono">
                {student.email} • {classInfo ? classInfo.name : student.className}
              </p>
              <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-300">
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  Chuỗi {student.streakDays} ngày
                </span>
                <span>•</span>
                <span>{student.totalPoints.toLocaleString()} điểm thi đua</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400 block">Điểm trung bình</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {avgScore > 0 ? `${avgScore}/10` : '—'}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                Cao nhất: {highestScore > 0 ? `${highestScore}/10` : '—'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400 block">Số bài đã hoàn thành</span>
              <div className="text-2xl font-black text-blue-600 mt-1">
                {attemptedQuizIds.size} bài
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                Tổng {totalCompleted} lượt nộp
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400 block">Tiến bộ khi làm lại</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                +{avgImprovement} đ
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                {reattemptCount} bài cải thiện điểm
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-400 block">Thời gian rèn luyện</span>
              <div className="text-2xl font-black text-purple-600 mt-1">
                {totalMinutes} phút
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                Trung bình ~{totalCompleted > 0 ? Math.round(totalMinutes / totalCompleted) : 0} p/bài
              </span>
            </div>
          </div>

          {/* Chronological Score Trend Timeline */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Diễn biến phong độ học tập qua các bài thi gần nhất</span>
            </h4>

            {studentAttempts.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Học sinh chưa làm bài kiểm tra nào.</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-end gap-1.5 h-28 pt-4 pb-2 px-2 bg-white rounded-xl border border-slate-200">
                  {studentAttempts.map((att, i) => {
                    const heightPercent = Math.max((att.score / 10) * 100, 10);
                    const isHigh = att.score >= 8;
                    const isMed = att.score >= 6.5 && att.score < 8;
                    const barColor = isHigh ? 'bg-emerald-500' : isMed ? 'bg-blue-500' : 'bg-amber-500';

                    return (
                      <div key={att.id || i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                          {att.score}
                        </span>
                        <div 
                          className={`w-full max-w-[28px] rounded-t-md transition-all ${barColor} group-hover:brightness-110`}
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                        <span className="text-[9px] text-slate-400 mt-1 font-mono truncate w-full text-center">
                          L{att.attemptNumber}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>Bài cũ hơn</span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Giỏi (≥ 8)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Khá (6.5-7.9)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Cần rèn (&lt; 6.5)</span>
                  </div>
                  <span>Bài mới nhất</span>
                </div>
              </div>
            )}
          </div>

          {/* Submissions History Table */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Chi tiết lịch sử các bài đã nộp ({studentAttempts.length})</span>
            </h4>

            {studentAttempts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center border border-slate-200 rounded-2xl">
                Chưa có dữ liệu bài làm.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Bài kiểm tra</th>
                      <th className="py-2.5 px-3 text-center">Lần nộp</th>
                      <th className="py-2.5 px-3 text-center">Điểm số</th>
                      <th className="py-2.5 px-3 text-center">Đúng/Tổng</th>
                      <th className="py-2.5 px-3 text-center">Thời gian</th>
                      <th className="py-2.5 px-3 text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentAttempts.slice().reverse().map((att) => {
                      const quiz = allQuizzes.find(q => q.id === att.quizId);
                      const meta = quiz ? SUBJECT_METADATA[quiz.subject] : null;

                      return (
                        <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 line-clamp-1">{quiz?.title || 'Bài kiểm tra'}</div>
                            <div className="text-[10px] text-slate-400">
                              {meta ? meta.name : 'Môn học'} • {new Date(att.submittedAt).toLocaleDateString('vi-VN')}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                            Lần {att.attemptNumber}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`font-black text-sm ${att.score >= 8 ? 'text-emerald-600' : att.score >= 6.5 ? 'text-blue-600' : 'text-amber-600'}`}>
                              {att.score.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600">
                            {att.correctCount}/{att.totalQuestions} câu
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                            {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {quiz && onReviewAttempt && (
                              <button
                                type="button"
                                onClick={() => {
                                  onReviewAttempt(quiz, att);
                                  onClose();
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold inline-flex items-center space-x-1"
                              >
                                <span>Xem bài</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Teacher Recommendation & Guidance Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs">
            <h5 className="font-bold text-indigo-950 flex items-center gap-1.5 mb-1">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Đánh giá & Khuyến nghị sư phạm cho học sinh:</span>
            </h5>
            <p className="text-slate-600 leading-relaxed">
              {avgScore >= 8.5
                ? `Học sinh ${student.name} có năng lực tiếp thu rất tốt, điểm số ổn định. Khuyến khích làm các câu hỏi vận dụng cao hoặc hỗ trợ bạn bè trong nhóm học tập.`
                : avgScore >= 6.5
                ? `Học sinh ${student.name} nắm được kiến thức cơ bản ở mức khá. Nên duy trì làm lại bài lần 2 để sửa các câu sai và gia tăng chuỗi học tập hàng ngày.`
                : totalCompleted > 0
                ? `Học sinh ${student.name} còn nhiều lỗ hổng ở các câu thông hiểu và vận dụng. Giáo viên nên giao thêm các bài tập bổ trợ thích ứng và đôn đốc hoàn thành bài đúng hạn.`
                : `Học sinh chưa hoàn thành bài kiểm tra nào được giao. Cần nhắc nhở và đôn đốc em tham gia làm bài trực tuyến để không bị gián đoạn tiến độ.`}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
          >
            Đóng hồ sơ học sinh
          </button>
        </div>

      </div>
    </div>
  );
};
