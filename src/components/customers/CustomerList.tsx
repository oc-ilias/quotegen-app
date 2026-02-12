/**
 * Customer List Component
 * Table view of all customers with search, filters, and pagination
 * @module components/customers/CustomerList
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import {
  BuildingOfficeIcon as BuildingOfficeIconSolid,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { useToastHelpers } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { CustomerWithStats, CustomerFilter, CustomerStatus } from '@/types/quote';
import { CustomerStatusLabels, CustomerStatusColors } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface CustomerListProps {
  customers: CustomerWithStats[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: CustomerFilter;
  onFilterChange: (filters: CustomerFilter) => void;
  onPageChange: (page: number) => void;
  onViewCustomer: (id: string) => void;
  onEditCustomer: (customer: CustomerWithStats) => void;
  onDeleteCustomer: (customer: CustomerWithStats) => void;
  availableTags?: string[];
}

type SortField = 'name' | 'company' | 'dateAdded' | 'totalQuotes' | 'totalRevenue' | 'lastActivity';

// ============================================================================
// Component
// ============================================================================

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  isLoading,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onViewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  availableTags = [],
}) => {
  const { info } = useToastHelpers();
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    // Debounce the filter change
    const timeoutId = setTimeout(() => {
      onFilterChange({ ...filters, searchQuery: value });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters, onFilterChange]);

  const handleSort = (field: SortField) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFilterChange({ ...filters, sortBy: field, sortOrder: newOrder });
  };

  const handleStatusFilter = (status: CustomerStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    onFilterChange({ ...filters, status: newStatuses });
  };

  const handleTagFilter = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFilterChange({
      sortBy: 'dateAdded',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = 
    filters.status?.length || 
    filters.tags?.length || 
    filters.searchQuery ||
    filters.minQuotes !== undefined ||
    filters.maxQuotes !== undefined ||
    filters.minRevenue !== undefined ||
    filters.maxRevenue !== undefined;

  const renderSortIcon = (field: SortField) => {
    if (filters.sortBy !== field) {
      return <ArrowsUpDownIcon className="w-4 h-4 text-slate-500" />;
    }
    return (
      <motion.span
        animate={{ rotate: filters.sortOrder === 'asc' ? 0 : 180 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronLeftIcon className="w-4 h-4 text-indigo-400 rotate-90" />
      </motion.span>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return <TableSkeleton rows={5} columns={6} />;
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search customers by name, company, or email..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-150"
          />
        </div>

        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && 'ring-2 ring-indigo-500/50')}
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-1.5 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
              {(filters.status?.length || 0) + (filters.tags?.length || 0) + (filters.searchQuery ? 1 : 0)}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      <motion.div
        initial={false}
        animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl space-y-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {(['active', 'inactive', 'archived'] as CustomerStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    filters.status?.includes(status)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  )}
                >
                  {CustomerStatusLabels[status]}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full transition-colors',
                      filters.tags?.includes(tag)
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Customers Table */}
      {customers.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
          <InboxIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No customers found</h3>
          <p className="text-slate-500 mb-6">
            {hasActiveFilters 
              ? 'Try adjusting your filters to see more results'
              : 'Get started by creating your first customer'}
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500"
                    />
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-slate-200"
                    >
                      Customer
                      {renderSortIcon('name')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('company')}
                      className="flex items-center gap-1 hover:text-slate-200"
                    >
                      Company
                      {renderSortIcon('company')}
                    </button>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('totalQuotes')}
                      className="flex items-center gap-1 hover:text-slate-200"
                    >
                      Quotes
                      {renderSortIcon('totalQuotes')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('totalRevenue')}
                      className="flex items-center gap-1 hover:text-slate-200"
                    >
                      Revenue
                      {renderSortIcon('totalRevenue')}
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {customers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    className="group cursor-pointer border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                    onClick={() => onViewCustomer(customer.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500"
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          alt={customer.contactName}
                          src={customer.logoUrl}
                          size="md"
                        />
                        <div>
                          <p className="font-medium text-slate-100">{customer.contactName}</p>
                          <p className="text-sm text-slate-500">
                            Added {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BuildingOfficeIconSolid className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-300">{customer.companyName}</span>
                      </div>
                      {customer.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {customer.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-slate-700 text-slate-400 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {customer.tags.length > 2 && (
                            <span className="text-xs text-slate-500">
                              +{customer.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <EnvelopeIcon className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-300 truncate max-w-[150px]">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <PhoneIcon className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-400">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-slate-100 font-medium">{customer.stats.totalQuotes}</div>
                      <div className="text-xs text-slate-500">
                        {customer.stats.acceptedQuotes} accepted
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-slate-100 font-medium">
                        ${customer.stats.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        Avg: ${Math.round(customer.stats.avgQuoteValue).toLocaleString()}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border',
                          CustomerStatusColors[customer.status]
                        )}
                      >
                        {CustomerStatusLabels[customer.status]}
                      </span>
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === customer.id ? null : customer.id)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <EllipsisHorizontalIcon className="w-5 h-5 text-slate-400" />
                        </button>

                        {activeDropdown === customer.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                            <button
                              onClick={() => {
                                onViewCustomer(customer.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 first:rounded-t-lg"
                            >
                              <EyeIcon className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => {
                                onEditCustomer(customer);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                            >
                              <PencilIcon className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                onDeleteCustomer(customer);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 last:rounded-b-lg"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} customers
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={cn(
                        'w-8 h-8 text-sm font-medium rounded-lg transition-colors',
                        pagination.page === pageNum
                          ? 'bg-indigo-500 text-white'
                          : 'text-slate-400 hover:bg-slate-800'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerList;
