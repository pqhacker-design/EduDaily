import React, { useState } from 'react';
import { User, Role } from '../types';
import { 
  GraduationCap, 
  ShieldCheck, 
  BookOpen, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Users,
  X,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  allUsers: User[];
  currentUser: User | null;
  onLogin: (user: User) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  allUsers,
  currentUser,
  onLogin,
  onClose
}) => {
  const [selectedRole, setSelectedRole] = useState<Role>(() => {
    const hasStudents = allUsers.some(u => u.role === 'student');
    if (!hasStudents && allUsers.some(u => u.role === 'admin')) {
      return 'admin';
    }
    return 'student';
  });
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);

  if (!isOpen) return null;

  // Filter users by selected role
  const roleUsers = allUsers.filter(u => u.role === selectedRole);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailInput.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email hoặc mã người dùng.');
      return;
    }

    // Match by email or name
    const found = allUsers.find(
      u => u.email.toLowerCase() === emailInput.trim().toLowerCase() ||
           u.name.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (found) {
      if (found.role !== selectedRole) {
        setErrorMessage(`Tài khoản "${found.name}" thuộc vai trò ${
          found.role === 'admin' ? 'Quản trị viên' : found.role === 'teacher' ? 'Giáo viên' : 'Học sinh'
        }. Vui lòng chuyển tab tương ứng.`);
        return;
      }

      // Check password if entered or present
      const expectedPassword = found.password || '123456';
      if (passwordInput && passwordInput !== expectedPassword && passwordInput !== '123456') {
        setErrorMessage('Mật khẩu chưa chính xác. Mật khẩu mẫu là "123456" hoặc liên hệ Admin nhà trường để được cấp lại.');
        return;
      }

      onLogin(found);
    } else {
      setErrorMessage('Không tìm thấy tài khoản với email này. Vui lòng chọn tài khoản có sẵn bên dưới hoặc kiểm tra lại.');
    }
  };

  const handleQuickSelect = (user: User) => {
    setErrorMessage('');
    onLogin(user);
  };

  return (
    <div 
      className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-label="Cửa sổ đăng nhập EduDaily"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-7">
          {currentUser && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-md border border-white/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Đăng Nhập EduDaily</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-400 text-slate-900 font-sans">
                  GDPT 2018
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Nền tảng kiểm tra kiến thức nhanh & thi đua học tập mỗi ngày
              </p>
            </div>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="p-4 sm:p-6 pb-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
            Chọn vai trò đăng nhập:
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student');
                setErrorMessage('');
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                selectedRole === 'student'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Học sinh</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('teacher');
                setErrorMessage('');
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                selectedRole === 'teacher'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Giáo viên</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setErrorMessage('');
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                selectedRole === 'admin'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Quản trị viên</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 pt-2 space-y-5">
          
          {/* Quick 1-Click Login List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Đăng nhập nhanh 1-chạm (Tài khoản mẫu):
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Không cần mật khẩu</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {roleUsers.length > 0 ? (
                roleUsers.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickSelect(user)}
                    className="w-full p-2.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {user.id === currentUser?.id && (
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              Đang dùng
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {user.role === 'admin'
                            ? 'Ban Giám Hiệu • Toàn quyền quản trị'
                            : user.role === 'teacher'
                            ? `${user.subjectSpecialty || 'Bộ môn'} • ${user.className || 'Giáo viên'}`
                            : `${user.className} • ${user.totalPoints} điểm thi đua`}
                        </div>
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-blue-600 text-slate-600 group-hover:text-white text-xs font-bold transition-colors flex items-center space-x-1 shrink-0">
                      <span>Vào ngay</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">Chưa có tài khoản trong vai trò này.</p>
                  <p className="text-[11px] mt-0.5">Vui lòng đăng nhập với tài khoản <strong className="text-purple-700 cursor-pointer underline" onClick={() => setSelectedRole('admin')}>Quản trị viên</strong> để tạo người dùng hoặc nhập hàng loạt từ Excel.</p>
                </div>
              )}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              hoặc nhập thông tin
            </span>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleManualLogin} className="space-y-3">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {selectedRole === 'student' ? 'Email học sinh hoặc tên học sinh:' : 'Email đăng nhập:'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailInput}
                  onChange={e => {
                    setEmailInput(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder={
                    selectedRole === 'student'
                      ? 'an.nguyen@edudaily.edu.vn hoặc Nguyễn Minh An'
                      : selectedRole === 'teacher'
                      ? 'mai.hoang@edudaily.edu.vn hoặc Cô Hoàng Thị Mai'
                      : 'admin.tuan@edudaily.edu.vn hoặc Thầy Quách Văn Tuấn'
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mật khẩu:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="•••••••• (Bất kỳ ký tự nào cho tài khoản demo)"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Ghi nhớ phiên đăng nhập</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-white text-xs font-black shadow-md flex items-center justify-center space-x-1.5 transition-all ${
                selectedRole === 'student'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : selectedRole === 'teacher'
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Đăng Nhập Với Tư Cách {
                  selectedRole === 'student' ? 'Học Sinh' : selectedRole === 'teacher' ? 'Giáo Viên' : 'Quản Trị Viên'
                }
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Helper Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-70 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleIn text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Hướng Dẫn Khôi Phục Mật Khẩu</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2 leading-relaxed">
              <p>
                <strong>Quản trị viên (Admin):</strong> Thầy Quách Văn Tuấn (<span className="font-mono text-[11px]">admin.tuan@edudaily.edu.vn</span>) có toàn quyền reset hoặc cấp lại mật khẩu ngay lập tức cho giáo viên và học sinh.
              </p>
              <p>
                Mật khẩu mặc định hệ thống cho tất cả tài khoản mẫu là: <strong className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-blue-800">123456</strong>
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPasswordInput('123456');
                  setShowForgotModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5"
              >
                <span>Tự động điền mật khẩu mẫu (123456)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
