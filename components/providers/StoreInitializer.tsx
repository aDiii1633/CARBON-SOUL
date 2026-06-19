'use client';

import { useRef } from 'react';
import { useAppStore, DailyActionState, CarbonLogState } from '@/lib/store';
import { BadgeDefinition } from '@/lib/gamification/badges';

interface StoreInitializerProps {
  points: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  badges: BadgeDefinition[];
  dailyActions: DailyActionState[];
  carbonLogs: CarbonLogState[];
}

export default function StoreInitializer({
  points,
  currentStreak,
  longestStreak,
  lastActiveDate,
  badges,
  dailyActions,
  carbonLogs,
}: StoreInitializerProps) {
  const initialized = useRef(false);

  if (!initialized.current) {
    useAppStore.getState().setInitialState({
      points,
      currentStreak,
      longestStreak,
      lastActiveDate,
      badges,
      dailyActions,
      carbonLogs,
    });
    initialized.current = true;
  }

  return null;
}
