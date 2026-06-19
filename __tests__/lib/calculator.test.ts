import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateFoodEmissions,
  calculateShoppingEmissions,
  calculateWasteEmissions
} from '../../lib/carbon/calculator';

describe('Carbon Calculator Logic', () => {
  // 1. Transportation tests
  describe('calculateTransportEmissions', () => {
    it('should calculate emissions correctly for car fuel types', () => {
      // Petrol car: 100km * 0.170 = 17 kg
      expect(calculateTransportEmissions({ carPetrolKm: 100 })).toBe(17);
      // Diesel car: 100km * 0.163 = 16.3 kg
      expect(calculateTransportEmissions({ carDieselKm: 100 })).toBe(16.3);
      // Hybrid car: 100km * 0.105 = 10.5 kg
      expect(calculateTransportEmissions({ carHybridKm: 100 })).toBe(10.5);
      // Electric car: 100km * 0.053 = 5.3 kg
      expect(calculateTransportEmissions({ carElectricKm: 100 })).toBe(5.3);
    });

    it('should calculate emissions correctly for public transit and flights', () => {
      // Bus: 50km * 0.089 = 4.45 kg
      expect(calculateTransportEmissions({ busKm: 50 })).toBe(4.45);
      // Train: 200km * 0.041 = 8.2 kg
      expect(calculateTransportEmissions({ trainKm: 200 })).toBe(8.2);
      // Short flight economy: 1000km * 0.255 = 255 kg
      expect(calculateTransportEmissions({ flightShortKm: 1000, flightClass: 'economy' })).toBe(255);
      // Long flight business: 5000km * 0.195 * 1.5 = 1462.5 kg
      expect(calculateTransportEmissions({ flightLongKm: 5000, flightClass: 'business' })).toBe(1462.5);
    });

    it('should handle zero, negative, and maximum boundary inputs gracefully', () => {
      expect(calculateTransportEmissions({})).toBe(0);
      expect(calculateTransportEmissions({ carPetrolKm: -100 })).toBe(0);
      expect(calculateTransportEmissions({ carPetrolKm: 10000000 })).toBe(170000); // capped at 1000000km
    });
  });

  // 2. Food tests
  describe('calculateFoodEmissions', () => {
    it('should fall back to diet type averages if no specific meals logged', () => {
      // vegan default: 21 * 0.12 = 2.52
      expect(calculateFoodEmissions({ dietType: 'vegan' })).toBe(2.52);
      // vegetarian default: 14 * 0.12 + 7 * 0.34 + 3 * 0.25 = 1.68 + 2.38 + 0.75 = 4.81
      expect(calculateFoodEmissions({ dietType: 'vegetarian' })).toBe(4.81);
    });

    it('should calculate custom servings and apply waste penalty', () => {
      // beef serving: 3 * 6.61 = 19.83. waste = 50% (+10% penalty) -> 19.83 * 1.10 = 21.81
      expect(calculateFoodEmissions({
        dietType: 'omnivore',
        beefServings: 3,
        foodWastePercent: 50
      })).toBe(21.81);
    });

    it('should handle zero and negative servings gracefully by sanitizing them to zero', () => {
      expect(calculateFoodEmissions({
        dietType: 'omnivore',
        beefServings: -5,
        plantBasedServings: 1
      })).toBe(0.12);
    });

    it('should calculate meat-heavy diet defaults correctly', () => {
      // meat-heavy default: 
      // plantBased: 5 * 0.12 = 0.60
      // beef: 5 * 6.61 = 33.05
      // pork: 4 * 1.24 = 4.96
      // chicken: 5 * 0.69 = 3.45
      // dairy: 5 * 0.34 = 1.70
      // total: 0.60 + 33.05 + 4.96 + 3.45 + 1.70 = 43.76
      expect(calculateFoodEmissions({ dietType: 'meat-heavy' })).toBe(43.76);
    });
  });

  // 3. Energy tests
  describe('calculateEnergyEmissions', () => {
    it('should calculate electricity using India grid factor and gas/LPG constants', () => {
      // electricity: 100 kWh * 0.708 = 70.8 kg
      expect(calculateEnergyEmissions({ electricityKwh: 100 })).toBe(70.8);
      // gas: 50 m3 * 2.04 = 102 kg
      expect(calculateEnergyEmissions({ naturalGasM3: 50 })).toBe(102);
      // LPG: 20 L * 1.51 = 30.2 kg
      expect(calculateEnergyEmissions({ lpgLiters: 20 })).toBe(30.2);
    });

    it('should apply renewable offset discounts', () => {
      // 100 kWh * 0.708 * (1 - 0.40) = 42.48 kg
      expect(calculateEnergyEmissions({ electricityKwh: 100, renewableOffsetPercent: 40 })).toBe(42.48);
    });

    it('should handle negative energy inputs', () => {
      expect(calculateEnergyEmissions({ electricityKwh: -100 })).toBe(0);
    });
  });
});
