/**
 * Empty State Component
 * Reusable empty state for analytics components
 * @module components/analytics/EmptyState
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'inline';
}

// ============================================================================
// Main Component
// ============================================================================

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
  variant = 'default',
}: EmptyStateProps) {
  // Size configurations
  const sizeConfigs = {
    sm: {
      container: 'py-8',
      iconWrapper: 'w-12 h-12 rounded-xl',
      icon: 'w-6 h-6',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      iconWrapper: 'w-16 h-16 rounded-2xl',
      icon: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      iconWrapper: 'w-20 h-20 rounded-2xl',
      icon: 'w-10 h-10',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  // Variant configurations
  const variantConfigs = {
    default: 'flex flex-col items-center justify-center text-center',
    compact: 'flex flex-col items-center justify-center text-center px-4',
    inline: 'flex items-center gap-4 text-left px-4',
  };

  const config = sizeConfigs[size];
  const containerClass = variantConfigs[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(containerClass, config.container, className)}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className={cn(
            'bg-slate-800 flex items-center justify-center mb-4',
            config.iconWrapper,
            variant === 'inline' && 'mb-0'
          )}
        >
          <Icon className={cn('text-slate-500', config.icon)} aria-hidden="true" />
        </motion.div>
      )}

      {/* Content */}
      <div className={cn(variant === 'inline' && 'flex-1')}>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={cn('font-semibold text-slate-200', config.title)}
        >
          {title}
        </motion.h3>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn('text-slate-500 mt-1 max-w-sm', config.description)}
          >
            {description}
          </motion.p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={cn(
              'flex items-center gap-3 mt-4',
              variant === 'default' && 'flex-col sm:flex-row'
            )}
          >
            {action && (
              <button
                onClick={action.onClick}
                className={cn(
                  'flex items-center gap-2 px-4 py-2',
                  'bg-indigo-600 hover:bg-indigo-500 text-white',
                  'text-sm font-medium rounded-lg',
                  'transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900'
                )}
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </button>
            )}

            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className={cn(
                  'px-4 py-2 text-slate-400 hover:text-slate-300',
                  'text-sm font-medium',
                  'transition-colors focus:outline-none'
                )}
              >
                {secondaryAction.label}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Specialized empty state for no data
 */
export function NoDataEmptyState({
  title = 'No data available',
  description = 'There is no data for the selected period.',
  className,
  size = 'md',
  icon,
  action,
}: Partial<EmptyStateProps> & { icon?: React.ElementType }) {
  const NoDataIcon = icon || (({ className }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ));

  return (
    <EmptyState
      icon={NoDataIcon}
      title={title}
      description={description}
      className={className}
      size={size}
      action={action}
    />
  );
}

/**
 * Specialized empty state for error states
 */
export function ErrorEmptyState({
  title = 'Failed to load data',
  description = 'An error occurred while loading the data. Please try again.',
  onRetry,
  className,
  size = 'md',
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const ErrorIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );

  return (
    <EmptyState
      icon={ErrorIcon}
      title={title}
      description={description}
      className={className}
      size={size}
      action={
        onRetry
          ? {
              label: 'Try Again',
              onClick: onRetry,
            }
          : undefined
      }
    />
  );
}

export default EmptyState;
