/**
 * Customer Filters Component
 * Advanced filtering panel for customers
 * @module components/customers/CustomerFilters
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  FunnelIcon,
  CalendarIcon,
  HashtagIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { CustomerFilter, CustomerStatus } from '@/types/quote';
import { CustomerStatusLabels, CustomerStatusColors } from '@/types/quote';

interface CustomerFiltersProps {
  filters: CustomerFilter;
  onFilterChange: (filters: CustomerFilter) => void;
  availableTags: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  filters,
  onFilterChange,
  availableTags,
  isOpen,
  onClose,
}) => {
  const handleClearFilters = () => {
    onFilterChange({
      sortBy: 'dateAdded',
      sortOrder: 'desc',
    });
  };

  const handleStatusToggle = (status: CustomerStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    onFilterChange({ ...filters, status: newStatuses });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const hasActiveFilters =
    filters.status?.length ||
    filters.tags?.length ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.minQuotes !== undefined ||
    filters.maxQuotes !== undefined ||
    filters.minRevenue !== undefined ||
    filters.maxRevenue !== undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-800 border-l border-slate-700 z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FunnelIcon className="w-6 h-6 text-slate-400" />
                  <h2 className="text-xl font-semibold text-slate-100">Filters</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Clear all filters
                </button>
              )}
            </div>

            <div className="p-6 space-y-8">
              {/* Status Filter */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">Status</h3>
                <div className="space-y-2">
                  {(['active', 'inactive', 'archived'] as CustomerStatus[]).map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(status) || false}
                        onChange={() => handleStatusToggle(status)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500"
                      />
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border',
                          CustomerStatusColors[status]
                        )}
                      >
                        {CustomerStatusLabels[status]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={cn(
                          'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
                          filters.tags?.includes(tag)
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Range Filter */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">Date Added</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">From</label>
                    <input
                      type="date"
                      value={filters.dateFrom ? new Date(filters.dateFrom).toISOString().split('T')[0] : ''}
                      onChange={(e) =>
                        onFilterChange({
                          ...filters,
                          dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">To</label>
                    <input
                      type="date"
                      value={filters.dateTo ? new Date(filters.dateTo).toISOString().split('T')[0] : ''}
                      onChange={(e) =>
                        onFilterChange({
                          ...filters,
                          dateTo: e.target.value ? new Date(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Quote Count Filter */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">Quote Count</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    label="Min"
                    placeholder="0"
                    value={filters.minQuotes?.toString() || ''}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        minQuotes: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      })
                    }
                  />
                  <Input
                    type="number"
                    label="Max"
                    placeholder="∞"
                    value={filters.maxQuotes?.toString() || ''}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        maxQuotes: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              {/* Revenue Filter */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">Total Revenue</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    label="Min $"
                    placeholder="0"
                    value={filters.minRevenue?.toString() || ''}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        minRevenue: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                  />
                  <Input
                    type="number"
                    label="Max $"
                    placeholder="∞"
                    value={filters.maxRevenue?.toString() || ''}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        maxRevenue: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6">
              <Button onClick={onClose} className="w-full">
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomerFilters;
