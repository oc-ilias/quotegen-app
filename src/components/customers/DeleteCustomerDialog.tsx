/**
 * Delete Customer Dialog Component
 * Confirmation dialog for deleting customers
 * @module components/customers/DeleteCustomerDialog
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  TrashIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import type { CustomerWithStats } from '@/types/quote';

interface DeleteCustomerDialogProps {
  customer: CustomerWithStats | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

export const DeleteCustomerDialog: React.FC<DeleteCustomerDialogProps> = ({
  customer,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  const { success, error: showError } = useToastHelpers();
  const [confirmText, setConfirmText] = useState('');

  const hasQuotes = customer ? customer.stats.totalQuotes > 0 : false;
  const expectedConfirmText = customer ? `delete ${customer.contactName}` : '';
  const canDelete = confirmText.toLowerCase() === expectedConfirmText.toLowerCase();

  const handleConfirm = async () => {
    if (!customer) return;

    try {
      await onConfirm(customer.id);
      success(
        hasQuotes ? 'Customer archived successfully' : 'Customer deleted successfully'
      );
      setConfirmText('');
      onClose();
    } catch (err) {
      showError(
        'Failed to delete customer',
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Customer"
      size="md"
    >
      <div className="space-y-6">
        {/* Warning Icon */}
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20"
          >
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </motion.div>
        </div>

        {/* Warning Text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-100 mb-2">
            Are you sure?
          </h3>
          <p className="text-slate-400">
            This action cannot be undone.
          </p>
        </div>

        {/* Customer Info */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-100">{customer.contactName}</p>
              <p className="text-sm text-slate-500">{customer.companyName}</p>
            </div>
          </div>

          {hasQuotes && (
            <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <div className="flex items-start gap-2">
                <DocumentTextIcon className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-200">
                    This customer has {customer.stats.totalQuotes} quote{customer.stats.totalQuotes !== 1 ? 's' : ''}.
                  </p>
                  <p className="text-sm text-amber-200/70 mt-1">
                    They will be archived instead of deleted to preserve quote history.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Input */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Type <span className="text-slate-200 font-medium">"delete {customer.contactName}"</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`delete ${customer.contactName}`}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            isLoading={isDeleting}
            disabled={!canDelete || isDeleting}
            className="flex-1"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            {hasQuotes ? 'Archive Customer' : 'Delete Customer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteCustomerDialog;
