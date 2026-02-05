/**
 * Global Error Handler
 * 
 * Sets up global error handlers for:
 * - Unhandled promise rejections
 * - Window errors
 * - API request errors
 * - User action tracking
 */

import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logging';
import { categorizeError, getErrorSeverity, addErrorBreadcrumb } from './utils';
import { GlobalErrorHandler } from './types';

// Track if global handlers are already initialized
let isInitialized = false;

/**
 * Initialize global error handlers
 * Should be called once at app startup
 */
export function initializeGlobalErrorHandlers(): GlobalErrorHandler {
  if (isInitialized) {
    return globalErrorHandler;
  }

  isInitialized = true;

  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      globalErrorHandler.handleRejection(event);
    });

    // Handle window errors
    window.addEventListener('error', (event) => {
      globalErrorHandler.handleError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Track user actions before errors
    trackUserActions();
  }

  return globalErrorHandler;
}

/**
 * Global error handler implementation
 */
const globalErrorHandler: GlobalErrorHandler = {
  handleError: (error: Error, context?: Record<string, unknown>) => {
    if (!error) return;

    const category = categorizeError(error);
    const severity = getErrorSeverity(error, category);
    
    const errorContext = {
      category,
      severity,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...context,
    };

    // Log to structured logger
    logger.error(`[GLOBAL] ${error.message}`, error, errorContext);

    // Send to Sentry for high/critical severity
    if (severity === 'high' || severity === 'critical') {
      Sentry.captureException(error, {
        level: severity === 'critical' ? 'fatal' : 'error',
        tags: {
          category,
          source: 'global_handler',
          severity,
        },
        extra: errorContext,
      });
    }
  },

  handleRejection: (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    
    // Create error from rejection reason
    let error: Error;
    if (reason instanceof Error) {
      error = reason;
    } else if (typeof reason === 'string') {
      error = new Error(reason);
    } else {
      error = new Error('Unhandled promise rejection');
      (error as any).originalReason = reason;
    }

    const category = categorizeError(error);
    const severity = getErrorSeverity(error, category);

    const context = {
      category,
      severity,
      reason: reason?.toString?.() || String(reason),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Log to structured logger
    logger.error('[UNHANDLED_REJECTION] Promise rejection not caught', error, context);

    // Send to Sentry
    Sentry.captureException(error, {
      level: severity === 'critical' ? 'fatal' : 'error',
      tags: {
        category,
        source: 'unhandled_rejection',
        severity,
      },
      extra: context,
    });

    // Prevent default browser console error
    event.preventDefault();
  },

  addBreadcrumb: (message: string, category?: string, data?: Record<string, unknown>) => {
    addErrorBreadcrumb(message, category, data);
  },
};

/**
 * Track user actions to help debug errors
 */
function trackUserActions() {
  if (typeof window === 'undefined') return;

  // Track clicks
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const element = target.closest('[data-track]') || target;
    
    if (element) {
      const tagName = element.tagName.toLowerCase();
      const id = element.id;
      const className = element.className;
      const text = element.textContent?.slice(0, 50);
      
      addErrorBreadcrumb(
        `User clicked: ${tagName}${id ? `#${id}` : ''}`,
        'ui.click',
        {
          tagName,
          id,
          className,
          text,
        }
      );
    }
  }, true);

  // Track form submissions
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;
    const formId = form.id || form.name || 'unnamed-form';
    
    addErrorBreadcrumb(
      `Form submitted: ${formId}`,
      'ui.form',
      {
        formId,
        action: form.action,
        method: form.method,
      }
    );
  }, true);

  // Track navigation
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      addErrorBreadcrumb(
        `Navigation: ${currentUrl}`,
        'navigation',
        {
          from: lastUrl,
          to: currentUrl,
        }
      );
      lastUrl = currentUrl;
    }
  });
  
  observer.observe(document, { subtree: true, childList: true });

  // Track network requests
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const [url, options] = args;
    const startTime = performance.now();
    
    try {
      const response = await originalFetch.apply(this, args);
      const duration = performance.now() - startTime;
      
      // Log slow requests
      if (duration > 5000) {
        addErrorBreadcrumb(
          `Slow API request: ${url}`,
          'api.slow',
          {
            url: url.toString(),
            method: options?.method || 'GET',
            duration,
            status: response.status,
          }
        );
      }
      
      // Log API errors
      if (!response.ok) {
        addErrorBreadcrumb(
          `API error: ${url}`,
          'api.error',
          {
            url: url.toString(),
            method: options?.method || 'GET',
            status: response.status,
            statusText: response.statusText,
          }
        );
      }
      
      return response;
    } catch (error) {
      addErrorBreadcrumb(
        `API request failed: ${url}`,
        'api.failure',
        {
          url: url.toString(),
          method: options?.method || 'GET',
          error: (error as Error).message,
        }
      );
      throw error;
    }
  };
}

/**
 * Wrapper for async functions with automatic error handling
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      globalErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        {
          ...context,
          args,
          functionName: fn.name,
        }
      );
      throw error;
    }
  }) as T;
}

export { globalErrorHandler };
