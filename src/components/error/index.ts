/**
 * Error Components Index
 * 
 * Centralized export for all error handling components and utilities
 */

// Components
export { ErrorBoundary } from './ErrorBoundary';
export { AsyncErrorBoundary, useAsyncErrorBoundary } from './AsyncErrorBoundary';
export { DefaultLoadingState, DefaultErrorState, SuccessNotification } from './AsyncErrorBoundary';
export { CompactFallbackUI, MinimalFallbackUI } from './ErrorBoundary';

// Utilities
export {
  categorizeError,
  getErrorSeverity,
  buildErrorDetails,
  logError,
  addErrorBreadcrumb,
  isRetryableError,
  getUserFriendlyMessage,
} from './utils';

export {
  initializeGlobalErrorHandlers,
  globalErrorHandler,
  withErrorHandling,
} from './GlobalErrorHandler';

// Types
export type {
  ErrorDetails,
  ErrorCategory,
  ErrorSeverity,
  ErrorBoundaryProps,
  ErrorBoundaryState,
  FallbackUIProps,
  GlobalErrorHandler,
} from './types';
