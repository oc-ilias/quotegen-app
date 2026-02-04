/**
 * Revenue Chart Component
 * Bar chart showing revenue by month
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
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface RevenueDataPoint {
  month: string;
  revenue: number;
  quotes: number;
  avgValue: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  isLoading?: boolean;
}

// Mock data
const mockData: RevenueDataPoint[] = [
  { month: 'Jan', revenue: 12500, quotes: 12, avgValue: 1042 },
  { month: 'Feb', revenue: 18200, quotes: 18, avgValue: 1011 },
  { month: 'Mar', revenue: 15600, quotes: 15, avgValue: 1040 },
  { month: 'Apr', revenue: 22400, quotes: 22, avgValue: 1018 },
  { month: 'May', revenue: 19800, quotes: 19, avgValue: 1042 },
  { month: 'Jun', revenue: 28600, quotes: 28, avgValue: 1021 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number; dataKey: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    const revenue = payload.find(p => p.dataKey === 'revenue')?.value || 0;
    const quotes = payload.find(p => p.dataKey === 'quotes')?.value || 0;
    const avgValue = payload.find(p => p.dataKey === 'avgValue')?.value || 0;
    
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl">
        <p className="text-slate-300 font-medium mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-slate-400">Revenue:</span>
            <span className="text-slate-200 font-medium">
              ${revenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Quotes:</span>
            <span className="text-slate-200 font-medium">{quotes}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-400">Avg Value:</span>
            <span className="text-slate-200 font-medium">
              ${avgValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueChart({ data = mockData, isLoading = false }: RevenueChartProps) {
  // Calculate total revenue
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalQuotes = data.reduce((sum, item) => sum + item.quotes, 0);

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-[400px] animate-pulse">
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
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Revenue by Month</h3>
          <p className="text-sm text-slate-500 mt-1">Total revenue from accepted quotes</p>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-400">
            ${totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">{totalQuotes} quotes</p>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis 
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              dataKey="revenue" 
              name="Revenue"
              fill="url(#revenueGradient)"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? '#6366f1' : 'url(#revenueGradient)'}
                />
              ))}
            </Bar>
            
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default RevenueChart;
