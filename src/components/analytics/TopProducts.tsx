/**
 * Top Products Chart Component
 * Horizontal bar chart showing most quoted products
 * @module components/analytics/TopProducts
 */

'use client';

import React from 'react';
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
} from 'recharts';
import { cn } from '@/lib/utils';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import type { TopProductData } from '@/types/quote';

// ============================================================================
// Custom Tooltip
// ============================================================================

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: TopProductData }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl">
        <p className="text-slate-300 font-medium mb-2 truncate max-w-[200px]">
          {data.title}
        </p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Quantity:</span>
            <span className="text-slate-200 font-medium">{data.quantity}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Revenue:</span>
            <span className="text-slate-200 font-medium">
              ${data.revenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// ============================================================================
// Top Products Component
// ============================================================================

export interface TopProductsProps {
  data: TopProductData[];
  isLoading?: boolean;
  className?: string;
  allowExport?: boolean;
  showGrowth?: boolean;
}

export function TopProducts({ data, isLoading = false, className }: TopProductsProps) {
  if (isLoading) {
    return (
      <div className={cn('bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-[400px] animate-pulse', className)}>
        <div className="h-6 w-48 bg-slate-800 rounded mb-4" />
        <div className="h-[300px] bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn('bg-slate-900/50 border border-slate-800 rounded-2xl p-6', className)}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-200">Top Quoted Products</h3>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <ShoppingBagIcon className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-300">No product data available</h3>
          <p className="mt-1 text-sm text-slate-500">Start creating quotes to see your top products</p>
        </div>
      </motion.div>
    );
  }

  // Sort by quantity and take top 10
  const sortedData = [...data].sort((a, b) => b.quantity - a.quantity).slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('bg-slate-900/50 border border-slate-800 rounded-2xl p-6', className)}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Top Quoted Products</h3>
          <p className="text-sm text-slate-500 mt-1">Most frequently quoted products</p>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="title"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={90}
              tickFormatter={(value: string) =>
                value.length > 20 ? `${value.substring(0, 20)}...` : value
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="quantity" name="Quantity" radius={[0, 4, 4, 0]}>
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#6366f1' : `rgba(99, 102, 241, ${1 - index * 0.1})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Product List */}
      <div className="mt-6 pt-6 border-t border-slate-800">
        <div className="space-y-3">
          {sortedData.slice(0, 5).map((product, index) => (
            <motion.div
              key={product.productId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  index === 0 && 'bg-amber-500/20 text-amber-400',
                  index === 1 && 'bg-slate-400/20 text-slate-400',
                  index === 2 && 'bg-orange-600/20 text-orange-400',
                  index > 2 && 'bg-slate-700/20 text-slate-500'
                )}>
                  {index + 1}
                </span>
                <span className="text-sm text-slate-300 truncate max-w-[200px]">
                  {product.title}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">
                  {product.quantity} quoted
                </span>
                <span className="text-sm font-medium text-slate-200">
                  ${product.revenue.toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default TopProducts;
