import { updateStreak, getLocalDateString, getYesterdayDateString } from '../../lib/gamification/streaks';
import { calculateLevel, LEVEL_THRESHOLDS } from '../../lib/gamification/points';
import { checkBadgeEligibility } from '../../lib/gamification/badges';

describe('Gamification Streaks, Levels and Badges', () => {
  // 1. Streak tests
  describe('updateStreak', () => {
    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();

    it('should initialize streak to 1 on first active log', () => {
      const state = { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
      const updated = updateStreak(state, today);
      expect(updated.currentStreak).toBe(1);
      expect(updated.longestStreak).toBe(1);
      expect(updated.lastActiveDate).toBe(today);
    });

    it('should increment streak on consecutive active logs', () => {
      const state = { currentStreak: 2, longestStreak: 2, lastActiveDate: yesterday };
      const updated = updateStreak(state, today);
      expect(updated.currentStreak).toBe(3);
      expect(updated.longestStreak).toBe(3);
      expect(updated.lastActiveDate).toBe(today);
    });

    it('should not change streak if logged twice on the same day', () => {
      const state = { currentStreak: 2, longestStreak: 2, lastActiveDate: today };
      const updated = updateStreak(state, today);
      expect(updated.currentStreak).toBe(2);
      expect(updated.lastActiveDate).toBe(today);
    });

    it('should reset streak to 1 if consecutive day is missed', () => {
      const longAgo = '2026-06-10';
      const state = { currentStreak: 5, longestStreak: 5, lastActiveDate: longAgo };
      const updated = updateStreak(state, today);
      expect(updated.currentStreak).toBe(1);
      expect(updated.longestStreak).toBe(5); // longest remains intact
      expect(updated.lastActiveDate).toBe(today);
    });
  });

  // 2. Level calculation tests
  describe('calculateLevel', () => {
    it('should return correct level according to points thresholds', () => {
      expect(calculateLevel(50)).toBe(1); // Seedling
      expect(calculateLevel(100)).toBe(2); // Sapling threshold
      expect(calculateLevel(450)).toBe(2);
      expect(calculateLevel(500)).toBe(3); // Tree threshold
      expect(calculateLevel(2500)).toBe(4); // Forest threshold
      expect(calculateLevel(6000)).toBe(5); // EcoHero threshold
    });
  });

  // 3. Badges eligibility checks
  describe('checkBadgeEligibility', () => {
    it('should check badge unlock criteria correctly', () => {
      // First log badge
      const badges1 = checkBadgeEligibility({
        currentStreak: 1,
        totalPoints: 15,
        level: 1,
        hasLoggedFirst: true,
        loggedCategories: ['transport'],
        existingBadgeIds: [],
      });
      expect(badges1.map((b) => b.id)).toContain('first-log');

      // Streak-3 badge
      const badges2 = checkBadgeEligibility({
        currentStreak: 3,
        totalPoints: 100,
        level: 2,
        hasLoggedFirst: true,
        loggedCategories: ['transport'],
        existingBadgeIds: ['first-log'],
      });
      expect(badges2.map((b) => b.id)).toContain('streak-3');

      // All categories badge
      const badges3 = checkBadgeEligibility({
        currentStreak: 5,
        totalPoints: 600,
        level: 3,
        hasLoggedFirst: true,
        loggedCategories: ['transport', 'energy', 'food', 'shopping', 'waste'],
        existingBadgeIds: ['first-log', 'streak-3'],
      });
      expect(badges3.map((b) => b.id)).toContain('all-categories');
    });
  });
});
