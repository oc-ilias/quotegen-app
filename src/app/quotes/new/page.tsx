/**
 * New Quote Page
 * Create a new quote using the wizard
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { QuoteWizard } from '@/components/wizard/QuoteWizard';
import type { QuoteFormData } from '@/types/quote';

export default function NewQuotePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    
    try {
      // In production, this would send to API
      console.log('Creating quote with data:', data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Navigate to quotes list
      router.push('/quotes');
    } catch (error) {
      console.error('Failed to create quote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/quotes');
  };

  return (
    <DashboardLayout activeNavItem="quotes">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/quotes"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Quotes
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Create New Quote</h1>
          <p className="mt-1 text-slate-400">
            Create a professional quote for your customer in just a few steps.
          </p>
        </motion.div>
      </div>

      {/* Wizard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
      >
        <QuoteWizard
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </motion.div>
    </DashboardLayout>
  );
}
