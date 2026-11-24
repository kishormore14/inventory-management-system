import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { StockBadge } from '../ui/StockBadge';
import { ArrowUpRight, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface LowStockTableProps {
  products: Product[];
}

export const LowStockTable: React.FC<LowStockTableProps> = ({ products }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-200/60">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Low Stock Alerts</h3>
            <p className="text-xs text-slate-500 mt-0.5">Products that reached or fell below reorder threshold</p>
          </div>
        </div>
        <Link
          href="/products?stockStatus=LOW_STOCK"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          View all
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto">
        {products.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No products currently at or below their reorder threshold.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-800">{p.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{p.sku}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.stock_quantity}</td>
                  <td className="py-3.5 px-4 text-slate-500">{p.reorder_level}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{formatCurrency(p.unit_price)}</td>
                  <td className="py-3.5 px-6">
                    <StockBadge status={p.stock_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
