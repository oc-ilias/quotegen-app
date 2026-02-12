/**
 * Form Validation Utilities
 * Comprehensive validation with error formatting and field-level validation
 * @module lib/validation
 */

import { z, type ZodError, type ZodSchema } from 'zod';

// ============================================================================
// Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export type FieldValidator = (value: unknown) => string | null;

export interface FieldValidationConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: FieldValidator;
}

// ============================================================================
// Common Validation Schemas
// ============================================================================

export const emailSchema = z.string().email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const urlSchema = z.string().url('Please enter a valid URL');

export const phoneSchema = z.string().regex(
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  'Please enter a valid phone number'
);

export const currencySchema = z
  .number()
  .min(0, 'Amount must be positive')
  .max(999999999.99, 'Amount exceeds maximum allowed');

// ============================================================================
// Quote-Specific Schemas
// ============================================================================

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: emailSchema,
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export const lineItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  discount: z.number().min(0).max(100, 'Discount cannot exceed 100%').optional(),
  tax_rate: z.number().min(0).max(100).optional(),
});

export const quoteFormSchema = z.object({
  customer: customerSchema,
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  valid_until: z.string().refine((date) => {
    const expiryDate = new Date(date);
    return expiryDate > new Date();
  }, 'Expiry date must be in the future'),
  notes: z.string().max(2000, 'Notes cannot exceed 2000 characters').optional(),
  terms: z.string().max(5000, 'Terms cannot exceed 5000 characters').optional(),
  currency: z.string().default('USD'),
  tax_rate: z.number().min(0).max(100).optional(),
  discount_type: z.enum(['percentage', 'fixed']).optional(),
  discount_value: z.number().min(0).optional(),
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate data against a Zod schema
 */
export function validateWithSchema<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

/**
 * Format Zod errors into our validation error format
 */
export function formatZodErrors(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Create a field validator function
 */
export function createFieldValidator(config: FieldValidationConfig): FieldValidator {
  return (value: unknown): string | null => {
    // Required check
    if (config.required) {
      if (value === undefined || value === null || value === '') {
        return 'This field is required';
      }
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    const strValue = String(value);

    // Min length check
    if (config.minLength !== undefined && strValue.length < config.minLength) {
      return `Must be at least ${config.minLength} characters`;
    }

    // Max length check
    if (config.maxLength !== undefined && strValue.length > config.maxLength) {
      return `Must be no more than ${config.maxLength} characters`;
    }

    // Number min/max check
    if (typeof value === 'number') {
      if (config.min !== undefined && value < config.min) {
        return `Must be at least ${config.min}`;
      }
      if (config.max !== undefined && value > config.max) {
        return `Must be no more than ${config.max}`;
      }
    }

    // Pattern check
    if (config.pattern && !config.pattern.test(strValue)) {
      return 'Invalid format';
    }

    // Email check
    if (config.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(strValue)) {
        return 'Please enter a valid email address';
      }
    }

    // URL check
    if (config.url) {
      try {
        new URL(strValue);
      } catch {
        return 'Please enter a valid URL';
      }
    }

    // Custom validation
    if (config.custom) {
      return config.custom(value);
    }

    return null;
  };
}

/**
 * Validate a single field
 */
export function validateField(
  value: unknown,
  config: FieldValidationConfig
): string | null {
  const validator = createFieldValidator(config);
  return validator(value);
}

/**
 * Validate multiple fields at once
 */
export function validateFields(
  values: Record<string, unknown>,
  configs: Record<string, FieldValidationConfig>
): Record<string, string | null> {
  const errors: Record<string, string | null> = {};

  for (const [field, config] of Object.entries(configs)) {
    errors[field] = validateField(values[field], config);
  }

  return errors;
}

/**
 * Check if any errors exist in the validation result
 */
export function hasErrors(errors: Record<string, string | null>): boolean {
  return Object.values(errors).some((error) => error !== null);
}

/**
 * Get first error message from errors object
 */
export function getFirstError(errors: Record<string, string | null>): string | null {
  for (const error of Object.values(errors)) {
    if (error !== null) {
      return error;
    }
  }
  return null;
}

// ============================================================================
// Async Validation
// ============================================================================

export interface AsyncValidationConfig extends FieldValidationConfig {
  asyncValidator?: (value: unknown) => Promise<string | null>;
  debounceMs?: number;
}

/**
 * Debounce function for async validation
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

// ============================================================================
// Form Utilities
// ============================================================================

/**
 * Create initial form state
 */
export function createFormState<T extends Record<string, unknown>>(
  initialValues: T
): {
  values: T;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
} {
  const keys = Object.keys(initialValues) as Array<keyof T>;

  return {
    values: initialValues,
    errors: keys.reduce((acc, key) => ({ ...acc, [key]: null }), {} as Record<keyof T, string | null>),
    touched: keys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<keyof T, boolean>),
    isSubmitting: false,
  };
}

/**
 * Sanitize form input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 10000); // Limit length
}

/**
 * Format currency input
 */
export function formatCurrencyInput(value: string): string {
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  return cleaned;
}

/**
 * Parse currency input to number
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// ============================================================================
// Export All Schemas
// ============================================================================

export const schemas = {
  email: emailSchema,
  password: passwordSchema,
  url: urlSchema,
  phone: phoneSchema,
  currency: currencySchema,
  customer: customerSchema,
  lineItem: lineItemSchema,
  quoteForm: quoteFormSchema,
} as const;

export default {
  validateWithSchema,
  formatZodErrors,
  createFieldValidator,
  validateField,
  validateFields,
  hasErrors,
  getFirstError,
  debounce,
  createFormState,
  sanitizeInput,
  formatCurrencyInput,
  parseCurrencyInput,
  schemas,
};
