import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import StoreInitializer from '@/components/providers/StoreInitializer';
import DashboardLayoutClient from './DashboardLayoutClient';
import { getLocalDateString } from '@/lib/gamification/streaks';
import { getDeterministicDailyActions } from '@/lib/utils/daily-action-picker';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Check session authentication
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  // 2. Fetch User Profile
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  // If user hasn't completed onboarding, redirect them
  if (!profile) {
    redirect('/onboarding');
  }

  // 3. Fetch user initial database state
  const [streakRecord, badges, logs] = await Promise.all([
    prisma.streak.findUnique({ where: { userId } }),
    prisma.badge.findMany({ where: { userId } }),
    prisma.carbonLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 100, // fetch recent logs for dashboard charts
    }),
  ]);

  // If no streak created, initialize one
  const streak = streakRecord || {
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  };

  // 4. Generate/Fetch today's daily actions
  const today = getLocalDateString();
  const completedDailyActions = await prisma.dailyAction.findMany({
    where: { userId, date: today },
  });
  const completedActionIds = completedDailyActions.map(a => a.actionId);

  // Determine the user's highest-emission category for action targeting
  const categoryTotals: Record<string, number> = { transport: 0, energy: 0, food: 0, shopping: 0, waste: 0 };
  logs.forEach((log) => {
    if (categoryTotals[log.category] !== undefined) {
      categoryTotals[log.category] += log.co2Kg;
    }
  });
  let topCategory = 'food';
  let maxCo2 = 0;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    if (val > maxCo2) {
      maxCo2 = val;
      topCategory = cat;
    }
  });

  // Use shared utility for deterministic action selection
  const chosenActionsList = getDeterministicDailyActions(userId, today, topCategory);

  const dailyActions = chosenActionsList.map(a => ({
    id: a.actionId,
    actionId: a.actionId,
    title: a.title,
    category: a.category,
    co2SavedKg: a.co2SavedKg,
    points: a.points,
    completed: completedActionIds.includes(a.actionId),
  }));

  // Format badges and logs for state
  const stateBadges = badges.map(b => ({
    id: b.badgeId,
    name: b.name,
    description: b.description,
    icon: b.badgeId.startsWith('streak-') ? 'Flame' : 'Award',
  }));

  const stateLogs = logs.map(l => ({
    id: l.id,
    date: l.date.toISOString(),
    category: l.category,
    activity: l.activity,
    amount: l.amount,
    unit: l.unit,
    co2Kg: l.co2Kg,
    notes: l.notes || undefined,
  }));

  return (
    <>
      <StoreInitializer
        points={streak.totalPoints}
        currentStreak={streak.currentStreak}
        longestStreak={streak.longestStreak}
        lastActiveDate={streak.lastActiveDate}
        badges={stateBadges}
        dailyActions={dailyActions}
        carbonLogs={stateLogs}
      />
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </>
  );
}
