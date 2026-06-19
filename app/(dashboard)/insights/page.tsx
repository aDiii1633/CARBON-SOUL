'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Brain, Sparkles, AlertCircle, Compass, Lightbulb, UserCheck } from 'lucide-react';

const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const RadarChart = dynamic(() => import('recharts').then((m) => m.RadarChart), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then((m) => m.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then((m) => m.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import('recharts').then((m) => m.PolarRadiusAxis), { ssr: false });
const Radar = dynamic(() => import('recharts').then((m) => m.Radar), { ssr: false });
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false });

interface RadarItem {
  category: string;
  user: number;
  peer: number;
}

const MemoizedRadar = React.memo(function ProfileRadar({ data }: { data: RadarItem[] }) {
  return (
    <div className="h-72 w-full" aria-label="Radar chart comparing your emissions across transit, energy, food, shopping, and waste against the average global footprint.">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
          <Radar name="You" dataKey="user" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} />
          <Radar name="Target Peer" dataKey="peer" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default function InsightsPage() {
  const { carbonLogs } = useAppStore();

  const radarData = useMemo(() => {
    const totals = { transport: 0, energy: 0, food: 0, shopping: 0, waste: 0 };
    carbonLogs.forEach((log) => {
      if (totals[log.category as keyof typeof totals] !== undefined) {
        totals[log.category as keyof typeof totals] += log.co2Kg;
      }
    });

    // Targets (weekly/monthly averages scaled to scale nicely)
    return [
      { category: 'Transport', user: parseFloat(totals.transport.toFixed(1)), peer: 80 },
      { category: 'Energy', user: parseFloat(totals.energy.toFixed(1)), peer: 120 },
      { category: 'Food', user: parseFloat(totals.food.toFixed(1)), peer: 100 },
      { category: 'Shopping', user: parseFloat(totals.shopping.toFixed(1)), peer: 40 },
      { category: 'Waste', user: parseFloat(totals.waste.toFixed(1)), peer: 25 },
    ];
  }, [carbonLogs]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <p className="text-sm text-gray-500 font-medium">
          Review personalized reduction roadmaps, peer comparisons, and AI opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 columns): Carbon Profile Radar + Reduction Roadmap */}
        <div className="lg:col-span-8 space-y-6">
          {/* Radar Profile */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5 uppercase tracking-wider text-slate-800">
                <Compass className="h-4.5 w-4.5 text-green-600" />
                Your Carbon Profile
              </CardTitle>
              <CardDescription>Visual comparison of your emissions vs target peer average</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <MemoizedRadar data={radarData} />
            </CardContent>
          </Card>

          {/* AI Reduction Roadmap */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5 uppercase tracking-wider text-slate-800">
                <Brain className="h-4.5 w-4.5 text-green-600" />
                30/60/90 Day Reduction Roadmap
              </CardTitle>
              <CardDescription>AI-generated roadmap tailored to your profile context</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 30 Day */}
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-mono font-bold flex items-center justify-center shrink-0 text-sm">
                  30
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Focus: Quick Wins</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Improve recycling separations (reduce waste by ~10%), switch to LED bulbs at home, and choose plant-based milk twice a week. 
                    <strong className="text-green-600 block mt-1">Est. Savings: 15 kg CO₂ / month</strong>
                  </p>
                </div>
              </div>

              {/* 60 Day */}
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-green-150 text-green-800 font-mono font-bold flex items-center justify-center shrink-0 text-sm">
                  60
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Focus: Commute Transitions</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Substitute 2 car drives per week with public transit (train/metro or bus), and implement meat-free weekends.
                    <strong className="text-green-600 block mt-1">Est. Savings: 45 kg CO₂ / month</strong>
                  </p>
                </div>
              </div>

              {/* 90 Day */}
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-green-200 text-green-900 font-mono font-bold flex items-center justify-center shrink-0 text-sm">
                  90
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Focus: Strategic Utility & Purchases</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Source 20% of household energy from renewables (solar panels or green tariff options) and cut new clothing purchases in half.
                    <strong className="text-green-600 block mt-1">Est. Savings: 95 kg CO₂ / month</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 columns): Top Opportunities + Fact cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Opportunities */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500 fill-current" />
                Top Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-green-50/40 border border-green-200 rounded-xl">
                <div className="flex items-center space-x-2 text-xs font-bold text-green-700 uppercase">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Go Meat-Free</span>
                </div>
                <p className="text-xs text-gray-550 mt-1">
                  Vegetarian/Vegan shifts yield the highest savings. Beef emits 6.61 kg CO₂ per serving vs. 0.12 kg for plant-based.
                </p>
              </div>

              <div className="p-3 bg-blue-50/40 border border-blue-200 rounded-xl">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Transit Shifts</span>
                </div>
                <p className="text-xs text-gray-550 mt-1">
                  Swapping a petrol car (0.170 kg/km) for metro/train (0.041 kg/km) reduces emissions by 75% per km.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Did You Know? */}
          <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-amber-50/30 to-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-500 fill-current" />
                Did You Know?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-gray-550 leading-relaxed">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p>An average hardwood tree absorbs approximately 22 kg of CO₂ from the atmosphere per year.</p>
              </div>
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p>India&apos;s average carbon footprint is 1.9 tons, which is currently in-line with safe climate limits.</p>
              </div>
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p>Recycling aluminum saves 95% of the energy needed to manufacture it from raw materials.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
