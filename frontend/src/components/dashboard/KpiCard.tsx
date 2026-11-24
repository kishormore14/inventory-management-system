import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}) => {
  const iconColorMap = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border border-amber-100',
    danger: 'bg-rose-50 text-rose-600 border border-rose-100',
  };

  const badgeColorMap = {
    default: 'text-slate-500',
    success: 'text-emerald-600 font-semibold',
    warning: 'text-amber-600 font-semibold',
    danger: 'text-rose-600 font-semibold',
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={cn('p-2.5 rounded-xl', iconColorMap[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {subtitle && <p className={cn('text-xs mt-1', badgeColorMap[variant])}>{subtitle}</p>}
      </div>
    </div>
  );
};
