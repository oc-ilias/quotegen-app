/**
 * QuoteWizard Component Test Suite
 * Comprehensive tests for the QuoteWizard component and all its steps
 * @module __tests__/components/wizard/QuoteWizard.test
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuoteWizard } from '@/components/wizard/QuoteWizard';
import type { QuoteFormData, WizardStep } from '@/types/quote';

// ============================================================================
// Mock framer-motion
// ============================================================================
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
    ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ============================================================================
// Mock useQuoteWizard hook
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
    currentStep: 'customer-info' as WizardStep,
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
    },
    calculations: {
      subtotal: 0,
      discountTotal: 0,
      taxTotal: 0,
      total: 0,
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
    updateFormData: jest.fn(),
    updateCustomer: jest.fn(),
    addLineItem: jest.fn(),
    updateLineItem: jest.fn(),
    removeLineItem: jest.fn(),
    clearError: jest.fn(),
  })),
}));

// ============================================================================
// Test Suite
// ============================================================================
describe('QuoteWizard', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================
  describe('Rendering', () => {
    it('renders wizard with progress steps', () => {
      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Customer')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Line Items')).toBeInTheDocument();
      expect(screen.getByText('Terms')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    it('renders the current step content', () => {
      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Customer Information')).toBeInTheDocument();
      expect(screen.getByText('Select an existing customer or create a new one.')).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('renders loading state when isLoading is true', () => {
      render(
        <QuoteWizard 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
          isLoading={true} 
        />
      );

      expect(screen.getByTestId('wizard-loading')).toBeInTheDocument();
    });

    it('renders keyboard navigation hints when enabled', () => {
      render(
        <QuoteWizard 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
          enableKeyboardNav={true} 
        />
      );

      expect(screen.getByText('Navigate')).toBeInTheDocument();
      // Use getAllByText for 'Continue' since it appears in both button and keyboard hint
      expect(screen.getAllByText('Continue').length).toBeGreaterThanOrEqual(1);
      // 'Cancel' appears in the button and keyboard hint - check button specifically
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('does not render keyboard hints when disabled', () => {
      render(
        <QuoteWizard 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
          enableKeyboardNav={false} 
        />
      );

      expect(screen.queryByText('Navigate')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Navigation Tests
  // ============================================================================
  describe('Navigation', () => {
    it('calls onCancel when cancel button is clicked on first step', () => {
      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('calls nextStep when continue button is clicked', async () => {
      // Mock with valid data that passes validation
      const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
      useQuoteWizard.mockReturnValueOnce({
        ...useQuoteWizard(),
        canProceed: true,
        data: {
          ...useQuoteWizard().data,
          customerInfo: {
            ...useQuoteWizard().data.customerInfo,
            email: 'test@example.com',
            companyName: 'Test Company',
            contactName: 'Test Contact',
            isExistingCustomer: false,
          },
        },
      });

      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(mockNextStep).toHaveBeenCalled();
      });
    });

    it('disables continue button when canProceed is false', () => {
      const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
      useQuoteWizard.mockReturnValueOnce({
        ...useQuoteWizard(),
        canProceed: false,
      });

      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
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

      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================
  describe('Error Handling', () => {
    it('displays external error when provided', () => {
      const error = new Error('External error message');
      render(
        <QuoteWizard 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
          externalError={error} 
        />
      );

      // Error message may appear in multiple places (ErrorAlert and step error) - use getAllByText
      expect(screen.getAllByText('External error message').length).toBeGreaterThanOrEqual(1);
    });

    it('displays wizard error from hook', () => {
      const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
      useQuoteWizard.mockReturnValueOnce({
        ...useQuoteWizard(),
        error: 'Wizard error message',
      });

      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      // Error message may appear in multiple places - use getAllByText
      expect(screen.getAllByText('Wizard error message').length).toBeGreaterThanOrEqual(1);
    });

    it('shows retry button when error has retry handler', () => {
      const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
      useQuoteWizard.mockReturnValueOnce({
        ...useQuoteWizard(),
        error: 'Retryable error',
      });

      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('disables actions when submitting', () => {
      const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
      useQuoteWizard.mockReturnValueOnce({
        ...useQuoteWizard(),
        isSubmitting: true,
      });

      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
    });
  });

  // ============================================================================
  // Draft Saving Tests
  // ============================================================================
  describe('Draft Saving', () => {
    it('renders save draft button when allowSaveDraft is true', () => {
      render(
        <QuoteWizard 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
          allowSaveDraft={true} 
        />
      );

      expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument();
    });

    it('does not render save draft button when allowSaveDraft is false', () => {
      render(
        <QuoteWizard 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
          allowSaveDraft={false} 
        />
      );

      expect(screen.queryByRole('button', { name: /save draft/i })).not.toBeInTheDocument();
    });

    it('calls saveDraft when save draft button is clicked', async () => {
      render(
        <QuoteWizard 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
          allowSaveDraft={true} 
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /save draft/i }));

      await waitFor(() => {
        expect(mockSaveDraft).toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // Props Tests
  // ============================================================================
  describe('Props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <QuoteWizard 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('uses custom autosave interval', () => {
      jest.useFakeTimers();
      
      render(
        <QuoteWizard 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel} 
          autosaveInterval={5000}
          allowSaveDraft={true}
        />
      );

      // Fast-forward past autosave interval
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      jest.useRealTimers();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================
  describe('Accessibility', () => {
    it('has proper ARIA labels on step indicators', () => {
      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      expect(screen.getByLabelText(/Step 1: Customer/i)).toBeInTheDocument();
    });

    it('indicates current step with aria-current', () => {
      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      const currentStep = screen.getByLabelText(/Step 1: Customer/i);
      expect(currentStep).toHaveAttribute('aria-current', 'step');
    });

    it('renders step content with data-testid', () => {
      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId('wizard-step-customer-info')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================
  describe('Integration', () => {
    it('updates data when step components call onUpdate', async () => {
      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      // Click on "Create New Customer" to show form
      fireEvent.click(screen.getByText('Create New Customer'));

      // Wait for the form to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('customer-email-input')).toBeInTheDocument();
      });

      // Fill in email
      const emailInput = screen.getByTestId('customer-email-input');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(mockUpdateCustomerInfo).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' })
      );
    });

    it('saves draft data to localStorage on unmount', () => {
      // Mock the beforeunload event since unmount doesn't trigger it
      const beforeunloadHandler = jest.fn();
      window.addEventListener('beforeunload', beforeunloadHandler);

      const { unmount } = render(
        <QuoteWizard 
          onComplete={mockOnComplete} 
          onCancel={mockOnCancel}
          shopId="test-shop"
          allowSaveDraft={true}
        />
      );

      // Trigger beforeunload event to save draft
      const event = new Event('beforeunload');
      window.dispatchEvent(event);

      unmount();

      // Draft should be saved after beforeunload event
      const drafts = JSON.parse(localStorage.getItem('quotegen_wizard_draft') || '{}');
      expect(drafts['test-shop']).toBeDefined();
      expect(drafts['test-shop'].shopId).toBe('test-shop');
      
      window.removeEventListener('beforeunload', beforeunloadHandler);
    });
  });

  // ============================================================================
  // Progress Indicator Tests
  // ============================================================================
  describe('Progress Indicator', () => {
    it('renders progress bar', () => {
      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      // Progress bar should be visible (it's a div with specific classes)
      const progressBar = document.querySelector('.bg-gradient-to-r');
      expect(progressBar).toBeInTheDocument();
    });

    it('shows correct progress based on current step', () => {
      const { useQuoteWizard } = require('@/hooks/useQuoteWizard');
      useQuoteWizard.mockReturnValueOnce({
        ...useQuoteWizard(),
        currentStep: 'review-send',
        currentStepIndex: 4,
        progress: 100,
      });

      render(
        <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
      );

      // On review step, we should see the ReviewSendStep
      expect(screen.getByTestId('wizard-step-review-send')).toBeInTheDocument();
    });
  });
});
