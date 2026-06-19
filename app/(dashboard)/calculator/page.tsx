import React from 'react';
import CarbonCalculator from '@/components/carbon/CarbonCalculator';

export default function CalculatorPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <p className="text-sm text-gray-500 font-medium">
          Calculate footprint entries in transport, energy, food, shopping, and waste.
        </p>
      </div>
      <CarbonCalculator />
    </div>
  );
}
