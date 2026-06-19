'use client';

import React, { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Flame, Award } from 'lucide-react';
import { getLocalDateString } from '@/lib/gamification/streaks';

export default function StreakTracker() {
  const { currentStreak, longestStreak, carbonLogs } = useAppStore();

  // Generate 7-day completions heatmap for the current week (Mon-Sun)
  const heatmapDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday

    // Align calendar starting from Monday
    const startOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    
    const logsDates = carbonLogs.map((log) => {
      const d = new Date(log.date);
      return getLocalDateString(d);
    });

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + startOffset + i);
      const dateStr = getLocalDateString(d);
      
      // Check if user completed actions (logged something) on this date
      const hasLogged = logsDates.includes(dateStr);

      days.push({
        label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
        dateStr,
        hasLogged,
        isToday: dateStr === getLocalDateString(now),
      });
    }

    return days;
  }, [carbonLogs]);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-250/50 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
          <Flame className="h-4 w-4 text-amber-500 fill-current" />
          Active Streak
        </h2>
        <p className="text-xs text-gray-500 font-medium">Log daily footprint entries to maintain your streak</p>
      </div>

      <div className="flex items-center justify-center space-x-6 my-6">
        {/* Flame Graphic */}
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border border-amber-200">
            <Flame className="h-10 w-10 text-amber-500 fill-current animate-pulse" />
          </div>
          {currentStreak > 0 && (
            <span className="absolute -bottom-1 bg-amber-500 text-white font-mono font-bold text-xs px-2 py-0.5 rounded-full border border-white">
              {currentStreak} Days
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-1 text-left">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Current Streak</span>
            <p className="text-lg font-extrabold text-slate-800">{currentStreak} Days</p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Longest Streak</span>
            <p className="text-sm font-bold text-gray-500 flex items-center gap-1">
              <Award className="h-4 w-4 text-green-600" />
              {longestStreak} Days
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Completion Heatmap */}
      <div className="border-t border-gray-100 pt-4">
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Weekly Heatmap</span>
        <div className="grid grid-cols-7 gap-2.5">
          {heatmapDays.map((day) => (
            <div key={day.dateStr} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-400 font-semibold">{day.label}</span>
              <div
                title={day.dateStr}
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${
                  day.hasLogged
                    ? 'bg-green-600 border-green-700 text-white font-bold'
                    : day.isToday
                    ? 'bg-white border-green-500 text-green-600 font-bold border-2'
                    : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}
              >
                {day.hasLogged ? '✓' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
