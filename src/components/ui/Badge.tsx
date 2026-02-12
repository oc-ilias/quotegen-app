/**
 * Badge Component
 * Status badges and labels with various styles and animations
 * @module components/ui/Badge
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { QuoteStatus } from '@/types/quote';
import { QuoteStatusColors, QuoteStatusLabels } from '@/types/quote';

// ============================================================================
// Enhanced Status Type Definition
// ============================================================================

/**
 * Extended quote status values including additional states
 */
export type ExtendedQuoteStatus = 
  | QuoteStatus 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'accepted' 
  | 'declined' 
  | 'expired';

/**
 * Status animation configuration
 */
interface StatusAnimation {
  initial: { scale?: number; opacity?: number };
  animate: { scale?: number; opacity?: number };
  transition: { duration?: number; ease?: [number, number, number, number] };
}

// ============================================================================
// Badge Props
// ============================================================================

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  /** Enable animation on mount */
  animate?: boolean;
}

// ============================================================================
// Status Badge Props
// ============================================================================

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: ExtendedQuoteStatus | string;
  size?: 'sm' | 'md' | 'lg';
  /** Enable animation on status change */
  animateOnChange?: boolean;
  /** Pulse animation for active states */
  pulse?: boolean;
}

// ============================================================================
// Priority Badge Props
// ============================================================================

interface PriorityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
  animateOnChange?: boolean;
}

// ============================================================================
// Animation Variants
// ============================================================================

const badgeAnimationVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

const statusChangeAnimation: StatusAnimation = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [1, 0.8, 1],
};

// ============================================================================
// Extended Status Colors (including declined)
// ============================================================================

const ExtendedStatusColors: Record<string, string> = {
  ...QuoteStatusColors,
  declined: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const ExtendedStatusLabels: Record<string, string> = {
  ...QuoteStatusLabels,
  declined: 'Declined',
};

// ============================================================================
// Status Dot Colors
// ============================================================================

const getStatusDotColor = (status: string): string => {
  const colors: Record<string, string> = {
    [QuoteStatus.ACCEPTED]: 'bg-emerald-500',
    [QuoteStatus.REJECTED]: 'bg-red-500',
    [QuoteStatus.PENDING]: 'bg-amber-500',
    [QuoteStatus.SENT]: 'bg-indigo-500',
    [QuoteStatus.VIEWED]: 'bg-purple-500',
    [QuoteStatus.DRAFT]: 'bg-slate-500',
    [QuoteStatus.EXPIRED]: 'bg-gray-500',
    [QuoteStatus.CONVERTED]: 'bg-blue-500',
    declined: 'bg-red-500',
  };
  
  return colors[status] || 'bg-slate-500';
};

// ============================================================================
// Base Badge Component
// ============================================================================

/**
 * Base Badge Component
 * 
 * @example
 * ```tsx
 * <Badge variant="success" size="md" dot>Success</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, animate = false, children, ...props }, ref) => {
    const variantClasses: Record<string, string> = {
      default: 'bg-slate-800 text-slate-300 border-slate-700',
      primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      error: 'bg-red-500/10 text-red-400 border-red-500/20',
      info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      custom: '',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    const content = (
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

    if (animate) {
      return (
        <motion.span
          initial={badgeAnimationVariants.initial}
          animate={badgeAnimationVariants.animate}
          exit={badgeAnimationVariants.exit}
          transition={{ duration: 0.2 }}
        >
          {content}
        </motion.span>
      );
    }

    return content;
  }
);

Badge.displayName = 'Badge';

// ============================================================================
// Animated Status Badge Component
// ============================================================================

/**
 * Status Badge Component with Animation Support
 * 
 * Displays a quote status with color coding and optional animations.
 * Supports all QuoteStatus values plus 'declined' for backward compatibility.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <StatusBadge status={QuoteStatus.ACCEPTED} />
 * 
 * // With animation on status change
 * <StatusBadge 
 *   status={quote.status} 
 *   animateOnChange={true}
 *   pulse={quote.status === QuoteStatus.PENDING}
 * />
 * ```
 */
export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, size = 'md', animateOnChange = false, pulse = false, className, ...props }, ref) => {
    const [displayStatus, setDisplayStatus] = useState(status);
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle status change animation
    useEffect(() => {
      if (animateOnChange && status !== displayStatus) {
        setIsAnimating(true);
        const timer = setTimeout(() => {
          setDisplayStatus(status);
          setIsAnimating(false);
        }, 150);
        return () => clearTimeout(timer);
      } else {
        setDisplayStatus(status);
      }
    }, [status, displayStatus, animateOnChange]);

    const isQuoteStatus = Object.values(QuoteStatus).includes(displayStatus as QuoteStatus);
    const isExtendedStatus = Object.keys(ExtendedStatusColors).includes(displayStatus);
    
    const statusClass = isQuoteStatus || isExtendedStatus
      ? ExtendedStatusColors[displayStatus]
      : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    
    const label = isQuoteStatus || isExtendedStatus
      ? ExtendedStatusLabels[displayStatus] || displayStatus
      : displayStatus;

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    const badgeContent = (
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
        <motion.span
          className={cn('w-1.5 h-1.5 rounded-full', getStatusDotColor(displayStatus))}
          animate={pulse ? pulseAnimation : undefined}
          transition={pulse ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
        />
        <span className={cn(animateOnChange && isAnimating && 'opacity-0')}>
          {label}
        </span>
      </span>
    );

    if (animateOnChange) {
      return (
        <AnimatePresence mode="wait">
          <motion.span
            key={displayStatus}
            initial={statusChangeAnimation.initial}
            animate={statusChangeAnimation.animate}
            exit={statusChangeAnimation.initial}
            transition={statusChangeAnimation.transition}
          >
            {badgeContent}
          </motion.span>
        </AnimatePresence>
      );
    }

    return badgeContent;
  }
);

StatusBadge.displayName = 'StatusBadge';

// ============================================================================
// Priority Badge Component
// ============================================================================

/**
 * Priority Badge Component
 * 
 * @example
 * ```tsx
 * <PriorityBadge priority="high" />
 * <PriorityBadge priority="urgent" animateOnChange={true} />
 * ```
 */
export const PriorityBadge = React.forwardRef<HTMLSpanElement, PriorityBadgeProps>(
  ({ priority, size = 'md', animateOnChange = false, className, ...props }, ref) => {
    const [displayPriority, setDisplayPriority] = useState(priority);

    useEffect(() => {
      setDisplayPriority(priority);
    }, [priority]);

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

    const dotColors = {
      low: 'bg-slate-500',
      medium: 'bg-blue-500',
      high: 'bg-amber-500',
      urgent: 'bg-red-500',
    };

    const badgeContent = (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium border rounded-full',
          priorityClasses[displayPriority],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[displayPriority])} />
        {priorityLabels[displayPriority]}
      </span>
    );

    if (animateOnChange) {
      return (
        <AnimatePresence mode="wait">
          <motion.span
            key={displayPriority}
            initial={statusChangeAnimation.initial}
            animate={statusChangeAnimation.animate}
            exit={statusChangeAnimation.initial}
            transition={statusChangeAnimation.transition}
          >
            {badgeContent}
          </motion.span>
        </AnimatePresence>
      );
    }

    return badgeContent;
  }
);

PriorityBadge.displayName = 'PriorityBadge';

export default Badge;
