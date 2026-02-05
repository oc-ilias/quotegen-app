/**
 * Activity Feed Component with Real-time Updates
 * Shows recent activity with icons, timestamps, and WebSocket integration
 * @module components/dashboard/ActivityFeed
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PaperAirplaneIcon,
  UserPlusIcon,
  PencilIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowPathIcon,
  BellIcon,
  WifiIcon,
  SignalSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { ActivityType, ActivityItem } from '@/types/quote';
import { useRealtimeActivity } from '@/hooks/useRealtimeActivity';
import { ConnectionStatus, useWebSocketState } from '@/contexts/WebSocketContext';
import { ActivityFeedFilters, WebSocketState } from '@/types/websocket';

// ============================================================================
// Types
// ============================================================================

export interface ActivityFeedProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
  className?: string;
  showHeader?: boolean;
  showFilters?: boolean;
  enableSound?: boolean;
  enableAnimations?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
}

// ============================================================================
// Activity Type Config
// ============================================================================

const activityConfig: Partial<Record<ActivityType, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}>> = {
  [ActivityType.QUOTE_CREATED]: {
    icon: DocumentTextIcon,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    label: 'created a quote',
  },
  [ActivityType.QUOTE_SENT]: {
    icon: PaperAirplaneIcon,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    label: 'sent a quote',
  },
  [ActivityType.QUOTE_VIEWED]: {
    icon: EyeIcon,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    label: 'viewed a quote',
  },
  [ActivityType.QUOTE_ACCEPTED]: {
    icon: CheckCircleIcon,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    label: 'accepted a quote',
  },
  [ActivityType.QUOTE_REJECTED]: {
    icon: XCircleIcon,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    label: 'declined a quote',
  },
  [ActivityType.QUOTE_EXPIRED]: {
    icon: ClockIcon,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    label: 'quote expired',
  },
  [ActivityType.QUOTE_CONVERTED]: {
    icon: CurrencyDollarIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    label: 'converted to order',
  },
  [ActivityType.CUSTOMER_ADDED]: {
    icon: UserPlusIcon,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    label: 'added as customer',
  },
  [ActivityType.PRODUCT_ADDED]: {
    icon: DocumentTextIcon,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    label: 'added a product',
  },
  [ActivityType.NOTE_ADDED]: {
    icon: PencilIcon,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    label: 'added a note',
  },
  [ActivityType.STATUS_CHANGED]: {
    icon: ArrowPathIcon,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    label: 'changed status',
  },
};

// ============================================================================
// Format Time
// ============================================================================

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}

// ============================================================================
// Activity Item Component
// ============================================================================

interface ActivityItemComponentProps {
  activity: ActivityItem;
  index: number;
  isLast: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

const ActivityItemComponent = ({ activity, index, isLast, isNew, onClick }: ActivityItemComponentProps) => {
  const config = activityConfig[activity.type] || {
    icon: DocumentTextIcon,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
    label: 'performed an action',
  };
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: 'easeOut',
      }}
      onClick={onClick}
      className={cn(
        'relative flex gap-4 cursor-pointer group',
        isNew && 'bg-indigo-500/5 rounded-xl -mx-2 px-2 py-2'
      )}
    >
      {/* New Activity Indicator */}
      {isNew && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -left-1 top-4 w-2 h-2 bg-indigo-500 rounded-full"
        />
      )}

      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-800 group-hover:bg-slate-700 transition-colors" />
      )}

      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.3,
          delay: index * 0.05 + 0.1,
          type: 'spring',
          stiffness: 300,
        }}
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200',
          config.bgColor,
          config.borderColor,
          'group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-500/10'
        )}
      >
        <Icon className={cn('w-5 h-5', config.color)} />
      </motion.div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-300">
              <span className="font-medium text-slate-200 truncate">
                {activity.customer_name}
              </span>
              {' '}
              <span className="text-slate-400">{config.label}</span>
            </p>

            {activity.quote_number && (
              <p className="text-xs text-slate-500 mt-0.5">
                Quote {activity.quote_number}
              </p>
            )}
          </div>

          <span className="text-xs text-slate-600 whitespace-nowrap">
            {formatTime(activity.timestamp)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// Empty State
// ============================================================================

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-8 text-center"
  >
    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
      <ClockIcon className="w-6 h-6 text-slate-600" />
    </div>

    <p className="text-sm text-slate-500">No recent activity</p>
  </motion.div>
);

// ============================================================================
// Skeleton Loader
// ============================================================================

const ActivitySkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-800 animate-pulse" />
        <div className="flex-1 space-y-2 pt-2">
          <div className="h-4 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-24 bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// New Activity Banner
// ============================================================================

interface NewActivityBannerProps {
  count: number;
  onClick: () => void;
  onDismiss: () => void;
}

const NewActivityBanner = ({ count, onClick, onDismiss }: NewActivityBannerProps) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="mb-4"
  >
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors group"
    >
      <div className="flex items-center gap-2">
        <BellIcon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {count} new {count === 1 ? 'activity' : 'activities'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-indigo-200 group-hover:text-white transition-colors">
          Click to view
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </button>
  </motion.div>
);

// ============================================================================
// Filter Dropdown
// ============================================================================

interface FilterDropdownProps {
  filters: ActivityFeedFilters;
  onFilterChange: (filters: ActivityFeedFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterDropdown = ({ filters, onFilterChange, isOpen, onClose }: FilterDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const activityTypes = Object.values(ActivityType);

  const toggleType = (type: ActivityType) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    onFilterChange({ ...filters, types: newTypes });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
    >
      <div className="p-4">
        <h4 className="text-sm font-medium text-slate-200 mb-3">Filter by Type</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {activityTypes.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.types?.includes(type) || false}
                onChange={() => toggleType(type)}
                className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500/20"
              />
              <span className="text-sm text-slate-300 capitalize">{type.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-700 p-4">
        <button
          onClick={() => onFilterChange({})}
          className="w-full text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          Clear all filters
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// Main Activity Feed Component
// ============================================================================

export function ActivityFeed({
  activities: propActivities,
  isLoading: propIsLoading,
  maxItems = 10,
  className,
  showHeader = true,
  showFilters = false,
  enableSound = false,
  enableAnimations = true,
  onActivityClick,
}: ActivityFeedProps) {
  const { state: connectionState, isConnected } = useWebSocketState();
  
  const {
    activities: realtimeActivities,
    isLoading: realtimeIsLoading,
    refresh,
    filters,
    setFilters,
    newActivityCount,
    clearNewActivityCount,
  } = useRealtimeActivity({}, {
    enableSound,
    enableAnimations,
    autoRefresh: !isConnected,
  });

  const [soundEnabled, setSoundEnabled] = useState(enableSound);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dismissedNewCount, setDismissedNewCount] = useState(false);
  const activitiesEndRef = useRef<HTMLDivElement>(null);

  // Use prop activities if provided, otherwise use realtime
  const displayActivities = propActivities || realtimeActivities;
  const isLoading = propIsLoading !== undefined ? propIsLoading : realtimeIsLoading;
  const hasNewActivities = newActivityCount > 0 && !dismissedNewCount;

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleNewActivityClick = useCallback(() => {
    clearNewActivityCount();
    setDismissedNewCount(false);
    activitiesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [clearNewActivityCount]);

  const handleDismissNew = useCallback(() => {
    clearNewActivityCount();
    setDismissedNewCount(true);
  }, [clearNewActivityCount]);

  const handleActivityClick = useCallback((activity: ActivityItem) => {
    onActivityClick?.(activity);
  }, [onActivityClick]);

  const limitedActivities = displayActivities.slice(0, maxItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'bg-slate-900/50 border border-slate-800 rounded-2xl p-6',
        className
      )}
    >
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-slate-200">Activity Feed</h3>
            <ConnectionStatus state={connectionState} showLabel={false} />
          </div>

          <div className="flex items-center gap-1">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                soundEnabled
                  ? 'text-indigo-400 hover:bg-indigo-500/10'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              )}
              title={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? (
                <SpeakerWaveIcon className="w-4 h-4" />
              ) : (
                <SpeakerXMarkIcon className="w-4 h-4" />
              )}
            </button>

            {/* Filter Button */}
            {showFilters && (
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    filters.types?.length
                      ? 'text-indigo-400 hover:bg-indigo-500/10'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  )}
                  title="Filter activities"
                >
                  <FunnelIcon className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showFilterDropdown && (
                    <FilterDropdown
                      filters={filters}
                      onFilterChange={setFilters}
                      isOpen={showFilterDropdown}
                      onClose={() => setShowFilterDropdown(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Refresh Button */}
            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={handleRefresh}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
              aria-label="Refresh"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* New Activity Banner */}
      <AnimatePresence>
        {hasNewActivities && (
          <NewActivityBanner
            count={newActivityCount}
            onClick={handleNewActivityClick}
            onDismiss={handleDismissNew}
          />
        )}
      </AnimatePresence>

      {/* Connection Warning */}
      {!isConnected && connectionState === WebSocketState.DISCONNECTED && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl"
        >
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <SignalSlashIcon className="w-4 h-4" />
            <span>Real-time updates unavailable. Using fallback polling.</span>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="space-y-0">
        {isLoading ? (
          <ActivitySkeleton />
        ) : limitedActivities.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="popLayout">
            {limitedActivities.map((activity, index) => (
              <ActivityItemComponent
                key={activity.id}
                activity={activity}
                index={index}
                isLast={index === limitedActivities.length - 1}
                isNew={index < newActivityCount}
                onClick={() => handleActivityClick(activity)}
              />
            ))}
          </AnimatePresence>
        )}
        <div ref={activitiesEndRef} />
      </div>
    </motion.div>
  );
}

export default ActivityFeed;
