import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Get Streak info
    let streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.streak.create({
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

    // Get earned Badges
    const badges = await prisma.badge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });

    // Check challenge progress (e.g., number of car-free commutes logged this week)
    // For demonstration, let's say a challenge is "Log 5 transport entries"
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const logsThisWeekCount = await prisma.carbonLog.count({
      where: {
        userId,
        date: { gte: startOfWeek },
      },
    });

    return NextResponse.json({
      streak: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActiveDate: streak.lastActiveDate,
        totalPoints: streak.totalPoints,
        level: streak.level,
      },
      badges,
      challenge: {
        title: 'Weekly Carbon Reduction Challenge',
        description: 'Log 5 carbon footprint entries this week to earn the Eco-Master badge!',
        progress: Math.min(logsThisWeekCount, 5),
        target: 5,
        completed: logsThisWeekCount >= 5,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Streaks API route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
