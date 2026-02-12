/**
 * Utils Library Tests
 * Tests for cn (className utility), formatters, validators
 * @module lib/__tests__/utils.test.ts
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

// ============================================================================
// cn (className utility)
// ============================================================================

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class'
    );
    
    expect(result).toBe('base-class active-class');
  });

  it('should handle undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2', undefined);
    expect(result).toBe('class1 class2');
  });

  it('should handle empty strings', () => {
    const result = cn('class1', '', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle boolean values', () => {
    const result = cn('class1', true && 'conditional', false && 'never');
    expect(result).toBe('class1 conditional');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle objects with conditional classes', () => {
    const result = cn({
      'active-class': true,
      'inactive-class': false,
      'another-class': true,
    });
    expect(result).toBe('active-class another-class');
  });

  it('should merge Tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    // tailwind-merge should resolve conflicts
    expect(result).toContain('px-4');
  });

  it('should handle nested arrays', () => {
    const result = cn(['class1', ['class2', 'class3']], 'class4');
    expect(result).toBe('class1 class2 class3 class4');
  });

  it('should handle complex combinations', () => {
    const isOpen = true;
    const isLarge = false;
    
    const result = cn(
      'base',
      isOpen && 'open',
      isLarge ? 'large' : 'small',
      ['array-class'],
      { 'object-class': true }
    );
    
    expect(result).toContain('base');
    expect(result).toContain('open');
    expect(result).toContain('small');
    expect(result).toContain('array-class');
    expect(result).toContain('object-class');
  });

  it('should handle single class', () => {
    const result = cn('single-class');
    expect(result).toBe('single-class');
  });

  it('should return empty string for no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should return empty string for only falsy values', () => {
    const result = cn(undefined, null, false, '');
    expect(result).toBe('');
  });

  it('should handle whitespace-only strings', () => {
    const result = cn('  ', 'class1', '   ', 'class2', '  ');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });
});

// ============================================================================
// formatCurrency
// ============================================================================

describe('formatCurrency', () => {
  it('should format USD by default', () => {
    const result = formatCurrency(100);
    expect(result).toBe('$100.00');
  });

  it('should format with specified currency', () => {
    const result = formatCurrency(100, 'EUR');
    expect(result).toBe('€100.00');
  });

  it('should format GBP', () => {
    const result = formatCurrency(100, 'GBP');
    expect(result).toBe('£100.00');
  });

  it('should format JPY (no decimals)', () => {
    const result = formatCurrency(100, 'JPY');
    expect(result).toBe('¥100');
  });

  it('should format zero', () => {
    const result = formatCurrency(0);
    expect(result).toBe('$0.00');
  });

  it('should format negative values', () => {
    const result = formatCurrency(-50);
    expect(result).toBe('-$50.00');
  });

  it('should format decimal values', () => {
    const result = formatCurrency(99.99);
    expect(result).toBe('$99.99');
  });

  it('should format large numbers', () => {
    const result = formatCurrency(1000000);
    expect(result).toBe('$1,000,000.00');
  });

  it('should format with thousands separator', () => {
    const result = formatCurrency(1234567.89);
    expect(result).toBe('$1,234,567.89');
  });

  it('should handle very small decimals', () => {
    const result = formatCurrency(0.01);
    expect(result).toBe('$0.01');
  });

  it('should round to 2 decimal places', () => {
    const result = formatCurrency(10.999);
    expect(result).toBe('$11.00');
  });

  it('should format CAD', () => {
    const result = formatCurrency(100, 'CAD');
    expect(result).toContain('100.00');
  });

  it('should format AUD', () => {
    const result = formatCurrency(100, 'AUD');
    expect(result).toContain('100.00');
  });
});

// ============================================================================
// formatDate
// ============================================================================

describe('formatDate', () => {
  it('should format Date object', () => {
    const date = new Date('2024-03-15');
    const result = formatDate(date);
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should format date string', () => {
    const result = formatDate('2024-06-20');
    expect(result).toContain('Jun');
    expect(result).toContain('20');
    expect(result).toContain('2024');
  });

  it('should format ISO string', () => {
    const result = formatDate('2024-01-01T00:00:00.000Z');
    expect(result).toContain('Jan');
    expect(result).toContain('1');
    expect(result).toContain('2024');
  });

  it('should format Unix timestamp', () => {
    const timestamp = new Date('2024-07-04').getTime();
    const result = formatDate(timestamp);
    expect(result).toContain('Jul');
    expect(result).toContain('4');
    expect(result).toContain('2024');
  });

  it('should handle different months', () => {
    const months = [
      { date: '2024-01-15', expected: 'Jan' },
      { date: '2024-02-15', expected: 'Feb' },
      { date: '2024-03-15', expected: 'Mar' },
      { date: '2024-04-15', expected: 'Apr' },
      { date: '2024-05-15', expected: 'May' },
      { date: '2024-06-15', expected: 'Jun' },
      { date: '2024-07-15', expected: 'Jul' },
      { date: '2024-08-15', expected: 'Aug' },
      { date: '2024-09-15', expected: 'Sep' },
      { date: '2024-10-15', expected: 'Oct' },
      { date: '2024-11-15', expected: 'Nov' },
      { date: '2024-12-15', expected: 'Dec' },
    ];

    months.forEach(({ date, expected }) => {
      const result = formatDate(date);
      expect(result).toContain(expected);
    });
  });

  it('should handle leap year dates', () => {
    const result = formatDate('2024-02-29');
    expect(result).toContain('Feb');
    expect(result).toContain('29');
  });

  it('should format year correctly', () => {
    const result = formatDate('2023-12-25');
    expect(result).toContain('2023');
  });
});

// ============================================================================
// formatDateTime
// ============================================================================

describe('formatDateTime', () => {
  it('should format Date object with time', () => {
    const date = new Date('2024-03-15T14:30:00');
    const result = formatDateTime(date);
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should format date string with time', () => {
    const result = formatDateTime('2024-06-20T09:15:00');
    expect(result).toContain('Jun');
    expect(result).toContain('20');
    expect(result).toContain('2024');
  });

  it('should include time in format', () => {
    const result = formatDateTime('2024-01-01T13:45:00');
    // Should contain either 1:45 PM or 13:45 depending on locale
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('should format midnight', () => {
    const result = formatDateTime('2024-01-01T00:00:00');
    expect(result).toContain('Jan');
    expect(result).toContain('1');
  });

  it('should format noon', () => {
    const result = formatDateTime('2024-01-01T12:00:00');
    expect(result).toContain('Jan');
    expect(result).toContain('1');
  });

  it('should handle different times', () => {
    const times = [
      '2024-01-01T00:00:00',
      '2024-01-01T06:30:00',
      '2024-01-01T12:00:00',
      '2024-01-01T18:45:00',
      '2024-01-01T23:59:00',
    ];

    times.forEach((time) => {
      const result = formatDateTime(time);
      expect(result).toContain('Jan');
      expect(result).toContain('1');
    });
  });
});

// ============================================================================
// getStatusColor
// ============================================================================

describe('getStatusColor', () => {
  it('should return pending color', () => {
    const result = getStatusColor('pending');
    expect(result).toContain('amber');
  });

  it('should return quoted color', () => {
    const result = getStatusColor('quoted');
    expect(result).toContain('blue');
  });

  it('should return accepted color', () => {
    const result = getStatusColor('accepted');
    expect(result).toContain('emerald');
  });

  it('should return declined color', () => {
    const result = getStatusColor('declined');
    expect(result).toContain('red');
  });

  it('should return draft color', () => {
    const result = getStatusColor('draft');
    expect(result).toContain('slate');
  });

  it('should return sent color', () => {
    const result = getStatusColor('sent');
    expect(result).toContain('indigo');
  });

  it('should handle uppercase status', () => {
    const result = getStatusColor('PENDING');
    expect(result).toContain('amber');
  });

  it('should handle mixed case status', () => {
    const result = getStatusColor('Pending');
    expect(result).toContain('amber');
  });

  it('should return pending for unknown status', () => {
    const result = getStatusColor('unknown');
    expect(result).toContain('amber');
  });

  it('should return pending for empty string', () => {
    const result = getStatusColor('');
    expect(result).toContain('amber');
  });

  it('should return all color classes', () => {
    const result = getStatusColor('accepted');
    expect(result).toContain('bg-');
    expect(result).toContain('text-');
    expect(result).toContain('border-');
  });

  it('should handle various statuses case-insensitively', () => {
    expect(getStatusColor('ACCEPTED')).toContain('emerald');
    expect(getStatusColor('Accepted')).toContain('emerald');
    expect(getStatusColor('accepted')).toContain('emerald');
  });
});

// ============================================================================
// generateQuoteNumber
// ============================================================================

describe('generateQuoteNumber', () => {
  it('should generate quote number with QT prefix', () => {
    const result = generateQuoteNumber();
    expect(result.startsWith('QT-')).toBe(true);
  });

  it('should generate unique quote numbers', () => {
    const result1 = generateQuoteNumber();
    const result2 = generateQuoteNumber();
    expect(result1).not.toBe(result2);
  });

  it('should contain timestamp component', () => {
    const result = generateQuoteNumber();
    const parts = result.split('-');
    expect(parts.length).toBeGreaterThanOrEqual(2);
    expect(parts[0]).toBe('QT');
  });

  it('should contain random component', () => {
    const result = generateQuoteNumber();
    const parts = result.split('-');
    expect(parts.length).toBe(3);
  });

  it('should generate uppercase letters', () => {
    const result = generateQuoteNumber();
    expect(result).toBe(result.toUpperCase());
  });

  it('should be consistent in format', () => {
    const results = Array.from({ length: 10 }, () => generateQuoteNumber());
    
    results.forEach((result) => {
      expect(result.startsWith('QT-')).toBe(true);
      expect(result.split('-').length).toBe(3);
    });
  });
});

// ============================================================================
// calculateSubtotal
// ============================================================================

describe('calculateSubtotal', () => {
  it('should calculate subtotal for single item', () => {
    const items = [{ quantity: 2, unitPrice: 50 }];
    const result = calculateSubtotal(items);
    expect(result).toBe(100);
  });

  it('should calculate subtotal for multiple items', () => {
    const items = [
      { quantity: 2, unitPrice: 50 },
      { quantity: 3, unitPrice: 30 },
      { quantity: 1, unitPrice: 100 },
    ];
    const result = calculateSubtotal(items);
    expect(result).toBe(100 + 90 + 100); // 290
  });

  it('should return 0 for empty array', () => {
    const result = calculateSubtotal([]);
    expect(result).toBe(0);
  });

  it('should handle zero quantity', () => {
    const items = [{ quantity: 0, unitPrice: 100 }];
    const result = calculateSubtotal(items);
    expect(result).toBe(0);
  });

  it('should handle zero price', () => {
    const items = [{ quantity: 5, unitPrice: 0 }];
    const result = calculateSubtotal(items);
    expect(result).toBe(0);
  });

  it('should handle decimal quantities', () => {
    const items = [{ quantity: 2.5, unitPrice: 10 }];
    const result = calculateSubtotal(items);
    expect(result).toBe(25);
  });

  it('should handle decimal prices', () => {
    const items = [{ quantity: 3, unitPrice: 9.99 }];
    const result = calculateSubtotal(items);
    expect(result).toBeCloseTo(29.97);
  });

  it('should handle large numbers', () => {
    const items = [{ quantity: 1000, unitPrice: 10000 }];
    const result = calculateSubtotal(items);
    expect(result).toBe(10000000);
  });

  it('should handle negative quantities', () => {
    const items = [{ quantity: -1, unitPrice: 100 }];
    const result = calculateSubtotal(items);
    expect(result).toBe(-100);
  });

  it('should handle negative prices', () => {
    const items = [{ quantity: 1, unitPrice: -50 }];
    const result = calculateSubtotal(items);
    expect(result).toBe(-50);
  });

  it('should calculate complex order correctly', () => {
    const items = [
      { quantity: 10, unitPrice: 25.99 },
      { quantity: 5, unitPrice: 15.50 },
      { quantity: 2, unitPrice: 100.00 },
    ];
    const result = calculateSubtotal(items);
    expect(result).toBeCloseTo(259.9 + 77.5 + 200, 1);
  });
});

// ============================================================================
// calculateTax
// ============================================================================

describe('calculateTax', () => {
  it('should calculate tax for subtotal', () => {
    const result = calculateTax(100, 10);
    expect(result).toBe(10);
  });

  it('should calculate tax with decimal rate', () => {
    const result = calculateTax(100, 8.25);
    expect(result).toBe(8.25);
  });

  it('should return 0 for zero subtotal', () => {
    const result = calculateTax(0, 10);
    expect(result).toBe(0);
  });

  it('should return 0 for zero tax rate', () => {
    const result = calculateTax(100, 0);
    expect(result).toBe(0);
  });

  it('should handle large subtotal', () => {
    const result = calculateTax(1000000, 10);
    expect(result).toBe(100000);
  });

  it('should handle high tax rate', () => {
    const result = calculateTax(100, 25);
    expect(result).toBe(25);
  });

  it('should handle 100% tax rate', () => {
    const result = calculateTax(100, 100);
    expect(result).toBe(100);
  });

  it('should calculate negative tax for negative subtotal', () => {
    const result = calculateTax(-100, 10);
    expect(result).toBe(-10);
  });

  it('should handle very small tax rate', () => {
    const result = calculateTax(100, 0.01);
    expect(result).toBe(0.01);
  });

  it('should handle decimal subtotal', () => {
    const result = calculateTax(99.99, 10);
    expect(result).toBeCloseTo(9.999);
  });
});

// ============================================================================
// calculateTotal
// ============================================================================

describe('calculateTotal', () => {
  it('should calculate total with subtotal and tax', () => {
    const result = calculateTotal(100, 10);
    expect(result).toBe(110);
  });

  it('should calculate total with discount', () => {
    const result = calculateTotal(100, 10, 20);
    expect(result).toBe(90);
  });

  it('should calculate total without discount', () => {
    const result = calculateTotal(100, 10);
    expect(result).toBe(110);
  });

  it('should handle zero subtotal', () => {
    const result = calculateTotal(0, 10, 0);
    expect(result).toBe(10);
  });

  it('should handle zero tax', () => {
    const result = calculateTotal(100, 0, 0);
    expect(result).toBe(100);
  });

  it('should handle zero discount', () => {
    const result = calculateTotal(100, 10, 0);
    expect(result).toBe(110);
  });

  it('should handle full discount', () => {
    const result = calculateTotal(100, 10, 110);
    expect(result).toBe(0);
  });

  it('should handle discount greater than total', () => {
    const result = calculateTotal(100, 10, 200);
    expect(result).toBe(-90);
  });

  it('should handle negative values', () => {
    const result = calculateTotal(-100, -10, -20);
    expect(result).toBe(-90);
  });

  it('should calculate complex order', () => {
    const result = calculateTotal(1000, 80, 100);
    expect(result).toBe(980);
  });

  it('should handle decimal values', () => {
    const result = calculateTotal(99.99, 8.25, 10);
    expect(result).toBeCloseTo(98.24, 1);
  });

  it('should use default discount of 0', () => {
    const result = calculateTotal(100, 10);
    expect(result).toBe(110);
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('edge cases', () => {
  describe('cn', () => {
    it('should handle very long class names', () => {
      const longClass = 'a'.repeat(1000);
      const result = cn(longClass);
      expect(result).toBe(longClass);
    });

    it('should handle many arguments', () => {
      const args = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const result = cn(...args);
      expect(result).toContain('class-0');
      expect(result).toContain('class-99');
    });
  });

  describe('formatCurrency', () => {
    it('should handle very large amounts', () => {
      const result = formatCurrency(999999999.99);
      expect(result).toContain('999,999,999.99');
    });

    it('should handle very small amounts', () => {
      const result = formatCurrency(0.01);
      expect(result).toBe('$0.01');
    });
  });

  describe('formatDate', () => {
    it('should handle invalid date string', () => {
      expect(() => formatDate('invalid')).toThrow();
    });

    it('should handle invalid date object', () => {
      expect(() => formatDate(new Date('invalid'))).toThrow();
    });
  });

  describe('calculateSubtotal', () => {
    it('should handle items with missing properties gracefully', () => {
      // @ts-expect-error - Testing invalid input
      const items = [{ quantity: 2 }];
      const result = calculateSubtotal(items);
      expect(result).toBeNaN();
    });
  });
});
