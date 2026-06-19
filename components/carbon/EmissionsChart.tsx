'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store';
import { Calendar } from 'lucide-react';

// Dynamically import Recharts to optimize loading performance
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ReferenceLine = dynamic(() => import('recharts').then((m) => m.ReferenceLine), { ssr: false });

interface ChartItem {
  date: string;
  'CO2 (kg)': number;
}

const MemoizedChart = React.memo(function Chart({ data, benchmark }: { data: ChartItem[]; benchmark: number }) {
  return (
    <div className="h-72 w-full mt-4" aria-label="Line chart summarizing your daily carbon emissions for the chosen timeframe compared to the global average benchmark.">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
          />
          <ReferenceLine
            y={benchmark}
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{ value: 'World Average', position: 'top', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }}
          />
          <Area type="monotone" dataKey="CO2 (kg)" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorCo2)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default function EmissionsChart() {
  const { carbonLogs } = useAppStore();
  const [timeframe, setTimeframe] = useState<'7' | '30' | '90'>('30');

  // Daily average benchmark: 4700kg / 365 = ~12.87 kg/day
  const BENCHMARK_DAILY = 12.87;

  const chartData = useMemo(() => {
    const daysToFilter = parseInt(timeframe);
    const now = new Date();
    
    // Group logs by date
    const dateGroups: Record<string, number> = {};

    // Initialize all dates in timeframe
    for (let i = daysToFilter - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dateGroups[label] = 0;
    }

    carbonLogs.forEach((log) => {
      const logDate = new Date(log.date);
      const diffTime = Math.abs(now.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= daysToFilter) {
        const label = logDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (dateGroups[label] !== undefined) {
          dateGroups[label] += log.co2Kg;
        }
      }
    });

    return Object.entries(dateGroups).map(([date, co2]) => ({
      date,
      'CO2 (kg)': parseFloat(co2.toFixed(1)),
    }));
  }, [carbonLogs, timeframe]);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-250/50 shadow-sm flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="h-4 w-4 text-green-600" />
            Emissions Trend
          </h2>
          <p className="text-xs text-gray-500">Your carbon logs over time vs. the global target benchmark</p>
        </div>

        {/* Timeframe Toggle */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-gray-200">
          {(['7', '30', '90'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                timeframe === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t} Days
            </button>
          ))}
        </div>
      </div>

      <MemoizedChart data={chartData} benchmark={BENCHMARK_DAILY} />
    </div>
  );
}
