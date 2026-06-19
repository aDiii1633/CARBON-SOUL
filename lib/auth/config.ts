import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { insforge } from '../db/insforge';
import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';

export const authConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // 1. Authenticate using InsForge Auth SDK
        const { data, error } = await insforge.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data || !data.user) {
          logger.error('Auth/SignIn', error || 'No InsForge user data returned');
          return null;
        }

        // 2. Fetch or create user in SQLite local database
        let user = await prisma.user.findUnique({
          where: { email },
          include: { profile: true },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              id: data.user.id, // Align internal ID with InsForge
              email,
              name: email.split('@')[0],
            },
            include: { profile: true },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-google-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-google-secret',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;

        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split('@')[0],
            },
          });
        }
        user.id = dbUser.id;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
