'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  Car,
  CheckSquare,
  BrainCircuit,
  User,
  LogOut,
  Sprout,
  Flame,
  Globe
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calculator', label: 'Carbon Calculator', icon: Car },
  { href: '/actions', label: 'Daily Actions', icon: CheckSquare },
  { href: '/insights', label: 'AI Insights', icon: BrainCircuit },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { points, level, levelName, currentStreak } = useAppStore();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <aside className="w-64 bg-[#0f1f0f] text-gray-300 flex flex-col h-screen fixed left-0 top-0 border-r border-green-950 z-30">
      {/* Brand header */}
      <div className="h-16 flex items-center px-6 border-b border-green-950">
        <Link href="/" className="flex items-center space-x-2 text-white hover:opacity-90">
          <Globe className="h-6 w-6 text-green-400" />
          <span className="font-bold text-lg tracking-wider text-green-300 uppercase">EcoTrack</span>
        </Link>
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" aria-label="Dashboard sidebar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-250 ${
                isActive
                  ? 'bg-green-600 text-white font-bold border-l-4 border-emerald-400 shadow-md'
                  : 'hover:bg-green-950/40 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-green-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info & Level badge at bottom */}
      <div className="p-4 border-t border-green-950 bg-green-950/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-sm uppercase">
            {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {session?.user?.name || 'Eco Warrior'}
            </p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
          </div>
        </div>

        {/* Level & Points Progress */}
        <div className="bg-[#0b140b] p-3 rounded-lg border border-green-900/40 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-green-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sprout className="h-3.5 w-3.5" />
              {levelName}
            </span>
            <span className="text-xs font-mono text-gray-300">Level {level}</span>
          </div>
          <div className="text-xs text-gray-400 flex justify-between">
            <span>Points: <strong className="font-mono text-green-300">{points}</strong></span>
            {currentStreak > 0 && (
              <span className="flex items-center text-amber-500 font-bold font-mono">
                <Flame className="h-3 w-3 fill-current mr-0.5 animate-pulse" />
                {currentStreak}d
              </span>
            )}
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleSignOut}
          aria-label="Sign Out"
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-xs font-semibold text-gray-400 hover:text-white hover:bg-green-900/30 transition border border-green-900/30"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
