/**
 * Funnel Chart Component
 * Visualizes quote conversion funnel from creation to acceptance
 * @module components/analytics/FunnelChart
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DocumentTextIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

interface FunnelStage {
  id: string;
  label: string;
  count: number;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface FunnelChartProps {
  data: {
    created: number;
    sent: number;
    viewed: number;
    accepted: number;
    declined: number;
    totalValue: number;
    acceptedValue: number;
  };
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  isLoading,
  className,
}) => {
  const stages = useMemo<FunnelStage[]>(() => {
    const stages: FunnelStage[] = [
      {
        id: 'created',
        label: 'Quotes Created',
        count: data.created,
        value: data.totalValue,
        icon: DocumentTextIcon,
        color: 'from-blue-500 to-blue-600',
        description: 'Total quotes created in period',
      },
      {
        id: 'sent',
        label: 'Quotes Sent',
        count: data.sent,
        value: data.totalValue * 0.85,
        icon: PaperAirplaneIcon,
        color: 'from-indigo-500 to-indigo-600',
        description: 'Quotes sent to customers',
      },
      {
        id: 'viewed',
        label: 'Quotes Viewed',
        count: data.viewed,
        value: data.totalValue * 0.65,
        icon: CheckCircleIcon,
        color: 'from-violet-500 to-violet-600',
        description: 'Quotes viewed by customers',
      },
      {
        id: 'accepted',
        label: 'Quotes Accepted',
        count: data.accepted,
        value: data.acceptedValue,
        icon: CurrencyDollarIcon,
        color: 'from-emerald-500 to-emerald-600',
        description: 'Quotes accepted and converted',
      },
    ];

    return stages;
  }, [data]);

  const maxCount = Math.max(...stages.map((s) => s.count));

  const conversionRates = useMemo(() => {
    return stages.map((stage, index) => {
      if (index === 0) return { ...stage, conversionRate: 100, dropOff: 0 };
      const prevStage = stages[index - 1];
      const conversionRate = prevStage.count > 0 
        ? Math.round((stage.count / prevStage.count) * 100) 
        : 0;
      const dropOff = 100 - conversionRate;
      return { ...stage, conversionRate, dropOff };
    });
  }, [stages]);

  if (isLoading) {
    return (
      <div className={cn('bg-slate-900 border border-slate-800 rounded-2xl p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-24" />
                  <div className="h-8 bg-slate-800 rounded" style={{ width: `${100 - i * 20}%` }} />
                </div>
              </div>
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
          <h3 className="text-lg font-semibold text-slate-100">Conversion Funnel</h3>
          <p className="text-sm text-slate-400 mt-1">
            {data.accepted} of {data.created} quotes converted ({Math.round((data.accepted / data.created) * 100)}%)
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-400">
            ${data.acceptedValue.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">Revenue converted</p>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-3">
        {conversionRates.map((stage, index) => {
          const Icon = stage.icon;
          const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
          const isLast = index === conversionRates.length - 1;

          return (
            <React.Fragment key={stage.id}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      'bg-gradient-to-br shadow-lg'
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${stage.color.includes('blue') ? '#3b82f6' : stage.color.includes('indigo') ? '#6366f1' : stage.color.includes('violet') ? '#8b5cf6' : '#10b981'}, ${stage.color.includes('blue') ? '#2563eb' : stage.color.includes('indigo') ? '#4f46e5' : stage.color.includes('violet') ? '#7c3aed' : '#059669'})`,
                    }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-200">{stage.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">
                          {stage.count.toLocaleString()} quotes
                        </span>
                        {index > 0 && (
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              stage.conversionRate >= 70
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : stage.conversionRate >= 40
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-red-500/10 text-red-400'
                            )}
                          >
                            {stage.conversionRate}% conv.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-10 bg-slate-800 rounded-xl overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                        className={cn(
                          'absolute inset-y-0 left-0 rounded-xl bg-gradient-to-r',
                          stage.color
                        )}
                      />
                      <div className="absolute inset-0 flex items-center px-4">
                        <span className="text-sm font-semibold text-white drop-shadow-md">
                          ${stage.value.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">{stage.description}</p>
                  </div>
                </div>
              </motion.div>

              {/* Arrow connector */}
              {!isLast && (
                <div className="flex justify-center py-1">
                  <ArrowRightIcon className="w-4 h-4 text-slate-600 rotate-90" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-200">
            {Math.round((data.accepted / data.created) * 100)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Overall Conversion</p>
        </div>
        <div className="text-center border-x border-slate-800">
          <p className="text-2xl font-bold text-amber-400">
            {Math.round((data.declined / data.created) * 100)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Decline Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">
            ${Math.round(data.acceptedValue / (data.accepted || 1)).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Avg Deal Size</p>
        </div>
      </div>
    </div>
  );
};

export default FunnelChart;
