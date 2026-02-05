/**
 * Button Component (Accessibility Enhanced)
 * Accessible button with loading states and keyboard support
 * @module components/ui/Button
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@/components/accessibility/VisuallyHidden';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      loadingText,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = isLoading || disabled;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.98]',
          // Visible focus indicator for keyboard navigation
          'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          {
            'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/25':
              variant === 'primary',
            'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700':
              variant === 'secondary',
            'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800':
              variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-400':
              variant === 'danger',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2.5 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
            {loadingText && <span>{loadingText}</span>}
            <VisuallyHidden>Loading, please wait</VisuallyHidden>
          </>
        )}
        {!isLoading && children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;