import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    logger.error('GET /api/user/profile', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
