/**
 * Revenue Chart Component
 * Bar chart showing revenue by month with enhanced tooltips and loading states
 * @module components/analytics/RevenueChart
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';
import { ChartTooltip, formatCurrency, formatNumber } from './ChartTooltip';
import { EmptyState } from './EmptyState';
import { CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import type { RevenueDataPoint } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export interface RevenueChartProps {
  /** Revenue data points */
  data: RevenueDataPoint[];
  /** Loading state */
  isLoading?: boolean;
  /** Optional className */
  className?: string;
  /** Title override */
  title?: string;
  /** Show average line */
  showAverage?: boolean;
}

// ============================================================================
// Loading Skeleton
// ============================================================================

const ChartSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    {/* Header Skeleton */}
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-6 w-36 bg-slate-800 rounded" />
        <div className="h-4 w-48 bg-slate-800 rounded" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-8 w-28 bg-slate-800 rounded ml-auto" />
        <div className="h-4 w-20 bg-slate-800 rounded ml-auto" />
      </div>
    </div>

    {/* Chart Skeleton */}
    <div className="h-[300px] bg-slate-800/50 rounded-xl mt-4" />

    {/* Legend Skeleton */}
    <div className="flex items-center justify-center gap-6 mt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-800" />
          <div className="h-4 w-16 bg-slate-800 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// Custom Tooltip
// ============================================================================

const RevenueTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    dataKey: string;
    payload: Record<string, unknown>;
  }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <ChartTooltip
      active={active}
      payload={payload}
      label={label}
      title={label}
      formatter={(value, name, dataKey) => {
        if (dataKey === 'revenue' || dataKey === 'avgValue') {
          return formatCurrency(value);
        }
        return formatNumber(value);
      }}
      additionalItems={[
        {
          label: 'Avg per Quote',
          value: formatCurrency((data as any).avgValue),
          color: '#f59e0b',
        },
      ]}
    />
  );
};

// ============================================================================
// Main Component
// ============================================================================

export function RevenueChart({
  data,
  isLoading = false,
  className,
  title = 'Revenue by Month',
  showAverage = true,
}: RevenueChartProps) {
  // Calculate metrics
  const metrics = useMemo(() => {
    if (data.length === 0) {
      return {
        totalRevenue: 0,
        totalQuotes: 0,
        averageRevenue: 0,
        bestMonth: null as string | null,
        growth: 0,
      };
    }

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalQuotes = data.reduce((sum, item) => sum + item.quotes, 0);
    const averageRevenue = totalRevenue / data.length;

    const bestMonth = data.reduce((best, item) =>
      item.revenue > best.revenue ? item : best
    );

    // Calculate growth (last month vs first month)
    const firstRevenue = data[0]?.revenue || 0;
    const lastRevenue = data[data.length - 1]?.revenue || 0;
    const growth = firstRevenue > 0 ? ((lastRevenue - firstRevenue) / firstRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalQuotes,
      averageRevenue,
      bestMonth: bestMonth?.date || null,
      growth,
    };
  }, [data]);

  // Empty state
  if (!isLoading && data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'bg-slate-900/50 border border-slate-800 rounded-2xl p-6',
          className
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">Total revenue from accepted quotes</p>
          </div>
        </div>
        <EmptyState
          icon={ChartBarIcon}
          title="No revenue data available"
          description="Start creating and accepting quotes to see your revenue trends."
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'bg-slate-900/50 border border-slate-800 rounded-2xl p-6',
        className
      )}
    >
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
              <p className="text-sm text-slate-500 mt-1">
                Total revenue from accepted quotes
              </p>
            </div>

            <div className="text-right">
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-2xl font-bold text-indigo-400 tabular-nums"
              >
                {formatCurrency(metrics.totalRevenue)}
              </motion.p>
              <p className="text-sm text-slate-500">{metrics.totalQuotes} quotes</p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="revenueGradientHover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.3} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(value: string) => {
                    // Handle both full dates and month abbreviations
                    if (value.includes(' ')) {
                      return value.split(' ')[0]; // Return month abbreviation
                    }
                    return value;
                  }}
                />

                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `$${value / 1000}k`}
                />

                <Tooltip content={<RevenueTooltip />} />

                {showAverage && metrics.averageRevenue > 0 && (
                  <ReferenceLine
                    y={metrics.averageRevenue}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Avg',
                      position: 'right',
                      fill: '#f59e0b',
                      fontSize: 11,
                    }}
                  />
                )}

                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="url(#revenueGradient)"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1000}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === data.length - 1
                          ? '#6366f1'
                          : entry.revenue >= metrics.averageRevenue
                            ? 'url(#revenueGradient)'
                            : 'url(#revenueGradient)'
                      }
                      stroke={index === data.length - 1 ? '#818cf8' : 'transparent'}
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-3 gap-4"
          >
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Average</p>
              <p className="text-lg font-semibold text-slate-200 mt-1">
                {formatCurrency(metrics.averageRevenue)}
              </p>
            </div>
            <div className="text-center border-x border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Best Month</p>
              <p className="text-lg font-semibold text-slate-200 mt-1">
                {metrics.bestMonth || '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Growth</p>
              <p
                className={cn(
                  'text-lg font-semibold mt-1',
                  metrics.growth >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {metrics.growth >= 0 ? '+' : ''}
                {metrics.growth.toFixed(1)}%
              </p>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default RevenueChart;
