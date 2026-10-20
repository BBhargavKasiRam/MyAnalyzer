import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import Heatmap from './components/Heatmap';
import ProblemsList from './components/ProblemsList';
import CompareView from './components/CompareView';
import Leaderboard from './components/Leaderboard';
import UserModal from './components/UserModal';
import { getUsers, getUserHeatmap, syncUser, syncAllUsers, getHealth } from './api';
import { Activity, UserPlus, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [activeTab, setActiveTab] = useState('heatmap'); // 'heatmap' | 'problems' | 'compare' | 'leaderboard'
  const [loading, setLoading] = useState(true);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [dbStatus, setDbStatus] = useState('connected');

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Check backend and DB health
  const checkHealth = async () => {
    try {
      const res = await getHealth();
      setDbStatus(res.database);
    } catch (err) {
      setDbStatus('disconnected');
    }
  };

  // Fetch all users
  const loadUsers = useCallback(async (selectUserId = null) => {
    try {
      const userList = await getUsers();
      setUsers(userList);

      if (userList.length > 0) {
        if (selectUserId) {
          const matched = userList.find(u => u._id === selectUserId);
          setActiveUser(matched || userList[0]);
        } else if (!activeUser) {
          setActiveUser(userList[0]);
        } else {
          // Refresh activeUser with newest stats
          const refreshed = userList.find(u => u._id === activeUser._id);
          if (refreshed) setActiveUser(refreshed);
          else setActiveUser(userList[0]);
        }
      } else {
        setActiveUser(null);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [activeUser]);

  // Load heatmap for active user
  const loadHeatmap = useCallback(async (userId) => {
    if (!userId) {
      setHeatmapData([]);
      return;
    }
    setHeatmapLoading(true);
    try {
      const data = await getUserHeatmap(userId);
      setHeatmapData(data);
    } catch (err) {
      console.error('Error fetching heatmap:', err);
      setHeatmapData([]);
    } finally {
      setHeatmapLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Fetch users and automatically trigger live background sync on page entry
    getUsers()
      .then((userList) => {
        setUsers(userList);
        if (userList.length > 0) {
          const firstUser = userList[0];
          setActiveUser(firstUser);
          setLoading(false);

          // Auto-sync fresh data on website visit
          syncUser(firstUser._id, true)
            .then(() => {
              loadUsers(firstUser._id);
              loadHeatmap(firstUser._id);
            })
            .catch((e) => console.warn('Auto-sync notice:', e.message));
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching users on load:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (activeUser?._id) {
      loadHeatmap(activeUser._id);
    }
  }, [activeUser?._id, loadHeatmap]);

  // Sync handler (always forces fresh sync on button click)
  const handleSync = async () => {
    if (!activeUser?._id) return;
    setIsSyncing(true);
    setSyncError('');

    try {
      const result = await syncUser(activeUser._id, true);
      await loadUsers(activeUser._id);
      await loadHeatmap(activeUser._id);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Sync failed';
      setSyncError(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync all users handler
  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    setSyncError('');

    try {
      await syncAllUsers();
      await loadUsers(activeUser?._id);
      if (activeUser?._id) {
        await loadHeatmap(activeUser._id);
      }
    } catch (err) {
      console.error('Error syncing all users:', err);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleOpenAddUser = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = () => {
    setUserToEdit(activeUser);
    setIsUserModalOpen(true);
  };

  const handleUserSaved = async (savedUser) => {
    await loadUsers(savedUser?._id);
    if (savedUser?._id) {
      await loadHeatmap(savedUser._id);
    }
  };

  const handleUserDeleted = async (deletedId) => {
    await loadUsers();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* DB Connection Notice Banner if MongoDB is disconnected */}
      {dbStatus === 'disconnected' && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-300 text-center flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>
            <strong>Database Notice:</strong> MongoDB is currently not connected. Please verify your MongoDB Atlas connection string in the <code className="bg-black/40 px-1 py-0.5 rounded font-mono">.env</code> file.
          </span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        users={users}
        activeUser={activeUser}
        onSelectUser={(u) => setActiveUser(u)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddUser={handleOpenAddUser}
        onOpenEditUser={handleOpenEditUser}
        onSyncAll={handleSyncAll}
        isSyncingAll={isSyncingAll}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-slate-400">Loading your competitive programming data...</p>
          </div>
        ) : users.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="bg-[#0f172a]/80 border border-slate-800 rounded-3xl p-10 sm:p-16 text-center max-w-2xl mx-auto shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <Activity className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to MyAnalyzer
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Track, aggregate, and compare daily competitive programming activity across{' '}
              <span className="text-blue-400 font-semibold">Codeforces</span>,{' '}
              <span className="text-amber-400 font-semibold">LeetCode</span>, and{' '}
              <span className="text-purple-400 font-semibold">CodeChef</span> with a unified 365-day GitHub-style heatmap.
            </p>

            <div className="mt-8">
              <button
                onClick={handleOpenAddUser}
                className="px-6 py-3 rounded-2xl font-semibold bg-emerald-500 hover:bg-emerald-400 text-black text-sm transition shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Your First User / Friend</span>
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-center gap-6">
              <span>✓ Auto 365-day Sync</span>
              <span>✓ Streak Calculation</span>
              <span>✓ Direct Problem Links</span>
            </div>
          </div>
        ) : (
          /* Tab Content */
          <>
            {activeTab === 'heatmap' && (
              <div className="space-y-8">
                {/* Stats Overview */}
                <StatsOverview
                  user={activeUser}
                  onSync={handleSync}
                  isSyncing={isSyncing}
                  syncError={syncError}
                />

                {/* GitHub-style Heatmap */}
                {heatmapLoading ? (
                  <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-16 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs text-slate-400">Loading contribution heatmap...</p>
                  </div>
                ) : (
                  <Heatmap
                    data={heatmapData}
                    username={activeUser?.username}
                  />
                )}

                {/* Solved Problems Preview / Quick List */}
                {activeUser && (
                  <ProblemsList userId={activeUser._id} />
                )}
              </div>
            )}

            {activeTab === 'problems' && activeUser && (
              <ProblemsList userId={activeUser._id} />
            )}

            {activeTab === 'compare' && (
              <CompareView users={users} onUserUpdated={loadUsers} />
            )}

            {activeTab === 'leaderboard' && (
              <Leaderboard
                users={users}
                onSelectUser={(u) => {
                  setActiveUser(u);
                  setActiveTab('heatmap');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>MyAnalyzer • Multi-Platform CP Tracker & Activity Heatmap (MERN Stack)</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="text-blue-400">Codeforces</span>
            <span>•</span>
            <span className="text-amber-400">LeetCode</span>
            <span>•</span>
            <span className="text-purple-400">CodeChef</span>
          </div>
        </div>
      </footer>

      {/* User Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={userToEdit}
        onSaved={handleUserSaved}
        onDeleted={handleUserDeleted}
      />
    </div>
  );
}
