/**
 * Terms and Notes Step Component
 * Step 4: Set payment terms, validity, and add notes
 */

'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  CreditCardIcon,
  TruckIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import type { TermsNotesData } from '@/types/quote';

interface TermsNotesStepProps {
  data: TermsNotesData;
  onUpdate: (data: Partial<TermsNotesData>) => void;
  error?: string;
}

const PAYMENT_TERMS_OPTIONS = [
  { value: 'Net 15', label: 'Net 15 - Payment due in 15 days' },
  { value: 'Net 30', label: 'Net 30 - Payment due in 30 days' },
  { value: 'Net 60', label: 'Net 60 - Payment due in 60 days' },
  { value: 'Due on Receipt', label: 'Due on Receipt - Immediate payment' },
  { value: '50% Deposit', label: '50% Deposit - 50% upfront, 50% on delivery' },
];

const DELIVERY_TERMS_OPTIONS = [
  { value: 'Standard (5-7 days)', label: 'Standard Shipping (5-7 business days)' },
  { value: 'Express (2-3 days)', label: 'Express Shipping (2-3 business days)' },
  { value: 'Overnight', label: 'Overnight Shipping' },
  { value: 'Pickup', label: 'Customer Pickup' },
  { value: 'Custom', label: 'Custom Delivery Terms' },
];

export function TermsNotesStep({ data, onUpdate, error }: TermsNotesStepProps) {
  const handleUpdate = useCallback((field: keyof TermsNotesData, value: unknown) => {
    onUpdate({ [field]: value });
  }, [onUpdate]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Terms & Notes</h2>
        <p className="text-slate-400">Set payment terms, delivery options, and add any additional notes.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm flex items-center gap-2">
            <ExclamationCircleIcon className="w-5 h-5" />
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Terms */}
        <div className="space-y-6">
          {/* Payment Terms */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-slate-200">Payment Terms</h3>
            </div>

            <select
              value={data.paymentTerms}
              onChange={(e) => handleUpdate('paymentTerms', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              {PAYMENT_TERMS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Deposit Required */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.depositRequired}
                  onChange={(e) => handleUpdate('depositRequired', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-slate-300">Require deposit</span>
              </label>

              <AnimatePresence>
                {data.depositRequired && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <label className="block text-sm text-slate-400 mb-2">Deposit Percentage</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={data.depositPercentage}
                        onChange={(e) => handleUpdate('depositPercentage', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Delivery Terms */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <TruckIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-slate-200">Delivery Terms</h3>
            </div>

            <select
              value={data.deliveryTerms}
              onChange={(e) => handleUpdate('deliveryTerms', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              {DELIVERY_TERMS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Validity Period */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Quote Validity</h3>
                <p className="text-sm text-slate-500">How long is this quote valid?</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max="365"
                value={data.validityPeriod}
                onChange={(e) => handleUpdate('validityPeriod', parseInt(e.target.value) || 30)}
                className="w-24 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <span className="text-slate-400">days</span>
            </div>

            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-400">
                  This quote will expire on {new Date(Date.now() + data.validityPeriod * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Notes */}
        <div className="space-y-6">
          {/* Customer Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Customer Notes</h3>
                <p className="text-sm text-slate-500">Visible to customer on quote</p>
              </div>
            </div>

            <textarea
              value={data.notes}
              onChange={(e) => handleUpdate('notes', e.target.value)}
              placeholder="Add any special instructions, terms, or notes for the customer..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
            />
          </motion.div>

          {/* Internal Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Internal Notes</h3>
                <p className="text-sm text-slate-500">Only visible to your team</p>
              </div>
            </div>

            <textarea
              value={data.internalNotes}
              onChange={(e) => handleUpdate('internalNotes', e.target.value)}
              placeholder="Add internal notes, reminders, or comments..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
            />
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-indigo-300 mb-2">Pro Tips</h4>
                <ul className="space-y-1 text-sm text-indigo-200/70">
                  <li>• Be specific about payment deadlines</li>
                  <li>• Include shipping costs if applicable</li>
                  <li>• Note any special warranty terms</li>
                  <li>• Set realistic validity periods</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Add missing import
import { AnimatePresence } from 'framer-motion';

export default TermsNotesStep;
