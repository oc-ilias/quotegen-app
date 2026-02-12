/**
 * Pagination Component
 * Comprehensive pagination with page numbers, ellipsis, and items per page selector
 * @module components/ui/Pagination
 */

import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

// ============================================================================
// Types
// ============================================================================

interface PaginationProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
  /** Number of items per page */
  itemsPerPage: number;
  /** Available options for items per page */
  itemsPerPageOptions?: number[];
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when items per page changes */
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  /** Maximum number of page buttons to show */
  maxVisiblePages?: number;
  /** Additional class names */
  className?: string;
  /** Whether the pagination is loading */
  isLoading?: boolean;
  /** Whether to show the items per page selector */
  showItemsPerPage?: boolean;
  /** Whether to show page info text */
  showPageInfo?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

interface PageButtonProps {
  page: number;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  size: 'sm' | 'md' | 'lg';
}

interface NavigationButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled: boolean;
  size: 'sm' | 'md' | 'lg';
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generates the range of page numbers to display
 * @param currentPage - Current active page
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum number of visible page buttons
 * @returns Array of page numbers and ellipsis markers
 */
function generatePageRange(
  currentPage: number,
  totalPages: number,
  maxVisible: number
): (number | string)[] {
  // If total pages is small, show all
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const halfVisible = Math.floor(maxVisible / 2);
  
  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, currentPage + halfVisible);

  // Adjust if we're near the start
  if (currentPage <= halfVisible + 1) {
    startPage = 1;
    endPage = maxVisible - 1;
  }
  
  // Adjust if we're near the end
  if (currentPage >= totalPages - halfVisible) {
    startPage = totalPages - maxVisible + 2;
    endPage = totalPages;
  }

  // Always show first page
  pages.push(1);

  // Add ellipsis if needed
  if (startPage > 2) {
    pages.push('start-ellipsis');
  } else if (startPage === 2) {
    pages.push(2);
  }

  // Add middle pages
  for (let i = Math.max(2, startPage + 1); i <= Math.min(totalPages - 1, endPage - 1); i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (endPage < totalPages - 1) {
    pages.push('end-ellipsis');
  } else if (endPage === totalPages - 1) {
    pages.push(totalPages - 1);
  }

  // Always show last page if more than 1
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Calculates the item range being displayed
 * @param currentPage - Current page
 * @param itemsPerPage - Items per page
 * @param totalItems - Total items
 * @returns Object with start and end item numbers
 */
function calculateItemRange(
  currentPage: number,
  itemsPerPage: number,
  totalItems: number
): { start: number; end: number } {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  return { start, end };
}

// ============================================================================
// Navigation Button Component
// ============================================================================

const NavigationButton: React.FC<NavigationButtonProps> = ({
  direction,
  onClick,
  disabled,
  size,
}) => {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
  };

  const icon = direction === 'prev' ? (
    <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ) : (
    <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        sizeClasses[size],
        'rounded-lg border transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900',
        disabled
          ? 'bg-slate-800/50 border-slate-800 text-slate-600 cursor-not-allowed'
          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
      )}
      aria-label={direction === 'prev' ? 'Previous page' : 'Next page'}
      aria-disabled={disabled}
    >
      {icon}
    </motion.button>
  );
};

// ============================================================================
// Page Button Component
// ============================================================================

const PageButton: React.FC<PageButtonProps> = ({
  page,
  isActive,
  onClick,
  disabled,
  size,
}) => {
  const sizeClasses = {
    sm: 'min-w-[28px] h-7 px-2 text-xs',
    md: 'min-w-[36px] h-9 px-3 text-sm',
    lg: 'min-w-[44px] h-11 px-4 text-base',
  };

  return (
    <motion.button
      whileHover={!disabled && !isActive ? { scale: 1.05 } : undefined}
      whileTap={!disabled && !isActive ? { scale: 0.95 } : undefined}
      onClick={onClick}
      disabled={disabled || isActive}
      className={cn(
        sizeClasses[size],
        'rounded-lg border font-medium transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900',
        isActive
          ? 'bg-indigo-500 border-indigo-500 text-white cursor-default'
          : disabled
          ? 'bg-slate-800/50 border-slate-800 text-slate-600 cursor-not-allowed'
          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
      )}
      aria-label={`Page ${page}`}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={disabled || isActive}
    >
      {page}
    </motion.button>
  );
};

// ============================================================================
// Ellipsis Component
// ============================================================================

const Ellipsis: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  return (
    <span
      className={cn(
        sizeClasses[size],
        'flex items-center justify-center text-slate-500 select-none'
      )}
      aria-hidden="true"
    >
      …
    </span>
  );
};

// ============================================================================
// Loading Skeleton Component
// ============================================================================

/**
 * Skeleton loader for Pagination
 */
export const PaginationSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <Skeleton width={120} height={20} />
      <div className="flex items-center gap-2">
        <Skeleton width={size === 'lg' ? 44 : size === 'sm' ? 28 : 36} height={sizeClasses[size]} variant="rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            width={size === 'lg' ? 44 : size === 'sm' ? 28 : 36}
            height={sizeClasses[size]}
            variant="rounded"
          />
        ))}
        <Skeleton width={size === 'lg' ? 44 : size === 'sm' ? 28 : 36} height={sizeClasses[size]} variant="rounded" />
      </div>
      <Skeleton width={100} height={20} />
    </div>
  );
};

// ============================================================================
// Main Pagination Component
// ============================================================================

/**
 * Pagination Component
 * 
 * Provides comprehensive pagination functionality:
 * - Page numbers with intelligent ellipsis
 * - Previous/Next navigation buttons
 * - Items per page selector
 * - Page information display
 * - Keyboard navigation support
 * 
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   totalItems={95}
 *   itemsPerPage={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   onItemsPerPageChange={(perPage) => setItemsPerPage(perPage)}
 *   maxVisiblePages={7}
 * />
 * ```
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemsPerPageOptions = [10, 25, 50, 100],
  onPageChange,
  onItemsPerPageChange,
  maxVisiblePages = 7,
  className,
  isLoading = false,
  showItemsPerPage = true,
  showPageInfo = true,
  size = 'md',
}) => {
  // ==========================================================================
  // Computed Values
  // ==========================================================================
  
  const pageRange = useMemo(
    () => generatePageRange(currentPage, totalPages, maxVisiblePages),
    [currentPage, totalPages, maxVisiblePages]
  );

  const { start, end } = useMemo(
    () => calculateItemRange(currentPage, itemsPerPage, totalItems),
    [currentPage, itemsPerPage, totalItems]
  );

  // ==========================================================================
  // Event Handlers
  // ==========================================================================
  
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    },
    [currentPage, totalPages, onPageChange]
  );

  const handleItemsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newItemsPerPage = parseInt(event.target.value, 10);
      onItemsPerPageChange?.(newItemsPerPage);
    },
    [onItemsPerPageChange]
  );

  // ==========================================================================
  // Keyboard Navigation
  // ==========================================================================
  
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePageChange(currentPage - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          handlePageChange(currentPage + 1);
          break;
        case 'Home':
          event.preventDefault();
          handlePageChange(1);
          break;
        case 'End':
          event.preventDefault();
          handlePageChange(totalPages);
          break;
      }
    },
    [currentPage, totalPages, handlePageChange]
  );

  // ==========================================================================
  // Render Helpers
  // ==========================================================================
  
  if (isLoading) {
    return <PaginationSkeleton size={size} />;
  }

  if (totalPages <= 1 && totalItems <= itemsPerPageOptions[0]) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4',
        className
      )}
      onKeyDown={handleKeyDown}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Page Info */}
      <AnimatePresence>
        {showPageInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-slate-400"
          >
            Showing <span className="font-medium text-slate-200">{start}</span>
            {' '}to{' '}
            <span className="font-medium text-slate-200">{end}</span>
            {' '}of{' '}
            <span className="font-medium text-slate-200">{totalItems}</span>
            {' '}results
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2" role="group" aria-label="Page navigation">
        {/* Previous Button */}
        <NavigationButton
          direction="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          size={size}
        />

        {/* Page Numbers */}
        <AnimatePresence mode="popLayout">
          {pageRange.map((page, index) => {
            if (page === 'start-ellipsis' || page === 'end-ellipsis') {
              return <Ellipsis key={page} size={size} />;
            }

            const pageNum = page as number;
            return (
              <motion.div
                key={pageNum}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <PageButton
                  page={pageNum}
                  isActive={currentPage === pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={false}
                  size={size}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Next Button */}
        <NavigationButton
          direction="next"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          size={size}
        />
      </div>

      {/* Items Per Page Selector */}
      <AnimatePresence>
        {showItemsPerPage && onItemsPerPageChange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <label htmlFor="items-per-page" className="text-sm text-slate-400">
              Show
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className={cn(
                'rounded-lg border bg-slate-900 text-slate-300',
                'border-slate-700 hover:border-slate-600',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                'transition-all',
                size === 'sm' && 'px-2 py-1 text-xs',
                size === 'md' && 'px-3 py-1.5 text-sm',
                size === 'lg' && 'px-4 py-2 text-base'
              )}
              aria-label="Items per page"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pagination;
