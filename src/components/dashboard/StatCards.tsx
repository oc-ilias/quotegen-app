/**
 * Stat Cards Component
 * Animated statistic cards with trends and loading states
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { StatCardProps } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface StatCardComponentProps extends StatCardProps {
  delay?: number;
}

interface StatCardsGridProps {
  stats: StatCardComponentProps[];
  isLoading?: boolean;
}

// ============================================================================
// Icon Mapping
// ============================================================================

const iconMap: Record<string, React.ElementType> = {
  quotes: DocumentTextIcon,
  revenue: CurrencyDollarIcon,
  conversion: ChartBarIcon,
  customers: UsersIcon,
  pending: DocumentTextIcon,
  sent: DocumentTextIcon,
  accepted: CurrencyDollarIcon,
  declined: DocumentTextIcon,
};

// ============================================================================
// Color Configurations
// ============================================================================

const colorConfig = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    icon: 'text-blue-500',
    gradient: 'from-blue-500/20 to-blue-600/5',
  },
  green: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    icon: 'text-emerald-500',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
  },
  yellow: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    icon: 'text-amber-500',
    gradient: 'from-amber-500/20 to-amber-600/5',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    icon: 'text-red-500',
    gradient: 'from-red-500/20 to-red-600/5',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    icon: 'text-purple-500',
    gradient: 'from-purple-500/20 to-purple-600/5',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-400',
    icon: 'text-indigo-500',
    gradient: 'from-indigo-500/20 to-indigo-600/5',
  },
};

// ============================================================================
// Format Value Helper
// ============================================================================

function formatValue(value: number | string, format?: 'number' | 'currency' | 'percent'): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return String(value);
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numValue);
    
    case 'percent':
      return `${numValue.toFixed(1)}%`;
    
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(numValue);
  }
}

// ============================================================================
// Trend Indicator Component
// ============================================================================

interface TrendIndicatorProps {
  change?: number;
  label?: string;
}

const TrendIndicator = ({ change, label }: TrendIndicatorProps) => {
  if (change === undefined || change === null) {
    return null;
  }

  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  const Icon = isNeutral ? MinusIcon : isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const colorClass = isNeutral 
    ? 'text-slate-500' 
    : isPositive 
      ? 'text-emerald-400' 
      : 'text-red-400';

  return (
    <div className={cn('flex items-center gap-1 text-sm', colorClass)}>
      <Icon className="w-4 h-4" />
      <span className="font-medium">
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </span>
      {label && (
        <span className="text-slate-500 ml-1">{label}</span>
      )}
    </div>
  );
};

// ============================================================================
// Skeleton Loader
// ============================================================================

const StatCardSkeleton = ({ color }: { color: keyof typeof colorConfig }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={cn(
      'relative overflow-hidden rounded-2xl p-6',
      'bg-slate-900/50 border border-slate-800',
      colorConfig[color].border
    )}
  >
    {/* Shimmer effect */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
      <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-slate-800/30 to-transparent" />
    </div>
    
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
        <div className="h-8 w-32 bg-slate-800 rounded animate-pulse" />
        <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="h-12 w-12 bg-slate-800 rounded-xl animate-pulse" />
    </div>
  </motion.div>
);

// ============================================================================
// Stat Card Component
// ============================================================================

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'blue',
  isLoading = false,
  format = 'number',
  delay = 0,
}: StatCardComponentProps) {
  const Icon = iconMap[icon] || DocumentTextIcon;
  const colors = colorConfig[color];
  const formattedValue = formatValue(value, format);

  if (isLoading) {
    return <StatCardSkeleton color={color} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: delay * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-gradient-to-br border transition-all duration-300',
        'group cursor-pointer',
        colors.bg,
        colors.border,
        'hover:border-opacity-50 hover:shadow-lg',
        `hover:shadow-${color}-500/10`
      )}
    >
      {/* Background gradient overlay */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        colors.gradient
      )} />
      
      {/* Animated border glow */}
      <div className={cn(
        'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        'bg-gradient-to-r from-transparent via-white/5 to-transparent',
        'blur-xl'
      )} />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          {/* Title */}
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>
          
          {/* Value */}
          <motion.h3
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: delay * 0.1 + 0.1,
              type: 'spring',
              stiffness: 200
            }}
            className="text-3xl font-bold text-slate-100"
          >
            {formattedValue}
          </motion.h3>
          
          {/* Trend */}
          <TrendIndicator change={change} label={changeLabel} />
        </div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: delay * 0.1 + 0.2,
            type: 'spring',
            stiffness: 200
          }}
          whileHover={{ 
            rotate: 10,
            scale: 1.1,
            transition: { duration: 0.2 }
          }}
          className={cn(
            'flex-shrink-0 w-14 h-14 rounded-2xl',
            'flex items-center justify-center',
            'bg-slate-950/50 backdrop-blur-sm',
            colors.icon
          )}
        >
          <Icon className="w-7 h-7" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Stats Grid Component
// ============================================================================

export function StatCardsGrid({ stats, isLoading }: StatCardsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton 
            key={i} 
            color={(['blue', 'green', 'yellow', 'purple'] as const)[i - 1]} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          delay={index}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Dashboard Stats Hook
// ============================================================================

export interface DashboardStatsData {
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
}

export function useDashboardStats(data?: DashboardStatsData): StatCardComponentProps[] {
  const defaultData: DashboardStatsData = {
    totalQuotes: 0,
    pendingQuotes: 0,
    sentQuotes: 0,
    acceptedQuotes: 0,
    totalRevenue: 0,
    conversionRate: 0,
    averageQuoteValue: 0,
    quoteChange: 0,
    revenueChange: 0,
    conversionChange: 0,
  };

  const stats = data || defaultData;

  return [
    {
      title: 'Total Quotes',
      value: stats.totalQuotes,
      change: stats.quoteChange,
      changeLabel: 'vs last month',
      icon: 'quotes',
      color: 'blue',
      format: 'number',
    },
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      change: stats.revenueChange,
      changeLabel: 'vs last month',
      icon: 'revenue',
      color: 'green',
      format: 'currency',
    },
    {
      title: 'Conversion Rate',
      value: stats.conversionRate,
      change: stats.conversionChange,
      changeLabel: 'vs last month',
      icon: 'conversion',
      color: 'purple',
      format: 'percent',
    },
    {
      title: 'Avg Quote Value',
      value: stats.averageQuoteValue,
      icon: 'customers',
      color: 'indigo',
      format: 'currency',
    },
  ];
}

export default StatCardsGrid;
