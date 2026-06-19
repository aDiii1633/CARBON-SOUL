'use client';

import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Label, Select } from '@/components/ui';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [country, setCountry] = useState('IN');
  const [householdSize, setHouseholdSize] = useState(2);
  const [homeType, setHomeType] = useState('apartment');
  const [transportMode, setTransportMode] = useState('car');
  const [weeklyDriveKm, setWeeklyDriveKm] = useState(100);
  const [flightsPerYear, setFlightsPerYear] = useState(2);
  const [dietType, setDietType] = useState('omnivore');
  const [electricityKwh, setElectricityKwh] = useState(150);

  // Load current profile on mount
  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const profile = await res.json();
          if (profile) {
            setCountry(profile.country || 'IN');
            setHouseholdSize(profile.householdSize || 2);
            setHomeType(profile.homeType || 'apartment');
            setTransportMode(profile.transportMode || 'car');
            setWeeklyDriveKm(profile.weeklyDriveKm || 0);
            setFlightsPerYear(profile.flightsPerYear || 0);
            setDietType(profile.dietType || 'omnivore');
            setElectricityKwh(profile.electricityKwh || 0);
          }
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

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

      if (res.ok) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to onboarding API.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Description */}
      <div className="border-b border-gray-200 pb-4">
        <p className="text-sm text-gray-500 font-medium">
          Manage your account profile parameters and default carbon calculation factors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 columns): Profile Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave}>
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-1.5 uppercase tracking-wider text-slate-800">
                  <User className="h-5 w-5 text-green-600" />
                  Personal Profile & Habits
                </CardTitle>
                <CardDescription>Update your habits to recalculate your baseline emissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {isLoading ? (
                  <p className="text-sm text-gray-500">Loading profile...</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="country">Country</Label>
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
                        <Label htmlFor="household">Household Size</Label>
                        <Input
                          id="household"
                          type="number"
                          value={householdSize || ''}
                          onChange={(e) => setHouseholdSize(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="homeType">Home Structure</Label>
                        <Select
                          id="homeType"
                          value={homeType}
                          onChange={(e) => setHomeType(e.target.value)}
                          options={[
                            { value: 'apartment', label: 'Apartment' },
                            { value: 'house', label: 'House' },
                            { value: 'studio', label: 'Studio Apartment' },
                          ]}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="diet">Dietary Style</Label>
                        <Select
                          id="diet"
                          value={dietType}
                          onChange={(e) => setDietType(e.target.value)}
                          options={[
                            { value: 'vegan', label: 'Vegan' },
                            { value: 'vegetarian', label: 'Vegetarian' },
                            { value: 'omnivore', label: 'Omnivore' },
                            { value: 'meat-heavy', label: 'Meat-heavy' },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="transport">Primary Transit Mode</Label>
                        <Select
                          id="transport"
                          value={transportMode}
                          onChange={(e) => setTransportMode(e.target.value)}
                          options={[
                            { value: 'car', label: 'Car (Petrol/Diesel)' },
                            { value: 'hybrid', label: 'Car (Hybrid)' },
                            { value: 'electric', label: 'Car (Electric)' },
                            { value: 'bus', label: 'Bus' },
                            { value: 'train', label: 'Train / Metro' },
                            { value: 'walk', label: 'Walk / Cycle' },
                          ]}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="weeklyDrive">Weekly Distance Driven (km)</Label>
                        <Input
                          id="weeklyDrive"
                          type="number"
                          value={weeklyDriveKm || ''}
                          onChange={(e) => setWeeklyDriveKm(Math.max(0, parseFloat(e.target.value) || 0))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="electricity">Monthly Electricity (kWh)</Label>
                        <Input
                          id="electricity"
                          type="number"
                          value={electricityKwh || ''}
                          onChange={(e) => setElectricityKwh(Math.max(0, parseFloat(e.target.value) || 0))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="flights">Flights Per Year</Label>
                        <Input
                          id="flights"
                          type="number"
                          value={flightsPerYear || ''}
                          onChange={(e) => setFlightsPerYear(Math.max(0, parseInt(e.target.value) || 0))}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                      <Button type="submit" disabled={isSaving} className="font-bold flex items-center gap-1.5 h-11 px-6">
                        <ShieldCheck className="h-4.5 w-4.5" />
                        <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Right Column (4 columns): Info card */}
        <div className="lg:col-span-4">
          <Card className="border-gray-250 bg-slate-50/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="h-4.5 w-4.5 text-blue-500" />
                Baseline Recalculation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-550 leading-relaxed space-y-3">
              <p>
                Saving your profile settings will automatically recalculate your carbon baseline footprints.
              </p>
              <p>
                This ensures that your metric progress bar graphs remain up-to-date and representative of your lifestyle parameters.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
