/**
 * Async Error Boundary
 * 
 * A component for handling errors in async operations and data fetching.
 * Provides loading, error, and success states.
 */

'use client';

import React, { useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { ErrorDetails } from './types';
import { getUserFriendlyMessage } from './utils';

interface AsyncErrorBoundaryProps<T> {
  children: (data: T | null, isLoading: boolean, error: Error | null, execute: () => Promise<void>) => ReactNode;
  fetchFn: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T | null;
  loadingComponent?: ReactNode;
  errorComponent?: (error: Error, retry: () => void) => ReactNode;
  autoFetch?: boolean;
}

interface AsyncErrorBoundaryState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAsyncErrorBoundary<T>(
  fetchFn: () => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    initialData?: T | null;
    autoFetch?: boolean;
  }
) {
  const [state, setState] = useState<AsyncErrorBoundaryState<T>>({
    data: options?.initialData || null,
    isLoading: options?.autoFetch !== false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await fetchFn();
      setState({ data, isLoading: false, error: null });
      options?.onSuccess?.(data);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, isLoading: false, error: err });
      options?.onError?.(err);
      throw err;
    }
  }, [fetchFn, options]);

  const reset = useCallback(() => {
    setState({
      data: options?.initialData || null,
      isLoading: false,
      error: null,
    });
  }, [options?.initialData]);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
    return execute();
  }, [execute]);

  return {
    ...state,
    execute,
    reset,
    retry,
  };
}

// Default loading component
export function DefaultLoadingState() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
        <span className="text-gray-600">Loading...</span>
      </div>
    </div>
  );
}

// Default error component
export function DefaultErrorState({ 
  error, 
  retry 
}: { 
  error: Error; 
  retry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6"
    >
      <div className="flex flex-col items-center text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load
        </h3>
        <p className="text-gray-600 mb-4 max-w-md">
          {getUserFriendlyMessage(error)}
        </p>
        <button
          onClick={retry}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Try Again
        </button>
      </div>
    </motion.div>
  );
}

// Default success notification
export function SuccessNotification({ 
  message, 
  onDismiss 
}: { 
  message: string; 
  onDismiss?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 bg-green-50 border border-green-200 rounded-lg"
    >
      <div className="flex items-center">
        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
        <span className="text-green-800">{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
}

// AsyncErrorBoundary component
export function AsyncErrorBoundary<T>({
  children,
  fetchFn,
  onSuccess,
  onError,
  initialData = null,
  loadingComponent = <DefaultLoadingState />,
  errorComponent = (error, retry) => <DefaultErrorState error={error} retry={retry} />,
  autoFetch = true,
}: AsyncErrorBoundaryProps<T>) {
  const { data, isLoading, error, execute, retry } = useAsyncErrorBoundary(fetchFn, {
    onSuccess,
    onError,
    initialData,
    autoFetch,
  });

  if (isLoading) {
    return loadingComponent;
  }

  if (error) {
    return errorComponent(error, retry);
  }

  return children(data, isLoading, error, execute);
}
