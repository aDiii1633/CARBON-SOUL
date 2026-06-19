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

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('GET user profile API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
