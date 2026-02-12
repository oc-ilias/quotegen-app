/**
 * @fileoverview Button Component - A comprehensive, accessible button component with multiple variants
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Button onClick={handleClick}>Click me</Button>
 * 
 * // Variants
 * <Button variant="primary">Primary</Button>
 * <Button variant="secondary">Secondary</Button>
 * <Button variant="danger">Danger</Button>
 * <Button variant="ghost">Ghost</Button>
 * 
 * // Sizes
 * <Button size="sm">Small</Button>
 * <Button size="md">Medium</Button>
 * <Button size="lg">Large</Button>
 * 
 * // Loading state
 * <Button isLoading loadingText="Saving...">Save</Button>
 * 
 * // With icons
 * <Button leftIcon={<PlusIcon />}>Add Item</Button>
 * <Button rightIcon={<ArrowRightIcon />}>Next</Button>
 * 
 * // As link
 * <Button as="a" href="/dashboard">Go to Dashboard</Button>
 * ```
 */

import React, { forwardRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@/components/accessibility/VisuallyHidden';

// ============================================================================
// Types
// ============================================================================

/**
 * Button visual variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'link';

/**
 * Button size options
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Button width behavior
 */
export type ButtonWidth = 'auto' | 'full';

/**
 * Base button props shared across all button types
 */
interface BaseButtonProps {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Width behavior */
  width?: ButtonWidth;
  /** Loading state - shows spinner and disables button */
  isLoading?: boolean;
  /** Text to show during loading (defaults to children) */
  loadingText?: string;
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Disables the button */
  disabled?: boolean;
}

/**
 * Props for button element rendering
 */
interface ButtonElementProps extends BaseButtonProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
  as?: 'button';
}

/**
 * Props for anchor element rendering
 */
interface AnchorElementProps extends BaseButtonProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
  as: 'a';
  href: string;
}

/**
 * Combined button props with polymorphic support
 */
export type ButtonProps = ButtonElementProps | AnchorElementProps;

// ============================================================================
// Style Constants
// ============================================================================

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-indigo-600 text-white',
    'hover:bg-indigo-500',
    'focus:ring-indigo-500/50',
    'shadow-lg shadow-indigo-500/25',
    'disabled:bg-indigo-600/50'
  ),
  secondary: cn(
    'bg-slate-800 text-slate-100',
    'border border-slate-700',
    'hover:bg-slate-700 hover:border-slate-600',
    'focus:ring-slate-500/50',
    'disabled:bg-slate-800/50'
  ),
  outline: cn(
    'bg-transparent text-slate-300',
    'border border-slate-600',
    'hover:bg-slate-800 hover:text-slate-100',
    'focus:ring-slate-500/50',
    'disabled:text-slate-600 disabled:border-slate-700'
  ),
  danger: cn(
    'bg-red-600 text-white',
    'hover:bg-red-500',
    'focus:ring-red-500/50',
    'shadow-lg shadow-red-500/25',
    'disabled:bg-red-600/50'
  ),
  ghost: cn(
    'bg-transparent text-slate-400',
    'hover:text-slate-100 hover:bg-slate-800',
    'focus:ring-slate-500/50',
    'disabled:text-slate-600'
  ),
  link: cn(
    'bg-transparent text-indigo-400',
    'hover:text-indigo-300 underline-offset-4 hover:underline',
    'focus:ring-indigo-500/50',
    'disabled:text-indigo-400/50',
    'shadow-none'
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
  xl: 'px-6 py-4 text-lg',
};

const iconSizeStyles: Record<ButtonSize, string> = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

// ============================================================================
// Loading Spinner Component
// ============================================================================

interface LoadingSpinnerProps {
  size: ButtonSize;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size, className }) => (
  <svg
    className={cn('animate-spin', iconSizeStyles[size], className)}
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >n    <circle
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
);

// ============================================================================
// Button Component
// ============================================================================

/**
 * Button component with comprehensive accessibility support
 * 
 * Features:
 * - Multiple visual variants (primary, secondary, danger, ghost, link)
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Loading state with spinner
 * - Icon support (left and right)
 * - Polymorphic rendering (button or anchor)
 * - Full keyboard navigation support
 * - Screen reader announcements for loading state
 * 
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/button/} ARIA Button Pattern
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = 'primary',
      size = 'md',
      width = 'auto',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...rest
    } = props;

    const isDisabled = isLoading || disabled;
    const showLoadingSpinner = isLoading;

    // Memoized classes for performance
    const buttonClasses = useMemo(() => cn(
      // Base styles
      'inline-flex items-center justify-center',
      'font-medium transition-all duration-200',
      'rounded-lg',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
      'active:scale-[0.98]',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
      
      // Variant styles
      variantStyles[variant],
      
      // Size styles
      sizeStyles[size],
      
      // Width styles
      width === 'full' && 'w-full',
      
      // Custom classes
      className
    ), [variant, size, width, className]);

    // Icon wrapper with consistent sizing
    const renderIcon = (icon: React.ReactNode, position: 'left' | 'right'): React.ReactNode => {
      if (!icon) return null;
      return (
        <span
          className={cn(
            'flex items-center justify-center',
            position === 'left' && children && 'mr-2',
            position === 'right' && children && 'ml-2'
          )}
        >
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement, {
                className: cn(iconSizeStyles[size], (icon as React.ReactElement).props.className),
              })
            : icon}
        </span>
      );
    };

    // Common content for both button and anchor
    const content = (
      <>
        {showLoadingSpinner && (
          <>
            <LoadingSpinner size={size} className={cn(children && 'mr-2')} />
            {loadingText && <span>{loadingText}</span>}
            <VisuallyHidden>Loading, please wait</VisuallyHidden>
          </>
        )}
        {!showLoadingSpinner && (
          <>
            {renderIcon(leftIcon, 'left')}
            {children}
            {renderIcon(rightIcon, 'right')}
          </>
        )}
      </>
    );

    // Render as anchor if 'as' prop is 'a'
    if (rest.as === 'a') {
      const { as, ...anchorProps } = rest as AnchorElementProps;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={buttonClasses}
          aria-busy={isLoading}
          {...anchorProps}
        >
          {content}
        </a>
      );
    }

    // Default: render as button
    const { as, ...buttonProps } = rest as ButtonElementProps;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={buttonProps.type || 'button'}
        className={buttonClasses}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...buttonProps}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// Button Group Component
// ============================================================================

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Buttons to group */
  children: React.ReactNode;
  /** Spacing between buttons */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Attach buttons together */
  attached?: boolean;
}

/**
 * ButtonGroup component for grouping related buttons
 * 
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="secondary">Cancel</Button>
 *   <Button>Save</Button>
 * </ButtonGroup>
 * 
 * <ButtonGroup attached>
 *   <Button>First</Button>
 *   <Button>Second</Button>
 *   <Button>Third</Button>
 * </ButtonGroup>
 * ```
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, spacing = 'md', attached = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex',
        !attached && {
          'gap-1': spacing === 'sm',
          'gap-2': spacing === 'md',
          'gap-4': spacing === 'lg',
        },
        attached && '[&>button]:rounded-none first:[&>button]:rounded-l-lg last:[&>button]:rounded-r-lg [&>button]:border-l-0 first:[&>button]:border-l',
        className
      )}
      role="group"
      {...props}
    >
      {children}
    </div>
  )
);

ButtonGroup.displayName = 'ButtonGroup';

// ============================================================================
// Icon Button Component
// ============================================================================

export interface IconButtonProps extends Omit<ButtonElementProps, 'leftIcon' | 'rightIcon' | 'loadingText'> {
  /** Accessible label (required for icon-only buttons) */
  'aria-label': string;
  /** Icon element to display */
  icon: React.ReactNode;
}

/**
 * IconButton component for icon-only buttons
 * 
 * @example
 * ```tsx
 * <IconButton 
 *   icon={<PlusIcon />} 
 *   aria-label="Add new item"
 *   onClick={handleAdd}
 * />
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className, ...props }, ref) => {
    const iconButtonSizes: Record<ButtonSize, string> = {
      xs: 'p-1.5',
      sm: 'p-2',
      md: 'p-2.5',
      lg: 'p-3',
      xl: 'p-4',
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cn(iconButtonSizes[size], className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default Button;
