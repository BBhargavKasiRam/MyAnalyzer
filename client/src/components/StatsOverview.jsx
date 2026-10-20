import React, { useState } from 'react';
import { Flame, Trophy, CheckCircle, RefreshCw, ExternalLink, Zap, Clock, ShieldAlert } from 'lucide-react';

export default function StatsOverview({ user, onSync, isSyncing, syncError }) {
  const [forceSync, setForceSync] = useState(false);

  if (!user) return null;

  const stats = user.stats || {};
  const handles = user.handles || {};

  const total = stats.totalSolved || 0;
  const cfSolved = stats.codeforcesSolved || 0;
  const lcSolved = stats.leetcodeSolved || 0;
  const ccSolved = stats.codechefSolved || 0;

  // Percentage calculations
  const cfPct = total > 0 ? Math.round((cfSolved / total) * 100) : 0;
  const lcPct = total > 0 ? Math.round((lcSolved / total) * 100) : 0;
  const ccPct = total > 0 ? Math.round((ccSolved / total) * 100) : 0;

  // Last synced format
  const formattedLastSynced = stats.lastSyncedAt
    ? new Date(stats.lastSyncedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Never';

  return (
    <div className="space-y-4">
      {/* Top Banner: User quick info & Live Sync Bar */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-emerald-500/20">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{user.username}</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Member
              </span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Last synced: {formattedLastSynced}</span>
            </p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <button
            onClick={() => onSync(true)}
            disabled={isSyncing}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 transition shadow-md ${
              isSyncing
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20 font-semibold cursor-pointer'
            }`}
            title="Fetch live updates from Codeforces, LeetCode, and CodeChef immediately"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isSyncing ? 'Fetching Latest Problems...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {syncError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold">Sync Notice:</span> {syncError}
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Points */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Points</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {stats.totalPoints || 0}
          </div>
          <p className="text-xs text-slate-400 mt-2">Weighted by problem difficulty</p>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Total Solved */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Solved</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{total}</div>
          <p className="text-xs text-slate-400 mt-2">Unique problems across 3 platforms</p>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Current Streak */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Streak</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{stats.currentStreak || 0}</span>
            <span className="text-xs font-medium text-amber-400">days</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {(stats.currentStreak || 0) > 0 ? '🔥 Streak active!' : 'Solve a problem today to ignite!'}
          </p>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Longest Streak */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Longest Streak</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{stats.longestStreak || 0}</span>
            <span className="text-xs font-medium text-cyan-400">days</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">All-time highest consecutive days</p>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>
      </div>

      {/* Platform Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Codeforces */}
        <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-4 hover:border-blue-500/30 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h3 className="font-semibold text-white text-sm">Codeforces</h3>
            </div>
            {handles.codeforces ? (
              <a
                href={`https://codeforces.com/profile/${handles.codeforces}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
              >
                <span>@{handles.codeforces}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-xs text-slate-500 italic">Not connected</span>
            )}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{cfSolved}</span>
            <span className="text-xs font-medium text-blue-400 font-mono">{cfPct}% of total</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${cfPct}%` }}></div>
          </div>
        </div>

        {/* LeetCode */}
        <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-4 hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="font-semibold text-white text-sm">LeetCode</h3>
            </div>
            {handles.leetcode ? (
              <a
                href={`https://leetcode.com/${handles.leetcode}/`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
              >
                <span>@{handles.leetcode}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-xs text-slate-500 italic">Not connected</span>
            )}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{lcSolved}</span>
            <span className="text-xs font-medium text-amber-400 font-mono">{lcPct}% of total</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${lcPct}%` }}></div>
          </div>
        </div>

        {/* CodeChef */}
        <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-4 hover:border-purple-500/30 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <h3 className="font-semibold text-white text-sm">CodeChef</h3>
            </div>
            {handles.codechef ? (
              <a
                href={`https://www.codechef.com/users/${handles.codechef}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono"
              >
                <span>@{handles.codechef}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-xs text-slate-500 italic">Not connected</span>
            )}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{ccSolved}</span>
            <span className="text-xs font-medium text-purple-400 font-mono">{ccPct}% of total</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${ccPct}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
