/**
 * Error State Components
 * 
 * Comprehensive error UI components for various error scenarios.
 * All components are fully accessible and provide clear next steps.
 * 
 * @module components/ui/error
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './Button';

// ============================================================================
// Types
// ============================================================================

export interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error description */
  description?: string;
  /** Error code (e.g., 404, 500) */
  code?: string | number;
  /** Primary action button text */
  actionLabel?: string;
  /** Primary action handler */
  onAction?: () => void;
  /** Secondary action button text */
  secondaryActionLabel?: string;
  /** Secondary action handler */
  onSecondaryAction?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Error illustration variant */
  variant?: 'default' | '404' | '500' | 'offline' | 'empty' | 'access-denied';
}

export interface ErrorBoundaryProps {
  /** Children to render */
  children: React.ReactNode;
  /** Fallback UI when error occurs */
  fallback?: React.ReactNode;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Reset error state */
  resetKeys?: Array<string | number>;
}

export interface InlineErrorProps {
  /** Error message */
  message: string;
  /** Retry handler */
  onRetry?: () => void;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export interface FormErrorProps {
  /** Error messages */
  errors: string[] | Record<string, string[]>;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Illustration Components
// ============================================================================

function ErrorIllustration({ variant }: { variant: ErrorStateProps['variant'] }) {
  const illustrations = {
    '404': (
      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" className="fill-gray-100 dark:fill-gray-800" />
        <path d="M65 85C65 85 75 75 85 85C95 95 85 105 85 105" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="4" strokeLinecap="round" />
        <path d="M135 85C135 85 125 75 115 85C105 95 115 105 115 105" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="4" strokeLinecap="round" />
        <circle cx="85" cy="80" r="4" className="fill-gray-600 dark:fill-gray-400" />
        <circle cx="115" cy="80" r="4" className="fill-gray-600 dark:fill-gray-400" />
        <path d="M90 120C90 120 100 110 110 120" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="4" strokeLinecap="round" />
        <rect x="60" y="140" width="80" height="8" rx="4" className="fill-gray-300 dark:fill-gray-600" />
      </svg>
    ),
    '500': (
      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" className="fill-gray-100 dark:fill-gray-800" />
        <path d="M60 80L80 100L60 120" className="stroke-red-500" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M140 80L120 100L140 120" className="stroke-red-500" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="100" cy="140" r="6" className="fill-red-500" />
        <rect x="50" y="150" width="100" height="6" rx="3" className="fill-gray-300 dark:fill-gray-600" />
      </svg>
    ),
    'offline': (
      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" className="fill-gray-100 dark:fill-gray-800" />
        <path d="M60 100C60 100 70 80 100 80C130 80 140 100 140 100" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="4" strokeLinecap="round" />
        <path d="M75 115C75 115 80 105 100 105C120 105 125 115 125 115" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="130" r="5" className="fill-gray-400 dark:fill-gray-500" />
        <path d="M140 60L60 140" className="stroke-red-500" strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
    'empty': (
      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" className="fill-gray-100 dark:fill-gray-800" />
        <rect x="60" y="70" width="80" height="60" rx="4" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="3" />
        <path d="M70 90H130" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="2" strokeLinecap="round" />
        <path d="M70 105H110" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="2" strokeLinecap="round" />
        <path d="M70 120H100" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="2" strokeLinecap="round" />
        <circle cx="140" cy="60" r="15" className="fill-gray-200 dark:fill-gray-700" />
        <path d="M135 60H145M140 55V65" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    'access-denied': (
      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" className="fill-gray-100 dark:fill-gray-800" />
        <rect x="75" y="60" width="50" height="70" rx="4" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="4" />
        <circle cx="100" cy="95" r="8" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="3" />
        <path d="M100 103V110" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="75" r="4" className="fill-gray-400 dark:fill-gray-500" />
        <path d="M130 70L70 130" className="stroke-red-500" strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
    default: (
      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" className="fill-gray-100 dark:fill-gray-800" />
        <text x="100" y="115" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500" style={{ fontSize: '48px', fontWeight: 'bold' }}>⚠</text>
      </svg>
    ),
  };

  return illustrations[variant || 'default'] || illustrations.default;
}

// ============================================================================
// Components
// ============================================================================

/**
 * Full error state component with illustration and actions
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an unexpected error. Please try again later.',
  code,
  actionLabel = 'Try Again',
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  size = 'md',
  variant = 'default',
}: ErrorStateProps) {
  const sizeClasses = {
    sm: { container: 'p-6', icon: 'w-24 h-24', title: 'text-lg', desc: 'text-sm' },
    md: { container: 'p-8', icon: 'w-32 h-32', title: 'text-xl', desc: 'text-base' },
    lg: { container: 'p-12', icon: 'w-40 h-40', title: 'text-2xl', desc: 'text-lg' },
  };

  const classes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center text-center',
        classes.container,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className={cn('mb-6', classes.icon)}>
        <ErrorIllustration variant={variant} />
      </div>

      {code && (
        <span className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-2">
          Error {code}
        </span>
      )}

      <h2 className={cn('font-semibold text-gray-900 dark:text-white mb-2', classes.title)}>
        {title}
      </h2>

      <p className={cn('text-gray-600 dark:text-gray-400 mb-6 max-w-md', classes.desc)}>
        {description}
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        {onAction && (
          <Button onClick={onAction} variant="primary">
            {actionLabel}
          </Button>
        )}
        {onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="ghost">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Compact inline error message
 */
export function InlineError({
  message,
  onRetry,
  onDismiss,
  className,
}: InlineErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
        className
      )}
      role="alert"
    >
      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      
      <span className="flex-1 text-sm text-red-800 dark:text-red-200">{message}</span>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        >
          Retry
        </button>
      )}
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Dismiss error"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}

/**
 * Form validation errors display
 */
export function FormError({ errors, className }: FormErrorProps) {
  const errorArray = Array.isArray(errors) 
    ? errors 
    : Object.values(errors).flat();

  if (errorArray.length === 0) return null;

  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            Please fix the following errors:
          </h3>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {errorArray.map((error, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-500" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Error boundary class component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && this.props.resetKeys) {
      const hasKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (hasKeyChanged) {
        this.setState({ hasError: false, error: null });
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorState
          title="Something went wrong"
          description={this.state.error?.message || 'An unexpected error occurred'}
          variant="500"
          onAction={() => window.location.reload()}
          actionLabel="Reload Page"
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Section-level error boundary with reset capability
 */
export function SectionErrorBoundary({
  children,
  onReset,
  sectionName = 'this section',
}: {
  children: React.ReactNode;
  onReset?: () => void;
  sectionName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorState
          size="sm"
          title={`${sectionName} failed to load`}
          description="There was a problem loading this section."
          variant="default"
          onAction={onReset || (() => window.location.reload())}
          actionLabel="Try Again"
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Toast-style error notification
 */
export function ErrorToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-red-200 dark:border-red-800">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="flex-1 text-sm text-gray-900 dark:text-white">{message}</p>
        
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default {
  State: ErrorState,
  Inline: InlineError,
  Form: FormError,
  Boundary: ErrorBoundary,
  SectionBoundary: SectionErrorBoundary,
  Toast: ErrorToast,
};
