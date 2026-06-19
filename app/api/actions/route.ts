import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { getLocalDateString, updateStreak } from '@/lib/gamification/streaks';
import { calculateLevel } from '@/lib/gamification/points';
import { checkBadgeEligibility } from '@/lib/gamification/badges';

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

/**
 * Deterministically generates today's 5 actions for a user based on date and userId
 */
function getDeterministicDailyActions(userId: string, dateStr: string, topCategory: string) {
  // A simple hashing seed
  let hash = 0;
  const seedString = `${userId}-${dateStr}`;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Filter actions by category
  const topCatActions = PREDEFINED_ACTIONS.filter(a => a.category === topCategory);
  const otherCatActions = PREDEFINED_ACTIONS.filter(a => a.category !== topCategory);

  const selected: typeof PREDEFINED_ACTIONS = [];

  // Pick 3 from top category (or all if we don't have enough)
  const topCount = Math.min(3, topCatActions.length);
  for (let i = 0; i < topCount; i++) {
    const idx = Math.abs(hash + i) % topCatActions.length;
    selected.push(topCatActions[idx]);
    // remove picked action to avoid duplicates
    topCatActions.splice(idx, 1);
  }

  // Pick remaining from other categories
  const needed = 5 - selected.length;
  for (let i = 0; i < needed; i++) {
    if (otherCatActions.length === 0) break;
    const idx = Math.abs(hash + 10 + i) % otherCatActions.length;
    selected.push(otherCatActions[idx]);
    otherCatActions.splice(idx, 1);
  }

  return selected;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const today = getLocalDateString();

    // 1. Fetch user logs to determine top category
    const logs = await prisma.carbonLog.findMany({
      where: { userId },
      select: { category: true, co2Kg: true },
    });

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

    // 2. Generate the 5 actions
    const generated = getDeterministicDailyActions(userId, today, topCategory);

    // 3. Query completed actions in the DB for today
    const completed = await prisma.dailyAction.findMany({
      where: { userId, date: today },
    });
    const completedIds = completed.map(c => c.actionId);

    // 4. Assemble output
    const actions = generated.map(a => ({
      ...a,
      completed: completedIds.includes(a.actionId),
      completedAt: completed.find(c => c.actionId === a.actionId)?.completedAt || null,
    }));

    return NextResponse.json(actions, { status: 200 });
  } catch (error) {
    console.error('GET daily actions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { actionId } = body;
    if (!actionId) {
      return NextResponse.json({ error: 'Action ID is required' }, { status: 400 });
    }

    const today = getLocalDateString();

    // Verify if this is a valid action definition
    const actionDef = PREDEFINED_ACTIONS.find(a => a.actionId === actionId);
    if (!actionDef) {
      return NextResponse.json({ error: 'Invalid action ID' }, { status: 400 });
    }

    // Check if already completed today
    const existing = await prisma.dailyAction.findFirst({
      where: { userId, actionId, date: today },
    });

    if (existing) {
      return NextResponse.json({ error: 'Action already completed today' }, { status: 400 });
    }

    // Execute completion transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create DailyAction record (marking as completed)
      const completedAction = await tx.dailyAction.create({
        data: {
          userId,
          actionId,
          title: actionDef.title,
          category: actionDef.category,
          co2SavedKg: actionDef.co2SavedKg,
          points: actionDef.points,
          date: today,
        },
      });

      // 2. Fetch or create user Streak/XP status
      let streak = await tx.streak.findUnique({
        where: { userId },
      });

      if (!streak) {
        streak = await tx.streak.create({
          data: {
            userId,
            currentStreak: 0,
            longestStreak: 0,
            totalPoints: 0,
            level: 1,
            lastActiveDate: null,
          },
        });
      }

      // Update streaks
      const streakUpdate = updateStreak({
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActiveDate: streak.lastActiveDate,
      }, today);

      const newTotalPoints = streak.totalPoints + actionDef.points;
      const newLevel = calculateLevel(newTotalPoints);

      const updatedStreak = await tx.streak.update({
        where: { userId },
        data: {
          currentStreak: streakUpdate.currentStreak,
          longestStreak: streakUpdate.longestStreak,
          lastActiveDate: streakUpdate.lastActiveDate,
          totalPoints: newTotalPoints,
          level: newLevel,
        },
      });

      // 3. Check Badge Eligibility
      // Fetch categories previously logged
      const userLogs = await tx.carbonLog.findMany({
        where: { userId },
        select: { category: true },
      });
      const categoriesLogged = Array.from(new Set(userLogs.map((l) => l.category)));

      // Fetch user's existing badges
      const userBadges = await tx.badge.findMany({
        where: { userId },
        select: { badgeId: true },
      });
      const existingBadgeIds = userBadges.map((b) => b.badgeId);

      const eligibleBadges = checkBadgeEligibility({
        currentStreak: streakUpdate.currentStreak,
        totalPoints: newTotalPoints,
        level: newLevel,
        hasLoggedFirst: userLogs.length > 0,
        loggedCategories: categoriesLogged,
        existingBadgeIds,
      });

      // Award new badges
      const earnedBadges = [];
      for (const badge of eligibleBadges) {
        const createdBadge = await tx.badge.create({
          data: {
            userId,
            badgeId: badge.id,
            name: badge.name,
            description: badge.description,
          },
        });
        earnedBadges.push(createdBadge);
      }

      return {
        completedAction,
        streak: updatedStreak,
        newBadges: earnedBadges,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('POST daily action error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
