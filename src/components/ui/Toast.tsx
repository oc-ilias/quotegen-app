//**
 * Toast Notification System (Accessibility Enhanced)
 * Global toast notifications with screen reader announcements
 * @module components/ui/Toast
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLiveAnnouncer } from '@/components/accessibility/LiveAnnouncer';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { Toast as ToastType } from '@/types/quote';

// ============================================================================
// Toast Context Types
// ============================================================================

interface ToastContextType {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// ============================================================================
// Toast Context
// ============================================================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================================================
// Toast Reducer
// ============================================================================

type ToastAction =
  | { type: 'ADD_TOAST'; payload: ToastType }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'CLEAR_TOASTS' };

const toastReducer = (state: ToastType[], action: ToastAction): ToastType[] => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.payload];
    case 'REMOVE_TOAST':
      return state.filter((toast) => toast.id !== action.payload);
    case 'CLEAR_TOASTS':
      return [];
    default:
      return state;
  }
};

// ============================================================================
// Toast Provider
// ============================================================================

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const { announce } = useLiveAnnouncer();

  const addToast = useCallback(
    (toast: Omit<ToastType, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { ...toast, id };
      dispatch({ type: 'ADD_TOAST', payload: newToast });

      // Announce to screen readers
      const message = toast.message
        ? `${toast.title}: ${toast.message}`
        : toast.title;
      const priority = toast.type === 'error' ? 'assertive' : 'polite';
      announce(message, priority);
    },
    [announce]
  );

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const clearToasts = useCallback(() => {
    dispatch({ type: 'CLEAR_TOASTS' });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// ============================================================================
// Use Toast Hook
// ============================================================================

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ============================================================================
// Toast Helper Hooks
// ============================================================================

export const useToastHelpers = () => {
  const { addToast } = useToast();

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: 'success', title, message, duration });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: 'error', title, message, duration });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: 'warning', title, message, duration });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: 'info', title, message, duration });
    },
    [addToast]
  );

  return { success, error, warning, info };
};

// ============================================================================
// Toast Icon Configuration
// ============================================================================

const toastConfig = {
  success: {
    icon: CheckCircleIcon,
    colors: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-500',
      progress: 'bg-emerald-500',
    },
    ariaLabel: 'Success notification',
  },
  error: {
    icon: ExclamationCircleIcon,
    colors: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      icon: 'text-red-500',
      progress: 'bg-red-500',
    },
    ariaLabel: 'Error notification',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    colors: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: 'text-amber-500',
      progress: 'bg-amber-500',
    },
    ariaLabel: 'Warning notification',
  },
  info: {
    icon: InformationCircleIcon,
    colors: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      icon: 'text-blue-500',
      progress: 'bg-blue-500',
    },
    ariaLabel: 'Information notification',
  },
};

// ============================================================================
// Individual Toast Component
// ============================================================================

interface ToastItemProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration || 5000;
  const toastRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, onRemove]);

  // Pause on hover/focus
  const handleMouseEnter = useCallback(() => {
    if (progressRef.current) {
      progressRef.current.style.animationPlayState = 'paused';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (progressRef.current) {
      progressRef.current.style.animationPlayState = 'running';
    }
  }, []);

  return (
    <motion.div
      ref={toastRef}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="alert"
      aria-label={config.ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative w-full max-w-sm overflow-hidden rounded-xl border backdrop-blur-sm',
        'bg-slate-900/95 shadow-xl',
        config.colors.bg,
        config.colors.border,
        'focus-within:ring-2 focus-within:ring-indigo-500'
      )}
      tabIndex={0}
    >
      {/* Progress Bar */}
      <div
        ref={progressRef}
        className={cn('absolute bottom-0 left-0 h-0.5', config.colors.progress)}
        style={{
          width: '100%',
          animation: `shrink ${duration}ms linear forwards`,
        }}
      />

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>

      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className={cn('flex-shrink-0', config.colors.icon)}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-100">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-sm text-slate-400">{toast.message}</p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onRemove(toast.id)}
          className={cn(
            'flex-shrink-0 text-slate-500 hover:text-slate-300',
            'transition-colors rounded p-1',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900'
          )}
          aria-label={`Dismiss ${toast.type} notification`}
          type="button"
        >
          <XMarkIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// Toast Container
// ============================================================================

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-label="Notifications"
      role="region"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastProvider;