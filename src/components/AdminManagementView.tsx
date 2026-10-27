import React, { useState } from 'react';
import { User, ClassInfo, Grade, Subject } from '../types';
import { SUBJECT_METADATA } from '../data/curriculumBank';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  UserCheck, 
  PlusCircle, 
  Search, 
  Trash2, 
  Check, 
  X, 
  BookOpen, 
  ShieldCheck, 
  Sparkles,
  School,
  ArrowRight,
  KeyRound,
  Lock,
  Copy,
  Eye,
  EyeOff,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { AdminResetPasswordModal } from './AdminResetPasswordModal';
import { BatchUserImportModal } from './BatchUserImportModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface AdminManagementViewProps {
  currentAdmin: User;
  users: User[];
  classes: ClassInfo[];
  onAddClass: (newClass: ClassInfo) => void;
  onDeleteClass: (classId: string) => void;
  onAddUser: (newUser: User) => void;
  onBatchAddUsers?: (newUsers: User[]) => void;
  onDeleteUser: (userId: string) => void;
  onResetUserPassword?: (userId: string, newPassword: string) => void;
  onWipeDemoData?: () => void;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  currentAdmin,
  users,
  classes,
  onAddClass,
  onDeleteClass,
  onAddUser,
  onBatchAddUsers,
  onDeleteUser,
  onResetUserPassword,
  onWipeDemoData
}) => {
  const [activeCategory, setActiveCategory] = useState<'classes' | 'teachers' | 'students' | 'accounts' | 'overview'>('classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modals state
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'user' | 'class';
    id: string;
    name: string;
  } | null>(null);
  const [showWipeDemoConfirm, setShowWipeDemoConfirm] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [createdCredentialCard, setCreatedCredentialCard] = useState<{ user: User; password: string } | null>(null);
  const [credentialCopied, setCredentialCopied] = useState(false);

  // New Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<Grade>(10);
  const [newClassTeacherId, setNewClassTeacherId] = useState('');
  const [newClassAcademicYear, setNewClassAcademicYear] = useState('2026 - 2027');

  // New Teacher Form State
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('123456');
  const [newTeacherSubject, setNewTeacherSubject] = useState('Toán học');
  const [newTeacherHomeroomClass, setNewTeacherHomeroomClass] = useState('');

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('123456');
  const [newStudentClassId, setNewStudentClassId] = useState(classes[0]?.id || '10A1');

  // Filtered lists
  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.subjectSpecialty && t.subjectSpecialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClassFilter === 'all' || s.classId === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const teacher = teachers.find(t => t.id === newClassTeacherId);

    const newClass: ClassInfo = {
      id: newClassName.trim().replace(/\s+/g, ''),
      name: newClassName.trim(),
      grade: newClassGrade,
      teacherId: teacher?.id || '',
      teacherName: teacher?.name || 'Chưa phân công',
      academicYear: newClassAcademicYear
    };

    onAddClass(newClass);
    setNewClassName('');
    setShowAddClassModal(false);
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherEmail.trim()) return;

    const teacherAvatars = [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    ];
    const randomAvatar = teacherAvatars[Math.floor(Math.random() * teacherAvatars.length)];

    const pwd = newTeacherPassword.trim() || '123456';
    const newTeacher: User = {
      id: `t-${Date.now()}`,
      name: newTeacherName.trim(),
      email: newTeacherEmail.trim(),
      password: pwd,
      initialPassword: pwd,
      avatar: randomAvatar,
      role: 'teacher',
      classId: newTeacherHomeroomClass,
      className: newTeacherHomeroomClass ? `Chủ nhiệm ${newTeacherHomeroomClass}` : 'Giáo viên bộ môn',
      streakDays: 1,
      totalPoints: 0,
      badgesEarned: [],
      schoolName: currentAdmin.schoolName || 'THPT Chuyên Lê Hồng Phong',
      subjectSpecialty: newTeacherSubject
    };

    onAddUser(newTeacher);
    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherPassword('123456');
    setNewTeacherHomeroomClass('');
    setShowAddTeacherModal(false);
    setCreatedCredentialCard({ user: newTeacher, password: pwd });
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;

    const targetClass = classes.find(c => c.id === newStudentClassId);

    const studentAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    ];
    const randomAvatar = studentAvatars[Math.floor(Math.random() * studentAvatars.length)];

    const pwd = newStudentPassword.trim() || '123456';
    const newStudent: User = {
      id: `s-${Date.now()}`,
      name: newStudentName.trim(),
      email: newStudentEmail.trim(),
      password: pwd,
      initialPassword: pwd,
      avatar: randomAvatar,
      role: 'student',
      classId: newStudentClassId,
      className: targetClass?.name || newStudentClassId,
      streakDays: 1,
      totalPoints: 100, // starter welcome points
      badgesEarned: ['daily_streak_3'],
      schoolName: currentAdmin.schoolName || 'THPT Chuyên Lê Hồng Phong'
    };

    onAddUser(newStudent);
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentPassword('123456');
    setShowAddStudentModal(false);
    setCreatedCredentialCard({ user: newStudent, password: pwd });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Phân Quyền Quản Trị Hệ Thống (Administrator)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Quản Lý Giáo Viên, Lớp & Học Sinh
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Tạo và phân quyền người dùng, mở lớp học mới, phân công giáo viên chủ nhiệm và quản lý danh sách học sinh toàn trường.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Nút Tạo hàng loạt từ Excel / Google Sheets */}
          <button
            type="button"
            onClick={() => setShowBatchModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all hover:scale-102"
            title="Nhập hàng loạt học sinh hoặc giáo viên từ file Excel hoặc Sheets"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Tạo Hàng Loạt (Excel/CSV)</span>
          </button>

          {activeCategory === 'classes' && (
            <button
              onClick={() => setShowAddClassModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md flex items-center space-x-2 transition-all hover:scale-102"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Lớp Học Mới</span>
            </button>
          )}

          {activeCategory === 'teachers' && (
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-md flex items-center space-x-2 transition-all hover:scale-102"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm Giáo Viên Mới</span>
            </button>
          )}

          {activeCategory === 'students' && (
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md flex items-center space-x-2 transition-all hover:scale-102"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm Học Sinh Mới</span>
            </button>
          )}

          {/* Nút Xóa sạch dữ liệu mẫu demo */}
          {onWipeDemoData && (
            <button
              type="button"
              onClick={() => setShowWipeDemoConfirm(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 text-xs font-bold flex items-center space-x-1.5 transition-all"
              title="Xóa toàn bộ học sinh, giáo viên, bài thi mẫu cũ để hệ thống hoàn toàn sạch sẽ"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Xóa Dữ Liệu Demo Mẫu</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => { setActiveCategory('classes'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeCategory === 'classes'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Quản lý Lớp học ({classes.length})</span>
          </button>

          <button
            onClick={() => { setActiveCategory('teachers'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeCategory === 'teachers'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Quản lý Giáo viên ({teachers.length})</span>
          </button>

          <button
            onClick={() => { setActiveCategory('students'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeCategory === 'students'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản lý Học sinh ({students.length})</span>
          </button>

          <button
            onClick={() => { setActiveCategory('accounts'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeCategory === 'accounts'
                ? 'bg-white text-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-purple-600" />
            <span>Cấp & Quản Lý Mật Khẩu ({users.length})</span>
          </button>

          <button
            onClick={() => { setActiveCategory('overview'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeCategory === 'overview'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Tổng quan</span>
          </button>
        </div>

        {/* Search input */}
        {activeCategory !== 'overview' && (
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {activeCategory === 'students' && (
              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
              >
                <option value="all">Tất cả các lớp</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            {activeCategory === 'accounts' && (
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="teacher">Giáo viên</option>
                <option value="student">Học sinh</option>
                <option value="admin">Quản trị viên</option>
              </select>
            )}

            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* CATEGORY 1: QUẢN LÝ LỚP HỌC */}
      {activeCategory === 'classes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map(cls => {
              const classStudentCount = students.filter(s => s.classId === cls.id).length;

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                        Khối {cls.grade}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        Năm học {cls.academicYear}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900">
                      {cls.name}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Chủ nhiệm:</span>
                        <strong className="text-slate-800">{cls.teacherName || 'Chưa phân công'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Sĩ số học sinh:</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                          {classStudentCount} học sinh
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setActiveCategory('students');
                        setSelectedClassFilter(cls.id);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1"
                    >
                      <span>Xem học sinh lớp</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmTarget({ type: 'class', id: cls.id, name: `Lớp học "${cls.name}" (Khối ${cls.grade})` });
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Xóa lớp học"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CATEGORY 2: QUẢN LÝ GIÁO VIÊN */}
      {activeCategory === 'teachers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">
              Danh sách giáo viên nhà trường ({filteredTeachers.length} thầy/cô)
            </h3>
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Thêm giáo viên</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Giáo viên</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Bộ môn chuyên trách</th>
                  <th className="py-3 px-4 text-center">Nhiệm vụ chủ nhiệm</th>
                  <th className="py-3 px-4 text-center">Mật khẩu</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={teacher.avatar}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{teacher.name}</span>
                          <span className="text-[10px] text-slate-400">ID: {teacher.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {teacher.email}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {teacher.subjectSpecialty || 'Toán học & Tự nhiên'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {teacher.className || 'Không chủ nhiệm'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold border border-slate-200">
                          {teacher.password || '123456'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setResetTargetUser(teacher)}
                          className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200 flex items-center space-x-1"
                          title="Reset hoặc cấp lại mật khẩu"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Reset MK</span>
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmTarget({ type: 'user', id: teacher.id, name: `Giáo viên "${teacher.name}" (${teacher.email})` });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Xóa giáo viên"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATEGORY 3: QUẢN LÝ HỌC SINH */}
      {activeCategory === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">
              Danh sách học sinh ({filteredStudents.length} em)
            </h3>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Thêm học sinh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Học sinh</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Lớp</th>
                  <th className="py-3 px-4 text-center">Mật khẩu</th>
                  <th className="py-3 px-4 text-center">Chuỗi học</th>
                  <th className="py-3 px-4 text-center">Điểm thi đua</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.avatar}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{student.name}</span>
                          <span className="text-[10px] text-slate-400">ID: {student.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {student.email}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {student.className}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold border border-slate-200">
                          {student.password || '123456'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setResetTargetUser(student)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center space-x-1"
                          title="Reset hoặc cấp lại mật khẩu"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Reset MK</span>
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-orange-600">
                      🔥 {student.streakDays} ngày
                    </td>

                    <td className="py-3.5 px-4 text-center font-black text-slate-900">
                      {student.totalPoints.toLocaleString()} đ
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmTarget({ type: 'user', id: student.id, name: `Học sinh "${student.name}" (${student.email})` });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Xóa học sinh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATEGORY: CẤP & QUẢN TRỊ TÀI KHOẢN & MẬT KHẨU */}
      {activeCategory === 'accounts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Trung Tâm Cấp & Quản Trị Mật Khẩu (Admin Authority)</span>
              </div>
              <h3 className="text-base font-black text-slate-900">
                Danh Sách Tài Khoản & Mật Khẩu Toàn Trường ({users.length} tài khoản)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin có quyền cấp tài khoản, thiết lập mật khẩu ban đầu và reset/cấp lại ngay lập tức khi giáo viên hoặc học sinh quên mật khẩu.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Cấp GV Mới</span>
              </button>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Cấp HS Mới</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Người dùng</th>
                    <th className="py-3 px-4">Tài khoản / Email</th>
                    <th className="py-3 px-4 text-center">Vai trò</th>
                    <th className="py-3 px-4 text-center">Đơn vị / Lớp</th>
                    <th className="py-3 px-4 text-center">Mật khẩu hiện tại</th>
                    <th className="py-3 px-4 text-right">Thao tác cấp lại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users
                    .filter(u => {
                      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
                      return matchesSearch && matchesRole;
                    })
                    .map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <img src={u.avatar} alt="" className="w-8 h-8 rounded-xl object-cover border border-slate-200" />
                            <div>
                              <span className="font-bold text-slate-900 block">{u.name}</span>
                              <span className="text-[10px] text-slate-400">ID: {u.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {u.email}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            u.role === 'teacher' ? 'bg-indigo-100 text-indigo-700' :
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {u.role === 'teacher' ? 'Giáo viên' : u.role === 'admin' ? 'Quản trị' : 'Học sinh'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-600">
                          {u.className || u.classId || 'Ban Giám Hiệu'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono bg-purple-50 text-purple-900 px-2 py-0.5 rounded text-[11px] font-bold border border-purple-200">
                            {u.password || '123456'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => setResetTargetUser(u)}
                              className="px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 inline-flex items-center space-x-1 transition-all"
                              title="Reset hoặc cấp mật khẩu mới"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Cấp lại mật khẩu</span>
                            </button>
                            {u.role !== 'admin' && (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmTarget({ type: 'user', id: u.id, name: `Tài khoản ${u.name} (${u.email})` })}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 4: TỔNG QUAN HỆ THỐNG */}
      {activeCategory === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Tổng số lớp học</span>
              <div className="text-3xl font-black text-blue-600 mt-2">{classes.length} lớp</div>
              <span className="text-[11px] text-slate-500 block mt-1">Từ Khối 6 đến Khối 12</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Tổng số giáo viên</span>
              <div className="text-3xl font-black text-indigo-600 mt-2">{teachers.length} thầy/cô</div>
              <span className="text-[11px] text-slate-500 block mt-1">Phụ trách chuyên môn</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Tổng số học sinh</span>
              <div className="text-3xl font-black text-emerald-600 mt-2">{students.length} em</div>
              <span className="text-[11px] text-slate-500 block mt-1">Đã cấp tài khoản thi</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Đơn vị trường học</span>
              <div className="text-sm font-black text-slate-900 mt-3 truncate">{currentAdmin.schoolName}</div>
              <span className="text-[11px] text-emerald-600 font-bold block mt-1">Đang hoạt động online</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TẠO LỚP HỌC MỚI */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">Tạo Lớp Học Mới</h3>
              </div>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên lớp học:</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="Ví dụ: Lớp 10A3, Lớp 11B2..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Khối lớp:</label>
                <select
                  value={newClassGrade}
                  onChange={e => setNewClassGrade(Number(e.target.value) as Grade)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  <option value={6}>Khối 6 (THCS)</option>
                  <option value={7}>Khối 7 (THCS)</option>
                  <option value={8}>Khối 8 (THCS)</option>
                  <option value={9}>Khối 9 (THCS)</option>
                  <option value={10}>Khối 10 (THPT)</option>
                  <option value={11}>Khối 11 (THPT)</option>
                  <option value={12}>Khối 12 (THPT)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giáo viên chủ nhiệm:</label>
                <select
                  value={newClassTeacherId}
                  onChange={e => setNewClassTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value="">-- Chưa phân công / Chọn sau --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subjectSpecialty || 'Bộ môn'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Niên khóa / Năm học:</label>
                <input
                  type="text"
                  value={newClassAcademicYear}
                  onChange={e => setNewClassAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  Tạo lớp ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: THÊM GIÁO VIÊN MỚI */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">Tạo Tài Khoản Giáo Viên</h3>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên thầy/cô:</label>
                <input
                  type="text"
                  required
                  value={newTeacherName}
                  onChange={e => setNewTeacherName(e.target.value)}
                  placeholder="Ví dụ: Thầy Nguyễn Hữu Trí"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email giảng dạy:</label>
                <input
                  type="email"
                  required
                  value={newTeacherEmail}
                  onChange={e => setNewTeacherEmail(e.target.value)}
                  placeholder="tri.nguyen@edudaily.edu.vn"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Mật khẩu cấp ban đầu:</label>
                  <button
                    type="button"
                    onClick={() => {
                      const rnd = 'Edu@' + Math.floor(1000 + Math.random() * 9000);
                      setNewTeacherPassword(rnd);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Tạo ngẫu nhiên
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newTeacherPassword}
                    onChange={e => setNewTeacherPassword(e.target.value)}
                    placeholder="Mặc định: 123456"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bộ môn phụ trách:</label>
                <select
                  value={newTeacherSubject}
                  onChange={e => setNewTeacherSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  <option value="Toán học">Toán học</option>
                  <option value="Ngữ văn">Ngữ văn</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="KHTN / Vật lý">KHTN / Vật lý</option>
                  <option value="Hóa học">Hóa học</option>
                  <option value="Sinh học">Sinh học</option>
                  <option value="Lịch sử & Địa lý">Lịch sử & Địa lý</option>
                  <option value="Tin học">Tin học</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phân công chủ nhiệm lớp (Tùy chọn):</label>
                <select
                  value={newTeacherHomeroomClass}
                  onChange={e => setNewTeacherHomeroomClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value="">-- Không làm chủ nhiệm --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20"
                >
                  Cấp tài khoản giáo viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: THÊM HỌC SINH MỚI */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">Cấp Tài Khoản Học Sinh Mới</h3>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên học sinh:</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Ví dụ: Em Đỗ Quỳnh Nga"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email học sinh:</label>
                <input
                  type="email"
                  required
                  value={newStudentEmail}
                  onChange={e => setNewStudentEmail(e.target.value)}
                  placeholder="nga.do@edudaily.edu.vn"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Mật khẩu cấp ban đầu:</label>
                  <button
                    type="button"
                    onClick={() => {
                      const rnd = 'Edu@' + Math.floor(1000 + Math.random() * 9000);
                      setNewStudentPassword(rnd);
                    }}
                    className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Tạo ngẫu nhiên
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newStudentPassword}
                    onChange={e => setNewStudentPassword(e.target.value)}
                    placeholder="Mặc định: 123456"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phân vào lớp học:</label>
                <select
                  value={newStudentClassId}
                  onChange={e => setNewStudentClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Khối {c.grade})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-500/20"
                >
                  Cấp tài khoản học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP: CẤP THẺ TÀI KHOẢN MỚI THÀNH CÔNG */}
      {createdCredentialCard && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-scaleIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Cấp Tài Khoản Thành Công!</h3>
                  <span className="text-[11px] text-slate-500">Thông tin đăng nhập đã được lưu trữ</span>
                </div>
              </div>
              <button
                onClick={() => setCreatedCredentialCard(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Họ và tên:</span>
                <strong className="text-slate-900 font-sans">{createdCredentialCard.user.name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vai trò:</span>
                <span className="font-bold text-indigo-700 uppercase">
                  {createdCredentialCard.user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tài khoản / Email:</span>
                <strong className="text-slate-900">{createdCredentialCard.user.email}</strong>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Mật khẩu cấp:</span>
                <span className="text-emerald-700 font-black bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  {createdCredentialCard.password}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Người dùng có thể đăng nhập ngay với thông tin trên và đổi mật khẩu bất kỳ lúc nào tại giao diện cá nhân.
            </p>

            <button
              type="button"
              onClick={() => {
                const text = `THÔNG TIN TÀI KHOẢN EDỦDAILY:\n- Người dùng: ${createdCredentialCard.user.name}\n- Vai trò: ${
                  createdCredentialCard.user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'
                }\n- Tài khoản: ${createdCredentialCard.user.email}\n- Mật khẩu: ${createdCredentialCard.password}\n- Đăng nhập tại ứng dụng EduDaily`;
                navigator.clipboard.writeText(text);
                setCredentialCopied(true);
                setTimeout(() => setCredentialCopied(false), 2000);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              {credentialCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{credentialCopied ? 'Đã sao chép vào bộ nhớ tạm!' : 'Sao chép thông tin gửi người dùng'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCreatedCredentialCard(null)}
              className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}

      {/* MODAL RESET MẬT KHẨU CHO USER BẤT KỲ */}
      {resetTargetUser && (
        <AdminResetPasswordModal
          isOpen={true}
          targetUser={resetTargetUser}
          onClose={() => setResetTargetUser(null)}
          onResetPassword={(userId, newPassword) => {
            if (onResetUserPassword) {
              onResetUserPassword(userId, newPassword);
            }
          }}
        />
      )}

      {/* MODAL TẠO HÀNG LOẠT HS VÀ GIÁO VIÊN TỪ DANH SÁCH EXCEL / SHEETS */}
      {showBatchModal && (
        <BatchUserImportModal
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          classes={classes}
          existingUsers={users}
          onBatchCreate={(newUsers) => {
            if (onBatchAddUsers) {
              onBatchAddUsers(newUsers);
            } else {
              newUsers.forEach(u => onAddUser(u));
            }
          }}
        />
      )}

      {/* MODAL XÁC NHẬN XÓA USER HOẶC CLASS (KHÔNG DÙNG WINDOW.CONFIRM) */}
      {deleteConfirmTarget && (
        <ConfirmDeleteModal
          isOpen={true}
          title={deleteConfirmTarget.type === 'class' ? 'Xác nhận xóa lớp học' : 'Xác nhận xóa tài khoản'}
          message={
            deleteConfirmTarget.type === 'class'
              ? 'Lớp học này sẽ bị xóa khỏi hệ thống và cơ sở dữ liệu đám mây Firebase. Dữ liệu sau khi xóa sẽ không thể phục hồi.'
              : 'Tài khoản người dùng này sẽ bị xóa vĩnh viễn khỏi danh sách và cơ sở dữ liệu Firebase.'
          }
          itemName={deleteConfirmTarget.name}
          onCancel={() => setDeleteConfirmTarget(null)}
          onConfirm={() => {
            if (deleteConfirmTarget.type === 'class') {
              onDeleteClass(deleteConfirmTarget.id);
            } else {
              onDeleteUser(deleteConfirmTarget.id);
            }
            setDeleteConfirmTarget(null);
          }}
        />
      )}

      {/* MODAL XÁC NHẬN XÓA SẠCH DỮ LIỆU DEMO MẪU */}
      {showWipeDemoConfirm && (
        <ConfirmDeleteModal
          isOpen={true}
          title="Xác nhận xóa sạch toàn bộ dữ liệu demo mẫu?"
          message="Hệ thống sẽ xóa toàn bộ các tài khoản học sinh và giáo viên mẫu, các lớp học demo, đề thi và lịch sử làm bài mẫu ban đầu trên cả trình duyệt và cơ sở dữ liệu Firebase Firestore. Chỉ duy nhất tài khoản Quản trị viên (Ngô Thanh Hùng - pqhacker@gmail.com) được giữ lại."
          itemName="Toàn bộ tài khoản và lớp học demo (s-01 đến s-06, t-01, t-02, 10A1, 10A2...)"
          onCancel={() => setShowWipeDemoConfirm(false)}
          onConfirm={() => {
            setShowWipeDemoConfirm(false);
            if (onWipeDemoData) {
              onWipeDemoData();
            }
          }}
        />
      )}
    </div>
  );
};
