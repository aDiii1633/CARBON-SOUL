import { prisma } from '@/lib/db/prisma';
import { profileSchema } from '@/lib/validations/user';
import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateFoodEmissions,
  calculateShoppingEmissions,
  calculateWasteEmissions
} from '@/lib/carbon/calculator';
import { calculateLevel } from '@/lib/gamification/points';
import { logger } from '@/lib/utils/logger';

export async function completeOnboarding(data: unknown, userId: string) {
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid profile data', status: 400 };
  }

  const {
    country,
    transportMode,
    dietType,
    homeType,
    householdSize,
    electricityKwh,
    weeklyDriveKm,
    flightsPerYear
  } = parsed.data;

  const transportKm = weeklyDriveKm * 4.33;
  const transportInput = {
    carPetrolKm: transportMode === 'car' ? transportKm : 0,
    carElectricKm: transportMode === 'electric' ? transportKm : 0,
    busKm: transportMode === 'bus' ? transportKm : 0,
    trainKm: transportMode === 'train' ? transportKm : 0,
    flightShortKm: (flightsPerYear * 1500) / 12,
  };
  const transportCo2 = calculateTransportEmissions(transportInput);

  const energyInput = {
    electricityKwh,
    naturalGasM3: homeType === 'house' ? 25 : 5,
    lpgLiters: 0,
    renewableOffsetPercent: 0,
  };
  const energyCo2 = calculateEnergyEmissions(energyInput);

  const foodInput = { dietType, foodWastePercent: 15 };
  const foodCo2 = calculateFoodEmissions(foodInput) * 4.33;

  const shoppingInput = {
    clothingItemsPerYear: 12,
    electronicsDevicesPerYear: 2,
    onlineDeliveriesPerMonth: 4,
    recyclePackaging: true,
  };
  const shoppingCo2 = calculateShoppingEmissions(shoppingInput);

  const wasteInput = {
    wastePerMonthKg: householdSize * 15,
    recycleRatePercent: 30,
    compost: false,
  };
  const wasteCo2 = calculateWasteEmissions(wasteInput);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.userProfile.upsert({
        where: { userId },
        update: {
          country, transportMode, dietType, homeType, householdSize, electricityKwh, weeklyDriveKm, flightsPerYear,
        },
        create: {
          userId, country, transportMode, dietType, homeType, householdSize, electricityKwh, weeklyDriveKm, flightsPerYear,
        },
      });

      await tx.carbonLog.deleteMany({ where: { userId } });

      const now = new Date();
      const logsToCreate = [
        { category: 'transport', activity: `${transportMode.toUpperCase()} & Flight Monthly Est.`, amount: parseFloat(transportKm.toFixed(1)), unit: 'km', co2Kg: transportCo2 },
        { category: 'energy', activity: 'Home Electricity & Gas', amount: electricityKwh, unit: 'kWh', co2Kg: energyCo2 },
        { category: 'food', activity: `${dietType.toUpperCase()} Diet Baseline`, amount: 30, unit: 'meals', co2Kg: foodCo2 },
        { category: 'shopping', activity: 'Clothing & Online Purchases', amount: 5, unit: 'items', co2Kg: shoppingCo2 },
        { category: 'waste', activity: 'Household Solid Waste', amount: householdSize * 15, unit: 'kg', co2Kg: wasteCo2 },
      ];

      for (const log of logsToCreate) {
        await tx.carbonLog.create({
          data: {
            userId, date: now, category: log.category, activity: log.activity, amount: log.amount, unit: log.unit, co2Kg: log.co2Kg, notes: 'Onboarding baseline estimate',
          },
        });
      }

      const streak = await tx.streak.findUnique({ where: { userId } });
      const currentPoints = streak?.totalPoints || 0;
      const onboardingBonus = 50;
      const newPoints = currentPoints + onboardingBonus;
      const newLevel = calculateLevel(newPoints);

      await tx.streak.upsert({
        where: { userId },
        update: { totalPoints: newPoints, level: newLevel },
        create: { userId, totalPoints: newPoints, level: newLevel, currentStreak: 0, longestStreak: 0 }
      });
    });

    return { success: true };
  } catch (error) {
    logger.error('completeOnboarding error:', error as Error);
    return { error: 'Onboarding failed. Please try again later.', status: 500 };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });
    return { profile };
  } catch (error) {
    logger.error('getUserProfile error:', error as Error);
    return { error: 'Internal Server Error', status: 500 };
  }
}
