import React from 'react';
import Link from 'next/link';
import { InventoryMovement } from '@/types';
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface RecentMovementsTableProps {
  movements: InventoryMovement[];
}

export const RecentMovementsTable: React.FC<RecentMovementsTableProps> = ({ movements }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Stock Movements</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time audit log of inventory changes</p>
        </div>
        <Link
          href="/inventory"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          View ledger
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto">
        {movements.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No inventory movements recorded yet.</div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Change</th>
                <th className="py-3 px-4">New Stock</th>
                <th className="py-3 px-4">Reference</th>
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
                          IN
                        </span>
                      )}
                      {m.movement_type === 'STOCK_OUT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/50">
                          <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          OUT
                        </span>
                      )}
                      {m.movement_type === 'ADJUSTMENT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                          <RefreshCw className="w-3 h-3 text-indigo-600" />
                          ADJ
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
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{m.new_stock}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {m.reference_number || '-'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 whitespace-nowrap">{formatDate(m.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
