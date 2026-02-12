/**
 * Analytics Page
 * Comprehensive analytics and reporting dashboard
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { ChartSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';

// Mock analytics data
const mockRevenueData = [
  { date: '2026-01', revenue: 45000, quotes: 12, avgValue: 3750 },
  { date: '2026-02', revenue: 52000, quotes: 15, avgValue: 3467 },
  { date: '2025-12', revenue: 38000, quotes: 10, avgValue: 3800 },
  { date: '2025-11', revenue: 42000, quotes: 11, avgValue: 3818 },
  { date: '2025-10', revenue: 35000, quotes: 9, avgValue: 3889 },
  { date: '2025-09', revenue: 48000, quotes: 13, avgValue: 3692 },
];

const mockConversionData = [
  { date: '2026-01', sent: 20, viewed: 15, accepted: 10, rejected: 3, conversionRate: 50 },
  { date: '2026-02', sent: 25, viewed: 20, accepted: 15, rejected: 4, conversionRate: 60 },
];

import { QuoteStatus } from '@/types/quote';

const mockStatusData = [
  { status: QuoteStatus.DRAFT, count: 5, percentage: 8, value: 25000 },
  { status: QuoteStatus.SENT, count: 12, percentage: 20, value: 60000 },
  { status: QuoteStatus.VIEWED, count: 8, percentage: 13, value: 40000 },
  { status: QuoteStatus.ACCEPTED, count: 30, percentage: 49, value: 150000 },
  { status: QuoteStatus.REJECTED, count: 6, percentage: 10, value: 30000 },
];

const mockTopProducts = [
  { productId: 'prod_1', title: 'Industrial Widget Pro', quantity: 45, revenue: 112500 },
  { productId: 'prod_2', title: 'Premium Service Package', quantity: 32, revenue: 96000 },
  { productId: 'prod_3', title: 'Consulting Hours', quantity: 120, revenue: 60000 },
  { productId: 'prod_4', title: 'Maintenance Contract', quantity: 18, revenue: 54000 },
  { productId: 'prod_5', title: 'Training Sessions', quantity: 25, revenue: 37500 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = () => {
    console.log('Exporting analytics...');
  };

  const dateRangeOptions: { value: typeof dateRange; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  return (
    <DashboardLayout activeNavItem="analytics">
      <PageHeader
        title="Analytics"
        subtitle="Track your quote performance and business metrics."
        actions={
          <>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button variant="secondary" onClick={handleExport}>
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </Button>
          </>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          <>
            <StatCardSkeleton color="blue" />
            <StatCardSkeleton color="green" />
            <StatCardSkeleton color="purple" />
            <StatCardSkeleton color="indigo" />
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <StatCard
                title="Total Revenue"
                value={124500}
                change={{ value: 15.3, isPositive: true }}
                icon="💰"
                trend="up"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <StatCard
                title="Conversion Rate"
                value="57.1%"
                change={{ value: 3.2, isPositive: true }}
                icon="📈"
                trend="up"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <StatCard
                title="Quotes Sent"
                value={156}
                change={{ value: 12, isPositive: true }}
                icon="📄"
                trend="up"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <StatCard
                title="Avg Quote Value"
                value="$1,596"
                change={{ value: 2.1, isPositive: false }}
                icon="💵"
                trend="down"
              />
            </motion.div>
          </>
        )}
      </div>

      {/* Main Analytics Dashboard */}
      {isLoading ? (
        <div className="space-y-6">
          <ChartSkeleton height={400} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton height={300} />
            <ChartSkeleton height={300} />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnalyticsDashboard
            data={{
              revenueData: mockRevenueData,
              conversionData: mockConversionData,
              statusData: mockStatusData,
              topProducts: mockTopProducts,
            }}
          />
        </motion.div>
      )}

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-200">Response Time</h3>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-indigo-400 mb-2">48h</p>
              <p className="text-slate-500">Average time to first response</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{'< 24h'}</span>
                <span className="text-slate-200">45%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">24-48h</span>
                <span className="text-slate-200">35%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '35%' }} />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{'> 48h'}</span>
                <span className="text-slate-200">20%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-slate-600 h-2 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-200">Quote Lifecycle</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Draft to Sent', avg: '2.3 days', trend: 'down' },
                { label: 'Sent to Viewed', avg: '1.8 days', trend: 'up' },
                { label: 'Viewed to Accepted', avg: '3.5 days', trend: 'down' },
                { label: 'Total Cycle', avg: '7.6 days', trend: 'down' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <span className="text-slate-400">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">{item.avg}</span>
                    <span
                      className={`text-xs ${
                        item.trend === 'down' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {item.trend === 'down' ? '↓' : '↑'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-200">Top Customers</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Acme Corporation', quotes: 12, value: 125000 },
                { name: 'Globex Industries', quotes: 8, value: 89000 },
                { name: 'Initech LLC', quotes: 6, value: 67000 },
                { name: 'Massive Dynamic', quotes: 5, value: 54000 },
              ].map((customer, index) => (
                <div key={customer.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-200">{customer.name}</p>
                    <p className="text-sm text-slate-500">{customer.quotes} quotes</p>
                  </div>
                  <p className="font-medium text-slate-200">
                    ${(customer.value / 1000).toFixed(0)}k
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
