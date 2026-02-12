/**
 * Quote Actions Component
 * Context-aware action buttons based on quote status
 * @module components/quotes/QuoteActions
 */

'use client';

import React, { useState, useCallback } from 'react';
import { getQuoteActions, canEditQuote, type StatusAction } from '@/lib/quoteWorkflow';
import { QuoteStatus } from '@/types/quote';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface QuoteActionsProps {
  quoteId: string;
  currentStatus: QuoteStatus;
  quoteNumber?: string;
  onStatusChange?: (newStatus: QuoteStatus, comment?: string) => Promise<void>;
  onEdit?: () => void;
  onView?: () => void;
  onDownload?: () => void;
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'dropdown';
}

interface ConfirmationState {
  isOpen: boolean;
  action?: StatusAction;
  comment: string;
}

// ============================================================================
// Icons
// ============================================================================

const icons: Record<string, React.FC<{ className?: string }>> = {
  PencilIcon: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  PaperAirplaneIcon: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  CheckCircleIcon: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  XCircleIcon: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  EyeIcon: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  ClockIcon: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CalendarIcon: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  ShoppingCartIcon: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

// ============================================================================
// Component
// ============================================================================

export const QuoteActions: React.FC<QuoteActionsProps> = ({
  quoteId,
  currentStatus,
  quoteNumber,
  onStatusChange,
  onEdit,
  onView,
  onDownload,
  isLoading = false,
  className,
  size = 'md',
  variant = 'default',
}) => {
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    comment: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Combined loading state - any loading should disable all buttons
  const isAnyLoading = isLoading || isProcessing;

  // Get available actions based on current status
  const actions = getQuoteActions(currentStatus);

  // Handle action click
  const handleActionClick = useCallback((action: StatusAction) => {
    if (action.requiresConfirmation) {
      setConfirmation({
        isOpen: true,
        action,
        comment: '',
      });
    } else {
      executeStatusChange(action);
    }
  }, []);

  // Execute status change
  const executeStatusChange = useCallback(async (action: StatusAction, comment?: string) => {
    setIsProcessing(true);
    try {
      await onStatusChange?.(action.status, comment);
    } catch (error) {
      console.error('Failed to change status:', error);
    } finally {
      setIsProcessing(false);
      setConfirmation({ isOpen: false, comment: '' });
    }
  }, [onStatusChange]);

  // Handle confirmation submit
  const handleConfirm = useCallback(() => {
    if (confirmation.action) {
      executeStatusChange(confirmation.action, confirmation.comment);
    }
  }, [confirmation, executeStatusChange]);

  // Handle confirmation cancel
  const handleCancel = useCallback(() => {
    setConfirmation({ isOpen: false, comment: '' });
  }, []);

  // Render icon
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = icons[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="w-4 h-4" />;
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Compact variant (icon only for small screens)
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {canEditQuote(currentStatus) && onEdit && (
          <Button
            variant="ghost"
            size={size}
            onClick={onEdit}
            isLoading={isAnyLoading}
            disabled={isAnyLoading}
            className={sizeClasses[size]}
          >
            {renderIcon('PencilIcon')}
          </Button>
        )}
        
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant}
            size={size}
            onClick={() => handleActionClick(action)}
            isLoading={isAnyLoading}
            disabled={isAnyLoading}
            className={sizeClasses[size]}
          >
            {renderIcon(action.icon)}
          </Button>
        ))}

        {onView && (
          <Button
            variant="ghost"
            size={size}
            onClick={onView}
            isLoading={isAnyLoading}
            disabled={isAnyLoading}
            className={sizeClasses[size]}
          >
            {renderIcon('EyeIcon')}
          </Button>
        )}

        <ConfirmationModal
          confirmation={confirmation}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onCommentChange={(comment) => setConfirmation(prev => ({ ...prev, comment }))}
          isProcessing={isProcessing}
          quoteNumber={quoteNumber}
        />
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Edit button for editable statuses */}
      {canEditQuote(currentStatus) && onEdit && (
        <Button
          variant="secondary"
          size={size}
          onClick={onEdit}
          isLoading={isAnyLoading}
          disabled={isAnyLoading}
        >
          {renderIcon('PencilIcon')}
          <span className="ml-2">Edit</span>
        </Button>
      )}

      {/* View button */}
      {onView && (
        <Button
          variant="ghost"
          size={size}
          onClick={onView}
          isLoading={isAnyLoading}
          disabled={isAnyLoading}
        >
          {renderIcon('EyeIcon')}
          <span className="ml-2">View</span>
        </Button>
      )}

      {/* Download button */}
      {onDownload && (
        <Button
          variant="ghost"
          size={size}
          onClick={onDownload}
          isLoading={isAnyLoading}
          disabled={isAnyLoading}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="ml-2">Download PDF</span>
        </Button>
      )}

      <hr className="w-px h-6 bg-slate-700 mx-2" />

      {/* Status action buttons */}
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant}
          size={size}
          onClick={() => handleActionClick(action)}
          isLoading={isAnyLoading}
          disabled={isAnyLoading}
        >
          {renderIcon(action.icon)}
          <span className="ml-2">{action.label}</span>
        </Button>
      ))}

      <ConfirmationModal
        confirmation={confirmation}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onCommentChange={(comment) => setConfirmation(prev => ({ ...prev, comment }))}
        isProcessing={isProcessing}
        quoteNumber={quoteNumber}
      />
    </div>
  );
};

// ============================================================================
// Confirmation Modal Component
// ============================================================================

interface ConfirmationModalProps {
  confirmation: ConfirmationState;
  onConfirm: () => void;
  onCancel: () => void;
  onCommentChange: (comment: string) => void;
  isProcessing: boolean;
  quoteNumber?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  confirmation,
  onConfirm,
  onCancel,
  onCommentChange,
  isProcessing,
  quoteNumber,
}) => {
  if (!confirmation.action) return null;

  const isRejection = confirmation.action.status === QuoteStatus.REJECTED;
  const isAcceptance = confirmation.action.status === QuoteStatus.ACCEPTED;

  return (
    <Modal
      isOpen={confirmation.isOpen}
      onClose={onCancel}
      title={confirmation.action.label}
      description={confirmation.action.confirmationMessage}
      size="md"
    >
      <div className="space-y-4">
        {quoteNumber && (
          <p className="text-sm text-slate-400">
            Quote: <span className="font-medium text-slate-200">{quoteNumber}</span>
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {isRejection ? 'Reason for declining (optional)' : 'Add a comment (optional)'}
          </label>
          <textarea
            value={confirmation.comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder={
              isRejection
                ? 'Please provide a reason for declining this quote...'
                : 'Add any notes about this status change...'
            }
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] resize-y"
            disabled={isProcessing}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant={isAcceptance ? 'primary' : isRejection ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isProcessing}
          >
            {isAcceptance && 'Accept Quote'}
            {isRejection && 'Decline Quote'}
            {!isAcceptance && !isRejection && 'Confirm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QuoteActions;
