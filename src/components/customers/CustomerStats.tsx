/**
 * Customer Stats Component
 * Display customer statistics in a dashboard card
 * @module components/customers/CustomerStats
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import type { CustomerStats as CustomerStatsType } from '@/types/quote';

interface CustomerStatsProps {
  stats: CustomerStatsType | null;
  isLoading?: boolean;
}

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  delay?: number;
}

const StatItem: React.FC<StatItemProps> = ({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  delay = 0,
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700"
    >
      <div
        className={cn(
          'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border',
          colorClasses[color]
        )}
      >
        <Icon className="w-6 h-6" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        {subValue && <p className="text-sm text-slate-500 mt-1">{subValue}</p>}
      </div>
    </motion.div>
  );
};

export const CustomerStats: React.FC<CustomerStatsProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-start gap-4">
                  <Skeleton width={48} height={48} variant="rounded" />
                  <div className="flex-1">
                    <Skeleton width={100} height={16} className="mb-2" />
                    <Skeleton width={80} height={32} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasQuotes = stats.totalQuotes > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Statistics</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatItem
            icon={DocumentTextIcon}
            label="Total Quotes"
            value={stats.totalQuotes}
            subValue={hasQuotes ? `${stats.pendingQuotes} pending` : undefined}
            color="blue"
            delay={0}
          />

          <StatItem
            icon={CurrencyDollarIcon}
            label="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            subValue={hasQuotes ? `Avg: $${Math.round(stats.avgQuoteValue).toLocaleString()}` : undefined}
            color="green"
            delay={0.1}
          />

          <StatItem
            icon={ChartBarIcon}
            label="Conversion Rate"
            value={`${stats.conversionRate.toFixed(1)}%`}
            subValue={`${stats.acceptedQuotes} accepted / ${stats.declinedQuotes} declined`}
            color="purple"
            delay={0.2}
          />

          <StatItem
            icon={CheckCircleIcon}
            label="Accepted Quotes"
            value={stats.acceptedQuotes}
            color="indigo"
            delay={0.3}
          />

          <StatItem
            icon={XCircleIcon}
            label="Declined Quotes"
            value={stats.declinedQuotes}
            color="red"
            delay={0.4}
          />

          <StatItem
            icon={ClockIcon}
            label="Pending Quotes"
            value={stats.pendingQuotes}
            color="yellow"
            delay={0.5}
          />
        </div>

        {stats.lastQuoteDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pt-4 border-t border-slate-700"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">First Quote</span>
              <span className="text-slate-300">
                {stats.firstQuoteDate && new Date(stats.firstQuoteDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-500">Last Quote</span>
              <span className="text-slate-300">
                {new Date(stats.lastQuoteDate).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerStats;
