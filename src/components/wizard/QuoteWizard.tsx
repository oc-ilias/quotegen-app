/**
 * QuoteWizard Component
 * Multi-step wizard for creating quotes
 * @module components/wizard/QuoteWizard
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  ShoppingBagIcon,
  ListBulletIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useQuoteWizard } from '@/hooks/useQuoteWizard';
import CustomerInfoStep from './steps/CustomerInfoStep';
import ProductSelectionStep from './steps/ProductSelectionStep';
import LineItemsStep from './steps/LineItemsStep';
import TermsNotesStep from './steps/TermsNotesStep';
import ReviewSendStep from './steps/ReviewSendStep';
import type { Quote, WizardStep } from '@/types/quote';

interface QuoteWizardProps {
  onComplete?: (quote: Partial<Quote>) => void;
  onCancel?: () => void;
  initialData?: Parameters<typeof useQuoteWizard>[0]['initialData'];
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
  initialData,
}) => {
  const wizard = useQuoteWizard({
    initialData,
    onComplete,
  });
  
  const {
    currentStep,
    currentStepIndex,
    steps,
    isFirstStep,
    isLastStep,
    canProceed,
    isSubmitting,
    error,
    data,
    nextStep,
    previousStep,
    goToStep,
    updateCustomerInfo,
    updateProductSelection,
    updateLineItems,
    updateTermsNotes,
    submitQuote,
    reset,
  } = wizard;
  
  const renderStep = () => {
    switch (currentStep) {
      case 'customer-info':
        return (
          <CustomerInfoStep
            data={data.customerInfo}
            onUpdate={updateCustomerInfo}
            error={error?.message}
          />
        );
      case 'product-selection':
        return (
          <ProductSelectionStep
            data={data.productSelection}
            onUpdate={updateProductSelection}
            error={error?.message}
          />
        );
      case 'line-items':
        return (
          <LineItemsStep
            data={data.lineItems}
            products={data.productSelection.selectedProducts}
            variants={data.productSelection.selectedVariants}
            onUpdate={updateLineItems}
            error={error?.message}
          />
        );
      case 'terms-notes':
        return (
          <TermsNotesStep
            data={data.termsNotes}
            onUpdate={updateTermsNotes}
            error={error?.message}
          />
        );
      case 'review-send':
        return (
          <ReviewSendStep
            data={data}
            onSubmit={submitQuote}
            isSubmitting={isSubmitting}
            error={error?.message}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const config = stepConfig[step];
            const Icon = config.icon;
            const isActive = step === currentStep;
            const isCompleted = index < currentStepIndex;
            const isClickable = index <= currentStepIndex;
            
            return (
              <React.Fragment key={step}>
                <{/* Step Circle */}>
                <motion.button
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  onClick={() => isClickable && goToStep(step)}
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
                        : '#f3f4f6',
                      borderColor: isActive
                        ? '#4f46e5'
                        : isCompleted
                        ? '#10b981'
                        : '#e5e7eb',
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
                    <p className={`
                      text-sm font-medium transition-colors
                      ${isActive ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                    `}>
                      {config.label}
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">{config.description}</p>
                  </div>
                </motion.button>
                
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 bg-gray-200 relative overflow-hidden">
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
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
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
        className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[400px]"
      >
        {renderStep()}
      </motion.div>
      
      {/* Navigation Buttons */}
      <{currentStep !== 'review-send' && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={isFirstStep ? onCancel : previousStep}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {isFirstStep ? 'Cancel' : 'Previous'}
          </button>
          
          <motion.button
            whileHover={{ scale: canProceed ? 1.02 : 1 }}
            whileTap={{ scale: canProceed ? 0.98 : 1 }}
            onClick={nextStep}
            disabled={!canProceed || isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
      )}</>
    </div>
  );
};

export default QuoteWizard;
