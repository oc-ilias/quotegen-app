/**
 * Table Component (Accessibility Enhanced)
 * Accessible table with proper ARIA attributes for screen readers
 * @module components/ui/Table
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Table Container
// ============================================================================

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  caption?: string;
  className?: string;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, caption, ...props }, ref) => (
    <div
      className="overflow-x-auto rounded-lg border border-slate-700"
      role="region"
      aria-label={caption || 'Data table'}
      tabIndex={0}
    >
      <table
        ref={ref}
        className={cn('w-full text-left', className)}
        {...props}
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  )
);

Table.displayName = 'Table';

// ============================================================================
// Table Header
// ============================================================================

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('bg-slate-800/50', className)}
      {...props}
    >
      {children}
    </thead>
  )
);

TableHeader.displayName = 'TableHeader';

// ============================================================================
// Table Body
// ============================================================================

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('divide-y divide-slate-700', className)}
      {...props}
    >
      {children}
    </tbody>
  )
);

TableBody.displayName = 'TableBody';

// ============================================================================
// Table Row
// ============================================================================

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  isSelected?: boolean;
  isInteractive?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, isSelected, isInteractive, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'transition-colors',
        isInteractive && 'hover:bg-slate-800/30 cursor-pointer',
        isSelected && 'bg-indigo-500/10',
        className
      )}
      aria-selected={isSelected}
      {...props}
    >
      {children}
    </tr>
  )
);

TableRow.displayName = 'TableRow';

// ============================================================================
// Table Head (Column Header)
// ============================================================================

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable, sortDirection, onSort, ...props }, ref) => {
    const content = (
      <>
        {children}
        {sortable && sortDirection && (
          <span className="sr-only">
            , sorted {sortDirection === 'asc' ? 'ascending' : 'descending'}
          </span>
        )}
      </>
    );

    return (
      <th
        ref={ref}
        scope="col"
        className={cn(
          'px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider',
          sortable && 'cursor-pointer select-none hover:text-slate-300',
          className
        )}
        aria-sort={sortable ? (sortDirection || 'none') : undefined}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        {sortable ? (
          <button
            className="flex items-center gap-1 font-semibold"
            tabIndex={0}
          >
            {content}
            {sortable && (
              <span aria-hidden="true" className="inline-flex flex-col">
                <svg
                  className={cn(
                    'w-3 h-3 -mb-0.5',
                    sortDirection === 'asc' ? 'text-indigo-400' : 'text-slate-600'
                  )}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 10l5-5 5 5H5z" />
                </svg>
                <svg
                  className={cn(
                    'w-3 h-3 -mt-0.5',
                    sortDirection === 'desc' ? 'text-indigo-400' : 'text-slate-600'
                  )}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M15 10l-5 5-5-5h10z" />
                </svg>
              </span>
            )}
          </button>
        ) : (
          content
        )}
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

// ============================================================================
// Table Cell
// ============================================================================

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  asHeader?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, asHeader, ...props }, ref) => {
    const Component = asHeader ? 'th' : 'td';

    return (
      <Component
        ref={ref}
        scope={asHeader ? 'row' : undefined}
        className={cn(
          'px-4 py-3 text-sm',
          asHeader ? 'font-medium text-slate-200' : 'text-slate-300',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

TableCell.displayName = 'TableCell';

// ============================================================================
// Table Footer
// ============================================================================

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, children, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn('bg-slate-800/50 font-semibold', className)}
      {...props}
    >
      {children}
    </tfoot>
  )
);

TableFooter.displayName = 'TableFooter';

export default Table;