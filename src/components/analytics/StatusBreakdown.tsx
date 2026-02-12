/**
 * Status Breakdown Chart Component
 * Pie chart showing quote status distribution
 * @module components/analytics/StatusBreakdown
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { QuoteStatus, StatusBreakdownData } from '@/types/quote';
import { QuoteStatusLabels } from '@/types/quote';

// ============================================================================
// Color Configuration
// ============================================================================

const statusColors: Record<QuoteStatus, string> = {
  draft: '#64748b',
  pending: '#f59e0b',
  sent: '#6366f1',
  viewed: '#a855f7',
  accepted: '#10b981',
  rejected: '#ef4444',
  expired: '#94a3b8',
  converted: '#3b82f6',
};

// ============================================================================
// Custom Tooltip
// ============================================================================

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: StatusBreakdownData }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl">
        <p className="text-slate-300 font-medium mb-2">
          {QuoteStatusLabels[data.status]}
        </p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Count:</span>
            <span className="text-slate-200 font-medium">{data.count}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Percentage:</span>
            <span className="text-slate-200 font-medium">{data.percentage.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Value:</span>
            <span className="text-slate-200 font-medium">
              ${data.value.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// ============================================================================
// Status Breakdown Component
// ============================================================================

export interface StatusBreakdownProps {
  data: StatusBreakdownData[];
  isLoading?: boolean;
  className?: string;
  allowExport?: boolean;
  showLegend?: boolean;
}

export function StatusBreakdown({ data, isLoading = false, className }: StatusBreakdownProps) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  if (isLoading) {
    return (
      <div className={cn('bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-[400px] animate-pulse', className)}>
        <div className="h-6 w-48 bg-slate-800 rounded mb-4" />
        <div className="h-[300px] bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('bg-slate-900/50 border border-slate-800 rounded-2xl p-6', className)}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Quote Status Breakdown</h3>
          <p className="text-sm text-slate-500 mt-1">Distribution of quotes by status</p>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-200">{totalCount}</p>
          <p className="text-sm text-slate-500">quotes</p>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={statusColors[entry.status]}
                  stroke={statusColors[entry.status]}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value: QuoteStatus) => QuoteStatusLabels[value]}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Total Value</p>
            <p className="text-lg font-semibold text-slate-200">
              ${totalValue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Avg Value</p>
            <p className="text-lg font-semibold text-slate-200">
              ${totalCount > 0 ? Math.round(totalValue / totalCount).toLocaleString() : 0}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default StatusBreakdown;
