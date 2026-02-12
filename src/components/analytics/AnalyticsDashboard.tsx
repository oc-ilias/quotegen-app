/**
 * Enhanced Analytics Dashboard Component
 * Comprehensive analytics with charts, error handling, and loading states
 * @module components/analytics/AnalyticsDashboard
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RevenueChart } from './RevenueChart';
import { ConversionChart } from './ConversionChart';
import { StatusBreakdown } from './StatusBreakdown';
import { TopProducts } from './TopProducts';
import { StatCardsGrid, useDashboardStats } from '@/components/dashboard/StatCards';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import type {
  ConversionDataPoint,
  RevenueDataPoint,
  StatusBreakdownData,
  TopProductData,
} from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'custom';

export interface AnalyticsDashboardProps {
  data: {
    conversionData: ConversionDataPoint[];
    revenueData: RevenueDataPoint[];
    statusData: StatusBreakdownData[];
    topProducts: TopProductData[];
    stats?: {
      totalQuotes: number;
      pendingQuotes: number;
      acceptedQuotes: number;
      conversionRate: number;
      totalRevenue: number;
      avgQuoteValue: number;
      avgResponseTime: number;
      periodChange: {
        totalQuotes: number;
        conversionRate: number;
        totalRevenue: number;
        avgQuoteValue: number;
      };
    };
  };
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
  /** Callback when date range changes */
  onDateRangeChange?: (range: DateRange) => void;
  /** Callback to refresh data */
  onRefresh?: () => Promise<void>;
  /** Callback when export is requested */
  onExport?: (format: 'csv' | 'pdf') => void;
}

// ============================================================================
// Date Range Selector Component
// ============================================================================

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  disabled?: boolean;
}

const dateRangeOptions: { value: DateRange; label: string; shortcut?: string }[] = [
  { value: '7d', label: 'Last 7 days', shortcut: '7D' },
  { value: '30d', label: 'Last 30 days', shortcut: '30D' },
  { value: '90d', label: 'Last 90 days', shortcut: '90D' },
  { value: '1y', label: 'Last year', shortcut: '1Y' },
  { value: 'custom', label: 'Custom range' },
];

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = dateRangeOptions.find(o => o.value === value)?.label || 'Select range';

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
          'border bg-slate-900/50',
          disabled
            ? 'border-slate-800 text-slate-600 cursor-not-allowed'
            : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
        )}
      >
        <CalendarIcon className="w-4 h-4" />
        {selectedLabel}
        <ChevronDownIcon className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors',
                    value === option.value
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'text-slate-300 hover:bg-slate-800'
                  )}
                >
                  {option.label}
                  {option.shortcut && (
                    <kbd className="px-1.5 py-0.5 text-xs bg-slate-800 text-slate-500 rounded">
                      {option.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Error State Component
// ============================================================================

const AnalyticsError: React.FC<{
  error: Error;
  onRetry?: () => void;
}> = ({ error, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
      <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="text-lg font-semibold text-slate-200 mb-2">Failed to load analytics</h3>
    <p className="text-slate-400 mb-6 max-w-sm">{error.message || 'An error occurred while loading your analytics data'}</p>
    {onRetry && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
      >
        <ArrowPathIcon className="w-4 h-4" />
        Try Again
      </motion.button>
    )}
  </motion.div>
);

// ============================================================================
// Loading Skeleton
// ============================================================================

const AnalyticsSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div>
        <div className="h-8 w-48 bg-slate-800 rounded mb-2" />
        <div className="h-4 w-64 bg-slate-800 rounded" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-32 bg-slate-800 rounded-xl" />
        <div className="h-10 w-24 bg-slate-800 rounded-xl" />
      </div>
    </div>

    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 bg-slate-900/50 border border-slate-800 rounded-2xl" />
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-[400px] bg-slate-900/50 border border-slate-800 rounded-2xl" />
      <div className="h-[400px] bg-slate-900/50 border border-slate-800 rounded-2xl" />
    </div>

    {/* Secondary Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-[300px] bg-slate-900/50 border border-slate-800 rounded-2xl" />
      <div className="h-[300px] bg-slate-900/50 border border-slate-800 rounded-2xl" />
    </div>
  </div>
);

// ============================================================================
// Main Analytics Dashboard Component
// ============================================================================

export function AnalyticsDashboard({
  data,
  isLoading = false,
  error = null,
  className,
  onDateRangeChange,
  onRefresh,
  onExport,
}: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | null>(null);

  // Transform stats to match DashboardStatsData format
  const transformedStats = useMemo(() => {
    if (!data.stats) return undefined;
    return {
      totalQuotes: data.stats.totalQuotes,
      pendingQuotes: data.stats.pendingQuotes,
      sentQuotes: 0, // Not in current data structure
      acceptedQuotes: data.stats.acceptedQuotes,
      totalRevenue: data.stats.totalRevenue,
      conversionRate: data.stats.conversionRate,
      averageQuoteValue: data.stats.avgQuoteValue,
      quoteChange: data.stats.periodChange?.totalQuotes || 0,
      revenueChange: data.stats.periodChange?.totalRevenue || 0,
      conversionChange: data.stats.periodChange?.conversionRate || 0,
    };
  }, [data.stats]);

  const stats = useDashboardStats(transformedStats);

  // Handle date range change
  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
    onDateRangeChange?.(range);
  }, [onDateRangeChange]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  // Handle export
  const handleExport = useCallback((format: 'csv' | 'pdf') => {
    setExportFormat(format);
    onExport?.(format);
    // Reset after a delay
    setTimeout(() => setExportFormat(null), 2000);
  }, [onExport]);

  // Check if data is empty
  const isEmpty = useMemo(() => {
    return (
      !isLoading &&
      !error &&
      data.revenueData.length === 0 &&
      data.conversionData.length === 0 &&
      data.statusData.length === 0
    );
  }, [data, isLoading, error]);

  // Error state
  if (error && !isLoading) {
    return (
      <div className={cn('space-y-8', className)}>
        <AnalyticsError error={error} onRetry={handleRefresh} />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-8', className)}>
        <AnalyticsSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn('space-y-8', className)}
    >
      {/* Header with Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
          <p className="text-slate-400 mt-1">Track your quote performance and business metrics</p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangeSelector
            value={dateRange}
            onChange={handleDateRangeChange}
            disabled={isLoading}
          />

          {onRefresh && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                'p-2.5 rounded-xl border transition-colors',
                'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300',
                isRefreshing && 'animate-spin'
              )}
              title="Refresh data"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </motion.button>
          )}

          {onExport && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExport('csv')}
                disabled={exportFormat !== null}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  'border bg-slate-900/50',
                  exportFormat
                    ? 'border-emerald-500/50 text-emerald-400'
                    : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                )}
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                {exportFormat ? 'Exported!' : 'Export'}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Empty State */}
      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">No data available</h3>
          <p className="text-slate-400 max-w-sm">There is no analytics data for the selected period. Try changing the date range or create some quotes first.</p>
        </motion.div>
      ) : (
        <>
          {/* Stats Grid */}
          <StatCardsGrid stats={stats} isLoading={isLoading} />

          {/* Main Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <RevenueChart 
            data={data.revenueData.map(d => ({ ...d, month: d.date }))} 
            isLoading={isLoading} 
          />
            <ConversionChart data={data.conversionData} isLoading={isLoading} />
          </motion.div>

          {/* Secondary Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <StatusBreakdown data={data.statusData} isLoading={isLoading} />
            <TopProducts data={data.topProducts} isLoading={isLoading} />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default AnalyticsDashboard;
