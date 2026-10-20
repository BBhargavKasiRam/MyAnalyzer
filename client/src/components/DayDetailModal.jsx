import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Calendar, Code, CheckCircle2, Info } from 'lucide-react';
import PlatformBadge from './PlatformBadge';

export default function DayDetailModal({ dayData, isOpen, onClose }) {
  const [platformFilter, setPlatformFilter] = useState('All');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !dayData) return null;

  const { date, count, platformBreakdown = {}, problems = [] } = dayData;

  // Format date nicely: "Monday, October 19, 2026"
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const filteredProblems = platformFilter === 'All'
    ? problems
    : problems.filter(p => p.platform === platformFilter);

  // Check if there are baseline contributions without explicit problem items
  const baselineDiff = count - problems.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{formattedDate}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Total Solved:</span>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">
                  {count} {count === 1 ? 'problem' : 'problems'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Breakdown Summary Bar */}
        <div className="px-6 py-3 bg-slate-900/20 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium mr-1">Filter:</span>
          <button
            onClick={() => setPlatformFilter('All')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              platformFilter === 'All'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All ({count})
          </button>
          <button
            onClick={() => setPlatformFilter('Codeforces')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              platformFilter === 'Codeforces'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Codeforces ({platformBreakdown.Codeforces || 0})
          </button>
          <button
            onClick={() => setPlatformFilter('LeetCode')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              platformFilter === 'LeetCode'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            LeetCode ({platformBreakdown.LeetCode || 0})
          </button>
          <button
            onClick={() => setPlatformFilter('CodeChef')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              platformFilter === 'CodeChef'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            CodeChef ({platformBreakdown.CodeChef || 0})
          </button>
        </div>

        {/* Modal Body / Problems List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {baselineDiff > 0 && platformFilter === 'All' && (
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-start gap-3 text-xs text-slate-300">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Historical Calendar Baseline:</span>{' '}
                {baselineDiff} {baselineDiff === 1 ? 'submission was' : 'submissions were'} verified via platform submission calendars prior to real-time problem tracking.
              </div>
            </div>
          )}

          {filteredProblems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Code className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-500" />
              <p className="text-sm font-medium">No individual problem metadata recorded for this selection.</p>
              {count > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Recorded via daily platform submission activity counters.
                </p>
              )}
            </div>
          ) : (
            filteredProblems.map((prob) => (
              <div
                key={prob._id || prob.problemId}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40 transition group flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <PlatformBadge platform={prob.platform} />
                    <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                      {prob.problemId}
                    </span>
                    {prob.difficulty && prob.difficulty !== 'Unrated' && (
                      <span className="text-xs font-medium text-slate-300 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/30">
                        {prob.difficulty}
                      </span>
                    )}
                    {prob.points && (
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                        +{prob.points} pts
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition truncate">
                    {prob.title}
                  </h4>
                  {prob.solvedAt && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Accepted at {new Date(prob.solvedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  )}
                </div>

                <a
                  href={prob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/20 transition flex items-center gap-1.5 text-xs font-medium"
                  title="Open problem in new tab"
                >
                  <span>Solve / View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
