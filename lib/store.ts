import { create } from 'zustand';
import { calculateLevel, getLevelName } from './gamification/points';
import { BadgeDefinition } from './gamification/badges';

export interface DailyActionState {
  id: string;
  actionId: string;
  title: string;
  category: string;
  co2SavedKg: number;
  completed: boolean;
  points: number;
}

export interface CarbonLogState {
  id: string;
  date: string;
  category: string;
  activity: string;
  amount: number;
  unit: string;
  co2Kg: number;
  notes?: string;
}

interface AppStore {
  points: number;
  level: number;
  levelName: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  badges: BadgeDefinition[];
  dailyActions: DailyActionState[];
  carbonLogs: CarbonLogState[];
  totalSavedCo2: number;
  monthlyCo2: number;
  dailyAverage: number;
  isLoaded: boolean;
  
  // Actions
  setInitialState: (data: {
    points: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
    badges: BadgeDefinition[];
    dailyActions: DailyActionState[];
    carbonLogs: CarbonLogState[];
  }) => void;
  
  addPoints: (amount: number) => void;
  completeAction: (actionId: string) => void;
  addCarbonLog: (log: CarbonLogState) => void;
  resetActions: (newActions: DailyActionState[]) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  points: 0,
  level: 1,
  levelName: 'Seedling',
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  badges: [],
  dailyActions: [],
  carbonLogs: [],
  totalSavedCo2: 0,
  monthlyCo2: 0,
  dailyAverage: 0,
  isLoaded: false,

  setInitialState: (data) => set(() => {
    const level = calculateLevel(data.points);
    const totalSaved = data.dailyActions
      .filter(a => a.completed)
      .reduce((sum, a) => sum + a.co2SavedKg, 0);

    // Calculate monthly co2
    const now = new Date();
    const currentMonthLogs = data.carbonLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    });
    const monthlyCo2 = currentMonthLogs.reduce((sum, log) => sum + log.co2Kg, 0);

    // Daily average
    const dailyAverage = data.carbonLogs.length > 0 
      ? data.carbonLogs.reduce((sum, log) => sum + log.co2Kg, 0) / Math.max(1, data.carbonLogs.length)
      : 0;

    return {
      points: data.points,
      level,
      levelName: getLevelName(level),
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      lastActiveDate: data.lastActiveDate,
      badges: data.badges,
      dailyActions: data.dailyActions,
      carbonLogs: data.carbonLogs,
      totalSavedCo2: parseFloat(totalSaved.toFixed(2)),
      monthlyCo2: parseFloat(monthlyCo2.toFixed(2)),
      dailyAverage: parseFloat(dailyAverage.toFixed(2)),
      isLoaded: true,
    };
  }),

  addPoints: (amount) => set((state) => {
    const newPoints = state.points + amount;
    const newLevel = calculateLevel(newPoints);
    return {
      points: newPoints,
      level: newLevel,
      levelName: getLevelName(newLevel),
    };
  }),

  completeAction: (actionId) => set((state) => {
    let completedPoints = 0;
    let completedSaved = 0;
    const updatedActions = state.dailyActions.map((action) => {
      if (action.actionId === actionId && !action.completed) {
        completedPoints = action.points;
        completedSaved = action.co2SavedKg;
        return { ...action, completed: true };
      }
      return action;
    });

    if (completedPoints === 0) return {}; // already completed or not found

    const newPoints = state.points + completedPoints;
    const newLevel = calculateLevel(newPoints);

    return {
      dailyActions: updatedActions,
      points: newPoints,
      level: newLevel,
      levelName: getLevelName(newLevel),
      totalSavedCo2: parseFloat((state.totalSavedCo2 + completedSaved).toFixed(2)),
    };
  }),

  addCarbonLog: (log) => set((state) => {
    const updatedLogs = [log, ...state.carbonLogs];
    const now = new Date();
    
    const currentMonthLogs = updatedLogs.filter(l => {
      const logDate = new Date(l.date);
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    });
    const monthlyCo2 = currentMonthLogs.reduce((sum, l) => sum + l.co2Kg, 0);
    const dailyAverage = updatedLogs.reduce((sum, l) => sum + l.co2Kg, 0) / updatedLogs.length;

    // Award points for logging
    const pointsForLog = 15; // REWARD_POINTS.LOG_CARBON_ENTRY
    const newPoints = state.points + pointsForLog;
    const newLevel = calculateLevel(newPoints);

    return {
      carbonLogs: updatedLogs,
      points: newPoints,
      level: newLevel,
      levelName: getLevelName(newLevel),
      monthlyCo2: parseFloat(monthlyCo2.toFixed(2)),
      dailyAverage: parseFloat(dailyAverage.toFixed(2)),
    };
  }),

  resetActions: (newActions) => set(() => {
    const totalSaved = newActions
      .filter(a => a.completed)
      .reduce((sum, a) => sum + a.co2SavedKg, 0);

    return {
      dailyActions: newActions,
      totalSavedCo2: parseFloat(totalSaved.toFixed(2)),
    };
  })
}));
