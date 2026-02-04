import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, change, icon, trend = 'neutral', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-slate-800 rounded-xl p-6 border border-slate-700',
          'hover:border-slate-600 transition-colors',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-100">{value}</p>
            
            {change && (
              <div className="mt-2 flex items-center gap-1">
                <span className={cn(
                  'text-sm font-medium',
                  change.isPositive ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {change.isPositive ? '+' : ''}{change.value}%
                </span>
                <span className="text-sm text-slate-500">from last month</span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className={cn(
              'p-3 rounded-lg',
              trend === 'up' && 'bg-emerald-500/10 text-emerald-400',
              trend === 'down' && 'bg-red-500/10 text-red-400',
              trend === 'neutral' && 'bg-indigo-500/10 text-indigo-400'
            )}>
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';