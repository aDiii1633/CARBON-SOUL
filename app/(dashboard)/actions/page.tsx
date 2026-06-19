'use client';

import React from 'react';
import { DailyActions, StreakTracker, ProgressBar, BadgeDisplay } from '@/components/gamification';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Progress } from '@/components/ui';
import { Target, Award } from 'lucide-react';

export default function ActionsPage() {

  return (
    <div className="space-y-6">
      {/* Top Description */}
      <div className="border-b border-gray-200 pb-4">
        <p className="text-sm text-gray-500 font-medium">
          Participate in weekly challenges, complete daily actions, and build sustainable environmental habits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 columns): Daily Actions + Weekly Challenge */}
        <div className="lg:col-span-8 space-y-6">
          <DailyActions />

          {/* Weekly Challenge Card */}
          <Card className="border-gray-250">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold flex items-center gap-1.5 uppercase tracking-wider text-slate-800">
                  <Target className="h-4.5 w-4.5 text-green-600" />
                  Weekly Challenge
                </CardTitle>
                <CardDescription>Participate in collective eco challenges to earn bonus points</CardDescription>
              </div>
              <div className="bg-amber-50 px-2 py-1 rounded-md border border-amber-200 flex items-center gap-1 text-xs font-bold text-amber-700">
                <Award className="h-4 w-4 text-amber-500" />
                <span>100 XP Bonus</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 border border-gray-150 rounded-xl">
                <h4 className="text-sm font-bold text-slate-800">Commute Carbon-Free</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Log 5 transport entries using public transit (bus/train) or walking/cycling this week.
                </p>

                {/* Progress bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs text-gray-550 font-bold">
                    <span>Progress: 3 / 5 days</span>
                    <span>60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </div>

              <div className="p-4 border border-dashed border-gray-250 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700">Next Week Challenge</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Zero Plastic: Log waste recycling rate &gt; 50% for 3 logs</p>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Locked</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 columns): StreakTracker + ProgressBar + Badges */}
        <div className="lg:col-span-4 space-y-6">
          <ProgressBar />
          <StreakTracker />
          <BadgeDisplay />
        </div>
      </div>
    </div>
  );
}
