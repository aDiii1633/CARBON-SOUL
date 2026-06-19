export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  'streak-3': {
    id: 'streak-3',
    name: 'Green Starter',
    description: 'Log actions for 3 consecutive days',
    icon: 'Flame',
  },
  'streak-7': {
    id: 'streak-7',
    name: 'Eco Warrior',
    description: 'Log actions for 7 consecutive days',
    icon: 'ShieldAlert',
  },
  'streak-30': {
    id: 'streak-30',
    name: 'Carbon Buster',
    description: 'Log actions for 30 consecutive days',
    icon: 'Zap',
  },
  'streak-100': {
    id: 'streak-100',
    name: 'Earth Guardian',
    description: 'Log actions for 100 consecutive days',
    icon: 'Globe',
  },
  'first-log': {
    id: 'first-log',
    name: 'Footprint Finder',
    description: 'Log your very first carbon entry',
    icon: 'Search',
  },
  'all-categories': {
    id: 'all-categories',
    name: 'Eco Master',
    description: 'Log entries in all 5 categories',
    icon: 'Award',
  },
  'level-3': {
    id: 'level-3',
    name: 'Eco Tree-o',
    description: 'Reach Level 3 (Tree)',
    icon: 'Sprout',
  },
  'level-5': {
    id: 'level-5',
    name: 'Eco Hero',
    description: 'Reach Level 5 (EcoHero)',
    icon: 'Crown',
  }
};

export interface BadgeEligibilityInput {
  currentStreak: number;
  totalPoints: number;
  level: number;
  hasLoggedFirst: boolean;
  loggedCategories: string[]; // e.g. ['transport', 'food', ...]
  existingBadgeIds: string[];
}

export function checkBadgeEligibility(input: BadgeEligibilityInput): BadgeDefinition[] {
  const eligibleBadges: BadgeDefinition[] = [];
  const { currentStreak, level, hasLoggedFirst, loggedCategories, existingBadgeIds } = input;

  const addIfNew = (badgeId: string) => {
    if (!existingBadgeIds.includes(badgeId) && BADGE_DEFINITIONS[badgeId]) {
      eligibleBadges.push(BADGE_DEFINITIONS[badgeId]);
    }
  };

  // Check streaks
  if (currentStreak >= 3) addIfNew('streak-3');
  if (currentStreak >= 7) addIfNew('streak-7');
  if (currentStreak >= 30) addIfNew('streak-30');
  if (currentStreak >= 100) addIfNew('streak-100');

  // Check logs
  if (hasLoggedFirst) addIfNew('first-log');

  // Check categories
  const uniqueCategories = Array.from(new Set(loggedCategories));
  if (
    uniqueCategories.includes('transport') &&
    uniqueCategories.includes('energy') &&
    uniqueCategories.includes('food') &&
    uniqueCategories.includes('shopping') &&
    uniqueCategories.includes('waste')
  ) {
    addIfNew('all-categories');
  }

  // Check levels
  if (level >= 3) addIfNew('level-3');
  if (level >= 5) addIfNew('level-5');

  return eligibleBadges;
}
