import { prisma } from '@/lib/db/prisma';
import { getLocalDateString, updateStreak } from '@/lib/gamification/streaks';
import { calculateLevel } from '@/lib/gamification/points';
import { checkBadgeEligibility } from '@/lib/gamification/badges';
import { PREDEFINED_ACTIONS } from '@/lib/constants/daily-actions';
import { getDeterministicDailyActions } from '@/lib/utils/daily-action-picker';
import { logger } from '@/lib/utils/logger';

export async function getDailyActions(userId: string) {
  try {
    const today = getLocalDateString();
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

    const generated = getDeterministicDailyActions(userId, today, topCategory);
    const completed = await prisma.dailyAction.findMany({
      where: { userId, date: today },
    });
    const completedIds = completed.map(c => c.actionId);

    const actions = generated.map(a => ({
      ...a,
      completed: completedIds.includes(a.actionId),
      completedAt: completed.find(c => c.actionId === a.actionId)?.completedAt || null,
    }));

    return { actions };
  } catch (error) {
    logger.error('getDailyActions error:', error as Error);
    return { error: 'Internal Server Error', status: 500 };
  }
}

export async function completeDailyAction(actionId: string, userId: string) {
  try {
    if (!actionId || typeof actionId !== 'string') {
      return { error: 'Action ID is required', status: 400 };
    }

    const today = getLocalDateString();
    const actionDef = PREDEFINED_ACTIONS.find(a => a.actionId === actionId);
    if (!actionDef) {
      return { error: 'Invalid action ID', status: 400 };
    }

    const existing = await prisma.dailyAction.findFirst({
      where: { userId, actionId, date: today },
    });

    if (existing) {
      return { error: 'Action already completed today', status: 400 };
    }

    const result = await prisma.$transaction(async (tx) => {
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

      let streak = await tx.streak.findUnique({ where: { userId } });
      if (!streak) {
        streak = await tx.streak.create({
          data: { userId, currentStreak: 0, longestStreak: 0, totalPoints: 0, level: 1, lastActiveDate: null },
        });
      }

      const streakUpdate = updateStreak({
        currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, lastActiveDate: streak.lastActiveDate,
      }, today);

      const newTotalPoints = streak.totalPoints + actionDef.points;
      const newLevel = calculateLevel(newTotalPoints);

      const updatedStreak = await tx.streak.update({
        where: { userId },
        data: {
          currentStreak: streakUpdate.currentStreak, longestStreak: streakUpdate.longestStreak, lastActiveDate: streakUpdate.lastActiveDate, totalPoints: newTotalPoints, level: newLevel,
        },
      });

      const userLogs = await tx.carbonLog.findMany({ where: { userId }, select: { category: true } });
      const categoriesLogged = Array.from(new Set(userLogs.map((l) => l.category)));

      const userBadges = await tx.badge.findMany({ where: { userId }, select: { badgeId: true } });
      const existingBadgeIds = userBadges.map((b) => b.badgeId);

      const eligibleBadges = checkBadgeEligibility({
        currentStreak: streakUpdate.currentStreak, totalPoints: newTotalPoints, level: newLevel, hasLoggedFirst: userLogs.length > 0, loggedCategories: categoriesLogged, existingBadgeIds,
      });

      const earnedBadges = [];
      for (const badge of eligibleBadges) {
        const createdBadge = await tx.badge.create({
          data: { userId, badgeId: badge.id, name: badge.name, description: badge.description },
        });
        earnedBadges.push(createdBadge);
      }

      return { completedAction, streak: updatedStreak, newBadges: earnedBadges };
    });

    return result;
  } catch (error) {
    logger.error('completeDailyAction error:', error as Error);
    return { error: 'Internal Server Error', status: 500 };
  }
}

export async function getStreaksInfo(userId: string) {
  try {
    let streak = await prisma.streak.findUnique({ where: { userId } });
    if (!streak) {
      streak = await prisma.streak.create({
        data: { userId, currentStreak: 0, longestStreak: 0, totalPoints: 0, level: 1, lastActiveDate: null },
      });
    }

    const badges = await prisma.badge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const logsThisWeekCount = await prisma.carbonLog.count({
      where: { userId, date: { gte: startOfWeek } },
    });

    return {
      streak: {
        currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, lastActiveDate: streak.lastActiveDate, totalPoints: streak.totalPoints, level: streak.level,
      },
      badges,
      challenge: {
        title: 'Weekly Carbon Reduction Challenge',
        description: 'Log 5 carbon footprint entries this week to earn the Eco-Master badge!',
        progress: Math.min(logsThisWeekCount, 5),
        target: 5,
        completed: logsThisWeekCount >= 5,
      },
    };
  } catch (error) {
    logger.error('getStreaksInfo error:', error as Error);
    return { error: 'Internal Server Error', status: 500 };
  }
}
