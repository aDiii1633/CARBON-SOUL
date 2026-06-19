import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { logCarbonEntry } from '@/lib/services/carbon.service';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  const body = await req.json();
  
  const result = await logCarbonEntry(body, userId);
  
  if ('error' in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  }
  
  return NextResponse.json(result, { status: 200 });
}
