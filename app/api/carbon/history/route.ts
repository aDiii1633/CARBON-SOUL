import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCarbonHistory } from '@/lib/services/carbon.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20')));

  const result = await getCarbonHistory(session.user.id, page, limit);

  if ('error' in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
