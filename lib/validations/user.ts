import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password is too long'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
});

export const profileSchema = z.object({
  country: z.string().max(10, 'Country code is too long').default('IN'),
  transportMode: z.string().max(50, 'Transport mode is too long').default('car'),
  dietType: z.enum(['vegan', 'vegetarian', 'omnivore', 'meat-heavy']).default('omnivore'),
  homeType: z.string().max(50, 'Home type is too long').default('apartment'),
  householdSize: z.number().int().positive().max(20, 'Household size must be 20 or less').default(2),
  electricityKwh: z.number().nonnegative().max(100000, 'Electricity value exceeds maximum').default(0),
  weeklyDriveKm: z.number().nonnegative().max(10000, 'Weekly driving exceeds maximum').default(0),
  flightsPerYear: z.number().int().nonnegative().max(365, 'Flights per year exceeds maximum').default(0),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
