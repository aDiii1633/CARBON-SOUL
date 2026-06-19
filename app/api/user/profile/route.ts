import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserProfile } from '@/lib/services/user.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const result = await getUserProfile(userId);

  if ('error' in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 500 });
  }

  return NextResponse.json(result.profile, { status: 200 });
}
