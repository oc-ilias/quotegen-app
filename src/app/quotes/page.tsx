/**
 * Enhanced Quotes List Page
 * Full-featured quote management with search, filters, bulk actions, and real-time updates
 * @module app/quotes/page
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { QuoteFilters } from '@/components/quotes/QuoteFilters';
import { BulkActions } from '@/components/quotes/BulkActions';
import type { Quote, QuoteWithCustomer } from '@/types/quote';
import { QuoteStatus, QuotePriority, QuoteStatusLabels, QuoteStatusColors, CustomerStatus } from '@/types/quote';

// Local filter state type matching QuoteFilters component
interface FilterState {
  searchQuery: string;
  status: QuoteStatus[];
  dateFrom: string;
  dateTo: string;
  minValue: string;
  maxValue: string;
  sortBy: 'created' | 'updated' | 'total' | 'expiry';
  sortOrder: 'asc' | 'desc';
}
import { 
  useQuotes, 
  useDeleteQuote, 
  useUpdateQuoteStatus,
  useBulkDeleteQuotes,
  useRealtimeQuotes 
} from '@/hooks/useSupabaseData';

// ============================================================================
// Mock Data (Fallback)
// ============================================================================

const mockQuotes: QuoteWithCustomer[] = [
  {
    id: 'qt_001',
    quoteNumber: 'QT-2026-001',
    customerId: 'cust_1',
    customer: {
      id: 'cust_1',
      email: 'john@acme.com',
      companyName: 'Acme Corporation',
      contactName: 'John Smith',
      phone: '+1 (555) 123-4567',
      customerSince: new Date('2023-01-15'),
      tags: ['enterprise', 'priority'],
      status: CustomerStatus.ACTIVE,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2026-02-03'),
    },
    title: 'Industrial Equipment Quote',
    status: QuoteStatus.SENT,
    priority: QuotePriority.HIGH,
    lineItems: [],
    subtotal: 15000,
    discountTotal: 1500,
    taxTotal: 1350,
    shippingTotal: 500,
    total: 15350,
    terms: {
      paymentTerms: 'Net 30',
      deliveryTerms: '2-3 business days',
      validityPeriod: 30,
      depositRequired: true,
      depositPercentage: 50,
      currency: 'USD',
    },
    metadata: {
      createdBy: 'user_1',
      createdByName: 'Jane Doe',
      source: 'web',
    },
    sentAt: new Date('2026-02-03'),
    createdAt: new Date('2026-02-03'),
    updatedAt: new Date('2026-02-03'),
  },
  {
    id: 'qt_002',
    quoteNumber: 'QT-2026-002',
    customerId: 'cust_2',
    customer: {
      id: 'cust_2',
      email: 'sarah@globex.com',
      companyName: 'Globex Industries',
      contactName: 'Sarah Johnson',
      phone: '+1 (555) 987-6543',
      customerSince: new Date('2023-03-20'),
      tags: ['mid-market'],
      status: CustomerStatus.ACTIVE,
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2026-02-02'),
    },
    title: 'Office Furniture Package',
    status: QuoteStatus.ACCEPTED,
    priority: QuotePriority.MEDIUM,
    lineItems: [],
    subtotal: 8500,
    discountTotal: 0,
    taxTotal: 765,
    shippingTotal: 350,
    total: 9615,
    terms: {
      paymentTerms: 'Net 15',
      deliveryTerms: 'Standard (5-7 days)',
      validityPeriod: 30,
      depositRequired: false,
      currency: 'USD',
    },
    metadata: {
      createdBy: 'user_1',
      createdByName: 'Jane Doe',
      source: 'web',
    },
    sentAt: new Date('2026-02-01'),
    acceptedAt: new Date('2026-02-02'),
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-02'),
  },
  {
    id: 'qt_003',
    quoteNumber: 'QT-2026-003',
    customerId: 'cust_3',
    customer: {
      id: 'cust_3',
      email: 'mike@initech.com',
      companyName: 'Initech LLC',
      contactName: 'Michael Brown',
      phone: '+1 (555) 456-7890',
      customerSince: new Date('2023-06-10'),
      tags: ['startup'],
      status: CustomerStatus.ACTIVE,
      createdAt: new Date('2023-06-10'),
      updatedAt: new Date('2026-02-03'),
    },
    title: 'IT Services Quote',
    status: QuoteStatus.VIEWED,
    priority: QuotePriority.LOW,
    lineItems: [],
    subtotal: 5000,
    discountTotal: 500,
    taxTotal: 450,
    shippingTotal: 0,
    total: 4950,
    terms: {
      paymentTerms: 'Due on Receipt',
      deliveryTerms: 'Custom Delivery Terms',
      validityPeriod: 15,
      depositRequired: false,
      currency: 'USD',
    },
    metadata: {
      createdBy: 'user_1',
      createdByName: 'Jane Doe',
      source: 'web',
    },
    sentAt: new Date('2026-02-02'),
    viewedAt: new Date('2026-02-03'),
    createdAt: new Date('2026-02-02'),
    updatedAt: new Date('2026-02-03'),
  },
  {
    id: 'qt_004',
    quoteNumber: 'QT-2026-004',
    customerId: 'cust_1',
    customer: {
      id: 'cust_1',
      email: 'john@acme.com',
      companyName: 'Acme Corporation',
      contactName: 'John Smith',
      phone: '+1 (555) 123-4567',
      customerSince: new Date('2023-01-15'),
      tags: ['enterprise', 'priority'],
      status: CustomerStatus.ACTIVE,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2026-02-04'),
    },
    title: 'Maintenance Contract Q1 2026',
    status: QuoteStatus.DRAFT,
    priority: QuotePriority.HIGH,
    lineItems: [],
    subtotal: 25000,
    discountTotal: 2500,
    taxTotal: 2250,
    shippingTotal: 0,
    total: 24750,
    terms: {
      paymentTerms: 'Net 60',
      deliveryTerms: 'Pickup',
      validityPeriod: 60,
      depositRequired: true,
      depositPercentage: 25,
      currency: 'USD',
    },
    metadata: {
      createdBy: 'user_1',
      createdByName: 'Jane Doe',
      source: 'web',
    },
    createdAt: new Date('2026-02-04'),
    updatedAt: new Date('2026-02-04'),
  },
  {
    id: 'qt_005',
    quoteNumber: 'QT-2026-005',
    customerId: 'cust_2',
    customer: {
      id: 'cust_2',
      email: 'sarah@globex.com',
      companyName: 'Globex Industries',
      contactName: 'Sarah Johnson',
      phone: '+1 (555) 987-6543',
      customerSince: new Date('2023-03-20'),
      tags: ['mid-market'],
      status: CustomerStatus.ACTIVE,
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2026-02-01'),
    },
    title: 'Consulting Services - Feb 2026',
    status: QuoteStatus.REJECTED,
    priority: QuotePriority.HIGH,
    lineItems: [],
    subtotal: 12000,
    discountTotal: 0,
    taxTotal: 1080,
    shippingTotal: 0,
    total: 13080,
    terms: {
      paymentTerms: '50% Deposit',
      deliveryTerms: 'Custom Delivery Terms',
      validityPeriod: 30,
      depositRequired: true,
      depositPercentage: 50,
      currency: 'USD',
    },
    metadata: {
      createdBy: 'user_1',
      createdByName: 'Jane Doe',
      source: 'web',
    },
    sentAt: new Date('2026-01-28'),
    rejectedAt: new Date('2026-02-01'),
    rejectionReason: 'Budget constraints',
    createdAt: new Date('2026-01-28'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'qt_006',
    quoteNumber: 'QT-2026-006',
    customerId: 'cust_4',
    customer: {
      id: 'cust_4',
      email: 'lisa@umbrella.com',
      companyName: 'Umbrella Corporation',
      contactName: 'Lisa Davis',
      phone: '+1 (555) 321-7654',
      customerSince: new Date('2022-11-05'),
      tags: ['enterprise', 'healthcare'],
      status: CustomerStatus.ACTIVE,
      createdAt: new Date('2022-11-05'),
      updatedAt: new Date('2026-02-05'),
    },
    title: 'Medical Equipment Supply',
    status: QuoteStatus.PENDING,
    priority: QuotePriority.MEDIUM,
    lineItems: [],
    subtotal: 45000,
    discountTotal: 4500,
    taxTotal: 4050,
    shippingTotal: 1200,
    total: 45750,
    terms: {
      paymentTerms: 'Net 30',
      deliveryTerms: '2-3 weeks',
      validityPeriod: 45,
      depositRequired: true,
      depositPercentage: 30,
      currency: 'USD',
    },
    metadata: {
      createdBy: 'user_1',
      createdByName: 'Jane Doe',
      source: 'web',
    },
    createdAt: new Date('2026-02-05'),
    updatedAt: new Date('2026-02-05'),
  },
];

// ============================================================================
// Components
// ============================================================================

const QuoteRow: React.FC<{
  quote: QuoteWithCustomer;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSend: () => void;
  onStatusChange: (status: QuoteStatus) => void;
}> = ({ quote, isSelected, onSelect, onView, onEdit, onDelete, onSend, onStatusChange }) => {
  const getStatusIcon = (status: QuoteStatus) => {
    switch (status) {
      case 'accepted':
        return CheckCircleIcon;
      case 'rejected':
        return XCircleIcon;
      case 'sent':
        return PaperAirplaneIcon;
      case 'viewed':
        return EyeIcon;
      case 'expired':
        return ClockIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const StatusIcon = getStatusIcon(quote.status);

  const getDaysSince = (date: Date) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'border-b border-slate-800 last:border-0 transition-colors',
        isSelected ? 'bg-indigo-500/5' : 'hover:bg-slate-800/30'
      )}
    >
      {/* Checkbox */}
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
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
            </motion.div>
          )}
        </button>
      </td>

      {/* Quote Info */}
      <td className="px-4 py-4">
        <div 
          className="cursor-pointer group"
          onClick={onView}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
              {quote.quoteNumber}
            </span>
            {quote.priority === 'high' && (
              <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-medium rounded">
                HIGH
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 truncate max-w-[200px] mt-0.5">
            {quote.title}
          </p>
        </div>
      </td>

      {/* Customer */}
      <td className="px-4 py-4">
        <div>
          <p className="font-medium text-slate-200">{quote.customer?.companyName}</p>
          <p className="text-sm text-slate-500">{quote.customer?.contactName}</p>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Badge
            variant="custom"
            className={cn('capitalize inline-flex items-center gap-1.5', QuoteStatusColors[quote.status])}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {QuoteStatusLabels[quote.status]}
          </Badge>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-4">
        <div className="text-sm">
          <p className="text-slate-300">{formatDate(quote.createdAt)}</p>
          <p className="text-slate-500 text-xs">{getDaysSince(quote.createdAt)}</p>
        </div>
      </td>

      {/* Value */}
      <td className="px-4 py-4 text-right">
        <p className="font-semibold text-slate-200">
          {formatCurrency(quote.total)}
        </p>
        <p className="text-xs text-slate-500">
          {quote.lineItems?.length || 0} items
        </p>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-1">
          {quote.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSend}
              className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
              title="Send Quote"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            title="View Quote"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            title="Edit Quote"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            title="Delete Quote"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </motion.tr>
  );
};

const StatusUpdateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteWithCustomer | null;
  onStatusChange: (status: QuoteStatus, notes?: string) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, quote, onStatusChange, isLoading }) => {
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus>(QuoteStatus.SENT);
  const [notes, setNotes] = useState('');

  const statusOptions: { value: QuoteStatus; label: string; icon: React.ElementType; color: string }[] = [
    { value: QuoteStatus.DRAFT, label: 'Draft', icon: DocumentTextIcon, color: 'text-slate-400' },
    { value: QuoteStatus.PENDING, label: 'Pending', icon: ClockIcon, color: 'text-amber-400' },
    { value: QuoteStatus.SENT, label: 'Sent', icon: PaperAirplaneIcon, color: 'text-indigo-400' },
    { value: QuoteStatus.VIEWED, label: 'Viewed', icon: EyeIcon, color: 'text-purple-400' },
    { value: QuoteStatus.ACCEPTED, label: 'Accepted', icon: CheckCircleIcon, color: 'text-emerald-400' },
    { value: QuoteStatus.REJECTED, label: 'Rejected', icon: XCircleIcon, color: 'text-red-400' },
    { value: QuoteStatus.EXPIRED, label: 'Expired', icon: ClockIcon, color: 'text-gray-400' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Quote Status"
      description={quote ? `Change status for ${quote.quoteNumber}` : 'Change status for selected quotes'}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all',
                  selectedStatus === option.value
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                )}
              >
                <Icon className={cn('w-5 h-5', option.color)} />
                <span className="font-medium">{option.label}</span>
                {selectedStatus === option.value && (
                  <CheckCircleIcon className="w-5 h-5 ml-auto text-indigo-400" />
                )}
              </button>
            );
          })}
        </div>

        {selectedStatus === QuoteStatus.REJECTED && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Rejection Reason (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => onStatusChange(selectedStatus, notes)}
            isLoading={isLoading}
          >
            Update Status
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function QuotesPage() {
  const router = useRouter();
  const { success, error: showError } = useToastHelpers();

  // State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    status: [],
    dateFrom: '',
    dateTo: '',
    minValue: '',
    maxValue: '',
    sortBy: 'created',
    sortOrder: 'desc',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteWithCustomer | null>(null);
  const [quoteToUpdate, setQuoteToUpdate] = useState<QuoteWithCustomer | null>(null);

  // Data fetching (using mock data for now, switch to useQuotes hook when API is ready)
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<QuoteWithCustomer[]>([]);

  // Real-time updates
  const { isConnected } = useRealtimeQuotes((payload) => {
    if (payload.event === 'INSERT') {
      success(`New quote ${payload.quote.quoteNumber} created`);
    } else if (payload.event === 'UPDATE') {
      // Refresh quotes
      fetchQuotes();
    }
  });

  // Mutations
  const deleteQuote = useDeleteQuote({
    onSuccess: () => {
      success('Quote deleted successfully');
      fetchQuotes();
    },
    onError: (err) => showError('Failed to delete quote', err.message),
  });

  const bulkDeleteQuotes = useBulkDeleteQuotes({
    onSuccess: () => {
      success(`Deleted ${selectedIds.length} quotes`);
      setSelectedIds([]);
      fetchQuotes();
    },
    onError: (err) => showError('Failed to delete quotes', err.message),
  });

  const updateQuoteStatus = useUpdateQuoteStatus({
    onSuccess: () => {
      success('Quote status updated');
      fetchQuotes();
    },
    onError: (err) => showError('Failed to update status', err.message),
  });

  // Fetch quotes
  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setQuotes(mockQuotes);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Filter quotes locally (would be done server-side with real API)
  const filteredQuotes = useMemo(() => {
    let result = [...quotes];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.quoteNumber.toLowerCase().includes(query) ||
          q.title.toLowerCase().includes(query) ||
          q.customer?.companyName.toLowerCase().includes(query) ||
          q.customer?.contactName.toLowerCase().includes(query)
      );
    }

    if (filters.status?.length) {
      result = result.filter((q) => filters.status?.includes(q.status));
    }

    if (filters.dateFrom) {
      result = result.filter((q) => new Date(q.createdAt) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      result = result.filter((q) => new Date(q.createdAt) <= new Date(filters.dateTo));
    }

    const minVal = filters.minValue ? parseFloat(filters.minValue) : undefined;
    const maxVal = filters.maxValue ? parseFloat(filters.maxValue) : undefined;

    if (minVal !== undefined && !isNaN(minVal)) {
      result = result.filter((q) => q.total >= minVal);
    }

    if (maxVal !== undefined && !isNaN(maxVal)) {
      result = result.filter((q) => q.total <= maxVal);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'expiry':
          comparison = (a.expiresAt?.getTime() || 0) - (b.expiresAt?.getTime() || 0);
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [quotes, filters]);

  // Handlers
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setSelectedIds([]); // Clear selection when filters change
  }, []);

  const handleCreateQuote = useCallback(() => {
    router.push('/quotes/new');
  }, [router]);

  const handleViewQuote = useCallback((id: string) => {
    router.push(`/quotes/${id}`);
  }, [router]);

  const handleEditQuote = useCallback((id: string) => {
    router.push(`/quotes/${id}/edit`);
  }, [router]);

  const handleDeleteClick = useCallback((quote: QuoteWithCustomer) => {
    setQuoteToDelete(quote);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (quoteToDelete) {
      await deleteQuote.mutateAsync(quoteToDelete.id);
    } else if (selectedIds.length > 0) {
      await bulkDeleteQuotes.mutateAsync(selectedIds);
    }
    setShowDeleteModal(false);
    setQuoteToDelete(null);
  }, [quoteToDelete, selectedIds, deleteQuote, bulkDeleteQuotes]);

  const handleSendQuote = useCallback((quote: QuoteWithCustomer) => {
    updateQuoteStatus.mutateAsync({ id: quote.id, status: QuoteStatus.SENT });
  }, [updateQuoteStatus]);

  const handleStatusChange = useCallback(async (status: QuoteStatus, notes?: string) => {
    if (quoteToUpdate) {
      await updateQuoteStatus.mutateAsync({ id: quoteToUpdate.id, status, notes });
    }
    setShowStatusModal(false);
    setQuoteToUpdate(null);
  }, [quoteToUpdate, updateQuoteStatus]);

  const handleExport = useCallback(() => {
    // Generate CSV
    const csvContent = [
      ['Quote Number', 'Customer', 'Title', 'Status', 'Total', 'Created'].join(','),
      ...filteredQuotes.map((q) =>
        [q.quoteNumber, q.customer?.companyName, q.title, q.status, q.total, formatDate(q.createdAt)].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    success(`Exported ${filteredQuotes.length} quotes`);
  }, [filteredQuotes, success]);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const handleBulkActionComplete = useCallback(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredQuotes.length;
    const accepted = filteredQuotes.filter((q) => q.status === QuoteStatus.ACCEPTED).length;
    const pending = filteredQuotes.filter((q) => q.status === QuoteStatus.PENDING || q.status === QuoteStatus.SENT).length;
    const totalValue = filteredQuotes.reduce((sum, q) => sum + q.total, 0);
    return { total, accepted, pending, totalValue };
  }, [filteredQuotes]);

  return (
    <DashboardLayout activeNavItem="quotes">
      <PageHeader
        title="Quotes"
        subtitle={isConnected ? 'Real-time updates active' : 'Manage and track all your quotes in one place.'}
        actions={
          <>
            <Button variant="secondary" onClick={handleExport}>
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleCreateQuote}>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Quote
            </Button>
          </>
        }
      />

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {[
          { label: 'Total Quotes', value: stats.total, color: 'text-slate-200' },
          { label: 'Total Value', value: formatCurrency(stats.totalValue), color: 'text-emerald-400' },
          { label: 'Accepted', value: stats.accepted, color: 'text-indigo-400' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={cn('text-2xl font-bold mt-1', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <QuoteFilters onFilterChange={handleFilterChange} />
      </motion.div>

      {/* Bulk Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-4"
      >
        <BulkActions
          quotes={filteredQuotes}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          onActionComplete={handleBulkActionComplete}
        />
      </motion.div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-slate-400">
        Showing {filteredQuotes.length} of {quotes.length} quotes
        {filters.status?.length > 0 && ` • Filtered by status: ${filters.status.join(', ')}`}
      </div>

      {/* Quotes Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center py-16">
            <DocumentTextIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No quotes found</h3>
            <p className="text-slate-500 mb-6">
              {filters.searchQuery || filters.status?.length
                ? 'Try adjusting your filters'
                : 'Create your first quote to get started'}
            </p>
            <Button onClick={handleCreateQuote}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Quote
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="w-10 px-4 py-4"></th>
                  <th className="text-left px-4 py-4 text-sm font-semibold text-slate-400">
                    Quote
                  </th>
                  <th className="text-left px-4 py-4 text-sm font-semibold text-slate-400">
                    Customer
                  </th>
                  <th className="text-left px-4 py-4 text-sm font-semibold text-slate-400">
                    Status
                  </th>
                  <th className="text-left px-4 py-4 text-sm font-semibold text-slate-400">
                    Date
                  </th>
                  <th className="text-right px-4 py-4 text-sm font-semibold text-slate-400">
                    Value
                  </th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredQuotes.map((quote) => (
                    <QuoteRow
                      key={quote.id}
                      quote={quote}
                      isSelected={selectedIds.includes(quote.id)}
                      onSelect={() =>
                        handleSelectionChange(
                          selectedIds.includes(quote.id)
                            ? selectedIds.filter((id) => id !== quote.id)
                            : [...selectedIds, quote.id]
                        )
                      }
                      onView={() => handleViewQuote(quote.id)}
                      onEdit={() => handleEditQuote(quote.id)}
                      onDelete={() => handleDeleteClick(quote)}
                      onSend={() => handleSendQuote(quote)}
                      onStatusChange={(status) => {
                        setQuoteToUpdate(quote);
                        setShowStatusModal(true);
                      }}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setQuoteToDelete(null);
        }}
        title="Delete Quote"
        description={
          quoteToDelete
            ? `Are you sure you want to delete ${quoteToDelete.quoteNumber}? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedIds.length} quotes? This action cannot be undone.`
        }
      >
        <div className="flex items-center gap-3 p-4 bg-red-950/30 rounded-lg mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">
            All quote data including line items and history will be permanently removed.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              setShowDeleteModal(false);
              setQuoteToDelete(null);
            }}
            disabled={deleteQuote.isLoading || bulkDeleteQuotes.isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="custom"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleConfirmDelete}
            isLoading={deleteQuote.isLoading || bulkDeleteQuotes.isLoading}
          >
            {quoteToDelete ? 'Delete Quote' : `Delete ${selectedIds.length} Quotes`}
          </Button>
        </div>
      </Modal>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setQuoteToUpdate(null);
        }}
        quote={quoteToUpdate}
        onStatusChange={handleStatusChange}
        isLoading={updateQuoteStatus.isLoading}
      />
    </DashboardLayout>
  );
}
