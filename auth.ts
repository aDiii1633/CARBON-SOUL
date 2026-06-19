import NextAuth from 'next-auth';
import { authConfig } from './lib/auth/config';

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
export { auth as getServerSession }; // Helper alias to match older getServerSession style if needed
