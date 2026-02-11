/**
 * @fileoverview Input Component - Comprehensive form input with icons and validation
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Input label="Email" placeholder="Enter your email" />
 * 
 * // With icon
 * <Input 
 *   label="Search" 
 *   leftIcon={<SearchIcon />}
 *   placeholder="Search..." 
 * />
 * 
 * // With validation
 * <Input 
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 *   helperText="Use a strong password"
 * />
 * 
 * // Controlled input
 * <Input 
 *   label="Username"
 *   value={username}
 *   onChange={(e) => setUsername(e.target.value)}
 * />
 * 
 * // Sizes
 * <Input size="sm" placeholder="Small input" />
 * <Input size="md" placeholder="Medium input" />
 * <Input size="lg" placeholder="Large input" />
 * ```
 */

import React, { useId, forwardRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@/components/accessibility/VisuallyHidden';

// ============================================================================
// Types
// ============================================================================

/**
 * Input size options
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Input validation state
 */
export type InputValidationState = 'idle' | 'valid' | 'invalid';

/**
 * Input component props
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Visual size of the input */
  size?: InputSize;
  /** Error message to display */
  error?: string;
  /** Helper text for additional context */
  helperText?: string;
  /** Hide the label visually but keep it accessible */
  hideLabel?: boolean;
  /** Show required indicator */
  requiredIndicator?: boolean;
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode;
  /** Custom class for the input element */
  inputClassName?: string;
  /** Custom class for the container */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Clearable input - shows clear button when has value */
  isClearable?: boolean;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Validation state (overrides error state styling) */
  validationState?: InputValidationState;
}

// ============================================================================
// Style Constants
// ============================================================================

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

const iconSizeStyles: Record<InputSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
};

const iconOffsetStyles: Record<InputSize, string> = {
  sm: 'left-3',
  md: 'left-4',
  lg: 'left-5',
};

const rightIconOffsetStyles: Record<InputSize, string> = {
  sm: 'right-3',
  md: 'right-4',
  lg: 'right-5',
};

// ============================================================================
// Input Component
// ============================================================================

/**
 * Comprehensive input component with full accessibility support
 * 
 * Features:
 * - Label association with proper aria attributes
 * - Error and helper text with live region announcements
 * - Icon support (left and right)
 * - Clearable input functionality
 * - Loading state
 * - Multiple sizes
 * - Full keyboard navigation
 * 
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/edit/} ARIA Edit Pattern
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      size = 'md',
      error,
      helperText,
      hideLabel = false,
      required,
      requiredIndicator = true,
      leftIcon,
      rightIcon,
      inputClassName,
      isLoading,
      isClearable,
      onClear,
      validationState,
      id: providedId,
      value,
      defaultValue,
      onChange,
      'aria-describedby': describedBy,
      disabled,
      readOnly,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const labelId = `${id}-label`;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const [internalValue, setInternalValue] = useState(defaultValue || '');

    // Determine if controlled or uncontrolled
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const hasValue = Boolean(currentValue);

    // Validation state detection
    const currentValidationState: InputValidationState = validationState || (error ? 'invalid' : 'idle');

    // Build aria-describedby value
    const ariaDescribedBy = [
      describedBy,
      error && errorId,
      helperText && !error && helperId,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    // Handle change for uncontrolled inputs
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    }, [isControlled, onChange]);

    // Handle clear
    const handleClear = useCallback(() => {
      if (!isControlled) {
        setInternalValue('');
      }
      onClear?.();
      
      // Focus the input after clearing
      const input = document.getElementById(id) as HTMLInputElement;
      input?.focus();
    }, [isControlled, onClear, id]);

    // Render label
    const renderLabel = () => {
      if (!label) return null;

      const labelContent = (
        <>
          {label}
          {required && requiredIndicator && (
            <span className="text-red-400 ml-1" aria-hidden="true">*</span>
          )}
          {required && requiredIndicator && (
            <VisuallyHidden> (required)</VisuallyHidden>
          )}
        </>
      );

      if (hideLabel) {
        return (
          <VisuallyHidden as="label" htmlFor={id} id={labelId}>
            {labelContent}
          </VisuallyHidden>
        );
      }

      return (
        <label
          id={labelId}
          htmlFor={id}
          className={cn(
            'block text-sm font-medium text-slate-300 mb-1.5',
            'cursor-pointer',
            disabled && 'text-slate-500 cursor-not-allowed'
          )}
        >
          {labelContent}
        </label>
      );
    };

    // Determine border color based on validation state
    const borderColorClass = {
      idle: 'border-slate-700 hover:border-slate-600 focus:border-indigo-500',
      valid: 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20',
      invalid: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
    }[currentValidationState];

    // Input padding adjustment for icons
    const paddingLeftClass = leftIcon ? 'pl-11' : '';
    const paddingRightClass = (rightIcon || (isClearable && hasValue) || isLoading) ? 'pr-11' : '';

    return (
      <div className={cn('w-full', className)}>
        {renderLabel()}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-500',
                iconOffsetStyles[size],
                iconSizeStyles[size]
              )}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          {/* Input Element */}
          <input
            ref={ref}
            id={id}
            type={type}
            value={currentValue}
            onChange={handleChange}
            className={cn(
              // Base styles
              'w-full bg-slate-900 border rounded-lg text-slate-100',
              'placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
              'transition-all duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800',
              'read-only:bg-slate-800/50 read-only:cursor-default',
              
              // Size and padding
              sizeStyles[size],
              paddingLeftClass,
              paddingRightClass,
              
              // Border color
              borderColorClass,
              
              // Custom classes
              inputClassName
            )}
            aria-invalid={currentValidationState === 'invalid'}
            aria-describedby={ariaDescribedBy}
            aria-required={required}
            aria-labelledby={label ? labelId : undefined}
            aria-busy={isLoading}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            {...props}
          />

          {/* Right side content (icon, clear button, or loading spinner) */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 flex items-center gap-2',
              rightIconOffsetStyles[size]
            )}
          >
            {/* Loading Spinner */}
            {isLoading && (
              <svg
                className={cn('animate-spin text-slate-500', iconSizeStyles[size])}
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}

            {/* Clear Button */}
            {!isLoading && isClearable && hasValue && !disabled && !readOnly && (
              <button
                type="button"
                onClick={handleClear}
                className={cn(
                  'text-slate-500 hover:text-slate-300 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-0.5',
                  iconSizeStyles[size]
                )}
                aria-label="Clear input"
                tabIndex={-1}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Right Icon */}
            {!isLoading && !(isClearable && hasValue) && rightIcon && (
              <div className={cn('text-slate-500', iconSizeStyles[size])} aria-hidden="true">
                {rightIcon}
              </div>
            )}
          </div>
        </div>

        {/* Validation Icon Indicator */}
        {currentValidationState === 'valid' && !rightIcon && !isLoading && (
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-emerald-500',
              rightIconOffsetStyles[size],
              iconSizeStyles[size]
            )}
            aria-hidden="true"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Error message - aria-live for dynamic announcements */}
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-red-400 flex items-center gap-1.5"
            role="alert"
            aria-live="assertive"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// Input Group Component
// ============================================================================

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Input and addons to group */
  children: React.ReactNode;
  /** Position of the addon relative to input */
  addonPosition?: 'left' | 'right';
  /** Addon content */
  addon?: React.ReactNode;
}

/**
 * InputGroup component for grouping inputs with addons
 * 
 * @example
 * ```tsx
 * <InputGroup addon="$" addonPosition="left">
 *   <Input placeholder="Amount" />
 * </InputGroup>
 * 
 * <InputGroup addon=".com" addonPosition="right">
 *   <Input placeholder="domain" />
 * </InputGroup>
 * ```
 */
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  ({ children, addon, addonPosition = 'left', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex', className)}
      {...props}
    >
      {addon && addonPosition === 'left' && (
        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-700 bg-slate-800 text-slate-400 text-sm">
          {addon}
        </span>
      )}
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<InputProps>, {
          className: cn(
            (child as React.ReactElement<InputProps>).props.className,
            addonPosition === 'left' && 'rounded-l-none',
            addonPosition === 'right' && 'rounded-r-none'
          ),
        });
      })}
      {addon && addonPosition === 'right' && (
        <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-slate-700 bg-slate-800 text-slate-400 text-sm">
          {addon}
        </span>
      )}
    </div>
  )
);

InputGroup.displayName = 'InputGroup';

export default Input;
