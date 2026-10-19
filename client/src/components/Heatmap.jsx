import React, { useState, useMemo, useRef } from 'react';
import { Calendar, Flame, Trophy, CheckCircle2, ChevronRight, Layers, Sparkles } from 'lucide-react';
import DayDetailModal from './DayDetailModal';

export default function Heatmap({ data = [], username = 'User', onDayClick }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePlatformFilter, setActivePlatformFilter] = useState('All');
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, day: null });
  const containerRef = useRef(null);

  // Compute platform-filtered counts and statistics
  const { weeks, monthLabels, stats } = useMemo(() => {
    if (!data || data.length === 0) {
      return { weeks: [], monthLabels: [], stats: { total: 0, activeDays: 0, maxDay: 0 } };
    }

    let total = 0;
    let activeDays = 0;
    let maxDay = 0;

    // Transform raw data according to platform filter
    const normalizedData = data.map(day => {
      let count = day.count;
      if (activePlatformFilter !== 'All') {
        count = day.platformBreakdown?.[activePlatformFilter] || 0;
      }
      if (count > 0) {
        activeDays++;
        total += count;
        if (count > maxDay) maxDay = count;
      }
      return {
        ...day,
        effectiveCount: count
      };
    });

    // Group into 53 weeks (Sunday=0 to Saturday=6)
    const weeksArr = [];
    let currentWeek = [];

    // Identify day of week for first date
    const firstDate = new Date(normalizedData[0].date + 'T00:00:00');
    const firstDayOfWeek = firstDate.getDay(); // 0 is Sunday

    // Pad first week if it doesn't start on Sunday
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    const monthPositions = [];
    let lastMonth = -1;

    normalizedData.forEach((dayItem, index) => {
      const d = new Date(dayItem.date + 'T00:00:00');
      const month = d.getMonth();

      // Check if this is the start of a new month
      if (month !== lastMonth && d.getDate() <= 7) {
        monthPositions.push({
          weekIndex: weeksArr.length,
          name: d.toLocaleString('en-US', { month: 'short' })
        });
        lastMonth = month;
      }

      currentWeek.push(dayItem);

      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArr.push(currentWeek);
    }

    return {
      weeks: weeksArr,
      monthLabels: monthPositions,
      stats: { total, activeDays, maxDay }
    };
  }, [data, activePlatformFilter]);

  // Color intensity calculation
  const getCellColor = (count) => {
    if (count === null || count === undefined || count === 0) {
      return 'bg-[#151c2e] border-[#1d273e] hover:border-slate-500';
    }

    if (activePlatformFilter === 'Codeforces') {
      if (count <= 2) return 'bg-blue-950 border-blue-800 text-blue-200';
      if (count <= 4) return 'bg-blue-800 border-blue-600 text-blue-100';
      if (count <= 6) return 'bg-blue-600 border-blue-400 text-white shadow-sm shadow-blue-500/50';
      return 'bg-blue-400 border-blue-200 text-slate-950 shadow-md shadow-blue-400/60';
    }

    if (activePlatformFilter === 'LeetCode') {
      if (count <= 2) return 'bg-amber-950 border-amber-800 text-amber-200';
      if (count <= 4) return 'bg-amber-800 border-amber-600 text-amber-100';
      if (count <= 6) return 'bg-amber-600 border-amber-400 text-white shadow-sm shadow-amber-500/50';
      return 'bg-amber-400 border-amber-200 text-slate-950 shadow-md shadow-amber-400/60';
    }

    if (activePlatformFilter === 'CodeChef') {
      if (count <= 2) return 'bg-purple-950 border-purple-800 text-purple-200';
      if (count <= 4) return 'bg-purple-800 border-purple-600 text-purple-100';
      if (count <= 6) return 'bg-purple-600 border-purple-400 text-white shadow-sm shadow-purple-500/50';
      return 'bg-purple-400 border-purple-200 text-slate-950 shadow-md shadow-purple-400/60';
    }

    // Default GitHub emerald green
    if (count <= 2) return 'bg-[#0e4429] border-[#185e3a]';
    if (count <= 5) return 'bg-[#006d32] border-[#0e8a45]';
    if (count <= 8) return 'bg-[#26a641] border-[#39d353] shadow-sm shadow-emerald-500/30';
    return 'bg-[#39d353] border-emerald-200 shadow-md shadow-emerald-400/50';
  };

  const handleCellClick = (day) => {
    if (!day) return;
    setSelectedDay(day);
    setIsModalOpen(true);
    if (onDayClick) onDayClick(day);
  };

  const handleMouseEnter = (e, day) => {
    if (!day) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };

    setTooltip({
      visible: true,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      day
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl relative">
      {/* Header & Platform Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>365-Day Activity Heatmap</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              IST (Asia/Kolkata)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking unique problems solved across Codeforces, LeetCode, and CodeChef for <span className="text-slate-200 font-semibold">{username}</span>
          </p>
        </div>

        {/* Platform view switcher tabs */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          {['All', 'Codeforces', 'LeetCode', 'CodeChef'].map(p => (
            <button
              key={p}
              onClick={() => setActivePlatformFilter(p)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activePlatformFilter === p
                  ? p === 'All'
                    ? 'bg-emerald-500 text-black font-semibold shadow-sm shadow-emerald-500/20'
                    : p === 'Codeforces'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                    : p === 'LeetCode'
                    ? 'bg-amber-500 text-black font-semibold shadow-sm shadow-amber-500/20'
                    : 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {p === 'All' ? 'Combined All' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div ref={containerRef} className="relative overflow-x-auto pb-2 pt-4">
        {/* Floating Tooltip */}
        {tooltip.visible && tooltip.day && (
          <div
            className="absolute z-40 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900/95 border border-slate-700 text-xs rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[200px]"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            <div className="font-semibold text-slate-100 border-b border-slate-800 pb-1.5 mb-1.5 flex items-center justify-between">
              <span>{new Date(tooltip.day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className="text-[10px] text-slate-400 font-mono">{tooltip.day.date}</span>
            </div>

            <div className="text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tooltip.day.count} {tooltip.day.count === 1 ? 'problem' : 'problems'} solved</span>
            </div>

            <div className="grid grid-cols-3 gap-1 text-[11px] pt-1 text-slate-300">
              <div className="bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 text-center">
                <span className="text-[9px] text-blue-400 block font-mono">CF</span>
                <span className="font-bold">{tooltip.day.platformBreakdown?.Codeforces || 0}</span>
              </div>
              <div className="bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-center">
                <span className="text-[9px] text-amber-400 block font-mono">LC</span>
                <span className="font-bold">{tooltip.day.platformBreakdown?.LeetCode || 0}</span>
              </div>
              <div className="bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 text-center">
                <span className="text-[9px] text-purple-400 block font-mono">CC</span>
                <span className="font-bold">{tooltip.day.platformBreakdown?.CodeChef || 0}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 mt-2 text-center pt-1 border-t border-slate-800/80">
              Click cell to open problem links ↗
            </div>
          </div>
        )}

        {/* Heatmap Visual */}
        <div className="inline-block min-w-full">
          {/* Month Headers */}
          <div className="flex text-[11px] text-slate-400 mb-1.5 pl-8 select-none">
            {weeks.map((week, wIdx) => {
              const labelObj = monthLabels.find(m => m.weekIndex === wIdx);
              return (
                <div key={wIdx} className="w-[14px] mr-[3px] text-left shrink-0">
                  {labelObj && <span className="font-medium text-slate-300">{labelObj.name}</span>}
                </div>
              );
            })}
          </div>

          {/* Days Grid with Weekday Labels on Left */}
          <div className="flex">
            {/* Weekday indicators */}
            <div className="flex flex-col justify-between text-[10px] text-slate-500 font-mono pr-2 select-none h-[116px] py-[2px]">
              <span className="h-[14px] leading-[14px]">Sun</span>
              <span className="h-[14px] leading-[14px] text-slate-400">Tue</span>
              <span className="h-[14px] leading-[14px] text-slate-400">Thu</span>
              <span className="h-[14px] leading-[14px]">Sat</span>
            </div>

            {/* Heatmap 53 Columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return <div key={dIdx} className="w-[14px] h-[14px] rounded-[3px] opacity-0" />;
                    }
                    const count = day.effectiveCount;
                    const colorClass = getCellColor(count);

                    return (
                      <button
                        key={dIdx}
                        onClick={() => handleCellClick(day)}
                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                        onMouseLeave={handleMouseLeave}
                        aria-label={`${day.count} problems on ${day.date}`}
                        className={`w-[14px] h-[14px] rounded-[3px] border transition-transform duration-100 hover:scale-125 hover:z-20 ${colorClass}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Metrics & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-800/80 text-xs">
        {/* Quick summary stats */}
        <div className="flex items-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              <strong className="text-white font-semibold">{stats.total}</strong> problems in 365 days
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>
              <strong className="text-white font-semibold">{stats.activeDays}</strong> active days
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-sky-400" />
            <span>
              <strong className="text-white font-semibold">{stats.maxDay}</strong> max in a day
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[#151c2e] border border-[#1d273e]"></div>
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[#0e4429] border border-[#185e3a]"></div>
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[#006d32] border border-[#0e8a45]"></div>
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[#26a641] border border-[#39d353]"></div>
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[#39d353] border border-emerald-200"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Day Detail Modal */}
      <DayDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dayData={selectedDay}
      />
    </div>
  );
}
