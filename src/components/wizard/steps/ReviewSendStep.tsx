/**
 * Review and Send Step Component
 * Step 5: Review quote details and send
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  CheckIcon,
} from '@heroicons/react/24/outline';
import type { QuoteFormData } from '@/types/quote';

interface ReviewSendStepProps {
  data: {
    customer: QuoteFormData['customer'];
    line_items: QuoteFormData['line_items'];
    title: string;
    notes?: string;
    terms?: string;
    valid_until?: string;
  };
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

export function ReviewSendStep({ data, onSubmit, isSubmitting, error }: ReviewSendStepProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'details'>('preview');
  const [sendMethod, setSendMethod] = useState<'email' | 'link' | 'download'>('email');

  // Calculate totals with null safety
  const totals = React.useMemo(() => {
    const lineItems = data.line_items || [];
    const subtotal = lineItems.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
      const discount = itemTotal * (item.discount_percent || 0) / 100;
      return sum + itemTotal - discount;
    }, 0);

    const taxTotal = lineItems.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
      const discount = itemTotal * (item.discount_percent || 0) / 100;
      const taxableAmount = itemTotal - discount;
      return sum + (taxableAmount * (item.tax_rate || 0) / 100);
    }, 0);

    const total = subtotal + taxTotal;

    return { subtotal, taxTotal, total };
  }, [data.line_items]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleSubmit = async () => {
    try {
      await onSubmit();
    } catch (err) {
      // Error handled by parent
    }
  };

  const lineItems = data.line_items || [];
  const hasErrors = lineItems.length === 0 || !data.customer?.name || !data.customer?.email;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Review & Send</h2>
        <p className="text-slate-400">Review your quote before sending it to the customer.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
        >
          <p className="text-red-400 text-sm flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            {error}
          </p>
        </motion.div>
      )}

      {/* Validation Warnings */}
      {hasErrors && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-400 text-sm flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            Please complete all required fields before sending
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg w-fit">
            {(['preview', 'details'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Quote Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
            <div className="p-6">
              {/* Customer Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Bill To</h4>
                <div className="text-gray-900">
                  <p className="font-semibold">{data.customer?.company || data.customer?.name || 'Not specified'}</p>
                  <p>{data.customer?.name}</p>
                  <p className="text-gray-600">{data.customer?.email}</p>
                  {data.customer?.phone && <p className="text-gray-600">{data.customer.phone}</p>}
                </div>
              </div>

              {/* Line Items */}
              <div className="mb-6">
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
                    {lineItems.map((item, index) => {
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

              {/* Totals */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
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
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <h3 className="font-semibold text-slate-200 mb-4">Send Quote</h3>

            <div className="space-y-3">
              {[
                { id: 'email', label: 'Email', icon: PaperAirplaneIcon, desc: 'Send via email' },
                { id: 'link', label: 'Share Link', icon: EyeIcon, desc: 'Copy shareable link' },
                { id: 'download', label: 'Download PDF', icon: ArrowDownTrayIcon, desc: 'Download as PDF' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSendMethod(method.id as typeof sendMethod)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    sendMethod === method.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <method.icon className={`w-5 h-5 ${sendMethod === method.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <div>
                    <p className={`font-medium ${sendMethod === method.id ? 'text-slate-200' : 'text-slate-400'}`}>
                      {method.label}
                    </p>
                    <p className="text-sm text-slate-500">{method.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: hasErrors ? 1 : 1.02 }}
              whileTap={{ scale: hasErrors ? 1 : 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting || hasErrors}
              className={`w-full mt-6 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                hasErrors
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
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
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <h3 className="font-semibold text-slate-200 mb-4">Quote Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Items</span>
                <span className="text-slate-300">{lineItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Customer</span>
                <span className="text-slate-300 truncate max-w-[150px]">{data.customer?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="text-indigo-400 font-semibold">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Ready to send</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ReviewSendStep;
