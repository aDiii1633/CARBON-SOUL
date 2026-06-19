/**
 * Helper to get YYYY-MM-DD formatted date string in local or standard timezone
 */
export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(date = new Date()): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

/**
 * Updates streak based on last active date
 * @param streak The current streak state from the DB
 * @param todayStr The date string for today (defaults to current date YYYY-MM-DD)
 */
export function updateStreak(streak: StreakState, todayStr?: string): StreakState {
  const today = todayStr || getLocalDateString();
  const lastActive = streak.lastActiveDate;

  if (!lastActive) {
    // First time completing an action
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, streak.longestStreak),
      lastActiveDate: today,
    };
  }

  if (lastActive === today) {
    // Already did an action today, streak doesn't change
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: today,
    };
  }

  const yesterday = getYesterdayDateString(new Date(today));

  if (lastActive === yesterday) {
    // Completed action on consecutive day
    const newStreak = streak.currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastActiveDate: today,
    };
  }

  // Missed a day (broken streak) -> resets to 1
  return {
    currentStreak: 1,
    longestStreak: streak.longestStreak,
    lastActiveDate: today,
  };
}
