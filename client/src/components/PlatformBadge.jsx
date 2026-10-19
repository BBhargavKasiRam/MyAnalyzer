import React from 'react';

export default function PlatformBadge({ platform, size = 'sm' }) {
  const sizeClasses = size === 'xs'
    ? 'text-xs px-2 py-0.5'
    : size === 'md'
    ? 'text-sm px-3 py-1 font-semibold'
    : 'text-xs px-2.5 py-1 font-medium';

  switch (platform) {
    case 'Codeforces':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          Codeforces
        </span>
      );
    case 'LeetCode':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          LeetCode
        </span>
      );
    case 'CodeChef':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          CodeChef
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-500/10 text-slate-300 border border-slate-500/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          {platform || 'Other'}
        </span>
      );
  }
}
