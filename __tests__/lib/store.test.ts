import { useAppStore } from '../../lib/store';
import { act } from '@testing-library/react';

describe('Global App Store (Zustand)', () => {
  beforeEach(() => {
    act(() => {
      // Reset store before each test using an empty payload
      useAppStore.getState().setInitialState({
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        badges: [],
        dailyActions: [],
        carbonLogs: [],
      });
    });
  });

  it('should correctly set initial state and calculate derivatives', () => {
    act(() => {
      useAppStore.getState().setInitialState({
        points: 150,
        currentStreak: 2,
        longestStreak: 5,
        lastActiveDate: '2026-06-19',
        badges: [],
        dailyActions: [
          { id: '1', actionId: 'act1', title: 'Test', category: 'food', co2SavedKg: 2, completed: true, points: 10 },
          { id: '2', actionId: 'act2', title: 'Test 2', category: 'energy', co2SavedKg: 1.5, completed: false, points: 10 },
        ],
        carbonLogs: [
          { id: 'l1', date: new Date().toISOString(), category: 'transport', activity: 'Drive', amount: 10, unit: 'km', co2Kg: 5 },
        ],
      });
    });

    const state = useAppStore.getState();
    expect(state.points).toBe(150);
    expect(state.level).toBe(2); // Sapling
    expect(state.levelName).toBe('Sapling');
    expect(state.totalSavedCo2).toBe(2); // Only completed actions
    expect(state.monthlyCo2).toBe(5);
    expect(state.dailyAverage).toBe(5);
    expect(state.isLoaded).toBe(true);
  });

  it('should correctly add points and recalculate level', () => {
    act(() => {
      useAppStore.getState().addPoints(500); // Level 3 Tree threshold
    });

    const state = useAppStore.getState();
    expect(state.points).toBe(500);
    expect(state.level).toBe(3);
    expect(state.levelName).toBe('Tree');
  });

  it('should correctly complete a daily action and update derived states', () => {
    act(() => {
      useAppStore.getState().setInitialState({
        points: 0, currentStreak: 0, longestStreak: 0, lastActiveDate: null, badges: [], carbonLogs: [],
        dailyActions: [
          { id: '1', actionId: 'act1', title: 'Test', category: 'food', co2SavedKg: 2.5, completed: false, points: 50 },
        ],
      });
    });

    act(() => {
      useAppStore.getState().completeAction('act1');
    });

    const state = useAppStore.getState();
    expect(state.dailyActions[0].completed).toBe(true);
    expect(state.points).toBe(50);
    expect(state.totalSavedCo2).toBe(2.5);
  });

  it('should ignore completing an already completed action', () => {
    act(() => {
      useAppStore.getState().setInitialState({
        points: 0, currentStreak: 0, longestStreak: 0, lastActiveDate: null, badges: [], carbonLogs: [],
        dailyActions: [
          { id: '1', actionId: 'act1', title: 'Test', category: 'food', co2SavedKg: 2.5, completed: true, points: 50 },
        ],
      });
    });

    act(() => {
      useAppStore.getState().completeAction('act1');
    });

    const state = useAppStore.getState();
    expect(state.points).toBe(0); // Points not added again
  });

  it('should correctly add a carbon log and award points', () => {
    act(() => {
      useAppStore.getState().addCarbonLog({
        id: 'l1', date: new Date().toISOString(), category: 'waste', activity: 'Trash', amount: 10, unit: 'kg', co2Kg: 5
      });
    });

    const state = useAppStore.getState();
    expect(state.carbonLogs).toHaveLength(1);
    expect(state.points).toBe(15); // REWARD_POINTS.LOG_CARBON_ENTRY
    expect(state.monthlyCo2).toBe(5);
  });
});
