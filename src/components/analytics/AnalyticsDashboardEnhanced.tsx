/**
 * Enhanced Analytics Dashboard
 * Comprehensive analytics with multiple chart types, date ranges, and comparisons
 * @module components/analytics/AnalyticsDashboardEnhanced
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import {
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  DownloadIcon,
  RefreshIcon,
  FilterIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UsersIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// Chart components
import { RevenueChart } from './RevenueChart';
import { ConversionChart } from './ConversionChart';
import { StatusBreakdown } from './StatusBreakdown';
import { TopProducts } from './TopProducts';
import { StatCardsGrid, useDashboardStats } from '@/components/dashboard/StatCards';

import type { 
  ConversionDataPoint, 
  RevenueDataPoint, 
  StatusBreakdownData, 
  TopProductData,
  QuoteStatus,
} from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface DateRange {
  label: string;
  value: string;
  days: number;
}

interface AnalyticsData {
  revenueData: RevenueDataPoint[];
  conversionData: ConversionDataPoint[];
  statusData: StatusBreakdownData[];
  topProducts: TopProductData[];
  stats: DashboardStats;
  comparisons?: {
    revenue: ComparisonData;
    quotes: ComparisonData;
    conversion: ComparisonData;
  };
}

interface DashboardStats {
  totalQuotes: number;
  pendingQuotes: number;
  sentQuotes: number;
  acceptedQuotes: number;
  totalRevenue: number;
  conversionRate: number;
  averageQuoteValue: number;
  quoteChange: number;
  revenueChange: number;
  conversionChange: number;
  newCustomers: number;
  avgResponseTime: number;
}

interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

interface AnalyticsDashboardEnhancedProps {
  data: AnalyticsData;
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'pdf') => void;
  onDateRangeChange?: (range: DateRange) => void;
  className?: string;
}

// ============================================================================
// Date Range Options
// ============================================================================

const DATE_RANGES: DateRange[] = [
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 90 days', value: '90d', days: 90 },
  { label: 'Last 6 months', value: '6m', days: 180 },
  { label: 'Last year', value: '1y', days: 365 },
  { label: 'Custom', value: 'custom', days: 0 },
];

// ============================================================================
// Trend Indicator Component
// ============================================================================

interface TrendIndicatorProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  inverse?: boolean;
}

const TrendIndicator = ({ value, label, size = 'md', inverse = false }: TrendIndicatorProps) => {
  const isPositive = inverse ? value < 0 : value > 0;
  const isNeutral = value === 0;
  
  const Icon = isNeutral ? MinusIcon : isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  
  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-1',
    lg: 'text-base gap-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn(
      'flex items-center font-medium',
      sizeClasses[size],
      isNeutral && 'text-slate-500',
      !isNeutral && isPositive && 'text-emerald-400',
      !isNeutral && !isPositive && 'text-red-400'
    )}>
      <Icon className={iconSizes[size]} />
      <span>{isPositive ? '+' : ''}{value.toFixed(1)}%</span>
      {label && <span className="text-slate-500 ml-1">{label}</span>}
    </div>
  );
};

// ============================================================================
// Comparison Card Component
// ============================================================================

interface ComparisonCardProps {
  title: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  format?: 'number' | 'currency' | 'percent';
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'amber';
}

const ComparisonCard = ({
  title,
  current,
  previous,
  change,
  changePercent,
  format = 'number',
  icon: Icon,
  color,
}: ComparisonCardProps) => {
  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl p-6 border',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-950/30 rounded-lg">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-slate-300">{title}</span>
        </div>
        <TrendIndicator value={changePercent} size="sm" />
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold text-white">{formatValue(current)}</div>
        <div className="mt-1 text-sm text-slate-500">
          vs {formatValue(previous)} last period
        </div>
      </div>

      {/* Mini sparkline placeholder */}
      <div className="mt-4 h-8 flex items-end gap-1">
        {Array.from({ length: 12 }).map((_, i) => {
          const height = Math.random() * 100;
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.05 }}
              className="flex-1 bg-current opacity-20 rounded-t"
            />
          );
        })}
      </div>
    </motion.div>
  );
};

// ============================================================================
// Date Range Selector
// ============================================================================

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const DateRangeSelector = ({ value, onChange }: DateRangeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-slate-900 border border-slate-800 text-slate-300',
          'hover:border-slate-700 transition-colors'
        )}
      >
        <CalendarIcon className="w-4 h-4" />
        <span>{value.label}</span>
        <ChevronDownIcon className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

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
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {DATE_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => {
                    onChange(range);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm transition-colors',
                    value.value === range.value
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  )}
                >
                  {range.label}
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
// Export Menu
// ============================================================================

interface ExportMenuProps {
  onExport: (format: 'csv' | 'pdf') => void;
}

const ExportMenu = ({ onExport }: ExportMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-slate-900 border border-slate-800 text-slate-300',
          'hover:border-slate-700 transition-colors'
        )}
      >
        <DownloadIcon className="w-4 h-4" />
        <span>Export</span>
      </button>

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
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <button
                onClick={() => {
                  onExport('csv');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                Export as CSV
              </button>
              <button
                onClick={() => {
                  onExport('pdf');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                Export as PDF
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Loading Skeleton
// ============================================================================

const AnalyticsSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-8 w-48 bg-slate-800 rounded" />
      <div className="flex gap-3">
        <div className="h-10 w-32 bg-slate-800 rounded-lg" />
        <div className="h-10 w-24 bg-slate-800 rounded-lg" />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 bg-slate-900/50 border border-slate-800 rounded-2xl" />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-[400px] bg-slate-900/50 border border-slate-800 rounded-2xl" />
      <div className="h-[400px] bg-slate-900/50 border border-slate-800 rounded-2xl" />
    </div>
  </div>
);

// ============================================================================
// Error State
// ============================================================================

const ErrorState = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-20"
  >
    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
      <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="text-lg font-semibold text-slate-200 mb-2">Failed to load analytics</h3>
    <p className="text-slate-400 text-center max-w-md mb-6">{error.message}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
    >
      <RefreshIcon className="w-4 h-4" />
      Try Again
    </button>
  </motion.div>
);

// ============================================================================
// Main Dashboard Component
// ============================================================================

export function AnalyticsDashboardEnhanced({
  data,
  isLoading = false,
  error = null,
  onRefresh,
  onExport,
  onDateRangeChange,
  className,
}: AnalyticsDashboardEnhancedProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>(DATE_RANGES[1]);
  const { showToast } = useToast();

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setSelectedRange(range);
    onDateRangeChange?.(range);
  }, [onDateRangeChange]);

  const handleExport = useCallback((format: 'csv' | 'pdf') => {
    onExport?.(format);
    showToast({
      title: 'Export Started',
      description: `Your ${format.toUpperCase()} export is being prepared.`,
      variant: 'success',
    });
  }, [onExport, showToast]);

  const stats = useDashboardStats(data?.stats);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => onRefresh?.()} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn('space-y-8', className)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
          <p className="text-slate-400 mt-1">Track your quote performance and business metrics</p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangeSelector 
            value={selectedRange} 
            onChange={handleDateRangeChange}
          />
          
          <ExportMenu onExport={handleExport} />
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <section>
        <StatCardsGrid stats={stats} isLoading={isLoading} />
      </section>

      {/* Comparison Cards */}
      {data.comparisons && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ComparisonCard
            title="Revenue"
            current={data.comparisons.revenue.current}
            previous={data.comparisons.revenue.previous}
            change={data.comparisons.revenue.change}
            changePercent={data.comparisons.revenue.changePercent}
            format="currency"
            icon={CurrencyDollarIcon}
            color="green"
          />
          <ComparisonCard
            title="Quotes Created"
            current={data.comparisons.quotes.current}
            previous={data.comparisons.quotes.previous}
            change={data.comparisons.quotes.change}
            changePercent={data.comparisons.quotes.changePercent}
            format="number"
            icon={DocumentTextIcon}
            color="blue"
          />
          <ComparisonCard
            title="Conversion Rate"
            current={data.comparisons.conversion.current}
            previous={data.comparisons.conversion.previous}
            change={data.comparisons.conversion.change}
            changePercent={data.comparisons.conversion.changePercent}
            format="percent"
            icon={CheckCircleIcon}
            color="purple"
          />
        </section>
      )}

      {/* Main Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueChart 
          data={data.revenueData} 
          isLoading={isLoading}
          showComparison={true}
        />
        <ConversionChart 
          data={data.conversionData} 
          isLoading={isLoading}
          showTrend={true}
        />
      </section>

      {/* Secondary Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatusBreakdown 
          data={data.statusData} 
          isLoading={isLoading}
          showLegend={true}
        />
        <TopProducts 
          data={data.topProducts} 
          isLoading={isLoading}
          showGrowth={true}
        />
      </section>

      {/* Footer Info */}
      <footer className="text-center text-sm text-slate-500 pt-8 border-t border-slate-800">
        <p>
          Data updated {new Date().toLocaleString()} • 
          <button 
            onClick={() => onRefresh?.()} 
            className="text-indigo-400 hover:text-indigo-300 ml-1"
          >
            Refresh now
          </button>
        </p>
      </footer>
    </motion.div>
  );
}

export default AnalyticsDashboardEnhanced;
