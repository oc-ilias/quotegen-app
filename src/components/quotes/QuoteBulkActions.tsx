/**
 * Quote Bulk Actions Component
 * Bulk operations for quotes with selection, export, and batch processing
 * @module components/quotes/QuoteBulkActions
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquareIcon,
  SquareIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  ArchiveBoxIcon,
  TagIcon,
  XMarkIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  PrinterIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { type Quote, type QuoteStatus, QuoteStatusLabels } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface QuoteBulkActionsProps {
  quotes: Quote[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onDelete: (ids: string[]) => Promise<void>;
  onStatusChange: (ids: string[], status: QuoteStatus) => Promise<void>;
  onExport: (ids: string[], format: 'csv' | 'pdf' | 'json') => Promise<void>;
  onDuplicate?: (ids: string[]) => Promise<void>;
  isLoading?: boolean;
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  action: () => void;
  confirmMessage?: string;
}

// ============================================================================
// Selection Hook
// ============================================================================

export function useQuoteSelection(quotes: Quote[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected = useMemo(() => {
    return quotes.length > 0 && selectedIds.length === quotes.length;
  }, [quotes.length, selectedIds.length]);

  const someSelected = useMemo(() => {
    return selectedIds.length > 0 && selectedIds.length < quotes.length;
  }, [selectedIds.length, quotes.length]);

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(quotes.map(q => q.id));
    }
  }, [allSelected, quotes]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectRange = useCallback((startId: string, endId: string) => {
    const startIndex = quotes.findIndex(q => q.id === startId);
    const endIndex = quotes.findIndex(q => q.id === endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const [min, max] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
    const rangeIds = quotes.slice(min, max + 1).map(q => q.id);
    
    setSelectedIds(prev => {
      const newSet = new Set([...prev, ...rangeIds]);
      return Array.from(newSet);
    });
  }, [quotes]);

  return {
    selectedIds,
    allSelected,
    someSelected,
    toggleAll,
    toggleOne,
    clearSelection,
    selectRange,
    setSelectedIds,
  };
}

// ============================================================================
// Confirmation Modal
// ============================================================================

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${isDestructive ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
            <ExclamationTriangleIcon className={`w-6 h-6 ${isDestructive ? 'text-red-400' : 'text-amber-400'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
            <p className="text-slate-400 mt-1">{message}</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2
              ${isDestructive 
                ? 'bg-red-600 text-white hover:bg-red-500' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }
            `}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// Status Change Dropdown
// ============================================================================

const StatusChangeDropdown: React.FC<{
  selectedCount: number;
  onStatusChange: (status: QuoteStatus) => void;
  isLoading?: boolean;
}> = ({ selectedCount, onStatusChange, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statuses: QuoteStatus[] = ['draft', 'pending', 'sent', 'accepted', 'rejected', 'expired'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
      >
        <TagIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Change Status</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute z-50 top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-1">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(status as QuoteStatus);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <span className="capitalize">{QuoteStatusLabels[status as QuoteStatus]}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Export Dropdown
// ============================================================================

const ExportDropdown: React.FC<{
  selectedCount: number;
  onExport: (format: 'csv' | 'pdf' | 'json') => void;
  isLoading?: boolean;
}> = ({ selectedCount, onExport, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formats = [
    { value: 'csv' as const, label: 'CSV', icon: DocumentArrowDownIcon },
    { value: 'pdf' as const, label: 'PDF', icon: PrinterIcon },
    { value: 'json' as const, label: 'JSON', icon: DocumentDuplicateIcon },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
      >
        <DocumentArrowDownIcon className="w-4 h-4" />
        <span className="text-sm">Export</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute z-50 top-full right-0 mt-2 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-1">
              {formats.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    onExport(value);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const QuoteBulkActions: React.FC<QuoteBulkActionsProps> = ({
  quotes,
  selectedIds,
  onSelectionChange,
  onDelete,
  onStatusChange,
  onExport,
  onDuplicate,
  isLoading = false,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<QuoteStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedCount = selectedIds.length;
  const allSelected = selectedCount > 0 && selectedCount === quotes.length;
  const someSelected = selectedCount > 0 && selectedCount < quotes.length;

  const handleToggleAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(quotes.map(q => q.id));
    }
  }, [allSelected, quotes, onSelectionChange]);

  const handleDelete = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onDelete(selectedIds);
      onSelectionChange([]);
      setShowDeleteModal(false);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, onDelete, onSelectionChange]);

  const handleStatusChange = useCallback(async () => {
    if (!pendingStatus) return;
    setIsProcessing(true);
    try {
      await onStatusChange(selectedIds, pendingStatus);
      setShowStatusModal(false);
      setPendingStatus(null);
    } finally {
      setIsProcessing(false);
    }
  }, [pendingStatus, selectedIds, onStatusChange]);

  const initiateStatusChange = useCallback((status: QuoteStatus) => {
    setPendingStatus(status);
    setShowStatusModal(true);
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'pdf' | 'json') => {
    setIsProcessing(true);
    try {
      await onExport(selectedIds, format);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, onExport]);

  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl">
        <button
          onClick={handleToggleAll}
          disabled={quotes.length === 0 || isLoading}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <SquareIcon className="w-5 h-5" />
          <span className="text-sm">Select all {quotes.length} quotes</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Quotes"
        message={`Are you sure you want to delete ${selectedCount} selected quote${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={isProcessing}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={showStatusModal}
        title="Change Quote Status"
        message={`Change status of ${selectedCount} quote${selectedCount > 1 ? 's' : ''} to "${pendingStatus ? QuoteStatusLabels[pendingStatus] : ''}"?`}
        confirmLabel="Change Status"
        isLoading={isProcessing}
        onConfirm={handleStatusChange}
        onCancel={() => {
          setShowStatusModal(false);
          setPendingStatus(null);
        }}
      />

      {/* Bulk Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex flex-wrap items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"
      >
        {/* Selection Toggle */}
        <button
          onClick={handleToggleAll}
          className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors"
        >
          {allSelected ? (
            <CheckSquareIcon className="w-5 h-5" />
          ) : someSelected ? (
            <div className="w-5 h-5 rounded border-2 border-indigo-400 bg-indigo-400 flex items-center justify-center">
              <div className="w-2.5 h-0.5 bg-slate-900 rounded-full" />
            </div>
          ) : (
            <SquareIcon className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
        </button>

        <div className="w-px h-6 bg-indigo-500/30" />

        {/* Primary Actions */}
        <StatusChangeDropdown
          selectedCount={selectedCount}
          onStatusChange={initiateStatusChange}
          isLoading={isLoading || isProcessing}
        />

        <ExportDropdown
          selectedCount={selectedCount}
          onExport={handleExport}
          isLoading={isLoading || isProcessing}
        />

        {onDuplicate && (
          <button
            onClick={() => onDuplicate?.(selectedIds)}
            disabled={isLoading || isProcessing}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
            <span className="text-sm">Duplicate</span>
          </button>
        )}

        {/* Secondary Actions */}
        <div className="flex-1" />

        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={isLoading || isProcessing}
          className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 disabled:opacity-50 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          <span className="text-sm">Delete</span>
        </button>

        <button
          onClick={() => onSelectionChange([])}
          disabled={isLoading || isProcessing}
          className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </motion.div>
    </>
  );
};

// ============================================================================
// Selection Checkbox Component (for table rows)
// ============================================================================

export const SelectionCheckbox: React.FC<{
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}> = ({ checked, indeterminate, onChange }) => {
  return (
    <button
      onClick={onChange}
      className={`
        w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
        ${checked || indeterminate 
          ? 'bg-indigo-500 border-indigo-500' 
          : 'border-slate-600 hover:border-slate-500'
        }
      `}
    >
      {checked && !indeterminate && <CheckIcon className="w-3.5 h-3.5 text-white" />}
      {indeterminate && <div className="w-2.5 h-0.5 bg-white rounded-full" />}
    </button>
  );
};

// ============================================================================
// Export Functions
// ============================================================================

export function exportQuotesToCSV(quotes: Quote[]): string {
  const headers = [
    'Quote Number',
    'Title',
    'Customer',
    'Status',
    'Subtotal',
    'Discount',
    'Tax',
    'Total',
    'Created At',
    'Expires At',
  ];

  const rows = quotes.map(quote => [
    quote.quoteNumber,
    quote.title,
    quote.customer?.companyName || '',
    QuoteStatusLabels[quote.status],
    quote.subtotal,
    quote.discountTotal,
    quote.taxTotal,
    quote.total,
    new Date(quote.createdAt).toLocaleDateString(),
    quote.expiresAt ? new Date(quote.expiresAt).toLocaleDateString() : '',
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportQuotesToJSON(quotes: Quote[]): string {
  return JSON.stringify(quotes, null, 2);
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default QuoteBulkActions;
