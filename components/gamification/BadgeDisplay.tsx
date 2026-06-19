'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { BADGE_DEFINITIONS } from '@/lib/auth/../gamification/badges';
import { Award, Lock, Flame, ShieldAlert, Zap, Globe, Search, Sprout, Crown, LucideIcon } from 'lucide-react';

const BADGE_ICONS: Record<string, LucideIcon> = {
  Flame: Flame,
  ShieldAlert: ShieldAlert,
  Zap: Zap,
  Globe: Globe,
  Search: Search,
  Award: Award,
  Sprout: Sprout,
  Crown: Crown,
};

export default function BadgeDisplay() {
  const { badges } = useAppStore();
  const earnedIds = badges.map((b) => b.id);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-250/50 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
          <Award className="h-4 w-4 text-green-600" />
          Achievement Badges
        </h2>
        <p className="text-xs text-gray-500">Milestones unlocked through carbon saving habits</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {Object.values(BADGE_DEFINITIONS).map((badge) => {
          const isEarned = earnedIds.includes(badge.id);
          const Icon = BADGE_ICONS[badge.icon] || Award;

          return (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border flex flex-col items-center text-center transition ${
                isEarned
                  ? 'bg-green-50/10 border-green-200 text-slate-800'
                  : 'bg-slate-50/40 border-gray-150 text-gray-400 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border mb-3 ${
                  isEarned
                    ? 'bg-green-100 border-green-200 text-green-700'
                    : 'bg-gray-100 border-gray-200 text-gray-450'
                }`}
              >
                {isEarned ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5 text-gray-400" />}
              </div>
              <p className="text-xs font-bold leading-tight mb-1">{badge.name}</p>
              <p className="text-[10px] leading-tight text-gray-500">{badge.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
