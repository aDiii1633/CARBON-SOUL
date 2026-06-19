import { prisma } from '@/lib/db/prisma';
import { carbonLogSchema } from '@/lib/validations/carbon';
import { updateStreak, getLocalDateString } from '@/lib/gamification/streaks';
import { calculateLevel, REWARD_POINTS } from '@/lib/gamification/points';
import { checkBadgeEligibility } from '@/lib/gamification/badges';
import { logger } from '@/lib/utils/logger';

export async function logCarbonEntry(data: unknown, userId: string) {
  const parsed = carbonLogSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid input data', status: 400 };
  }

  const { category, activity, amount, unit, co2Kg, notes } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const carbonLog = await tx.carbonLog.create({
        data: { userId, category, activity, amount, unit, co2Kg, notes },
      });

      let streak = await tx.streak.findUnique({ where: { userId } });
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

      const today = getLocalDateString();
      const streakUpdate = updateStreak({
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActiveDate: streak.lastActiveDate,
      }, today);

      const pointsEarned = REWARD_POINTS.LOG_CARBON_ENTRY;
      const newTotalPoints = streak.totalPoints + pointsEarned;
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

      const userLogs = await tx.carbonLog.findMany({
        where: { userId },
        select: { category: true },
      });
      const categoriesLogged = Array.from(new Set(userLogs.map((l) => l.category)));

      const userBadges = await tx.badge.findMany({
        where: { userId },
        select: { badgeId: true },
      });
      const existingBadgeIds = userBadges.map((b) => b.badgeId);

      const eligibleBadges = checkBadgeEligibility({
        currentStreak: streakUpdate.currentStreak,
        totalPoints: newTotalPoints,
        level: newLevel,
        hasLoggedFirst: true,
        loggedCategories: categoriesLogged,
        existingBadgeIds,
      });

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
        carbonLog,
        streak: updatedStreak,
        newBadges: earnedBadges,
        pointsEarned,
      };
    });

    return result;
  } catch (err) {
    logger.error('logCarbonEntry error:', err as Error);
    return { error: 'Internal Server Error', status: 500 };
  }
}

export async function getCarbonHistory(userId: string, page: number, limit: number) {
  try {
    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      prisma.carbonLog.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.carbonLog.count({
        where: { userId },
      }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    logger.error('getCarbonHistory error:', error as Error);
    return { error: 'Internal Server Error', status: 500 };
  }
}
