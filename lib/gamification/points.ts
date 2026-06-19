export const REWARD_POINTS = {
  LOG_CARBON_ENTRY: 15,
  COMPLETE_DAILY_ACTION: {
    transport: 20,
    food: 50,
    energy: 10,
    shopping: 30,
    waste: 15,
  },
  COMPLETED_CHALLENGE: 100,
};

export const LEVEL_THRESHOLDS = {
  1: 0,       // Seedling
  2: 100,     // Sapling
  3: 500,     // Tree
  4: 2000,    // Forest
  5: 5000,    // EcoHero
};

export function calculateLevel(totalPoints: number): number {
  if (totalPoints >= LEVEL_THRESHOLDS[5]) return 5;
  if (totalPoints >= LEVEL_THRESHOLDS[4]) return 4;
  if (totalPoints >= LEVEL_THRESHOLDS[3]) return 3;
  if (totalPoints >= LEVEL_THRESHOLDS[2]) return 2;
  return 1;
}

export function getLevelName(level: number): string {
  switch (level) {
    case 1: return 'Seedling';
    case 2: return 'Sapling';
    case 3: return 'Tree';
    case 4: return 'Forest';
    case 5: return 'EcoHero';
    default: return 'Seedling';
  }
}
