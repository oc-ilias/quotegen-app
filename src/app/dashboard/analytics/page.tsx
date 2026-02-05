/**
 * Analytics Page
 * Comprehensive analytics and reporting dashboard
 * @module app/dashboard/analytics/page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { ConversionChart } from '@/components/analytics/ConversionChart';
import { StatusBreakdown } from '@/components/analytics/StatusBreakdown';
import { TopProducts } from '@/components/analytics/TopProducts';
import { StatCardsGrid, useDashboardStats } from '@/components/dashboard/StatCards';
import { QuoteStatus } from '@/types/quote';

// Mock data
const mockRevenueData = [
  { month: 'Jan', revenue: 12500, quotes: 12, avgValue: 1042 },
  { month: 'Feb', revenue: 18200, quotes: 18, avgValue: 1011 },
  { month: 'Mar', revenue: 15600, quotes: 15, avgValue: 1040 },
  { month: 'Apr', revenue: 22400, quotes: 22, avgValue: 1018 },
  { month: 'May', revenue: 19800, quotes: 19, avgValue: 1042 },
  { month: 'Jun', revenue: 28600, quotes: 28, avgValue: 1021 },
];

const mockConversionData = [
  { date: 'Jan', sent: 45, viewed: 38, accepted: 12, conversionRate: 26.7 },
  { date: 'Feb', sent: 52, viewed: 44, accepted: 18, conversionRate: 34.6 },
  { date: 'Mar', sent: 48, viewed: 41, accepted: 15, conversionRate: 31.3 },
  { date: 'Apr', sent: 55, viewed: 48, accepted: 22, conversionRate: 40.0 },
  { date: 'May', sent: 60, viewed: 52, accepted: 25, conversionRate: 41.7 },
  { date: 'Jun', sent: 58, viewed: 50, accepted: 28, conversionRate: 48.3 },
];

const mockStatusData = [
  { status: QuoteStatus.ACCEPTED, count: 88, percentage: 56.4, value: 485000 },
  { status: QuoteStatus.SENT, count: 35, percentage: 22.4, value: 125000 },
  { status: QuoteStatus.PENDING, count: 20, percentage: 12.8, value: 68000 },
  { status: QuoteStatus.VIEWED, count: 10, percentage: 6.4, value: 32000 },
  { status: QuoteStatus.DECLINED, count: 3, percentage: 1.9, value: 8500 },
];

const mockTopProducts = [
  { productId: '1', title: 'Industrial Widget 5000', quantity: 145, revenue: 145000 },
  { productId: '2', title: 'Premium Software License', quantity: 89, revenue: 89000 },
  { productId: '3', title: 'Construction Material Bundle', quantity: 67, revenue: 67000 },
  { productId: '4', title: 'Design Consultation Package', quantity: 52, revenue: 52000 },
  { productId: '5', title: 'Custom Manufacturing Service', quantity: 45, revenue: 45000 },
];

const mockStats = {
  totalQuotes: 156,
  pendingQuotes: 23,
  sentQuotes: 45,
  acceptedQuotes: 88,
  totalRevenue: 485000,
  conversionRate: 56.4,
  averageQuoteValue: 3100,
  quoteChange: 12.5,
  revenueChange: 18.2,
  conversionChange: 3.1,
};

type DateRange = '7d' | '30d' | '90d' | '1y';

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = useDashboardStats(mockStats);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = () => {
    // In production, this would generate and download a CSV/PDF report
    alert('Export functionality would download a report here');
  };

  const dateRangeLabels: Record<DateRange, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '1y': 'Last Year',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
          <p className="text-slate-400 mt-1">Track your quote performance and business metrics</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="appearance-none pl-10 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {(Object.keys(dateRangeLabels) as DateRange[]).map((range) => (
                <option key={range} value={range}>{dateRangeLabels[range]}</option>
              ))}
            </select>
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <section>
        <StatCardsGrid stats={stats} isLoading={isLoading} />
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RevenueChart data={mockRevenueData} isLoading={isLoading} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ConversionChart data={mockConversionData} isLoading={isLoading} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatusBreakdown data={mockStatusData} isLoading={isLoading} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TopProducts data={mockTopProducts} isLoading={isLoading} />
        </motion.section>
      </div>
    </div>
  );
}
