import { EMISSION_FACTORS } from './emissions-data';

// Helper to sanitize inputs (ensure >= 0)
const sanitizeInput = (val: number): number => {
  if (isNaN(val) || val < 0) return 0;
  return Math.min(val, 1000000); // Prevent overflow errors with a reasonable maximum
};

/**
 * Calculates emissions for transportation in kg CO2e
 */
export interface TransportInput {
  carPetrolKm?: number;
  carDieselKm?: number;
  carHybridKm?: number;
  carElectricKm?: number;
  busKm?: number;
  trainKm?: number;
  flightShortKm?: number; // < 3 hrs
  flightLongKm?: number;  // > 6 hrs
  flightClass?: 'economy' | 'business';
}

export function calculateTransportEmissions(input: TransportInput): number {
  const petrol = sanitizeInput(input.carPetrolKm || 0) * EMISSION_FACTORS.transport.carPetrol;
  const diesel = sanitizeInput(input.carDieselKm || 0) * EMISSION_FACTORS.transport.carDiesel;
  const hybrid = sanitizeInput(input.carHybridKm || 0) * EMISSION_FACTORS.transport.carHybrid;
  const electric = sanitizeInput(input.carElectricKm || 0) * EMISSION_FACTORS.transport.carElectric;
  const bus = sanitizeInput(input.busKm || 0) * EMISSION_FACTORS.transport.bus;
  const train = sanitizeInput(input.trainKm || 0) * EMISSION_FACTORS.transport.train;
  
  // Flights
  const classMultiplier = input.flightClass === 'business' ? 1.5 : 1.0;
  const shortHaul = sanitizeInput(input.flightShortKm || 0) * EMISSION_FACTORS.transport.flightShortHaul * classMultiplier;
  const longHaul = sanitizeInput(input.flightLongKm || 0) * EMISSION_FACTORS.transport.flightLongHaul * classMultiplier;

  return parseFloat((petrol + diesel + hybrid + electric + bus + train + shortHaul + longHaul).toFixed(2));
}

/**
 * Calculates emissions for energy consumption in kg CO2e
 */
export interface EnergyInput {
  electricityKwh?: number;
  naturalGasM3?: number;
  lpgLiters?: number;
  renewableOffsetPercent?: number; // 0 to 100
}

export function calculateEnergyEmissions(input: EnergyInput): number {
  const electricityKwh = sanitizeInput(input.electricityKwh || 0);
  const naturalGasM3 = sanitizeInput(input.naturalGasM3 || 0);
  const lpgLiters = sanitizeInput(input.lpgLiters || 0);
  const renewableOffset = sanitizeInput(input.renewableOffsetPercent || 0);

  // Apply renewable offset to electricity only
  const electricityEmissions = electricityKwh * EMISSION_FACTORS.energy.electricityIN;
  const offsetMultiplier = Math.max(0, 1 - (renewableOffset / 100));
  const electricityFinal = electricityEmissions * offsetMultiplier;

  const gasFinal = naturalGasM3 * EMISSION_FACTORS.energy.naturalGas;
  const lpgFinal = lpgLiters * EMISSION_FACTORS.energy.lpg;

  return parseFloat((electricityFinal + gasFinal + lpgFinal).toFixed(2));
}

/**
 * Calculates emissions for food consumption in kg CO2e
 */
export interface FoodInput {
  dietType: 'vegan' | 'vegetarian' | 'omnivore' | 'meat-heavy';
  beefServings?: number;       // servings per week
  lambServings?: number;       // servings per week
  porkServings?: number;       // servings per week
  chickenServings?: number;    // servings per week
  fishServings?: number;       // servings per week
  eggsServings?: number;       // servings per week
  dairyServings?: number;      // servings per week
  plantBasedServings?: number; // servings per week
  foodWastePercent?: number;   // 0 to 100
}

export function calculateFoodEmissions(input: FoodInput): number {
  // Baseline factors per serving
  let beef = sanitizeInput(input.beefServings || 0) * EMISSION_FACTORS.food.beef;
  const lamb = sanitizeInput(input.lambServings || 0) * EMISSION_FACTORS.food.lamb;
  let pork = sanitizeInput(input.porkServings || 0) * EMISSION_FACTORS.food.pork;
  let chicken = sanitizeInput(input.chickenServings || 0) * EMISSION_FACTORS.food.chicken;
  let fish = sanitizeInput(input.fishServings || 0) * EMISSION_FACTORS.food.fish;
  let eggs = sanitizeInput(input.eggsServings || 0) * EMISSION_FACTORS.food.eggs;
  let dairy = sanitizeInput(input.dairyServings || 0) * EMISSION_FACTORS.food.dairy;
  let plantBased = sanitizeInput(input.plantBasedServings || 0) * EMISSION_FACTORS.food.plantBased;

  // Baseline adjustment based on dietType if custom servings are not fully specified (fallback)
  const totalServings = beef + lamb + pork + chicken + fish + eggs + dairy + plantBased;
  if (totalServings === 0) {
    // Standard weekly footprints by diet type
    // Vegan: mostly plant-based
    // Vegetarian: plant-based + dairy + eggs
    // Omnivore: moderate mix of everything
    // Meat-heavy: high beef/pork/lamb/chicken
    switch (input.dietType) {
      case 'vegan':
        plantBased = 21 * EMISSION_FACTORS.food.plantBased; // 3 meals a day
        break;
      case 'vegetarian':
        plantBased = 14 * EMISSION_FACTORS.food.plantBased;
        dairy = 7 * EMISSION_FACTORS.food.dairy;
        eggs = 3 * EMISSION_FACTORS.food.eggs;
        break;
      case 'omnivore':
        plantBased = 10 * EMISSION_FACTORS.food.plantBased;
        chicken = 4 * EMISSION_FACTORS.food.chicken;
        fish = 2 * EMISSION_FACTORS.food.fish;
        dairy = 5 * EMISSION_FACTORS.food.dairy;
        beef = 1 * EMISSION_FACTORS.food.beef;
        eggs = 2 * EMISSION_FACTORS.food.eggs;
        break;
      case 'meat-heavy':
        plantBased = 5 * EMISSION_FACTORS.food.plantBased;
        beef = 5 * EMISSION_FACTORS.food.beef;
        pork = 4 * EMISSION_FACTORS.food.pork;
        chicken = 5 * EMISSION_FACTORS.food.chicken;
        dairy = 5 * EMISSION_FACTORS.food.dairy;
        break;
    }
  }

  const sumEmissions = beef + lamb + pork + chicken + fish + eggs + dairy + plantBased;
  const wastePercent = sanitizeInput(input.foodWastePercent || 0);
  
  // Food waste adds additional carbon impact (e.g. methane from landfill + lifecycle loss)
  const wasteMultiplier = 1 + (wastePercent / 100) * 0.2; // Max 20% penalty for 100% waste

  return parseFloat((sumEmissions * wasteMultiplier).toFixed(2));
}

/**
 * Calculates emissions for shopping habits in kg CO2e
 */
export interface ShoppingInput {
  clothingItemsPerYear?: number;
  electronicsDevicesPerYear?: number;
  onlineDeliveriesPerMonth?: number;
  recyclePackaging?: boolean;
}

export function calculateShoppingEmissions(input: ShoppingInput): number {
  // Convert annual metrics to monthly to keep logs consistent
  const clothingMonthly = sanitizeInput(input.clothingItemsPerYear || 0) / 12;
  const electronicsMonthly = sanitizeInput(input.electronicsDevicesPerYear || 0) / 12;
  const deliveriesMonthly = sanitizeInput(input.onlineDeliveriesPerMonth || 0);

  const clothing = clothingMonthly * EMISSION_FACTORS.shopping.clothing;
  const electronics = electronicsMonthly * EMISSION_FACTORS.shopping.electronics;
  
  const deliveryFactor = input.recyclePackaging 
    ? EMISSION_FACTORS.shopping.onlineDelivery * 0.7 // 30% reduction if recycling
    : EMISSION_FACTORS.shopping.onlineDelivery;
  
  const deliveries = deliveriesMonthly * deliveryFactor;

  return parseFloat((clothing + electronics + deliveries).toFixed(2));
}

/**
 * Calculates emissions for household waste in kg CO2e
 */
export interface WasteInput {
  wastePerMonthKg?: number; // average waste kg per month
  recycleRatePercent?: number; // 0 to 100
  compost?: boolean;
}

export function calculateWasteEmissions(input: WasteInput): number {
  const wasteKg = sanitizeInput(input.wastePerMonthKg || 0);
  const recycleRate = sanitizeInput(input.recycleRatePercent || 0);
  const compost = input.compost || false;

  const baseFootprint = wasteKg * EMISSION_FACTORS.waste.baseWastePerKg;
  
  // Recycling offset
  const recycleOffset = (recycleRate / 100) * wasteKg * Math.abs(EMISSION_FACTORS.waste.recycleSavingsPerKg);
  
  // Composting offset (applied to remaining organic waste, roughly 30% of standard bin is compostable)
  const compostOffset = compost 
    ? 0.3 * wasteKg * Math.abs(EMISSION_FACTORS.waste.compostSavingsPerKg) 
    : 0;

  const finalEmissions = Math.max(0, baseFootprint - recycleOffset - compostOffset);

  return parseFloat(finalEmissions.toFixed(2));
}
