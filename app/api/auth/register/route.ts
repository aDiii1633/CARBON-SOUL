import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { insforge } from '@/lib/db/insforge';
import { registerSchema } from '@/lib/validations/user';
import { logger } from '@/lib/utils/logger';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid register data', details: parsed.error.format() }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    // 1. Sign up user in InsForge
    const { data: insforgeData, error: insforgeError } = await insforge.auth.signUp({
      email,
      password,
      name,
    });

    if (insforgeError || !insforgeData || !insforgeData.user) {
      logger.error('Auth/Register', insforgeError || 'No InsForge user data returned');
      return NextResponse.json({ error: insforgeError?.message || 'InsForge sign-up failed' }, { status: 400 });
    }

    const insforgeUserId = insforgeData.user.id;

    // 2. Hash password for local SQLite storage
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create User & Streak in SQLite
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          id: insforgeUserId, // Align internal ID with InsForge Auth ID
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
        },
      });

      await tx.streak.create({
        data: {
          userId: createdUser.id,
          currentStreak: 0,
          longestStreak: 0,
          totalPoints: 0,
          level: 1,
          lastActiveDate: null,
        },
      });

      return createdUser;
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error: unknown) {
    logger.error('POST /api/auth/register', error);
    const err = error as { code?: string };
    // Handle unique constraint violation on email
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists. Please try signing in instead.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Registration failed. Please try again later.' }, { status: 500 });
  }
}
