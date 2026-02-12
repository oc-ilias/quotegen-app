/**
 * Status History Timeline Component
 * Visual timeline of all status changes for a quote
 * @module components/quotes/StatusHistory
 */

'use client';

import React, { useState } from 'react';
import type { StatusChangeRecord } from '@/lib/quoteWorkflow';
import { QuoteStatus } from '@/types/quote';
import { cn, formatDateTime } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface StatusHistoryProps {
  history: StatusChangeRecord[];
  className?: string;
  maxItems?: number;
  showLoadMore?: boolean;
}

interface TimelineItemProps {
  record: StatusChangeRecord;
  isLast: boolean;
  index: number;
}

// ============================================================================
// Status Configuration
// ============================================================================

const STATUS_ICONS: Record<QuoteStatus, React.FC<{ className?: string }>> = {
  [QuoteStatus.DRAFT]: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  [QuoteStatus.PENDING]: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  [QuoteStatus.SENT]: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  [QuoteStatus.VIEWED]: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  [QuoteStatus.ACCEPTED]: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  [QuoteStatus.REJECTED]: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  [QuoteStatus.EXPIRED]: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  [QuoteStatus.CONVERTED]: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
};

const STATUS_COLORS: Record<QuoteStatus, { bg: string; border: string; text: string; icon: string }> = {
  [QuoteStatus.DRAFT]: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
    icon: 'text-slate-500',
  },
  [QuoteStatus.PENDING]: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: 'text-amber-500',
  },
  [QuoteStatus.SENT]: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    icon: 'text-indigo-500',
  },
  [QuoteStatus.VIEWED]: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    icon: 'text-purple-500',
  },
  [QuoteStatus.ACCEPTED]: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    icon: 'text-emerald-500',
  },
  [QuoteStatus.REJECTED]: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: 'text-red-500',
  },
  [QuoteStatus.EXPIRED]: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    icon: 'text-gray-500',
  },
  [QuoteStatus.CONVERTED]: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: 'text-blue-500',
  },
};

const STATUS_LABELS: Record<QuoteStatus, string> = {
  [QuoteStatus.DRAFT]: 'Draft',
  [QuoteStatus.PENDING]: 'Pending',
  [QuoteStatus.SENT]: 'Sent',
  [QuoteStatus.VIEWED]: 'Viewed',
  [QuoteStatus.ACCEPTED]: 'Accepted',
  [QuoteStatus.REJECTED]: 'Declined',
  [QuoteStatus.EXPIRED]: 'Expired',
  [QuoteStatus.CONVERTED]: 'Converted',
};

// ============================================================================
// Timeline Item Component
// ============================================================================

const TimelineItem: React.FC<TimelineItemProps> = ({ record, isLast, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = STATUS_COLORS[record.toStatus];
  const IconComponent = STATUS_ICONS[record.toStatus];
  
  const formattedDate = formatDateTime(record.changedAt);
  const hasComment = !!record.comment;
  const hasMetadata = record.metadata && Object.keys(record.metadata).length > 0;
  const isExpandable = hasComment || hasMetadata;

  return (
    <div className="relative flex gap-4 group" style={{ animationDelay: `${index * 100}ms` }}>
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-700/50 -translate-x-1/2" />
      )}
      
      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          'border-2 transition-all duration-200',
          colors.bg,
          colors.border,
          colors.icon,
          'group-hover:scale-110'
        )}
      >
        <IconComponent className="w-5 h-5" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 pb-8">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div
            className={cn(
              'px-4 py-3 flex items-center justify-between cursor-pointer',
              'hover:bg-slate-800 transition-colors',
              isExpandable && 'cursor-pointer'
            )}
            onClick={() => isExpandable && setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <span className={cn('font-medium', colors.text)}>
                {STATUS_LABELS[record.toStatus]}
              </span>
              <span className="text-slate-500">→</span>
              <span className="text-slate-400 text-sm">
                from {STATUS_LABELS[record.fromStatus]}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <time className="text-sm text-slate-500" dateTime={record.changedAt}>
                {formattedDate}
              </time>
              {isExpandable && (
                <svg
                  className={cn(
                    'w-4 h-4 text-slate-500 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>          
          </div>
          
          {/* Expanded content */}
          {isExpanded && (
            <div className="px-4 pb-4 border-t border-slate-700/50">
              {hasComment && (
                <div className="pt-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Comment</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{record.comment}</p>
                </div>
              )}
              
              {hasMetadata && (
                <div className={cn('pt-3', hasComment && 'mt-3 border-t border-slate-700/30')}>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Details</p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {Object.entries(record.metadata || {}).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-xs text-slate-500">{key}</dt>
                        <dd className="text-sm text-slate-300">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}
          
          {/* Collapsed summary */}
          {!isExpanded && hasComment && (
            <div className="px-4 pb-3">
              <p className="text-sm text-slate-400 truncate">
                <span className="text-slate-500">Note: </span>
                {record.comment}
              </p>
            </div>
          )}
        </div>
        
        {/* Changed by */}
        <p className="mt-2 text-sm text-slate-500">
          by{' '}
          <span className="text-slate-400">
            {record.changedByName}
          </span>
          {record.changedBy !== 'system' && record.changedBy !== record.changedByName && (
            <span className="text-slate-600"> ({record.changedBy})</span>
          )}
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// Empty State Component
// ============================================================================

const EmptyState: React.FC = () => (
  <div className="text-center py-8">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
      <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="text-slate-400">No status history yet</p>
    <p className="text-sm text-slate-500 mt-1">Status changes will appear here</p>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const StatusHistory: React.FC<StatusHistoryProps> = ({
  history,
  className,
  maxItems = 10,
  showLoadMore = true,
}) => {
  const [displayCount, setDisplayCount] = useState(maxItems);
  
  // Sort history by date (newest first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );
  
  const displayHistory = sortedHistory.slice(0, displayCount);
  const hasMore = sortedHistory.length > displayCount;
  
  if (history.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <div className={cn('space-y-4', className)}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {displayHistory.map((record, index) => (
          <TimelineItem
            key={record.id}
            record={record}
            isLast={index === displayHistory.length - 1 && !hasMore}
            index={index}
          />
        ))}
      </div>
      
      {hasMore && showLoadMore && (
        <button
          onClick={() => setDisplayCount(prev => prev + maxItems)}
          className="w-full py-3 text-sm text-slate-400 hover:text-slate-300 transition-colors border border-dashed border-slate-700 rounded-lg hover:border-slate-600"
        >
          Load more history ({sortedHistory.length - displayCount} remaining)
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Compact Timeline Variant
// ============================================================================

interface CompactStatusHistoryProps {
  history: StatusChangeRecord[];
  className?: string;
  maxItems?: number;
}

export const CompactStatusHistory: React.FC<CompactStatusHistoryProps> = ({
  history,
  className,
  maxItems = 3,
}) => {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );
  
  const displayHistory = sortedHistory.slice(0, maxItems);
  const remaining = sortedHistory.length - maxItems;
  
  if (history.length === 0) {
    return (
      <p className={cn('text-sm text-slate-500', className)}>
        No history available
      </p>
    );
  }
  
  return (
    <div className={cn('space-y-2', className)}>
      {displayHistory.map((record) => {
        const colors = STATUS_COLORS[record.toStatus];
        const IconComponent = STATUS_ICONS[record.toStatus];
        
        return (
          <div
            key={record.id}
            className="flex items-center gap-3 text-sm"
          >
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', colors.bg, colors.icon)}>
              <IconComponent className="w-3 h-3" />
            </div>
            <span className={cn('font-medium', colors.text)}>
              {STATUS_LABELS[record.toStatus]}
            </span>
            <span className="text-slate-500">→</span>
            <span className="text-slate-400">{STATUS_LABELS[record.fromStatus]}</span>
            <span className="text-slate-600">·</span>
            <time className="text-slate-500" dateTime={record.changedAt}>
              {new Date(record.changedAt).toLocaleDateString()}
            </time>
          </div>
        );
      })}
      
      {remaining > 0 && (
        <p className="text-sm text-slate-500 pl-9">
          +{remaining} more changes
        </p>
      )}
    </div>
  );
};

// ============================================================================
// Status Badge Component
// ============================================================================

interface StatusBadgeProps {
  status: QuoteStatus;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
  size = 'md',
}) => {
  const colors = STATUS_COLORS[status];
  const IconComponent = STATUS_ICONS[status];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        colors.bg,
        colors.text,
        className
      )}
    >
      {showIcon && <IconComponent className={iconSizes[size]} />}
      {STATUS_LABELS[status]}
    </span>
  );
};

export default StatusHistory;
