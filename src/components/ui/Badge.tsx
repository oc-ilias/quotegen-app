/**
 * Badge Component
 * Status badges and labels with various styles
 * @module components/ui/Badge
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { QuoteStatus, QuoteStatusColors, QuoteStatusLabels } from '@/types/quote';

// ============================================================================
// Badge Props
// ============================================================================

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

// ============================================================================
// Base Badge Component
// ============================================================================

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-slate-800 text-slate-300 border-slate-700',
      primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      error: 'bg-red-500/10 text-red-400 border-red-500/20',
      info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium border rounded-full',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              variant === 'success' && 'bg-emerald-500',
              variant === 'warning' && 'bg-amber-500',
              variant === 'error' && 'bg-red-500',
              variant === 'info' && 'bg-blue-500',
              variant === 'primary' && 'bg-indigo-500',
              variant === 'default' && 'bg-slate-500'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// ============================================================================
// Status Badge Component
// ============================================================================

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: QuoteStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, size = 'md', className, ...props }, ref) => {
    const isQuoteStatus = Object.values(QuoteStatus).includes(status as QuoteStatus);
    
    const statusClass = isQuoteStatus 
      ? QuoteStatusColors[status as QuoteStatus]
      : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    
    const label = isQuoteStatus 
      ? QuoteStatusLabels[status as QuoteStatus]
      : status;

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium border rounded-full',
          statusClass,
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === QuoteStatus.ACCEPTED && 'bg-emerald-500',
          status === QuoteStatus.REJECTED && 'bg-red-500',
          status === QuoteStatus.PENDING && 'bg-amber-500',
          status === QuoteStatus.SENT && 'bg-indigo-500',
          status === QuoteStatus.VIEWED && 'bg-purple-500',
          status === QuoteStatus.DRAFT && 'bg-slate-500',
          status === QuoteStatus.EXPIRED && 'bg-gray-500',
          status === QuoteStatus.CONVERTED && 'bg-blue-500',
        )} />
        {label}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// ============================================================================
// Priority Badge Component
// ============================================================================

interface PriorityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge = React.forwardRef<HTMLSpanElement, PriorityBadgeProps>(
  ({ priority, size = 'md', className, ...props }, ref) => {
    const priorityClasses = {
      low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const priorityLabels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium border rounded-full',
          priorityClasses[priority],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          priority === 'low' && 'bg-slate-500',
          priority === 'medium' && 'bg-blue-500',
          priority === 'high' && 'bg-amber-500',
          priority === 'urgent' && 'bg-red-500'
        )} />
        {priorityLabels[priority]}
      </span>
    );
  }
);

PriorityBadge.displayName = 'PriorityBadge';

export default Badge;
