import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Filter, Code2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getUserProblems } from '../api';
import PlatformBadge from './PlatformBadge';

export default function ProblemsList({ userId }) {
  const [problems, setProblems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchProblems = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getUserProblems(userId, {
        page,
        limit: 15,
        platform: platform !== 'All' ? platform : undefined,
        search: search.trim() ? search.trim() : undefined
      });
      setProblems(data.problems || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching problems list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [platform, search, userId]);

  useEffect(() => {
    fetchProblems();
  }, [userId, page, platform, search]);

  return (
    <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <span>Solved Problems Explorer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {total} verified accepted problems permanently indexed in database
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition w-48 sm:w-64"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            {['All', 'Codeforces', 'LeetCode', 'CodeChef'].map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  platform === p
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table / List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Problem</th>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4">Difficulty</th>
              <th className="py-3 px-4">Solved Date (IST)</th>
              <th className="py-3 px-4 text-right">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400">
                  <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-xs">Loading problems...</p>
                </td>
              </tr>
            ) : problems.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400">
                  No problems found matching the criteria.
                </td>
              </tr>
            ) : (
              problems.map((prob) => (
                <tr key={prob._id} className="hover:bg-slate-800/30 transition group">
                  <td className="py-3.5 px-4 font-medium text-slate-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-semibold group-hover:text-emerald-300 transition">{prob.title}</span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {prob.problemId}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <PlatformBadge platform={prob.platform} size="xs" />
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50">
                      {prob.difficulty || 'Unrated'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">
                    {prob.dateString}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={prob.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium hover:underline"
                    >
                      <span>Solve</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <span>
            Page {page} of {totalPages} ({total} items)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
