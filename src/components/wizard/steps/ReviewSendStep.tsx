/**
 * Review and Send Step Component
 * Step 5: Review quote details and send
 * @module components/wizard/steps/ReviewSendStep
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { QuoteFormData } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface ReviewSendStepProps {
  /** Quote data for review */
  data: {
    customer: QuoteFormData['customer'];
    line_items: QuoteFormData['line_items'];
    title: string;
    notes?: string;
    terms?: string;
    valid_until?: string;
  };
  /** Submit handler */
  onSubmit: () => Promise<void>;
  /** Submitting state */
  isSubmitting: boolean;
  /** Error message */
  error?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

type SendMethod = 'email' | 'link' | 'download';
type ActiveTab = 'preview' | 'details';

interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

// ============================================================================
// Main Component
// ============================================================================

export function ReviewSendStep({
  data,
  onSubmit,
  isSubmitting,
  error,
  'data-testid': testId,
}: ReviewSendStepProps) {
  // ============================================================================
  // State
  // ============================================================================
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [sendMethod, setSendMethod] = useState<SendMethod>('email');
  const [retryCount, setRetryCount] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // ============================================================================
  // Calculations
  // ============================================================================
  const totals = useMemo(() => {
    const subtotal = data.line_items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const discount = itemTotal * (item.discount_percent || 0) / 100;
      return sum + itemTotal - discount;
    }, 0);

    const discountTotal = data.line_items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      return sum + itemTotal * (item.discount_percent || 0) / 100;
    }, 0);

    const taxTotal = data.line_items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const discount = itemTotal * (item.discount_percent || 0) / 100;
      const taxableAmount = itemTotal - discount;
      return sum + (taxableAmount * (item.tax_rate || 0) / 100);
    }, 0);

    const total = subtotal + taxTotal;

    return { subtotal, discountTotal, taxTotal, total };
  }, [data.line_items]);

  // ============================================================================
  // Validation
  // ============================================================================
  const validationErrors = useMemo((): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!data.customer.name?.trim()) {
      errors.push({ field: 'customer.name', message: 'Customer name is required' });
    }

    if (!data.customer.email?.trim()) {
      errors.push({ field: 'customer.email', message: 'Customer email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer.email)) {
      errors.push({ field: 'customer.email', message: 'Invalid email address' });
    }

    if (data.line_items.length === 0) {
      errors.push({ field: 'line_items', message: 'At least one line item is required' });
    }

    data.line_items.forEach((item, index) => {
      if (!item.name?.trim()) {
        errors.push({ field: `line_items[${index}].name`, message: `Line item ${index + 1}: Name is required` });
      }
      if (item.quantity <= 0) {
        errors.push({ field: `line_items[${index}].quantity`, message: `Line item ${index + 1}: Invalid quantity` });
      }
    });

    return errors;
  }, [data]);

  const hasErrors = validationErrors.length > 0;

  // ============================================================================
  // Handlers
  // ============================================================================
  const handleSubmit = useCallback(async () => {
    if (hasErrors) return;

    try {
      setLocalError(null);
      await onSubmit();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send quote';
      setLocalError(errorMessage);
    }
  }, [hasErrors, onSubmit]);

  const handleRetry = useCallback(async () => {
    if (retryCount >= 3) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLocalError(null);
      await handleSubmit();
      setRetryCount(0);
    } catch (err) {
      // Error persists
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, handleSubmit]);

  // ============================================================================
  // Render Helpers
  // ============================================================================
  const displayError = localError || error;

  return (
    <div className="p-6 lg:p-8" data-testid={testId}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Review & Send</h2>
        <p className="text-slate-400">Review your quote before sending it to the customer.</p>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                {displayError}
              </p>
              {retryCount < 3 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                  Retry
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Warnings */}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
          >
            <p className="text-amber-400 text-sm flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
              Please complete all required fields before sending
            </p>
            <ul className="mt-2 space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i} className="text-xs text-amber-400/80 flex items-center gap-1">
                  <span className="w-1 h-1 bg-amber-400 rounded-full" />
                  {err.message}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 p-1 bg-slate-800 rounded-lg w-fit"
          >
            {(['preview', 'details'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                data-testid={`tab-${tab}`}
              >
                {tab}
              </button>
            ))}
          </motion.div>

          {/* Quote Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl overflow-hidden"
          >
            {/* Quote Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">{data.title || 'Quote'}</h3>
                  <p className="text-indigo-200 mt-1">
                    Valid until {data.valid_until ? new Date(data.valid_until).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-indigo-200">Quote #</p>
                  <p className="text-xl font-semibold">QT-2024-001</p>
                </div>
              </div>
            </div>

            {/* Quote Body */}
            <div className="p-6 text-slate-900">
              {/* Customer Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Bill To</h4>
                <div className="text-gray-900">
                  <p className="font-semibold">{data.customer.company || data.customer.name}</p>
                  <p>{data.customer.name}</p>
                  <p className="text-gray-600">{data.customer.email}</p>
                  {data.customer.phone && <p className="text-gray-600">{data.customer.phone}</p>}
                </div>
              </div>

              {/* Line Items */}
              <div className="mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm font-semibold text-gray-600">Item</th>
                        <th className="text-right py-3 text-sm font-semibold text-gray-600">Qty</th>
                        <th className="text-right py-3 text-sm font-semibold text-gray-600">Price</th>
                        <th className="text-right py-3 text-sm font-semibold text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.line_items.map((item, index) => {
                        const itemSubtotal = item.quantity * item.unit_price;
                        const discount = itemSubtotal * (item.discount_percent || 0) / 100;
                        const total = itemSubtotal - discount;

                        return (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-4">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              {item.description && (
                                <p className="text-sm text-gray-500">{item.description}</p>
                              )}
                            </td>
                            <td className="text-right py-4 text-gray-900">{item.quantity}</td>
                            <td className="text-right py-4 text-gray-600">{formatCurrency(item.unit_price)}</td>
                            <td className="text-right py-4 font-medium text-gray-900">{formatCurrency(total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>

                    {totals.discountTotal > 0 && (
                      <div className="flex justify-between text-emerald-600"
                      >
                        <span>Discount</span>
                        <span>-{formatCurrency(totals.discountTotal)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>{formatCurrency(totals.taxTotal)}</span>
                    </div>

                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {data.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{data.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Send Options */}
        <div className="space-y-6">
          {/* Send Method */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5"
          >
            <h3 className="font-semibold text-slate-200 mb-4">Send Quote</h3>

            <div className="space-y-3">
              {[
                { id: 'email', label: 'Email', icon: PaperAirplaneIcon, desc: 'Send via email' },
                { id: 'link', label: 'Share Link', icon: EyeIcon, desc: 'Copy shareable link' },
                { id: 'download', label: 'Download PDF', icon: ArrowDownTrayIcon, desc: 'Download as PDF' },
              ].map((method) => (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSendMethod(method.id as SendMethod)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    sendMethod === method.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                  data-testid={`send-method-${method.id}`}
                >
                  <method.icon className={`w-5 h-5 ${sendMethod === method.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <div>
                    <p className={`font-medium ${sendMethod === method.id ? 'text-slate-200' : 'text-slate-400'}`}>
                      {method.label}
                    </p>
                    <p className="text-sm text-slate-500">{method.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: hasErrors ? 1 : 1.02 }}
              whileTap={{ scale: hasErrors ? 1 : 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting || hasErrors || isRetrying}
              className={`w-full mt-6 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                hasErrors
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              data-testid="send-quote-button"
            >
              {isSubmitting || isRetrying ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                  </motion.div>
                  {isRetrying ? 'Retrying...' : 'Sending...'}
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-5 h-5" />
                  Send Quote
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5"
          >
            <h3 className="font-semibold text-slate-200 mb-4">Quote Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Items</span>
                <span className="text-slate-300">{data.line_items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Customer</span>
                <span className="text-slate-300 truncate max-w-[150px]">{data.customer.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="text-indigo-400 font-semibold">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              {hasErrors ? (
                <div className="flex items-center gap-2 text-sm text-amber-400">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>Missing required fields</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-400"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Ready to send</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-300/70">
                Your quote will be securely sent and tracked. Customers can view and respond online.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ReviewSendStep;
