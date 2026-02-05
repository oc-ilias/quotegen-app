/**
 * Terms & Notes Step - Enhanced
 * @module components/wizard/steps/TermsNotesStepEnhanced
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CalendarIcon, DocumentTextIcon, ClockIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface TermsNotesData {
  valid_until: string;
  notes?: string;
  terms?: string;
  internal_notes?: string;
}

interface TermsNotesStepEnhancedProps {
  data: TermsNotesData;
  onUpdate: (data: Partial<TermsNotesData>) => void;
  error?: string;
}

export function TermsNotesStepEnhanced({
  data,
  onUpdate,
  error,
}: TermsNotesStepEnhancedProps) {
  const validUntil = data.valid_until ? new Date(data.valid_until).toISOString().split('T')[0] : '';

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Terms & Notes</h2>
        <p className="text-slate-400">Set payment terms, delivery options, and add any additional notes.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Valid Until */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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

            <div className="space-y-3">
              <label className="block text-sm text-slate-300">Valid Until *</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => onUpdate({ valid_until: new Date(e.target.value).toISOString() })}
                className={cn(
                  'w-full px-4 py-3 bg-slate-800 border rounded-lg text-slate-200 focus:ring-2 transition-all',
                  error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
                )}
              />
              <p className="text-xs text-slate-500">
                Quote will expire on {validUntil ? new Date(validUntil).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </motion.div>

          {/* Terms */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Terms & Conditions</h3>
                <p className="text-sm text-slate-500">Payment and delivery terms</p>
              </div>
            </div>

            <textarea
              value={data.terms || ''}
              onChange={(e) => onUpdate({ terms: e.target.value })}
              placeholder="Payment terms, delivery conditions, warranty info..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
            />
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Customer Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Customer Notes</h3>
                <p className="text-sm text-slate-500">Visible to customer on quote</p>
              </div>
            </div>

            <textarea
              value={data.notes || ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Add any special instructions or notes for the customer..."
              rows={4}
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
              value={data.internal_notes || ''}
              onChange={(e) => onUpdate({ internal_notes: e.target.value })}
              placeholder="Add internal notes, reminders, or comments..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
            />
          </motion.div>

          {/* Tips */}
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

export default TermsNotesStepEnhanced;
