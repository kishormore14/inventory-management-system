'use client';

import React, { useState } from 'react';
import { Menu, Search, Bell, User, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  lowStockCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title = 'Inventory Management',
  lowStockCount = 0,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left Title & Mobile Menu toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Input Placeholder */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Quick search products, SKUs..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Notifications Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {lowStockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[10px] text-slate-400 font-medium">Real-time alerts</span>
              </div>
              <div className="py-3 space-y-2">
                {lowStockCount > 0 ? (
                  <Link
                    href="/products?stockStatus=LOW_STOCK"
                    onClick={() => setShowNotifications(false)}
                    className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2.5 hover:bg-amber-100/60 transition-colors block"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-950">
                        {lowStockCount} Product{lowStockCount > 1 ? 's' : ''} Low in Stock
                      </p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Items have fallen below reorder threshold.
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 text-xs text-slate-500">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>All stock levels are optimal.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile / Avatar Placeholder */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold text-xs shadow-sm">
            <User className="w-4 h-4 text-slate-200" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">Operations Admin</p>
            <p className="text-[10px] text-slate-400 leading-none mt-1">admin@inventra.local</p>
          </div>
        </div>
      </div>
    </header>
  );
};
