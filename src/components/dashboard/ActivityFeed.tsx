/**
 * Activity Feed Component
 * Shows recent activity with icons and timestamps
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
} from '@heroicons/react/24/outline';
import type { ActivityItem } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
  className?: string;
}

// ============================================================================
// Activity Type Config
// ============================================================================

const activityConfig: Record<ActivityItem['type'], {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
}> = {
  quote_created: {
    icon: DocumentTextIcon,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    label: 'created a quote',
  },
  quote_sent: {
    icon: PaperAirplaneIcon,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    label: 'sent a quote',
  },
  quote_viewed: {
    icon: EyeIcon,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    label: 'viewed a quote',
  },
  quote_accepted: {
    icon: CheckCircleIcon,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    label: 'accepted a quote',
  },
  quote_declined: {
    icon: XCircleIcon,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    label: 'declined a quote',
  },
};

// ============================================================================
// Activity Item Component
// ============================================================================

interface ActivityItemProps {
  activity: ActivityItem;
  index: number;
  isLast: boolean;
}

const ActivityItemComponent = ({ activity, index, isLast }: ActivityItemProps) => {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  const formatTime = (timestamp: string) => {
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
        day: 'numeric' 
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: 'easeOut'
      }}
      className="relative flex gap-4"
    >
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-800" />
      )}

      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 0.3, 
          delay: index * 0.05 + 0.1,
          type: 'spring',
          stiffness: 300
        }}
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
          config.bgColor
        )}
      >
        <Icon className={cn('w-5 h-5', config.color)} />
      </motion.div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm text-slate-300">
              <span className="font-medium text-slate-200">
                {activity.customer_name}
              </span>
              {' '}
              {config.label}
            </p>
            
            <p className="text-xs text-slate-500 mt-0.5">
              Quote {activity.quote_number}
            </p>
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
// Main Activity Feed Component
// ============================================================================

export function ActivityFeed({
  activities,
  isLoading = false,
  maxItems = 10,
  className,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

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
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-200">Activity Feed</h3>
        
        <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
          aria-label="Refresh"
        >
          <ArrowPathIcon className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="space-y-0">
        {isLoading ? (
          <ActivitySkeleton />
        ) : activities.length === 0 ? (
          <EmptyState />
        ) : (
          displayActivities.map((activity, index) => (
            <ActivityItemComponent
              key={activity.id}
              activity={activity}
              index={index}
              isLast={index === displayActivities.length - 1}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

export default ActivityFeed;
