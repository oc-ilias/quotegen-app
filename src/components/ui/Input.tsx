/**
 * Input Component (Accessibility Enhanced)
 * Accessible form input with proper label association and error handling
 * @module components/ui/Input
 */

import React, { useId, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@/components/accessibility/VisuallyHidden';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  hideLabel?: boolean;
  requiredIndicator?: boolean;
  inputClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      hideLabel = false,
      required,
      requiredIndicator = true,
      id: providedId,
      inputClassName,
      'aria-describedby': describedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const labelId = `${id}-label`;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    // Build aria-describedby value
    const ariaDescribedBy = [
      describedBy,
      error && errorId,
      helperText && !error && helperId,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    const inputElement = (
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full px-4 py-2.5 bg-slate-900 border rounded-lg text-slate-100',
          'placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
          'transition-all duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
            : 'border-slate-700 hover:border-slate-600',
          inputClassName
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={ariaDescribedBy}
        aria-required={required}
        aria-labelledby={label ? labelId : undefined}
        required={required}
        {...props}
      />
    );

    return (
      <div className={cn('w-full', className)}>
        {label && hideLabel ? (
          <VisuallyHidden as="label" htmlFor={id}>
            {label}
            {required && requiredIndicator && <span aria-hidden="true"> *</span>}
          </VisuallyHidden>
        ) : label ? (
          <label
            id={labelId}
            htmlFor={id}
            className={cn(
              'block text-sm font-medium text-slate-300 mb-1.5',
              'cursor-pointer'
            )}
          >
            {label}
            {required && requiredIndicator && (
              <span className="text-red-400 ml-1" aria-hidden="true">*</span>
            )}
            {required && requiredIndicator && (
              <VisuallyHidden> (required)</VisuallyHidden>
            )}
          </label>
        ) : null}

        {inputElement}

        {/* Error message - aria-live for dynamic announcements */}
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-red-400"
            role="alert"
            aria-live="assertive"
          >
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

export default Input;