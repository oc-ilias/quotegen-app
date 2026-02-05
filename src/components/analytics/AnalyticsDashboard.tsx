/**
 * Analytics Dashboard Component
 * Comprehensive analytics dashboard with all charts
 * @module components/analytics/AnalyticsDashboard
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RevenueChart } from './RevenueChart';
import { ConversionChart } from './ConversionChart';
import { StatusBreakdown } from './StatusBreakdown';
import { TopProducts } from './TopProducts';
import { StatCardsGrid, useDashboardStats } from '@/components/dashboard/StatCards';
import type { ConversionDataPoint, RevenueDataPoint, StatusBreakdownData, TopProductData } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface AnalyticsDashboardProps {
  data: {
    conversionData: ConversionDataPoint[];
    revenueData: RevenueDataPoint[];
    statusData: StatusBreakdownData[];
    topProducts: TopProductData[];
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
  className?: string;
}

// ============================================================================
// Analytics Dashboard Component
// ============================================================================

export function AnalyticsDashboard({ data, isLoading = false, className }: AnalyticsDashboardProps) {
  // Transform stats to match DashboardStatsData interface
  const statsData = data.stats ? {
    totalQuotes: data.stats.totalQuotes,
    pendingQuotes: data.stats.pendingQuotes,
    sentQuotes: data.stats.sentQuotes,
    acceptedQuotes: data.stats.acceptedQuotes,
    totalRevenue: data.stats.totalRevenue,
    conversionRate: data.stats.conversionRate,
    averageQuoteValue: data.stats.averageQuoteValue || data.stats.avgQuoteValue,
    quoteChange: data.stats.quoteChange,
    revenueChange: data.stats.revenueChange,
    conversionChange: data.stats.conversionChange,
  } : undefined;

  const stats = useDashboardStats(statsData);

  if (isLoading) {
    return (
      <div className={cn('space-y-8', className)}>
        {/* Loading Header */}
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-800 rounded mb-2" />
          <div className="h-4 w-96 bg-slate-800 rounded" />
        </div>

        {/* Loading Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>

        {/* Loading Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[400px] bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
          <div className="h-[400px] bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
        </div>
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
        <p className="text-slate-400 mt-1">Track your quote performance and business metrics</p>
      </div>

      {/* Stats Grid */}
      <StatCardsGrid stats={stats} isLoading={isLoading} />

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueChart data={data.revenueData} isLoading={isLoading} />
        <ConversionChart data={data.conversionData} isLoading={isLoading} />
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatusBreakdown data={data.statusData} isLoading={isLoading} />
        <TopProducts data={data.topProducts} isLoading={isLoading} />
      </div>
    </motion.div>
  );
}

export default AnalyticsDashboard;
