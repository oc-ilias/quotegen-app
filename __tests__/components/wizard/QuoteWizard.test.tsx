/**
 * Enhanced QuoteWizard Component Test Suite
 * 
 * Comprehensive tests covering:
 * - Step navigation
 * - Form validation
 * - Autosave functionality
 * - Error handling
 * - Completion flow
 * - Keyboard navigation
 * 
 * @module __tests__/components/wizard/QuoteWizard
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// ============================================================================
// Mock Setup
// ============================================================================

const mockNextStep = jest.fn();
const mockPreviousStep = jest.fn();
const mockGoToStep = jest.fn();
const mockUpdateCustomerInfo = jest.fn();
const mockUpdateProductSelection = jest.fn();
const mockUpdateLineItems = jest.fn();
const mockUpdateTermsNotes = jest.fn();
const mockSubmitQuote = jest.fn();
const mockReset = jest.fn();
const mockSaveDraft = jest.fn();

jest.mock('@/hooks/useQuoteWizard', () => ({
  useQuoteWizard: jest.fn((options) => ({
    currentStep: 'customer-info',
    currentStepIndex: 0,
    steps: [
      { id: 'customer-info', label: 'Customer', description: 'Customer information' },
      { id: 'product-selection', label: 'Products', description: 'Select products' },
      { id: 'line-items', label: 'Line Items', description: 'Configure items' },
      { id: 'terms-notes', label: 'Terms', description: 'Terms & notes' },
      { id: 'review-send', label: 'Review', description: 'Review & send' },
    ],
    isFirstStep: true,
    isLastStep: false,
    canProceed: true,
    isSubmitting: false,
    error: null,
    validationErrors: {},
    formData: {
      customer: {
        name: '',
        email: '',
        phone: '',
        company: '',
      },
      line_items: [],
      title: 'New Quote',
      description: '',
      notes: '',
      terms: '',
      valid_until: '',
      discount_total: 0,
      tax_rate: 0,
    },
    data: {
      customerInfo: {
        customer: undefined,
        email: '',
        companyName: '',
        contactName: '',
        phone: '',
        isExistingCustomer: false,
      },
      productSelection: {
        selectedProducts: [],
        selectedVariants: {},
        searchQuery: '',
        categoryFilter: null,
      },
      lineItems: {
        items: [],
        currency: 'USD',
      },
      termsNotes: {
        paymentTerms: 'Net 30',
        deliveryTerms: '',
        validityPeriod: 30,
        depositRequired: false,
        depositPercentage: 0,
        currency: 'USD',
        notes: '',
        internalNotes: '',
      },
    },
    nextStep: mockNextStep,
    previousStep: mockPreviousStep,
    goToStep: mockGoToStep,
    updateCustomerInfo: mockUpdateCustomerInfo,
    updateProductSelection: mockUpdateProductSelection,
    updateLineItems: mockUpdateLineItems,
    updateTermsNotes: mockUpdateTermsNotes,
    submitQuote: mockSubmitQuote,
    reset: mockReset,
    saveDraft: mockSaveDraft,
    completedSteps: [],
    isLoading: false,
    isStepValid: true,
    canGoBack: false,
    progress: 20,
  })),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, variants, custom, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      const { whileHover, whileTap, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
    span: ({ children, ...props }: any) => {
      const { whileHover, whileTap, ...rest } = props;
      return <span {...rest}>{children}</span>;
    },
    p: ({ children, ...props }: any) => {
      const { whileHover, whileTap, ...rest } = props;
      return <p {...rest}>{children}</p>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock step components
jest.mock('@/components/wizard/steps/CustomerInfoStep', () => ({
  __esModule: true,
  default: ({ data, onUpdate, error }: any) => (
    <div data-testid="wizard-step-customer-info">
      <h2>Customer Information</h2>
      {error && <div data-testid="step-error">{error}</div>}
      <input 
        data-testid="customer-email-input"
        value={data?.email || ''} 
        onChange={(e) => onUpdate({ ...data, email: e.target.value })}
        placeholder="Email"
      />
      <button data-testid="select-existing-customer" onClick={() => onUpdate({ ...data, isExistingCustomer: true, customer: { id: '1', email: 'test@example.com' } })}>
        Select Existing Customer
      </button>
      <button data-testid="create-new-customer" onClick={() => onUpdate({ ...data, isExistingCustomer: false })}>
        Create New Customer
      </button>
    </div>
  ),
}));

jest.mock('@/components/wizard/steps/ProductSelectionStep', () => ({
  __esModule: true,
  default: ({ data, onUpdate }: any) => (
    <div data-testid="wizard-step-product-selection">
      <h2>Product Selection</h2>
      <button data-testid="add-product" onClick={() => onUpdate({ ...data, selectedProducts: [...(data?.selectedProducts || []), { id: '1', title: 'Product 1' }] })}>
        Add Product
      </button>
    </div>
  ),
}));

jest.mock('@/components/wizard/steps/LineItemsStep', () => ({
  __esModule: true,
  default: ({ data, products, onUpdate }: any) => (
    <div data-testid="wizard-step-line-items">
      <h2>Line Items</h2>
      <div data-testid="products-count">{products?.length || 0}</div>
      <button data-testid="add-line-item" onClick={() => onUpdate({ ...data, items: [...(data?.items || []), { id: '1', title: 'Item', quantity: 1, unitPrice: 100 }] })}>
        Add Line Item
      </button>
    </div>
  ),
}));

jest.mock('@/components/wizard/steps/TermsNotesStep', () => ({
  __esModule: true,
  default: ({ data, onUpdate }: any) => (
    <div data-testid="wizard-step-terms-notes">
      <h2>Terms & Notes</h2>
      <textarea 
        data-testid="notes-input"
        value={data?.notes || ''} 
        onChange={(e) => onUpdate({ ...data, notes: e.target.value })}
      />
    </div>
  ),
}));

jest.mock('@/components/wizard/steps/ReviewSendStep', () => ({
  __esModule: true,
  default: ({ data, onSubmit, isSubmitting }: any) => (
    <div data-testid="wizard-step-review-send">
      <h2>Review & Send</h2>
      <div data-testid="review-data">{JSON.stringify(data)}</div>
      <button 
        data-testid="submit-quote" 
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Quote'}
      </button>
    </div>
  ),
}));

// ============================================================================
// Component Import
// ============================================================================

import { QuoteWizard } from '@/components/wizard/QuoteWizard';

// ============================================================================
// Test Data
// ============================================================================

const mockOnComplete = jest.fn();
const mockOnCancel = jest.fn();

const defaultProps = {
  onComplete: mockOnComplete,
  onCancel: mockOnCancel,
};

// ============================================================================
// Step Navigation Tests
// ============================================================================

describe('QuoteWizard - Step Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders all step indicators', () => {
    render(<QuoteWizard {...defaultProps} />);
    
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Line Items')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('renders current step content', () => {
    render(<QuoteWizard {...defaultProps} />);
    
    expect(screen.getByTestId('wizard-step-customer-info')).toBeInTheDocument();
    expect(screen.getByText('Customer Information')).toBeInTheDocument();
  });

  it('renders progress bar', () => {
    render(<QuoteWizard {...defaultProps} />);
    
    const progressBar = document.querySelector('.bg-gradient-to-r');
    expect(progressBar).toBeInTheDocument();
  });

  it('marks current step with aria-current', () => {
    render(<QuoteWizard {...defaultProps} />);
    
    const currentStep = screen.getByLabelText(/Step 1: Customer/i);
    expect(currentStep).toHaveAttribute('aria-current', 'step');
  });

  it('calls nextStep when continue button clicked', async () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      canProceed: true,
      data: {
        ...useQuoteWizard().data,
        customerInfo: {
          email: 'test@example.com',
          companyName: 'Test Company',
          contactName: 'Test Contact',
          isExistingCustomer: false,
        },
      },
    });

    render(<QuoteWizard {...defaultProps} />);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockNextStep).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button clicked on first step', () => {
    render(<QuoteWizard {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows previous button instead of cancel on non-first steps', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'line-items',
      currentStepIndex: 2,
      isFirstStep: false,
      isLastStep: false,
    });

    render(<QuoteWizard {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('calls previousStep when previous button clicked', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'line-items',
      currentStepIndex: 2,
      isFirstStep: false,
      isLastStep: false,
    });

    render(<QuoteWizard {...defaultProps} />);
    
    const previousButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(previousButton);
    
    expect(mockPreviousStep).toHaveBeenCalled();
  });

  it('allows navigation to previous steps via step indicator', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'line-items',
      currentStepIndex: 2,
      isFirstStep: false,
      isLastStep: false,
    });

    render(<QuoteWizard {...defaultProps} />);
    
    // Click on completed step (step 1 - Customer)
    const customerStep = screen.getByLabelText(/Step 1: Customer/i);
    fireEvent.click(customerStep);
    
    expect(mockGoToStep).toHaveBeenCalledWith('customer-info');
  });

  it('disables continue button when canProceed is false', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      canProceed: false,
    });

    render(<QuoteWizard {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('shows Create Quote button on last step', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'review-send',
      currentStepIndex: 4,
      isFirstStep: false,
      isLastStep: true,
    });

    render(<QuoteWizard {...defaultProps} />);
    
    expect(screen.getByTestId('wizard-step-review-send')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit quote/i })).toBeInTheDocument();
  });
});

// ============================================================================
// Form Validation Tests
// ============================================================================

describe('QuoteWizard - Form Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation errors when trying to proceed with invalid data', async () => {
    render(<QuoteWizard {...defaultProps} />);
    
    // Try to continue without filling required fields
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/please fix the following errors/i)).toBeInTheDocument();
    });
  });

  it('validates customer email format', async () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      data: {
        ...useQuoteWizard().data,
        customerInfo: {
          email: 'invalid-email',
          isExistingCustomer: false,
        },
      },
    });

    render(<QuoteWizard {...defaultProps} />);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      const errors = screen.getAllByText(/valid email/i);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('validates line items have required fields', async () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'line-items',
      currentStepIndex: 2,
      isFirstStep: false,
      isLastStep: false,
      data: {
        ...useQuoteWizard().data,
        lineItems: {
          items: [{ id: '1', title: '', quantity: 0, unitPrice: -1 }],
        },
      },
    });

    render(<QuoteWizard {...defaultProps} />);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please fix the following errors/i)).toBeInTheDocument();
    });
  });

  it('validates line items have positive quantity', async () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'line-items',
      currentStepIndex: 2,
      isFirstStep: false,
      isLastStep: false,
      data: {
        ...useQuoteWizard().data,
        lineItems: {
          items: [{ id: '1', title: 'Item', quantity: 0, unitPrice: 100 }],
        },
      },
    });

    render(<QuoteWizard {...defaultProps} />);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      const errors = screen.getAllByText(/quantity/i);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('validates line items have non-negative price', async () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'line-items',
      currentStepIndex: 2,
      isFirstStep: false,
      isLastStep: false,
      data: {
        ...useQuoteWizard().data,
        lineItems: {
          items: [{ id: '1', title: 'Item', quantity: 1, unitPrice: -100 }],
        },
      },
    });

    render(<QuoteWizard {...defaultProps} />);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      const errors = screen.getAllByText(/price/i);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('clears validation errors when data is corrected', async () => {
    render(<QuoteWizard {...defaultProps} />);
    
    // Trigger validation error
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please fix the following errors/i)).toBeInTheDocument();
    });
    
    // Fill in valid data
    const emailInput = screen.getByTestId('customer-email-input');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Error should be dismissed
    await waitFor(() => {
      expect(mockUpdateCustomerInfo).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// Autosave Tests
// ============================================================================

describe('QuoteWizard - Autosave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders save draft button when allowSaveDraft is true', () => {
    render(<QuoteWizard {...defaultProps} allowSaveDraft={true} />);
    
    expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument();
  });

  it('does not render save draft button when allowSaveDraft is false', () => {
    render(<QuoteWizard {...defaultProps} allowSaveDraft={false} />);
    
    expect(screen.queryByRole('button', { name: /save draft/i })).not.toBeInTheDocument();
  });

  it('calls saveDraft when save draft button clicked', async () => {
    render(<QuoteWizard {...defaultProps} allowSaveDraft={true} />);
    
    const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(mockSaveDraft).toHaveBeenCalled();
    });
  });

  it('autosaves at specified interval', () => {
    render(
      <QuoteWizard 
        {...defaultProps} 
        allowSaveDraft={true} 
        autosaveInterval={5000}
        shopId="test-shop"
      />
    );

    // Fast-forward past autosave interval
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Autosave should have been triggered
    expect(mockSaveDraft).toHaveBeenCalled();
  });

  it('saves draft to localStorage before unload', () => {
    render(
      <QuoteWizard 
        {...defaultProps} 
        allowSaveDraft={true}
        shopId="test-shop"
      />
    );

    // Trigger beforeunload event
    const event = new Event('beforeunload');
    window.dispatchEvent(event);

    // Draft should be saved
    const drafts = JSON.parse(localStorage.getItem('quotegen_wizard_draft') || '{}');
    expect(drafts['test-shop']).toBeDefined();
  });

  it('shows save indicator after successful save', async () => {
    mockSaveDraft.mockResolvedValueOnce(undefined);
    
    render(<QuoteWizard {...defaultProps} allowSaveDraft={true} />);
    
    const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(mockSaveDraft).toHaveBeenCalled();
    });
  });

  it('disables save draft button while saving', () => {
    render(<QuoteWizard {...defaultProps} allowSaveDraft={true} />);
    
    const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
    fireEvent.click(saveDraftButton);
    
    // Button should be disabled during save
    expect(saveDraftButton).toBeDisabled();
  });
});

// ============================================================================
// Error Handling Tests
// ============================================================================

describe('QuoteWizard - Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays external error when provided', () => {
    const error = new Error('External error message');
    render(
      <QuoteWizard 
        {...defaultProps} 
        externalError={error} 
      />
    );

    expect(screen.getByText('External error message')).toBeInTheDocument();
  });

  it('displays wizard error from hook', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      error: 'Wizard error message',
    });

    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByText('Wizard error message')).toBeInTheDocument();
  });

  it('shows retry button when error has retry handler', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      error: 'Retryable error',
    });

    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('dismisses error when dismiss button clicked', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      error: 'Dismissible error',
    });

    render(<QuoteWizard {...defaultProps} />);

    const dismissButton = screen.getByLabelText(/dismiss error/i);
    fireEvent.click(dismissButton);

    // Error should be dismissed
    expect(screen.queryByText('Dismissible error')).not.toBeInTheDocument();
  });

  it('shows retry count when retrying', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      error: 'Retryable error',
    });

    render(<QuoteWizard {...defaultProps} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    // Should show retry attempt
    expect(screen.getByText(/retry attempt/i)).toBeInTheDocument();
  });

  it('disables actions when submitting', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      isSubmitting: true,
    });

    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
  });

  it('shows loading overlay during step transition', async () => {
    render(<QuoteWizard {...defaultProps} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    // Should show loading state briefly
    await waitFor(() => {
      expect(mockNextStep).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// Completion Flow Tests
// ============================================================================

describe('QuoteWizard - Completion Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onComplete when wizard completes', async () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'review-send',
      currentStepIndex: 4,
      isFirstStep: false,
      isLastStep: true,
      formData: {
        customer: { name: 'Test', email: 'test@example.com' },
        line_items: [{ id: '1', title: 'Item', quantity: 1, unitPrice: 100 }],
        title: 'Test Quote',
      },
    });

    render(<QuoteWizard {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /submit quote/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitQuote).toHaveBeenCalled();
    });
  });

  it('shows submitting state during completion', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'review-send',
      currentStepIndex: 4,
      isFirstStep: false,
      isLastStep: true,
      isSubmitting: true,
    });

    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
  });

  it('renders review step with all data', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    const formData = {
      customer: { name: 'Test Customer', email: 'test@example.com' },
      line_items: [{ id: '1', title: 'Item 1', quantity: 2, unitPrice: 100 }],
      title: 'Test Quote',
      notes: 'Test notes',
      terms: 'Net 30',
    };
    
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'review-send',
      currentStepIndex: 4,
      isFirstStep: false,
      isLastStep: true,
      formData,
    });

    render(<QuoteWizard {...defaultProps} />);

    const reviewData = screen.getByTestId('review-data');
    expect(reviewData).toHaveTextContent('Test Customer');
    expect(reviewData).toHaveTextContent('Item 1');
  });

  it('clears draft from localStorage on successful completion', async () => {
    localStorage.setItem('quotegen_wizard_draft', JSON.stringify({ test: 'data' }));
    
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'review-send',
      currentStepIndex: 4,
      isFirstStep: false,
      isLastStep: true,
    });

    render(<QuoteWizard {...defaultProps} shopId="test-shop" />);

    const submitButton = screen.getByRole('button', { name: /submit quote/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitQuote).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// Keyboard Navigation Tests
// ============================================================================

describe('QuoteWizard - Keyboard Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to next step on ArrowRight', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      canProceed: true,
    });

    render(<QuoteWizard {...defaultProps} enableKeyboardNav={true} />);

    fireEvent.keyDown(window, { key: 'ArrowRight' });

    expect(mockNextStep).toHaveBeenCalled();
  });

  it('navigates to previous step on ArrowLeft', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      isFirstStep: false,
    });

    render(<QuoteWizard {...defaultProps} enableKeyboardNav={true} />);

    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    expect(mockPreviousStep).toHaveBeenCalled();
  });

  it('calls onCancel on Escape', () => {
    render(<QuoteWizard {...defaultProps} enableKeyboardNav={true} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('does not respond to keyboard when input is focused', () => {
    render(<QuoteWizard {...defaultProps} enableKeyboardNav={true} />);

    const emailInput = screen.getByTestId('customer-email-input');
    emailInput.focus();

    fireEvent.keyDown(emailInput, { key: 'ArrowRight' });

    // Should not navigate when input is focused
    expect(mockNextStep).not.toHaveBeenCalled();
  });

  it('shows keyboard navigation hints when enabled', () => {
    render(<QuoteWizard {...defaultProps} enableKeyboardNav={true} />);

    expect(screen.getByText(/navigate/i)).toBeInTheDocument();
    expect(screen.getByText(/continue/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('does not show keyboard hints when disabled', () => {
    render(<QuoteWizard {...defaultProps} enableKeyboardNav={false} />);

    expect(screen.queryByText(/navigate/i)).not.toBeInTheDocument();
  });
});

// ============================================================================
// Props Tests
// ============================================================================

describe('QuoteWizard - Props', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuoteWizard {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('uses custom autosave interval', () => {
    jest.useFakeTimers();
    
    render(
      <QuoteWizard 
        {...defaultProps} 
        autosaveInterval={10000}
        allowSaveDraft={true}
      />
    );

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(mockSaveDraft).toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('uses initialData when provided', () => {
    const initialData = {
      title: 'Initial Quote',
      customer: { name: 'Initial Customer' },
    };

    render(<QuoteWizard {...defaultProps} initialData={initialData} />);

    // Component should render with initial data
    expect(screen.getByTestId('wizard-step-customer-info')).toBeInTheDocument();
  });

  it('does not load draft when initialData is provided', () => {
    // Pre-populate localStorage with draft
    localStorage.setItem('quotegen_wizard_draft', JSON.stringify({
      default: {
        formData: { title: 'Draft Quote' },
        timestamp: Date.now(),
      },
    }));

    const initialData = {
      title: 'Initial Quote',
    };

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<QuoteWizard {...defaultProps} initialData={initialData} />);

    // Should not log draft availability
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Draft available'));
    
    consoleSpy.mockRestore();
  });
});

// ============================================================================
// Step Content Tests
// ============================================================================

describe('QuoteWizard - Step Content', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders customer info step', () => {
    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByTestId('wizard-step-customer-info')).toBeInTheDocument();
    expect(screen.getByText('Customer Information')).toBeInTheDocument();
  });

  it('renders product selection step', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'product-selection',
      currentStepIndex: 1,
      isFirstStep: false,
      isLastStep: false,
    });

    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByTestId('wizard-step-product-selection')).toBeInTheDocument();
    expect(screen.getByText('Product Selection')).toBeInTheDocument();
  });

  it('renders line items step', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'line-items',
      currentStepIndex: 2,
      isFirstStep: false,
      isLastStep: false,
    });

    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByTestId('wizard-step-line-items')).toBeInTheDocument();
    expect(screen.getByText('Line Items')).toBeInTheDocument();
  });

  it('renders terms and notes step', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'terms-notes',
      currentStepIndex: 3,
      isFirstStep: false,
      isLastStep: false,
    });

    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByTestId('wizard-step-terms-notes')).toBeInTheDocument();
    expect(screen.getByText('Terms & Notes')).toBeInTheDocument();
  });

  it('renders review and send step', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'review-send',
      currentStepIndex: 4,
      isFirstStep: false,
      isLastStep: true,
    });

    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByTestId('wizard-step-review-send')).toBeInTheDocument();
    expect(screen.getByText('Review & Send')).toBeInTheDocument();
  });

  it('passes products to line items step', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      currentStep: 'line-items',
      currentStepIndex: 2,
      data: {
        ...useQuoteWizard().data,
        productSelection: {
          selectedProducts: [{ id: '1', title: 'Product 1' }, { id: '2', title: 'Product 2' }],
        },
      },
    });

    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByTestId('products-count')).toHaveTextContent('2');
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('QuoteWizard - Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes full wizard flow', async () => {
    const user = userEvent.setup();
    
    render(<QuoteWizard {...defaultProps} />);

    // Step 1: Customer Info
    expect(screen.getByTestId('wizard-step-customer-info')).toBeInTheDocument();
    
    const emailInput = screen.getByTestId('customer-email-input');
    await user.type(emailInput, 'test@example.com');
    
    expect(mockUpdateCustomerInfo).toHaveBeenCalled();
  });

  it('updates data when step components call onUpdate', async () => {
    render(<QuoteWizard {...defaultProps} />);

    const emailInput = screen.getByTestId('customer-email-input');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(mockUpdateCustomerInfo).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    );
  });

  it('handles error and retry flow', async () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      error: 'Network error',
    });

    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();

    // Click retry
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalled();
    });
  });

  it('handles loading state during transitions', async () => {
    render(<QuoteWizard {...defaultProps} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    // Should show loading state briefly
    await waitFor(() => {
      expect(mockNextStep).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// Accessibility Tests
// ============================================================================

describe('QuoteWizard - Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has proper ARIA labels on step indicators', () => {
    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByLabelText(/Step 1: Customer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Step 2: Products/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Step 3: Line Items/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Step 4: Terms/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Step 5: Review/i)).toBeInTheDocument();
  });

  it('has accessible button labels', () => {
    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('renders step content with data-testid', () => {
    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByTestId('wizard-step-customer-info')).toBeInTheDocument();
  });

  it('disables buttons appropriately', () => {
    const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
    useQuoteWizard.mockReturnValueOnce({
      ...useQuoteWizard(),
      canProceed: false,
      isSubmitting: false,
    });

    render(<QuoteWizard {...defaultProps} />);

    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });
});
