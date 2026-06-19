'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { CheckSquare, Check, Sparkles, Sprout, Car, Zap, Utensils, ShoppingBag, Trash2, LucideIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  transport: Car,
  energy: Zap,
  food: Utensils,
  shopping: ShoppingBag,
  waste: Trash2,
};

const CATEGORY_COLORS: Record<string, string> = {
  transport: 'text-blue-500 bg-blue-50 border-blue-200',
  energy: 'text-amber-500 bg-amber-50 border-amber-200',
  food: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  shopping: 'text-purple-500 bg-purple-50 border-purple-200',
  waste: 'text-red-500 bg-red-50 border-red-200',
};

export default function DailyActions() {
  const { dailyActions, completeAction } = useAppStore();
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleComplete = async (actionId: string) => {
    setCompletingId(actionId);

    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId }),
      });

      if (res.ok) {
        // Optimistic UI updates and Confetti
        completeAction(actionId);
        triggerConfetti();
      } else {
        alert('Could not complete the action. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating action status.');
    } finally {
      setCompletingId(null);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#22c55e', '#10b981', '#3b82f6', '#f59e0b'],
    });
  };

  const completedCount = dailyActions.filter((a) => a.completed).length;
  const progressPercent = dailyActions.length > 0 ? (completedCount / dailyActions.length) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-250/50 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckSquare className="h-4 w-4 text-green-600" />
              Daily Actions
            </h2>
            <p className="text-xs text-gray-500">Earn points and reduce emissions with daily eco-habits</p>
          </div>
          <div className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-current" />
            <span>{completedCount}/{dailyActions.length} Done</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
            <div
              className="bg-green-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {dailyActions.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">
          No daily actions recommended for today.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {dailyActions.map((action) => {
            const Icon = CATEGORY_ICONS[action.category] || Sprout;
            const badgeColors = CATEGORY_COLORS[action.category] || 'text-gray-500 bg-gray-50 border-gray-250';

            return (
              <div
                key={action.actionId}
                className={`p-4 rounded-xl border flex items-center justify-between transition gap-4 ${
                  action.completed
                    ? 'bg-green-50/20 border-green-200'
                    : 'bg-white border-gray-200/80 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${badgeColors}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold text-gray-800 leading-tight ${action.completed ? 'line-through text-gray-400' : ''}`}>
                      {action.title}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-gray-400 uppercase mt-1">
                      <span className="text-green-600 font-extrabold">-{action.co2SavedKg} kg CO₂</span>
                      <span>•</span>
                      <span className="text-amber-500">+{action.points} XP</span>
                    </div>
                  </div>
                </div>

                {action.completed ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 border border-green-200">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleComplete(action.actionId)}
                    disabled={completingId === action.actionId}
                    className="shrink-0 h-8 px-3 font-semibold"
                  >
                    {completingId === action.actionId ? '...' : 'Complete'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
