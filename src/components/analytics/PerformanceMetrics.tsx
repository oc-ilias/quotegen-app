/**
 * Performance Metrics Component
 * Key performance indicators and metrics dashboard
 * @module components/analytics/PerformanceMetrics
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  TargetIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

interface MetricData {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  unit?: string;
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  target?: number;
}

interface PerformanceMetricsProps {
  data: {
    avgQuoteValue: number;
    avgResponseTime: number;
    conversionRate: number;
    winRate: number;
    customerLifetimeValue: number;
    quoteToOrderRatio: number;
    avgTimeToClose: number;
    repeatCustomerRate: number;
  };
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

const formatValue = (value: number, format?: string, prefix?: string, suffix?: string, unit?: string): string => {
  let formatted = '';

  switch (format) {
    case 'currency':
      formatted = `$${value.toLocaleString()}`;
      break;
    case 'percentage':
      formatted = `${value.toFixed(1)}%`;
      break;
    case 'duration':
      if (value < 60) formatted = `${Math.round(value)}m`;
      else if (value < 1440) formatted = `${Math.round(value / 60)}h`;
      else formatted = `${Math.round(value / 1440)}d`;
      break;
    default:
      formatted = value.toLocaleString();
  }

  return `${prefix || ''}${formatted}${suffix || ''}${unit ? ` ${unit}` : ''}`;
};

const getChangeIndicator = (current: number, previous: number): { direction: 'up' | 'down' | 'flat'; percent: number } => {
  if (previous === 0) return { direction: 'flat', percent: 0 };
  const change = ((current - previous) / previous) * 100;
  return {
    direction: change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'flat',
    percent: Math.abs(change),
  };
};

// ============================================================================
// Component
// ============================================================================

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  data,
  isLoading,
  className,
}) => {
  const metrics = useMemo<MetricData[]>(() => {
    return [
      {
        id: 'avgQuoteValue',
        label: 'Avg Quote Value',
        value: data.avgQuoteValue,
        previousValue: data.avgQuoteValue * 0.92,
        format: 'currency',
        icon: CurrencyDollarIcon,
        color: 'from-emerald-500 to-emerald-600',
        description: 'Average value of all quotes',
        target: 5000,
      },
      {
        id: 'conversionRate',
        label: 'Conversion Rate',
        value: data.conversionRate,
        previousValue: data.conversionRate * 0.95,
        format: 'percentage',
        icon: ChartBarIcon,
        color: 'from-blue-500 to-blue-600',
        description: 'Quotes accepted / Quotes sent',
        target: 35,
      },
      {
        id: 'winRate',
        label: 'Win Rate',
        value: data.winRate,
        previousValue: data.winRate * 1.02,
        format: 'percentage',
        icon: TargetIcon,
        color: 'from-indigo-500 to-indigo-600',
        description: 'Closed won / Total opportunities',
        target: 45,
      },
      {
        id: 'avgResponseTime',
        label: 'Avg Response Time',
        value: data.avgResponseTime,
        previousValue: data.avgResponseTime * 1.15,
        format: 'duration',
        unit: 'min',
        icon: ClockIcon,
        color: 'from-amber-500 to-amber-600',
        description: 'Time to first response',
        target: 30,
      },
      {
        id: 'customerLifetimeValue',
        label: 'Customer LTV',
        value: data.customerLifetimeValue,
        previousValue: data.customerLifetimeValue * 0.88,
        format: 'currency',
        icon: UsersIcon,
        color: 'from-violet-500 to-violet-600',
        description: 'Lifetime value per customer',
        target: 15000,
      },
      {
        id: 'quoteToOrderRatio',
        label: 'Quote-to-Order',
        value: data.quoteToOrderRatio,
        previousValue: data.quoteToOrderRatio * 0.97,
        format: 'percentage',
        icon: BoltIcon,
        color: 'from-cyan-500 to-cyan-600',
        description: 'Quotes converted to orders',
        target: 40,
      },
      {
        id: 'avgTimeToClose',
        label: 'Time to Close',
        value: data.avgTimeToClose,
        previousValue: data.avgTimeToClose * 0.9,
        format: 'duration',
        unit: 'days',
        icon: ClockIcon,
        color: 'from-pink-500 to-pink-600',
        description: 'Average sales cycle length',
        target: 14,
      },
      {
        id: 'repeatCustomerRate',
        label: 'Repeat Customers',
        value: data.repeatCustomerRate,
        previousValue: data.repeatCustomerRate * 0.96,
        format: 'percentage',
        icon: SparklesIcon,
        color: 'from-rose-500 to-rose-600',
        description: 'Customers with 2+ orders',
        target: 60,
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className={cn('bg-slate-900 border border-slate-800 rounded-2xl p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-28 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-slate-900 border border-slate-800 rounded-2xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Performance Metrics</h3>
          <p className="text-sm text-slate-400 mt-1">Key performance indicators and targets</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <ArrowTrendingUpIcon className="w-3 h-3" />
            <span>vs last period</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const change = getChangeIndicator(metric.value, metric.previousValue);
          const isPositiveChange = change.direction === 'up';
          const isNegativeMetric = ['avgResponseTime', 'avgTimeToClose'].includes(metric.id);
          const isGoodChange = isNegativeMetric ? !isPositiveChange : isPositiveChange;

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800 rounded-xl p-4 group hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br',
                    metric.color
                  )}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    change.direction === 'flat'
                      ? 'text-slate-400'
                      : isGoodChange
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  )}
                >
                  {change.direction === 'up' ? (
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                  ) : change.direction === 'down' ? (
                    <ArrowTrendingDownIcon className="w-3 h-3" />
                  ) : (
                    <MinusIcon className="w-3 h-3" />
                  )}
                  <span>{change.percent.toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400">{metric.label}</p>
                <p className="text-xl font-bold text-slate-100">
                  {formatValue(metric.value, metric.format, metric.prefix, metric.suffix, metric.unit)}
                </p>
              </div>

              {metric.target && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Target: {formatValue(metric.target, metric.format)}</span>
                    <span
                      className={cn(
                        'font-medium',
                        metric.value >= metric.target ? 'text-emerald-400' : 'text-amber-400'
                      )}
                    >
                      {Math.round((metric.value / metric.target) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r',
                        metric.value >= metric.target ? metric.color : 'from-amber-500 to-amber-600'
                      )}
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {metric.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-sm text-slate-400">Metrics On Target</p>
          <p className="text-xl font-bold text-emerald-400">
            {metrics.filter((m) => m.target && m.value >= m.target).length}/{metrics.filter((m) => m.target).length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-400">Avg Improvement</p>
          <p className="text-xl font-bold text-blue-400">
            +
            {(
              metrics.reduce((acc, m) => acc + ((m.value - m.previousValue) / m.previousValue) * 100, 0) /
              metrics.length
            ).toFixed(1)}
            %
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-400">Best Performer</p>
          <p className="text-xl font-bold text-violet-400">Win Rate</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-400">Needs Attention</p>
          <p className="text-xl font-bold text-amber-400">Response Time</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
