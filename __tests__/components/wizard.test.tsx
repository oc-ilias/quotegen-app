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

  it('shows add item button when no items', () => {
    render(
      <LineItemsStep
        data={mockData}
        products={mockProducts}
        variants={{}}
        onUpdate={mockOnUpdate}
      />
    );
    expect(screen.getByText('Add Custom Line Item')).toBeInTheDocument();
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
    expect(screen.getByRole('heading', { name: /Terms & Notes/i })).toBeInTheDocument();
  });

  it('calls onUpdate when payment terms change', () => {
    render(
      <TermsNotesStep data={mockData} onUpdate={mockOnUpdate} />
    );

    // Find all select elements - first one should be Payment Terms
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);

    // Change the first select (Payment Terms)
    fireEvent.change(selects[0], { target: { value: 'Net 15' } });
    expect(mockOnUpdate).toHaveBeenCalledWith({ paymentTerms: 'Net 15' });
  });
});

// ============================================================================
// ReviewSendStep Tests
// ============================================================================

import ReviewSendStep from '@/components/wizard/steps/ReviewSendStep';
import type { WizardData } from '@/types/quote';

describe('ReviewSendStep', () => {
  const mockData = {
    customer: {
      email: 'test@example.com',
      company: 'Test Company',
      name: 'John Doe',
      phone: '+1234567890',
    },
    line_items: [
      {
        name: 'Test Product',
        description: 'Test Description',
        quantity: 1,
        unit_price: 100,
        discount_percent: 0,
        tax_rate: 0,
      },
    ],
    title: 'Test Quote',
    notes: '',
    terms: '',
    valid_until: new Date().toISOString(),
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
    
    const sendButton = screen.getByRole('button', { name: /send quote/i });
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
    
    // When submitting, button shows "Sending..." and is disabled
    expect(screen.getByText('Sending...')).toBeInTheDocument();
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
    isLoading: false,
    error: null,
    formData: {
      title: 'Test Quote',
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
        company: 'Test Company',
        phone: '',
      },
      line_items: [],
      notes: '',
      terms: '',
      valid_until: new Date().toISOString(),
    },
    canProceed: false,
    canGoBack: false,
    progress: 20,
    goToStep: jest.fn(),
    nextStep: jest.fn(),
    previousStep: jest.fn(),
    updateFormData: jest.fn(),
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
    // Check for step labels using aria-labels which are unique
    expect(screen.getByLabelText('Step 1: Customer')).toBeInTheDocument();
    expect(screen.getByLabelText('Step 2: Products')).toBeInTheDocument();
    expect(screen.getByLabelText('Step 5: Review')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked on first step', () => {
    render(
      <QuoteWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
    );
    
    // The first step shows "Cancel" button
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
