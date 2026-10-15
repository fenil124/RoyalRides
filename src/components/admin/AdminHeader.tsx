'use client';

import { useState, useEffect } from 'react';
import { Menu, Bell, Shield, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataStore } from '@/lib/data-store';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  adminEmail?: string;
  adminName?: string;
}

export function AdminHeader({ onToggleSidebar, adminEmail = 'admin@gmail.com', adminName = 'Admin' }: AdminHeaderProps) {
  const [currentDateStr, setCurrentDateStr] = useState<string>('Today');

  const [syncStatus, setSyncStatus] = useState<string>('active');

  useEffect(() => {
    setCurrentDateStr(
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    );

    // Initial check
    const current = DataStore.getRealtimeStatus();
    setSyncStatus(current);

    // Listen to store updates
    const unsubscribe = DataStore.subscribe(() => {
      setSyncStatus(DataStore.getRealtimeStatus());
    });

    const interval = setInterval(() => {
      setSyncStatus(DataStore.getRealtimeStatus());
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live sync badge */}
        <div className={`hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
          syncStatus === 'disconnected'
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            syncStatus === 'disconnected' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'
          }`} />
          <span>
            {syncStatus === 'connected'
              ? 'Supabase Realtime Active'
              : syncStatus === 'connecting'
              ? 'Connecting Realtime...'
              : syncStatus === 'disconnected'
              ? 'Reconnecting Realtime...'
              : 'Realtime Sync Active'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Date display */}
        <span className="hidden md:inline-block text-xs font-medium text-[#64748B]">
          {currentDateStr}
        </span>

        {/* User profile capsule */}
        <Link
          to="/admin/profile"
          className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#0B2C50] text-[#F5B936] font-bold text-xs flex items-center justify-center">
            {adminName.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-bold text-[#14243A] leading-tight">
              {adminName}
            </span>
            <span className="block text-[10px] text-[#64748B] leading-none">
              Super Admin
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
