import React from 'react';
import { cn } from '@/lib/utils';
import type { ButtonProps } from '@/types';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'active:scale-[0.98]',
          {
            'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/25': variant === 'primary',
            'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700': variant === 'secondary',
            'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-400': variant === 'danger',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2.5 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
