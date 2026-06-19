import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/services/auth.service';

export async function POST(req: Request) {
  const body = await req.json();
  const result = await registerUser(body);

  if ('error' in result && result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 500 });
  }

  return NextResponse.json({ success: true, userId: result.userId }, { status: 201 });
}
