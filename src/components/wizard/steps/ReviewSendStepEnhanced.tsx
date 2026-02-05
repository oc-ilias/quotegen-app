/**
 * Review & Send Step - Enhanced
 * @module components/wizard/steps/ReviewSendStepEnhanced
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  LoaderIcon,
} from '@heroicons/react/24/outline';
import type { QuoteFormData } from '@/types/quote';

interface ReviewSendStepEnhancedProps {
  data: QuoteFormData;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  error?: string;
  mode?: 'create' | 'edit';
}

export function ReviewSendStepEnhanced({
  data,
  onSubmit,
  isSubmitting,
  error,
  mode = 'create',
}: ReviewSendStepEnhancedProps) {
  const [sendMethod, setSendMethod] = useState<'email' | 'link' | 'download'>('email');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency || 'USD',
    }).format(value);
  };

  const hasErrors = !data.customer?.email || !data.line_items?.length;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Review & Send</h2>
        <p className="text-slate-400">Review your quote before {mode === 'create' ? 'sending' : 'updating'} it.</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400"
        >
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            {error}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Preview */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-white">{data.title || 'Quote'}</h3>
                  <p className="text-indigo-200 mt-1">
                    Valid until {data.valid_until ? new Date(data.valid_until).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-indigo-200">Quote #</p>
                  <p className="text-xl font-semibold text-white">QT-2024-001</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Customer */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Bill To</h4>
                <div className="text-slate-200">
                  <p className="font-medium">{data.customer?.company || data.customer?.name}</p>
                  <p className="text-slate-400">{data.customer?.name}</p>
                  <p className="text-slate-400">{data.customer?.email}</p>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 text-xs font-semibold text-slate-500">Item</th>
                      <th className="text-right py-3 text-xs font-semibold text-slate-500">Qty</th>
                      <th className="text-right py-3 text-xs font-semibold text-slate-500">Price</th>
                      <th className="text-right py-3 text-xs font-semibold text-slate-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.line_items?.map((item, index) => {
                      const total = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
                      return (
                        <tr key={index} className="border-b border-slate-800">
                          <td className="py-3">
                            <p className="font-medium text-slate-200">{item.name}</p>
                            {item.description && <p className="text-sm text-slate-500">{item.description}</p>}
                          </td>
                          <td className="text-right py-3 text-slate-300">{item.quantity}</td>
                          <td className="text-right py-3 text-slate-400">{formatCurrency(item.unit_price)}</td>
                          <td className="text-right py-3 font-medium text-slate-200">{formatCurrency(total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t border-slate-800 pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="text-slate-300">{formatCurrency(data.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Tax</span>
                      <span className="text-slate-300">{formatCurrency(data.tax_total)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-800 pt-2">
                      <span className="text-slate-200">Total</span>
                      <span className="text-indigo-400">{formatCurrency(data.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {data.notes && (
                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Notes</h4>
                  <p className="text-slate-400 text-sm">{data.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <h3 className="font-semibold text-slate-200 mb-4">{mode === 'create' ? 'Send Quote' : 'Update Quote'}</h3>

            <div className="space-y-3">
              {[
                { id: 'email', label: 'Email', icon: EnvelopeIcon, desc: 'Send via email' },
                { id: 'link', label: 'Share Link', icon: DocumentTextIcon, desc: 'Copy shareable link' },
                { id: 'download', label: 'Download PDF', icon: ArrowDownTrayIcon, desc: 'Download as PDF' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSendMethod(method.id as typeof sendMethod)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                    sendMethod === method.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  )}
                >
                  <method.icon className={cn(
                    'w-5 h-5',
                    sendMethod === method.id ? 'text-indigo-400' : 'text-slate-400'
                  )} />
                  <div>
                    <p className={cn(
                      'font-medium',
                      sendMethod === method.id ? 'text-slate-200' : 'text-slate-400'
                    )}>{method.label}</p>
                    <p className="text-sm text-slate-500">{method.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: hasErrors ? 1 : 1.02 }}
              whileTap={{ scale: hasErrors ? 1 : 0.98 }}
              onClick={onSubmit}
              disabled={isSubmitting || hasErrors}
              className={cn(
                'w-full mt-4 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
                hasErrors
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25'
              )}
            >
              {isSubmitting ? (
                <>
                  <LoaderIcon className="w-5 h-5 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-5 h-5" />
                  {mode === 'create' ? 'Send Quote' : 'Update Quote'}
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

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Items</span>
                <span className="text-slate-300">{data.line_items?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer</span>
                <span className="text-slate-300 truncate max-w-[120px]">{data.customer?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="text-indigo-400 font-semibold">{formatCurrency(data.total)}</span>
              </div>
            </div>

            {!hasErrors && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Ready to {mode === 'create' ? 'send' : 'update'}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ReviewSendStepEnhanced;
