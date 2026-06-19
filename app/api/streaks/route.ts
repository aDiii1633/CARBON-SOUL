import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStreaksInfo } from '@/lib/services/gamification.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getStreaksInfo(session.user.id);

  if ('error' in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
