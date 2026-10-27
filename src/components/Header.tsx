import React, { useState } from 'react';
import { User, AppNotification } from '../types';
import { 
  GraduationCap, 
  Flame, 
  Trophy, 
  Bell, 
  UserCheck, 
  Sparkles,
  BarChart3,
  Award,
  BookOpen,
  Users,
  PlusCircle,
  Menu,
  X,
  RotateCcw,
  ShieldCheck,
  Building2,
  LogIn,
  LogOut,
  KeyRound
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

interface HeaderProps {
  currentUser: User | null;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  onCreateQuiz?: () => void;
  onResetData?: () => void;
  isCloudConnected?: boolean;
  onUpdatePassword?: (newPassword: string) => Promise<boolean> | boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  activeTab,
  onSelectTab,
  notifications,
  onOpenNotifications,
  onOpenLoginModal,
  onLogout,
  onCreateQuiz,
  onResetData,
  isCloudConnected,
  onUpdatePassword
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  const getHomeTab = () => {
    if (isAdmin) return 'admin_management';
    if (isTeacher) return 'teacher_dashboard';
    return 'dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => onSelectTab(getHomeTab())}
              className="flex items-center space-x-2.5 text-left group focus:outline-hidden"
              aria-label="Trang chủ EduDaily"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                  EduDaily
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">
                    GDPT 2018
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Kiểm tra trắc nghiệm nhanh hàng ngày
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs (When logged in) */}
          <nav className="hidden md:flex items-center space-x-1">
            {currentUser && (
              isAdmin ? (
                <>
                  <button
                    onClick={() => onSelectTab('admin_management')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'admin_management'
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Quản trị Lớp & Người dùng</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('teacher_dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'teacher_dashboard'
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Theo dõi đề thi các lớp</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('teacher_reports')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'teacher_reports'
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span>Báo cáo & Thống kê</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('leaderboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'leaderboard'
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>Bảng xếp hạng trường</span>
                  </button>
                </>
              ) : isTeacher ? (
                <>
                  <button
                    onClick={() => onSelectTab('teacher_dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'teacher_dashboard'
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Quản lý lớp & Tiến độ</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('teacher_reports')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'teacher_reports'
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span>Báo cáo & Thống kê</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('leaderboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'leaderboard'
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Bảng xếp hạng học sinh</span>
                  </button>
                  {onCreateQuiz && (
                    <button
                      onClick={onCreateQuiz}
                      className="ml-2 px-3.5 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Tạo & Giao bài mới</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => onSelectTab('dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'dashboard'
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Nhiệm vụ & Bài thi</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('leaderboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'leaderboard'
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Thi đua lớp {currentUser.classId}</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('analytics')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'analytics'
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Hiệu suất cá nhân</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('badges')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'badges'
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Huy hiệu</span>
                  </button>
                </>
              )
            )}
          </nav>

          {/* User Stats & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Cloud Database Sync Status Pill */}
            <div 
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                isCloudConnected 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={isCloudConnected ? "Dữ liệu được lưu trữ trên Firebase Firestore, tự động đồng bộ trên mọi thiết bị và trình duyệt" : "Đang kết nối Firestore Cloud..."}
            >
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="hidden sm:inline">{isCloudConnected ? 'Cloud Firestore' : 'Kết nối Cloud...'}</span>
              <span className="sm:hidden text-[11px]">Cloud</span>
            </div>
            
            {/* Student Gamification Pills */}
            {currentUser && isStudent && (
              <div className="hidden sm:flex items-center space-x-2">
                <div 
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold"
                  title="Chuỗi ngày làm bài liên tục"
                >
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                  <span>{currentUser.streakDays} ngày</span>
                </div>
                <div 
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold"
                  title="Tổng điểm thi đua tích lũy"
                >
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>{currentUser.totalPoints.toLocaleString()} đ</span>
                </div>
              </div>
            )}

            {/* Notification Bell (When logged in) */}
            {currentUser && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden"
                aria-label={`Thông báo (${unreadCount} chưa đọc)`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile or Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-hidden border border-slate-200"
                  aria-expanded={showUserMenu}
                  aria-label="Tài khoản người dùng"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="text-left hidden lg:block pr-1">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] font-semibold text-blue-600 flex items-center gap-1">
                      <span>
                        {isAdmin ? 'Quản trị viên' : isTeacher ? 'Giáo viên' : currentUser.className}
                      </span>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ml-0.5 ${isAdmin ? 'bg-amber-500' : isTeacher ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Đang đăng nhập
                      </p>
                      <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-xs text-slate-500">{currentUser.email}</p>
                      <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700">
                        Vai trò: {isAdmin ? 'Quản trị viên (Admin)' : isTeacher ? 'Giáo viên bộ môn' : `Học sinh (${currentUser.className})`}
                      </div>
                    </div>

                    <div className="p-2 border-b border-slate-100 space-y-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowChangePasswordModal(true);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <KeyRound className="w-4 h-4 text-purple-600" />
                        <span>Đổi Mật Khẩu Cá Nhân</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenLoginModal();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Mở Cửa Sổ Đăng Nhập / Đổi Vai Trò</span>
                      </button>
                    </div>

                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        Chuyển đổi tài khoản demo:
                      </p>
                      <div className="space-y-1 max-h-52 overflow-y-auto">
                        {allUsers.map(user => (
                          <button
                            key={user.id}
                            onClick={() => {
                              onSwitchUser(user);
                              setShowUserMenu(false);
                              onSelectTab(
                                user.role === 'admin' 
                                  ? 'admin_management' 
                                  : user.role === 'teacher' 
                                  ? 'teacher_dashboard' 
                                  : 'dashboard'
                              );
                            }}
                            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                              user.id === currentUser.id 
                                ? 'bg-blue-50 text-blue-700 font-bold' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <img src={user.avatar} alt="" className="w-6 h-6 rounded-md object-cover" />
                            <div className="flex-1 truncate">
                              <span className="block truncate">{user.name}</span>
                              <span className="text-[10px] text-slate-400">
                                {user.role === 'admin' ? 'Quản trị viên (Admin)' : user.role === 'teacher' ? 'Giáo viên' : user.className}
                              </span>
                            </div>
                            {user.id === currentUser.id && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="px-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất</span>
                      </button>

                      {onResetData && (
                        <button
                          onClick={() => {
                            onResetData();
                            setShowUserMenu(false);
                          }}
                          className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Đặt lại dữ liệu</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all hover:scale-102"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {currentUser ? (
            isAdmin ? (
              <>
                <button
                  onClick={() => { onSelectTab('admin_management'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Quản trị Lớp & Người dùng</span>
                </button>
                <button
                  onClick={() => { onSelectTab('teacher_dashboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Theo dõi đề thi các lớp</span>
                </button>
                <button
                  onClick={() => { onSelectTab('teacher_reports'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>Báo cáo & Thống kê</span>
                </button>
                <button
                  onClick={() => { onSelectTab('leaderboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>Bảng xếp hạng trường</span>
                </button>
                <button
                  onClick={() => { onOpenLoginModal(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đổi tài khoản đăng nhập</span>
                </button>
              </>
            ) : isTeacher ? (
              <>
                <button
                  onClick={() => { onSelectTab('teacher_dashboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Quản lý lớp & Tiến độ</span>
                </button>
                <button
                  onClick={() => { onSelectTab('teacher_reports'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>Báo cáo & Thống kê</span>
                </button>
                <button
                  onClick={() => { onSelectTab('leaderboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>Bảng xếp hạng học sinh</span>
                </button>
                <button
                  onClick={() => { onOpenLoginModal(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đổi tài khoản đăng nhập</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onSelectTab('dashboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Nhiệm vụ & Bài thi</span>
                </button>
                <button
                  onClick={() => { onSelectTab('leaderboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>Thi đua lớp {currentUser.classId}</span>
                </button>
                <button
                  onClick={() => { onSelectTab('analytics'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>Hiệu suất cá nhân</span>
                </button>
                <button
                  onClick={() => { onSelectTab('badges'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>Huy hiệu đạt được</span>
                </button>
                <button
                  onClick={() => { setShowChangePasswordModal(true); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-purple-600 hover:bg-purple-50 flex items-center space-x-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Đổi mật khẩu cá nhân</span>
                </button>
                <button
                  onClick={() => { onOpenLoginModal(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đổi tài khoản đăng nhập</span>
                </button>
              </>
            )
          ) : (
            <button
              onClick={() => { onOpenLoginModal(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </button>
          )}
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && currentUser && (
        <ChangePasswordModal
          isOpen={true}
          currentUser={currentUser}
          onClose={() => setShowChangePasswordModal(false)}
          onUpdatePassword={async (newPwd) => {
            if (onUpdatePassword) {
              return onUpdatePassword(newPwd);
            }
            return true;
          }}
        />
      )}
    </header>
  );
};
