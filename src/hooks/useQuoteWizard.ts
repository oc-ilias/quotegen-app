/**
 * Quote Wizard Hook
 * Manages state and logic for the multi-step quote creation wizard
 * @module hooks/useQuoteWizard
 */

'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type {
  WizardStep,
  QuoteFormData,
  LineItemInput,
  Address,
  Quote,
  Customer,
  CustomerInfoData,
  ProductSelectionData,
  LineItemsData,
  TermsNotesData,
  QuoteCalculations,
} from '@/types/quote';
import { WIZARD_STEPS, QuoteStatus, CustomerStatus } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface ValidationErrors {
  [key: string]: string[];
}

interface UseQuoteWizardOptions {
  /** Shop ID for draft storage */
  shopId?: string;
  /** Initial data for editing */
  initialData?: Partial<QuoteFormData>;
  /** Callback on completion */
  onComplete?: (quote: QuoteFormData) => void | Promise<void>;
}

interface UseQuoteWizardReturn {
  // State
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  isLoading: boolean;
  error: string | null;
  validationErrors: ValidationErrors;
  formData: QuoteFormData;
  
  // Component compatibility properties
  currentStepIndex: number;
  steps: typeof WIZARD_STEPS;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  data: {
    customerInfo: CustomerInfoData;
    productSelection: ProductSelectionData;
    lineItems: LineItemsData;
    termsNotes: TermsNotesData;
  };
  
  // Calculated values
  calculations: QuoteCalculations;
  isStepValid: boolean;
  canProceed: boolean;
  canGoBack: boolean;
  progress: number;
  
  // Actions
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateFormData: (updates: Partial<QuoteFormData>) => void;
  updateCustomer: (updates: Partial<QuoteFormData['customer']>) => void;
  addLineItem: (item?: Partial<LineItemInput>) => void;
  updateLineItem: (index: number, updates: Partial<LineItemInput>) => void;
  removeLineItem: (index: number) => void;
  clearError: () => void;
  submitQuote: () => Promise<void>;
  reset: () => void;
  
  // Component compatibility actions
  updateCustomerInfo: (data: Partial<CustomerInfoData>) => void;
  updateProductSelection: (data: Partial<ProductSelectionData>) => void;
  updateLineItems: (data: Partial<LineItemsData>) => void;
  updateTermsNotes: (data: Partial<TermsNotesData>) => void;
  saveDraft: () => Promise<void>;
}

// ============================================================================
// Constants
// ============================================================================

const INITIAL_FORM_DATA: QuoteFormData = {
  customer: {
    name: '',
    email: '',
    phone: '',
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
  },
  line_items: [],
  title: 'New Quote',
  description: '',
  notes: '',
  terms: '',
  valid_until: '',
  discount_total: 0,
  tax_rate: 0,
};

// ============================================================================
// Validation Functions
// ============================================================================

function validateCustomerInfo(data: QuoteFormData['customer']): ValidationErrors {
  const errors: ValidationErrors = {};
  
  if (!data?.name?.trim()) {
    errors.name = ['Customer name is required'];
  } else if (data.name.length < 2) {
    errors.name = ['Name must be at least 2 characters'];
  }
  
  if (!data?.email?.trim()) {
    errors.email = ['Email is required'];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = ['Please enter a valid email address'];
  }
  
  if (data?.phone && !/^[\d\s\-\+\(\)\.]+$/.test(data.phone)) {
    errors.phone = ['Please enter a valid phone number'];
  }
  
  return errors;
}

function validateLineItems(items: LineItemInput[]): ValidationErrors {
  const errors: ValidationErrors = {};
  
  if (!items || items.length === 0) {
    errors.line_items = ['At least one line item is required'];
    return errors;
  }
  
  items.forEach((item, index) => {
    if (!item.name?.trim()) {
      errors[`line_items[${index}].name`] = ['Item name is required'];
    }
    
    if (item.quantity <= 0) {
      errors[`line_items[${index}].quantity`] = ['Quantity must be greater than 0'];
    }
    
    if (item.unit_price < 0) {
      errors[`line_items[${index}].unit_price`] = ['Unit price cannot be negative'];
    }
  });
  
  return errors;
}

// ============================================================================
// Calculation Functions
// ============================================================================

export function calculateQuoteTotals(
  lineItems: LineItemInput[],
  discountTotal: number = 0,
  globalTaxRate: number = 0
): QuoteCalculations {
  const subtotal = lineItems.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price;
    const itemDiscount = itemTotal * (item.discount_percent || 0) / 100;
    return sum + itemTotal - itemDiscount;
  }, 0);
  
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const taxTotal = taxableAmount * (globalTaxRate / 100);
  const total = taxableAmount + taxTotal;
  
  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountTotal: Number(discountTotal.toFixed(2)),
    taxTotal: Number(taxTotal.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

// ============================================================================
// Hook
// ============================================================================

export function useQuoteWizard(options: UseQuoteWizardOptions = {}): UseQuoteWizardReturn {
  const { shopId, initialData, onComplete } = options;
  
  // ============================================================================
  // State
  // ============================================================================
  const [currentStep, setCurrentStep] = useState<WizardStep>('customer-info');
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<QuoteFormData>({
    ...INITIAL_FORM_DATA,
    ...initialData,
  });

  // ============================================================================
  // Computed Values
  // ============================================================================
  const calculations = useMemo(() => {
    return calculateQuoteTotals(
      formData.line_items,
      formData.discount_total,
      formData.tax_rate
    );
  }, [formData.line_items, formData.discount_total, formData.tax_rate]);

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 'customer-info': {
        const errors = validateCustomerInfo(formData.customer);
        return Object.keys(errors).length === 0;
      }
      case 'line-items': {
        const errors = validateLineItems(formData.line_items);
        return Object.keys(errors).length === 0;
      }
      case 'product-selection':
      case 'terms-notes':
        return true;
      case 'review-send': {
        const customerErrors = validateCustomerInfo(formData.customer);
        const lineItemErrors = validateLineItems(formData.line_items);
        return Object.keys(customerErrors).length === 0 && Object.keys(lineItemErrors).length === 0;
      }
      default:
        return true;
    }
  }, [currentStep, formData]);

  const canProceed = isStepValid && !isLoading;
  const canGoBack = currentStep !== 'customer-info' && !isLoading;

  const progress = useMemo(() => {
    const stepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    return ((stepIndex + 1) / WIZARD_STEPS.length) * 100;
  }, [currentStep]);

  const currentStepIndex = useMemo(() => {
    return WIZARD_STEPS.findIndex(s => s.id === currentStep);
  }, [currentStep]);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;
  const isSubmitting = isLoading;

  // ============================================================================
  // Actions
  // ============================================================================
  const validateCurrentStep = useCallback((): boolean => {
    let errors: ValidationErrors = {};
    
    switch (currentStep) {
      case 'customer-info':
        errors = validateCustomerInfo(formData.customer);
        break;
      case 'line-items':
        errors = validateLineItems(formData.line_items);
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, formData]);

  const goToStep = useCallback((step: WizardStep) => {
    const targetIndex = WIZARD_STEPS.findIndex(s => s.id === step);
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    
    // Can only go to completed steps or the next available step
    if (targetIndex <= currentIndex || completedSteps.includes(step)) {
      setCurrentStep(step);
      setValidationErrors({});
    }
  }, [currentStep, completedSteps]);

  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) {
      return;
    }
    
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    
    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    
    // Move to next step
    if (currentIndex < WIZARD_STEPS.length - 1) {
      setCurrentStep(WIZARD_STEPS[currentIndex + 1].id);
      setValidationErrors({});
    }
  }, [currentStep, completedSteps, validateCurrentStep]);

  const previousStep = useCallback(() => {
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(WIZARD_STEPS[currentIndex - 1].id);
      setValidationErrors({});
    }
  }, [currentStep]);

  const updateFormData = useCallback((updates: Partial<QuoteFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setValidationErrors({});
  }, []);

  const updateCustomer = useCallback((updates: Partial<QuoteFormData['customer']>) => {
    setFormData(prev => ({
      ...prev,
      customer: { ...prev.customer, ...updates },
    }));
    setValidationErrors(prev => {
      const next = { ...prev };
      delete next.name;
      delete next.email;
      delete next.phone;
      return next;
    });
  }, []);

  const addLineItem = useCallback((item?: Partial<LineItemInput>) => {
    const newItem: LineItemInput = {
      name: item?.name || '',
      description: item?.description || '',
      quantity: item?.quantity || 1,
      unit_price: item?.unit_price || 0,
      product_id: item?.product_id,
      sku: item?.sku,
      discount_percent: item?.discount_percent || 0,
      tax_rate: item?.tax_rate || 0,
    };
    
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, newItem],
    }));
  }, []);

  const updateLineItem = useCallback((index: number, updates: Partial<LineItemInput>) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    }));
    
    // Clear validation errors for this field
    setValidationErrors(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (key.startsWith(`line_items[${index}]`)) {
          delete next[key];
        }
      });
      return next;
    });
  }, []);

  const removeLineItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const submitQuote = useCallback(async () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (onComplete) {
        await onComplete(formData);
      }
      
      // Mark all steps as completed
      setCompletedSteps(WIZARD_STEPS.map(s => s.id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit quote';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [formData, onComplete, validateCurrentStep]);

  const reset = useCallback(() => {
    setCurrentStep('customer-info');
    setCompletedSteps([]);
    setIsLoading(false);
    setError(null);
    setValidationErrors({});
    setFormData({ ...INITIAL_FORM_DATA, ...initialData });
  }, [initialData]);

  // ============================================================================
  // Component Compatibility - Data Transformation
  // ============================================================================
  const data = useMemo(() => ({
    customerInfo: {
      customer: formData.customer.email ? {
        id: '',
        email: formData.customer.email,
        companyName: formData.customer.company,
        contactName: formData.customer.name,
        phone: formData.customer.phone,
        customerSince: new Date(),
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: CustomerStatus.ACTIVE,
      } : undefined,
      email: formData.customer.email,
      companyName: formData.customer.company,
      contactName: formData.customer.name,
      phone: formData.customer.phone,
      isExistingCustomer: false,
    } as CustomerInfoData,
    productSelection: {
      selectedProducts: [],
      selectedVariants: {},
      searchQuery: '',
      categoryFilter: null,
    } as ProductSelectionData,
    lineItems: {
      items: formData.line_items.map((item, index) => ({
        id: `item_${index}_${Date.now()}`,
        productId: item.product_id || '',
        title: item.name,
        variantId: undefined,
        variantTitle: item.description,
        sku: item.sku || '',
        quantity: item.quantity,
        unitPrice: item.unit_price,
        originalPrice: item.unit_price,
        discountAmount: (item.unit_price * item.quantity * (item.discount_percent || 0)) / 100,
        discountPercentage: item.discount_percent,
        taxRate: item.tax_rate || 0,
        taxAmount: (item.unit_price * item.quantity * (1 - (item.discount_percent || 0) / 100) * (item.tax_rate || 0)) / 100,
        subtotal: item.unit_price * item.quantity,
        total: item.unit_price * item.quantity * (1 - (item.discount_percent || 0) / 100) * (1 + (item.tax_rate || 0) / 100),
        imageUrl: undefined,
        notes: item.description,
        customFields: undefined,
      })),
      currency: 'USD',
    } as LineItemsData,
    termsNotes: {
      paymentTerms: formData.terms || 'Net 30',
      deliveryTerms: '',
      validityPeriod: 30,
      depositRequired: false,
      depositPercentage: 0,
      currency: 'USD',
      notes: formData.notes,
      internalNotes: '',
    } as TermsNotesData,
  }), [formData]);

  // ============================================================================
  // Component Compatibility - Actions
  // ============================================================================
  const updateCustomerInfo = useCallback((infoData: Partial<CustomerInfoData>) => {
    updateFormData({
      customer: {
        name: infoData.contactName ?? formData.customer.name,
        email: infoData.email ?? formData.customer.email,
        phone: infoData.phone ?? formData.customer.phone,
        company: infoData.companyName ?? formData.customer.company,
        address: formData.customer.address,
      },
    });
  }, [updateFormData, formData.customer]);

  const updateProductSelection = useCallback((_productData: Partial<ProductSelectionData>) => {
    // Products are handled separately - this is a placeholder
    // In a real implementation, this would update the formData with selected products
  }, []);

  const updateLineItems = useCallback((lineData: Partial<LineItemsData>) => {
    if (lineData.items) {
      updateFormData({
        line_items: lineData.items.map(item => ({
          name: item.title,
          description: item.notes,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          product_id: item.productId,
          sku: item.sku,
          discount_percent: item.discountPercentage,
          tax_rate: item.taxRate,
        })),
      });
    }
  }, [updateFormData]);

  const updateTermsNotes = useCallback((termsData: Partial<TermsNotesData>) => {
    updateFormData({
      terms: termsData.paymentTerms || '',
      notes: termsData.notes || '',
      valid_until: termsData.validityPeriod 
        ? new Date(Date.now() + termsData.validityPeriod * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : '',
    });
  }, [updateFormData]);

  const saveDraft = useCallback(async () => {
    // Draft saving logic - can be implemented with API call
    // For now, just log the draft data
    console.log('Saving draft:', formData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }, [formData]);

  // ============================================================================
  // Return
  // ============================================================================
  return {
    currentStep,
    completedSteps,
    isLoading,
    error,
    validationErrors,
    formData,
    calculations,
    isStepValid,
    canProceed,
    canGoBack,
    progress,
    goToStep,
    nextStep,
    previousStep,
    updateFormData,
    updateCustomer,
    addLineItem,
    updateLineItem,
    removeLineItem,
    clearError,
    submitQuote,
    reset,
    // Component compatibility properties
    currentStepIndex,
    steps: WIZARD_STEPS,
    isFirstStep,
    isLastStep,
    isSubmitting,
    data,
    updateCustomerInfo,
    updateProductSelection,
    updateLineItems,
    updateTermsNotes,
    saveDraft,
  };
}

export default useQuoteWizard;
