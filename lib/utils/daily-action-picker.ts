/**
 * Deterministically generates today's 5 daily actions for a user.
 * Shared by both the dashboard layout (server) and the actions API route.
 */

import { PREDEFINED_ACTIONS, PredefinedAction } from '@/lib/constants/daily-actions';

/**
 * Picks 5 daily actions using a deterministic hash of userId + date.
 * Prioritises actions from the user's highest-emission category.
 *
 * @param userId - The authenticated user's ID
 * @param dateStr - Today's date in YYYY-MM-DD format
 * @param topCategory - The user's top carbon-emission category
 * @returns An array of 5 PredefinedAction objects
 */
export function getDeterministicDailyActions(
  userId: string,
  dateStr: string,
  topCategory: string,
): PredefinedAction[] {
  // Simple hash seed from userId + date
  let hash = 0;
  const seedString = `${userId}-${dateStr}`;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Partition actions by category
  const topCatActions = PREDEFINED_ACTIONS.filter((a) => a.category === topCategory);
  const otherCatActions = PREDEFINED_ACTIONS.filter((a) => a.category !== topCategory);

  const selected: PredefinedAction[] = [];

  // Pick up to 3 from the top emission category
  const topCount = Math.min(3, topCatActions.length);
  for (let i = 0; i < topCount; i++) {
    const idx = Math.abs(hash + i) % topCatActions.length;
    selected.push(topCatActions[idx]);
    topCatActions.splice(idx, 1);
  }

  // Fill the remaining 2 slots from other categories
  const needed = 5 - selected.length;
  for (let i = 0; i < needed; i++) {
    if (otherCatActions.length === 0) break;
    const idx = Math.abs(hash + 10 + i) % otherCatActions.length;
    selected.push(otherCatActions[idx]);
    otherCatActions.splice(idx, 1);
  }

  return selected;
}
