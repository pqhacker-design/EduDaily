import React from 'react';
import { AppNotification } from '../types';
import { Bell, CheckCheck, Clock, FileText, Award, X, ArrowRight } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectQuiz: (quizId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectQuiz
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
        role="dialog"
        aria-label="Trung tâm thông báo"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Thông báo nhiệm vụ</h2>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} thông báo mới chưa đọc` : 'Không có thông báo mới'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Đóng thông báo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions bar */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">
              Cập nhật mới nhất hôm nay
            </span>
            <button
              onClick={onMarkAllAsRead}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Đánh dấu đã đọc tất cả</span>
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">Chưa có thông báo nào</p>
              <p className="text-xs text-slate-400 mt-1">Các nhiệm vụ và bài tập mới sẽ hiển thị tại đây.</p>
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                onClick={() => !item.read && onMarkAsRead(item.id)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  item.read
                    ? 'bg-white border-slate-200 text-slate-700 opacity-80'
                    : 'bg-blue-50/40 border-blue-200 shadow-xs ring-1 ring-blue-500/10'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    item.type === 'new_quiz'
                      ? 'bg-blue-100 text-blue-600'
                      : item.type === 'badge_earned'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {item.type === 'new_quiz' ? (
                      <FileText className="w-4 h-4" />
                    ) : item.type === 'badge_earned' ? (
                      <Award className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate pr-2">
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.message}
                    </p>

                    {item.quizId && (
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(item.id);
                            onSelectQuiz(item.quizId!);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
                        >
                          <span>Làm bài ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
