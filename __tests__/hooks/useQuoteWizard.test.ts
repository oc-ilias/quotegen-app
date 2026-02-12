/**
 * Tests for useQuoteWizard Hook
 * @module __tests__/hooks/useQuoteWizard.test
 */

import { renderHook, act } from '@testing-library/react';
import { useQuoteWizard, calculateQuoteTotals } from '@/hooks/useQuoteWizard';
import { WIZARD_STEPS } from '@/types/quote';

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('useQuoteWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useQuoteWizard());

      expect(result.current.currentStep).toBe('customer-info');
      expect(result.current.completedSteps).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.formData.customer.name).toBe('');
    });

    it('should accept initial data', () => {
      const initialData = {
        title: 'Test Quote',
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const { result } = renderHook(() =>
        useQuoteWizard({ initialData: initialData as any })
      );

      expect(result.current.formData.title).toBe('Test Quote');
      expect(result.current.formData.customer.name).toBe('John Doe');
    });

    it('should calculate correct step progress', () => {
      const { result } = renderHook(() => useQuoteWizard());

      expect(result.current.progress).toBe((1 / WIZARD_STEPS.length) * 100);
    });
  });

  describe('step navigation', () => {
    it('should advance to next step', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateCustomer({ name: 'John Doe', email: 'john@example.com' });
      });

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe('product-selection');
      expect(result.current.completedSteps).toContain('customer-info');
    });

    it('should go back to previous step', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateCustomer({ name: 'John', email: 'john@example.com' });
        result.current.nextStep();
      });

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe('customer-info');
    });

    it('should not go back from first step', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe('customer-info');
    });

    it('should allow navigation to completed steps', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateCustomer({ name: 'John', email: 'john@example.com' });
        result.current.nextStep();
        result.current.nextStep();
      });

      act(() => {
        result.current.goToStep('customer-info');
      });

      expect(result.current.currentStep).toBe('customer-info');
    });

    it('should not allow navigation to future uncompleted steps', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.goToStep('review-send');
      });

      expect(result.current.currentStep).toBe('customer-info');
    });

    it('should track current step index correctly', () => {
      const { result } = renderHook(() => useQuoteWizard());

      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.isFirstStep).toBe(true);
      expect(result.current.isLastStep).toBe(false);
    });
  });

  describe('form data management', () => {
    it('should update form data', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateFormData({ title: 'New Quote Title' });
      });

      expect(result.current.formData.title).toBe('New Quote Title');
    });

    it('should update customer data', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateCustomer({ name: 'Jane Doe' });
      });

      expect(result.current.formData.customer.name).toBe('Jane Doe');
    });

    it('should clear validation errors on update', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.nextStep(); // Try to proceed without valid data
      });

      expect(Object.keys(result.current.validationErrors).length).toBeGreaterThan(0);

      act(() => {
        result.current.updateCustomer({ name: 'John', email: 'john@example.com' });
      });

      expect(Object.keys(result.current.validationErrors).length).toBe(0);
    });
  });

  describe('line items management', () => {
    it('should add line item', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.addLineItem({ name: 'Product A', quantity: 2, unit_price: 50 });
      });

      expect(result.current.formData.line_items).toHaveLength(1);
      expect(result.current.formData.line_items[0].name).toBe('Product A');
    });

    it('should add line item with defaults', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.addLineItem();
      });

      expect(result.current.formData.line_items).toHaveLength(1);
      expect(result.current.formData.line_items[0].quantity).toBe(1);
      expect(result.current.formData.line_items[0].unit_price).toBe(0);
    });

    it('should update line item', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.addLineItem({ name: 'Product A', quantity: 1, unit_price: 100 });
      });

      act(() => {
        result.current.updateLineItem(0, { quantity: 5 });
      });

      expect(result.current.formData.line_items[0].quantity).toBe(5);
    });

    it('should remove line item', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.addLineItem({ name: 'Product A' });
        result.current.addLineItem({ name: 'Product B' });
      });

      act(() => {
        result.current.removeLineItem(0);
      });

      expect(result.current.formData.line_items).toHaveLength(1);
      expect(result.current.formData.line_items[0].name).toBe('Product B');
    });
  });

  describe('calculations', () => {
    it('should calculate subtotal correctly', () => {
      const lineItems = [
        { name: 'Item 1', quantity: 2, unit_price: 50, discount_percent: 0 },
        { name: 'Item 2', quantity: 1, unit_price: 100, discount_percent: 0 },
      ];

      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateFormData({ line_items: lineItems as any });
      });

      expect(result.current.calculations.subtotal).toBe(200);
    });

    it('should calculate discount correctly', () => {
      const lineItems = [
        { name: 'Item 1', quantity: 1, unit_price: 100, discount_percent: 10 },
      ];

      const calculations = calculateQuoteTotals(lineItems as any);

      expect(calculations.subtotal).toBe(90); // 100 - 10%
    });

    it('should calculate tax correctly', () => {
      const lineItems = [
        { name: 'Item 1', quantity: 1, unit_price: 100, discount_percent: 0 },
      ];

      const calculations = calculateQuoteTotals(lineItems as any, 0, 10);

      expect(calculations.taxTotal).toBe(10);
      expect(calculations.total).toBe(110);
    });

    it('should calculate total with discount and tax', () => {
      const lineItems = [
        { name: 'Item 1', quantity: 1, unit_price: 200, discount_percent: 10 },
      ];

      // subtotal: 180 (200 - 10%)
      // tax: 18 (10% of 180)
      // total: 198
      const calculations = calculateQuoteTotals(lineItems as any, 0, 10);

      expect(calculations.subtotal).toBe(180);
      expect(calculations.taxTotal).toBe(18);
      expect(calculations.total).toBe(198);
    });
  });

  describe('validation', () => {
    it('should validate customer name', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateCustomer({ name: '', email: 'john@example.com' });
      });

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.validationErrors.name).toContain('Customer name is required');
      expect(result.current.canProceed).toBe(false);
    });

    it('should validate email format', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateCustomer({ name: 'John', email: 'invalid-email' });
      });

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.validationErrors.email).toContain('Please enter a valid email address');
    });

    it('should validate line items existence', () => {
      const { result } = renderHook(() => useQuoteWizard());

      // Navigate to line-items step
      act(() => {
        result.current.updateCustomer({ name: 'John', email: 'john@example.com' });
      });

      act(() => {
        result.current.nextStep();
      });

      act(() => {
        result.current.nextStep();
      });

      // Clear any line items that might exist and try to proceed
      act(() => {
        result.current.updateFormData({ line_items: [] });
      });

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.validationErrors.line_items).toContain('At least one line item is required');
    });

    it('should validate line item fields', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.addLineItem({ name: '', quantity: 0, unit_price: -10 });
      });

      act(() => {
        result.current.updateFormData({ ...result.current.formData });
        // Try to go to terms step
        result.current.goToStep('line-items');
        result.current.nextStep();
      });

      expect(result.current.validationErrors).toBeDefined();
    });
  });

  describe('submit quote', () => {
    it('should call onComplete callback', async () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() =>
        useQuoteWizard({ onComplete })
      );

      // Setup valid data
      act(() => {
        result.current.updateCustomer({ name: 'John', email: 'john@example.com' });
        result.current.addLineItem({ name: 'Product', quantity: 1, unit_price: 100 });
      });

      await act(async () => {
        await result.current.submitQuote();
      });

      expect(onComplete).toHaveBeenCalled();
    });

    it('should handle submission errors', async () => {
      const onComplete = jest.fn().mockRejectedValue(new Error('Submission failed'));
      const { result } = renderHook(() =>
        useQuoteWizard({ onComplete })
      );

      act(() => {
        result.current.updateCustomer({ name: 'John', email: 'john@example.com' });
        result.current.addLineItem({ name: 'Product', quantity: 1, unit_price: 100 });
      });

      await act(async () => {
        await expect(result.current.submitQuote()).rejects.toThrow('Submission failed');
      });

      expect(result.current.error).toBe('Submission failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('should show loading state during submission', async () => {
      const onComplete = jest.fn().mockImplementation(() =>
        new Promise((resolve) => setTimeout(resolve, 100))
      );
      const { result } = renderHook(() =>
        useQuoteWizard({ onComplete })
      );

      act(() => {
        result.current.updateCustomer({ name: 'John', email: 'john@example.com' });
        result.current.addLineItem({ name: 'Product', quantity: 1, unit_price: 100 });
      });

      act(() => {
        result.current.submitQuote();
      });

      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('reset functionality', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateCustomer({ name: 'John', email: 'john@example.com' });
        result.current.addLineItem({ name: 'Product' });
        result.current.nextStep();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentStep).toBe('customer-info');
      expect(result.current.formData.customer.name).toBe('');
      expect(result.current.formData.line_items).toHaveLength(0);
      expect(result.current.completedSteps).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateFormData({ title: 'Test' });
      });

      // Simulate error
      act(() => {
        result.current.updateFormData({ ...result.current.formData });
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('save draft', () => {
    it('should save draft', async () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateCustomer({ name: 'John', email: 'john@example.com' });
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(mockConsoleLog).toHaveBeenCalledWith('Saving draft:', expect.any(Object));
    });
  });

  describe('component compatibility', () => {
    it('should expose steps array', () => {
      const { result } = renderHook(() => useQuoteWizard());

      expect(result.current.steps).toEqual(WIZARD_STEPS);
    });

    it('should update customer info via compatibility method', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateCustomerInfo({
          email: 'test@example.com',
          contactName: 'Test User',
          companyName: 'Test Co',
          phone: '123-456-7890',
        });
      });

      expect(result.current.formData.customer.email).toBe('test@example.com');
      expect(result.current.formData.customer.name).toBe('Test User');
    });

    it('should provide data transformation', () => {
      const { result } = renderHook(() => useQuoteWizard());

      act(() => {
        result.current.updateCustomer({ name: 'John', email: 'john@example.com' });
        result.current.addLineItem({ name: 'Product', quantity: 2, unit_price: 50 });
      });

      expect(result.current.data.customerInfo.email).toBe('john@example.com');
      expect(result.current.data.lineItems.items).toHaveLength(1);
    });
  });
});

describe('calculateQuoteTotals', () => {
  it('should calculate totals for empty line items', () => {
    const result = calculateQuoteTotals([]);

    expect(result.subtotal).toBe(0);
    expect(result.taxTotal).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should calculate totals for single item', () => {
    const items = [
      { name: 'Item', quantity: 2, unit_price: 50, discount_percent: 0 },
    ];

    const result = calculateQuoteTotals(items as any);

    expect(result.subtotal).toBe(100);
    expect(result.total).toBe(100);
  });

  it('should handle item-level discounts', () => {
    const items = [
      { name: 'Item', quantity: 1, unit_price: 100, discount_percent: 20 },
    ];

    const result = calculateQuoteTotals(items as any);

    expect(result.subtotal).toBe(80); // 100 - 20%
  });

  it('should handle global discount', () => {
    const items = [
      { name: 'Item', quantity: 1, unit_price: 200, discount_percent: 0 },
    ];

    const result = calculateQuoteTotals(items as any, 50);

    expect(result.subtotal).toBe(200);
    expect(result.discountTotal).toBe(50);
    expect(result.total).toBe(150);
  });

  it('should handle global tax rate', () => {
    const items = [
      { name: 'Item', quantity: 1, unit_price: 100, discount_percent: 0 },
    ];

    const result = calculateQuoteTotals(items as any, 0, 8);

    expect(result.subtotal).toBe(100);
    expect(result.taxTotal).toBe(8);
    expect(result.total).toBe(108);
  });

  it('should handle complex calculation with all factors', () => {
    const items = [
      { name: 'Item 1', quantity: 2, unit_price: 100, discount_percent: 10 }, // 180
      { name: 'Item 2', quantity: 1, unit_price: 50, discount_percent: 0 },   // 50
    ];

    // subtotal: 230 (after item discounts)
    // discount: 30 (global)
    // taxable: 200
    // tax: 20 (10% of 200)
    // total: 220
    const result = calculateQuoteTotals(items as any, 30, 10);

    expect(result.subtotal).toBe(230);
    expect(result.discountTotal).toBe(30);
    expect(result.taxTotal).toBe(20);
    expect(result.total).toBe(220);
  });
});
