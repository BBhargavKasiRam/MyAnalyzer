import React, { useState } from 'react';
import { Trophy, Flame, CheckCircle, Crown, Award, Medal, ArrowRight, ExternalLink } from 'lucide-react';
import PlatformBadge from './PlatformBadge';

export default function Leaderboard({ users = [], onSelectUser }) {
  const [sortBy, setSortBy] = useState('totalSolved');

  const sortedUsers = [...users].sort((a, b) => {
    const valA = a.stats?.[sortBy] || 0;
    const valB = b.stats?.[sortBy] || 0;
    return valB - valA;
  });

  const getRankBadge = (rank) => {
    if (rank === 0) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-sm shadow-md shadow-amber-500/20">
          <Crown className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-xl bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center justify-center font-bold text-sm">
          <Medal className="w-4 h-4 text-slate-300" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center font-bold text-sm">
          <Award className="w-4 h-4 text-amber-600" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs font-mono">
        #{rank + 1}
      </div>
    );
  };

  return (
    <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header and Sorting Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Friends Leaderboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare competitive programming consistency and problem counts with friends
          </p>
        </div>

        {/* Sort criteria */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setSortBy('totalSolved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              sortBy === 'totalSolved'
                ? 'bg-amber-500 text-black font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Total Solved
          </button>
          <button
            onClick={() => setSortBy('currentStreak')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              sortBy === 'currentStreak'
                ? 'bg-amber-500 text-black font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Current Streak
          </button>
          <button
            onClick={() => setSortBy('longestStreak')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              sortBy === 'longestStreak'
                ? 'bg-amber-500 text-black font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Longest Streak
          </button>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="space-y-3">
        {sortedUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            No friends registered yet. Click "Add Friend" to get started!
          </div>
        ) : (
          sortedUsers.map((u, rank) => {
            const stats = u.stats || {};
            const handles = u.handles || {};

            return (
              <div
                key={u._id}
                className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  rank === 0
                    ? 'bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-slate-900/60 border-amber-500/30'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* User & Rank Info */}
                <div className="flex items-center gap-3.5">
                  {getRankBadge(rank)}

                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-base">
                    {u.username.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{u.username}</span>
                      {rank === 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Leader 👑
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                      {handles.codeforces && (
                        <span className="text-blue-400">CF: @{handles.codeforces}</span>
                      )}
                      {handles.leetcode && (
                        <span className="text-amber-400">LC: @{handles.leetcode}</span>
                      )}
                      {handles.codechef && (
                        <span className="text-purple-400">CC: @{handles.codechef}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Stats */}
                <div className="flex items-center gap-6 self-start md:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Total Solved
                    </span>
                    <span className="text-lg font-bold text-white font-mono">
                      {stats.totalSolved || 0}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold flex items-center justify-end gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>Streak</span>
                    </span>
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      {stats.currentStreak || 0}d
                    </span>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Best Streak
                    </span>
                    <span className="text-lg font-bold text-cyan-400 font-mono">
                      {stats.longestStreak || 0}d
                    </span>
                  </div>

                  {/* View Details Action */}
                  <button
                    onClick={() => onSelectUser(u)}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-black text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
                    title="View user heatmap"
                  >
                    <span className="hidden sm:inline">View Heatmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
