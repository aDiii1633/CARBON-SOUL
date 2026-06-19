export type CarbonCategory = 'transport' | 'energy' | 'food' | 'shopping' | 'waste';

export interface CategoryMetadata {
  id: CarbonCategory;
  name: string;
  color: string;
  icon: string;
}

export const CARBON_CATEGORIES: Record<CarbonCategory, CategoryMetadata> = {
  transport: {
    id: 'transport',
    name: 'Transport',
    color: 'bg-blue-500',
    icon: 'Car'
  },
  energy: {
    id: 'energy',
    name: 'Energy',
    color: 'bg-amber-500',
    icon: 'Zap'
  },
  food: {
    id: 'food',
    name: 'Food',
    color: 'bg-emerald-500',
    icon: 'Utensils'
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    color: 'bg-purple-500',
    icon: 'ShoppingBag'
  },
  waste: {
    id: 'waste',
    name: 'Waste',
    color: 'bg-red-500',
    icon: 'Trash2'
  }
};
