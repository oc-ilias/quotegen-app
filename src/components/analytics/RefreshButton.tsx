/**
 * Refresh Button Component
 * Real-time data refresh with auto-refresh capability
 * @module components/analytics/RefreshButton
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ArrowPathIcon,
  CheckIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

export type AutoRefreshInterval = 'off' | '30s' | '60s' | '5m' | '15m';

export interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  autoRefresh?: boolean;
  defaultInterval?: AutoRefreshInterval;
  onAutoRefreshChange?: (interval: AutoRefreshInterval, enabled: boolean) => void;
  lastUpdated?: Date;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'minimal';
  showTimestamp?: boolean;
  showAutoRefresh?: boolean;
}

interface RefreshOption {
  value: AutoRefreshInterval;
  label: string;
  seconds: number;
}

// ============================================================================
// Constants
// ============================================================================

const REFRESH_INTERVALS: RefreshOption[] = [
  { value: 'off', label: 'Off', seconds: 0 },
  { value: '30s', label: '30 seconds', seconds: 30 },
  { value: '60s', label: '1 minute', seconds: 60 },
  { value: '5m', label: '5 minutes', seconds: 300 },
  { value: '15m', label: '15 minutes', seconds: 900 },
];

const INTERVAL_MS: Record<AutoRefreshInterval, number> = {
  off: 0,
  '30s': 30000,
  '60s': 60000,
  '5m': 300000,
  '15m': 900000,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format time elapsed since last update
 */
function formatTimeElapsed(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Format countdown for next refresh
 */
function formatCountdown(secondsRemaining: number): string {
  if (secondsRemaining < 60) {
    return `${secondsRemaining}s`;
  }
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

// ============================================================================
// Main Component
// ============================================================================

export function RefreshButton({
  onRefresh,
  disabled = false,
  className,
  autoRefresh: controlledAutoRefresh,
  defaultInterval = 'off',
  onAutoRefreshChange,
  lastUpdated,
  size = 'md',
  variant = 'default',
  showTimestamp = true,
  showAutoRefresh = true,
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<AutoRefreshInterval>(defaultInterval);
  const [timeElapsed, setTimeElapsed] = useState('');
  const [countdown, setCountdown] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<Date | null>(lastUpdated || null);

  const isAutoRefreshEnabled = controlledAutoRefresh ?? autoRefreshInterval !== 'off';

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

  // Update time elapsed display
  useEffect(() => {
    if (!lastUpdated && !lastRefreshRef.current) return;

    const updateElapsed = () => {
      const ref = lastUpdated || lastRefreshRef.current;
      if (ref) {
        setTimeElapsed(formatTimeElapsed(ref));
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 5000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Auto-refresh logic
  useEffect(() => {
    // Clear existing timers
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    if (autoRefreshInterval === 'off') {
      setCountdown(0);
      return;
    }

    const intervalMs = INTERVAL_MS[autoRefreshInterval];
    let remaining = Math.floor(intervalMs / 1000);

    setCountdown(remaining);

    // Countdown timer
    countdownTimerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);

      if (remaining <= 0) {
        remaining = Math.floor(intervalMs / 1000);
      }
    }, 1000);

    // Refresh timer
    refreshTimerRef.current = setInterval(() => {
      handleRefresh(true);
    }, intervalMs);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [autoRefreshInterval]);

  const handleRefresh = useCallback(
    async (isAuto = false) => {
      if (isRefreshing) return;

      setIsRefreshing(true);

      try {
        await onRefresh();
        lastRefreshRef.current = new Date();
        if (!isAuto) {
          setJustRefreshed(true);
          setTimeout(() => setJustRefreshed(false), 2000);
        }
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [isRefreshing, onRefresh]
  );

  const handleIntervalChange = useCallback(
    (interval: AutoRefreshInterval) => {
      setAutoRefreshInterval(interval);
      setIsOpen(false);
      onAutoRefreshChange?.(interval, interval !== 'off');
    },
    [onAutoRefreshChange]
  );

  // Size variants
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2.5',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Variant styles
  const variantClasses = {
    default: cn(
      'border bg-slate-900/50',
      'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300 hover:bg-slate-800'
    ),
    ghost: 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50',
    minimal: 'text-slate-400 hover:text-slate-300',
  };

  const currentInterval = REFRESH_INTERVALS.find((i) => i.value === autoRefreshInterval);

  return (
    <div ref={containerRef} className={cn('relative flex items-center gap-2', className)}>
      {/* Main Refresh Button */}
      <motion.button
        whileHover={{ scale: disabled || isRefreshing ? 1 : 1.05 }}
        whileTap={{ scale: disabled || isRefreshing ? 1 : 0.95 }}
        onClick={() => handleRefresh(false)}
        disabled={disabled || isRefreshing}
        title={justRefreshed ? 'Refreshed!' : isRefreshing ? 'Refreshing...' : 'Refresh data'}
        className={cn(
          'rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950',
          sizeClasses[size],
          variantClasses[variant],
          disabled && 'opacity-50 cursor-not-allowed',
          justRefreshed && 'text-emerald-400'
        )}
        aria-label="Refresh data"
      >
        <motion.div
          animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        >
          {justRefreshed ? (
            <CheckIcon className={iconSizes[size]} />
          ) : (
            <ArrowPathIcon className={iconSizes[size]} />
          )}
        </motion.div>
      </motion.button>

      {/* Timestamp */}
      {showTimestamp && lastUpdated && (
        <span className="text-xs text-slate-500 hidden sm:inline">
          Updated {timeElapsed}
        </span>
      )}

      {/* Auto-refresh Controls */}
      {showAutoRefresh && (
        <>
          {/* Divider */}
          {variant !== 'minimal' && <div className="w-px h-6 bg-slate-700 mx-1" />}

          {/* Auto-refresh Toggle */}
          <motion.button
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 rounded-lg transition-colors',
              size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-1.5',
              autoRefreshInterval !== 'off'
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/50'
            )}
            aria-label="Configure auto-refresh"
          >
            {autoRefreshInterval !== 'off' ? (
              <>
                <PlayIcon className={cn(iconSizes[size], 'fill-current')} />
                {countdown > 0 && (
                  <span className="text-xs font-medium tabular-nums">{formatCountdown(countdown)}</span>
                )}
              </>
            ) : (
              <PauseIcon className={iconSizes[size]} />
            )}
            <ChevronDownIcon className={cn('w-3 h-3', isOpen && 'rotate-180')} />
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 sm:hidden"
                  onClick={() => setIsOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-2">
                    <p className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Auto-refresh
                    </p>
                    {REFRESH_INTERVALS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleIntervalChange(option.value)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg transition-colors',
                          autoRefreshInterval === option.value
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'text-slate-300 hover:bg-slate-800'
                        )}
                      >
                        <span>{option.label}</span>
                        {autoRefreshInterval === option.value && option.value !== 'off' && (
                          <ClockIcon className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

/**
 * Hook for managing auto-refresh
 */
export function useAutoRefresh(
  onRefresh: () => Promise<void> | void,
  options?: {
    defaultInterval?: AutoRefreshInterval;
    enabled?: boolean;
  }
) {
  const [interval, setInterval] = useState<AutoRefreshInterval>(options?.defaultInterval || 'off');
  const [isEnabled, setIsEnabled] = useState(options?.enabled ?? false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const handleRefresh = useCallback(async () => {
    await onRefresh();
    setLastRefreshed(new Date());
  }, [onRefresh]);

  const setAutoRefresh = useCallback((newInterval: AutoRefreshInterval) => {
    setInterval(newInterval);
    setIsEnabled(newInterval !== 'off');
  }, []);

  return {
    interval,
    isEnabled,
    lastRefreshed,
    setInterval: setAutoRefresh,
    handleRefresh,
  };
}

export default RefreshButton;
