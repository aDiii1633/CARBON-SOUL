import { prisma } from '@/lib/db/prisma';
import { insforge } from '@/lib/db/insforge';
import { registerSchema } from '@/lib/validations/user';
import { logger } from '@/lib/utils/logger';
import bcrypt from 'bcryptjs';

export async function registerUser(data: unknown) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid register data', status: 400 };
  }

  const { email, password, name } = parsed.data;

  try {
    const { data: insforgeData, error: insforgeError } = await insforge.auth.signUp({
      email,
      password,
      name,
    });

    if (insforgeError || !insforgeData || !insforgeData.user) {
      logger.error('Auth/Register', insforgeError || 'No InsForge user data returned');
      return { error: insforgeError?.message || 'InsForge sign-up failed', status: 400 };
    }

    const insforgeUserId = insforgeData.user.id;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          id: insforgeUserId,
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

    return { success: true, userId: user.id };
  } catch (error: unknown) {
    logger.error('registerUser error', error as Error);
    const err = error as { code?: string };
    if (err.code === 'P2002') {
      return { error: 'An account with this email already exists. Please try signing in instead.', status: 409 };
    }
    return { error: 'Registration failed. Please try again later.', status: 500 };
  }
}
