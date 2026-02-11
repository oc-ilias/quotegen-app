/**
 * Analytics Dashboard Component
 * Comprehensive analytics dashboard with all charts and date range selection
 * @module components/analytics/AnalyticsDashboard
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ChartSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import { RevenueChart } from './RevenueChart';
import { ConversionChart } from './ConversionChart';
import { StatusBreakdown } from './StatusBreakdown';
import { TopProducts } from './TopProducts';
import { FunnelChart } from './FunnelChart';
import { GeographicMap, generateMockRegionData } from './GeographicMap';
import { PerformanceMetrics } from './PerformanceMetrics';
import { DateRangeSelector, type DateRange } from './DateRangeSelector';
import { ExportMenu, type ExportFormat } from './ExportMenu';
import { ErrorBoundary } from '../ErrorBoundary';
import type { ConversionDataPoint, RevenueDataPoint, StatusBreakdownData, TopProductData } from '@/types/quote';
import {
  ArrowPathIcon,
  ChartPieIcon,
  GlobeAltIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  PresentationChartLineIcon,
  ShoppingBagIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

export interface AnalyticsDashboardProps {
  data?: {
    conversionData: ConversionDataPoint[];
    revenueData: RevenueDataPoint[];
    statusData: StatusBreakdownData[];
    topProducts: TopProductData[];
    funnelData?: {
      created: number;
      sent: number;
      viewed: number;
      accepted: number;
      declined: number;
      totalValue: number;
      acceptedValue: number;
    };
    geographicData?: typeof generateMockRegionData extends () => infer R ? R : never;
    performanceData?: {
      avgQuoteValue: number;
      avgResponseTime: number;
      conversionRate: number;
      winRate: number;
      customerLifetimeValue: number;
      quoteToOrderRatio: number;
      avgTimeToClose: number;
      repeatCustomerRate: number;
    };
    stats?: {
      totalQuotes: number;
      pendingQuotes: number;
      sentQuotes: number;
      acceptedQuotes: number;
      conversionRate: number;
      totalRevenue: number;
      avgQuoteValue: number;
      averageQuoteValue: number;
      avgResponseTime: number;
      quoteChange: number;
      revenueChange: number;
      conversionChange: number;
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
  onRefresh?: () => void;
  onDateRangeChange?: (range: DateRange) => void;
  className?: string;
}

export interface DashboardSectionProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
  actions?: React.ReactNode;
}

// ============================================================================
// Mock Data Generators
// ============================================================================

const generateMockRevenueData = (days: number): RevenueDataPoint[] => {
  const data: RevenueDataPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 50000) + 10000,
      quotes: Math.floor(Math.random() * 50) + 10,
      avgValue: Math.floor(Math.random() * 2000) + 500,
    });
  }
  return data;
};

const generateMockConversionData = (days: number): ConversionDataPoint[] => {
  const data: ConversionDataPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const sent = Math.floor(Math.random() * 100) + 50;
    const viewed = Math.floor(sent * (0.6 + Math.random() * 0.3));
    const accepted = Math.floor(viewed * (0.2 + Math.random() * 0.4));
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sent,
      viewed,
      accepted,
      conversionRate: parseFloat(((accepted / sent) * 100).toFixed(1)),
    });
  }
  return data;
};

const generateMockStatusData = (): StatusBreakdownData[] => [
  { status: 'draft' as const, count: 25, percentage: 12.5, value: 25000 },
  { status: 'pending' as const, count: 30, percentage: 15, value: 30000 },
  { status: 'sent' as const, count: 60, percentage: 30, value: 60000 },
  { status: 'viewed' as const, count: 35, percentage: 17.5, value: 35000 },
  { status: 'accepted' as const, count: 40, percentage: 20, value: 80000 },
  { status: 'rejected' as const, count: 10, percentage: 5, value: 10000 },
];

const generateMockTopProducts = (): TopProductData[] => [
  { productId: '1', title: 'Premium Widget Pro', quantity: 150, revenue: 45000 },
  { productId: '2', title: 'Enterprise Bundle', quantity: 89, revenue: 89000 },
  { productId: '3', title: 'Starter Kit Plus', quantity: 234, revenue: 23400 },
  { productId: '4', title: 'Professional Suite', quantity: 67, revenue: 67000 },
  { productId: '5', title: 'Basic Package', quantity: 456, revenue: 22800 },
];

// ============================================================================
// Dashboard Section Component
// ============================================================================

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
  isLoading,
  error,
  onRetry,
  className,
  actions,
}) => {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'bg-slate-900/50 border border-red-500/20 rounded-2xl p-6',
          className
        )}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <ExclamationCircleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">Failed to load data</h3>
          <p className="text-sm text-slate-500 mb-4 max-w-md">{error.message}</p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return <ChartSkeleton height={400} className={className} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-slate-900/50 border border-slate-800 rounded-2xl p-6', className)}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-indigo-400" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </motion.div>
  );
};

// ============================================================================
// Main Analytics Dashboard Component
// ============================================================================

export function AnalyticsDashboard({
  data,
  isLoading = false,
  error = null,
  onRefresh,
  onDateRangeChange,
  className,
}: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>({ start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date(), label: 'Last 30 days' });
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');
  const [isExporting, setIsExporting] = useState(false);

  // Use provided data or generate mock data
  const chartData = useMemo(() => {
    if (data) return data;
    return {
      conversionData: generateMockConversionData(30),
      revenueData: generateMockRevenueData(30),
      statusData: generateMockStatusData(),
      topProducts: generateMockTopProducts(),
      funnelData: {
        created: 200,
        sent: 180,
        viewed: 140,
        accepted: 80,
        declined: 20,
        totalValue: 500000,
        acceptedValue: 250000,
      },
      geographicData: generateMockRegionData(),
      performanceData: {
        avgQuoteValue: 5250,
        avgResponseTime: 45,
        conversionRate: 35.5,
        winRate: 42.3,
        customerLifetimeValue: 18500,
        quoteToOrderRatio: 38.2,
        avgTimeToClose: 12,
        repeatCustomerRate: 58.7,
      },
    };
  }, [data]);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
    onDateRangeChange?.(range);
  }, [onDateRangeChange]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (format === 'csv') {
        // Generate CSV
        const csvContent = [
          ['Metric', 'Value'],
          ['Total Revenue', `$${chartData.revenueData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}`],
          ['Total Quotes', chartData.revenueData.reduce((sum, d) => sum + d.quotes, 0).toString()],
          ['Conversion Rate', `${((chartData.funnelData?.accepted || 0) / (chartData.funnelData?.created || 1) * 100).toFixed(1)}%`],
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${dateRange.label.toLowerCase().replace(/\s+/g, '-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'png') {
        // Trigger PNG export on all charts
        window.dispatchEvent(new CustomEvent('export-charts-png'));
      }
    } finally {
      setIsExporting(false);
    }
  }, [chartData, dateRange]);

  const statsCards = useMemo(() => {
    if (!chartData.revenueData.length) return [];
    const totalRevenue = chartData.revenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalQuotes = chartData.revenueData.reduce((sum, d) => sum + d.quotes, 0);
    const avgQuoteValue = totalRevenue / totalQuotes;
    const conversionRate = chartData.funnelData 
      ? (chartData.funnelData.accepted / chartData.funnelData.created) * 100 
      : 0;

    return [
      { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: 12.5, icon: CurrencyDollarIcon },
      { label: 'Total Quotes', value: totalQuotes.toLocaleString(), change: 8.3, icon: PresentationChartLineIcon },
      { label: 'Avg Quote Value', value: `$${Math.round(avgQuoteValue).toLocaleString()}`, change: 4.2, icon: ChartPieIcon },
      { label: 'Conversion Rate', value: `${conversionRate.toFixed(1)}%`, change: -2.1, icon: FunnelIcon },
    ];
  }, [chartData]);

  if (isLoading) {
    return (
      <div className={cn('space-y-8', className)}>
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-800 rounded mb-2" />
          <div className="h-4 w-96 bg-slate-800 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} color={(['blue', 'green', 'yellow', 'purple'] as const)[i]} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSkeleton height={400} />
          <ChartSkeleton height={400} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('space-y-8', className)}>
        <div className="bg-slate-900/50 border border-red-500/20 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">Failed to load analytics</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">{error.message}</p>
          {onRefresh && (
            <Button onClick={onRefresh}>
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1">Track your quote performance and business metrics</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangeSelector value={dateRange} onChange={handleDateRangeChange} />
          <ExportMenu onExport={handleExport} isLoading={isExporting} />
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        {(['overview', 'detailed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{stat.value}</p>
                <div className={cn(
                  'flex items-center gap-1 text-sm mt-2',
                  stat.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                  <span className="text-slate-500">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ErrorBoundary>
                <DashboardSection
                  title="Revenue Trends"
                  description="Monthly revenue from accepted quotes"
                  icon={CurrencyDollarIcon}
                >
                  <RevenueChart
                    data={chartData.revenueData}
                    showTimeRangeSelector
                    allowExport
                  />
                </DashboardSection>

                <DashboardSection
                  title="Quote Conversion Rate"
                  description="Track quote lifecycle from sent to accepted"
                  icon={PresentationChartLineIcon}
                >
                  <ConversionChart
                    data={chartData.conversionData}
                    allowExport
                  />
                </DashboardSection>
              </ErrorBoundary>
            </div>

            {/* Secondary Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ErrorBoundary>
                <DashboardSection
                  title="Quote Status Breakdown"
                  description="Distribution of quotes by current status"
                  icon={ChartPieIcon}
                >
                  <StatusBreakdown
                    data={chartData.statusData}
                    allowExport
                  />
                </DashboardSection>

                <DashboardSection
                  title="Top Quoted Products"
                  description="Most frequently quoted products"
                  icon={ShoppingBagIcon}
                >
                  <TopProducts
                    data={chartData.topProducts}
                    allowExport
                  />
                </DashboardSection>
              </ErrorBoundary>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detailed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ErrorBoundary>
                  <DashboardSection
                    title="Conversion Funnel"
                    description="Sales pipeline visualization"
                    icon={FunnelIcon}
                  >
                    {chartData.funnelData && (
                      <FunnelChart data={chartData.funnelData} />
                    )}
                  </DashboardSection>
                </ErrorBoundary>
              </div>

              <div>
                <ErrorBoundary>
                  <DashboardSection
                    title="Geographic Distribution"
                    description="Quote and customer activity by region"
                    icon={GlobeAltIcon}
                  >
                    {chartData.geographicData && (
                      <GeographicMap data={chartData.geographicData} />
                    )}
                  </DashboardSection>
                </ErrorBoundary>
              </div>
            </div>

            {/* Performance Metrics */}
            <ErrorBoundary>
              {chartData.performanceData && (
                <PerformanceMetrics data={chartData.performanceData} />
              )}
            </ErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AnalyticsDashboard;
