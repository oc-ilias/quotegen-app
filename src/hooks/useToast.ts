/**
 * @fileoverview useToast Hook - Toast notification state management
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastOptions {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface UseToastReturn {
  toasts: Toast[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

/**
 * Hook for managing toast notifications
 * 
 * @example
 * ```tsx
 * const { toasts, addToast, removeToast } = useToast();
 * 
 * // Add a toast
 * addToast({
 *   type: 'success',
 *   title: 'Quote sent!',
 *   message: 'The quote has been emailed to the customer.',
 * });
 * 
 * // Remove a toast
 * removeToast(toastId);
 * ```
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = `toast-${++toastIdRef.current}`;
    const duration = options.duration ?? 5000;

    const newToast: Toast = {
      id,
      type: options.type ?? 'info',
      title: options.title,
      message: options.message,
      duration,
      action: options.action,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss if duration is set
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };
}

export default useToast;
