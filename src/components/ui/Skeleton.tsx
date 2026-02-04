/**
 * Loading Skeleton Components
 * Comprehensive loading states for all UI components
 * @module components/ui/Skeleton
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Base Skeleton Component
// ============================================================================

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  style,
  ...props
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const styles: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  return (
    <div
      className={cn(
        'bg-slate-800',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={styles}
      {...props}
    />
  );
};

// ============================================================================
// Card Skeleton
// ============================================================================

interface CardSkeletonProps {
  header?: boolean;
  contentLines?: number;
  actions?: boolean;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  header = true,
  contentLines = 3,
  actions = false,
  className,
}) => {
  return (
    <div className={cn('bg-slate-900/50 border border-slate-800 rounded-2xl p-6', className)}>
      {header && (
        <div className="flex items-center justify-between mb-4">
          <Skeleton width={120} height={24} className="rounded-lg" />
          <Skeleton width={80} height={32} className="rounded-lg" />
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton
            key={i}
            width={i === contentLines - 1 ? '60%' : '100%'}
            height={16}
            className="rounded"
          />
        ))}
      </div>

      {actions && (
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800">
          <Skeleton width={100} height={36} className="rounded-lg" />
          <Skeleton width={100} height={36} className="rounded-lg" />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Stat Card Skeleton
// ============================================================================

interface StatCardSkeletonProps {
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  className?: string;
}

export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({
  color = 'blue',
  className,
}) => {
  const colorClasses = {
    blue: 'border-blue-500/20',
    green: 'border-emerald-500/20',
    yellow: 'border-amber-500/20',
    red: 'border-red-500/20',
    purple: 'border-purple-500/20',
    indigo: 'border-indigo-500/20',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-slate-900/50 border',
        colorClasses[color],
        className
      )}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-slate-800/30 to-transparent" />
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton width={100} height={16} />
          <Skeleton width={140} height={32} />
          <Skeleton width={80} height={16} />
        </div>
        <Skeleton width={48} height={48} variant="rounded" />
      </div>
    </div>
  );
};

// ============================================================================
// Table Skeleton
// ============================================================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn('bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-800 bg-slate-900/80">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`header-${i}`}
            width={i === 0 ? '40%' : '15%'}
            height={16}
            className="flex-1"
          />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-800">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-6 py-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                width={colIndex === 0 ? '40%' : '15%'}
                height={16}
                className="flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Quote List Skeleton
// ============================================================================

export const QuoteListSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/30">
          <Skeleton width={40} height={40} variant="rounded" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton width={60} height={16} />
              <Skeleton width={80} height={16} />
            </div>
            <Skeleton width={200} height={20} />
            <Skeleton width={120} height={16} />
          </div>
          <div className="text-right space-y-2">
            <Skeleton width={80} height={20} className="ml-auto" />
            <Skeleton width={60} height={16} className="ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Wizard Step Skeleton
// ============================================================================

export const WizardStepSkeleton: React.FC = () => {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Skeleton width={250} height={32} className="mb-2" />
        <Skeleton width={400} height={20} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Skeleton width={120} height={16} className="mb-2" />
          <Skeleton height={48} variant="rounded" />
        </div>

        <div>
          <Skeleton width={120} height={16} className="mb-2" />
          <Skeleton height={48} variant="rounded" />
        </div>

        <div>
          <Skeleton width={120} height={16} className="mb-2" />
          <Skeleton height={48} variant="rounded" />
        </div>

        <div className="md:col-span-2">
          <Skeleton width={120} height={16} className="mb-2" />
          <Skeleton height={48} variant="rounded" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <Skeleton width={100} height={40} variant="rounded" />
        <Skeleton width={120} height={40} variant="rounded" />
      </div>
    </div>
  );
};

// ============================================================================
// Chart Skeleton
// ============================================================================

interface ChartSkeletonProps {
  height?: number;
  className?: string;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  height = 300,
  className,
}) => {
  return (
    <div className={cn('bg-slate-900/50 border border-slate-800 rounded-2xl p-6', className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton width={180} height={24} className="mb-2" />
          <Skeleton width={250} height={16} />
        </div>
        <Skeleton width={80} height={32} />
      </div>

      <Skeleton height={height} variant="rounded" />
    </div>
  );
};

// ============================================================================
// Activity Feed Skeleton
// ============================================================================

export const ActivityFeedSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton width={40} height={40} variant="rounded" />
          <div className="flex-1 space-y-2 pt-2">
            <Skeleton width={250} height={16} />
            <Skeleton width={100} height={12} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Dashboard Skeleton
// ============================================================================

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton
            key={i}
            color={(['blue', 'green', 'yellow', 'purple'] as const)[i]}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CardSkeleton header={true} contentLines={5} />
        </div>
        <div>
          <CardSkeleton header={true} contentLines={4} />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
