export const EMISSION_FACTORS = {
  transport: {
    // Car types (per km)
    carPetrol: 0.170,
    carDiesel: 0.163,
    carHybrid: 0.105,
    carElectric: 0.053, // India grid average
    // Public transport (per km)
    bus: 0.089,
    train: 0.041,
    // Flights (per km per passenger)
    flightShortHaul: 0.255, // < 3 hours
    flightLongHaul: 0.195,  // > 6 hours
  },
  food: {
    // Per serving (kg CO2e)
    beef: 6.61,
    lamb: 5.84,
    pork: 1.24,
    chicken: 0.69,
    fish: 0.49,
    eggs: 0.25,
    dairy: 0.34, // Glass of milk or dairy portion
    plantBased: 0.12,
  },
  energy: {
    electricityIN: 0.708, // per kWh (India grid)
    naturalGas: 2.04,     // per cubic meter
    lpg: 1.51,            // per liter
    heatingOil: 2.68,     // per liter (standard factor)
  },
  shopping: {
    clothing: 8.0,        // per item
    electronics: 150.0,   // per device
    onlineDelivery: 1.5,  // per delivery
  },
  waste: {
    baseWastePerKg: 0.5,  // baseline CO2 per kg waste
    compostSavingsPerKg: -0.2, // compost offset
    recycleSavingsPerKg: -0.3, // recycling offset
  }
};
