import React, { useState } from 'react';
import { User } from '../types';
import { KeyRound, Lock, Eye, EyeOff, Check, Copy, CheckCircle2, X, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface AdminResetPasswordModalProps {
  isOpen: boolean;
  targetUser: User | null;
  onClose: () => void;
  onResetPassword: (userId: string, newPassword: string) => Promise<void> | void;
}

export const AdminResetPasswordModal: React.FC<AdminResetPasswordModalProps> = ({
  isOpen,
  targetUser,
  onClose,
  onResetPassword
}) => {
  const [newPassword, setNewPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetUser) return null;

  const handleGenerateRandom = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz';
    let res = 'Edu@';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    setIsSubmitting(true);
    try {
      await onResetPassword(targetUser.id, newPassword.trim());
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    const text = `THÔNG TIN TÀI KHOẢN EDỦDAILY:\n- Người dùng: ${targetUser.name}\n- Vai trò: ${
      targetUser.role === 'teacher' ? 'Giáo viên' : targetUser.role === 'admin' ? 'Quản trị' : 'Học sinh'
    }\n- Email/Tài khoản: ${targetUser.email}\n- Mật khẩu mới: ${newPassword}\n- Đăng nhập tại: Hệ thống EduDaily GDPT 2018`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn"
        role="dialog"
        aria-label="Cấp lại mật khẩu người dùng"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">Cấp & Reset Mật Khẩu</h3>
              <p className="text-xs text-purple-100">
                Phân quyền Quản trị viên (Admin)
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Target user info card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <img
              src={targetUser.avatar}
              alt={targetUser.name}
              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs"
            />
            <div className="flex-1 truncate">
              <span className="font-bold text-slate-900 block text-sm truncate">{targetUser.name}</span>
              <span className="text-slate-500 font-mono block text-[11px] truncate">{targetUser.email}</span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  targetUser.role === 'teacher'
                    ? 'bg-indigo-100 text-indigo-700'
                    : targetUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {targetUser.role === 'teacher' ? 'Giáo viên' : targetUser.role === 'admin' ? 'Quản trị' : 'Học sinh'}
                </span>
                {targetUser.className && (
                  <span className="text-[11px] text-slate-400">({targetUser.className})</span>
                )}
              </div>
            </div>
          </div>

          {isSuccess ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Đã cấp lại mật khẩu thành công!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Mật khẩu mới đã được kích hoạt ngay lập tức trên hệ thống và Firestore.
                </p>

                <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200 font-mono text-xs space-y-1">
                  <div><strong>Tài khoản:</strong> {targetUser.email}</div>
                  <div><strong>Mật khẩu mới:</strong> <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">{newPassword}</span></div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyCredentials}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Đã sao chép vào bộ nhớ tạm!' : 'Sao chép thông tin gửi người dùng'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                Đóng cửa sổ
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Thiết lập mật khẩu mới:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono font-bold text-sm"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="text-purple-600 hover:text-purple-800 font-bold text-xs flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tạo mật khẩu ngẫu nhiên an toàn</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewPassword('123456')}
                  className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
                >
                  Đặt mặc định (123456)
                </button>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-[11px] leading-relaxed">
                Người dùng có thể đăng nhập ngay với mật khẩu này trên web/di động và sau đó tự ý đổi mật khẩu theo ý muốn tại menu cá nhân.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newPassword.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-purple-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang cấp lại...' : 'Lưu & Cấp lại mật khẩu'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
