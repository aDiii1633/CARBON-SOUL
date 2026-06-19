import { z } from 'zod';

export const carbonLogSchema = z.object({
  category: z.enum(['transport', 'energy', 'food', 'shopping', 'waste']),
  activity: z.string().min(1, 'Activity description is required'),
  amount: z.number().nonnegative('Amount must be positive or zero'),
  unit: z.string().min(1, 'Unit is required'),
  co2Kg: z.number().nonnegative('Calculated CO2 must be positive or zero'),
  notes: z.string().optional(),
});

export type CarbonLogInput = z.infer<typeof carbonLogSchema>;
