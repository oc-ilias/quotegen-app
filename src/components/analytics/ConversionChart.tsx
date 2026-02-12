/**
 * Conversion Chart Component
 * Line chart showing quote conversion over time
 */

'use client';

import React from 'react';
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
} from 'recharts';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface ConversionDataPoint {
  date: string;
  sent: number;
  viewed: number;
  accepted: number;
  conversionRate: number;
}

export interface ConversionChartProps {
  data: ConversionDataPoint[];
  isLoading?: boolean;
  allowExport?: boolean;
  showTrend?: boolean;
}

// Mock data for demo
const mockData: ConversionDataPoint[] = [
  { date: 'Jan', sent: 45, viewed: 38, accepted: 12, conversionRate: 26.7 },
  { date: 'Feb', sent: 52, viewed: 44, accepted: 18, conversionRate: 34.6 },
  { date: 'Mar', sent: 48, viewed: 41, accepted: 15, conversionRate: 31.3 },
  { date: 'Apr', sent: 61, viewed: 52, accepted: 22, conversionRate: 36.1 },
  { date: 'May', sent: 55, viewed: 48, accepted: 19, conversionRate: 34.5 },
  { date: 'Jun', sent: 67, viewed: 58, accepted: 28, conversionRate: 41.8 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl">
        <p className="text-slate-300 font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-slate-200 font-medium">
              {entry.name === 'Conversion Rate' ? `${entry.value}%` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ConversionChart({ data = mockData, isLoading = false }: ConversionChartProps) {
  // Calculate trend
  const currentRate = data[data.length - 1]?.conversionRate || 0;
  const previousRate = data[data.length - 2]?.conversionRate || 0;
  const trend = currentRate - previousRate;
  const isPositive = trend >= 0;

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
          <h3 className="text-lg font-semibold text-slate-200">Quote Conversion Rate</h3>
          <p className="text-sm text-slate-500 mt-1">Track quote lifecycle from sent to accepted</p>
        </div>
        
        <div className="flex items-center gap-2">
          {isPositive ? (
            <>
              <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">+{trend.toFixed(1)}%</span>
            </>
          ) : (
            <>
              <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">{trend.toFixed(1)}%</span>
            </>
          )}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#475569' }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#475569' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#475569' }}
              tickFormatter={(value) => `${value}%`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sent"
              name="Sent"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="viewed"
              name="Viewed"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ fill: '#a855f7', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="accepted"
              name="Accepted"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
            
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="conversionRate"
              name="Conversion Rate"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#f59e0b', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default ConversionChart;
