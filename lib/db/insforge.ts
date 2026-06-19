import { createClient } from '@insforge/sdk';
import { logger } from '../utils/logger';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  logger.warn('InsForge', 'InsForge credentials missing from environment. Realtime and auth SDK calls might fail.');
}

export const insforge = createClient({
  baseUrl: baseUrl || 'https://5txxs49x.us-east.insforge.app',
  anonKey: anonKey || 'ik_fa107257023ca1a378efc03ef89bf3e9'
});
