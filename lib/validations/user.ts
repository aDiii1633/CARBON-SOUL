import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileSchema = z.object({
  country: z.string().default('IN'),
  transportMode: z.string().default('car'),
  dietType: z.enum(['vegan', 'vegetarian', 'omnivore', 'meat-heavy']).default('omnivore'),
  homeType: z.string().default('apartment'),
  householdSize: z.number().int().positive().default(2),
  electricityKwh: z.number().nonnegative().default(0),
  weeklyDriveKm: z.number().nonnegative().default(0),
  flightsPerYear: z.number().int().nonnegative().default(0),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
