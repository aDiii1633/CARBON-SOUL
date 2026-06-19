'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Leaf, Info } from 'lucide-react';

export default function CarbonScore() {
  const { monthlyCo2 } = useAppStore();

  // Monthly benchmarks:
  // Target: 2.0 tons/yr / 12 = ~166 kg/month
  // Global average: 4.7 tons/yr / 12 = ~391 kg/month
  const MONTHLY_TARGET = 166.7;
  const MONTHLY_GLOBAL = 391.7;

  const getScoreStatus = () => {
    if (monthlyCo2 === 0) return { label: 'No Data', color: 'text-gray-400', desc: 'Log entries to see score status.' };
    if (monthlyCo2 <= MONTHLY_TARGET) {
      return {
        label: 'Eco Hero',
        color: 'text-green-600',
        desc: 'Fantastic! Your footprint matches the climate-safe 2.0-ton global warming limit target.',
      };
    }
    if (monthlyCo2 <= MONTHLY_GLOBAL) {
      return {
        label: 'Average track',
        color: 'text-amber-500',
        desc: 'Not bad! You are below the average global citizen footprint, but can still reduce further.',
      };
    }
    return {
      label: 'High Emission',
      color: 'text-red-500',
      desc: 'Caution! Your emissions are exceeding the global average. Review AI suggestions for offsets.',
    };
  };

  const status = getScoreStatus();
  const targetPercent = Math.min((monthlyCo2 / MONTHLY_GLOBAL) * 100, 100);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-250/50 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
          <Leaf className="h-4 w-4 text-green-600" />
          Footprint Rating
        </h2>
        <p className="text-xs text-gray-500">Your performance against sustainable global targets</p>
      </div>

      <div className="my-6 text-center">
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Monthly Footprint</span>
        <div className="text-4xl font-extrabold font-mono text-slate-800 tracking-tight">
          {monthlyCo2.toFixed(1)} <span className="text-lg font-normal text-gray-500">kg CO₂e</span>
        </div>
        <span className={`text-sm font-bold uppercase tracking-wider ${status.color} mt-2 block`}>
          {status.label}
        </span>
      </div>

      {/* Meter Bar */}
      <div className="space-y-1.5">
        <div className="relative w-full bg-gray-150 h-3 rounded-full overflow-hidden">
          {/* Target marker */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-green-500 rounded-full"
            style={{ width: `${Math.min(targetPercent, (MONTHLY_TARGET / MONTHLY_GLOBAL) * 100)}%` }}
          />
          {/* Above target marker */}
          {monthlyCo2 > MONTHLY_TARGET && (
            <div
              className={`absolute top-0 bottom-0 bg-amber-500`}
              style={{
                left: `${(MONTHLY_TARGET / MONTHLY_GLOBAL) * 100}%`,
                width: `${Math.min(
                  ((monthlyCo2 - MONTHLY_TARGET) / MONTHLY_GLOBAL) * 100,
                  ((MONTHLY_GLOBAL - MONTHLY_TARGET) / MONTHLY_GLOBAL) * 100
                )}%`,
              }}
            />
          )}
          {/* Excess average marker */}
          {monthlyCo2 > MONTHLY_GLOBAL && (
            <div
              className="absolute top-0 bottom-0 bg-red-500"
              style={{
                left: '100%',
                width: '10px', // slight overflow
              }}
            />
          )}
        </div>
        
        {/* Benchmarks legends */}
        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase font-mono">
          <span>0 kg</span>
          <span>Target: {MONTHLY_TARGET.toFixed(0)} kg</span>
          <span>World Avg: {MONTHLY_GLOBAL.toFixed(0)} kg</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-50 border border-gray-150 rounded-lg flex items-start space-x-2 text-xs text-gray-500">
        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{status.desc}</p>
      </div>
    </div>
  );
}
