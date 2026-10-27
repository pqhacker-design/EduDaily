import React, { useState } from 'react';
import { User, QuizAttempt, ClassInfo } from '../types';
import { calculateClassLeaderboard } from '../utils/rules';
import { BADGES, INITIAL_CLASSES } from '../data/initialData';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Award,
  Users,
  Search,
  CheckCircle2
} from 'lucide-react';

interface ClassLeaderboardProps {
  currentUser: User;
  allUsers: User[];
  attempts: QuizAttempt[];
  classes?: ClassInfo[];
}

export const ClassLeaderboard: React.FC<ClassLeaderboardProps> = ({
  currentUser,
  allUsers,
  attempts,
  classes = INITIAL_CLASSES
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(currentUser.classId || '10A1');
  const [searchTerm, setSearchTerm] = useState('');

  const leaderboard = calculateClassLeaderboard(selectedClassId, allUsers, attempts);
  const currentRankInfo = leaderboard.find(item => item.user.id === currentUser.id);

  const filteredLeaderboard = leaderboard.filter(item => 
    item.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Class Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Bảng Xếp Hạng & Thi Đua Học Tập
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            So sánh kết quả, thi đua cùng các bạn trong lớp và kích thích tinh thần tự học mỗi ngày.
          </p>
        </div>

        {/* Class switcher buttons */}
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

      {/* Current User's Standing Card (If in this class) */}
      {currentRankInfo && (
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/50"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-black text-[10px] flex items-center justify-center shadow-xs">
                #{currentRankInfo.rank}
              </span>
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-200 flex items-center gap-1">
                <span>Vị trí của bạn trong lớp</span>
                <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px] font-bold">
                  {currentUser.className}
                </span>
              </div>
              <h3 className="text-base font-black">
                {currentUser.name} — Hạng #{currentRankInfo.rank} trên {leaderboard.length} học sinh
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="text-center px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-blue-200 block text-[10px]">Điểm thi đua</span>
              <strong className="text-sm font-black">{currentUser.totalPoints} đ</strong>
            </div>
            <div className="text-center px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-blue-200 block text-[10px]">Điểm TB kiểm tra</span>
              <strong className="text-sm font-black">{currentRankInfo.averageScore}/10</strong>
            </div>
            <div className="text-center px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-blue-200 block text-[10px]">Chuỗi học</span>
              <strong className="text-sm font-black text-amber-300">🔥 {currentUser.streakDays} ngày</strong>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium (Gold, Silver, Bronze) */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 pb-2 items-end max-w-2xl mx-auto">
          {/* Top 2 - Silver */}
          {top2 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <img
                  src={top2.user.avatar}
                  alt={top2.user.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-4 border-slate-300 shadow-md"
                />
                <div className="absolute -top-2.5 -right-2 w-6 h-6 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-black text-xs shadow-xs">
                  2
                </div>
              </div>
              <p className="text-xs font-black text-slate-900 text-center truncate max-w-[90px] sm:max-w-[120px]">
                {top2.user.name}
              </p>
              <span className="text-[11px] font-bold text-slate-500">
                {top2.user.totalPoints} đ
              </span>
              <div className="w-full mt-2 h-20 rounded-t-2xl bg-gradient-to-t from-slate-200 to-slate-100 flex flex-col items-center justify-center border-t border-x border-slate-300">
                <Medal className="w-6 h-6 text-slate-500" />
                <span className="text-[10px] font-black uppercase text-slate-600 mt-1">Hạng Nhì</span>
              </div>
            </div>
          )}

          {/* Top 1 - Gold Champion */}
          {top1 && (
            <div className="flex flex-col items-center -mt-4">
              <div className="relative mb-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <Crown className="w-7 h-7 text-amber-400 fill-amber-400 animate-bounce" />
                </div>
                <img
                  src={top1.user.avatar}
                  alt={top1.user.name}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-amber-400 shadow-xl"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs shadow-md">
                  1
                </div>
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-900 text-center truncate max-w-[100px] sm:max-w-[140px]">
                {top1.user.name}
              </p>
              <span className="text-xs font-black text-amber-600">
                {top1.user.totalPoints} đ
              </span>
              <div className="w-full mt-2 h-28 rounded-t-2xl bg-gradient-to-t from-amber-200 via-amber-100 to-amber-50 flex flex-col items-center justify-center border-t border-x border-amber-300 shadow-sm">
                <Trophy className="w-8 h-8 text-amber-500" />
                <span className="text-[11px] font-black uppercase text-amber-800 mt-1">Quán Quân</span>
              </div>
            </div>
          )}

          {/* Top 3 - Bronze */}
          {top3 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <img
                  src={top3.user.avatar}
                  alt={top3.user.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-4 border-amber-700/40 shadow-md"
                />
                <div className="absolute -top-2.5 -right-2 w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  3
                </div>
              </div>
              <p className="text-xs font-black text-slate-900 text-center truncate max-w-[90px] sm:max-w-[120px]">
                {top3.user.name}
              </p>
              <span className="text-[11px] font-bold text-slate-500">
                {top3.user.totalPoints} đ
              </span>
              <div className="w-full mt-2 h-16 rounded-t-2xl bg-gradient-to-t from-amber-100/60 to-orange-50 flex flex-col items-center justify-center border-t border-x border-amber-200">
                <Medal className="w-5 h-5 text-amber-700" />
                <span className="text-[10px] font-black uppercase text-amber-800 mt-1">Hạng Ba</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Class Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-black text-slate-900">
              Danh sách chi tiết lớp {selectedClassId} ({filteredLeaderboard.length} học sinh)
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Hạng</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4 text-center">Chuỗi học</th>
                <th className="py-3 px-4 text-center">Điểm TB</th>
                <th className="py-3 px-4 text-center">Bài đã làm</th>
                <th className="py-3 px-4 text-center">Huy hiệu</th>
                <th className="py-3 px-4 text-right">Tổng điểm thi đua</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeaderboard.map((item) => {
                const isMe = item.user.id === currentUser.id;
                
                return (
                  <tr
                    key={item.user.id}
                    className={`transition-colors ${
                      isMe ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${
                        item.rank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : item.rank === 2
                          ? 'bg-slate-200 text-slate-800'
                          : item.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'text-slate-500'
                      }`}>
                        {item.rank}
                      </span>
                    </td>

                    {/* Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.user.avatar}
                          alt=""
                          className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{item.user.name}</span>
                            {isMe && (
                              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-200 text-blue-800">
                                Bạn
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{item.user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-orange-600">
                        <Flame className="w-3.5 h-3.5 fill-orange-500" />
                        {item.user.streakDays} ngày
                      </span>
                    </td>

                    {/* Average Score */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800">
                        {item.averageScore > 0 ? `${item.averageScore}/10` : '—'}
                      </span>
                    </td>

                    {/* Tests completed */}
                    <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                      {item.testsCompleted} bài
                    </td>

                    {/* Badges preview */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center space-x-1">
                        {(item.user.badgesEarned || []).slice(0, 3).map((code) => {
                          const badge = BADGES.find(b => b.code === code);
                          return (
                            <span
                              key={code}
                              title={badge?.title || code}
                              className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]"
                            >
                              🏆
                            </span>
                          );
                        })}
                        {(item.user.badgesEarned || []).length > 3 && (
                          <span className="text-[10px] text-slate-400 font-bold">
                            +{(item.user.badgesEarned || []).length - 3}
                          </span>
                        )}
                        {(item.user.badgesEarned || []).length === 0 && (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </div>
                    </td>

                    {/* Points */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-black text-slate-900 text-sm">
                        {item.user.totalPoints.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">điểm</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
