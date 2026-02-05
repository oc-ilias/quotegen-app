/**
 * Quote Search and Filtering Components
 * Advanced search, filtering, and sorting for quotes
 * @module components/quotes/QuoteSearchFilter
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  CheckIcon,
  ArrowPathIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
  UserIcon,
  TagIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { type QuoteStatus, type QuoteFilters, QuoteStatusLabels, QuoteStatusColors } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface QuoteSearchFilterProps {
  filters: QuoteFilters;
  onFiltersChange: (filters: QuoteFilters) => void;
  totalResults?: number;
  isLoading?: boolean;
}

interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

// ============================================================================
// Status Filter Component
// ============================================================================

const StatusFilter: React.FC<{
  selected: QuoteStatus[];
  onChange: (statuses: QuoteStatus[]) => void;
}> = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statuses = useMemo(() => Object.values(QuoteStatus), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleStatus = useCallback((status: QuoteStatus) => {
    if (selected.includes(status)) {
      onChange(selected.filter(s => s !== status));
    } else {
      onChange([...selected, status]);
    }
  }, [selected, onChange]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
          ${selected.length > 0 
            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
          }
        `}
      >
        <TagIcon className="w-4 h-4" />
        <span className="text-sm">
          {selected.length > 0 ? `${selected.length} Status${selected.length > 1 ? 'es' : ''}` : 'Status'}
        </span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-2">
              {statuses.map((status) => {
                const isSelected = selected.includes(status);
                return (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                      ${isSelected ? 'bg-slate-800' : 'hover:bg-slate-800/50'}
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded border flex items-center justify-center transition-colors
                      ${isSelected 
                        ? 'bg-indigo-500 border-indigo-500' 
                        : 'border-slate-600'
                      }
                    `}>
                      {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                    </div>
                    <span className={QuoteStatusColors[status].split(' ')[1]}>
                      {QuoteStatusLabels[status]}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {selected.length > 0 && (
              <div className="border-t border-slate-800 p-2">
                <button
                  onClick={() => onChange([])}
                  className="w-full px-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Clear selection
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Date Range Filter Component
// ============================================================================

const DateRangeFilter: React.FC<{
  dateFrom?: Date;
  dateTo?: Date;
  onChange: (from?: Date, to?: Date) => void;
}> = ({ dateFrom, dateTo, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState(dateFrom ? formatDateForInput(dateFrom) : '');
  const [tempTo, setTempTo] = useState(dateTo ? formatDateForInput(dateTo) : '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasValue = dateFrom || dateTo;

  const applyFilter = useCallback(() => {
    onChange(
      tempFrom ? new Date(tempFrom) : undefined,
      tempTo ? new Date(tempTo) : undefined
    );
    setIsOpen(false);
  }, [tempFrom, tempTo, onChange]);

  const clearFilter = useCallback(() => {
    setTempFrom('');
    setTempTo('');
    onChange(undefined, undefined);
    setIsOpen(false);
  }, [onChange]);

  const quickSelect = useCallback((days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setTempFrom(formatDateForInput(from));
    setTempTo(formatDateForInput(to));
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
          ${hasValue 
            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
          }
        `}
      >
        <CalendarIcon className="w-4 h-4" />
        <span className="text-sm">{hasValue ? 'Date Range' : 'Date'}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                {[
                  { label: '7d', days: 7 },
                  { label: '30d', days: 30 },
                  { label: '90d', days: 90 },
                  { label: '1y', days: 365 },
                ].map(({ label, days }) => (
                  <button
                    key={days}
                    onClick={() => quickSelect(days)}
                    className="flex-1 px-3 py-1.5 text-sm bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">From</label>
                  <input
                    type="date"
                    value={tempFrom}
                    onChange={(e) => setTempFrom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">To</label>
                  <input
                    type="date"
                    value={tempTo}
                    onChange={(e) => setTempTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={clearFilter}
                  className="flex-1 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={applyFilter}
                  className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Value Range Filter Component
// ============================================================================

const ValueRangeFilter: React.FC<{
  minValue?: number;
  maxValue?: number;
  onChange: (min?: number, max?: number) => void;
}> = ({ minValue, maxValue, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempMin, setTempMin] = useState(minValue?.toString() || '');
  const [tempMax, setTempMax] = useState(maxValue?.toString() || '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasValue = minValue !== undefined || maxValue !== undefined;

  const applyFilter = useCallback(() => {
    onChange(
      tempMin ? parseFloat(tempMin) : undefined,
      tempMax ? parseFloat(tempMax) : undefined
    );
    setIsOpen(false);
  }, [tempMin, tempMax, onChange]);

  const clearFilter = useCallback(() => {
    setTempMin('');
    setTempMax('');
    onChange(undefined, undefined);
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
          ${hasValue 
            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
          }
        `}
      >
        <CurrencyDollarIcon className="w-4 h-4" />
        <span className="text-sm">{hasValue ? 'Value' : 'Amount'}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Min ($)</label>
                  <input
                    type="number"
                    value={tempMin}
                    onChange={(e) => setTempMin(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Max ($)</label>
                  <input
                    type="number"
                    value={tempMax}
                    onChange={(e) => setTempMax(e.target.value)}
                    placeholder="∞"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={clearFilter}
                  className="flex-1 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={applyFilter}
                  className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Sort Dropdown Component
// ============================================================================

const SortDropdown: React.FC<{
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}> = ({ sortBy, sortOrder, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'total', label: 'Quote Value' },
    { value: 'quote_number', label: 'Quote Number' },
    { value: 'status', label: 'Status' },
    { value: 'title', label: 'Title' },
  ];

  const currentLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Sort';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:border-slate-600 transition-all"
      >
        {sortOrder === 'asc' ? <BarsArrowUpIcon className="w-4 h-4" /> : <BarsArrowDownIcon className="w-4 h-4" />}
        <span className="text-sm">{currentLabel}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value, sortOrder);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                    ${sortBy === option.value ? 'bg-slate-800 text-indigo-400' : 'text-slate-300 hover:bg-slate-800/50'}
                  `}
                >
                  {option.label}
                  {sortBy === option.value && <CheckIcon className="w-4 h-4" />}
                </button>
              ))}
            </div>
            
            <div className="border-t border-slate-800 p-1">
              <button
                onClick={() => {
                  onChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
              >
                {sortOrder === 'asc' ? <BarsArrowDownIcon className="w-4 h-4" /> : <BarsArrowUpIcon className="w-4 h-4" />}
                {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ============================================================================
// Main Component
// ============================================================================

export const QuoteSearchFilter: React.FC<QuoteSearchFilterProps> = ({
  filters,
  onFiltersChange,
  totalResults,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      onFiltersChange({ ...filters, searchQuery: value || undefined });
    }, 300);
  }, [filters, onFiltersChange]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    onFiltersChange({
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  }, [filters.sortBy, filters.sortOrder, onFiltersChange]);

  // Filter chips
  const filterChips: FilterChip[] = useMemo(() => {
    const chips: FilterChip[] = [];
    
    if (filters.status?.length) {
      chips.push({
        key: 'status',
        label: `${filters.status.length} status${filters.status.length > 1 ? 'es' : ''}`,
        onRemove: () => onFiltersChange({ ...filters, status: undefined }),
      });
    }
    
    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom?.toLocaleDateString();
      const to = filters.dateTo?.toLocaleDateString();
      chips.push({
        key: 'date',
        label: from && to ? `${from} - ${to}` : from || to || 'Date range',
        onRemove: () => onFiltersChange({ ...filters, dateFrom: undefined, dateTo: undefined }),
      });
    }
    
    if (filters.minValue !== undefined || filters.maxValue !== undefined) {
      const min = filters.minValue !== undefined ? `$${filters.minValue.toLocaleString()}` : '$0';
      const max = filters.maxValue !== undefined ? `$${filters.maxValue.toLocaleString()}` : '∞';
      chips.push({
        key: 'value',
        label: `${min} - ${max}`,
        onRemove: () => onFiltersChange({ ...filters, minValue: undefined, maxValue: undefined }),
      });
    }
    
    return chips;
  }, [filters, onFiltersChange]);

  const hasActiveFilters = filterChips.length > 0 || searchQuery;

  return (
    <div className="space-y-3">
      {/* Search and Main Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search quotes by number, title, or customer..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <StatusFilter
            selected={filters.status || []}
            onChange={(statuses) => onFiltersChange({ ...filters, status: statuses })}
          />
          
          <DateRangeFilter
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onChange={(from, to) => onFiltersChange({ ...filters, dateFrom: from, dateTo: to })}
          />
          
          <ValueRangeFilter
            minValue={filters.minValue}
            maxValue={filters.maxValue}
            onChange={(min, max) => onFiltersChange({ ...filters, minValue: min, maxValue: max })}
          />
          
          <div className="w-px h-6 bg-slate-700 mx-1" />
          
          <SortDropdown
            sortBy={filters.sortBy || 'created_at'}
            sortOrder={filters.sortOrder || 'desc'}
            onChange={(sortBy, sortOrder) => onFiltersChange({ ...filters, sortBy, sortOrder })}
          />
          
          <button
            onClick={() => onFiltersChange({ ...filters })}
            disabled={isLoading}
            className="p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <AnimatePresence>
        {(hasActiveFilters || totalResults !== undefined) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <AnimatePresence mode="popLayout">
                {filterChips.map((chip) => (
                  <motion.span
                    key={chip.key}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-sm border border-indigo-500/20"
                  >
                    {chip.label}
                    <button
                      onClick={chip.onRemove}
                      className="p-0.5 hover:bg-indigo-500/20 rounded-full transition-colors"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              
              {filterChips.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {totalResults !== undefined && (
              <span className="text-sm text-slate-500">
                {isLoading ? 'Loading...' : `${totalResults.toLocaleString()} result${totalResults !== 1 ? 's' : ''}`}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuoteSearchFilter;
