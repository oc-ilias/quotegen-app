/**
 * Empty State Components
 * 
 * Beautiful empty state UIs for when there's no data to display.
 * Encourages users to take action with clear CTAs.
 * 
 * @module components/ui/empty-state
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './Button';

// ============================================================================
// Types
// ============================================================================

export interface EmptyStateProps {
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action label */
  actionLabel?: string;
  /** Primary action handler */
  onAction?: () => void;
  /** Secondary action label */
  secondaryActionLabel?: string;
  /** Secondary action handler */
  onSecondaryAction?: () => void;
  /** Icon or illustration to display */
  icon?: React.ReactNode;
  /** Predefined icon variant */
  variant?: 'default' | 'search' | 'inbox' | 'files' | 'users' | 'chart' | 'notification' | 'folder';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Compact mode (horizontal layout) */
  compact?: boolean;
}

export interface EmptySearchStateProps {
  /** Search query that returned no results */
  query: string;
  /** Suggested search terms */
  suggestions?: string[];
  /** Handler for clearing search */
  onClearSearch: () => void;
  /** Handler for trying a suggestion */
  onTrySuggestion?: (suggestion: string) => void;
  className?: string;
}

export interface EmptyFilterStateProps {
  /** Number of active filters */
  activeFilterCount: number;
  /** Handler for clearing all filters */
  onClearFilters: () => void;
  /** Handler for modifying filters */
  onModifyFilters?: () => void;
  className?: string;
}

// ============================================================================
// Icon Components
// ============================================================================

const iconMap = {
  default: (
    <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="32" className="fill-gray-100 dark:fill-gray-800" />
      <circle cx="40" cy="34" r="12" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" />
      <path d="M24 56C24 48 31 42 40 42C49 42 56 48 56 56" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="32" className="fill-gray-100 dark:fill-gray-800" />
      <circle cx="36" cy="36" r="10" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="3" fill="none" />
      <path d="M44 44L52 52" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  inbox: (
    <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="32" className="fill-gray-100 dark:fill-gray-800" />
      <rect x="24" y="30" width="32" height="24" rx="2" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" />
      <path d="M24 36L36 44H44L56 36" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  files: (
    <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="32" className="fill-gray-100 dark:fill-gray-800" />
      <path d="M28 26C28 24.8954 28.8954 24 30 24H42L52 34V54C52 55.1046 51.1046 56 50 56H30C28.8954 56 28 55.1046 28 54V26Z" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" />
      <path d="M42 24V34H52" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  users: (
    <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="32" className="fill-gray-100 dark:fill-gray-800" />
      <circle cx="34" cy="32" r="5" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" />
      <path d="M26 44C26 40 29 36 34 36C39 36 42 40 42 44" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="48" cy="30" r="4" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" />
      <path d="M42 40C42 37 45 34 48 34C51 34 54 37 54 40" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
  chart: (
    <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="32" className="fill-gray-100 dark:fill-gray-800" />
      <rect x="24" y="48" width="8" height="12" rx="1" className="fill-gray-300 dark:fill-gray-600" />
      <rect x="36" y="36" width="8" height="24" rx="1" className="fill-gray-300 dark:fill-gray-600" />
      <rect x="48" y="28" width="8" height="32" rx="1" className="fill-gray-300 dark:fill-gray-600" />
    </svg>
  ),
  notification: (
    <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="32" className="fill-gray-100 dark:fill-gray-800" />
      <path d="M40 26C34 26 30 30 30 36V44L26 48H54L50 44V36C50 30 46 26 40 26Z" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <path d="M36 52C36 54 38 56 40 56C42 56 44 54 44 52" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
  folder: (
    <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="32" className="fill-gray-100 dark:fill-gray-800" />
      <path d="M24 30C24 28 25 26 27 26H33L36 30H53C55 30 56 32 56 34V50C56 52 55 54 53 54H27C25 54 24 52 24 50V30Z" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" strokeLinejoin="round" />
    </svg>
  ),
};

// ============================================================================
// Components
// ============================================================================

/**
 * Main empty state component with icon and actions
 */
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
  variant = 'default',
  size = 'md',
  className,
  compact = false,
}: EmptyStateProps) {
  const sizeClasses = {
    sm: { container: compact ? 'p-4' : 'p-6', icon: compact ? 'w-12 h-12' : 'w-16 h-16', title: 'text-sm', desc: 'text-xs' },
    md: { container: compact ? 'p-6' : 'p-8', icon: compact ? 'w-16 h-16' : 'w-20 h-20', title: 'text-base', desc: 'text-sm' },
    lg: { container: compact ? 'p-8' : 'p-12', icon: compact ? 'w-20 h-20' : 'w-24 h-24', title: 'text-lg', desc: 'text-base' },
  };

  const classes = sizeClasses[size];

  const content = (
    <>
      <div className={cn('flex-shrink-0', classes.icon)}>
        {icon || iconMap[variant] || iconMap.default}
      </div>
      
      <div className={cn('flex-1', compact && 'text-left')}>
        <h3 className={cn('font-semibold text-gray-900 dark:text-white mb-1', classes.title, !compact && 'text-center')}>
          {title}
        </h3>
        
        {description && (
          <p className={cn('text-gray-600 dark:text-gray-400 mb-4', classes.desc, !compact && 'text-center')}>
            {description}
          </p>
        )}
        
        {(onAction || onSecondaryAction) && (
          <div className={cn('flex gap-3', compact ? 'flex-row' : 'flex-col sm:flex-row justify-center')}>
            {onAction && actionLabel && (
              <Button onClick={onAction} variant="primary" size={size === 'sm' ? 'sm' : 'md'}>
                {actionLabel}
              </Button>
            )}
            {onSecondaryAction && secondaryActionLabel && (
              <Button onClick={onSecondaryAction} variant="ghost" size={size === 'sm' ? 'sm' : 'md'}>
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        classes.container,
        'bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700',
        compact ? 'flex items-center gap-4' : 'flex flex-col items-center text-center',
        className
      )}
    >
      {content}
    </motion.div>
  );
}

/**
 * Empty state for search with no results
 */
export function EmptySearchState({
  query,
  suggestions = [],
  onClearSearch,
  onTrySuggestion,
  className,
}: EmptySearchStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('text-center py-12', className)}
    >
      <div className="w-20 h-20 mx-auto mb-4">
        {iconMap.search}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No results found
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        We couldn&apos;t find anything matching &quot;<span className="font-medium">{query}</span>&quot;
      </p>
      
      {suggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Try searching for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onTrySuggestion?.(suggestion)}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <Button onClick={onClearSearch} variant="ghost">
        Clear search
      </Button>
    </motion.div>
  );
}

/**
 * Empty state when filters return no results
 */
export function EmptyFilterState({
  activeFilterCount,
  onClearFilters,
  onModifyFilters,
  className,
}: EmptyFilterStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700',
        className
      )}
    >
      <div className="w-16 h-16 mx-auto mb-4 opacity-50">
        <svg viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="32" className="fill-gray-200 dark:fill-gray-700" />
          <path d="M26 30L54 30L42 46V56L38 54V46L26 30Z" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" strokeLinejoin="round" />
        </svg>
      </div>
      
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
        No matching results
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {activeFilterCount === 1 
          ? '1 filter is applied. Try adjusting it to see more results.'
          : `${activeFilterCount} filters are applied. Try adjusting them to see more results.`}
      </p>
      
      <div className="flex gap-3 justify-center">
        <Button onClick={onClearFilters} variant="primary" size="sm">
          Clear all filters
        </Button>
        {onModifyFilters && (
          <Button onClick={onModifyFilters} variant="ghost" size="sm">
            Modify filters
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Empty state for lists with CTA to create first item
 */
export function CreateFirstItemState({
  itemName = 'item',
  description,
  onCreate,
  iconVariant = 'default',
  className,
}: {
  itemName?: string;
  description?: string;
  onCreate: () => void;
  iconVariant?: EmptyStateProps['variant'];
  className?: string;
}) {
  return (
    <EmptyState
      title={`No ${itemName}s yet`}
      description={description || `Get started by creating your first ${itemName}.`}
      actionLabel={`Create ${itemName}`}
      onAction={onCreate}
      variant={iconVariant}
      size="md"
      className={className}
    />
  );
}

/**
 * Empty state for notifications
 */
export function EmptyNotificationsState({
  onViewSettings,
  className,
}: {
  onViewSettings?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      title="No notifications"
      description="You're all caught up! We'll notify you when something important happens."
      variant="notification"
      size="sm"
      className={className}
      secondaryActionLabel={onViewSettings ? 'Notification settings' : undefined}
      onSecondaryAction={onViewSettings}
    />
  );
}

/**
 * Empty state for archived/deleted items
 */
export function EmptyArchiveState({
  itemName = 'items',
  onViewActive,
  className,
}: {
  itemName?: string;
  onViewActive?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      title={`No archived ${itemName}`}
      description={`When you archive ${itemName}, they'll appear here.`}
      variant="folder"
      size="md"
      className={className}
      secondaryActionLabel={onViewActive ? 'View active' : undefined}
      onSecondaryAction={onViewActive}
    />
  );
}

// ============================================================================
// Exports
// ============================================================================

export default {
  State: EmptyState,
  Search: EmptySearchState,
  Filter: EmptyFilterState,
  CreateFirst: CreateFirstItemState,
  Notifications: EmptyNotificationsState,
  Archive: EmptyArchiveState,
};
