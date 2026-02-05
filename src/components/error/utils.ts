/**
 * Error Utilities
 * 
 * Helper functions for error categorization, logging, and processing
 */

import * as Sentry from '@sentry/nextjs';
import { ErrorDetails, ErrorCategory, ErrorSeverity } from './types';
import { logger } from '@/lib/logging';
import { getRequestContext } from '@/lib/logging/context';

/**
 * Categorize an error based on its message and stack trace
 */
export function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';
  
  // Network errors
  if (message.includes('network') || 
      message.includes('fetch') || 
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('etimedout')) {
    return 'network';
  }
  
  // API errors
  if (message.includes('api') || 
      message.includes('http') ||
      message.includes('status') ||
      message.includes('response') ||
      stack.includes('route.ts')) {
    return 'api';
  }
  
  // Validation errors
  if (message.includes('validation') || 
      message.includes('invalid') ||
      message.includes('required') ||
      error.name === 'ZodError' ||
      error.name === 'ValidationError') {
    return 'validation';
  }
  
  // Render errors
  if (stack.includes('.tsx') || stack.includes('.jsx') || 
      message.includes('render') ||
      error.name === 'ReferenceError' && stack.includes('react')) {
    return 'render';
  }
  
  return 'unknown';
}

/**
 * Determine error severity based on category and context
 */
export function getErrorSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
  // Critical errors that affect core functionality
  if (category === 'network' && error.message.includes('database')) {
    return 'critical';
  }
  
  if (category === 'api' && error.message.includes('500')) {
    return 'critical';
  }
  
  // High severity for render errors in production
  if (category === 'render' && process.env.NODE_ENV === 'production') {
    return 'high';
  }
  
  // Medium for validation errors
  if (category === 'validation') {
    return 'medium';
  }
  
  // Low for network timeouts that may be transient
  if (category === 'network' && error.message.includes('timeout')) {
    return 'low';
  }
  
  return 'high';
}

/**
 * Build error details from Error and React ErrorInfo
 */
export function buildErrorDetails(
  error: Error,
  errorInfo: React.ErrorInfo | null,
  componentName?: string
): ErrorDetails {
  const category = categorizeError(error);
  const severity = getErrorSeverity(error, category);
  const requestContext = getRequestContext();
  
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause: error.cause,
    category,
    severity,
    context: {
      componentStack: errorInfo?.componentStack,
      requestId: requestContext?.requestId,
      userId: requestContext?.userId,
      shopId: requestContext?.shopId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    },
    timestamp: Date.now(),
    componentName,
  };
}

/**
 * Log error to console and external services
 */
export function logError(errorDetails: ErrorDetails): void {
  const { severity, category, componentName, message, context } = errorDetails;
  
  // Log to structured logger
  logger.error(`[${category.toUpperCase()}] ${message}`, undefined, {
    severity,
    category,
    componentName,
    ...context,
  });
  
  // Send to Sentry for high/critical severity
  if (severity === 'high' || severity === 'critical') {
    Sentry.captureException(new Error(message), {
      level: severity === 'critical' ? 'fatal' : 'error',
      tags: {
        category,
        component: componentName || 'unknown',
        severity,
      },
      extra: {
        ...context,
        timestamp: errorDetails.timestamp,
      },
    });
  }
}

/**
 * Add a breadcrumb for user actions before errors
 */
export function addErrorBreadcrumb(
  message: string,
  category?: string,
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category: category || 'action',
    data,
    level: 'info',
  });
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  const category = categorizeError(error);
  
  // Network errors are usually retryable
  if (category === 'network') {
    return true;
  }
  
  // Timeout errors are retryable
  if (message.includes('timeout') || message.includes('etimedout')) {
    return true;
  }
  
  // Rate limit errors are retryable with backoff
  if (message.includes('rate limit') || message.includes('429')) {
    return true;
  }
  
  // Validation errors are not retryable
  if (category === 'validation') {
    return false;
  }
  
  return false;
}

/**
 * Format error for display to users (safe message without sensitive info)
 */
export function getUserFriendlyMessage(error: Error): string {
  const category = categorizeError(error);
  
  switch (category) {
    case 'network':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    
    case 'api':
      return 'Something went wrong while processing your request. Please try again later.';
    
    case 'validation':
      return error.message || 'Please check your input and try again.';
    
    case 'render':
      return 'Something went wrong displaying this page. Please refresh to try again.';
    
    default:
      return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }
}
