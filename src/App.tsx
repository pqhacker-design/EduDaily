import React, { useState, useEffect } from 'react';
import { User, Quiz, QuizAttempt, AppNotification, RemedialRecommendation, Badge, ClassInfo } from './types';
import { 
  getStoredUsers, 
  saveUsers, 
  getCurrentUser, 
  setCurrentUserId, 
  clearCurrentUserId,
  getStoredClasses,
  saveClasses,
  getStoredQuizzes, 
  saveQuizzes, 
  getStoredAttempts, 
  saveAttempts, 
  getStoredNotifications, 
  saveNotifications, 
  resetAllData,
  getAllBadges
} from './utils/storage';
import { 
  calculateScore, 
  canAttemptQuiz, 
  evaluateNewBadges, 
  generateAdaptiveRecommendations 
} from './utils/rules';
import { CURRICULUM_QUESTIONS } from './data/curriculumBank';
import { BADGES } from './data/initialData';

import { Header } from './components/Header';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherClassAnalytics } from './components/TeacherClassAnalytics';
import { AdminManagementView } from './components/AdminManagementView';
import { ClassLeaderboard } from './components/ClassLeaderboard';
import { PerformanceAnalytics } from './components/PerformanceAnalytics';
import { BadgesView } from './components/BadgesView';
import { QuizPlayer } from './components/QuizPlayer';
import { QuizResultModal } from './components/QuizResultModal';
import { AdaptivePracticeModal } from './components/AdaptivePracticeModal';
import { QuizCreatorModal } from './components/QuizCreatorModal';
import { NotificationCenter } from './components/NotificationCenter';
import { AuthModal } from './components/AuthModal';
import { LogIn, Sparkles, GraduationCap, ShieldCheck, BookOpen, Trophy } from 'lucide-react';
import { 
  testConnection, 
  seedInitialFirestoreData,
  wipeAllDemoDataFromFirestore,
  subscribeToUsers,
  subscribeToClasses,
  subscribeToQuizzes,
  subscribeToAttempts,
  subscribeToNotifications,
  syncUserToFirestore,
  batchSyncUsersToFirestore,
  deleteUserFromFirestore,
  syncClassToFirestore,
  deleteClassFromFirestore,
  syncQuizToFirestore,
  syncAttemptToFirestore,
  syncNotificationToFirestore
} from './services/firebase';

export default function App() {
  const isAutostart = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('autostart') === '1';

  const [users, setUsers] = useState<User[]>(getStoredUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = getCurrentUser();
    if (stored) return stored;
    if (isAutostart) {
      const all = getStoredUsers();
      return all.find(u => u.role === 'student') || all[0] || null;
    }
    return null;
  });
  const [classes, setClasses] = useState<ClassInfo[]>(getStoredClasses);
  const [quizzes, setQuizzes] = useState<Quiz[]>(getStoredQuizzes);
  const [attempts, setAttempts] = useState<QuizAttempt[]>(getStoredAttempts);
  const [notifications, setNotifications] = useState<AppNotification[]>(getStoredNotifications);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    if (isAutostart) return false;
    return !getCurrentUser();
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (!currentUser) return 'dashboard';
    if (currentUser.role === 'admin') return 'admin_management';
    if (currentUser.role === 'teacher') return 'teacher_dashboard';
    return 'dashboard';
  });

  // Modals state
  const [activeQuizForTaking, setActiveQuizForTaking] = useState<Quiz | null>(null);
  const [activeResultModal, setActiveResultModal] = useState<{
    quiz: Quiz;
    attempt: QuizAttempt;
    newBadges: Badge[];
  } | null>(null);
  const [activeRemedial, setActiveRemedial] = useState<RemedialRecommendation | null>(null);
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(false);

  // Initialize and synchronize with Firebase Firestore
  useEffect(() => {
    // 1. Check cloud connection & seed initial data if remote is empty
    testConnection().then(async (connected) => {
      setFirestoreConnected(connected);
      if (connected) {
        await seedInitialFirestoreData();
      }
    });

    // 2. Real-time subscriptions to Firestore collections across all devices & browsers
    const unsubUsers = subscribeToUsers((freshUsers) => {
      setUsers(freshUsers);
      setCurrentUser(curr => {
        if (!curr) return null;
        const matched = freshUsers.find(u => u.id === curr.id);
        return matched || curr;
      });
    });

    const unsubClasses = subscribeToClasses((freshClasses) => {
      setClasses(freshClasses);
    });

    const unsubQuizzes = subscribeToQuizzes((freshQuizzes) => {
      setQuizzes(freshQuizzes);
    });

    const unsubAttempts = subscribeToAttempts((freshAttempts) => {
      setAttempts(freshAttempts);
    });

    const unsubNotifs = subscribeToNotifications((freshNotifs) => {
      setNotifications(freshNotifs);
    });

    return () => {
      unsubUsers();
      unsubClasses();
      unsubQuizzes();
      unsubAttempts();
      unsubNotifs();
    };
  }, []);

  // Sync state & storage as fast offline cache
  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    saveClasses(classes);
  }, [classes]);

  useEffect(() => {
    saveQuizzes(quizzes);
  }, [quizzes]);

  useEffect(() => {
    saveAttempts(attempts);
  }, [attempts]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Compute adaptive recommendations for student
  const recommendations = (currentUser && currentUser.role === 'student')
    ? generateAdaptiveRecommendations(currentUser.id, attempts, quizzes, CURRICULUM_QUESTIONS)
    : [];

  // Login handler
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentUserId(user.id);
    if (user.role === 'admin') {
      setActiveTab('admin_management');
    } else if (user.role === 'teacher') {
      setActiveTab('teacher_dashboard');
    } else {
      setActiveTab('dashboard');
    }
    setIsAuthModalOpen(false);
  };

  // Logout handler
  const handleLogout = () => {
    clearCurrentUserId();
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  // Switch active user
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setCurrentUserId(user.id);
    if (user.role === 'admin') {
      setActiveTab('admin_management');
    } else if (user.role === 'teacher') {
      setActiveTab('teacher_dashboard');
    } else {
      setActiveTab('dashboard');
    }
    setActiveQuizForTaking(null);
    setActiveResultModal(null);
    setActiveRemedial(null);
  };

  // Start a quiz
  const handleStartQuiz = (quiz: Quiz) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const { allowed } = canAttemptQuiz(quiz, attempts, currentUser.id);
    if (!allowed) {
      alert('Bạn đã hết lượt làm lại bài kiểm tra này!');
      return;
    }
    setActiveQuizForTaking(quiz);
  };

  // Submit quiz attempt
  const handleSubmitQuiz = (answers: Record<string, number>, timeSpentSeconds: number) => {
    if (!activeQuizForTaking || !currentUser) return;

    const quiz = activeQuizForTaking;
    const { score, correctCount, missedQuestionIds } = calculateScore(answers, quiz.questions);

    // Calculate attempt number
    const previousAttempts = attempts.filter(
      a => a.quizId === quiz.id && a.studentId === currentUser.id
    );
    const attemptNumber = previousAttempts.length + 1;

    const newAttempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      quizId: quiz.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatar,
      studentClass: currentUser.classId,
      attemptNumber,
      answers,
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      timeSpentSeconds,
      submittedAt: new Date().toISOString(),
      missedQuestionIds
    };

    // Evaluate badges
    const newBadgeCodes = evaluateNewBadges(currentUser, newAttempt, previousAttempts, quiz);
    const unlockedBadges = BADGES.filter(b => newBadgeCodes.includes(b.code));

    // Calculate earned points
    const basePoints = Math.round(score * 10);
    const bonusPoints = score === 10 ? 50 : score >= 8 ? 20 : 10;
    const pointsGained = basePoints + bonusPoints;

    // Update student state
    const updatedUser: User = {
      ...currentUser,
      totalPoints: currentUser.totalPoints + pointsGained,
      streakDays: currentUser.streakDays > 0 ? currentUser.streakDays : 1,
      badgesEarned: Array.from(new Set([...(currentUser.badgesEarned || []), ...newBadgeCodes]))
    };

    // Update in state
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    setAttempts(prev => [...prev, newAttempt]);

    // Sync attempt and updated user profile to Firestore Cloud
    syncAttemptToFirestore(newAttempt);
    syncUserToFirestore(updatedUser);

    // Push notification for newly earned badges
    if (unlockedBadges.length > 0) {
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        studentId: currentUser.id,
        title: `Bạn nhận được huy hiệu mới: ${unlockedBadges[0].title}! 🏆`,
        message: `Chúc mừng bạn đã hoàn thành xuất sắc mục tiêu và nhận thêm ${pointsGained} điểm thi đua.`,
        type: 'badge_earned',
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      syncNotificationToFirestore(newNotif);
    }

    // Close player & open results
    setActiveQuizForTaking(null);
    setActiveResultModal({
      quiz,
      attempt: newAttempt,
      newBadges: unlockedBadges
    });
  };

  // Review past attempt
  const handleReviewAttempt = (quiz: Quiz, attempt: QuizAttempt) => {
    setActiveResultModal({
      quiz,
      attempt,
      newBadges: []
    });
  };

  // Save new quiz created by teacher
  const handleSaveQuiz = (newQuiz: Quiz) => {
    setQuizzes(prev => [newQuiz, ...prev]);
    syncQuizToFirestore(newQuiz);

    // Push notification to all students in assigned classes
    const targetStudents = users.filter(
      u => u.role === 'student' && newQuiz.assignedClassIds.includes(u.classId)
    );

    const teacherName = currentUser?.name || 'Giáo viên';

    const newNotifications: AppNotification[] = targetStudents.map(student => ({
      id: `notif-${Date.now()}-${student.id}`,
      studentId: student.id,
      title: `Nhiệm vụ mới: ${newQuiz.title} 📝`,
      message: `${teacherName} vừa giao bài kiểm tra ${newQuiz.timeLimitMinutes} phút cho lớp ${student.className}.`,
      type: 'new_quiz',
      quizId: newQuiz.id,
      createdAt: new Date().toISOString(),
      read: false
    }));

    setNotifications(prev => [...newNotifications, ...prev]);
    newNotifications.forEach(n => syncNotificationToFirestore(n));
  };

  // Admin handlers: Add class, Delete class, Add user, Delete user, Batch Add, Wipe Demo
  const handleAddClass = (newClass: ClassInfo) => {
    setClasses(prev => {
      const next = [...prev, newClass];
      saveClasses(next);
      return next;
    });
    syncClassToFirestore(newClass);
  };

  const handleDeleteClass = (classId: string) => {
    setClasses(prev => {
      const next = prev.filter(c => c.id !== classId);
      saveClasses(next);
      return next;
    });
    deleteClassFromFirestore(classId);
  };

  const handleAddUser = (newUser: User) => {
    setUsers(prev => {
      const next = [...prev, newUser];
      saveUsers(next);
      return next;
    });
    syncUserToFirestore(newUser);
    // If teacher is assigned as homeroom, update the corresponding class
    if (newUser.role === 'teacher' && newUser.classId) {
      setClasses(prev => {
        const next = prev.map(c => {
          if (c.id === newUser.classId) {
            const updated = { ...c, teacherId: newUser.id, teacherName: newUser.name };
            syncClassToFirestore(updated);
            return updated;
          }
          return c;
        });
        saveClasses(next);
        return next;
      });
    }
  };

  const handleBatchAddUsers = (newUsers: User[]) => {
    setUsers(prev => {
      const next = [...prev, ...newUsers];
      saveUsers(next);
      return next;
    });
    batchSyncUsersToFirestore(newUsers);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => {
      const next = prev.filter(u => u.id !== userId);
      saveUsers(next);
      return next;
    });
    deleteUserFromFirestore(userId);
  };

  const handleWipeDemoData = async () => {
    await wipeAllDemoDataFromFirestore();
    const cleanUsers = getStoredUsers();
    setUsers(cleanUsers);
    setClasses([]);
    setQuizzes([]);
    setAttempts([]);
    setNotifications([]);
    const adminHung = cleanUsers.find(u => u.email === 'pqhacker@gmail.com') || cleanUsers[0];
    if (adminHung) {
      setCurrentUser(adminHung);
      setCurrentUserId(adminHung.id);
    }
  };

  // Complete remedial drill
  const handleCompleteRemedial = (bonusPoints: number) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      totalPoints: currentUser.totalPoints + bonusPoints
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    syncUserToFirestore(updatedUser);
    setActiveRemedial(null);
  };

  // Notifications helpers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, read: true };
        syncNotificationToFirestore(updated);
        return updated;
      }
      return n;
    }));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => {
      const updated = { ...n, read: true };
      syncNotificationToFirestore(updated);
      return updated;
    }));
  };

  const handleSelectQuizFromNotification = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      handleStartQuiz(quiz);
    }
  };

  // Reset to initial demo data
  const handleResetData = () => {
    if (window.confirm('Đặt lại tất cả dữ liệu mẫu ban đầu của EduDaily?')) {
      resetAllData();
      window.location.reload();
    }
  };

  // Admin reset / reissue user password
  const handleResetUserPassword = (userId: string, newPassword: string) => {
    setUsers(prev => {
      const updatedList = prev.map(u => {
        if (u.id === userId) {
          const updated = { ...u, password: newPassword, initialPassword: newPassword };
          syncUserToFirestore(updated);
          return updated;
        }
        return u;
      });
      saveUsers(updatedList);
      return updatedList;
    });

    if (currentUser && currentUser.id === userId) {
      const updatedCurrent = { ...currentUser, password: newPassword, initialPassword: newPassword };
      setCurrentUser(updatedCurrent);
    }
  };

  // Self-service update password for currently logged-in user
  const handleSelfUpdatePassword = (newPassword: string): boolean => {
    if (!currentUser) return false;
    const updatedUser: User = {
      ...currentUser,
      password: newPassword
    };
    setCurrentUser(updatedUser);
    setUsers(prev => {
      const updatedList = prev.map(u => (u.id === updatedUser.id ? updatedUser : u));
      saveUsers(updatedList);
      return updatedList;
    });
    syncUserToFirestore(updatedUser);
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        notifications={currentUser ? notifications.filter(n => n.studentId === currentUser.id || n.studentId === 'all') : []}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenLoginModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onCreateQuiz={currentUser?.role === 'teacher' ? () => setShowQuizCreator(true) : undefined}
        onResetData={handleResetData}
        isCloudConnected={firestoreConnected}
        onUpdatePassword={handleSelfUpdatePassword}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Guest View when not logged in */}
        {!currentUser && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Welcome Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-indigo-500/20">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold mb-4 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Chương trình Giáo Dục Phổ Thông 2018
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-4">
                  Kiểm Tra Kiến Thức Mỗi Ngày <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200">
                    Bứt Phá Điểm Số Cùng EduDaily
                  </span>
                </h1>
                <p className="text-slate-200 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl">
                  Hệ thống kiểm tra 15 phút hàng ngày, phân quyền giáo viên - học sinh - quản trị, 
                  thi đua bảng vàng lớp học và thuật toán đề xuất bài tập bổ trợ thông minh.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-400/20 transition-all text-sm sm:text-base cursor-pointer"
                  >
                    <LogIn className="w-5 h-5" />
                    Đăng Nhập Ngay Vào Hệ Thống
                  </button>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-medium rounded-2xl border border-white/20 backdrop-blur-md transition-all text-sm cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-amber-300" />
                    Xem Bảng Vàng Toàn Trường
                  </button>
                </div>
              </div>
            </div>

            {/* Role Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">Dành cho Học Sinh</h3>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  Làm đề trắc nghiệm nhanh 15 phút, xem báo cáo điểm số chi tiết tức thì, thi đua top lớp và nhận bài tập bổ trợ theo lỗ hổng kiến thức.
                </p>
                <span className="inline-flex items-center text-xs font-bold text-indigo-600 group-hover:underline">
                  Đăng nhập trải nghiệm học sinh →
                </span>
              </div>

              <div 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">Dành cho Giáo Viên</h3>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  Tạo đề kiểm tra từ ngân hàng chuẩn GDPT 2018, quy định thời gian, số lần làm lại, giao bài theo lớp và theo dõi tiến độ chi tiết từng em.
                </p>
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 group-hover:underline">
                  Đăng nhập cổng giáo viên →
                </span>
              </div>

              <div 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">Dành cho Quản Trị Viên</h3>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  Quản lý danh mục giáo viên, tạo các lớp học trong trường, phân quyền tài khoản và điều phối chương trình kiểm tra toàn diện.
                </p>
                <span className="inline-flex items-center text-xs font-bold text-purple-600 group-hover:underline">
                  Đăng nhập ban quản trị →
                </span>
              </div>
            </div>

            {/* Public Leaderboard preview */}
            {activeTab === 'leaderboard' && (
              <div className="mt-8">
                <ClassLeaderboard
                  currentUser={users[0]}
                  allUsers={users}
                  attempts={attempts}
                  classes={classes}
                />
              </div>
            )}
          </div>
        )}

        {/* Admin Views */}
        {currentUser && currentUser.role === 'admin' && (
          <>
            {activeTab === 'admin_management' && (
              <AdminManagementView
                currentAdmin={currentUser}
                users={users}
                classes={classes}
                onAddClass={handleAddClass}
                onDeleteClass={handleDeleteClass}
                onAddUser={handleAddUser}
                onBatchAddUsers={handleBatchAddUsers}
                onDeleteUser={handleDeleteUser}
                onResetUserPassword={handleResetUserPassword}
                onWipeDemoData={handleWipeDemoData}
              />
            )}

            {activeTab === 'teacher_dashboard' && (
              <TeacherDashboard
                currentTeacher={currentUser}
                allUsers={users}
                quizzes={quizzes}
                attempts={attempts}
                classes={classes}
                onCreateQuiz={() => setShowQuizCreator(true)}
                onReviewStudentAttempt={handleReviewAttempt}
                onViewReports={() => setActiveTab('teacher_reports')}
              />
            )}

            {activeTab === 'teacher_reports' && (
              <TeacherClassAnalytics
                currentTeacher={currentUser}
                allUsers={users}
                quizzes={quizzes}
                attempts={attempts}
                classes={classes}
                onReviewAttempt={handleReviewAttempt}
              />
            )}

            {activeTab === 'leaderboard' && (
              <ClassLeaderboard
                currentUser={currentUser}
                allUsers={users}
                attempts={attempts}
                classes={classes}
              />
            )}
          </>
        )}

        {/* Student Views */}
        {currentUser && currentUser.role === 'student' && (
          <>
            {activeTab === 'dashboard' && (
              <StudentDashboard
                currentUser={currentUser}
                quizzes={quizzes}
                attempts={attempts}
                recommendations={recommendations}
                onStartQuiz={handleStartQuiz}
                onReviewQuiz={handleReviewAttempt}
                onStartRemedial={rec => setActiveRemedial(rec)}
                onViewLeaderboard={() => setActiveTab('leaderboard')}
              />
            )}

            {activeTab === 'leaderboard' && (
              <ClassLeaderboard
                currentUser={currentUser}
                allUsers={users}
                attempts={attempts}
                classes={classes}
              />
            )}

            {activeTab === 'analytics' && (
              <PerformanceAnalytics
                currentUser={currentUser}
                quizzes={quizzes}
                attempts={attempts}
                recommendations={recommendations}
                onStartRemedial={rec => setActiveRemedial(rec)}
                onReviewAttempt={handleReviewAttempt}
              />
            )}

            {activeTab === 'badges' && (
              <BadgesView currentUser={currentUser} />
            )}
          </>
        )}

        {/* Teacher Views */}
        {currentUser && currentUser.role === 'teacher' && (
          <>
            {activeTab === 'teacher_dashboard' && (
              <TeacherDashboard
                currentTeacher={currentUser}
                allUsers={users}
                quizzes={quizzes}
                attempts={attempts}
                classes={classes}
                onCreateQuiz={() => setShowQuizCreator(true)}
                onReviewStudentAttempt={handleReviewAttempt}
                onViewReports={() => setActiveTab('teacher_reports')}
              />
            )}

            {activeTab === 'teacher_reports' && (
              <TeacherClassAnalytics
                currentTeacher={currentUser}
                allUsers={users}
                quizzes={quizzes}
                attempts={attempts}
                classes={classes}
                onReviewAttempt={handleReviewAttempt}
              />
            )}

            {activeTab === 'leaderboard' && (
              <ClassLeaderboard
                currentUser={currentUser}
                allUsers={users}
                attempts={attempts}
                classes={classes}
              />
            )}
          </>
        )}
      </div>

      {/* Active Quiz Player Overlay */}
      {activeQuizForTaking && currentUser && (
        <QuizPlayer
          quiz={activeQuizForTaking}
          attemptNumber={
            attempts.filter(a => a.quizId === activeQuizForTaking.id && a.studentId === currentUser.id).length + 1
          }
          onSubmit={handleSubmitQuiz}
          onCancel={() => setActiveQuizForTaking(null)}
        />
      )}

      {/* Quiz Result Report Modal */}
      {activeResultModal && (
        <QuizResultModal
          quiz={activeResultModal.quiz}
          attempt={activeResultModal.attempt}
          newBadgesEarned={activeResultModal.newBadges}
          canRetake={
            currentUser ? canAttemptQuiz(activeResultModal.quiz, attempts, currentUser.id).remainingAttempts > 0 : false
          }
          remainingAttempts={
            currentUser ? canAttemptQuiz(activeResultModal.quiz, attempts, currentUser.id).remainingAttempts : 0
          }
          onRetake={() => {
            const quiz = activeResultModal.quiz;
            setActiveResultModal(null);
            handleStartQuiz(quiz);
          }}
          onClose={() => setActiveResultModal(null)}
          onStartRemedial={rec => {
            setActiveResultModal(null);
            setActiveRemedial(rec);
          }}
          remedialRec={recommendations[0]}
        />
      )}

      {/* Adaptive Reinforcement Practice Modal */}
      {activeRemedial && (
        <AdaptivePracticeModal
          recommendation={activeRemedial}
          onClose={() => setActiveRemedial(null)}
          onComplete={handleCompleteRemedial}
        />
      )}

      {/* Teacher Quiz Creator Modal */}
      {showQuizCreator && currentUser && (
        <QuizCreatorModal
          currentTeacher={currentUser}
          classes={classes}
          onClose={() => setShowQuizCreator(false)}
          onSaveQuiz={handleSaveQuiz}
        />
      )}

      {/* Notification Center Drawer */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={currentUser ? notifications.filter(n => n.studentId === currentUser.id || n.studentId === 'all') : []}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onSelectQuiz={handleSelectQuizFromNotification}
      />

      {/* Auth Modal for Admin, Teacher, Student */}
      <AuthModal
        isOpen={isAuthModalOpen}
        allUsers={users}
        currentUser={currentUser}
        onLogin={handleLogin}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
