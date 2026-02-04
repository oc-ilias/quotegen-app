/**
 * Wizard Components Test Suite
 * Tests for QuoteWizard and all wizard steps
 * @module __tests__/components/wizard
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      const { whileHover, whileTap, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ============================================================================
// CustomerInfoStep Tests
// ============================================================================

import CustomerInfoStep from '@/components/wizard/steps/CustomerInfoStep';

describe('CustomerInfoStep', () => {
  const mockData = {
    email: '',
    companyName: '',
    contactName: '',
    phone: '',
    isExistingCustomer: false,
  };

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('renders step title and description', () => {
    render(
      <CustomerInfoStep data={mockData} onUpdate={mockOnUpdate} />
    );
    expect(screen.getByText('Customer Information')).toBeInTheDocument();
  });

  it('renders toggle buttons for new/existing customer', () => {
    render(
      <CustomerInfoStep data={mockData} onUpdate={mockOnUpdate} />
    );
    expect(screen.getByText('Create New Customer')).toBeInTheDocument();
    expect(screen.getByText('Select Existing')).toBeInTheDocument();
  });

  it('shows new customer form when create new is selected', () => {
    render(
      <CustomerInfoStep data={mockData} onUpdate={mockOnUpdate} />
    );
    
    fireEvent.click(screen.getByText('Create New Customer'));
    expect(screen.getByPlaceholderText('customer@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Acme Corporation')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John Smith')).toBeInTheDocument();
  });

  it('calls onUpdate when form fields change', () => {
    render(
      <CustomerInfoStep data={mockData} onUpdate={mockOnUpdate} />
    );
    
    fireEvent.click(screen.getByText('Create New Customer'));
    
    const emailInput = screen.getByPlaceholderText('customer@company.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(mockOnUpdate).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('displays error message when error prop is provided', () => {
    render(
      <CustomerInfoStep data={mockData} onUpdate={mockOnUpdate} error="Test error message" />
    );
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });
});

// ============================================================================
// LineItemsStep Tests
// ============================================================================

import LineItemsStep from '@/components/wizard/steps/LineItemsStep';
import type { LineItem, Product } from '@/types/quote';

describe('LineItemsStep', () => {
  const mockProducts: Product[] = [
    {
      id: 'prod_1',
      title: 'Test Product',
      handle: 'test-product',
      images: [],
      variants: [],
      tags: [],
      productType: 'Physical',
      vendor: 'Test Vendor',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockData = {
    items: [] as LineItem[],
  };

  const mockOnUpdate = jest.fn();

  it('renders step title and description', () => {
    render(
      <LineItemsStep
        data={mockData}
        products={mockProducts}
        variants={{}}
        onUpdate={mockOnUpdate}
      />
    );
    expect(screen.getByText('Line Items')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    render(
      <LineItemsStep
        data={mockData}
        products={mockProducts}
        variants={{}}
        onUpdate={mockOnUpdate}
      />
    );
    expect(screen.getByText(/no items/i)).toBeInTheDocument();
  });
});

// ============================================================================
// TermsNotesStep Tests
// ============================================================================

import TermsNotesStep from '@/components/wizard/steps/TermsNotesStep';

describe('TermsNotesStep', () => {
  const mockData = {
    paymentTerms: 'Net 30',
    deliveryTerms: '2-3 business days',
    validityPeriod: 30,
    depositRequired: false,
    depositPercentage: 0,
    currency: 'USD',
    notes: '',
    internalNotes: '',
  };

  const mockOnUpdate = jest.fn();

  it('renders step title and description', () => {
    render(
      <TermsNotesStep data={mockData} onUpdate={mockOnUpdate} />
    );
    expect(screen.getByText(/terms/i)).toBeInTheDocument();
  });

  it('calls onUpdate when payment terms change', () => {
    render(
      <TermsNotesStep data={mockData} onUpdate={mockOnUpdate} />
    );
    
    // Find and update payment terms
    const paymentTermsInput = screen.getByDisplayValue('Net 30');
    fireEvent.change(paymentTermsInput, { target: { value: 'Net 15' } });
    
    expect(mockOnUpdate).toHaveBeenCalledWith({ paymentTerms: 'Net 15' });
  });
});

// ============================================================================
// ReviewSendStep Tests
// ============================================================================

import ReviewSendStep from '@/components/wizard/steps/ReviewSendStep';
import type { WizardData } from '@/types/quote';

describe('ReviewSendStep', () => {
  const mockData: WizardData = {
    customerInfo: {
      email: 'test@example.com',
      companyName: 'Test Company',
      contactName: 'John Doe',
      phone: '+1234567890',
      isExistingCustomer: false,
    },
    productSelection: {
      selectedProducts: [],
      selectedVariants: {},
    },
    lineItems: {
      items: [],
    },
    termsNotes: {
      paymentTerms: 'Net 30',
      deliveryTerms: '2-3 days',
      validityPeriod: 30,
      depositRequired: false,
      depositPercentage: 0,
      currency: 'USD',
      notes: '',
      internalNotes: '',
    },
  };

  const mockOnSubmit = jest.fn();

  it('renders step title and customer information', () => {
    render(
      <ReviewSendStep
        data={mockData}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );
    expect(screen.getByText('Review & Send')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('calls onSubmit when send button is clicked', () => {
    render(
      <ReviewSendStep
        data={mockData}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('disables send button when isSubmitting is true', () => {
    render(
      <ReviewSendStep
        data={mockData}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    );
    
    const sendButton = screen.getByRole('button', { name: /sending/i });
    expect(sendButton).toBeDisabled();
  });
});

// ============================================================================
// QuoteWizard Tests
// ============================================================================

import QuoteWizard from '@/components/wizard/QuoteWizard';

// Mock the useQuoteWizard hook
jest.mock('@/hooks/useQuoteWizard', () => ({
  useQuoteWizard: jest.fn(() => ({
    currentStep: 'customer-info',
    currentStepIndex: 0,
    steps: ['customer-info', 'product-selection', 'line-items', 'terms-notes', 'review-send'],
    isFirstStep: true,
    isLastStep: false,
    canProceed: false,
    isSubmitting: false,
    error: null,
    data: {
      customerInfo: {
        email: '',
        companyName: '',
        contactName: '',
        phone: '',
        isExistingCustomer: false,
      },
      productSelection: {
        selectedProducts: [],
        selectedVariants: {},
      },
      lineItems: {
        items: [],
      },
      termsNotes: {
        paymentTerms: 'Net 30',
        deliveryTerms: '2-3 business days',
        validityPeriod: 30,
        depositRequired: false,
        depositPercentage: 0,
        currency: 'USD',
        notes: '',
        internalNotes: '',
      },
    },
    nextStep: jest.fn(),
    previousStep: jest.fn(),
    goToStep: jest.fn(),
    updateCustomerInfo: jest.fn(),
    updateProductSelection: jest.fn(),
    updateLineItems: jest.fn(),
    updateTermsNotes: jest.fn(),
    submitQuote: jest.fn(),
    reset: jest.fn(),
  })),
}));

describe('QuoteWizard', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  it('renders wizard with progress steps', () => {
    render(
      <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
    );
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked on first step', () => {
    render(
      <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
