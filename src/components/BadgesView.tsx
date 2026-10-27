import React from 'react';
import { User, Badge } from '../types';
import { BADGES } from '../data/initialData';
import { Trophy, Award, Lock, Sparkles, Flame, CheckCircle2 } from 'lucide-react';

interface BadgesViewProps {
  currentUser: User;
}

export const BadgesView: React.FC<BadgesViewProps> = ({ currentUser }) => {
  const earnedCodes = new Set(currentUser.badgesEarned || []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          Hệ Thống Huy Hiệu & Động Lực Học Tập
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Hoàn thành các mục tiêu thử thách trắc nghiệm mỗi ngày để nhận huy hiệu vinh danh!
        </p>
      </div>

      {/* Summary Card */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
            <Trophy className="w-4 h-4" />
            <span>Thành tích của bạn</span>
          </span>
          <h3 className="text-2xl font-black">
            Đã đạt {earnedCodes.size} / {BADGES.length} huy hiệu
          </h3>
          <p className="text-xs text-white/80 mt-1 max-w-md">
            Mỗi huy hiệu là một minh chứng cho tinh thần kiên trì và tự giác ôn luyện kiến thức của bạn.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-xs text-center min-w-[90px]">
            <Flame className="w-6 h-6 text-yellow-300 mx-auto fill-yellow-300 animate-pulse" />
            <span className="text-xs font-bold block mt-1">Chuỗi ngày</span>
            <strong className="text-lg font-black">{currentUser.streakDays} ngày</strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-xs text-center min-w-[90px]">
            <Sparkles className="w-6 h-6 text-amber-200 mx-auto" />
            <span className="text-xs font-bold block mt-1">Tổng điểm</span>
            <strong className="text-lg font-black">{currentUser.totalPoints} đ</strong>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BADGES.map((badge) => {
          const isEarned = earnedCodes.has(badge.code);

          return (
            <div
              key={badge.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isEarned
                  ? 'bg-white border-amber-200 shadow-sm ring-1 ring-amber-400/20'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs ${
                    isEarned
                      ? `bg-gradient-to-tr ${badge.gradient} text-white`
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isEarned ? '🏆' : <Lock className="w-5 h-5 text-slate-400" />}
                  </div>

                  {isEarned ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Đã đạt được
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Chưa mở khóa
                    </span>
                  )}
                </div>

                <h4 className="text-base font-black text-slate-900">
                  {badge.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px]">
                <span className="text-slate-400 font-semibold block">Điều kiện mở khóa:</span>
                <span className="text-slate-700 font-bold mt-0.5 block">
                  {badge.requirement}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
