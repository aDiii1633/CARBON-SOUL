'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateFoodEmissions,
  calculateShoppingEmissions,
  calculateWasteEmissions
} from '@/lib/carbon/calculator';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Select,
  Slider,
  Checkbox
} from '@/components/ui';
import { Car, Zap, Utensils, ShoppingBag, Trash2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORY_COLORS = {
  transport: '#3b82f6',
  energy: '#f59e0b',
  food: '#10b981',
  shopping: '#8b5cf6',
  waste: '#ef4444',
};

export default function CarbonCalculator() {
  const { addCarbonLog } = useAppStore();
  const [activeTab, setActiveTab] = useState('transport');
  const [isLogging, setIsLogging] = useState(false);
  const [notes, setNotes] = useState('');

  // 1. Transport Input State
  const [carPetrolKm, setCarPetrolKm] = useState(0);
  const [carElectricKm, setCarElectricKm] = useState(0);
  const [busKm, setBusKm] = useState(0);
  const [trainKm, setTrainKm] = useState(0);
  const [flightShortKm, setFlightShortKm] = useState(0);
  const [flightLongKm, setFlightLongKm] = useState(0);
  const [flightClass, setFlightClass] = useState<'economy' | 'business'>('economy');

  // 2. Energy Input State
  const [electricityKwh, setElectricityKwh] = useState(150);
  const [naturalGasM3, setNaturalGasM3] = useState(0);
  const [lpgLiters, setLpgLiters] = useState(0);
  const [renewableOffset, setRenewableOffset] = useState(0);

  // 3. Food Input State
  const [dietType, setDietType] = useState<'vegan' | 'vegetarian' | 'omnivore' | 'meat-heavy'>('omnivore');
  const [beefServings, setBeefServings] = useState(0);
  const [chickenServings, setChickenServings] = useState(0);
  const [plantServings, setPlantServings] = useState(0);
  const [foodWaste, setFoodWaste] = useState(10);

  // 4. Shopping Input State
  const [clothingItems, setClothingItems] = useState(0);
  const [electronicsDevices, setElectronicsDevices] = useState(0);
  const [onlineDeliveries, setOnlineDeliveries] = useState(0);
  const [recyclePackaging, setRecyclePackaging] = useState(true);

  // 5. Waste Input State
  const [wastePerMonth, setWastePerMonth] = useState(20);
  const [recycleRate, setRecycleRate] = useState(30);
  const [compost, setCompost] = useState(false);

  // Real-time calculations with useMemo for efficiency
  const transportCo2 = useMemo(() => {
    return calculateTransportEmissions({
      carPetrolKm,
      carElectricKm,
      busKm,
      trainKm,
      flightShortKm,
      flightLongKm,
      flightClass,
    });
  }, [carPetrolKm, carElectricKm, busKm, trainKm, flightShortKm, flightLongKm, flightClass]);

  const energyCo2 = useMemo(() => {
    return calculateEnergyEmissions({
      electricityKwh,
      naturalGasM3,
      lpgLiters,
      renewableOffsetPercent: renewableOffset,
    });
  }, [electricityKwh, naturalGasM3, lpgLiters, renewableOffset]);

  const foodCo2 = useMemo(() => {
    return calculateFoodEmissions({
      dietType,
      beefServings,
      chickenServings,
      plantBasedServings: plantServings,
      foodWastePercent: foodWaste,
    });
  }, [dietType, beefServings, chickenServings, plantServings, foodWaste]);

  const shoppingCo2 = useMemo(() => {
    return calculateShoppingEmissions({
      clothingItemsPerYear: clothingItems,
      electronicsDevicesPerYear: electronicsDevices,
      onlineDeliveriesPerMonth: onlineDeliveries,
      recyclePackaging,
    });
  }, [clothingItems, electronicsDevices, onlineDeliveries, recyclePackaging]);

  const wasteCo2 = useMemo(() => {
    return calculateWasteEmissions({
      wastePerMonthKg: wastePerMonth,
      recycleRatePercent: recycleRate,
      compost,
    });
  }, [wastePerMonth, recycleRate, compost]);

  const runningTotal = useMemo(() => {
    return parseFloat((transportCo2 + energyCo2 + foodCo2 + shoppingCo2 + wasteCo2).toFixed(2));
  }, [transportCo2, energyCo2, foodCo2, shoppingCo2, wasteCo2]);

  const activeCategoryCo2 = useMemo(() => {
    switch (activeTab) {
      case 'transport': return transportCo2;
      case 'energy': return energyCo2;
      case 'food': return foodCo2;
      case 'shopping': return shoppingCo2;
      case 'waste': return wasteCo2;
      default: return 0;
    }
  }, [activeTab, transportCo2, energyCo2, foodCo2, shoppingCo2, wasteCo2]);

  const handleLogEntry = async () => {
    setIsLogging(true);
    try {
      const payload = {
        category: activeTab,
        activity: getCategoryActivityDesc(),
        amount: getCategoryAmount(),
        unit: getCategoryUnit(),
        co2Kg: activeCategoryCo2,
        notes: notes || undefined,
      };

      const res = await fetch('/api/carbon/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        addCarbonLog({
          id: result.carbonLog.id,
          date: result.carbonLog.date,
          category: result.carbonLog.category,
          activity: result.carbonLog.activity,
          amount: result.carbonLog.amount,
          unit: result.carbonLog.unit,
          co2Kg: result.carbonLog.co2Kg,
          notes: result.carbonLog.notes || undefined,
        });

        // Trigger success feedback
        confetti({
          particleCount: 60,
          spread: 40,
          origin: { y: 0.8 },
          colors: [CATEGORY_COLORS[activeTab as keyof typeof CATEGORY_COLORS]],
        });

        setNotes('');
        alert('Footprint log entry logged successfully!');
      } else {
        alert('Failed to log entry. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to logging API.');
    } finally {
      setIsLogging(false);
    }
  };

  const getCategoryActivityDesc = () => {
    switch (activeTab) {
      case 'transport': return `Transit (${carPetrolKm + carElectricKm + busKm + trainKm} km, Flights: ${flightShortKm + flightLongKm} km)`;
      case 'energy': return `Household Utility (${electricityKwh} kWh electric)`;
      case 'food': return `${dietType.toUpperCase()} Diet Profile`;
      case 'shopping': return `Purchases (${clothingItems} clothes, ${electronicsDevices} dev)`;
      case 'waste': return `Trash (${wastePerMonth} kg waste)`;
      default: return 'Log entry';
    }
  };

  const getCategoryAmount = () => {
    switch (activeTab) {
      case 'transport': return carPetrolKm + carElectricKm + busKm + trainKm;
      case 'energy': return electricityKwh;
      case 'food': return 7; // days
      case 'shopping': return clothingItems + electronicsDevices;
      case 'waste': return wastePerMonth;
      default: return 0;
    }
  };

  const getCategoryUnit = () => {
    switch (activeTab) {
      case 'transport': return 'km';
      case 'energy': return 'kWh';
      case 'food': return 'days';
      case 'shopping': return 'items';
      case 'waste': return 'kg';
      default: return '';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Input Tab Forms (Left 8 columns) */}
      <div className="lg:col-span-8">
        <Tabs defaultValue="transport" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full bg-gray-100 p-1 rounded-xl mb-6">
            <TabsTrigger value="transport" className="flex items-center gap-1">
              <Car className="h-4 w-4" /> <span className="hidden sm:inline">Transit</span>
            </TabsTrigger>
            <TabsTrigger value="energy" className="flex items-center gap-1">
              <Zap className="h-4 w-4" /> <span className="hidden sm:inline">Energy</span>
            </TabsTrigger>
            <TabsTrigger value="food" className="flex items-center gap-1">
              <Utensils className="h-4 w-4" /> <span className="hidden sm:inline">Food</span>
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" /> <span className="hidden sm:inline">Shopping</span>
            </TabsTrigger>
            <TabsTrigger value="waste" className="flex items-center gap-1">
              <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Waste</span>
            </TabsTrigger>
          </TabsList>

          {/* TRANSPORT TAB */}
          <TabsContent value="transport">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Transportation Calculator</CardTitle>
                <CardDescription>Enter details about your weekly commutes and flights taken</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="carPetrol">Car Distance (Petrol/Diesel km/week)</Label>
                    <Input
                      id="carPetrol"
                      type="number"
                      value={carPetrolKm || ''}
                      onChange={(e) => setCarPetrolKm(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="carElectric">Car Distance (Electric km/week)</Label>
                    <Input
                      id="carElectric"
                      type="number"
                      value={carElectricKm || ''}
                      onChange={(e) => setCarElectricKm(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="bus">Bus Travel (km/week)</Label>
                    <Input
                      id="bus"
                      type="number"
                      value={busKm || ''}
                      onChange={(e) => setBusKm(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="train">Train / Metro (km/week)</Label>
                    <Input
                      id="train"
                      type="number"
                      value={trainKm || ''}
                      onChange={(e) => setTrainKm(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-gray-700">Flight Distances (Annual)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="flightShort">Short-Haul Flights (&lt; 3hrs total km)</Label>
                      <Input
                        id="flightShort"
                        type="number"
                        placeholder="e.g. 1500"
                        value={flightShortKm || ''}
                        onChange={(e) => setFlightShortKm(Math.max(0, parseFloat(e.target.value) || 0))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="flightLong">Long-Haul Flights (&gt; 6hrs total km)</Label>
                      <Input
                        id="flightLong"
                        type="number"
                        placeholder="e.g. 8000"
                        value={flightLongKm || ''}
                        onChange={(e) => setFlightLongKm(Math.max(0, parseFloat(e.target.value) || 0))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="flightClass">Travel Seating Class</Label>
                    <Select
                      id="flightClass"
                      value={flightClass}
                      onChange={(e) => setFlightClass(e.target.value as 'economy' | 'business')}
                      options={[
                        { value: 'economy', label: 'Economy Class' },
                        { value: 'business', label: 'Business / First Class' },
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ENERGY TAB */}
          <TabsContent value="energy">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Household Utility Energy</CardTitle>
                <CardDescription>Enter details about monthly electricity and natural gas utility bills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="electricity">Monthly Electricity (kWh)</Label>
                  <Input
                    id="electricity"
                    type="number"
                    value={electricityKwh || ''}
                    onChange={(e) => setElectricityKwh(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="gas">Natural Gas (m³ / month)</Label>
                    <Input
                      id="gas"
                      type="number"
                      value={naturalGasM3 || ''}
                      onChange={(e) => setNaturalGasM3(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lpg">LPG / Gas Cylinders (Liters / month)</Label>
                    <Input
                      id="lpg"
                      type="number"
                      value={lpgLiters || ''}
                      onChange={(e) => setLpgLiters(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Renewable Energy Offset</Label>
                    <span className="text-sm font-mono text-gray-500 font-bold">{renewableOffset}% green energy</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={renewableOffset}
                    onChange={setRenewableOffset}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FOOD TAB */}
          <TabsContent value="food">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Dietary Footprint Calculator</CardTitle>
                <CardDescription>Log meal habits and choose dietary styles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="dietType">General Diet Classification</Label>
                  <Select
                    id="dietType"
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value as 'vegan' | 'vegetarian' | 'omnivore' | 'meat-heavy')}
                    options={[
                      { value: 'vegan', label: 'Vegan (Strictly plant-based)' },
                      { value: 'vegetarian', label: 'Vegetarian (No meat)' },
                      { value: 'omnivore', label: 'Omnivore (Balanced meat & vegetable)' },
                      { value: 'meat-heavy', label: 'Meat-heavy (Beef or pork daily)' },
                    ]}
                  />
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-gray-700">Custom Servings (Per Week)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Beef/Lamb servings</Label>
                      <span className="text-xs font-mono font-bold text-gray-500">{beefServings} servings</span>
                    </div>
                    <Slider min={0} max={21} step={1} value={beefServings} onChange={setBeefServings} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Chicken/Poultry servings</Label>
                      <span className="text-xs font-mono font-bold text-gray-500">{chickenServings} servings</span>
                    </div>
                    <Slider min={0} max={21} step={1} value={chickenServings} onChange={setChickenServings} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Plant-based servings</Label>
                      <span className="text-xs font-mono font-bold text-gray-500">{plantServings} servings</span>
                    </div>
                    <Slider min={0} max={21} step={1} value={plantServings} onChange={setPlantServings} />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Household Food Waste</Label>
                    <span className="text-sm font-mono text-gray-500 font-bold">{foodWaste}% wasted</span>
                  </div>
                  <Slider min={0} max={100} step={5} value={foodWaste} onChange={setFoodWaste} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SHOPPING TAB */}
          <TabsContent value="shopping">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Shopping & Consumption</CardTitle>
                <CardDescription>Log purchases and clothing item counts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="clothing">Clothing Items Purchased (Per Year)</Label>
                    <Input
                      id="clothing"
                      type="number"
                      value={clothingItems || ''}
                      onChange={(e) => setClothingItems(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="electronics">Electronics Devices Bought (Per Year)</Label>
                    <Input
                      id="electronics"
                      type="number"
                      value={electronicsDevices || ''}
                      onChange={(e) => setElectronicsDevices(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="deliveries">Online Deliveries Received (Per Month)</Label>
                  <Input
                    id="deliveries"
                    type="number"
                    value={onlineDeliveries || ''}
                    onChange={(e) => setOnlineDeliveries(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>

                <div className="flex items-center space-x-2 border-t border-gray-100 pt-6">
                  <Checkbox
                    id="recycle"
                    checked={recyclePackaging}
                    onChange={(e) => setRecyclePackaging(e.target.checked)}
                  />
                  <Label htmlFor="recycle" className="font-semibold text-xs text-gray-500 cursor-pointer">
                    I recycle all delivery boxes & packaging (Saves 30% delivery emissions)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WASTE TAB */}
          <TabsContent value="waste">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Household Solid Waste</CardTitle>
                <CardDescription>Enter details about weekly household garbage and recycling habits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="wasteKg">Estimated Monthly Garbage Weight (kg)</Label>
                  <Input
                    id="wasteKg"
                    type="number"
                    value={wastePerMonth || ''}
                    onChange={(e) => setWastePerMonth(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Recycling Rate Slider</Label>
                    <span className="text-sm font-mono text-gray-500 font-bold">{recycleRate}% recycled</span>
                  </div>
                  <Slider min={0} max={100} step={5} value={recycleRate} onChange={setRecycleRate} />
                </div>

                <div className="flex items-center space-x-2 border-t border-gray-100 pt-6">
                  <Checkbox
                    id="compost"
                    checked={compost}
                    onChange={(e) => setCompost(e.target.checked)}
                  />
                  <Label htmlFor="compost" className="font-semibold text-xs text-gray-500 cursor-pointer">
                    We compost food/organic waste (Saves organic waste emissions)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Notes input */}
        <div className="mt-6">
          <Label htmlFor="notes">Log Notes (Optional)</Label>
          <Input
            id="notes"
            type="text"
            placeholder="e.g. Weekly commute breakdown or specific item purchases"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Calculator Sidebar Summary Panel (Right 4 columns) */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
        <Card className="border-gray-200 shadow-md bg-white overflow-hidden">
          <div className="p-6 bg-slate-900 text-white border-b border-slate-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Running Total</span>
            <div className="text-3xl font-extrabold font-mono text-white mt-1 flex items-baseline gap-1">
              {runningTotal.toFixed(1)}
              <span className="text-xs font-normal text-gray-400">kg CO₂e</span>
            </div>
            <p className="text-xs text-gray-400 mt-1 leading-tight">
              Sum of all categories currently calculated in real-time
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Category breakdown mini bar chart */}
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Live Category Breakdown</h3>
              <div className="space-y-2.5">
                {[
                  { name: 'Transit', val: transportCo2, color: CATEGORY_COLORS.transport },
                  { name: 'Energy', val: energyCo2, color: CATEGORY_COLORS.energy },
                  { name: 'Food', val: foodCo2, color: CATEGORY_COLORS.food },
                  { name: 'Shopping', val: shoppingCo2, color: CATEGORY_COLORS.shopping },
                  { name: 'Waste', val: wasteCo2, color: CATEGORY_COLORS.waste },
                ].map((item) => {
                  const percent = runningTotal > 0 ? (item.val / runningTotal) * 100 : 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500 font-semibold font-mono">
                        <span>{item.name}</span>
                        <span>{item.val.toFixed(1)} kg</span>
                      </div>
                      <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target comparison meter */}
            <div className="border-t border-gray-100 pt-4 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Weekly Benchmark comparison</span>
              <div className="text-xs flex justify-between font-semibold">
                <span className="text-green-600 font-bold">Safe Target: ~32 kg</span>
                <span className="text-red-500 font-bold">World Avg: ~90 kg</span>
              </div>
              <div className="w-full bg-gray-150 h-2.5 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full ${runningTotal > 90 ? 'bg-red-500' : runningTotal > 32 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((runningTotal / 120) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              <Button
                onClick={handleLogEntry}
                disabled={isLogging || activeCategoryCo2 === 0}
                className="w-full font-bold flex items-center justify-center gap-1.5 h-11"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{isLogging ? 'Logging...' : `Log ${activeTab.toUpperCase()} Entry`}</span>
              </Button>
              <p className="text-[10px] text-gray-400 text-center leading-tight">
                Logging awards <strong className="text-amber-500 font-mono">+15 XP</strong> and updates streaks
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
