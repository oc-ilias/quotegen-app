/**
 * Enhanced QuoteWizard Component
 * Multi-step wizard for creating quotes with comprehensive error handling,
 * loading states, animations, autosave, and keyboard navigation
 * @module components/wizard/QuoteWizard
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants, type Transition } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  UserIcon,
  ShoppingBagIcon,
  ListBulletIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useQuoteWizard } from '@/hooks/useQuoteWizard';
import CustomerInfoStep from './steps/CustomerInfoStep';
import ProductSelectionStep from './steps/ProductSelectionStep';
import LineItemsStep from './steps/LineItemsStep';
import TermsNotesStep from './steps/TermsNotesStep';
import ReviewSendStep from './steps/ReviewSendStep';
import type { Quote, WizardStep, WizardData, QuoteFormData } from '@/types/quote';
import { WIZARD_STEPS, QuoteStatus } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export interface QuoteWizardProps {
  /** Callback when wizard completes */
  onComplete?: (data: QuoteFormData) => void | Promise<void>;
  /** Callback when wizard is cancelled */
  onCancel?: () => void;
  /** Initial data for editing existing quote */
  initialData?: Partial<QuoteFormData>;
  /** Whether to show save draft option */
  allowSaveDraft?: boolean;
  /** External error to display */
  externalError?: Error | null;
  /** Loading state */
  isLoading?: boolean;
  /** Class name for styling */
  className?: string;
  /** Auto-save interval in milliseconds (default: 30000) */
  autosaveInterval?: number;
  /** Enable keyboard navigation */
  enableKeyboardNav?: boolean;
  /** Shop ID for draft saving */
  shopId?: string;
}

interface StepConfig {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
  validate: (data: WizardData) => { isValid: boolean; errors: string[] };
}

interface LoadingState {
  type: 'step-transition' | 'autosave' | 'submit' | 'retry';
  message: string;
}

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const stepVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 50 : -50,
    scale: 0.95,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 50 : -50,
    scale: 0.95,
    transition: {
      duration: 0.25,
    },
  }),
};

const progressVariants: Variants = {
  initial: { scaleX: 0 },
  animate: (progress: number) => ({
    scaleX: progress,
    transition: { duration: 0.5, ease: 'easeInOut' },
  }),
};

const slideTransition: Transition = {
  duration: 0.35,
  ease: [0.25, 0.46, 0.45, 0.94],
};

// ============================================================================
// Step Configuration
// ============================================================================

const STEP_CONFIG: Record<WizardStep, StepConfig> = {
  'customer-info': {
    label: 'Customer',
    description: 'Select or create customer',
    icon: UserIcon,
    required: true,
    validate: (data) => {
      const errors: string[] = [];
      if (!data.customerInfo?.customerId && !data.customerInfo?.email) {
        errors.push('Please select or create a customer');
      }
      if (data.customerInfo?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerInfo.email)) {
        errors.push('Please enter a valid email address');
      }
      return { isValid: errors.length === 0, errors };
    },
  },
  'product-selection': {
    label: 'Products',
    description: 'Choose products',
    icon: ShoppingBagIcon,
    required: false,
    validate: () => ({ isValid: true, errors: [] }),
  },
  'line-items': {
    label: 'Line Items',
    description: 'Configure items',
    icon: ListBulletIcon,
    required: true,
    validate: (data) => {
      const errors: string[] = [];
      if (!data.lineItems?.items?.length) {
        errors.push('Please add at least one line item');
      } else {
        data.lineItems.items.forEach((item, index) => {
          if (!item.title?.trim()) {
            errors.push(`Line item ${index + 1}: Name is required`);
          }
          if (item.quantity <= 0) {
            errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
          }
          if (item.unitPrice < 0) {
            errors.push(`Line item ${index + 1}: Price cannot be negative`);
          }
        });
      }
      return { isValid: errors.length === 0, errors };
    },
  },
  'terms-notes': {
    label: 'Terms',
    description: 'Set terms & notes',
    icon: DocumentTextIcon,
    required: false,
    validate: () => ({ isValid: true, errors: [] }),
  },
  'review-send': {
    label: 'Review',
    description: 'Review & send',
    icon: CheckCircleIcon,
    required: true,
    validate: (data) => {
      const errors: string[] = [];
      const customerValidation = STEP_CONFIG['customer-info'].validate(data);
      const lineItemsValidation = STEP_CONFIG['line-items'].validate(data);
      errors.push(...customerValidation.errors, ...lineItemsValidation.errors);
      return { isValid: errors.length === 0, errors };
    },
  },
};

const WIZARD_STEP_IDS: WizardStep[] = [
  'customer-info',
  'product-selection',
  'line-items',
  'terms-notes',
  'review-send',
];

// ============================================================================
// Draft Storage Utilities
// ============================================================================

const DRAFT_STORAGE_KEY = 'quotegen_wizard_draft';

interface DraftData {
  formData: Partial<QuoteFormData>;
  currentStep: WizardStep;
  timestamp: number;
  shopId?: string;
}

function saveDraftToStorage(draft: DraftData): void {
  if (typeof window === 'undefined') return;
  try {
    const drafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '{}');
    drafts[draft.shopId || 'default'] = draft;
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

function loadDraftFromStorage(shopId?: string): DraftData | null {
  if (typeof window === 'undefined') return null;
  try {
    const drafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '{}');
    const draft = drafts[shopId || 'default'];
    if (draft && Date.now() - draft.timestamp < 7 * 24 * 60 * 60 * 1000) { // 7 days
      return draft;
    }
    return null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

function clearDraftFromStorage(shopId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const drafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '{}');
    delete drafts[shopId || 'default'];
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}

// ============================================================================
// Error Display Component
// ============================================================================

const ErrorAlert: React.FC<{
  error: string;
  errors?: string[];
  onDismiss?: () => void;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
}> = ({ error, errors = [], onDismiss, onRetry, retryCount = 0, maxRetries = 3 }) => (
  <motion.div
    initial={{ opacity: 0, height: 0, y: -10 }}
    animate={{ opacity: 1, height: 'auto', y: 0 }}
    exit={{ opacity: 0, height: 0, y: -10 }}
    className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
  >
    <div className="flex items-start gap-3">
      <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-red-400 font-medium">{error}</p>
        {errors.length > 0 && (
          <ul className="mt-2 space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-xs text-red-400/80 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {err}
              </li>
            ))}
          </ul>
        )}
        {retryCount > 0 && retryCount < maxRetries && (
          <p className="mt-2 text-xs text-red-400/60">
            Retry attempt {retryCount} of {maxRetries}...
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onRetry && retryCount < maxRetries && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Retry"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </motion.button>
        )}
        {onDismiss && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDismiss}
            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  </motion.div>
);

// ============================================================================
// Loading Overlay Component
// ============================================================================

const LoadingOverlay: React.FC<{
  state: LoadingState | null;
}> = ({ state }) => {
  if (!state) return null;

  const icons = {
    'step-transition': ChevronRightIcon,
    'autosave': CloudArrowUpIcon,
    'submit': CheckCircleIcon,
    'retry': ArrowPathIcon,
  };

  const Icon = icons[state.type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-3"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Icon className="w-8 h-8 text-indigo-400" />
        </motion.div>
        <p className="text-sm text-slate-300">{state.message}</p>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Progress Bar Component
// ============================================================================

const ProgressBar: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps,
}) => {
  const progress = (currentStep + 1) / totalSteps;

  return (
    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <motion.div
        variants={progressVariants}
        initial="initial"
        animate="animate"
        custom={progress}
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 origin-left"
      />
    </div>
  );
};

// ============================================================================
// Step Indicator Component
// ============================================================================

const StepIndicator: React.FC<{
  step: WizardStep;
  index: number;
  currentStepIndex: number;
  onClick: () => void;
  isClickable: boolean;
  isCompleted: boolean;
}> = ({ step, index, currentStepIndex, onClick, isClickable, isCompleted }) => {
  const config = STEP_CONFIG[step];
  const Icon = config.icon;
  const isActive = index === currentStepIndex;

  return (
    <>
      <motion.button
        whileHover={isClickable ? { scale: 1.05 } : {}}
        whileTap={isClickable ? { scale: 0.95 } : {}}
        onClick={onClick}
        disabled={!isClickable}
        className={cn(
          'flex flex-col items-center gap-2 group relative',
          isClickable ? 'cursor-pointer' : 'cursor-default'
        )}
        aria-current={isActive ? 'step' : undefined}
        aria-label={`Step ${index + 1}: ${config.label}`}
      >
        <motion.div
          animate={{
            backgroundColor: isActive
              ? '#6366f1'
              : isCompleted
              ? '#10b981'
              : '#1e293b',
            borderColor: isActive
              ? '#6366f1'
              : isCompleted
              ? '#10b981'
              : '#334155',
          }}
          className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors relative"
        >
          <motion.div
            animate={{
              color: isActive || isCompleted ? '#ffffff' : '#64748b',
            }}
          >
            {isCompleted && !isActive ? (
              <CheckCircleIcon className="w-6 h-6" />
            ) : (
              <Icon className="w-6 h-6" />
            )}
          </motion.div>
          
          {/* Active indicator pulse */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-indigo-500"
              animate={{ scale: [1, 1.15, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        <div className="text-center">
          <p
            className={cn(
              'text-sm font-medium transition-colors',
              isActive
                ? 'text-slate-100'
                : isCompleted
                ? 'text-slate-300'
                : 'text-slate-500'
            )}
          >
            {config.label}
          </p>
          <p className="text-xs text-slate-600 hidden sm:block">{config.description}</p>
        </div>
      </motion.button>

      {index < WIZARD_STEP_IDS.length - 1 && (
        <div className="flex-1 h-0.5 mx-4 bg-slate-800 relative overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: isCompleted ? '100%' : '0%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-indigo-500"
          />
        </div>
      )}
    </>
  );
};

// ============================================================================
// Navigation Buttons Component
// ============================================================================

interface NavigationButtonsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  allowSaveDraft?: boolean;
  onSaveDraft?: () => void;
  showSaveIndicator?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  isFirstStep,
  isLastStep,
  canProceed,
  isSubmitting,
  isSavingDraft,
  onPrevious,
  onNext,
  onCancel,
  allowSaveDraft,
  onSaveDraft,
  showSaveIndicator,
}) => (
  <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
    <div className="flex items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={isFirstStep ? onCancel : onPrevious}
        disabled={isSubmitting || isSavingDraft}
        className={cn(
          'flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors',
          'text-slate-300 hover:text-slate-100 hover:bg-slate-800',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <ChevronLeftIcon className="w-4 h-4" />
        {isFirstStep ? 'Cancel' : 'Previous'}
      </motion.button>

      {allowSaveDraft && onSaveDraft && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSaveDraft}
          disabled={isSubmitting || isSavingDraft}
          className={cn(
            'hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors relative',
            'text-slate-400 hover:text-slate-300 hover:bg-slate-800',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSavingDraft ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <ArrowPathIcon className="w-4 h-4" />
              </motion.div>
              Saving...
            </>
          ) : showSaveIndicator ? (
            <>
              <CheckIcon className="w-4 h-4 text-emerald-400" />
              Saved
            </>
          ) : (
            <>
              <DocumentArrowDownIcon className="w-4 h-4" />
              Save Draft
            </>
          )}
        </motion.button>
      )}
    </div>

    <motion.button
      whileHover={{ scale: canProceed ? 1.02 : 1 }}
      whileTap={{ scale: canProceed ? 0.98 : 1 }}
      onClick={onNext}
      disabled={!canProceed || isSubmitting || isSavingDraft}
      className={cn(
        'flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all',
        'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500',
        'text-white shadow-lg shadow-indigo-500/25',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
      )}
    >
      {isSubmitting ? (
        <>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <ArrowPathIcon className="w-4 h-4" />
          </motion.div>
          Processing...
        </>
      ) : (
        <>
          {isLastStep ? 'Create Quote' : 'Continue'}
          <ChevronRightIcon className="w-4 h-4" />
        </>
      )}
    </motion.button>
  </div>
);

// ============================================================================
// Main QuoteWizard Component
// ============================================================================

export const QuoteWizard: React.FC<QuoteWizardProps> = ({
  onComplete,
  onCancel,
  initialData,
  allowSaveDraft = true,
  externalError,
  isLoading = false,
  className,
  autosaveInterval = 30000,
  enableKeyboardNav = true,
  shopId,
}) => {
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [stepValidationErrors, setStepValidationErrors] = useState<string[]>([]);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const wizard = useQuoteWizard({
    shopId,
    initialData,
    onComplete,
  });

  const {
    currentStep,
    currentStepIndex,
    steps,
    isFirstStep,
    isLastStep,
    canProceed: wizardCanProceed,
    isSubmitting,
    error: wizardError,
    data,
    formData,
    nextStep: wizardNextStep,
    previousStep: wizardPreviousStep,
    goToStep: wizardGoToStep,
    updateCustomerInfo,
    updateProductSelection,
    updateLineItems,
    updateTermsNotes,
    submitQuote,
    reset,
    saveDraft: wizardSaveDraft,
  } = wizard;

  // ============================================================================
  // Validation Logic
  // ============================================================================

  const validateCurrentStep = useCallback((): { isValid: boolean; errors: string[] } => {
    const stepConfig = STEP_CONFIG[currentStep];
    return stepConfig.validate(data);
  }, [currentStep, data]);

  const enhancedCanProceed = useMemo(() => {
    const validation = validateCurrentStep();
    return wizardCanProceed && validation.isValid && stepValidationErrors.length === 0;
  }, [wizardCanProceed, validateCurrentStep, stepValidationErrors]);

  // ============================================================================
  // Error Handling with Retry
  // ============================================================================

  const displayError = useMemo(() => {
    if (dismissedError) return null;
    if (externalError) return externalError.message;
    if (wizardError) return wizardError;
    return null;
  }, [externalError, wizardError, dismissedError]);

  const displayErrors = useMemo(() => {
    const validation = validateCurrentStep();
    return validation.errors;
  }, [validateCurrentStep]);

  const handleDismissError = useCallback(() => {
    setDismissedError(wizardError || externalError?.message || null);
  }, [wizardError, externalError]);

  const handleRetry = useCallback(async () => {
    if (retryCount >= 3) return;
    
    setLoadingState({ type: 'retry', message: `Retrying... (${retryCount + 1}/3)` });
    setRetryCount(prev => prev + 1);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDismissedError(null);
      reset();
      setRetryCount(0);
    } catch (err) {
      // Error persists
    } finally {
      setLoadingState(null);
    }
  }, [retryCount, reset]);

  useEffect(() => {
    if (wizardError || externalError) {
      setDismissedError(null);
      setRetryCount(0);
    }
  }, [wizardError, externalError]);

  // ============================================================================
  // Navigation with Animations
  // ============================================================================

  const handleNextStep = useCallback(async () => {
    const validation = validateCurrentStep();
    if (!validation.isValid) {
      setStepValidationErrors(validation.errors);
      return;
    }
    setStepValidationErrors([]);
    
    setDirection(1);
    setLoadingState({ type: 'step-transition', message: 'Loading next step...' });
    
    // Simulate brief loading for smooth transition
    await new Promise(resolve => setTimeout(resolve, 150));
    
    wizardNextStep();
    setLoadingState(null);
  }, [validateCurrentStep, wizardNextStep]);

  const handlePreviousStep = useCallback(async () => {
    setDirection(-1);
    setLoadingState({ type: 'step-transition', message: 'Loading previous step...' });
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    wizardPreviousStep();
    setLoadingState(null);
  }, [wizardPreviousStep]);

  const handleGoToStep = useCallback(async (stepId: WizardStep) => {
    const targetIndex = WIZARD_STEP_IDS.indexOf(stepId);
    const newDirection = targetIndex > currentStepIndex ? 1 : -1;
    setDirection(newDirection);
    
    wizardGoToStep(stepId);
  }, [currentStepIndex, wizardGoToStep]);

  // ============================================================================
  // Keyboard Navigation
  // ============================================================================

  useEffect(() => {
    if (!enableKeyboardNav) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          if (enhancedCanProceed && !isSubmitting) {
            e.preventDefault();
            handleNextStep();
          }
          break;
        case 'ArrowLeft':
          if (!isFirstStep && !isSubmitting) {
            e.preventDefault();
            handlePreviousStep();
          }
          break;
        case 'Escape':
          if (onCancel && !isSubmitting) {
            e.preventDefault();
            onCancel();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNav, enhancedCanProceed, isSubmitting, isFirstStep, handleNextStep, handlePreviousStep, onCancel]);

  // ============================================================================
  // Autosave Functionality
  // ============================================================================

  const saveDraft = useCallback(async () => {
    if (!allowSaveDraft) return;
    
    setIsSavingDraft(true);
    setLoadingState({ type: 'autosave', message: 'Saving draft...' });
    
    try {
      await wizardSaveDraft();
      
      // Also save to localStorage for persistence
      saveDraftToStorage({
        formData,
        currentStep,
        timestamp: Date.now(),
        shopId,
      });
      
      setShowSaveIndicator(true);
      
      // Clear save indicator after 2 seconds
      if (saveIndicatorTimeoutRef.current) {
        clearTimeout(saveIndicatorTimeoutRef.current);
      }
      saveIndicatorTimeoutRef.current = setTimeout(() => {
        setShowSaveIndicator(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setIsSavingDraft(false);
      setLoadingState(null);
    }
  }, [allowSaveDraft, wizardSaveDraft, formData, currentStep, shopId]);

  // Autosave on interval
  useEffect(() => {
    if (!allowSaveDraft || autosaveInterval <= 0) return;

    autosaveTimeoutRef.current = setInterval(() => {
      saveDraft();
    }, autosaveInterval);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearInterval(autosaveTimeoutRef.current);
      }
    };
  }, [allowSaveDraft, autosaveInterval, saveDraft]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (allowSaveDraft) {
        saveDraftToStorage({
          formData,
          currentStep,
          timestamp: Date.now(),
          shopId,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [allowSaveDraft, formData, currentStep, shopId]);

  // ============================================================================
  // Load Draft on Mount
  // ============================================================================

  useEffect(() => {
    if (initialData) return; // Don't load draft if we have initial data
    
    const draft = loadDraftFromStorage(shopId);
    if (draft) {
      // Optionally show a "Resume draft?" dialog here
      // For now, we'll just log it
      console.log('Draft available:', draft);
    }
  }, [initialData, shopId]);

  // ============================================================================
  // Render Step Content
  // ============================================================================

  const renderStep = useCallback(() => {
    const commonProps = {
      error: displayError || undefined,
      'data-testid': `wizard-step-${currentStep}`,
    };

    switch (currentStep) {
      case 'customer-info':
        return (
          <CustomerInfoStep
            {...commonProps}
            data={data.customerInfo}
            onUpdate={updateCustomerInfo}
          />
        );
      case 'product-selection':
        return (
          <ProductSelectionStep
            {...commonProps}
            data={data.productSelection}
            onUpdate={updateProductSelection}
          />
        );
      case 'line-items':
        return (
          <LineItemsStep
            {...commonProps}
            data={data.lineItems}
            products={data.productSelection.selectedProducts}
            variants={data.productSelection.selectedVariants}
            onUpdate={updateLineItems}
          />
        );
      case 'terms-notes':
        return (
          <TermsNotesStep
            {...commonProps}
            data={data.termsNotes}
            onUpdate={updateTermsNotes}
          />
        );
      case 'review-send':
        return (
          <ReviewSendStep
            {...commonProps}
            data={{
              customer: formData.customer,
              line_items: formData.line_items,
              title: formData.title,
              notes: formData.notes,
              terms: formData.terms,
              valid_until: formData.valid_until,
            }}
            onSubmit={submitQuote}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    data,
    formData,
    displayError,
    updateCustomerInfo,
    updateProductSelection,
    updateLineItems,
    updateTermsNotes,
    submitQuote,
    isSubmitting,
  ]);

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading) {
    return (
      <div className={cn('w-full max-w-6xl mx-auto', className)} data-testid="wizard-loading">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-800 rounded-full" />
                <div className="h-4 w-20 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
          <div className="h-96 bg-slate-900/50 border border-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('w-full max-w-6xl mx-auto', className)}
      data-testid="quote-wizard"
    >
      {/* Progress Bar */}
      <ProgressBar currentStep={currentStepIndex} totalSteps={WIZARD_STEP_IDS.length} />

      {/* Progress Steps */}
      <div className="mb-8 mt-6">
        <div className="flex items-center justify-between">
          {WIZARD_STEP_IDS.map((stepId, index) => (
            <StepIndicator
              key={stepId}
              step={stepId}
              index={index}
              currentStepIndex={currentStepIndex}
              onClick={() => index <= currentStepIndex && handleGoToStep(stepId)}
              isClickable={index <= currentStepIndex}
              isCompleted={index < currentStepIndex}
            />
          ))}
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {(displayError || stepValidationErrors.length > 0) && (
          <ErrorAlert
            error={displayError || 'Please fix the following errors:'}
            errors={!displayError ? stepValidationErrors : []}
            onDismiss={displayError ? handleDismissError : undefined}
            onRetry={displayError ? handleRetry : undefined}
            retryCount={retryCount}
            maxRetries={3}
          />
        )}
      </AnimatePresence>

      {/* Step Content */}
      <div className="relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl min-h-[400px] relative overflow-hidden"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {loadingState && <LoadingOverlay state={loadingState} />}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {currentStep !== 'review-send' && (
        <NavigationButtons
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          canProceed={enhancedCanProceed}
          isSubmitting={isSubmitting}
          isSavingDraft={isSavingDraft}
          onPrevious={handlePreviousStep}
          onNext={handleNextStep}
          onCancel={onCancel || (() => {})}
          allowSaveDraft={allowSaveDraft}
          onSaveDraft={saveDraft}
          showSaveIndicator={showSaveIndicator}
        />
      )}

      {/* Keyboard Shortcuts Hint */}
      {enableKeyboardNav && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-600"
        >
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">→</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Enter</kbd>
            Continue
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Esc</kbd>
            Cancel
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuoteWizard;
