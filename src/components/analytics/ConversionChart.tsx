/**
 * Conversion Chart Component
 * Line chart showing quote conversion over time with enhanced tooltips
 * @module components/analytics/ConversionChart
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';
import { ChartTooltip, formatNumber, formatPercent } from './ChartTooltip';
import { EmptyState } from './EmptyState';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import type { ConversionDataPoint } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export interface ConversionChartProps {
  /** Conversion data points */
  data: ConversionDataPoint[];
  /** Loading state */
  isLoading?: boolean;
  /** Optional className */
  className?: string;
  /** Title override */
  title?: string;
  /** Target conversion rate for reference line */
  targetRate?: number;
}

// ============================================================================
// Loading Skeleton
// ============================================================================

const ChartSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    {/* Header Skeleton */}
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-6 w-40 bg-slate-800 rounded" />
        <div className="h-4 w-56 bg-slate-800 rounded" />
      </div>
      <div className="h-8 w-24 bg-slate-800 rounded" />
    </div>

    {/* Chart Skeleton */}
    <div className="h-[300px] bg-slate-800/50 rounded-xl mt-4" />
  </div>
);

// ============================================================================
// Custom Tooltip
// ============================================================================

const ConversionTooltip: React.FC<{
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
        if (dataKey === 'conversionRate') {
          return formatPercent(value);
        }
        return formatNumber(value);
      }}
      footer={
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
          <span>Funnel: {formatNumber((data as any).sent)} → {formatNumber((data as any).viewed)} → {formatNumber((data as any).accepted)}</span>
        </div>
      }
    />
  );
};

// ============================================================================
// Main Component
// ============================================================================

export function ConversionChart({
  data,
  isLoading = false,
  className,
  title = 'Quote Conversion Rate',
  targetRate = 30,
}: ConversionChartProps) {
  // Calculate metrics
  const metrics = useMemo(() => {
    if (data.length === 0) {
      return {
        currentRate: 0,
        previousRate: 0,
        trend: 0,
        avgRate: 0,
        totalSent: 0,
        totalAccepted: 0,
        isPositive: false,
      };
    }

    const currentRate = data[data.length - 1]?.conversionRate || 0;
    const previousRate = data[data.length - 2]?.conversionRate || 0;
    const trend = currentRate - previousRate;
    const avgRate = data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length;
    const totalSent = data.reduce((sum, item) => sum + item.sent, 0);
    const totalAccepted = data.reduce((sum, item) => sum + item.accepted, 0);

    return {
      currentRate,
      previousRate,
      trend,
      avgRate,
      totalSent,
      totalAccepted,
      isPositive: trend >= 0,
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
            <p className="text-sm text-slate-500 mt-1">Track quote lifecycle from sent to accepted</p>
          </div>
        </div>
        <EmptyState
          icon={ChartBarIcon}
          title="No conversion data available"
          description="Send quotes to customers to track your conversion rates over time."
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
                Track quote lifecycle from sent to accepted
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <motion.p
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-2xl font-bold text-slate-200 tabular-nums"
                >
                  {metrics.currentRate.toFixed(1)}%
                </motion.p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  {metrics.trend === 0 ? (
                    <>
                      <MinusIcon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-500">No change</span>
                    </>
                  ) : metrics.isPositive ? (
                    <>
                      <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400 font-medium">
                        +{metrics.trend.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-400 font-medium">
                        {metrics.trend.toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={{ stroke: '#334155' }}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(value: string) => {
                    if (value.includes(' ')) {
                      return value.split(' ')[0];
                    }
                    return value;
                  }}
                />

                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={{ stroke: '#334155' }}
                  axisLine={{ stroke: '#334155' }}
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickLine={{ stroke: '#334155' }}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(value: number) => `${value}%`}
                  domain={[0, 'auto']}
                />

                <Tooltip content={<ConversionTooltip />} />

                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />

                <ReferenceLine
                  yAxisId="right"
                  y={targetRate}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Target',
                    position: 'right',
                    fill: '#10b981',
                    fontSize: 11,
                  }}
                />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sent"
                  name="Sent"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={1000}
                />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="viewed"
                  name="Viewed"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ fill: '#a855f7', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={1000}
                />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="accepted"
                  name="Accepted"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={1000}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="conversionRate"
                  name="Conversion Rate"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-4 gap-4"
          >
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total Sent</p>
              <p className="text-lg font-semibold text-slate-200 mt-1">
                {formatNumber(metrics.totalSent)}
              </p>
            </div>
            <div className="text-center border-l border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Accepted</p>
              <p className="text-lg font-semibold text-emerald-400 mt-1">
                {formatNumber(metrics.totalAccepted)}
              </p>
            </div>
            <div className="text-center border-l border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Avg Rate</p>
              <p className="text-lg font-semibold text-slate-200 mt-1">
                {metrics.avgRate.toFixed(1)}%
              </p>
            </div>
            <div className="text-center border-l border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Target</p>
              <p className="text-lg font-semibold text-slate-200 mt-1">{targetRate}%</p>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default ConversionChart;
