/**
 * Legacy Error Boundary Compatibility Wrapper
 * 
 * This file maintains backward compatibility with existing code
 * while delegating to the new comprehensive error boundary system.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { ErrorBoundary as NewErrorBoundary, CompactFallbackUI } from './error';
import * as Sentry from '@sentry/nextjs';

// Legacy props interface for backward compatibility
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Legacy ErrorBoundary - now uses new comprehensive error boundary internally
 * @deprecated Use ErrorBoundary from '@/components/error' instead
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
      tags: { source: 'legacy_error_boundary' },
    });
    
    // Also log to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    // Use the new comprehensive error boundary
    return (
      <NewErrorBoundary
        componentName="LegacyErrorBoundary"
        fallback={this.props.fallback || ((error, reset) => (
          <CompactFallbackUI 
            error={error} 
            reset={reset}
          />
        ))}
      >
        {this.props.children}
      </NewErrorBoundary>
    );
  }
}

// Hook for async error handling - enhanced with Sentry
export function useAsyncError() {
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (error) {
      // Log to Sentry
      Sentry.captureException(error, {
        tags: { source: 'useAsyncError' },
      });
      console.error('Async error:', error);
    }
  }, [error]);
  
  return { error, setError, clearError: () => setError(null) };
}

// Loading spinner component
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600`} />
  );
}

// Toast notification system with error tracking
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Track error toasts in Sentry
    if (type === 'error') {
      Sentry.addBreadcrumb({
        category: 'toast',
        message,
        level: 'error',
      });
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };
  
  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-in ${
            toast.type === 'success' ? 'bg-green-600' :
            toast.type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
  
  return { addToast, ToastContainer };
}
