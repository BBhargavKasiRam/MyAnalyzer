import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  CheckCircle,
  Crown,
  Award,
  Medal,
  ArrowRight,
  Zap,
  TrendingUp,
  Sparkles,
  Calendar,
  Layers,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { getLeaderboard } from '../api';
import PlatformBadge from './PlatformBadge';

export default function Leaderboard({ users = [], activeUser, onSelectUser }) {
  const [period, setPeriod] = useState('week'); // 'day' | 'week' | 'month' | 'all'
  const [sortBy, setSortBy] = useState('points'); // 'points' | 'problems' | 'streak'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard({ period, sortBy });
      setLeaderboardData(data.leaderboard || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [period, sortBy, users.length]);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-sm shadow-md shadow-amber-500/20">
          <Crown className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center justify-center font-bold text-sm">
          <Medal className="w-4 h-4 text-slate-300" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center font-bold text-sm">
          <Award className="w-4 h-4 text-amber-600" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs font-mono">
        #{rank}
      </div>
    );
  };

  // Find active user's current ranking status
  const myRankEntry = activeUser
    ? leaderboardData.find(u => u._id === activeUser._id)
    : null;

  const periodLabel =
    period === 'day' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All-Time';

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Competitive CP Leaderboard</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Live standings ranked by competitive programming points earned across Codeforces, LeetCode, and CodeChef
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            {[
              { id: 'day', label: '⚡ Daily (Today)' },
              { id: 'week', label: '📅 Weekly' },
              { id: 'month', label: '🗓️ Monthly' },
              { id: 'all', label: '🏆 All-Time' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  period === tab.id
                    ? 'bg-emerald-500 text-black font-semibold shadow-sm shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Metric Filter: Points vs Problems vs Streak */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Rank by:</span>
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setSortBy('points')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  sortBy === 'points'
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Points Earned</span>
              </button>
              <button
                onClick={() => setSortBy('problems')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  sortBy === 'problems'
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                <span>Questions Solved</span>
              </button>
              <button
                onClick={() => setSortBy('streak')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  sortBy === 'streak'
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Active Streak</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>Easy = 10-15 pts</span>
            <span>•</span>
            <span>Med = 25-35 pts</span>
            <span>•</span>
            <span>Hard = 50-80 pts</span>
          </div>
        </div>
      </div>

      {/* Ranking System: Active User Ranking Spotlight Card */}
      {myRankEntry && (
        <div className="bg-gradient-to-r from-emerald-500/15 via-slate-900/90 to-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-extrabold text-xl font-mono shadow-lg shadow-emerald-500/20">
              #{myRankEntry.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                  Your Current {periodLabel} Rank
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  You ({myRankEntry.username})
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-3 mt-0.5">
                <span className="font-mono text-emerald-300 font-extrabold">
                  {myRankEntry.periodPoints} pts
                </span>
                <span className="text-xs font-normal text-slate-400">
                  ({myRankEntry.periodProblemCount} {myRankEntry.periodProblemCount === 1 ? 'problem' : 'problems'} solved)
                </span>
              </h3>
            </div>
          </div>

          {/* Ranking Gap Insight */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 self-start sm:self-auto">
            {myRankEntry.rank === 1 ? (
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>
                  {myRankEntry.leadOverNext > 0
                    ? `Leading the pack by +${myRankEntry.leadOverNext} pts ahead of #2!`
                    : 'Currently tied for #1 spot!'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>
                  <strong>{myRankEntry.behindLeader} pts</strong> behind leader (#1) •{' '}
                  <strong className="text-emerald-400">{myRankEntry.behindNext} pts</strong> needed to reach #{myRankEntry.rank - 1}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Cards List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-400 bg-[#0f172a]/90 border border-slate-800 rounded-2xl">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-emerald-400" />
            <p className="text-xs">Computing {periodLabel.toLowerCase()} rankings & points...</p>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-[#0f172a]/90 border border-slate-800 rounded-2xl">
            No rankings available. Register friends to start the competition!
          </div>
        ) : (
          leaderboardData.map((u) => {
            const isMe = activeUser && u._id === activeUser._id;
            const b = u.breakdown || {};
            const pb = u.platformBreakdown || {};

            return (
              <div
                key={u._id}
                className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isMe
                    ? 'bg-slate-900/90 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : u.rank === 1
                    ? 'bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-slate-900/60 border-amber-500/30'
                    : 'bg-[#0f172a]/90 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Left: Rank, Avatar & Handles */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {getRankBadge(u.rank)}

                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-base border ${
                    isMe
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-white border-slate-700'
                  }`}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-sm truncate">
                        {u.username}
                      </h3>
                      {isMe && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          You
                        </span>
                      )}
                      {u.rank === 1 && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Leader 👑
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                      {u.handles?.codeforces && <span className="text-blue-400 font-mono">CF: @{u.handles.codeforces}</span>}
                      {u.handles?.leetcode && <span className="text-amber-400 font-mono">LC: @{u.handles.leetcode}</span>}
                      {u.handles?.codechef && <span className="text-purple-400 font-mono">CC: @{u.handles.codechef}</span>}
                    </div>
                  </div>
                </div>

                {/* Center / Right: Points, Questions, Tiers & Controls */}
                <div className="flex items-center justify-between lg:justify-end gap-6 flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                  {/* Points Badge */}
                  <div className="text-left sm:text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      {periodLabel} Points
                    </span>
                    <span className="inline-flex items-center gap-1 text-base font-extrabold font-mono text-amber-400">
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                      {u.periodPoints} pts
                    </span>
                  </div>

                  {/* Questions Solved */}
                  <div className="text-left sm:text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Problems
                    </span>
                    <span className="text-base font-extrabold font-mono text-white">
                      {u.periodProblemCount}
                    </span>
                  </div>

                  {/* Difficulty Distribution Pills */}
                  <div className="hidden md:flex items-center gap-1.5 text-[10px] font-medium">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Easy problems count">
                      E: {b.easy?.count || 0}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Medium problems count">
                      M: {b.medium?.count || 0}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20" title="Hard problems count">
                      H: {b.hard?.count || 0}
                    </span>
                  </div>

                  {/* Active Streak */}
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold flex items-center justify-end gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>Streak</span>
                    </span>
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      {u.currentStreak}d
                    </span>
                  </div>

                  {/* View Details Action */}
                  <button
                    onClick={() => onSelectUser(u)}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-black text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
                    title="View user heatmap and statistics"
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
