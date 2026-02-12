import React from 'react';
import { cn } from '@/lib/utils';
import type { InputProps } from '@/types';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 bg-slate-900 border rounded-lg text-slate-100',
              leftIcon && 'pl-10',
              'placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
              'transition-all duration-150',
              error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                : 'border-slate-700 hover:border-slate-600',
              className
            )}
            {...props}
          />
        </div>
        
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
