'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Menu, Sprout, Flame } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { points, level, currentStreak } = useAppStore();

  const getPageTitle = () => {
    const paths: Record<string, string> = {
      '/dashboard': 'Overview Dashboard',
      '/calculator': 'Carbon Footprint Calculator',
      '/actions': 'Daily Sustainability Actions',
      '/insights': 'AI Recommendations & Insights',
      '/profile': 'My Account Profile',
    };
    return paths[pathname] || 'EcoTrack';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-20 flex items-center justify-between px-6" role="banner">
      {/* Left side: Hamburger button + Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 rounded-md"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight transition-all duration-200">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right side: Streak and level indicator */}
      <div className="flex items-center space-x-4">
        {currentStreak > 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-200 text-amber-700 font-bold font-mono text-sm animate-pulse">
            <Flame className="h-4 w-4 fill-current text-amber-500" />
            <span>{currentStreak} Day Streak</span>
          </div>
        )}

        <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-200 text-green-700 font-semibold text-sm">
          <Sprout className="h-4 w-4 text-green-600" />
          <span>Level {level} ({points} XP)</span>
        </div>

        <div className="hidden sm:flex items-center space-x-2 border-l border-gray-200 pl-4">
          <div className="w-8 h-8 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner">
            {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
          </div>
          <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">
            {session?.user?.name || 'Eco Warrior'}
          </span>
        </div>
      </div>
    </header>
  );
}
