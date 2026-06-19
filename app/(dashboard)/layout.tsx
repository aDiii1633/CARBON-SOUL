import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import StoreInitializer from '@/components/providers/StoreInitializer';
import DashboardLayoutClient from './DashboardLayoutClient';
import { getLocalDateString } from '@/lib/gamification/streaks';

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

  // Re-generate deterministic daily actions list matching the API
  const PREDEFINED_ACTIONS = [
    { actionId: 'walk-2km', title: 'Walk instead of drive (2km)', category: 'transport', co2SavedKg: 0.4, points: 20 },
    { actionId: 'meat-free', title: 'Go meat-free today', category: 'food', co2SavedKg: 2.5, points: 50 },
    { actionId: 'unplug-devices', title: 'Unplug unused devices', category: 'energy', co2SavedKg: 0.1, points: 10 },
    { actionId: 'second-hand', title: 'Buy second-hand item', category: 'shopping', co2SavedKg: 1.2, points: 30 },
    { actionId: 'compost', title: 'Compost food waste today', category: 'waste', co2SavedKg: 0.3, points: 15 },
    { actionId: 'bus-commute', title: 'Take the bus instead of car', category: 'transport', co2SavedKg: 1.2, points: 30 },
    { actionId: 'cold-wash', title: 'Wash clothes in cold water', category: 'energy', co2SavedKg: 0.3, points: 15 },
    { actionId: 'no-waste', title: 'Finish all leftovers', category: 'food', co2SavedKg: 0.8, points: 20 },
    { actionId: 'recycle-paper', title: 'Recycle paper and cardboard', category: 'waste', co2SavedKg: 0.2, points: 10 },
    { actionId: 'no-plastic', title: 'Avoid single-use plastic', category: 'waste', co2SavedKg: 0.4, points: 15 },
  ];

  // Pick top category based on logs
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

  // Hashing to deterministically select 5 actions
  let hash = 0;
  const seedString = `${userId}-${today}`;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const topCatActions = PREDEFINED_ACTIONS.filter(a => a.category === topCategory);
  const otherCatActions = PREDEFINED_ACTIONS.filter(a => a.category !== topCategory);
  const chosenActionsList = [];
  const topCount = Math.min(3, topCatActions.length);
  for (let i = 0; i < topCount; i++) {
    const idx = Math.abs(hash + i) % topCatActions.length;
    chosenActionsList.push(topCatActions[idx]);
    topCatActions.splice(idx, 1);
  }
  const needed = 5 - chosenActionsList.length;
  for (let i = 0; i < needed; i++) {
    if (otherCatActions.length === 0) break;
    const idx = Math.abs(hash + 10 + i) % otherCatActions.length;
    chosenActionsList.push(otherCatActions[idx]);
    otherCatActions.splice(idx, 1);
  }

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
