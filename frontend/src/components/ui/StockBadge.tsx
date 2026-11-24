import React from 'react';
import { cn } from '@/lib/utils';

interface StockBadgeProps {
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  className?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ status, className }) => {
  if (status === 'OUT_OF_STOCK') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60',
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
        Out of Stock
      </span>
    );
  }

  if (status === 'LOW_STOCK') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60',
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
        Low Stock
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60',
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      In Stock
    </span>
  );
};
