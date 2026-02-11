/**
 * Date Range Selector Component
 * Provides preset and custom date range selection for analytics
 * @module components/analytics/DateRangeSelector
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DateRangePreset[];
  className?: string;
}

export interface DateRangePreset {
  label: string;
  getValue: () => DateRange;
}

// ============================================================================
// Default Presets
// ============================================================================

const defaultPresets: DateRangePreset[] = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date();
      return {
        start: today,
        end: today,
        label: 'Today',
      };
    },
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        start: yesterday,
        end: yesterday,
        label: 'Yesterday',
      };
    },
  },
  {
    label: 'Last 7 days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return {
        start,
        end,
        label: 'Last 7 days',
      };
    },
  },
  {
    label: 'Last 30 days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return {
        start,
        end,
        label: 'Last 30 days',
      };
    },
  },
  {
    label: 'This month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start,
        end: now,
        label: 'This month',
      };
    },
  },
  {
    label: 'Last month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        start,
        end,
        label: 'Last month',
      };
    },
  },
  {
    label: 'Last 90 days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      return {
        start,
        end,
        label: 'Last 90 days',
      };
    },
  },
  {
    label: 'This year',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return {
        start,
        end: now,
        label: 'This year',
      };
    },
  },
  {
    label: 'Last year',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31);
      return {
        start,
        end,
        label: 'Last year',
      };
    },
  },
];

// ============================================================================
// Component
// ============================================================================

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  presets = defaultPresets,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState<string>(value.start.toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState<string>(value.end.toISOString().split('T')[0]);

  const handlePresetSelect = useCallback((preset: DateRangePreset) => {
    onChange(preset.getValue());
    setIsOpen(false);
    setIsCustomOpen(false);
  }, [onChange]);

  const handleCustomApply = useCallback(() => {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
    
    onChange({
      start,
      end,
      label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
    });
    setIsOpen(false);
    setIsCustomOpen(false);
  }, [customStart, customEnd, onChange]);

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span className="text-slate-200">{value.label}</span>
        </div>
        <ChevronDownIcon
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">
                  Presets
                </p>
                <div className="space-y-1">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetSelect(preset)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        value.label === preset.label
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'text-slate-300 hover:bg-slate-800'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <hr className="my-2 border-slate-800" />

                <button
                  onClick={() => setIsCustomOpen(!isCustomOpen)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    isCustomOpen
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-slate-300 hover:bg-slate-800'
                  )}
                >
                  Custom Range
                </button>

                <AnimatePresence>
                  {isCustomOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 space-y-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">End Date</label>
                          <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={handleCustomApply}
                          className="w-full"
                        >
                          Apply
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-slate-950 px-4 py-3 border-t border-slate-800">
                <p className="text-xs text-slate-500">
                  {formatDisplayDate(value.start)} - {formatDisplayDate(value.end)}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateRangeSelector;
