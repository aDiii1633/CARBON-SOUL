'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui';
import dynamic from 'next/dynamic';

const EmissionsChart = dynamic(() => import('@/components/carbon/EmissionsChart'), { 
  ssr: false, 
  loading: () => <div className="h-[300px] flex items-center justify-center text-sm text-gray-500">Loading chart...</div> 
});
const CategoryBreakdown = dynamic(() => import('@/components/carbon/CategoryBreakdown'), { 
  ssr: false,
  loading: () => <div className="h-[250px] flex items-center justify-center text-sm text-gray-500">Loading breakdown...</div> 
});
import { DailyActions, StreakTracker, ProgressBar, BadgeDisplay } from '@/components/gamification';
import { Leaf, Flame, Shield, TrendingDown } from 'lucide-react';

export default function DashboardPage() {
  const { monthlyCo2, dailyAverage, totalSavedCo2, currentStreak } = useAppStore();

  return (
    <div className="space-y-6">
      {/* Top Row - Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric Card 1 */}
        <Card className="border-t-4 border-t-green-600">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">CO₂ This Month</span>
              <p className="text-2xl font-extrabold font-mono text-slate-800 tracking-tight mt-1">
                {monthlyCo2.toFixed(1)} <span className="text-xs font-normal text-gray-500">kg</span>
              </p>
              <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5 mt-1">
                <TrendingDown className="h-3 w-3" /> -12.4% vs last month
              </span>
            </div>
            <div className="bg-green-50 p-3 rounded-xl border border-green-150 text-green-600">
              <Leaf className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metric Card 2 */}
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Daily Average</span>
              <p className="text-2xl font-extrabold font-mono text-slate-800 tracking-tight mt-1">
                {dailyAverage.toFixed(1)} <span className="text-xs font-normal text-gray-500">kg/day</span>
              </p>
              <span className="text-[10px] text-gray-400 font-semibold block mt-1">
                Target: &lt;12.8 kg/day
              </span>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-150 text-blue-500">
              <Leaf className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metric Card 3 */}
        <Card className="border-t-4 border-t-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">CO₂ Saved</span>
              <p className="text-2xl font-extrabold font-mono text-slate-800 tracking-tight mt-1">
                {totalSavedCo2.toFixed(1)} <span className="text-xs font-normal text-gray-500">kg</span>
              </p>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                From completed actions
              </span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-150 text-emerald-500">
              <Shield className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metric Card 4 */}
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Current Streak</span>
              <p className="text-2xl font-extrabold font-mono text-slate-800 tracking-tight mt-1">
                {currentStreak} <span className="text-xs font-normal text-gray-500">days</span>
              </p>
              <span className="text-[10px] text-amber-600 font-bold block mt-1">
                Keep the flame burning!
              </span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-150 text-amber-500 animate-pulse">
              <Flame className="h-6 w-6 fill-current" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row - Area Chart + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <EmissionsChart />
        </div>
        <div className="lg:col-span-4">
          <CategoryBreakdown />
        </div>
      </div>

      {/* Bottom Row - Recommended Actions + Streaks/Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <DailyActions />
        </div>
        <div className="lg:col-span-6 space-y-6">
          <ProgressBar />
          <StreakTracker />
          <BadgeDisplay />
        </div>
      </div>
    </div>
  );
}
