import { z } from 'zod';

export const carbonLogSchema = z.object({
  category: z.enum(['transport', 'energy', 'food', 'shopping', 'waste']),
  activity: z.string().min(1, 'Activity description is required').max(500, 'Activity description is too long'),
  amount: z.number().nonnegative('Amount must be positive or zero').max(1000000, 'Amount exceeds maximum'),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit is too long'),
  co2Kg: z.number().nonnegative('Calculated CO2 must be positive or zero').max(1000000, 'CO2 value exceeds maximum'),
  notes: z.string().max(1000, 'Notes must be under 1000 characters').optional(),
});

export type CarbonLogInput = z.infer<typeof carbonLogSchema>;
