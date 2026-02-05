/**
 * Error Boundary Types
 * 
 * Type definitions for error boundary components and error handling
 */

import { ReactNode } from 'react';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'render' | 'network' | 'api' | 'validation' | 'unknown' | 'runtime';

export interface ErrorDetails {
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  context?: Record<string, unknown>;
  timestamp: number;
  componentName?: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: ErrorDetails, reset: () => void) => ReactNode);
  onError?: (error: ErrorDetails) => void;
  onReset?: () => void;
  componentName?: string;
  severity?: ErrorSeverity;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorDetails: ErrorDetails | null;
}

export interface FallbackUIProps {
  error: ErrorDetails;
  reset: () => void;
  showDetails?: boolean;
}

export interface GlobalErrorHandler {
  handleError: (error: Error, context?: Record<string, unknown>) => void;
  handleRejection: (event: PromiseRejectionEvent) => void;
  addBreadcrumb: (message: string, category?: string, data?: Record<string, unknown>) => void;
}
