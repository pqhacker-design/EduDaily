import { User, Badge, Quiz, QuizAttempt, AppNotification, ClassInfo } from '../types';

export const BADGES: Badge[] = [
  {
    id: 'b-streak-3',
    code: 'daily_streak_3',
    title: 'Khởi Động Tinh Thần',
    description: 'Duy trì chuỗi học tập 3 ngày liên tiếp',
    icon: 'Flame',
    gradient: 'from-amber-400 to-orange-500',
    requirement: 'Học 3 ngày liên tiếp'
  },
  {
    id: 'b-streak-7',
    code: 'daily_streak_7',
    title: 'Ong Chăm Chỉ',
    description: 'Duy trì chuỗi học tập 7 ngày liên tiếp',
    icon: 'Sparkles',
    gradient: 'from-orange-500 to-rose-500',
    requirement: 'Học 7 ngày liên tiếp'
  },
  {
    id: 'b-perfect',
    code: 'perfect_10',
    title: 'Điểm 10 Hoàn Hảo',
    description: 'Đạt điểm tuyệt đối 10/10 trong bài kiểm tra',
    icon: 'Trophy',
    gradient: 'from-yellow-400 to-amber-500',
    requirement: 'Đạt 10/10 điểm'
  },
  {
    id: 'b-speed',
    code: 'speed_demon',
    title: 'Thần Tốc',
    description: 'Nộp bài trước một nửa thời gian và đạt điểm giỏi (≥ 8.5)',
    icon: 'Zap',
    gradient: 'from-cyan-400 to-blue-600',
    requirement: 'Hoàn thành siêu tốc ≥ 8.5 điểm'
  },
  {
    id: 'b-persistence',
    code: 'persistence',
    title: 'Chiến Binh Bền Bỉ',
    description: 'Làm lại bài kiểm tra và nâng cao thành tích cá nhân',
    icon: 'TrendingUp',
    gradient: 'from-emerald-400 to-teal-600',
    requirement: 'Cải thiện điểm ở lần làm lại'
  },
  {
    id: 'b-top3',
    code: 'top_three',
    title: 'Nhà Thông Thái Trẻ',
    description: 'Lọt vào top 3 bảng xếp hạng học tập của lớp',
    icon: 'Crown',
    gradient: 'from-purple-500 to-indigo-600',
    requirement: 'Top 3 bảng xếp hạng lớp'
  }
];

// Dữ liệu lớp học ban đầu: sạch sẽ, sẵn sàng để Admin khởi tạo hoặc tạo hàng loạt
export const INITIAL_CLASSES: ClassInfo[] = [];

// Tài khoản quản trị viên duy nhất theo yêu cầu người dùng
export const INITIAL_USERS: User[] = [
  {
    id: 'admin-hung',
    name: 'Ngô Thanh Hùng',
    email: 'pqhacker@gmail.com',
    password: '123456',
    initialPassword: '123456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'admin',
    classId: '',
    className: 'Ban Giám Hiệu / Quản Trị Hệ Thống',
    streakDays: 1,
    totalPoints: 0,
    badgesEarned: [],
    schoolName: 'Hệ Thống Giáo Dục EduDaily'
  }
];

export const INITIAL_QUIZZES: Quiz[] = [];

export const INITIAL_ATTEMPTS: QuizAttempt[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
