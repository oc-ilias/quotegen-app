/**
 * New Quote Page
 * Create a new quote using the quote wizard
 * @module app/dashboard/quotes/new/page
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import QuoteWizard from '@/components/wizard/QuoteWizard';
import { QuoteFormData, QuoteStatus } from '@/types/quote';

export default function NewQuotePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // In production, this would call the API
      // const response = await fetch('/api/quotes', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success - redirect to quotes list
      router.push('/dashboard/quotes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quote');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/quotes');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.push('/dashboard/quotes')}
          className="text-slate-400 hover:text-slate-200 text-sm mb-4 flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Quotes
        </button>

        <h1 className="text-3xl font-bold text-slate-100">Create New Quote</h1>
        <p className="text-slate-400 mt-2">
          Follow the steps below to create and send a professional quote to your customer.
        </p>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Wizard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
      >
        <QuoteWizard
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </motion.div>
    </div>
  );
}
