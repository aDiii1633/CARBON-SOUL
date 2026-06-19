'use client';

import React, { useState } from 'react';
import { Sidebar, Navbar, MobileNav } from '@/components/layout';
import AIChatAssistant from '@/components/ai/AIChatAssistant';

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main content wrapper */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 pt-20 pb-24 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Floating AI chat bubble in bottom-right of every dashboard page */}
      <AIChatAssistant />
    </div>
  );
}
