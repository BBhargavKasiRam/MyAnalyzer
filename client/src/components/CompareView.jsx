import React, { useState, useEffect } from 'react';
import { Users2, ArrowRight, Flame, Trophy, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { getUserHeatmap } from '../api';
import Heatmap from './Heatmap';

export default function CompareView({ users = [] }) {
  const [userAId, setUserAId] = useState('');
  const [userBId, setUserBId] = useState('');
  const [heatmapA, setHeatmapA] = useState([]);
  const [heatmapB, setHeatmapB] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (users.length >= 2) {
      setUserAId(users[0]._id);
      setUserBId(users[1]._id);
    } else if (users.length === 1) {
      setUserAId(users[0]._id);
    }
  }, [users]);

  useEffect(() => {
    const fetchHeatmaps = async () => {
      if (!userAId || !userBId) return;
      setLoading(true);
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
        setLoading(false);
      }
    };

    fetchHeatmaps();
  }, [userAId, userBId]);

  const userA = users.find(u => u._id === userAId);
  const userB = users.find(u => u._id === userBId);

  if (users.length < 2) {
    return (
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <Users2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
        <h3 className="text-lg font-semibold text-white">Compare Requires At Least 2 Friends</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Add at least two friends using the "+ Add Friend" button to compare your competitive programming progress side by side.
        </p>
      </div>
    );
  }

  const statCompare = (valA = 0, valB = 0) => {
    if (valA > valB) return { aWinner: true, bWinner: false };
    if (valB > valA) return { aWinner: false, bWinner: true };
    return { aWinner: false, bWinner: false };
  };

  const totalCmp = statCompare(userA?.stats?.totalSolved, userB?.stats?.totalSolved);
  const streakCmp = statCompare(userA?.stats?.currentStreak, userB?.stats?.currentStreak);
  const longestCmp = statCompare(userA?.stats?.longestStreak, userB?.stats?.longestStreak);
  const cfCmp = statCompare(userA?.stats?.codeforcesSolved, userB?.stats?.codeforcesSolved);
  const lcCmp = statCompare(userA?.stats?.leetcodeSolved, userB?.stats?.leetcodeSolved);
  const ccCmp = statCompare(userA?.stats?.codechefSolved, userB?.stats?.codechefSolved);

  return (
    <div className="space-y-6">
      {/* Selector Bar */}
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Friend 1:</span>
            <select
              value={userAId}
              onChange={(e) => setUserAId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {users.map(u => (
                <option key={u._id} value={u._id} disabled={u._id === userBId}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">
            VS
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Friend 2:</span>
            <select
              value={userBId}
              onChange={(e) => setUserBId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {users.map(u => (
                <option key={u._id} value={u._id} disabled={u._id === userAId}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Head-to-Head Stats Table */}
      {userA && userB && (
        <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Head-to-Head Statistics</span>
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center text-xs border-b border-slate-800 pb-3 font-semibold text-slate-400 uppercase tracking-wider">
            <div className="text-emerald-400 font-bold text-sm truncate">{userA.username}</div>
            <div>Metric</div>
            <div className="text-sky-400 font-bold text-sm truncate">{userB.username}</div>
          </div>

          <div className="divide-y divide-slate-800/60 text-sm">
            {/* Total Solved */}
            <div className="grid grid-cols-3 gap-2 py-3 items-center text-center">
              <div className={`font-mono font-bold text-base ${totalCmp.aWinner ? 'text-emerald-400' : 'text-slate-300'}`}>
                {userA.stats?.totalSolved || 0}
              </div>
              <div className="text-xs text-slate-400 font-medium">Total Solved</div>
              <div className={`font-mono font-bold text-base ${totalCmp.bWinner ? 'text-emerald-400' : 'text-slate-300'}`}>
                {userB.stats?.totalSolved || 0}
              </div>
            </div>

            {/* Current Streak */}
            <div className="grid grid-cols-3 gap-2 py-3 items-center text-center">
              <div className={`font-mono font-bold text-base ${streakCmp.aWinner ? 'text-amber-400' : 'text-slate-300'}`}>
                {userA.stats?.currentStreak || 0} days
              </div>
              <div className="text-xs text-slate-400 font-medium">Current Streak</div>
              <div className={`font-mono font-bold text-base ${streakCmp.bWinner ? 'text-amber-400' : 'text-slate-300'}`}>
                {userB.stats?.currentStreak || 0} days
              </div>
            </div>

            {/* Longest Streak */}
            <div className="grid grid-cols-3 gap-2 py-3 items-center text-center">
              <div className={`font-mono font-bold text-base ${longestCmp.aWinner ? 'text-cyan-400' : 'text-slate-300'}`}>
                {userA.stats?.longestStreak || 0} days
              </div>
              <div className="text-xs text-slate-400 font-medium">Longest Streak</div>
              <div className={`font-mono font-bold text-base ${longestCmp.bWinner ? 'text-cyan-400' : 'text-slate-300'}`}>
                {userB.stats?.longestStreak || 0} days
              </div>
            </div>

            {/* Codeforces */}
            <div className="grid grid-cols-3 gap-2 py-3 items-center text-center">
              <div className={`font-mono font-bold ${cfCmp.aWinner ? 'text-blue-400' : 'text-slate-300'}`}>
                {userA.stats?.codeforcesSolved || 0}
              </div>
              <div className="text-xs text-slate-400 font-medium">Codeforces</div>
              <div className={`font-mono font-bold ${cfCmp.bWinner ? 'text-blue-400' : 'text-slate-300'}`}>
                {userB.stats?.codeforcesSolved || 0}
              </div>
            </div>

            {/* LeetCode */}
            <div className="grid grid-cols-3 gap-2 py-3 items-center text-center">
              <div className={`font-mono font-bold ${lcCmp.aWinner ? 'text-amber-400' : 'text-slate-300'}`}>
                {userA.stats?.leetcodeSolved || 0}
              </div>
              <div className="text-xs text-slate-400 font-medium">LeetCode</div>
              <div className={`font-mono font-bold ${lcCmp.bWinner ? 'text-amber-400' : 'text-slate-300'}`}>
                {userB.stats?.leetcodeSolved || 0}
              </div>
            </div>

            {/* CodeChef */}
            <div className="grid grid-cols-3 gap-2 py-3 items-center text-center">
              <div className={`font-mono font-bold ${ccCmp.aWinner ? 'text-purple-400' : 'text-slate-300'}`}>
                {userA.stats?.codechefSolved || 0}
              </div>
              <div className="text-xs text-slate-400 font-medium">CodeChef</div>
              <div className={`font-mono font-bold ${ccCmp.bWinner ? 'text-purple-400' : 'text-slate-300'}`}>
                {userB.stats?.codechefSolved || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Heatmaps */}
      {loading ? (
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
          <p className="text-xs">Loading comparison heatmaps...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {userA && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <h3 className="font-bold text-white text-sm">{userA.username}'s Heatmap</h3>
              </div>
              <Heatmap data={heatmapA} username={userA.username} />
            </div>
          )}

          {userB && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <h3 className="font-bold text-white text-sm">{userB.username}'s Heatmap</h3>
              </div>
              <Heatmap data={heatmapB} username={userB.username} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
