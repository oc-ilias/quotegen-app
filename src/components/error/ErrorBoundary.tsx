/**
 * Error Boundary Component
 * 
 * A comprehensive React Error Boundary that:
 * - Catches rendering errors in child components
 * - Provides different fallback UIs based on error type
 * - Logs errors to Sentry and structured logger
 * - Supports error recovery with retry functionality
 * - Tracks user actions before errors
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  HomeIcon,
  BugAntIcon,
  SignalSlashIcon,
  ShieldExclamationIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundaryProps, ErrorBoundaryState, ErrorDetails, FallbackUIProps } from './types';
import { 
  buildErrorDetails, 
  logError, 
  isRetryableError,
  getUserFriendlyMessage,
  categorizeError 
} from './utils';

// Default fallback UI component
function DefaultFallbackUI({ error, reset, showDetails = false }: FallbackUIProps) {
  const isNetworkError = error.category === 'network';
  const isValidationError = error.category === 'validation';
  const isRetryable = isRetryableError(new Error(error.message));
  const userMessage = getUserFriendlyMessage(new Error(error.message));
  
  const getIcon = () => {
    switch (error.category) {
      case 'network':
        return <SignalSlashIcon className="h-12 w-12 text-orange-500" />;
      case 'validation':
        return <ShieldExclamationIcon className="h-12 w-12 text-yellow-500" />;
      case 'api':
        return <BugAntIcon className="h-12 w-12 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />;
    }
  };
  
  const getSeverityColor = () => {
    switch (error.severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`min-h-[400px] flex items-center justify-center p-6 ${getSeverityColor()}`}
    >
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 p-4 bg-gray-50 rounded-full">
            {getIcon()}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isNetworkError ? 'Connection Error' : 'Something Went Wrong'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {userMessage}
          </p>
          
          {isValidationError && error.message && (
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">{error.message}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 justify-center">
            {isRetryable && (
              <button
                onClick={reset}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Try Again
              </button>
            )}
            
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go Home
            </a>
          </div>
          
          {showDetails && process.env.NODE_ENV === 'development' && (
            <div className="mt-6 w-full">
              <details className="bg-gray-900 rounded-lg overflow-hidden">
                <summary className="px-4 py-3 text-gray-300 cursor-pointer hover:bg-gray-800 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-2" />
                  Error Details (Development Only)
                </summary>
                <div className="p-4 overflow-auto">
                  <pre className="text-xs text-red-400 whitespace-pre-wrap">
                    {error.stack || error.message}
                  </pre>
                  {error.context?.componentStack && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-gray-400 mb-2">Component Stack:</p>
                      <pre className="text-xs text-yellow-400 whitespace-pre-wrap">
                        {error.context.componentStack as string}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Compact fallback for inline/error in smaller components
export function CompactFallbackUI({ error, reset }: FallbackUIProps) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-red-800">
            {getUserFriendlyMessage(new Error(error.message))}
          </p>
          <button
            onClick={reset}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try again →
          </button>
        </div>
      </div>
    </div>
  );
}

// Minimal fallback for production (no details)
export function MinimalFallbackUI({ reset }: { reset: () => void }) {
  return (
    <div className="p-6 text-center">
      <p className="text-gray-600 mb-4">Something went wrong. Please try again.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Retry
      </button>
    </div>
  );
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorDetails: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = buildErrorDetails(
      error,
      errorInfo,
      this.props.componentName
    );

    this.setState({
      errorInfo,
      errorDetails,
    });

    // Log the error
    logError(errorDetails);

    // Call custom error handler if provided
    this.props.onError?.(errorDetails);
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorDetails: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.errorDetails) {
      const { fallback } = this.props;
      const { errorDetails } = this.state;

      // Custom fallback
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(errorDetails, this.reset);
        }
        return fallback;
      }

      // Default fallback
      return (
        <AnimatePresence mode="wait">
          <DefaultFallbackUI
            key="fallback"
            error={errorDetails}
            reset={this.reset}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        </AnimatePresence>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export { ErrorBoundary };
