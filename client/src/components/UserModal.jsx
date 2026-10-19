import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { createUser, updateUser, deleteUser } from '../api';

export default function UserModal({ isOpen, onClose, user = null, onSaved, onDeleted }) {
  const [username, setUsername] = useState('');
  const [codeforces, setCodeforces] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [codechef, setCodechef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setCodeforces(user.handles?.codeforces || '');
      setLeetcode(user.handles?.leetcode || '');
      setCodechef(user.handles?.codechef || '');
    } else {
      setUsername('');
      setCodeforces('');
      setLeetcode('');
      setCodechef('');
    }
    setError('');
    setConfirmDelete(false);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username / Display Name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        username: username.trim(),
        handles: {
          codeforces: codeforces.trim(),
          leetcode: leetcode.trim(),
          codechef: codechef.trim()
        }
      };

      let savedUser;
      if (user?._id) {
        const res = await updateUser(user._id, { ...payload, syncAfterUpdate: true });
        savedUser = res.user;
      } else {
        const res = await createUser(payload);
        savedUser = res.user;
      }

      onSaved(savedUser);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      await deleteUser(user._id);
      onDeleted(user._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {user ? `Edit ${user.username}` : 'Add Friend / User'}
              </h3>
              <p className="text-xs text-slate-400">
                {user ? 'Update competitive programming handles' : 'Add handles to start tracking activity'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Display Name / Username <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Kasi or Alex"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Platform Handles (Leave empty if not active)
            </span>

            {/* Codeforces */}
            <div>
              <label className="block text-xs font-medium text-blue-400 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Codeforces Handle
              </label>
              <input
                type="text"
                value={codeforces}
                onChange={(e) => setCodeforces(e.target.value)}
                placeholder="e.g. tourist"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-mono"
              />
            </div>

            {/* LeetCode */}
            <div>
              <label className="block text-xs font-medium text-amber-400 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                LeetCode Username
              </label>
              <input
                type="text"
                value={leetcode}
                onChange={(e) => setLeetcode(e.target.value)}
                placeholder="e.g. neal_wu"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition font-mono"
              />
            </div>

            {/* CodeChef */}
            <div>
              <label className="block text-xs font-medium text-purple-400 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                CodeChef Username
              </label>
              <input
                type="text"
                value={codechef}
                onChange={(e) => setCodechef(e.target.value)}
                placeholder="e.g. gennady"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition font-mono"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
            ℹ️ Submitting will immediately trigger an initial synchronization from all specified platforms to build the 365-day history.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {user && (
              <div>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-xs flex items-center gap-1"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{user ? 'Save Changes' : 'Register & Sync'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
