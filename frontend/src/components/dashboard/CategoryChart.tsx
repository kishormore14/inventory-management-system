import React from 'react';
import { CategoryValueStat } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface CategoryChartProps {
  data: CategoryValueStat[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => d.totalValue), 1);

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Inventory Value by Category</h3>
          <p className="text-xs text-slate-500 mt-0.5">Asset valuation distribution across product categories</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = Math.round((item.totalValue / maxValue) * 100);
          const colors = [
            'bg-emerald-500',
            'bg-sky-500',
            'bg-indigo-500',
            'bg-violet-500',
            'bg-amber-500',
            'bg-teal-500',
            'bg-rose-500',
            'bg-slate-500',
          ];
          const colorClass = colors[index % colors.length];

          return (
            <div key={item.categoryId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{item.categoryName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono text-[11px]">{item.totalUnits} units</span>
                  <span className="font-semibold text-slate-900 font-mono">{formatCurrency(item.totalValue)}</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colorClass} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
