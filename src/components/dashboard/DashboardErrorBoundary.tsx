/**
 * Dashboard Error Boundary
 * Catches and displays errors in dashboard components gracefully
 * @module components/dashboard/DashboardErrorBoundary
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the DashboardErrorBoundary component
 */
export interface DashboardErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional custom fallback component */
  fallback?: ReactNode;
  /** Optional callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional callback when user clicks retry */
  onRetry?: () => void;
  /** Optional callback when user clicks reset */
  onReset?: () => void;
  /** Component name for error logging */
  componentName?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * State for the DashboardErrorBoundary component
 */
export interface DashboardErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error */
  error: Error | null;
  /** Additional error information */
  errorInfo: ErrorInfo | null;
  /** Number of retry attempts */
  retryCount: number;
}

// ============================================================================
// Error Boundary Component
// ============================================================================

/**
 * Error boundary specifically designed for dashboard components.
 * Provides a graceful fallback UI when errors occur in child components.
 * 
 * @example
 * ```tsx
 * <DashboardErrorBoundary componentName="StatCards">
 *   <StatCards stats={stats} />
 * </DashboardErrorBoundary>
 * ```
 */
export class DashboardErrorBoundary extends Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  /**
   * Maximum number of retry attempts before showing full error
   */
  static readonly MAX_RETRY_COUNT = 3;

  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<DashboardErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Log error details when caught
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { componentName, onError } = this.props;

    // Log to console with component context
    console.error(
      `[DashboardErrorBoundary${componentName ? ` - ${componentName}` : ''}]`,
      error,
      errorInfo
    );

    // Update state with error info
    this.setState({ errorInfo });

    // Call optional error callback
    onError?.(error, errorInfo);

    // Could send to error tracking service here
    // Sentry.captureException(error, { extra: { componentName, errorInfo } });
  }

  /**
   * Handle retry button click
   */
  private handleRetry = (): void => {
    const { onRetry } = this.props;
    const { retryCount } = this.state;

    if (retryCount < DashboardErrorBoundary.MAX_RETRY_COUNT) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
      });
      onRetry?.();
    }
  };

  /**
   * Handle reset button click - fully reset the error boundary
   */
  private handleReset = (): void => {
    const { onReset } = this.props;

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
    onReset?.();
  };

  /**
   * Navigate back to dashboard home
   */
  private handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  render(): ReactNode {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback, className, componentName } = this.props;

    if (!hasError) {
      return children;
    }

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    const canRetry = retryCount < DashboardErrorBoundary.MAX_RETRY_COUNT;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex flex-col items-center justify-center',
          'p-8 rounded-2xl border border-red-500/20 bg-red-500/5',
          'text-center',
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4"
        >
          <ExclamationTriangleIcon className="w-8 h-8 text-red-400" aria-hidden="true" />
        </motion.div>

        {/* Error Title */}
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          Something went wrong
        </h3>

        {/* Component Context */}
        {componentName && (
          <p className="text-sm text-slate-500 mb-2">
            in {componentName}
          </p>
        )}

        {/* Error Message */}
        <p className="text-sm text-slate-400 mb-6 max-w-sm">
          {canRetry
            ? 'We encountered an error loading this section. Please try again.'
            : 'We\'re having trouble loading this section. Please refresh the page or contact support.'}
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="w-full max-w-md mb-6 p-4 rounded-lg bg-slate-900 text-left overflow-auto">
            <p className="text-xs font-mono text-red-400 mb-2">
              {error.name}: {error.message}
            </p>
            {error.stack && (
              <pre className="text-xs font-mono text-slate-500 whitespace-pre-wrap">
                {error.stack.split('\n').slice(1, 5).join('\n')}
              </pre>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {canRetry && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={this.handleRetry}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-red-500 hover:bg-red-400 text-white',
                'transition-colors duration-200',
                'text-sm font-medium'
              )}
            >
              <ArrowPathIcon className="w-4 h-4" />
              Try Again
              {retryCount > 0 && ` (${retryCount}/${DashboardErrorBoundary.MAX_RETRY_COUNT})`}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={this.handleGoHome}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-slate-800 hover:bg-slate-700 text-slate-200',
              'transition-colors duration-200',
              'text-sm font-medium'
            )}
          >
            <HomeIcon className="w-4 h-4" />
            Go to Dashboard
          </motion.button>
        </div>
      </motion.div>
    );
  }
}

export default DashboardErrorBoundary;
