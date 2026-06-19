import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDailyActions, completeDailyAction } from '@/lib/services/gamification.service';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getDailyActions(session.user.id);
  
  if ('error' in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 500 });
  }

  return NextResponse.json(result.actions, { status: 200 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { actionId } = body;

  const result = await completeDailyAction(actionId, session.user.id);

  if ('error' in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
