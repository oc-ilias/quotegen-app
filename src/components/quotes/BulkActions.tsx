/**
 * Bulk Actions Component for Quotes
 * Select, manage, and perform bulk operations on quotes
 * @module components/quotes/BulkActions
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckIcon,
  Square2StackIcon,
  TrashIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import type { Quote, QuoteStatus } from '@/types/quote';
import { QuoteStatusLabels, QuoteStatusColors, QuoteStatus as QuoteStatusEnum } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface BulkActionsProps {
  quotes: Quote[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onActionComplete?: () => void;
  className?: string;
}

type BulkAction = 'delete' | 'changeStatus' | 'export' | 'sendEmail';

interface BulkOperationState {
  isLoading: boolean;
  progress: number;
  currentItem: string;
  action: BulkAction | null;
}

// ============================================================================
// Status Options
// ============================================================================

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: QuoteStatusEnum.DRAFT, label: 'Draft' },
  { value: QuoteStatusEnum.PENDING, label: 'Pending' },
  { value: QuoteStatusEnum.SENT, label: 'Sent' },
  { value: QuoteStatusEnum.VIEWED, label: 'Viewed' },
  { value: QuoteStatusEnum.ACCEPTED, label: 'Accepted' },
  { value: QuoteStatusEnum.REJECTED, label: 'Rejected' },
  { value: QuoteStatusEnum.EXPIRED, label: 'Expired' },
  { value: QuoteStatusEnum.CONVERTED, label: 'Converted' },
];

// ============================================================================
// Main Component
// ============================================================================

export const BulkActions: React.FC<BulkActionsProps> = ({
  quotes,
  selectedIds,
  onSelectionChange,
  onActionComplete,
  className,
}) => {
  const { success, error: showError } = useToastHelpers();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus>(QuoteStatusEnum.SENT);
  const [operation, setOperation] = useState<BulkOperationState>({
    isLoading: false,
    progress: 0,
    currentItem: '',
    action: null,
  });

  const selectedQuotes = quotes.filter((q) => selectedIds.includes(q.id));
  const allSelected = quotes.length > 0 && selectedIds.length === quotes.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(quotes.map((q) => q.id));
    }
  }, [allSelected, quotes, onSelectionChange]);

  const handleActionClick = (action: BulkAction) => {
    setPendingAction(action);
    if (action === 'changeStatus') {
      setShowStatusModal(true);
    } else if (action === 'delete') {
      setShowConfirmModal(true);
    } else {
      executeAction(action);
    }
    setShowDropdown(false);
  };

  const executeAction = async (action: BulkAction, status?: QuoteStatus) => {
    setOperation({
      isLoading: true,
      progress: 0,
      currentItem: '',
      action,
    });

    const total = selectedIds.length;

    try {
      // Simulate bulk operation with progress
      for (let i = 0; i < total; i++) {
        const quoteId = selectedIds[i];
        const quote = quotes.find((q) => q.id === quoteId);

        setOperation((prev) => ({
          ...prev,
          currentItem: quote?.quoteNumber || quoteId,
          progress: Math.round(((i + 1) / total) * 100),
        }));

        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Simulate different actions
        switch (action) {
          case 'delete':
            // Delete quote
            break;
          case 'changeStatus':
            // Update status
            console.log(`Changing ${quoteId} to ${status}`);
            break;
          case 'export':
            // Export to CSV
            break;
          case 'sendEmail':
            // Send email
            break;
        }
      }

      // Success message
      const actionMessages: Record<BulkAction, string> = {
        delete: `Deleted ${total} quotes`,
        changeStatus: `Updated status for ${total} quotes`,
        export: `Exported ${total} quotes`,
        sendEmail: `Sent emails for ${total} quotes`,
      };

      success(actionMessages[action]);
      onSelectionChange([]);
      onActionComplete?.();
    } catch (err) {
      showError('Bulk operation failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setOperation({
        isLoading: false,
        progress: 0,
        currentItem: '',
        action: null,
      });
      setShowConfirmModal(false);
      setShowStatusModal(false);
      setPendingAction(null);
    }
  };

  const handleConfirmDelete = () => {
    executeAction('delete');
  };

  const handleConfirmStatusChange = () => {
    executeAction('changeStatus', selectedStatus);
  };

  const actionButtons = [
    {
      action: 'changeStatus' as BulkAction,
      label: 'Change Status',
      icon: ArrowPathIcon,
      variant: 'secondary' as const,
    },
    {
      action: 'sendEmail' as BulkAction,
      label: 'Send Email',
      icon: EnvelopeIcon,
      variant: 'secondary' as const,
    },
    {
      action: 'export' as BulkAction,
      label: 'Export CSV',
      icon: DocumentArrowDownIcon,
      variant: 'secondary' as const,
    },
    {
      action: 'delete' as BulkAction,
      label: 'Delete',
      icon: TrashIcon,
      variant: 'custom' as const,
      className: 'bg-red-600 hover:bg-red-700 text-white',
    },
  ];

  if (selectedIds.length === 0) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <label className="flex items-center gap-2 cursor-pointer">
          <button
            onClick={handleSelectAll}
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
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex flex-wrap items-center gap-3 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl',
          className
        )}
      >
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <button
              onClick={handleSelectAll}
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
            onClick={() => onSelectionChange([])}
            className="text-sm text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        </div>

        <div className="flex-1" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Desktop: Show all buttons */}
          <div className="hidden md:flex items-center gap-2">
            {actionButtons.slice(0, -1).map(({ action, label, icon: Icon, variant }) => (
              <Button
                key={action}
                variant={variant}
                size="sm"
                onClick={() => handleActionClick(action)}
                disabled={operation.isLoading}
              >
                <Icon className="w-4 h-4 mr-1.5" />
                {label}
              </Button>
            ))}
            <Button
              variant="custom"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleActionClick('delete')}
              disabled={operation.isLoading}
            >
              <TrashIcon className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          </div>

          {/* Mobile: Dropdown */}
          <div className="md:hidden relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={operation.isLoading}
            >
              Actions
              <ChevronDownIcon className={cn('w-4 h-4 ml-1.5 transition-transform', showDropdown && 'rotate-180')} />
            </Button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50"
                >
                  {actionButtons.map(({ action, label, icon: Icon }) => (
                    <button
                      key={action}
                      onClick={() => handleActionClick(action)}
                      className={cn(
                        'w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors first:rounded-t-xl last:rounded-b-xl',
                        action === 'delete'
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-slate-300 hover:bg-slate-800'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Progress Modal */}
      <Modal
        isOpen={operation.isLoading}
        onClose={() => {}}
        title="Processing..."
        description={`${operation.action === 'delete' ? 'Deleting' : 'Processing'} ${selectedIds.length} quotes`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{operation.currentItem}</span>
            <span className="text-slate-300">{operation.progress}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${operation.progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingAction(null);
        }}
        title="Delete Quotes"
        description={`Are you sure you want to delete ${selectedIds.length} quotes? This action cannot be undone.`}
      >
        <div className="flex items-center gap-3 p-4 bg-red-950/30 rounded-lg mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">
            All selected quote data will be permanently removed.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              setShowConfirmModal(false);
              setPendingAction(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="custom"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleConfirmDelete}
          >
            Delete {selectedIds.length} Quotes
          </Button>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setPendingAction(null);
        }}
        title="Change Status"
        description={`Change status for ${selectedIds.length} quotes to:`}
      >
        <div className="grid grid-cols-2 gap-2 mb-6">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={cn(
                'px-4 py-3 text-sm font-medium rounded-lg border transition-all',
                selectedStatus === status.value
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              setShowStatusModal(false);
              setPendingAction(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmStatusChange}>
            Update Status
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default BulkActions;
