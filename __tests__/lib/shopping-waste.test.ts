import {
  calculateShoppingEmissions,
  calculateWasteEmissions
} from '../../lib/carbon/calculator';

describe('Shopping Emissions Calculator', () => {
  it('should calculate clothing emissions (monthly from annual)', () => {
    // 12 items/year ÷ 12 = 1 item/month * 8.0 = 8.0 kg
    expect(calculateShoppingEmissions({ clothingItemsPerYear: 12 })).toBe(8);
  });

  it('should calculate electronics emissions (monthly from annual)', () => {
    // 12 devices/year ÷ 12 = 1 device/month * 150.0 = 150.0 kg
    expect(calculateShoppingEmissions({ electronicsDevicesPerYear: 12 })).toBe(150);
  });

  it('should calculate online delivery emissions', () => {
    // 10 deliveries/month * 1.5 = 15.0 kg
    expect(calculateShoppingEmissions({ onlineDeliveriesPerMonth: 10 })).toBe(15);
  });

  it('should apply 30% recycling discount to delivery emissions', () => {
    // 10 deliveries/month * 1.5 * 0.7 = 10.5 kg
    expect(calculateShoppingEmissions({ onlineDeliveriesPerMonth: 10, recyclePackaging: true })).toBe(10.5);
  });

  it('should handle zero and negative inputs', () => {
    expect(calculateShoppingEmissions({})).toBe(0);
    expect(calculateShoppingEmissions({ clothingItemsPerYear: -5 })).toBe(0);
  });

  it('should combine all shopping categories', () => {
    const result = calculateShoppingEmissions({
      clothingItemsPerYear: 12,
      electronicsDevicesPerYear: 2,
      onlineDeliveriesPerMonth: 4,
      recyclePackaging: false,
    });
    // clothing: 1 * 8 = 8, electronics: (2/12) * 150 = 25, deliveries: 4 * 1.5 = 6
    // total: 8 + 25 + 6 = 39
    expect(result).toBe(39);
  });
});

describe('Waste Emissions Calculator', () => {
  it('should calculate base waste emissions', () => {
    // 100 kg waste * 0.5 = 50 kg CO2
    expect(calculateWasteEmissions({ wastePerMonthKg: 100 })).toBe(50);
  });

  it('should apply recycling offset', () => {
    // base: 100 * 0.5 = 50
    // recycle offset: (50/100) * 100 * 0.3 = 15
    // result: 50 - 15 = 35
    expect(calculateWasteEmissions({ wastePerMonthKg: 100, recycleRatePercent: 50 })).toBe(35);
  });

  it('should apply composting offset', () => {
    // base: 100 * 0.5 = 50
    // compost offset: 0.3 * 100 * 0.2 = 6
    // result: 50 - 6 = 44
    expect(calculateWasteEmissions({ wastePerMonthKg: 100, compost: true })).toBe(44);
  });

  it('should apply both recycling and composting offsets', () => {
    // base: 100 * 0.5 = 50
    // recycle: (50/100) * 100 * 0.3 = 15
    // compost: 0.3 * 100 * 0.2 = 6
    // result: 50 - 15 - 6 = 29
    expect(calculateWasteEmissions({ wastePerMonthKg: 100, recycleRatePercent: 50, compost: true })).toBe(29);
  });

  it('should calculate emissions with both recycling and composting correctly', () => {
    // 10kg base = 5.0
    // recycle: 10 * 0.3 = 3.0
    // compost: 0.3 * 10 * 0.2 = 0.6
    // result = 5.0 - 3.0 - 0.6 = 1.4
    expect(calculateWasteEmissions({ wastePerMonthKg: 10, recycleRatePercent: 100, compost: true })).toBe(1.4);
  });

  it('should never return negative emissions (clamp to zero)', () => {
    // Force negative by setting impossible recycling rate
    expect(calculateWasteEmissions({ wastePerMonthKg: 10, recycleRatePercent: 500, compost: true })).toBe(0);
  });

  it('should handle zero and negative inputs', () => {
    expect(calculateWasteEmissions({})).toBe(0);
    expect(calculateWasteEmissions({ wastePerMonthKg: -50 })).toBe(0);
  });
});
