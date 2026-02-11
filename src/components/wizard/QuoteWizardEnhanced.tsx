/**
 * Enhanced Quote Wizard
 * Full-featured multi-step wizard with validation, auto-save, and animations
 * @module components/wizard/QuoteWizardEnhanced
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useQuoteWizard } from '@/hooks/useQuoteWizard';
import { supabase } from '@/lib/supabase';
import {
  UserIcon,
  ShoppingBagIcon,
  ListBulletIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SaveIcon,
  SparklesIcon,
  LoaderIcon,
} from '@heroicons/react/24/outline';

// Import step components
import { CustomerInfoStepEnhanced } from './steps/CustomerInfoStepEnhanced';
import { ProductSelectionStepEnhanced } from './steps/ProductSelectionStepEnhanced';
import { LineItemsStepEnhanced } from './steps/LineItemsStepEnhanced';
import { TermsNotesStepEnhanced } from './steps/TermsNotesStepEnhanced';
import { ReviewSendStepEnhanced } from './steps/ReviewSendStepEnhanced';

import type { 
  WizardStep, 
  QuoteFormData, 
  Customer,
  Product,
  QuoteStatus,
} from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface QuoteWizardEnhancedProps {
  onComplete?: (quote: QuoteFormData) => Promise<void>;
  onCancel?: () => void;
  onSaveDraft?: (quote: QuoteFormData) => Promise<void>;
  shopId?: string;
  initialData?: Partial<QuoteFormData>;
  mode?: 'create' | 'edit';
  quoteId?: string;
}

interface WizardStepConfig {
  id: WizardStep;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isRequired: boolean;
  validate: (data: QuoteFormData) => string | null;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

// ============================================================================
// Step Configuration
// ============================================================================

const WIZARD_STEPS: WizardStepConfig[] = [
  {
    id: 'customer-info',
    label: 'Customer',
    description: 'Select or create customer',
    icon: UserIcon,
    isRequired: true,
    validate: (data) => {
      if (!data.customer?.email) return 'Customer email is required';
      if (!data.customer?.name && !data.customer?.company) {
        return 'Customer name or company is required';
      }
      return null;
    },
  },
  {
    id: 'product-selection',
    label: 'Products',
    description: 'Choose products',
    icon: ShoppingBagIcon,
    isRequired: false,
    validate: () => null,
  },
  {
    id: 'line-items',
    label: 'Line Items',
    description: 'Configure items',
    icon: ListBulletIcon,
    isRequired: true,
    validate: (data) => {
      if (!data.line_items || data.line_items.length === 0) {
        return 'At least one line item is required';
      }
      for (const item of data.line_items) {
        if (!item.name?.trim()) return 'All line items must have a name';
        if (item.quantity <= 0) return 'Quantity must be greater than 0';
        if (item.unit_price < 0) return 'Unit price cannot be negative';
      }
      return null;
    },
  },
  {
    id: 'terms-notes',
    label: 'Terms',
    description: 'Set terms & notes',
    icon: DocumentTextIcon,
    isRequired: true,
    validate: (data) => {
      if (!data.valid_until) return 'Quote expiry date is required';
      const expiryDate = new Date(data.valid_until);
      if (expiryDate <= new Date()) return 'Expiry date must be in the future';
      return null;
    },
  },
  {
    id: 'review-send',
    label: 'Review',
    description: 'Review & send',
    icon: CheckCircleIcon,
    isRequired: true,
    validate: (data) => {
      // Final validation before submit
      if (!data.customer?.email) return 'Customer email is required';
      if (!data.line_items?.length) return 'At least one line item is required';
      return null;
    },
  },
];

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: 0.2,
    },
  },
};

const progressVariants = {
  initial: { scaleX: 0 },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  }),
};

// ============================================================================
// Step Indicator Component
// ============================================================================

interface StepIndicatorProps {
  steps: WizardStepConfig[];
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
  formData: QuoteFormData;
}

const StepIndicator = ({ steps, currentStep, onStepClick, formData }: StepIndicatorProps) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = index < currentIndex;
          const isClickable = index <= currentIndex;
          const error = step.validate(formData);
          const hasError = !!error && (isActive || isCompleted);

          return (
            <React.Fragment key={step.id}>
              <motion.button
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center gap-2 group relative',
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <motion.div
                  animate={{
                    backgroundColor: hasError
                      ? '#ef4444'
                      : isActive
                      ? '#4f46e5'
                      : isCompleted
                      ? '#10b981'
                      : '#1e293b',
                    borderColor: hasError
                      ? '#ef4444'
                      : isActive
                      ? '#4f46e5'
                      : isCompleted
                      ? '#10b981'
                      : '#374151',
                  }}
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors"
                >
                  {hasError ? (
                    <ExclamationCircleIcon className="w-6 h-6 text-white" />
                  ) : isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className="w-6 h-6 text-slate-400" />
                  )}
                </motion.div>

                <div className="text-center">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors',
                      isActive
                        ? 'text-white'
                        : isCompleted
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-500 hidden sm:block">{step.description}</p>
                </div>

                {/* Error tooltip */}
                {hasError && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500 text-white text-xs rounded-lg whitespace-nowrap">
                    {error}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45" />
                  </div>
                )}
              </motion.button>

              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-slate-700 relative overflow-hidden max-w-[100px]">
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
  );
};

// ============================================================================
// Auto Save Indicator Component
// ============================================================================

interface AutoSaveIndicatorProps {
  state: AutoSaveState;
}

const AutoSaveIndicator = ({ state }: AutoSaveIndicatorProps) => {
  if (state.isSaving) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2 text-sm text-slate-400"
      >
        <LoaderIcon className="w-4 h-4 animate-spin" />
        Saving...
      </motion.div>
    );
  }

  if (state.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2 text-sm text-red-400"
      >
        <ExclamationCircleIcon className="w-4 h-4" />
        Save failed
      </motion.div>
    );
  }

  if (state.lastSaved) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2 text-sm text-slate-500"
      >
        <SaveIcon className="w-4 h-4" />
        Saved {state.lastSaved.toLocaleTimeString()}
      </motion.div>
    );
  }

  return null;
};

// ============================================================================
// Main Wizard Component
// ============================================================================

export function QuoteWizardEnhanced({
  onComplete,
  onCancel,
  onSaveDraft,
  shopId = 'default-shop',
  initialData,
  mode = 'create',
  quoteId,
}: QuoteWizardEnhancedProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>('customer-info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
  });
  const [stepErrors, setStepErrors] = useState<Record<WizardStep, string>>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Initialize form data with defaults
  const [formData, setFormData] = useState<QuoteFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    customer: initialData?.customer || { id: '', email: '', name: '' },
    line_items: initialData?.line_items || [],
    subtotal: initialData?.subtotal || 0,
    tax_total: initialData?.tax_total || 0,
    discount_total: initialData?.discount_total || 0,
    total: initialData?.total || 0,
    currency: initialData?.currency || 'USD',
    valid_until: initialData?.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: initialData?.notes || '',
    terms: initialData?.terms || '',
    internal_notes: initialData?.internal_notes || '',
    status: initialData?.status || 'draft' as QuoteStatus,
  });

  // Load customers and products
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        
        // Load customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .eq('shop_id', shopId)
          .order('created_at', { ascending: false });

        if (customersError) throw customersError;
        setCustomers(customersData || []);

        // Load products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopId)
          .order('title');

        if (productsError) throw productsError;
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error loading wizard data:', error);
        showToast({
          title: 'Error',
          description: 'Failed to load some data. Please try again.',
          variant: 'error',
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [shopId, showToast]);

  // Auto-save functionality
  useEffect(() => {
    const saveDraft = async () => {
      if (!onSaveDraft || mode === 'edit') return;

      setAutoSaveState(prev => ({ ...prev, isSaving: true, error: null }));

      try {
        await onSaveDraft(formData);
        setAutoSaveState({
          isSaving: false,
          lastSaved: new Date(),
          error: null,
        });
      } catch (error) {
        setAutoSaveState(prev => ({
          ...prev,
          isSaving: false,
          error: error instanceof Error ? error.message : 'Save failed',
        }));
      }
    };

    const timeout = setTimeout(saveDraft, 30000); // Auto-save every 30 seconds
    return () => clearTimeout(timeout);
  }, [formData, onSaveDraft, mode]);

  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;
  const progress = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;

  const validateCurrentStep = useCallback(() => {
    const stepConfig = WIZARD_STEPS[currentStepIndex];
    const error = stepConfig.validate(formData);
    
    setStepErrors(prev => ({
      ...prev,
      [currentStep]: error || '',
    }));

    return !error;
  }, [currentStepIndex, formData]);

  const goToStep = useCallback((step: WizardStep) => {
    const targetIndex = WIZARD_STEPS.findIndex(s => s.id === step);
    
    // Only allow going to previous steps or current step
    if (targetIndex > currentStepIndex) {
      // Validate current step before moving forward
      if (!validateCurrentStep()) {
        showToast({
          title: 'Validation Error',
          description: 'Please fix the errors before continuing.',
          variant: 'error',
        });
        return;
      }
    }

    setCurrentStep(step);
    setStepErrors(prev => ({ ...prev, [step]: '' }));
  }, [currentStepIndex, validateCurrentStep, showToast]);

  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) {
      showToast({
        title: 'Validation Error',
        description: 'Please fix the errors before continuing.',
        variant: 'error',
      });
      return;
    }

    if (!isLastStep) {
      const nextStepIndex = currentStepIndex + 1;
      setCurrentStep(WIZARD_STEPS[nextStepIndex].id);
    }
  }, [currentStepIndex, isLastStep, validateCurrentStep, showToast]);

  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      const prevStepIndex = currentStepIndex - 1;
      setCurrentStep(WIZARD_STEPS[prevStepIndex].id);
    }
  }, [currentStepIndex, isFirstStep]);

  const updateFormData = useCallback((updates: Partial<QuoteFormData>) => {
    setFormData(prev => {
      const next = { ...prev, ...updates };
      
      // Recalculate totals if line items changed
      if (updates.line_items) {
        const subtotal = next.line_items.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unit_price;
          const discount = itemTotal * (item.discount_percent || 0) / 100;
          return sum + itemTotal - discount;
        }, 0);

        const taxTotal = next.line_items.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unit_price;
          const discount = itemTotal * (item.discount_percent || 0) / 100;
          return sum + ((itemTotal - discount) * (item.tax_rate || 0) / 100);
        }, 0);

        next.subtotal = subtotal;
        next.tax_total = taxTotal;
        next.total = subtotal + taxTotal;
      }

      return next;
    });

    // Clear error for updated fields
    setStepErrors(prev => ({ ...prev, [currentStep]: '' }));
  }, [currentStep]);

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      showToast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onComplete?.(formData);
      showToast({
        title: 'Success',
        description: mode === 'create' ? 'Quote created successfully!' : 'Quote updated successfully!',
        variant: 'success',
      });
      router.push('/dashboard/quotes');
    } catch (error) {
      console.error('Error submitting quote:', error);
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save quote. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setAutoSaveState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      await onSaveDraft(formData);
      setAutoSaveState({
        isSaving: false,
        lastSaved: new Date(),
        error: null,
      });
      showToast({
        title: 'Draft Saved',
        description: 'Your quote has been saved as a draft.',
        variant: 'success',
      });
    } catch (error) {
      setAutoSaveState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Save failed',
      }));
      showToast({
        title: 'Error',
        description: 'Failed to save draft. Please try again.',
        variant: 'error',
      });
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex items-center gap-3 text-slate-500">
          <LoaderIcon className="w-6 h-6 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              {mode === 'create' ? 'Create New Quote' : 'Edit Quote'}
            </h1>
            <p className="text-slate-400 mt-1">
              {mode === 'create' 
                ? 'Create a professional quote for your customer.' 
                : 'Update your quote details.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <AutoSaveIndicator state={autoSaveState} />
            {onSaveDraft && (
              <button
                onClick={handleSaveDraft}
                disabled={autoSaveState.isSaving}
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                Save Draft
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Step Indicator */}
      <StepIndicator
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepClick={goToStep}
        formData={formData}
      />

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            variants={progressVariants}
            initial="initial"
            animate="animate"
            custom={progress}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 origin-left"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Step {currentStepIndex + 1} of {WIZARD_STEPS.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-slate-900/50 rounded-2xl border border-slate-800 min-h-[400px]"
        >
          {currentStep === 'customer-info' && (
            <CustomerInfoStepEnhanced
              data={formData.customer}
              onUpdate={(customer) => updateFormData({ customer })}
              customers={customers}
              error={stepErrors['customer-info']}
            />
          )}

          {currentStep === 'product-selection' && (
            <ProductSelectionStepEnhanced
              selectedProducts={formData.line_items?.map(item => item.product_id).filter(Boolean) as string[]}
              products={products}
              onUpdate={(productIds) => {
                // Convert products to line items
                const newLineItems = productIds.map(productId => {
                  const product = products.find(p => p.id === productId);
                  const existingItem = formData.line_items?.find(item => item.product_id === productId);
                  
                  if (existingItem) return existingItem;

                  return {
                    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    product_id: productId,
                    name: product?.title || '',
                    description: product?.description || '',
                    quantity: 1,
                    unit_price: product?.variants?.[0]?.price || 0,
                    tax_rate: 0,
                    discount_percent: 0,
                  };
                });

                updateFormData({ line_items: newLineItems });
              }}
              error={stepErrors['product-selection']}
            />
          )}

          {currentStep === 'line-items' && (
            <LineItemsStepEnhanced
              items={formData.line_items || []}
              onUpdate={(items) => updateFormData({ line_items: items })}
              currency={formData.currency}
              error={stepErrors['line-items']}
            />
          )}

          {currentStep === 'terms-notes' && (
            <TermsNotesStepEnhanced
              data={{
                valid_until: formData.valid_until,
                notes: formData.notes,
                terms: formData.terms,
                internal_notes: formData.internal_notes,
              }}
              onUpdate={(updates) => updateFormData(updates)}
              error={stepErrors['terms-notes']}
            />
          )}

          {currentStep === 'review-send' && (
            <ReviewSendStepEnhanced
              data={formData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={stepErrors['review-send']}
              mode={mode}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {currentStep !== 'review-send' && (
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={isFirstStep ? onCancel : previousStep}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-slate-400 font-medium hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {isFirstStep ? 'Cancel' : 'Previous'}
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
          >
            Next
            <ArrowRightIcon className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default QuoteWizardEnhanced;
