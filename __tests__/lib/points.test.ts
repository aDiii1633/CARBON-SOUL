import { calculateLevel, getLevelName, LEVEL_THRESHOLDS, REWARD_POINTS } from '../../lib/gamification/points';

describe('Points & Level System', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0 points', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('should return level 1 for points below Sapling threshold', () => {
      expect(calculateLevel(50)).toBe(1);
      expect(calculateLevel(99)).toBe(1);
    });

    it('should return level 2 at exactly 100 points (Sapling)', () => {
      expect(calculateLevel(100)).toBe(2);
    });

    it('should return level 2 for points between Sapling and Tree', () => {
      expect(calculateLevel(250)).toBe(2);
      expect(calculateLevel(499)).toBe(2);
    });

    it('should return level 3 at exactly 500 points (Tree)', () => {
      expect(calculateLevel(500)).toBe(3);
    });

    it('should return level 4 at exactly 2000 points (Forest)', () => {
      expect(calculateLevel(2000)).toBe(4);
    });

    it('should return level 4 for points between Forest and EcoHero', () => {
      expect(calculateLevel(3000)).toBe(4);
      expect(calculateLevel(4999)).toBe(4);
    });

    it('should return level 5 at exactly 5000 points (EcoHero)', () => {
      expect(calculateLevel(5000)).toBe(5);
    });

    it('should return level 5 for very high points', () => {
      expect(calculateLevel(100000)).toBe(5);
    });
  });

  describe('getLevelName', () => {
    it('should return correct names for all levels', () => {
      expect(getLevelName(1)).toBe('Seedling');
      expect(getLevelName(2)).toBe('Sapling');
      expect(getLevelName(3)).toBe('Tree');
      expect(getLevelName(4)).toBe('Forest');
      expect(getLevelName(5)).toBe('EcoHero');
    });

    it('should return Seedling for unknown levels', () => {
      expect(getLevelName(0)).toBe('Seedling');
      expect(getLevelName(99)).toBe('Seedling');
    });
  });

  describe('LEVEL_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(LEVEL_THRESHOLDS[1]).toBe(0);
      expect(LEVEL_THRESHOLDS[2]).toBe(100);
      expect(LEVEL_THRESHOLDS[3]).toBe(500);
      expect(LEVEL_THRESHOLDS[4]).toBe(2000);
      expect(LEVEL_THRESHOLDS[5]).toBe(5000);
    });
  });

  describe('REWARD_POINTS', () => {
    it('should have correct reward values', () => {
      expect(REWARD_POINTS.LOG_CARBON_ENTRY).toBe(15);
      expect(REWARD_POINTS.COMPLETED_CHALLENGE).toBe(100);
      expect(REWARD_POINTS.COMPLETE_DAILY_ACTION).toBeDefined();
    });
  });
});
