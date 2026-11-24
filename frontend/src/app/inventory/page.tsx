'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { StockInModal } from '@/components/inventory/StockInModal';
import { StockOutModal } from '@/components/inventory/StockOutModal';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { InventoryMovement, Product, MovementType } from '@/types';
import { formatDate } from '@/lib/utils';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Search, 
  Filter, 
  History, 
  FileText 
} from 'lucide-react';

export default function InventoryMovementsPage() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ledger state
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [totalMovements, setTotalMovements] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedType, setSelectedType] = useState<MovementType | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Modals state
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Products for dropdown selectors
  const fetchProductList = useCallback(async () => {
    try {
      const data = await api.getProducts({ limit: 100 });
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to load products for movement dropdown:', err);
    }
  }, []);

  // Fetch Movements
  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMovements({
        productId: selectedProduct || undefined,
        movementType: selectedType || undefined,
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: pageSize,
      });
      setMovements(data.movements);
      setTotalMovements(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory movements');
    } finally {
      setLoading(false);
    }
  }, [search, selectedProduct, selectedType, startDate, endDate, page]);

  useEffect(() => {
    fetchProductList();
  }, [fetchProductList]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  // Handlers for Stock Operations
  const handleStockIn = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.stockIn(data);
      toast.success('Stock-in recorded successfully.');
      setIsStockInOpen(false);
      fetchMovements();
      fetchProductList();
    } catch (err: any) {
      toast.error(err.message || 'Stock-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockOut = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.stockOut(data);
      toast.success('Stock-out recorded successfully.');
      setIsStockOutOpen(false);
      fetchMovements();
      fetchProductList();
    } catch (err: any) {
      toast.error(err.message || 'Stock-out failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockAdjustment = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.stockAdjustment(data);
      toast.success('Stock adjustment recorded successfully.');
      setIsAdjustmentOpen(false);
      fetchMovements();
      fetchProductList();
    } catch (err: any) {
      toast.error(err.message || 'Stock adjustment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(true)} title="Inventory Movements" />

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Bar with Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Inventory Ledger</h2>
              <p className="text-xs text-slate-500 mt-1">
                Immutable audit trail of all warehouse stock intakes, dispatches, and reconciliation adjustments
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                onClick={() => setIsStockInOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-xl hover:bg-emerald-100/70 transition-colors shadow-sm"
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                Stock In
              </button>

              <button
                onClick={() => setIsStockOutOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 rounded-xl hover:bg-rose-100/70 transition-colors shadow-sm"
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                Stock Out
              </button>

              <button
                onClick={() => setIsAdjustmentOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 rounded-xl hover:bg-indigo-100/70 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                Adjust Stock
              </button>
            </div>
          </div>

          {error && <ErrorState message={error} onRetry={fetchMovements} />}

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search product, SKU, reference..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                />
              </div>

              {/* Product Filter */}
              <div>
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                >
                  <option value="">All Products</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* Movement Type Filter */}
              <div>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value as any);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                >
                  <option value="">All Movement Types</option>
                  <option value="STOCK_IN">Stock In (+)</option>
                  <option value="STOCK_OUT">Stock Out (-)</option>
                  <option value="ADJUSTMENT">Adjustment (&plusmn;)</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                  title="Start Date"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                  title="End Date"
                />
              </div>
            </div>
          </div>

          {/* Movements History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              {loading ? (
                <TableSkeleton rows={8} columns={8} />
              ) : movements.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No movement records found"
                  description="No stock movements match the specified filter criteria. Start recording incoming stock or adjustments above."
                />
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-6">Product</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Change</th>
                      <th className="py-3 px-4">Previous Stock</th>
                      <th className="py-3 px-4">New Stock</th>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-6">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {movements.map((m) => {
                      const isPositive = m.quantity_change > 0;
                      const isZero = m.quantity_change === 0;

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-6">
                            <div className="font-semibold text-slate-800">{m.product_name}</div>
                            <div className="text-[11px] font-mono text-slate-400">{m.sku}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {m.movement_type === 'STOCK_IN' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                                Stock In
                              </span>
                            )}
                            {m.movement_type === 'STOCK_OUT' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/50">
                                <ArrowUpRight className="w-3 h-3 text-rose-600" />
                                Stock Out
                              </span>
                            )}
                            {m.movement_type === 'ADJUSTMENT' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                                <RefreshCw className="w-3 h-3 text-indigo-600" />
                                Adjustment
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <span
                              className={
                                isPositive
                                  ? 'text-emerald-600'
                                  : isZero
                                  ? 'text-slate-500'
                                  : 'text-rose-600'
                              }
                            >
                              {isPositive ? `+${m.quantity_change}` : m.quantity_change}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">{m.previous_stock}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{m.new_stock}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                            {m.reference_number || '-'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={m.notes || ''}>
                            {m.notes || '-'}
                          </td>
                          <td className="py-3.5 px-6 text-slate-500 whitespace-nowrap">{formatDate(m.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <Pagination
              currentPage={page}
              totalItems={totalMovements}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </main>
      </div>

      {/* Stock In Modal */}
      {isStockInOpen && (
        <StockInModal
          isOpen={isStockInOpen}
          onClose={() => setIsStockInOpen(false)}
          onSubmit={handleStockIn}
          products={products}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Stock Out Modal */}
      {isStockOutOpen && (
        <StockOutModal
          isOpen={isStockOutOpen}
          onClose={() => setIsStockOutOpen(false)}
          onSubmit={handleStockOut}
          products={products}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustmentOpen && (
        <StockAdjustmentModal
          isOpen={isAdjustmentOpen}
          onClose={() => setIsAdjustmentOpen(false)}
          onSubmit={handleStockAdjustment}
          products={products}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
