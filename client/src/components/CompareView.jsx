import React, { useState, useEffect, useMemo } from 'react';
import {
  Users2,
  Calendar,
  Flame,
  Trophy,
  Zap,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Crown,
  Medal,
  Award,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { getComparisonData, getUserHeatmap, syncAllUsers } from '../api';
import PlatformBadge from './PlatformBadge';
import Heatmap from './Heatmap';

export default function CompareView({ users = [], onUserUpdated }) {
  const [period, setPeriod] = useState('week'); // 'day' | 'week' | 'month' | 'all'
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);

  // 1v1 Heatmap comparison state
  const [userAId, setUserAId] = useState('');
  const [userBId, setUserBId] = useState('');
  const [heatmapA, setHeatmapA] = useState([]);
  const [heatmapB, setHeatmapB] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  // Colors for users in charts
  const userColors = [
    { border: 'border-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-400', fill: '#10b981' },
    { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-400', fill: '#06b6d4' },
    { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-400', fill: '#f59e0b' },
    { border: 'border-purple-500', bg: 'bg-purple-500', text: 'text-purple-400', fill: '#a855f7' },
    { border: 'border-rose-500', bg: 'bg-rose-500', text: 'text-rose-400', fill: '#f43f5e' }
  ];

  const fetchComparison = async (isManualSync = false) => {
    setLoading(true);
    try {
      if (isManualSync) {
        setIsSyncingAll(true);
        await syncAllUsers();
        if (onUserUpdated) onUserUpdated();
      }
      const data = await getComparisonData(period);
      setComparisonData(data);
    } catch (err) {
      console.error('Error fetching comparison data:', err);
    } finally {
      setLoading(false);
      setIsSyncingAll(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [period, users.length]);

  // Set default users for 1v1 heatmap comparison
  useEffect(() => {
    if (users.length >= 2) {
      if (!userAId || !users.some(u => u._id === userAId)) setUserAId(users[0]._id);
      if (!userBId || !users.some(u => u._id === userBId)) setUserBId(users[1]._id);
    } else if (users.length === 1) {
      setUserAId(users[0]._id);
    }
  }, [users]);

  // Fetch side-by-side heatmaps when userA or userB changes
  useEffect(() => {
    const fetchHeatmaps = async () => {
      if (!userAId || !userBId) return;
      setHeatmapLoading(true);
      try {
        const [resA, resB] = await Promise.all([
          getUserHeatmap(userAId),
          getUserHeatmap(userBId)
        ]);
        setHeatmapA(resA);
        setHeatmapB(resB);
      } catch (err) {
        console.error('Error fetching compare heatmaps:', err);
      } finally {
        setHeatmapLoading(false);
      }
    };

    fetchHeatmaps();
  }, [userAId, userBId]);

  const userA = users.find(u => u._id === userAId);
  const userB = users.find(u => u._id === userBId);

  // Maximum points for chart scaling
  const maxTimelinePoints = useMemo(() => {
    if (!comparisonData?.users) return 50;
    let max = 20;
    comparisonData.users.forEach(u => {
      u.dailyTimeline?.forEach(day => {
        if (day.points > max) max = day.points;
      });
    });
    return Math.ceil(max * 1.15); // Add 15% ceiling padding
  }, [comparisonData]);

  if (users.length === 0) {
    return (
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <Users2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
        <h3 className="text-lg font-semibold text-white">No Friends Added Yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Add at least one friend or yourself using the "+ Add Friend" button to start comparing activity.
        </p>
      </div>
    );
  }

  const comparedUsers = comparisonData?.users || [];
  const topWinner = comparedUsers.length > 0 ? comparedUsers[0] : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector Bar */}
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Competitive Activity Comparison</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              Points Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare problems solved and difficulty points earned daily, weekly, and monthly
          </p>
        </div>

        {/* Controls: Period Tabs & Sync All */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            {[
              { id: 'day', label: '⚡ Today (Daily)' },
              { id: 'week', label: '📅 This Week' },
              { id: 'month', label: '🗓️ This Month' },
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

          <button
            onClick={() => fetchComparison(true)}
            disabled={isSyncingAll || loading}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md ${
              isSyncingAll
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
            }`}
            title="Fetch live updates from Codeforces, LeetCode, and CodeChef for all friends now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isSyncingAll ? 'Syncing All...' : 'Sync All Now'}</span>
          </button>
        </div>
      </div>

      {/* Point System Rules Reference Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs">
        <div className="flex items-center gap-2 mb-2 font-semibold text-slate-200">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Difficulty & Rating Point System:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-400">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-amber-400 font-bold block mb-1">LeetCode</span>
            <span className="text-slate-300">Easy: <strong className="text-emerald-400">10 pts</strong></span> •{' '}
            <span className="text-slate-300">Medium: <strong className="text-amber-400">25 pts</strong></span> •{' '}
            <span className="text-slate-300">Hard: <strong className="text-rose-400">50 pts</strong></span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-blue-400 font-bold block mb-1">Codeforces (Rating)</span>
            <span className="text-slate-300">&lt;1000: <strong className="text-slate-200">10 pts</strong></span> •{' '}
            <span className="text-slate-300">1000-1399: <strong className="text-blue-400">20 pts</strong></span> •{' '}
            <span className="text-slate-300">1400-1699: <strong className="text-cyan-400">35 pts</strong></span> •{' '}
            <span className="text-slate-300">1700+: <strong className="text-purple-400">55-80 pts</strong></span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-purple-400 font-bold block mb-1">CodeChef</span>
            <span className="text-slate-300">Easy (&lt;1200): <strong className="text-emerald-400">15 pts</strong></span> •{' '}
            <span className="text-slate-300">Medium (1200-1600): <strong className="text-amber-400">30 pts</strong></span> •{' '}
            <span className="text-slate-300">Hard (1600+): <strong className="text-rose-400">50 pts</strong></span>
          </div>
        </div>
      </div>

      {/* Leader Banner for Period */}
      {topWinner && topWinner.totalPoints > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-amber-400 tracking-wider">
                Current {period === 'day' ? 'Today' : period === 'week' ? 'Weekly' : period === 'month' ? 'Monthly' : 'All-Time'} Leader
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{topWinner.username}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {topWinner.totalPoints} points
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  ({topWinner.problemCount} {topWinner.problemCount === 1 ? 'problem' : 'problems'} solved)
                </span>
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Graphical Representation: Timeline Points Bar Chart */}
      {period !== 'all' && comparisonData?.dates && comparisonData.dates.length > 0 && (
        <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Points Activity Timeline ({period === 'day' ? 'Today' : period === 'week' ? 'Last 7 Days' : 'Last 30 Days'})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily point breakdown comparing consistency across all friends
              </p>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-4 flex-wrap text-xs">
              {comparedUsers.map((u, idx) => {
                const color = userColors[idx % userColors.length];
                return (
                  <div key={u.userId} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full ${color.bg}`}></span>
                    <span className="text-slate-300 font-medium">{u.username}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SVG / CSS Bar Chart */}
          <div className="relative pt-6 pb-2 overflow-x-auto">
            {/* Tooltip on Hover */}
            {hoveredChartPoint && (
              <div
                className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900 border border-slate-700 text-xs rounded-xl p-2.5 shadow-2xl backdrop-blur-md"
                style={{ left: `${hoveredChartPoint.x}px`, top: `${hoveredChartPoint.y}px` }}
              >
                <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-1 flex items-center justify-between gap-4">
                  <span>{hoveredChartPoint.username}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{hoveredChartPoint.date}</span>
                </div>
                <div className="text-emerald-400 font-bold">
                  +{hoveredChartPoint.points} pts
                </div>
                <div className="text-slate-400 text-[10px]">
                  {hoveredChartPoint.count} {hoveredChartPoint.count === 1 ? 'problem' : 'problems'} solved
                </div>
              </div>
            )}

            {/* Chart Bars Grid */}
            <div className="flex items-end justify-between gap-2 min-w-[500px] h-48 border-b border-slate-800 px-2">
              {comparisonData.dates.map((dateStr) => {
                // Format label: "Mon 19" or "Oct 19"
                const d = new Date(dateStr + 'T00:00:00');
                const label = period === 'day'
                  ? 'Today'
                  : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

                return (
                  <div key={dateStr} className="flex-1 flex flex-col items-center justify-end h-full group">
                    {/* User Bars Grouped Side-by-Side */}
                    <div className="flex items-end justify-center gap-1 w-full h-full pb-1">
                      {comparedUsers.map((user, uIdx) => {
                        const dayData = user.dailyTimeline?.find(dt => dt.date === dateStr) || { points: 0, count: 0 };
                        const color = userColors[uIdx % userColors.length];
                        const heightPct = Math.min(100, Math.max(4, (dayData.points / maxTimelinePoints) * 100));

                        return (
                          <div
                            key={user.userId}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const parentRect = e.currentTarget.closest('.relative').getBoundingClientRect();
                              setHoveredChartPoint({
                                username: user.username,
                                date: dateStr,
                                points: dayData.points,
                                count: dayData.count,
                                x: rect.left - parentRect.left + rect.width / 2,
                                y: rect.top - parentRect.top - 6
                              });
                            }}
                            onMouseLeave={() => setHoveredChartPoint(null)}
                            style={{ height: dayData.points > 0 ? `${heightPct}%` : '4px' }}
                            className={`w-full max-w-[16px] rounded-t-sm transition-all duration-200 cursor-pointer ${
                              dayData.points > 0
                                ? `${color.bg} opacity-90 hover:opacity-100 hover:brightness-110 shadow-sm`
                                : 'bg-slate-800/40 hover:bg-slate-700/60'
                            }`}
                          />
                        );
                      })}
                    </div>
                    {/* Date label */}
                    <span className="text-[10px] text-slate-500 font-mono mt-2 truncate max-w-[45px]">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Period Comparison Table */}
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span>
            {period === 'day' ? 'Today’s Leaderboard' : period === 'week' ? 'Weekly Comparison Table' : period === 'month' ? 'Monthly Comparison Table' : 'All-Time Comparison'}
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-4">Friend</th>
                <th className="py-3 px-4 text-center">Total Points</th>
                <th className="py-3 px-4 text-center">Questions Solved</th>
                <th className="py-3 px-4">Difficulty Distribution</th>
                <th className="py-3 px-4 text-right">Platforms (CF / LC / CC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading comparison...</p>
                  </td>
                </tr>
              ) : comparedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No activity recorded in this period.
                  </td>
                </tr>
              ) : (
                comparedUsers.map((user, idx) => {
                  const b = user.breakdown || {};
                  const pb = user.platformBreakdown || {};

                  return (
                    <tr key={user.userId} className="hover:bg-slate-800/30 transition">
                      {/* Rank Badge */}
                      <td className="py-3.5 px-3">
                        {idx === 0 ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                            <Crown className="w-4 h-4" />
                          </div>
                        ) : idx === 1 ? (
                          <div className="w-7 h-7 rounded-lg bg-slate-300/20 text-slate-200 border border-slate-300/30 flex items-center justify-center font-bold text-xs">
                            <Medal className="w-4 h-4" />
                          </div>
                        ) : idx === 2 ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-700/20 text-amber-600 border border-amber-700/30 flex items-center justify-center font-bold text-xs">
                            <Award className="w-4 h-4" />
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono pl-2 font-semibold">#{idx + 1}</span>
                        )}
                      </td>

                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{user.username}</span>
                          {idx === 0 && (
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              #1
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {user.handles?.codeforces && <span className="text-blue-400 font-mono">CF: @{user.handles.codeforces}</span>}
                          {user.handles?.leetcode && <span className="text-amber-400 font-mono">LC: @{user.handles.leetcode}</span>}
                          {user.handles?.codechef && <span className="text-purple-400 font-mono">CC: @{user.handles.codechef}</span>}
                        </div>
                      </td>

                      {/* Total Points */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold font-mono text-sm shadow-sm">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          {user.totalPoints} pts
                        </span>
                      </td>

                      {/* Problem Count */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-white text-sm">
                        {user.problemCount}
                      </td>

                      {/* Difficulty Distribution Pills */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium" title="Easy questions count">
                            Easy: {b.easy?.count || 0} ({b.easy?.points || 0}pts)
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium" title="Medium questions count">
                            Med: {b.medium?.count || 0} ({b.medium?.points || 0}pts)
                          </span>
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-medium" title="Hard questions count">
                            Hard: {b.hard?.count || 0} ({b.hard?.points || 0}pts)
                          </span>
                        </div>
                      </td>

                      {/* Platform Breakdown */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-xs font-mono">
                          <span className="text-blue-400" title="Codeforces">
                            CF: {pb.Codeforces?.count || 0}
                          </span>
                          <span>•</span>
                          <span className="text-amber-400" title="LeetCode">
                            LC: {pb.LeetCode?.count || 0}
                          </span>
                          <span>•</span>
                          <span className="text-purple-400" title="CodeChef">
                            CC: {pb.CodeChef?.count || 0}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Questions Solved in this Period */}
      {comparedUsers.some(u => u.recentProblems?.length > 0) && (
        <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Questions Solved in this Period ({period === 'day' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {comparedUsers.flatMap(user =>
              (user.recentProblems || []).map(prob => ({
                ...prob,
                username: user.username
              }))
            )
            .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt))
            .slice(0, 8)
            .map(prob => (
              <div
                key={prob._id || prob.title}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 group hover:border-slate-700 transition"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                      {prob.username}
                    </span>
                    <PlatformBadge platform={prob.platform} size="xs" />
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                      +{prob.points} pts
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded font-mono">
                      {prob.difficulty}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-emerald-300 transition">
                    {prob.title}
                  </h4>
                </div>

                <a
                  href={prob.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/20 transition shrink-0"
                  title="View problem"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Head-to-Head 1v1 Heatmaps Side-by-Side */}
      {userA && userB && (
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users2 className="w-5 h-5 text-cyan-400" />
                <span>Side-by-Side 365-Day Heatmap Comparison</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Visually compare annual coding consistency and streaks
              </p>
            </div>

            {/* Select 2 Friends */}
            <div className="flex items-center gap-2">
              <select
                value={userAId}
                onChange={(e) => setUserAId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                {users.map(u => (
                  <option key={u._id} value={u._id} disabled={u._id === userBId}>
                    {u.username}
                  </option>
                ))}
              </select>

              <span className="text-xs font-bold text-slate-500">VS</span>

              <select
                value={userBId}
                onChange={(e) => setUserBId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                {users.map(u => (
                  <option key={u._id} value={u._id} disabled={u._id === userAId}>
                    {u.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {heatmapLoading ? (
            <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
              <p className="text-xs">Loading comparison heatmaps...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <h4 className="font-bold text-white text-sm">{userA.username}'s Heatmap</h4>
                </div>
                <Heatmap data={heatmapA} username={userA.username} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  <h4 className="font-bold text-white text-sm">{userB.username}'s Heatmap</h4>
                </div>
                <Heatmap data={heatmapB} username={userB.username} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
