/**
 * QuoteWizard Component
 * Multi-step wizard for creating quotes
 * @module components/wizard/QuoteWizard
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  ShoppingBagIcon,
  ListBulletIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useQuoteWizard } from '@/hooks/useQuoteWizard';
import { WIZARD_STEPS } from '@/types/quote';
import type { WizardStep, QuoteFormData } from '@/types/quote';

interface QuoteWizardProps {
  onComplete?: (quote: QuoteFormData) => Promise<void>;
  onCancel?: () => void;
  shopId?: string;
}

const stepConfig: Record<WizardStep, {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  'customer-info': {
    label: 'Customer',
    description: 'Select or create customer',
    icon: UserIcon,
  },
  'product-selection': {
    label: 'Products',
    description: 'Choose products',
    icon: ShoppingBagIcon,
  },
  'line-items': {
    label: 'Line Items',
    description: 'Configure items',
    icon: ListBulletIcon,
  },
  'terms-notes': {
    label: 'Terms',
    description: 'Set terms & notes',
    icon: DocumentTextIcon,
  },
  'review-send': {
    label: 'Review',
    description: 'Review & send',
    icon: CheckCircleIcon,
  },
};

const QuoteWizard: React.FC<QuoteWizardProps> = ({
  onComplete,
  onCancel,
  shopId = 'default-shop',
}) => {
  const {
    currentStep,
    isLoading,
    error,
    formData,
    canProceed,
    canGoBack,
    progress,
    goToStep,
    nextStep,
    previousStep,
    updateFormData,
    submitQuote,
    reset,
  } = useQuoteWizard({
    shopId,
    onComplete,
  });

  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;

  const handleSubmit = async () => {
    try {
      await submitQuote();
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((stepItem, index) => {
            const config = stepConfig[stepItem.id];
            const Icon = config.icon;
            const isActive = stepItem.id === currentStep;
            const isCompleted = index < currentStepIndex;
            const isClickable = index <= currentStepIndex;

            return (
              <React.Fragment key={stepItem.id}>
                {/* Step Circle */}
                <motion.button
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  onClick={() => isClickable && goToStep(stepItem.id)}
                  disabled={!isClickable}
                  className={`
                    flex flex-col items-center gap-2 group
                    ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                  `}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${config.label}`}
                >
                  <motion.div
                    animate={{
                      backgroundColor: isActive
                        ? '#4f46e5'
                        : isCompleted
                        ? '#10b981'
                        : '#1e293b',
                      borderColor: isActive
                        ? '#4f46e5'
                        : isCompleted
                        ? '#10b981'
                        : '#374151',
                    }}
                    className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors"
                  >
                    <motion.div
                      animate={{
                        color: isActive || isCompleted ? '#ffffff' : '#9ca3af',
                      }}
                    >
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </motion.div>
                  </motion.div>

                  <div className="text-center">
                    <p
                      className={`
                      text-sm font-medium transition-colors
                      ${isActive ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'}
                    `}
                    >
                      {config.label}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">{config.description}</p>
                  </div>
                </motion.button>

                {index < WIZARD_STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 bg-gray-700 relative overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-y-0 left-0 bg-green-500"
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-900/50 rounded-2xl border border-slate-800 min-h-[400px] p-6"
      >
        <div className="text-center text-slate-400">
          <p className="text-lg font-medium text-slate-200">
            {stepConfig[currentStep].label}
          </p>
          <p className="mt-2">{stepConfig[currentStep].description}</p>

          <div className="mt-8 text-left max-w-md mx-auto">
            <p className="text-sm text-slate-500 mb-2">Quote: {formData.title}</p>
            <p className="text-sm text-slate-500 mb-2">Customer: {formData.customer.name || 'Not set'}</p>
            <p className="text-sm text-slate-500 mb-2">Email: {formData.customer.email || 'Not set'}</p>
            <p className="text-sm text-slate-500">Items: {formData.line_items.length} line items</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={isFirstStep ? onCancel : previousStep}
          disabled={isLoading}
          className="px-6 py-2.5 text-gray-300 font-medium hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
        >
          {isFirstStep ? 'Cancel' : 'Previous'}
        </button>

        <motion.button
          whileHover={{ scale: canProceed ? 1.02 : 1 }}
          whileTap={{ scale: canProceed ? 0.98 : 1 }}
          onClick={isLastStep ? handleSubmit : nextStep}
          disabled={!canProceed || isLoading}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </>
          ) : (
            <>
              {isLastStep ? 'Create Quote' : 'Continue'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </motion.button>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-center text-xs text-slate-500 mt-2">
          Step {currentStepIndex + 1} of {WIZARD_STEPS.length}
        </p>
      </div>
    </div>
  );
};

export default QuoteWizard;
