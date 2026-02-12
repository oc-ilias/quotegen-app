/**
 * Customers List Page
 * Comprehensive customer management with search, filters, and bulk actions
 * @module app/customers/page
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon,
  FunnelIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { Customer } from '@/types/quote';
import { CustomerStatus, CustomerStatusLabels, CustomerStatusColors } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface CustomerWithQuoteCount extends Customer {
  quoteCount: number;
  totalRevenue: number;
}

interface FilterState {
  searchQuery: string;
  status: CustomerStatus[];
  sortBy: 'name' | 'created' | 'revenue' | 'quotes';
  sortOrder: 'asc' | 'desc';
  tags: string[];
}

// ============================================================================
// Mock Data
// ============================================================================

const mockCustomers: CustomerWithQuoteCount[] = [
  {
    id: 'cust_1',
    email: 'john.smith@acmecorp.com',
    companyName: 'Acme Corporation',
    contactName: 'John Smith',
    phone: '+1 (555) 123-4567',
    billingAddress: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    shippingAddress: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    taxId: '12-3456789',
    customerSince: new Date('2023-01-15'),
    tags: ['enterprise', 'priority', 'manufacturing'],
    notes: 'Key enterprise account. Prefers Net 30 payment terms.',
    logoUrl: '',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2026-02-04'),
    status: CustomerStatus.ACTIVE,
    quoteCount: 24,
    totalRevenue: 158000,
  },
  {
    id: 'cust_2',
    email: 'sarah.johnson@globex.com',
    companyName: 'Globex Industries',
    contactName: 'Sarah Johnson',
    phone: '+1 (555) 987-6543',
    billingAddress: {
      street: '456 Commerce Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US',
    },
    shippingAddress: {
      street: '456 Commerce Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US',
    },
    taxId: '98-7654321',
    customerSince: new Date('2023-03-20'),
    tags: ['mid-market', 'wholesale'],
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2026-02-03'),
    status: CustomerStatus.ACTIVE,
    quoteCount: 18,
    totalRevenue: 87500,
  },
  {
    id: 'cust_3',
    email: 'mike.brown@initech.io',
    companyName: 'Initech LLC',
    contactName: 'Michael Brown',
    phone: '+1 (555) 456-7890',
    billingAddress: {
      street: '789 Startup Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
    },
    shippingAddress: {
      street: '789 Startup Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
    },
    customerSince: new Date('2023-06-10'),
    tags: ['startup', 'tech'],
    notes: 'Growing startup, potential for expansion.',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2026-02-01'),
    status: CustomerStatus.ACTIVE,
    quoteCount: 8,
    totalRevenue: 42000,
  },
  {
    id: 'cust_4',
    email: 'lisa.davis@umbrella.com',
    companyName: 'Umbrella Corporation',
    contactName: 'Lisa Davis',
    phone: '+1 (555) 321-7654',
    billingAddress: {
      street: '100 Corporate Plaza',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'US',
    },
    shippingAddress: {
      street: '200 Warehouse District',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98104',
      country: 'US',
    },
    taxId: '45-6789012',
    customerSince: new Date('2022-11-05'),
    tags: ['enterprise', 'healthcare'],
    createdAt: new Date('2022-11-05'),
    updatedAt: new Date('2026-01-28'),
    status: CustomerStatus.INACTIVE,
    quoteCount: 12,
    totalRevenue: 95000,
  },
  {
    id: 'cust_5',
    email: 'david.wilson@massive.com',
    companyName: 'Massive Dynamic',
    contactName: 'David Wilson',
    phone: '+1 (555) 789-0123',
    billingAddress: {
      street: '500 Innovation Way',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      country: 'US',
    },
    shippingAddress: {
      street: '500 Innovation Way',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      country: 'US',
    },
    customerSince: new Date('2024-01-10'),
    tags: ['research', 'tech'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2026-02-05'),
    status: CustomerStatus.ACTIVE,
    quoteCount: 5,
    totalRevenue: 28000,
  },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'bg-emerald-500' },
  { value: 'inactive', label: 'Inactive', color: 'bg-slate-500' },
  { value: 'prospect', label: 'Prospect', color: 'bg-amber-500' },
] as const;

const SORT_OPTIONS = [
  { value: 'name', label: 'Company Name' },
  { value: 'created', label: 'Date Added' },
  { value: 'revenue', label: 'Total Revenue' },
  { value: 'quotes', label: 'Quote Count' },
] as const;

const ALL_TAGS = ['enterprise', 'priority', 'mid-market', 'startup', 'tech', 'manufacturing', 'wholesale', 'healthcare', 'research'];

// ============================================================================
// Components
// ============================================================================

const CustomerCard: React.FC<{
  customer: CustomerWithQuoteCount;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}> = ({ customer, isSelected, onSelect, onClick }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'group relative bg-slate-900 border rounded-xl p-5 transition-all cursor-pointer',
        isSelected
          ? 'border-indigo-500 ring-1 ring-indigo-500/50'
          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
      )}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={cn(
            'w-5 h-5 rounded border flex items-center justify-center transition-colors',
            isSelected
              ? 'bg-indigo-500 border-indigo-500'
              : 'border-slate-600 hover:border-slate-500 bg-slate-900/50'
          )}
        >
          {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
        </button>
      </div>

      <div onClick={onClick} className="pl-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
              {getInitials(customer.companyName)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                {customer.companyName}
              </h3>
              <p className="text-sm text-slate-400">{customer.contactName}</p>
            </div>
          </div>
          <Badge
            variant="custom"
            className={CustomerStatusColors[customer.status]}
          >
            {CustomerStatusLabels[customer.status]}
          </Badge>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <EnvelopeIcon className="w-4 h-4 text-slate-500" />
            <span className="truncate">{customer.email}</span>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <PhoneIcon className="w-4 h-4 text-slate-500" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.billingAddress && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <MapPinIcon className="w-4 h-4 text-slate-500" />
              <span className="truncate">
                {customer.billingAddress.city}, {customer.billingAddress.state}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {customer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {customer.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {customer.tags.length > 3 && (
              <span className="text-xs text-slate-500">
                +{customer.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div>
            <p className="text-xs text-slate-500">Quotes</p>
            <p className="text-lg font-semibold text-slate-200">{customer.quoteCount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Revenue</p>
            <p className="text-lg font-semibold text-emerald-400">
              {formatCurrency(customer.totalRevenue)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CustomerListItem: React.FC<{
  customer: CustomerWithQuoteCount;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}> = ({ customer, isSelected, onSelect, onClick }) => {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'border-b border-slate-800 last:border-0 cursor-pointer transition-colors',
        isSelected ? 'bg-indigo-500/5' : 'hover:bg-slate-800/50'
      )}
    >
      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onSelect}
          className={cn(
            'w-5 h-5 rounded border flex items-center justify-center transition-colors',
            isSelected
              ? 'bg-indigo-500 border-indigo-500'
              : 'border-slate-600 hover:border-slate-500'
          )}
        >
          {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
        </button>
      </td>
      <td className="px-4 py-4" onClick={onClick}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
            {customer.companyName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-slate-200">{customer.companyName}</p>
            <p className="text-sm text-slate-500">{customer.contactName}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4" onClick={onClick}>
        <div className="text-sm">
          <p className="text-slate-300">{customer.email}</p>
          {customer.phone && (
            <p className="text-slate-500">{customer.phone}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-4" onClick={onClick}>
        <Badge
          variant="custom"
          className={CustomerStatusColors[customer.status]}
        >
          {CustomerStatusLabels[customer.status]}
        </Badge>
      </td>
      <td className="px-4 py-4" onClick={onClick}>
        <span className="text-slate-300">{customer.quoteCount}</span>
      </td>
      <td className="px-4 py-4 text-right" onClick={onClick}>
        <span className="font-medium text-emerald-400">
          {formatCurrency(customer.totalRevenue)}
        </span>
      </td>
    </motion.tr>
  );
};

const BulkActionsBar: React.FC<{
  selectedIds: string[];
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDelete: () => void;
  onExport: () => void;
}> = ({
  selectedIds,
  allSelected,
  someSelected,
  onSelectAll,
  onClearSelection,
  onDelete,
  onExport,
}) => {
  if (selectedIds.length === 0) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
        <label className="flex items-center gap-2 cursor-pointer">
          <button
            onClick={onSelectAll}
            className={cn(
              'w-5 h-5 rounded border flex items-center justify-center transition-colors',
              allSelected
                ? 'bg-indigo-500 border-indigo-500'
                : 'border-slate-600 hover:border-slate-500'
            )}
          >
            {allSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
          </button>
          <span className="text-sm text-slate-400">Select all</span>
        </label>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-3 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl"
    >
      <label className="flex items-center gap-2 cursor-pointer">
        <button
          onClick={onSelectAll}
          className={cn(
            'w-5 h-5 rounded border flex items-center justify-center transition-colors',
            allSelected
              ? 'bg-indigo-500 border-indigo-500'
              : someSelected
              ? 'bg-indigo-500/50 border-indigo-500'
              : 'border-slate-600 hover:border-slate-500'
          )}
        >
          {allSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
          {someSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
        </button>
        <span className="text-sm font-medium text-slate-200">
          {selectedIds.length} selected
        </span>
      </label>

      <button
        onClick={onClearSelection}
        className="text-sm text-slate-500 hover:text-slate-300"
      >
        Clear
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onExport}>
          <DocumentTextIcon className="w-4 h-4 mr-1.5" />
          Export
        </Button>
        <Button
          variant="custom"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={onDelete}
        >
          <TrashIcon className="w-4 h-4 mr-1.5" />
          Delete
        </Button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function CustomersPage() {
  const router = useRouter();
  const { success, error: showError } = useToastHelpers();
  
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    status: [],
    sortBy: 'name',
    sortOrder: 'asc',
    tags: [],
  });

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = [...mockCustomers];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (customer) =>
          customer.companyName.toLowerCase().includes(query) ||
          customer.contactName.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter((customer) =>
        filters.status.includes(customer.status)
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      result = result.filter((customer) =>
        filters.tags.some((tag) => customer.tags.includes(tag))
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = a.companyName.localeCompare(b.companyName);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'revenue':
          comparison = a.totalRevenue - b.totalRevenue;
          break;
        case 'quotes':
          comparison = a.quoteCount - b.quoteCount;
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [filters]);

  const allSelected = filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map((c) => c.id));
    }
  }, [allSelected, filteredCustomers]);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleViewCustomer = useCallback((id: string) => {
    router.push(`/customers/${id}`);
  }, [router]);

  const handleCreateCustomer = useCallback(() => {
    // TODO: Open create modal or navigate to create page
    success('Create customer modal would open here');
  }, [success]);

  const handleDelete = useCallback(async () => {
    // TODO: Implement actual delete
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success(`Deleted ${selectedIds.length} customers`);
    setSelectedIds([]);
    setShowDeleteModal(false);
  }, [selectedIds, success]);

  const handleExport = useCallback(() => {
    // TODO: Implement CSV export
    success(`Exported ${selectedIds.length} customers`);
  }, [selectedIds, success]);

  const toggleSortOrder = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const activeFiltersCount = filters.status.length + filters.tags.length;

  return (
    <DashboardLayout activeNavItem="customers">
      <PageHeader
        title="Customers"
        subtitle="Manage your customer relationships and view their quote history."
        actions={
          <Button onClick={handleCreateCustomer}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        }
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 mb-6"
      >
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search customers by name, email, or company..."
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              className={cn(
                'w-full pl-10 pr-10 py-2.5 bg-slate-900 border rounded-xl',
                'text-slate-100 placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
                'transition-all duration-200',
                filters.searchQuery ? 'border-indigo-500/50' : 'border-slate-700'
              )}
            />
            {filters.searchQuery && (
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, searchQuery: '' }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && 'ring-2 ring-indigo-500/50')}
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as FilterState['sortBy'],
                }))
              }
              className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSortOrder}
              className="px-3"
            >
              {filters.sortOrder === 'asc' ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm transition-colors',
                viewMode === 'grid'
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm transition-colors',
                viewMode === 'list'
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              List
            </button>
          </div>
        </div>

        {/* Active Filter Pills */}
        <AnimatePresence>
          {(activeFiltersCount > 0 || filters.searchQuery) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2"
            >
              {filters.searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-sm rounded-full border border-indigo-500/20">
                  Search: "{filters.searchQuery}"
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, searchQuery: '' }))
                    }
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.status.map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full border border-slate-700"
                >
                  {CustomerStatusLabels[status]}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        status: prev.status.filter((s) => s !== status),
                      }))
                    }
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full border border-slate-700"
                >
                  <TagIcon className="w-3 h-3" />
                  {tag}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        tags: prev.tags.filter((t) => t !== tag),
                      }))
                    }
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <button
                onClick={() =>
                  setFilters({
                    searchQuery: '',
                    status: [],
                    sortBy: 'name',
                    sortOrder: 'asc',
                    tags: [],
                  })
                }
                className="text-sm text-slate-500 hover:text-slate-300 underline"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6"
            >
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = filters.status.includes(option.value as CustomerStatus);
                    return (
                      <button
                        key={option.value}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            status: isSelected
                              ? prev.status.filter((s) => s !== option.value)
                              : [...prev.status, option.value as CustomerStatus],
                          }))
                        }
                        className={cn(
                          'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          isSelected
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                        )}
                      >
                        <span className={cn('w-2 h-2 rounded-full', option.color)} />
                        {option.label}
                        {isSelected && <CheckIcon className="w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map((tag) => {
                    const isSelected = filters.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            tags: isSelected
                              ? prev.tags.filter((t) => t !== tag)
                              : [...prev.tags, tag],
                          }))
                        }
                        className={cn(
                          'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all',
                          isSelected
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                        )}
                      >
                        {tag}
                        {isSelected && <CheckIcon className="w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() =>
                    setFilters({
                      searchQuery: '',
                      status: [],
                      sortBy: 'name',
                      sortOrder: 'asc',
                      tags: [],
                    })
                  }
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Reset all filters
                </button>
                <Button onClick={() => setShowFilters(false)}>Done</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions */}
        <BulkActionsBar
          selectedIds={selectedIds}
          allSelected={allSelected}
          someSelected={someSelected}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onDelete={() => setShowDeleteModal(true)}
          onExport={handleExport}
        />
      </motion.div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-slate-400">
        Showing {filteredCustomers.length} of {mockCustomers.length} customers
      </div>

      {/* Customer Grid/List */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : (
            <Skeleton className="h-96" />
          )
        ) : filteredCustomers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <BuildingOfficeIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No customers found
            </h3>
            <p className="text-slate-500 mb-6">
              Try adjusting your filters or add a new customer.
            </p>
            <Button onClick={handleCreateCustomer}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  isSelected={selectedIds.includes(customer.id)}
                  onSelect={() => handleSelect(customer.id)}
                  onClick={() => handleViewCustomer(customer.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="w-10 px-4 py-4"></th>
                  <th className="text-left px-4 py-4 text-sm font-semibold text-slate-400">
                    Customer
                  </th>
                  <th className="text-left px-4 py-4 text-sm font-semibold text-slate-400">
                    Contact
                  </th>
                  <th className="text-left px-4 py-4 text-sm font-semibold text-slate-400">
                    Status
                  </th>
                  <th className="text-left px-4 py-4 text-sm font-semibold text-slate-400">
                    Quotes
                  </th>
                  <th className="text-right px-4 py-4 text-sm font-semibold text-slate-400">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredCustomers.map((customer) => (
                    <CustomerListItem
                      key={customer.id}
                      customer={customer}
                      isSelected={selectedIds.includes(customer.id)}
                      onSelect={() => handleSelect(customer.id)}
                      onClick={() => handleViewCustomer(customer.id)}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Customers"
        description={`Are you sure you want to delete ${selectedIds.length} customers? This action cannot be undone.`}
      >
        <div className="flex items-center gap-3 p-4 bg-red-950/30 rounded-lg mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">
            All associated quotes and data will be permanently removed.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="custom"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
          >
            Delete {selectedIds.length} Customers
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
