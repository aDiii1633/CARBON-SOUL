import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { carbonLogSchema } from '@/lib/validations/carbon';
import { updateStreak, getLocalDateString } from '@/lib/gamification/streaks';
import { calculateLevel, REWARD_POINTS } from '@/lib/gamification/points';
import { checkBadgeEligibility } from '@/lib/gamification/badges';
import { logger } from '@/lib/utils/logger';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Validate request body
    const body = await req.json();
    const parsed = carbonLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input data', details: parsed.error.format() }, { status: 400 });
    }

    const { category, activity, amount, unit, co2Kg, notes } = parsed.data;

    // 3. Perform atomic database operations
    const result = await prisma.$transaction(async (tx) => {
      // Create Carbon Log
      const carbonLog = await tx.carbonLog.create({
        data: {
          userId,
          category,
          activity,
          amount,
          unit,
          co2Kg,
          notes,
        },
      });

      // Get or create Streak
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

      // Update active streak
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

      // Fetch categories previously logged for badges
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

      // Check badge eligibility
      const eligibleBadges = checkBadgeEligibility({
        currentStreak: streakUpdate.currentStreak,
        totalPoints: newTotalPoints,
        level: newLevel,
        hasLoggedFirst: true,
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
        carbonLog,
        streak: updatedStreak,
        newBadges: earnedBadges,
        pointsEarned,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.error('POST /api/carbon/calculate', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
