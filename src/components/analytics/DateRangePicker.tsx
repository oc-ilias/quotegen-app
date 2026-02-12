/**
 * Date Range Picker Component
 * Comprehensive date range selector with presets and custom range
 * @module components/analytics/DateRangePicker
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { format, subDays, startOfDay, endOfDay, isValid, parseISO } from 'date-fns';

// ============================================================================
// Types
// ============================================================================

export type DateRangePreset = '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
  preset?: DateRangePreset;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  disabled?: boolean;
  className?: string;
  showPresets?: boolean;
  maxDate?: Date;
  minDate?: Date;
  align?: 'left' | 'right';
}

interface DateRangeOption {
  value: DateRangePreset;
  label: string;
  shortcut?: string;
  getRange: () => DateRange;
}

// ============================================================================
// Constants
// ============================================================================

const PRESET_OPTIONS: DateRangeOption[] = [
  {
    value: '24h',
    label: 'Last 24 hours',
    shortcut: '24H',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(new Date()),
      preset: '24h',
    }),
  },
  {
    value: '7d',
    label: 'Last 7 days',
    shortcut: '7D',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 7)),
      to: endOfDay(new Date()),
      preset: '7d',
    }),
  },
  {
    value: '30d',
    label: 'Last 30 days',
    shortcut: '30D',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 30)),
      to: endOfDay(new Date()),
      preset: '30d',
    }),
  },
  {
    value: '90d',
    label: 'Last 90 days',
    shortcut: '90D',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 90)),
      to: endOfDay(new Date()),
      preset: '90d',
    }),
  },
  {
    value: '1y',
    label: 'Last year',
    shortcut: '1Y',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 365)),
      to: endOfDay(new Date()),
      preset: '1y',
    }),
  },
  {
    value: 'custom',
    label: 'Custom range',
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 30)),
      to: endOfDay(new Date()),
      preset: 'custom',
    }),
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format date range for display
 */
function formatDateRange(range: DateRange): string {
  if (range.preset && range.preset !== 'custom') {
    const preset = PRESET_OPTIONS.find((p) => p.value === range.preset);
    if (preset) return preset.label;
  }

  const fromStr = format(range.from, 'MMM d, yyyy');
  const toStr = format(range.to, 'MMM d, yyyy');

  if (fromStr === toStr) {
    return fromStr;
  }

  return `${fromStr} - ${toStr}`;
}

/**
 * Parse date input value
 */
function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

// ============================================================================
// Custom Date Input Component
// ============================================================================

interface DateInputProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  disabled,
}) => {
  const inputId = `date-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-xs font-medium text-slate-400">
        {label}
      </label>
      <input
        id={inputId}
        type="date"
        value={format(value, 'yyyy-MM-dd')}
        min={min ? format(min, 'yyyy-MM-dd') : undefined}
        max={max ? format(max, 'yyyy-MM-dd') : undefined}
        disabled={disabled}
        onChange={(e) => {
          const date = parseDateInput(e.target.value);
          if (date) {
            onChange(label === 'From' ? startOfDay(date) : endOfDay(date));
          }
        }}
        className={cn(
          'w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg',
          'text-sm text-slate-200',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          '[color-scheme:dark]'
        )}
      />
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export function DateRangePicker({
  value,
  onChange,
  disabled = false,
  className,
  showPresets = true,
  maxDate = new Date(),
  minDate,
  align = 'right',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>(
    value?.preset || '30d'
  );
  const [customRange, setCustomRange] = useState<DateRange>(
    value || PRESET_OPTIONS[2].getRange()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync with external value
  useEffect(() => {
    if (value) {
      setCustomRange(value);
      if (value.preset) {
        setSelectedPreset(value.preset);
      }
    }
  }, [value]);

  const handlePresetSelect = useCallback(
    (preset: DateRangeOption) => {
      setSelectedPreset(preset.value);
      const range = preset.getRange();
      setCustomRange(range);
      onChange(range);

      if (preset.value !== 'custom') {
        setIsOpen(false);
      }
    },
    [onChange]
  );

  const handleCustomDateChange = useCallback(
    (field: 'from' | 'to', date: Date) => {
      const newRange = { ...customRange, [field]: date, preset: 'custom' as const };
      setCustomRange(newRange);
      setSelectedPreset('custom');
    },
    [customRange]
  );

  const handleApplyCustom = useCallback(() => {
    onChange(customRange);
    setIsOpen(false);
  }, [customRange, onChange]);

  const displayValue = value || customRange;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
          'border bg-slate-900/50 w-full sm:w-auto justify-between sm:justify-start',
          disabled
            ? 'border-slate-800 text-slate-600 cursor-not-allowed'
            : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
        )}
      >
        <CalendarIcon className="w-4 h-4 text-slate-400" aria-hidden="true" />
        <span className="truncate">{formatDateRange(displayValue)}</span>
        <ChevronDownIcon
          className={cn('w-4 h-4 text-slate-500 transition-transform duration-200', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'fixed sm:absolute z-50 w-[calc(100vw-2rem)] sm:w-80',
                'bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden',
                align === 'right' ? 'right-4 sm:right-0' : 'left-4 sm:left-0',
                'top-20 sm:top-full sm:mt-2'
              )}
              role="listbox"
            >
              {/* Preset Options */}
              {showPresets && (
                <div className="p-2 border-b border-slate-800">
                  {PRESET_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handlePresetSelect(option)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 text-left text-sm rounded-lg transition-colors',
                        selectedPreset === option.value
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'text-slate-300 hover:bg-slate-800'
                      )}
                      role="option"
                      aria-selected={selectedPreset === option.value}
                    >
                      <span>{option.label}</span>
                      {option.shortcut && (
                        <kbd className="px-1.5 py-0.5 text-xs bg-slate-800 text-slate-500 rounded">
                          {option.shortcut}
                        </kbd>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom Date Range */}
              {selectedPreset === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <DateInput
                      label="From"
                      value={customRange.from}
                      onChange={(date) => handleCustomDateChange('from', date)}
                      max={customRange.to}
                      min={minDate}
                    />
                    <DateInput
                      label="To"
                      value={customRange.to}
                      onChange={(date) => handleCustomDateChange('to', date)}
                      min={customRange.from}
                      max={maxDate}
                    />
                  </div>

                  <button
                    onClick={handleApplyCustom}
                    className={cn(
                      'w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500',
                      'text-white text-sm font-medium rounded-lg',
                      'transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900'
                    )}
                  >
                    Apply Range
                  </button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Quick date range presets for simpler use cases
 */
export function QuickDateRangePicker({
  value,
  onChange,
  disabled,
  className,
}: Omit<DateRangePickerProps, 'showPresets' | 'align'>) {
  return (
    <DateRangePicker
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      showPresets
      align="right"
    />
  );
}

export default DateRangePicker;
