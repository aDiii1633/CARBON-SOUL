'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store';
import { CARBON_CATEGORIES, CarbonCategory } from '@/lib/carbon/categories';
import { Award } from 'lucide-react';

const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false });

const CATEGORY_COLORS: Record<CarbonCategory, string> = {
  transport: '#3b82f6', // blue
  energy: '#f59e0b',    // amber
  food: '#10b981',      // emerald
  shopping: '#8b5cf6',  // purple
  waste: '#ef4444',     // red
};

interface BreakdownItem {
  name: string;
  value: number;
  color: string;
}

const MemoizedPie = React.memo(function PieDonut({ data, onSegmentClick }: { data: BreakdownItem[]; onSegmentClick: (cat: CarbonCategory) => void }) {
  return (
    <div className="h-64 w-full" aria-label="Donut chart displaying the division of emissions across five categories: transport, energy, food, shopping, and waste.">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            onClick={(e: { payload?: { name?: string } }) => onSegmentClick(e.payload?.name?.toLowerCase() as CarbonCategory)}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value: unknown) => [`${Number(value || 0).toFixed(1)} kg CO2`, 'Emissions']}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

export default function CategoryBreakdown() {
  const { carbonLogs } = useAppStore();
  const [drilldownCategory, setDrilldownCategory] = useState<CarbonCategory | null>(null);

  const breakdownData = useMemo(() => {
    const totals: Record<CarbonCategory, number> = {
      transport: 0,
      energy: 0,
      food: 0,
      shopping: 0,
      waste: 0,
    };

    carbonLogs.forEach((log) => {
      if (totals[log.category as CarbonCategory] !== undefined) {
        totals[log.category as CarbonCategory] += log.co2Kg;
      }
    });

    return Object.entries(totals)
      .map(([cat, value]) => ({
        name: CARBON_CATEGORIES[cat as CarbonCategory].name,
        value,
        color: CATEGORY_COLORS[cat as CarbonCategory],
      }))
      .filter((item) => item.value > 0);
  }, [carbonLogs]);

  // List logs under the drilled-down category
  const drilldownLogs = useMemo(() => {
    if (!drilldownCategory) return [];
    return carbonLogs
      .filter((log) => log.category === drilldownCategory)
      .slice(0, 5); // show last 5 entries
  }, [carbonLogs, drilldownCategory]);

  const handleSegmentClick = React.useCallback((category: CarbonCategory) => {
    setDrilldownCategory((prev) => (prev === category ? null : category));
  }, []);

  const totalEmissions = breakdownData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-250/50 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
          <Award className="h-4 w-4 text-green-600" />
          Category Breakdown
        </h2>
        <p className="text-xs text-gray-500">Click segments to review detailed logs by category</p>
      </div>

      {totalEmissions === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm">
          <span>No logs entered yet.</span>
          <span>Use the calculator to log your footprint.</span>
        </div>
      ) : (
        <>
          <MemoizedPie data={breakdownData} onSegmentClick={handleSegmentClick} />

          {drilldownCategory && (
            <div className="mt-4 pt-4 border-t border-gray-150 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Recent {CARBON_CATEGORIES[drilldownCategory].name} Logs
                </h3>
                <button
                  onClick={() => setDrilldownCategory(null)}
                  className="text-xs text-green-600 hover:underline"
                >
                  Clear filter
                </button>
              </div>
              {drilldownLogs.length === 0 ? (
                <p className="text-xs text-gray-400">No logs logged under this category yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {drilldownLogs.map((log) => (
                    <li key={log.id} className="flex justify-between text-xs py-1 border-b border-gray-50">
                      <span className="text-gray-600 truncate max-w-[200px]">{log.activity}</span>
                      <span className="font-mono font-bold text-slate-800">{log.co2Kg.toFixed(1)} kg CO2</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
export { CATEGORY_COLORS };
