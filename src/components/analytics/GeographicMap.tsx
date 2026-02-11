/**
 * Geographic Map Component
 * Displays quote and customer distribution by region
 * @module components/analytics/GeographicMap
 */

'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  GlobeAltIcon,
  MapPinIcon,
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

interface RegionData {
  id: string;
  name: string;
  country: string;
  quotes: number;
  customers: number;
  revenue: number;
  growth: number;
  percentage: number;
  coordinates: { x: number; y: number };
}

interface GeographicMapProps {
  data: RegionData[];
  isLoading?: boolean;
  className?: string;
  onRegionClick?: (region: RegionData) => void;
}

type ViewMode = 'quotes' | 'revenue' | 'customers';

// ============================================================================
// Mock Data Generator
// ============================================================================

export const generateMockRegionData = (): RegionData[] => [
  { id: 'us-west', name: 'West Coast', country: 'United States', quotes: 145, customers: 89, revenue: 285000, growth: 23.5, percentage: 35, coordinates: { x: 20, y: 35 } },
  { id: 'us-east', name: 'East Coast', country: 'United States', quotes: 132, customers: 76, revenue: 245000, growth: 18.2, percentage: 28, coordinates: { x: 75, y: 38 } },
  { id: 'us-central', name: 'Central', country: 'United States', quotes: 89, customers: 52, revenue: 165000, growth: 12.8, percentage: 18, coordinates: { x: 48, y: 42 } },
  { id: 'ca', name: 'Canada', country: 'Canada', quotes: 56, customers: 34, revenue: 98000, growth: 31.4, percentage: 12, coordinates: { x: 35, y: 15 } },
  { id: 'uk', name: 'United Kingdom', country: 'United Kingdom', quotes: 45, customers: 28, revenue: 87000, growth: 15.6, percentage: 10, coordinates: { x: 52, y: 55 } },
  { id: 'de', name: 'Germany', country: 'Germany', quotes: 38, customers: 22, revenue: 72000, growth: 28.9, percentage: 8, coordinates: { x: 58, y: 52 } },
  { id: 'fr', name: 'France', country: 'France', quotes: 32, customers: 19, revenue: 61000, growth: 8.4, percentage: 7, coordinates: { x: 54, y: 58 } },
  { id: 'au', name: 'Australia', country: 'Australia', quotes: 28, customers: 17, revenue: 54000, growth: 42.1, percentage: 6, coordinates: { x: 85, y: 75 } },
];

// ============================================================================
// Component
// ============================================================================

export const GeographicMap: React.FC<GeographicMapProps> = ({
  data,
  isLoading,
  className,
  onRegionClick,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('revenue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(
      (region) =>
        region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        region.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const totalStats = useMemo(() => {
    return filteredData.reduce(
      (acc, region) => ({
        quotes: acc.quotes + region.quotes,
        customers: acc.customers + region.customers,
        revenue: acc.revenue + region.revenue,
      }),
      { quotes: 0, customers: 0, revenue: 0 }
    );
  }, [filteredData]);

  const maxValue = useMemo(() => {
    if (viewMode === 'quotes') return Math.max(...filteredData.map((d) => d.quotes));
    if (viewMode === 'customers') return Math.max(...filteredData.map((d) => d.customers));
    return Math.max(...filteredData.map((d) => d.revenue));
  }, [filteredData, viewMode]);

  const getBubbleSize = (region: RegionData) => {
    const value = viewMode === 'quotes' ? region.quotes : viewMode === 'customers' ? region.customers : region.revenue;
    const minSize = 24;
    const maxSize = 64;
    if (maxValue === 0) return minSize;
    return minSize + (value / maxValue) * (maxSize - minSize);
  };

  const getBubbleColor = (region: RegionData) => {
    if (region.growth >= 25) return 'bg-emerald-500';
    if (region.growth >= 10) return 'bg-blue-500';
    if (region.growth >= 0) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const handleRegionClick = (region: RegionData) => {
    setSelectedRegion(region);
    onRegionClick?.(region);
  };

  if (isLoading) {
    return (
      <div className={cn('bg-slate-900 border border-slate-800 rounded-2xl p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3" />
          <div className="h-64 bg-slate-800 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-slate-900 border border-slate-800 rounded-2xl p-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Geographic Distribution</h3>
          <p className="text-sm text-slate-400 mt-1">Quote and customer activity by region</p>
        </div>

        <div className="flex items-center gap-2">
          {(['revenue', 'quotes', 'customers'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                viewMode === mode
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              )}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search regions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Map Visualization */}
      <div className="relative h-80 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden mb-6">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* World Map Silhouette (Simplified) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <GlobeAltIcon className="w-64 h-64 text-slate-400" />
        </div>

        {/* Region Bubbles */}
        <AnimatePresence>
          {filteredData.map((region) => {
            const size = getBubbleSize(region);
            const isSelected = selectedRegion?.id === region.id;

            return (
              <motion.button
                key={region.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => handleRegionClick(region)}
                className={cn(
                  'absolute rounded-full flex items-center justify-center font-semibold text-white shadow-lg transition-all',
                  getBubbleColor(region),
                  isSelected && 'ring-4 ring-white/20'
                )}
                style={{
                  width: size,
                  height: size,
                  left: `${region.coordinates.x}%`,
                  top: `${region.coordinates.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: Math.max(10, size / 4),
                }}
              >
                {viewMode === 'revenue'
                  ? `$${Math.round(region.revenue / 1000)}k`
                  : viewMode === 'quotes'
                  ? region.quotes
                  : region.customers}
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur rounded-lg p-3 border border-slate-800">
          <p className="text-xs font-medium text-slate-400 mb-2">Growth</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400">+25%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-400">+10%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs text-slate-400">0%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-slate-400">003c 0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Region Details */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-indigo-400" />
                  <h4 className="font-semibold text-slate-200">{selectedRegion.name}</h4>
                </div>
                <p className="text-sm text-slate-400 mt-1">{selectedRegion.country}</p>
              </div>
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-2xl font-bold text-slate-200">{selectedRegion.quotes}</p>
                <p className="text-xs text-slate-500">Quotes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-200">{selectedRegion.customers}</p>
                <p className="text-xs text-slate-500">Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">
                  ${(selectedRegion.revenue / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-slate-500">Revenue</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DocumentTextIcon className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-400">Total Quotes</span>
          </div>
          <p className="text-xl font-bold text-slate-200">{totalStats.quotes.toLocaleString()}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <UsersIcon className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-slate-400">Customers</span>
          </div>
          <p className="text-xl font-bold text-slate-200">{totalStats.customers.toLocaleString()}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CurrencyDollarIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-400">Revenue</span>
          </div>
          <p className="text-xl font-bold text-slate-200">${(totalStats.revenue / 1000).toFixed(0)}k</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-400">Top Region</span>
          </div>
          <p className="text-xl font-bold text-slate-200 truncate">
            {filteredData[0]?.name || 'N/A'}
          </p>
        </div>
      </div>

      {/* Region List */}
      <div className="mt-6 border-t border-slate-800 pt-6">
        <h4 className="text-sm font-medium text-slate-300 mb-4">Top Performing Regions</h4>
        <div className="space-y-2">
          {filteredData.slice(0, 5).map((region, index) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleRegionClick(region)}
              className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-500 w-6">#{index + 1}</span>
                <div>
                  <p className="font-medium text-slate-200">{region.name}</p>
                  <p className="text-xs text-slate-500">{region.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-slate-200">${(region.revenue / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-slate-500">{region.quotes} quotes</p>
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    region.growth >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {region.growth >= 0 ? (
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-3 h-3" />
                  )}
                  {Math.abs(region.growth)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeographicMap;
