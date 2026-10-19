import React from 'react';
import { Activity, Users, Trophy, Code2, UserPlus, Settings, Sparkles } from 'lucide-react';

export default function Navbar({
  users = [],
  activeUser,
  onSelectUser,
  activeTab,
  setActiveTab,
  onOpenAddUser,
  onOpenEditUser
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-extrabold shadow-md shadow-emerald-500/20">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                MyAnalyzer
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  MERN
                </span>
              </span>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
                Codeforces • LeetCode • CodeChef
              </p>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 text-xs">
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'heatmap'
                  ? 'bg-emerald-500 text-black font-semibold shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Heatmap & Stats</span>
            </button>
            <button
              onClick={() => setActiveTab('problems')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'problems'
                  ? 'bg-emerald-500 text-black font-semibold shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Problems</span>
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'compare'
                  ? 'bg-emerald-500 text-black font-semibold shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'leaderboard'
                  ? 'bg-emerald-500 text-black font-semibold shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </button>
          </nav>

          {/* Right Controls: User Switcher & Add User */}
          <div className="flex items-center gap-2.5">
            {users.length > 0 && activeUser && (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
                <select
                  value={activeUser._id}
                  onChange={(e) => {
                    const u = users.find(x => x._id === e.target.value);
                    if (u) onSelectUser(u);
                  }}
                  className="bg-transparent text-white font-medium py-1 px-2.5 focus:outline-none cursor-pointer text-xs"
                >
                  {users.map(u => (
                    <option key={u._id} value={u._id} className="bg-slate-900 text-white">
                      {u.username} ({u.stats?.totalSolved || 0})
                    </option>
                  ))}
                </select>
                <button
                  onClick={onOpenEditUser}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Edit user handles"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={onOpenAddUser}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 transition shadow-sm shadow-emerald-500/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Friend</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`py-1 px-2 rounded-lg ${activeTab === 'heatmap' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Heatmap
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`py-1 px-2 rounded-lg ${activeTab === 'problems' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Problems
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`py-1 px-2 rounded-lg ${activeTab === 'compare' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Compare
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-1 px-2 rounded-lg ${activeTab === 'leaderboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Leaderboard
          </button>
        </div>
      </div>
    </header>
  );
}
