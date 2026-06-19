/**
 * Predefined sustainability actions used for daily action generation.
 * Single source of truth — imported by both the dashboard layout and the actions API route.
 */

export interface PredefinedAction {
  actionId: string;
  title: string;
  category: string;
  co2SavedKg: number;
  points: number;
}

export const PREDEFINED_ACTIONS: PredefinedAction[] = [
  { actionId: 'walk-2km', title: 'Walk instead of drive (2km)', category: 'transport', co2SavedKg: 0.4, points: 20 },
  { actionId: 'meat-free', title: 'Go meat-free today', category: 'food', co2SavedKg: 2.5, points: 50 },
  { actionId: 'unplug-devices', title: 'Unplug unused devices', category: 'energy', co2SavedKg: 0.1, points: 10 },
  { actionId: 'second-hand', title: 'Buy second-hand item', category: 'shopping', co2SavedKg: 1.2, points: 30 },
  { actionId: 'compost', title: 'Compost food waste today', category: 'waste', co2SavedKg: 0.3, points: 15 },
  { actionId: 'bus-commute', title: 'Take the bus instead of car', category: 'transport', co2SavedKg: 1.2, points: 30 },
  { actionId: 'cold-wash', title: 'Wash clothes in cold water', category: 'energy', co2SavedKg: 0.3, points: 15 },
  { actionId: 'no-waste', title: 'Finish all leftovers', category: 'food', co2SavedKg: 0.8, points: 20 },
  { actionId: 'recycle-paper', title: 'Recycle paper and cardboard', category: 'waste', co2SavedKg: 0.2, points: 10 },
  { actionId: 'no-plastic', title: 'Avoid single-use plastic', category: 'waste', co2SavedKg: 0.4, points: 15 },
];
