import { NextResponse } from 'next/server';
import { auth } from '@/auth';
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

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid profile data', details: parsed.error.format() }, { status: 400 });
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

    // 1. Calculate baseline carbon logs
    // We will generate 5 baseline logs for the user so they have initial data.
    // Transport: weeklyDriveKm * 4 weeks (for a month log)
    const transportKm = weeklyDriveKm * 4.33; // average weeks in a month
    const transportInput = {
      carPetrolKm: transportMode === 'car' ? transportKm : 0,
      carElectricKm: transportMode === 'electric' ? transportKm : 0,
      busKm: transportMode === 'bus' ? transportKm : 0,
      trainKm: transportMode === 'train' ? transportKm : 0,
      flightShortKm: (flightsPerYear * 1500) / 12, // distribute flights monthly (approx. 1500km per short haul flight)
    };
    const transportCo2 = calculateTransportEmissions(transportInput);

    // Energy: electricityKwh (per month)
    const energyInput = {
      electricityKwh,
      naturalGasM3: homeType === 'house' ? 25 : 5, // estimated gas
      lpgLiters: 0,
      renewableOffsetPercent: 0,
    };
    const energyCo2 = calculateEnergyEmissions(energyInput);

    // Food: diet type
    const foodInput = {
      dietType,
      foodWastePercent: 15, // average default
    };
    const foodCo2 = calculateFoodEmissions(foodInput) * 4.33; // scale weekly to monthly

    // Shopping
    const shoppingInput = {
      clothingItemsPerYear: 12, // standard default
      electronicsDevicesPerYear: 2, // standard default
      onlineDeliveriesPerMonth: 4,
      recyclePackaging: true,
    };
    const shoppingCo2 = calculateShoppingEmissions(shoppingInput);

    // Waste
    const wasteInput = {
      wastePerMonthKg: householdSize * 15, // 15kg per person per month
      recycleRatePercent: 30,
      compost: false,
    };
    const wasteCo2 = calculateWasteEmissions(wasteInput);

    // 2. Perform DB operations in a transaction
    await prisma.$transaction(async (tx) => {
      // Create or update Profile
      await tx.userProfile.upsert({
        where: { userId },
        update: {
          country,
          transportMode,
          dietType,
          homeType,
          householdSize,
          electricityKwh,
          weeklyDriveKm,
          flightsPerYear,
        },
        create: {
          userId,
          country,
          transportMode,
          dietType,
          homeType,
          householdSize,
          electricityKwh,
          weeklyDriveKm,
          flightsPerYear,
        },
      });

      // Clear existing baseline logs if any to prevent duplicates
      await tx.carbonLog.deleteMany({
        where: { userId },
      });

      // Insert 5 baseline logs for the current month
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
            userId,
            date: now,
            category: log.category,
            activity: log.activity,
            amount: log.amount,
            unit: log.unit,
            co2Kg: log.co2Kg,
            notes: 'Onboarding baseline estimate',
          },
        });
      }

      // Add points for completing onboarding
      const streak = await tx.streak.findUnique({ where: { userId } });
      const currentPoints = streak?.totalPoints || 0;
      const onboardingBonus = 50; // XP bonus
      const newPoints = currentPoints + onboardingBonus;
      const newLevel = calculateLevel(newPoints);

      await tx.streak.upsert({
        where: { userId },
        update: {
          totalPoints: newPoints,
          level: newLevel,
        },
        create: {
          userId,
          totalPoints: newPoints,
          level: newLevel,
          currentStreak: 0,
          longestStreak: 0,
        }
      });
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 550 });
  }
}
