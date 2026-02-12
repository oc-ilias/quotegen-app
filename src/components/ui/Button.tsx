/**
 * Enhanced Button Component
 * Multiple variants, sizes, and states with animations
 * @module components/ui/Button
 */

'use client';

import React, { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Spinner } from './Loading';

// ============================================================================
// Types
// ============================================================================

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger' 
  | 'success';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  fullWidth?: boolean;
  isIconOnly?: boolean;
  animateOnHover?: boolean;
  animateOnTap?: boolean;
}

// ============================================================================
// Variant Configurations
// ============================================================================

const variantConfig: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-indigo-600 text-white',
    'hover:bg-indigo-500',
    'focus:ring-indigo-500/50',
    'active:bg-indigo-700',
    'shadow-lg shadow-indigo-500/25'
  ),
  secondary: cn(
    'bg-slate-700 text-slate-100',
    'hover:bg-slate-600',
    'focus:ring-slate-500/50',
    'active:bg-slate-800',
    'shadow-lg shadow-slate-900/25'
  ),
  outline: cn(
    'bg-transparent border-2 border-slate-700 text-slate-300',
    'hover:bg-slate-800 hover:border-slate-600',
    'focus:ring-slate-500/50',
    'active:bg-slate-900'
  ),
  ghost: cn(
    'bg-transparent text-slate-400',
    'hover:bg-slate-800/50 hover:text-slate-200',
    'focus:ring-slate-500/50',
    'active:bg-slate-800'
  ),
  danger: cn(
    'bg-red-600 text-white',
    'hover:bg-red-500',
    'focus:ring-red-500/50',
    'active:bg-red-700',
    'shadow-lg shadow-red-500/25'
  ),
  success: cn(
    'bg-emerald-600 text-white',
    'hover:bg-emerald-500',
    'focus:ring-emerald-500/50',
    'active:bg-emerald-700',
    'shadow-lg shadow-emerald-500/25'
  ),
};

// ============================================================================
// Size Configurations
// ============================================================================

const sizeConfig: Record<ButtonSize, { button: string; icon: string }> = {
  xs: { button: 'px-2.5 py-1.5 text-xs gap-1.5', icon: 'w-3.5 h-3.5' },
  sm: { button: 'px-3 py-2 text-sm gap-1.5', icon: 'w-4 h-4' },
  md: { button: 'px-4 py-2.5 text-sm gap-2', icon: 'w-5 h-5' },
  lg: { button: 'px-5 py-3 text-base gap-2', icon: 'w-5 h-5' },
  xl: { button: 'px-6 py-4 text-lg gap-3', icon: 'w-6 h-6' },
};

// ============================================================================
// Button Component
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      leftIcon,
      rightIcon,
      loadingText,
      fullWidth = false,
      isIconOnly = false,
      animateOnHover = true,
      animateOnTap = true,
      ...props
    },
    ref
  ) => {
    const isButtonDisabled = isDisabled || isLoading;

    const buttonContent = (
      <>
        {isLoading ? (
          <>
            <Spinner size={size === 'xs' || size === 'sm' ? 'xs' : 'sm'} />
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={cn('flex-shrink-0', sizeConfig[size].icon)}>{leftIcon}</span>
            )}
            {children && !isIconOnly && <span>{children}</span>}
            {rightIcon && (
              <span className={cn('flex-shrink-0', sizeConfig[size].icon)}>{rightIcon}</span>
            )}
          </>
        )}
      </>
    );

    const buttonClasses = cn(
      // Base styles
      'relative inline-flex items-center justify-center',
      'font-medium rounded-lg',
      'transition-all duration-200 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none',
      
      // Variant styles
      variantConfig[variant],
      
      // Size styles
      sizeConfig[size].button,
      
      // Layout styles
      fullWidth && 'w-full',
      isIconOnly && !sizeConfig[size].button.includes('px-') && 'p-2.5',
      
      // Custom classes
      className
    );

    if (animateOnHover || animateOnTap) {
      return (
        <motion.button
          ref={ref}
          className={buttonClasses}
          disabled={isButtonDisabled}
          whileHover={animateOnHover && !isButtonDisabled ? { 
            scale: 1.02,
            y: -1,
          } : undefined}
          whileTap={animateOnTap && !isButtonDisabled ? { 
            scale: 0.98,
          } : undefined}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
          {...props}
        >
          {buttonContent}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isButtonDisabled}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

// ============================================================================
// Icon Button Component
// ============================================================================

export function IconButton({
  children,
  className,
  size = 'md',
  variant = 'ghost',
  ...props
}: Omit<ButtonProps, 'isIconOnly' | 'leftIcon' | 'rightIcon'>) {
  const sizeClasses = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3',
  };

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(sizeClasses[size], 'rounded-lg', className)}
      {...props}
    >
      <span className={iconSizes[size]}>{children}</span>
    </Button>
  );
}

// ============================================================================
// Button Group Component
// ============================================================================

export function ButtonGroup({
  children,
  className,
  attached = false,
}: {
  children: React.ReactNode;
  className?: string;
  attached?: boolean;
}) {
  return (
    <div
      className={cn(
        'inline-flex',
        attached 
          ? '[&>*]:rounded-none first:[&>*]:rounded-l-lg last:[&>*]:rounded-r-lg [&>*]:-ml-px first:[&>*]:ml-0'
          : 'gap-2',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Floating Action Button Component
// ============================================================================

export function Fab({
  children,
  className,
  onClick,
  ...props
}: Omit<ButtonProps, 'size' | 'variant'>) {
  return (
    <motion.button
      className={cn(
        'fixed bottom-6 right-6',
        'w-14 h-14 rounded-full',
        'bg-indigo-600 text-white',
        'flex items-center justify-center',
        'shadow-lg shadow-indigo-500/30',
        'hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        'z-40',
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
