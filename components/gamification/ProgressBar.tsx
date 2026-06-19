'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Sprout, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui';
import { LEVEL_THRESHOLDS } from '@/lib/gamification/points';

export default function ProgressBar() {
  const { points, level, levelName } = useAppStore();

  const getLevelRange = () => {
    switch (level) {
      case 1:
        return { min: LEVEL_THRESHOLDS[1], max: LEVEL_THRESHOLDS[2] };
      case 2:
        return { min: LEVEL_THRESHOLDS[2], max: LEVEL_THRESHOLDS[3] };
      case 3:
        return { min: LEVEL_THRESHOLDS[3], max: LEVEL_THRESHOLDS[4] };
      case 4:
        return { min: LEVEL_THRESHOLDS[4], max: LEVEL_THRESHOLDS[5] };
      default:
        return { min: LEVEL_THRESHOLDS[5], max: LEVEL_THRESHOLDS[5] * 2 };
    }
  };

  const range = getLevelRange();
  const levelProgress = points - range.min;
  const levelTotalNeeded = range.max - range.min;
  const progressPercent = level >= 5 ? 100 : (levelProgress / levelTotalNeeded) * 100;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-250/50 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <Sprout className="h-5 w-5 text-green-600" />
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Eco Rank</span>
            <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">{levelName}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 font-bold block">LEVEL</span>
          <span className="text-lg font-mono font-extrabold text-slate-800">{level}</span>
        </div>
      </div>

      <Progress value={progressPercent} className="h-2.5 mb-2" />

      <div className="flex justify-between text-xs text-gray-500 font-semibold font-mono">
        <span>{points} XP total</span>
        {level < 5 ? (
          <span>{range.max - points} XP to Level {level + 1}</span>
        ) : (
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Sparkles className="h-3 w-3 fill-current" /> Maximum Level Achieved!
          </span>
        )}
      </div>
    </div>
  );
}
