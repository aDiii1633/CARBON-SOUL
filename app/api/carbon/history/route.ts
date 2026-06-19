import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20')));

    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      prisma.carbonLog.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.carbonLog.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }, { status: 200 });
  } catch (error) {
    logger.error('GET /api/carbon/history', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
