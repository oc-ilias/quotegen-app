/**
 * Unit Tests for Utility Functions
 * @module lib/__tests__/utils.test
 */

import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
  generateQuoteNumber,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
} from '@/lib/utils';

// Mock clsx and tailwind-merge
jest.mock('clsx', () => ({
  clsx: jest.fn((...inputs: any[]) => inputs.filter(Boolean).join(' ')),
}));

jest.mock('tailwind-merge', () => ({
  twMerge: jest.fn((input: string) => input),
}));

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(typeof result).toBe('string');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(typeof result).toBe('string');
    });

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(typeof result).toBe('string');
    });

    it('should handle empty inputs', () => {
      const result = cn();
      expect(typeof result).toBe('string');
    });

    it('should handle null and undefined', () => {
      const result = cn('class1', null, undefined, 'class2');
      expect(typeof result).toBe('string');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      const result = formatCurrency(100);
      expect(result).toBe('$100.00');
    });

    it('should format EUR currency correctly', () => {
      const result = formatCurrency(100, 'EUR');
      expect(result).toContain('100.00');
      expect(result).toContain('€');
    });

    it('should format GBP currency correctly', () => {
      const result = formatCurrency(100, 'GBP');
      expect(result).toContain('100.00');
      expect(result).toContain('£');
    });

    it('should handle zero amount', () => {
      const result = formatCurrency(0);
      expect(result).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-50);
      expect(result).toBe('-$50.00');
    });

    it('should handle decimal amounts', () => {
      const result = formatCurrency(99.99);
      expect(result).toBe('$99.99');
    });

    it('should use USD as default currency', () => {
      const result = formatCurrency(100);
      expect(result).toBe('$100.00');
    });

    it('should handle very large amounts', () => {
      const result = formatCurrency(1000000);
      expect(result).toBe('$1,000,000.00');
    });
  });

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should format Date object correctly', () => {
      const date = new Date('2024-06-20');
      const result = formatDate(date);
      expect(result).toContain('Jun');
      expect(result).toContain('20');
      expect(result).toContain('2024');
    });

    it('should handle ISO date string', () => {
      const result = formatDate('2024-03-10T10:30:00.000Z');
      expect(result).toContain('Mar');
      expect(result).toContain('10');
    });

    it('should handle invalid date gracefully', () => {
      expect(() => formatDate('invalid-date')).toThrow();
    });

    it('should handle edge case dates', () => {
      const result = formatDate('2024-02-29'); // Leap year
      expect(result).toContain('Feb');
      expect(result).toContain('29');
    });
  });

  describe('formatDateTime', () => {
    it('should format date with time correctly', () => {
      const result = formatDateTime('2024-01-15T14:30:00');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should format Date object with time correctly', () => {
      const date = new Date('2024-06-20T09:15:00');
      const result = formatDateTime(date);
      expect(result).toContain('Jun');
      expect(result).toContain('20');
      expect(result).toContain('2024');
    });

    it('should handle ISO date string with timezone', () => {
      const result = formatDateTime('2024-03-10T10:30:00.000Z');
      expect(result).toContain('Mar');
      expect(result).toContain('10');
      expect(result).toContain('2024');
    });

    it('should handle invalid date gracefully', () => {
      expect(() => formatDateTime('invalid-date')).toThrow();
    });
  });

  describe('getStatusColor', () => {
    it('should return pending color for pending status', () => {
      const result = getStatusColor('pending');
      expect(result).toContain('amber');
    });

    it('should return quoted color for quoted status', () => {
      const result = getStatusColor('quoted');
      expect(result).toContain('blue');
    });

    it('should return accepted color for accepted status', () => {
      const result = getStatusColor('accepted');
      expect(result).toContain('emerald');
    });

    it('should return declined color for declined status', () => {
      const result = getStatusColor('declined');
      expect(result).toContain('red');
    });

    it('should return draft color for draft status', () => {
      const result = getStatusColor('draft');
      expect(result).toContain('slate');
    });

    it('should return sent color for sent status', () => {
      const result = getStatusColor('sent');
      expect(result).toContain('indigo');
    });

    it('should be case insensitive', () => {
      const result1 = getStatusColor('PENDING');
      const result2 = getStatusColor('Pending');
      expect(result1).toBe(result2);
    });

    it('should return pending color for unknown status', () => {
      const result = getStatusColor('unknown');
      expect(result).toContain('amber');
    });

    it('should handle empty string as unknown status', () => {
      const result = getStatusColor('');
      expect(result).toContain('amber');
    });
  });

  describe('generateQuoteNumber', () => {
    it('should generate quote number with QT prefix', () => {
      const result = generateQuoteNumber();
      expect(result).toMatch(/^QT-/);
    });

    it('should generate unique quote numbers', () => {
      const result1 = generateQuoteNumber();
      const result2 = generateQuoteNumber();
      expect(result1).not.toBe(result2);
    });

    it('should generate quote number with correct format', () => {
      const result = generateQuoteNumber();
      const parts = result.split('-');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('QT');
      expect(parts[1]).toMatch(/^[A-Z0-9]+$/);
      expect(parts[2]).toMatch(/^[A-Z0-9]{3}$/);
    });

    it('should include timestamp component', () => {
      const before = Date.now();
      const result = generateQuoteNumber();
      const after = Date.now();
      const parts = result.split('-');
      const timestamp = parseInt(parts[1], 36);
      expect(timestamp).toBeGreaterThanOrEqual(before - 1000);
      expect(timestamp).toBeLessThanOrEqual(after + 1000);
    });
  });

  describe('calculateSubtotal', () => {
    it('should calculate subtotal for single item', () => {
      const items = [{ quantity: 2, unitPrice: 50 }];
      const result = calculateSubtotal(items);
      expect(result).toBe(100);
    });

    it('should calculate subtotal for multiple items', () => {
      const items = [
        { quantity: 2, unitPrice: 50 },
        { quantity: 1, unitPrice: 100 },
        { quantity: 3, unitPrice: 25 },
      ];
      const result = calculateSubtotal(items);
      expect(result).toBe(275); // 100 + 100 + 75
    });

    it('should return 0 for empty array', () => {
      const result = calculateSubtotal([]);
      expect(result).toBe(0);
    });

    it('should handle zero quantity', () => {
      const items = [{ quantity: 0, unitPrice: 50 }];
      const result = calculateSubtotal(items);
      expect(result).toBe(0);
    });

    it('should handle zero unit price', () => {
      const items = [{ quantity: 5, unitPrice: 0 }];
      const result = calculateSubtotal(items);
      expect(result).toBe(0);
    });

    it('should handle decimal quantities', () => {
      const items = [{ quantity: 2.5, unitPrice: 10 }];
      const result = calculateSubtotal(items);
      expect(result).toBe(25);
    });

    it('should handle decimal unit prices', () => {
      const items = [{ quantity: 3, unitPrice: 9.99 }];
      const result = calculateSubtotal(items);
      expect(result).toBeCloseTo(29.97, 2);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax correctly', () => {
      const result = calculateTax(100, 8);
      expect(result).toBe(8);
    });

    it('should calculate tax for zero subtotal', () => {
      const result = calculateTax(0, 8);
      expect(result).toBe(0);
    });

    it('should calculate tax for zero rate', () => {
      const result = calculateTax(100, 0);
      expect(result).toBe(0);
    });

    it('should handle decimal tax rate', () => {
      const result = calculateTax(100, 8.25);
      expect(result).toBe(8.25);
    });

    it('should handle high tax rate', () => {
      const result = calculateTax(100, 20);
      expect(result).toBe(20);
    });

    it('should handle negative tax rate', () => {
      const result = calculateTax(100, -5);
      expect(result).toBe(-5);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      const result = calculateTotal(100, 8);
      expect(result).toBe(108);
    });

    it('should calculate total with discount', () => {
      const result = calculateTotal(100, 8, 10);
      expect(result).toBe(98); // 100 + 8 - 10
    });

    it('should calculate total with zero discount', () => {
      const result = calculateTotal(100, 8, 0);
      expect(result).toBe(108);
    });

    it('should calculate total without discount parameter', () => {
      const result = calculateTotal(100, 8);
      expect(result).toBe(108);
    });

    it('should handle zero subtotal', () => {
      const result = calculateTotal(0, 8, 5);
      expect(result).toBe(3);
    });

    it('should handle zero tax', () => {
      const result = calculateTotal(100, 0, 10);
      expect(result).toBe(90);
    });

    it('should handle discount larger than subtotal', () => {
      const result = calculateTotal(100, 8, 150);
      expect(result).toBe(-42); // 100 + 8 - 150
    });

    it('should handle negative values', () => {
      const result = calculateTotal(-100, -8, -5);
      expect(result).toBe(-103); // -100 + (-8) - (-5)
    });
  });
});
