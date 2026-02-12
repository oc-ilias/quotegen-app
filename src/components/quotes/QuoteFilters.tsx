/**
 * Enhanced Quote Filters Component
 * Advanced search, filtering, and sorting for quotes
 * @module components/quotes/QuoteFilters
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { QuoteStatus } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export interface FilterState {
  searchQuery: string;
  status: QuoteStatus[];
  dateFrom: string;
  dateTo: string;
  minValue: string;
  maxValue: string;
  sortBy: 'created' | 'updated' | 'total' | 'expiry';
  sortOrder: 'asc' | 'desc';
}

interface QuoteFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_OPTIONS = [
  { value: QuoteStatus.DRAFT, label: 'Draft', color: 'bg-slate-500' },
  { value: QuoteStatus.PENDING, label: 'Pending', color: 'bg-amber-500' },
  { value: QuoteStatus.SENT, label: 'Sent', color: 'bg-indigo-500' },
  { value: QuoteStatus.VIEWED, label: 'Viewed', color: 'bg-purple-500' },
  { value: QuoteStatus.ACCEPTED, label: 'Accepted', color: 'bg-emerald-500' },
  { value: QuoteStatus.REJECTED, label: 'Rejected', color: 'bg-red-500' },
  { value: QuoteStatus.EXPIRED, label: 'Expired', color: 'bg-gray-500' },
  { value: QuoteStatus.CONVERTED, label: 'Converted', color: 'bg-blue-500' },
] as const;

const SORT_OPTIONS = [
  { value: 'created', label: 'Created Date' },
  { value: 'updated', label: 'Last Updated' },
  { value: 'total', label: 'Quote Total' },
  { value: 'expiry', label: 'Expiry Date' },
] as const;

// ============================================================================
// Helper Functions
// ============================================================================

const createQueryString = (params: Record<string, string | string[] | undefined>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else {
      searchParams.set(key, value);
    }
  });
  
  return searchParams.toString();
};

// ============================================================================
// Main Component
// ============================================================================

export const QuoteFilters: React.FC<QuoteFiltersProps> = ({
  onFilterChange,
  initialFilters,
  className,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filterRef = useRef<HTMLDivElement>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL or props
  const statusFromUrl = searchParams.getAll('status') as QuoteStatus[];
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: searchParams.get('q') || initialFilters?.searchQuery || '',
    status: statusFromUrl.length > 0 ? statusFromUrl : initialFilters?.status || [],
    dateFrom: searchParams.get('from') || initialFilters?.dateFrom || '',
    dateTo: searchParams.get('to') || initialFilters?.dateTo || '',
    minValue: searchParams.get('min') || initialFilters?.minValue || '',
    maxValue: searchParams.get('max') || initialFilters?.maxValue || '',
    sortBy: (searchParams.get('sort') as FilterState['sortBy']) || initialFilters?.sortBy || 'created',
    sortOrder: (searchParams.get('order') as FilterState['sortOrder']) || initialFilters?.sortOrder || 'desc',
  });

  // Update URL when filters change
  useEffect(() => {
    const queryString = createQueryString({
      q: filters.searchQuery || undefined,
      status: filters.status.length > 0 ? filters.status : undefined,
      from: filters.dateFrom || undefined,
      to: filters.dateTo || undefined,
      min: filters.minValue || undefined,
      max: filters.maxValue || undefined,
      sort: filters.sortBy !== 'created' ? filters.sortBy : undefined,
      order: filters.sortOrder !== 'desc' ? filters.sortOrder : undefined,
    });

    const url = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(url, { scroll: false });
  }, [filters, pathname, router]);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusToggle = useCallback((status: QuoteStatus) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      status: [],
      dateFrom: '',
      dateTo: '',
      minValue: '',
      maxValue: '',
      sortBy: 'created',
      sortOrder: 'desc',
    });
  }, []);

  const toggleSortOrder = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const activeFiltersCount =
    filters.status.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.minValue ? 1 : 0) +
    (filters.maxValue ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0 || filters.searchQuery;

  return (
    <div ref={filterRef} className={cn('space-y-4', className)}>
      {/* Search Bar Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search quotes by number, customer, or product..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className={cn(
              'w-full pl-10 pr-10 py-2.5 bg-slate-900 border rounded-xl',
              'text-slate-100 placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
              'transition-all duration-200',
              filters.searchQuery ? 'border-indigo-500/50' : 'border-slate-700'
            )}
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'relative',
            showFilters && 'ring-2 ring-indigo-500/50'
          )}
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
            className="appearance-none pl-4 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Sort Order Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSortOrder}
          className="px-3"
          title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          <motion.div
            animate={{ rotate: filters.sortOrder === 'asc' ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowPathIcon className="w-4 h-4" />
          </motion.div>
        </Button>
      </div>

      {/* Active Filter Pills */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2"
          >
            {filters.searchQuery && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-sm rounded-full border border-indigo-500/20"
              >
                Search: "{filters.searchQuery}"
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                  className="hover:text-indigo-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </motion.span>
            )}

            {filters.status.map((status) => {
              const option = STATUS_OPTIONS.find((o) => o.value === status);
              return (
                <motion.span
                  key={status}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full border border-slate-700"
                >
                  <span className={cn('w-2 h-2 rounded-full', option?.color)} />
                  {option?.label}
                  <button
                    onClick={() => handleStatusToggle(status)}
                    className="hover:text-slate-100"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </motion.span>
              );
            })}

            {(filters.dateFrom || filters.dateTo) && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full border border-slate-700"
              >
                <CalendarIcon className="w-3 h-3" />
                {filters.dateFrom && filters.dateTo
                  ? `${filters.dateFrom} to ${filters.dateTo}`
                  : filters.dateFrom
                  ? `From ${filters.dateFrom}`
                  : `Until ${filters.dateTo}`}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, dateFrom: '', dateTo: '' }))}
                  className="hover:text-slate-100"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </motion.span>
            )}

            {(filters.minValue || filters.maxValue) && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full border border-slate-700"
              >
                <CurrencyDollarIcon className="w-3 h-3" />
                {filters.minValue && filters.maxValue
                  ? `${formatCurrency(parseFloat(filters.minValue))} - ${formatCurrency(parseFloat(filters.maxValue))}`
                  : filters.minValue
                  ? `Min ${formatCurrency(parseFloat(filters.minValue))}`
                  : `Max ${formatCurrency(parseFloat(filters.maxValue))}`}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, minValue: '', maxValue: '' }))}
                  className="hover:text-slate-100"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </motion.span>
            )}

            <button
              onClick={handleClearFilters}
              className="text-sm text-slate-500 hover:text-slate-300 underline"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6"
          >
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = filters.status.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleStatusToggle(option.value)}
                      className={cn(
                        'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        isSelected
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                      )}
                    >
                      <span className={cn('w-2 h-2 rounded-full', option.color)} />
                      {option.label}
                      {isSelected && <CheckIcon className="w-3 h-3 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Range */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">Date Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <p className="text-xs text-slate-500 mt-1">From</p>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <p className="text-xs text-slate-500 mt-1">To</p>
                  </div>
                </div>
              </div>

              {/* Value Range */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">Quote Value</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={filters.minValue}
                      onChange={(e) => setFilters((prev) => ({ ...prev, minValue: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <p className="text-xs text-slate-500 mt-1">Minimum</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Unlimited"
                      value={filters.maxValue}
                      onChange={(e) => setFilters((prev) => ({ ...prev, maxValue: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <p className="text-xs text-slate-500 mt-1">Maximum</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={handleClearFilters}
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                Reset all filters
              </button>
              <Button onClick={() => setShowFilters(false)}>
                Done
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Skeleton Loader
// ============================================================================

export const QuoteFiltersSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      {/* Search bar skeleton */}
      <div className="relative">
        <div className="w-full h-11 bg-slate-800 border border-slate-700 rounded-lg animate-pulse" />
      </div>
      
      {/* Filter buttons skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-28 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-9 w-24 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-9 w-32 bg-slate-800 rounded-lg animate-pulse" />
      </div>
      
      {/* Active filters skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-20 bg-slate-800 rounded-full animate-pulse" />
        <div className="h-7 w-24 bg-slate-800 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default QuoteFilters;
