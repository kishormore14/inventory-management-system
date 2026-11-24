'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { LowStockTable } from '@/components/dashboard/LowStockTable';
import { RecentMovementsTable } from '@/components/dashboard/RecentMovementsTable';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { api } from '@/lib/api';
import { DashboardStats, CategoryValueStat, Product, InventoryMovement } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { 
  Package, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  XCircle,
  RefreshCw 
} from 'lucide-react';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categoryValues, setCategoryValues] = useState<CategoryValueStat[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentMovements, setRecentMovements] = useState<InventoryMovement[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, catData, lowData, movData] = await Promise.all([
        api.getDashboardStats(),
        api.getCategoryValues(),
        api.getLowStockProducts(),
        api.getRecentMovements(),
      ]);

      setStats(statsData);
      setCategoryValues(catData);
      setLowStockProducts(lowData);
      setRecentMovements(movData);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Unable to fetch dashboard analytics from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(true)}
          title="Dashboard & Analytics"
          lowStockCount={stats?.lowStockProducts || 0}
        />

        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">System Overview</h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time metrics, warehouse valuation, and critical inventory alerts
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </button>
          </div>

          {error && <ErrorState message={error} onRetry={fetchDashboardData} />}

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-8 rounded-xl" />
                  </div>
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            ) : (
              <>
                <KpiCard
                  title="Total Products"
                  value={formatNumber(stats?.totalProducts || 0)}
                  subtitle="Unique catalog SKUs"
                  icon={Package}
                  variant="default"
                />
                <KpiCard
                  title="Inventory Units"
                  value={formatNumber(stats?.totalInventoryUnits || 0)}
                  subtitle="Physical items in stock"
                  icon={Layers}
                  variant="default"
                />
                <KpiCard
                  title="Inventory Value"
                  value={formatCurrency(stats?.totalInventoryValue || 0)}
                  subtitle="Total asset value"
                  icon={DollarSign}
                  variant="success"
                />
                <KpiCard
                  title="Low Stock"
                  value={formatNumber(stats?.lowStockProducts || 0)}
                  subtitle="Needs reordering"
                  icon={AlertTriangle}
                  variant={stats?.lowStockProducts ? 'warning' : 'default'}
                />
                <KpiCard
                  title="Out of Stock"
                  value={formatNumber(stats?.outOfStockProducts || 0)}
                  subtitle="Zero items left"
                  icon={XCircle}
                  variant={stats?.outOfStockProducts ? 'danger' : 'default'}
                />
              </>
            )}
          </div>

          {/* Charts & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {loading ? (
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm h-72 flex items-center justify-center">
                  <Skeleton className="w-full h-full" />
                </div>
              ) : (
                <CategoryChart data={categoryValues} />
              )}
            </div>

            <div className="lg:col-span-2">
              {loading ? (
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm h-72 flex items-center justify-center">
                  <Skeleton className="w-full h-full" />
                </div>
              ) : (
                <LowStockTable products={lowStockProducts} />
              )}
            </div>
          </div>

          {/* Recent Movements Section */}
          <div>
            {loading ? (
              <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm h-72 flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            ) : (
              <RecentMovementsTable movements={recentMovements} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
