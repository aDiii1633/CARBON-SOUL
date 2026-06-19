'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Globe, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { logger } from '@/lib/utils/logger';
import { CardTitle, CardDescription, Button, Label, Select, Progress, Slider } from '@/components/ui';

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useSession();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [country, setCountry] = useState('IN');
  const [householdSize, setHouseholdSize] = useState(2);
  const [homeType, setHomeType] = useState('apartment');

  const [transportMode, setTransportMode] = useState('car');
  const [weeklyDriveKm, setWeeklyDriveKm] = useState(100);
  const [flightsPerYear, setFlightsPerYear] = useState(2);

  const [dietType, setDietType] = useState<'vegan' | 'vegetarian' | 'omnivore' | 'meat-heavy'>('omnivore');
  const [foodWaste, setFoodWaste] = useState(15); // %

  const [electricityKwh, setElectricityKwh] = useState(150); // kWh/month
  const [gasUsage, setGasUsage] = useState(10);
  const [renewablePercent, setRenewablePercent] = useState(0);

  const [onlineShopping, setOnlineShopping] = useState(4); // deliveries/month
  const [clothingPurchases, setClothingPurchases] = useState(10); // clothing items/year

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country,
          transportMode,
          dietType,
          homeType,
          householdSize,
          electricityKwh,
          weeklyDriveKm,
          flightsPerYear,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (e) {
      logger.error('Onboarding', e);
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercent = (step / 5) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-6">
      {/* Header */}
      <div className="flex flex-col items-center max-w-xl mx-auto w-full mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <Globe className="h-6 w-6 text-green-600" />
          <span className="font-bold text-lg tracking-wider text-green-800 uppercase">EcoTrack Onboarding</span>
        </div>
        <div className="w-full mt-4">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            <span>Step {step} of 5</span>
            <span>{Math.round(progressPercent)}% Complete</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Steps Card */}
      <div className="flex-1 flex items-center justify-center max-w-xl mx-auto w-full mb-12">
        <div className="bg-white rounded-xl shadow-xl shadow-green-900/5 p-8 max-w-2xl mx-auto neo-flat relative overflow-hidden mt-6 w-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full -mr-16 -mt-16 z-0"></div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 relative z-10">
              {error}
            </div>
          )}
          <div className="relative z-10">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <CardTitle className="text-xl font-bold">Personal Context</CardTitle>
                  <CardDescription>Tell us a bit about where you live and your household size</CardDescription>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="country">Country of Residence</Label>
                    <Select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      options={[
                        { value: 'IN', label: 'India (IN)' },
                        { value: 'US', label: 'United States (US)' },
                        { value: 'GB', label: 'United Kingdom (GB)' },
                        { value: 'DE', label: 'Germany (DE)' },
                      ]}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="household">Household Size (People)</Label>
                    <Select
                      id="household"
                      value={String(householdSize)}
                      onChange={(e) => setHouseholdSize(parseInt(e.target.value))}
                      options={[
                        { value: '1', label: '1 (Single)' },
                        { value: '2', label: '2 People' },
                        { value: '3', label: '3 People' },
                        { value: '4', label: '4 People' },
                        { value: '5', label: '5+ People' },
                      ]}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="homeType">Home Structure</Label>
                    <Select
                      id="homeType"
                      value={homeType}
                      onChange={(e) => setHomeType(e.target.value)}
                      options={[
                        { value: 'apartment', label: 'Apartment / Flat' },
                        { value: 'house', label: 'Detached / Semi-detached House' },
                        { value: 'studio', label: 'Studio Apartment' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <CardTitle className="text-xl font-bold">Transport Habits</CardTitle>
                  <CardDescription>Your primary mode of travel and transit distances</CardDescription>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="transport">Primary Transit Mode</Label>
                    <Select
                      id="transport"
                      value={transportMode}
                      onChange={(e) => setTransportMode(e.target.value)}
                      options={[
                        { value: 'car', label: 'Petrol/Diesel Car' },
                        { value: 'hybrid', label: 'Hybrid Car' },
                        { value: 'electric', label: 'Electric Car' },
                        { value: 'bus', label: 'Public Bus' },
                        { value: 'train', label: 'Train / Metro' },
                        { value: 'walk', label: 'Walk / Cycle / None' },
                      ]}
                    />
                  </div>
                  {transportMode !== 'walk' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Weekly Distance Driven/Traveled</Label>
                        <span className="text-sm font-mono text-gray-500 font-bold">{weeklyDriveKm} km</span>
                      </div>
                      <Slider
                        min={0}
                        max={1000}
                        step={10}
                        value={weeklyDriveKm}
                        onChange={setWeeklyDriveKm}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Flights Taken Per Year</Label>
                      <span className="text-sm font-mono text-gray-500 font-bold">{flightsPerYear} flights</span>
                    </div>
                    <Slider
                      min={0}
                      max={20}
                      step={1}
                      value={flightsPerYear}
                      onChange={setFlightsPerYear}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <CardTitle className="text-xl font-bold">Diet & Food Habits</CardTitle>
                  <CardDescription>Your general dietary style and food waste metrics</CardDescription>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="diet">Dietary Style</Label>
                    <Select
                      id="diet"
                      value={dietType}
                      onChange={(e) => setDietType(e.target.value as 'vegan' | 'vegetarian' | 'omnivore' | 'meat-heavy')}
                      options={[
                        { value: 'vegan', label: 'Vegan (Strictly plant-based)' },
                        { value: 'vegetarian', label: 'Vegetarian (No meat, has dairy/eggs)' },
                        { value: 'omnivore', label: 'Omnivore (Balanced mixed diet)' },
                        { value: 'meat-heavy', label: 'Meat-Heavy (Beef, pork, or lamb daily)' },
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Estimated Weekly Food Waste</Label>
                      <span className="text-sm font-mono text-gray-500 font-bold">{foodWaste}% of meals</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={foodWaste}
                      onChange={setFoodWaste}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <CardTitle className="text-xl font-bold">Household Energy</CardTitle>
                  <CardDescription>Average monthly utility consumption metrics</CardDescription>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Electricity Usage (kWh / month)</Label>
                      <span className="text-sm font-mono text-gray-500 font-bold">{electricityKwh} kWh</span>
                    </div>
                    <Slider
                      min={0}
                      max={1000}
                      step={10}
                      value={electricityKwh}
                      onChange={setElectricityKwh}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Natural Gas Usage (m³ / month)</Label>
                      <span className="text-sm font-mono text-gray-500 font-bold">{gasUsage} m³</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={2}
                      value={gasUsage}
                      onChange={setGasUsage}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Renewable Energy Portion</Label>
                      <span className="text-sm font-mono text-gray-500 font-bold">{renewablePercent}% renewable</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={renewablePercent}
                      onChange={setRenewablePercent}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <CardTitle className="text-xl font-bold">Shopping & Consumption</CardTitle>
                  <CardDescription>Your general shopping and clothing purchase volumes</CardDescription>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Online Deliveries (Per Month)</Label>
                      <span className="text-sm font-mono text-gray-500 font-bold">{onlineShopping} deliveries</span>
                    </div>
                    <Slider
                      min={0}
                      max={30}
                      step={1}
                      value={onlineShopping}
                      onChange={setOnlineShopping}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Clothing Items Purchased (Per Year)</Label>
                      <span className="text-sm font-mono text-gray-500 font-bold">{clothingPurchases} items</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={2}
                      value={clothingPurchases}
                      onChange={setClothingPurchases}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isLoading}
              className="flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center space-x-1"
            >
              <span>{step === 5 ? (isLoading ? 'Calculating...' : 'Finish') : 'Next'}</span>
              {step === 5 ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400">
        You can always edit these values later in your Profile settings.
      </div>
    </div>
  );
}
