import React, { useState } from 'react';
import { User, ClassInfo, Role } from '../types';
import { 
  Users, 
  BookOpen, 
  X, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Sparkles,
  KeyRound,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface BatchUserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassInfo[];
  existingUsers: User[];
  onBatchCreate: (newUsers: User[]) => void;
}

interface ParsedUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  classId: string;
  className: string;
  subjectSpecialty?: string;
  password: string;
  isValid: boolean;
  error?: string;
}

export const BatchUserImportModal: React.FC<BatchUserImportModalProps> = ({
  isOpen,
  onClose,
  classes,
  existingUsers,
  onBatchCreate
}) => {
  const [targetRole, setTargetRole] = useState<'student' | 'teacher'>('student');
  const [defaultClassId, setDefaultClassId] = useState<string>(classes[0]?.id || '');
  const [defaultSubject, setDefaultSubject] = useState<string>('Toán học');
  const [defaultPassword, setDefaultPassword] = useState<string>('123456');
  const [rawText, setRawText] = useState<string>('');
  const [createdSummary, setCreatedSummary] = useState<ParsedUserRow[] | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  // Selected default class object
  const selectedClass = classes.find(c => c.id === defaultClassId);

  // Parsing logic for CSV, Tab-separated (Excel / Google Sheets), or Comma-separated
  const parseLines = (text: string): ParsedUserRow[] => {
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));
    const seenInBatch = new Set<string>();

    return lines.map((line, index) => {
      // Split by tab (Excel copy-paste) or comma or semicolon
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t').map(p => p.trim());
      } else if (line.includes(';')) {
        parts = line.split(';').map(p => p.trim());
      } else {
        parts = line.split(',').map(p => p.trim());
      }

      // Format could be:
      // Student: [Name, Email, ClassName/ClassId (optional), Password (optional)]
      // Teacher: [Name, Email, Subject (optional), Password (optional)]
      const name = parts[0] || '';
      const email = parts[1] || '';
      const extraField = parts[2] || '';
      const customPassword = parts[3] || (parts[2] && parts[2].length >= 4 && !extraField.includes(' ') && !extraField.includes('Lớp') ? parts[2] : '');

      let isValid = true;
      let error = '';

      if (!name) {
        isValid = false;
        error = 'Thiếu họ và tên';
      } else if (!email || !email.includes('@')) {
        isValid = false;
        error = 'Email không đúng định dạng';
      } else if (existingEmails.has(email.toLowerCase())) {
        isValid = false;
        error = 'Email đã tồn tại trên hệ thống';
      } else if (seenInBatch.has(email.toLowerCase())) {
        isValid = false;
        error = 'Trùng lặp email trong danh sách dán';
      }

      if (isValid) {
        seenInBatch.add(email.toLowerCase());
      }

      const assignedPassword = (customPassword && customPassword.length >= 4 ? customPassword : defaultPassword) || '123456';

      if (targetRole === 'student') {
        // Resolve class
        let classId = defaultClassId;
        let className = selectedClass ? selectedClass.name : (defaultClassId || 'Lớp chung');
        if (extraField && !customPassword) {
          const matchedClass = classes.find(c => c.name.toLowerCase() === extraField.toLowerCase() || c.id.toLowerCase() === extraField.toLowerCase());
          if (matchedClass) {
            classId = matchedClass.id;
            className = matchedClass.name;
          } else if (extraField.trim()) {
            className = extraField.trim();
          }
        }

        return {
          id: `s-${Date.now().toString(36)}-${index}`,
          name,
          email,
          role: 'student',
          classId,
          className,
          password: assignedPassword,
          isValid,
          error
        };
      } else {
        // Teacher
        const subject = (extraField && extraField !== customPassword ? extraField : defaultSubject) || 'Toán học';
        return {
          id: `t-${Date.now().toString(36)}-${index}`,
          name,
          email,
          role: 'teacher',
          classId: '',
          className: `Bộ môn ${subject}`,
          subjectSpecialty: subject,
          password: assignedPassword,
          isValid,
          error
        };
      }
    });
  };

  const parsedRows = parseLines(rawText);
  const validRows = parsedRows.filter(r => r.isValid);
  const invalidRows = parsedRows.filter(r => !r.isValid);

  // Paste sample template
  const handlePasteSample = () => {
    if (targetRole === 'student') {
      setRawText(
`Nguyễn Hải Anh	haianh.nguyen@edudaily.edu.vn	123456
Trần Hoàng Bách	hoangbach.tran@edudaily.edu.vn	123456
Lê Cẩm Tú	camtu.le@edudaily.edu.vn	123456
Phạm Minh Đức	minhduc.pham@edudaily.edu.vn	123456
Đặng Quỳnh Nga	quynhnga.dang@edudaily.edu.vn	123456`
      );
    } else {
      setRawText(
`Thầy Trần Văn Nam	nam.tran@edudaily.edu.vn	Toán học	123456
Cô Nguyễn Thị Bích	bich.nguyen@edudaily.edu.vn	Ngữ văn	123456
Thầy Lê Quang Đạt	dat.le@edudaily.edu.vn	Tiếng Anh	123456`
      );
    }
  };

  // Submit batch creation
  const handleExecuteCreate = () => {
    if (validRows.length === 0) return;

    const newUsers: User[] = validRows.map(row => {
      const avatarIndex = (Math.floor(Math.random() * 10) + 1);
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        initialPassword: row.password,
        avatar: targetRole === 'student'
          ? `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`
          : `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80`,
        role: row.role,
        classId: row.classId,
        className: row.className,
        streakDays: 1,
        totalPoints: 0,
        badgesEarned: [],
        schoolName: 'Hệ Thống Giáo Dục EduDaily',
        subjectSpecialty: row.subjectSpecialty
      };
    });

    onBatchCreate(newUsers);
    setCreatedSummary(validRows);
  };

  const handleCopyCredentialsSummary = () => {
    if (!createdSummary) return;
    const header = `DANH SÁCH TÀI KHOẢN VÀ MẬT KHẨU KHỞI TẠO (${createdSummary.length} người dùng)\n` +
      `------------------------------------------------------------\n` +
      `STT | Họ và Tên | Email Đăng Nhập | Lớp/Môn | Mật Khẩu\n`;

    const body = createdSummary.map((u, i) => 
      `${i + 1}. ${u.name} | ${u.email} | ${u.className || u.subjectSpecialty} | ${u.password}`
    ).join('\n');

    navigator.clipboard.writeText(header + body);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-label="Tạo hàng loạt tài khoản từ danh sách"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>Tạo Hàng Loạt Tài Khoản Từ Danh Sách</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-400 text-slate-900">
                  Excel / Sheets
                </span>
              </h3>
              <p className="text-xs text-blue-100">
                Sao chép từ file Excel hoặc Google Sheets và dán vào bên dưới để tạo nhiều tài khoản cùng lúc.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {createdSummary ? (
            /* Creation Success Summary Card */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-black text-emerald-900">
                  Đã tạo thành công {createdSummary.length} tài khoản mới!
                </h4>
                <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                  Tất cả tài khoản đã được đồng bộ vào hệ thống và cơ sở dữ liệu đám mây Firestore. Bạn có thể sao chép danh sách mật khẩu bên dưới để gửi cho người dùng.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Danh sách tài khoản vừa cấp:
                </span>
                <button
                  type="button"
                  onClick={handleCopyCredentialsSummary}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSummary ? 'Đã sao chép vào Clipboard!' : 'Sao chép toàn bộ danh sách & mật khẩu'}</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3">Email đăng nhập</th>
                      <th className="py-2.5 px-3 text-center">Đơn vị / Lớp</th>
                      <th className="py-2.5 px-3 text-center">Mật khẩu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {createdSummary.map((u, i) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 font-bold">{i + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">{u.name}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{u.email}</td>
                        <td className="py-2 px-3 text-center font-semibold text-slate-600">{u.className || u.subjectSpecialty}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-purple-700 bg-purple-50/50">{u.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  Hoàn tất & Đóng
                </button>
              </div>
            </div>
          ) : (
            /* Input Form & Preview */
            <>
              {/* Role Selection Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTargetRole('student')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                    targetRole === 'student' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Tạo Hàng Loạt Học Sinh</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetRole('teacher')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                    targetRole === 'teacher' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Tạo Hàng Loạt Giáo Viên</span>
                </button>
              </div>

              {/* Default Settings Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                {targetRole === 'student' ? (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Xếp vào lớp học mặc định:
                    </label>
                    {classes.length > 0 ? (
                      <select
                        value={defaultClassId}
                        onChange={e => setDefaultClassId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Khối {c.grade})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px]">
                        Chưa có lớp học nào trong hệ thống. Vui lòng tạo lớp học trước ở mục "Lớp học" hoặc nhập tên lớp trong danh sách dán.
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Bộ môn chuyên trách mặc định:
                    </label>
                    <select
                      value={defaultSubject}
                      onChange={e => setDefaultSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Toán học">Toán học</option>
                      <option value="Ngữ văn">Ngữ văn</option>
                      <option value="Tiếng Anh">Tiếng Anh</option>
                      <option value="KHTN / Vật lý">KHTN / Vật lý</option>
                      <option value="KHTN / Hóa học">KHTN / Hóa học</option>
                      <option value="KHTN / Sinh học">KHTN / Sinh học</option>
                      <option value="Lịch sử & Địa lý">Lịch sử & Địa lý</option>
                      <option value="Tin học">Tin học</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mật khẩu khởi tạo ban đầu:
                  </label>
                  <input
                    type="text"
                    value={defaultPassword}
                    onChange={e => setDefaultPassword(e.target.value)}
                    placeholder="Mặc định: 123456"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Người dùng có thể đổi mật khẩu sau khi đăng nhập.
                  </span>
                </div>
              </div>

              {/* Paste Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span>Dán danh sách từ Excel hoặc định dạng CSV:</span>
                  </label>

                  <button
                    type="button"
                    onClick={handlePasteSample}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dán dữ liệu mẫu</span>
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder={
                    targetRole === 'student'
                      ? "Nguyễn Hải Anh\thaianh.nguyen@edudaily.edu.vn\t123456\nTrần Hoàng Bách\thoangbach.tran@edudaily.edu.vn\t123456\n(Hỗ trợ dán trực tiếp cột từ Excel hoặc dấu phẩy: Họ tên, Email, Mật khẩu)"
                      : "Thầy Trần Văn Nam\tnam.tran@edudaily.edu.vn\tToán học\t123456\nCô Nguyễn Thị Bích\tbich.nguyen@edudaily.edu.vn\tNgữ văn\t123456"
                  }
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Mỗi dòng 1 người dùng: <strong className="text-slate-700">Họ và tên [TAB hoặc phẩy] Email [TAB hoặc phẩy] Mật khẩu</strong></span>
                  <span className="font-bold text-slate-700">Đã nhận diện: {parsedRows.length} dòng</span>
                </div>
              </div>

              {/* Live Validation & Preview */}
              {parsedRows.length > 0 && (
                <div className="space-y-2 border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-slate-900">Xem trước kết quả phân tích:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        {validRows.length} hợp lệ
                      </span>
                      {invalidRows.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[11px]">
                          {invalidRows.length} lỗi
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-white">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <tr>
                          <th className="py-2 px-3">Họ và tên</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3 text-center">Đơn vị / Lớp</th>
                          <th className="py-2 px-3 text-center">Mật khẩu</th>
                          <th className="py-2 px-3 text-right">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedRows.map((row, i) => (
                          <tr key={i} className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/40'}>
                            <td className="py-1.5 px-3 font-bold text-slate-800">{row.name || '---'}</td>
                            <td className="py-1.5 px-3 font-mono text-slate-600">{row.email || '---'}</td>
                            <td className="py-1.5 px-3 text-center text-slate-600">{row.className || row.subjectSpecialty}</td>
                            <td className="py-1.5 px-3 text-center font-mono font-bold text-purple-700">{row.password}</td>
                            <td className="py-1.5 px-3 text-right">
                              {row.isValid ? (
                                <span className="inline-flex items-center text-emerald-600 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  Hợp lệ
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-red-600 font-bold" title={row.error}>
                                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                  {row.error}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs"
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  onClick={handleExecuteCreate}
                  disabled={validRows.length === 0}
                  className={`px-5 py-2.5 rounded-xl text-white font-black text-xs shadow-md transition-all flex items-center space-x-2 ${
                    validRows.length > 0
                      ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                      : 'bg-slate-300 cursor-not-allowed text-slate-500'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Khởi Tạo {validRows.length} Tài Khoản</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
