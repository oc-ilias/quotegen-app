/**
 * Auto Save Indicator Component
 * Enhanced auto-save with conflict detection and retry logic
 * @module components/wizard/AutoSaveIndicator
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict' | 'offline';

export interface SaveAttempt {
  id: string;
  timestamp: Date;
  status: 'pending' | 'success' | 'error';
  error?: string;
  retryCount: number;
}

export interface AutoSaveState {
  status: SaveStatus;
  lastSaved: Date | null;
  lastAttempt: Date | null;
  error: string | null;
  conflictData?: {
    serverVersion: unknown;
    localVersion: unknown;
    field: string;
  };
  attempts: SaveAttempt[];
  retryCount: number;
  isOffline: boolean;
}

interface AutoSaveIndicatorProps {
  state: AutoSaveState;
  onRetry?: () => void;
  onResolveConflict?: (resolution: 'local' | 'server' | 'merge') => void;
  onSaveNow?: () => void;
  onDismissError?: () => void;
  className?: string;
  showHistory?: boolean;
  compact?: boolean;
}

interface ConflictResolutionModalProps {
  conflict: AutoSaveState['conflictData'];
  onResolve: (resolution: 'local' | 'server' | 'merge') => void;
  onClose: () => void;
}

// ============================================================================
// Conflict Resolution Modal
// ============================================================================

const ConflictResolutionModal = ({ conflict, onResolve, onClose }: ConflictResolutionModalProps) => {
  if (!conflict) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <DocumentDuplicateIcon className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Version Conflict Detected</h3>
            <p className="text-sm text-slate-400">This quote has been modified elsewhere</p>
          </div>
        </div>

        <p className="text-slate-300 mb-6">
          Someone else (or you in another session) has updated this quote since you started editing. 
          Choose which version to keep:
        </p>

        <div className="space-y-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onResolve('local')}
            className="w-full p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500/50 rounded-xl text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                Keep My Changes
              </span>
              <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">
                Local
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Overwrite the server version with your current changes
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onResolve('server')}
            className="w-full p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
                Use Server Version
              </span>
              <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                Server
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Discard your changes and load the server version
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onResolve('merge')}
            className="w-full p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500/50 rounded-xl text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-200 group-hover:text-purple-400 transition-colors">
                Merge Changes
              </span>
              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                Smart Merge
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Attempt to combine both versions (may require manual review)
            </p>
          </motion.button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 text-slate-400 hover:text-slate-200 transition-colors"
        >
          Cancel and Review
        </button>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Status Icons & Colors
// ============================================================================

const statusConfig: Record<SaveStatus, { icon: React.ElementType; color: string; label: string }> = {
  idle: { icon: ClockIcon, color: 'text-slate-400', label: 'Ready to save' },
  saving: { icon: ArrowPathIcon, color: 'text-indigo-400', label: 'Saving...' },
  saved: { icon: CheckCircleIcon, color: 'text-emerald-400', label: 'Saved' },
  error: { icon: ExclamationCircleIcon, color: 'text-red-400', label: 'Save failed' },
  conflict: { icon: DocumentDuplicateIcon, color: 'text-amber-400', label: 'Conflict detected' },
  offline: { icon: CloudArrowUpIcon, color: 'text-slate-500', label: 'Offline - changes queued' },
};

// ============================================================================
// Main Component
// ============================================================================

export function AutoSaveIndicator({
  state,
  onRetry,
  onResolveConflict,
  onSaveNow,
  onDismissError,
  className,
  showHistory = false,
  compact = false,
}: AutoSaveIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { icon: StatusIcon, color, label } = statusConfig[state.status];

  // Auto-retry logic
  useEffect(() => {
    if (state.status === 'error' && state.retryCount < 3 && onRetry) {
      const delay = Math.min(1000 * Math.pow(2, state.retryCount), 10000); // Exponential backoff
      retryTimeoutRef.current = setTimeout(() => {
        onRetry();
      }, delay);
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [state.status, state.retryCount, onRetry]);

  // Show conflict modal automatically
  useEffect(() => {
    if (state.status === 'conflict' && state.conflictData) {
      setShowConflictModal(true);
    }
  }, [state.status, state.conflictData]);

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const handleResolveConflict = (resolution: 'local' | 'server' | 'merge') => {
    onResolveConflict?.(resolution);
    setShowConflictModal(false);
  };

  if (compact) {
    return (
      <>
        <motion.div
          initial={false}
          animate={{ scale: state.status === 'saving' ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, repeat: state.status === 'saving' ? Infinity : 0 }}
          className={cn('flex items-center gap-2', className)}
        >
          <div className={cn('relative', color)}>
            <StatusIcon className={cn(
              'w-4 h-4',
              state.status === 'saving' && 'animate-spin'
            )} />
            {state.status === 'saved' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"
              />
            )}
          </div>
          <span className={cn('text-xs font-medium', color)}>
            {state.status === 'saved' && state.lastSaved 
              ? formatTime(state.lastSaved)
              : label}
          </span>
        </motion.div>

        <AnimatePresence>
          {showConflictModal && state.conflictData && (
            <ConflictResolutionModal
              conflict={state.conflictData}
              onResolve={handleResolveConflict}
              onClose={() => setShowConflictModal(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'relative flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors',
          state.status === 'error' && 'bg-red-500/10 border-red-500/30',
          state.status === 'conflict' && 'bg-amber-500/10 border-amber-500/30',
          state.status === 'saved' && 'bg-emerald-500/10 border-emerald-500/30',
          state.status === 'saving' && 'bg-indigo-500/10 border-indigo-500/30',
          state.status === 'offline' && 'bg-slate-500/10 border-slate-500/30',
          state.status === 'idle' && 'bg-slate-800/50 border-slate-700',
          className
        )}
      >
        {/* Status Icon */}
        <div className={cn('relative', color)}>
          <StatusIcon className={cn(
            'w-5 h-5',
            state.status === 'saving' && 'animate-spin'
          )} />
        </div>

        {/* Status Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', color)}>
              {label}
            </span>
            {state.retryCount > 0 && state.status === 'error' && (
              <span className="text-xs text-amber-400">
                Retry {state.retryCount}/3
              </span>
            )}
          </div>
          
          {state.lastSaved && (
            <p className="text-xs text-slate-500">
              Last saved {formatTime(state.lastSaved)}
            </p>
          )}
          
          {state.error && state.status === 'error' && (
            <p className="text-xs text-red-400 mt-0.5 truncate">
              {state.error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {state.status === 'error' && onRetry && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              disabled={state.status === 'saving'}
              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Retry save"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </motion.button>
          )}

          {state.status === 'offline' && onSaveNow && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSaveNow}
              className="px-3 py-1 text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            >
              Save Now
            </motion.button>
          )}

          {state.status === 'error' && onDismissError && (
            <button
              onClick={onDismissError}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}

          {showHistory && state.attempts.length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                showDetails ? 'bg-slate-700 text-slate-200' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <ChevronDownIcon className={cn('w-4 h-4 transition-transform', showDetails && 'rotate-180')} />
            </button>
          )}
        </div>
      </motion.div>

      {/* History Dropdown */}
      <AnimatePresence>
        {showDetails && showHistory && state.attempts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
          >
            <div className="p-3">
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                Save History
              </h4>
              <div className="space-y-2">
                {state.attempts.slice(-5).reverse().map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {attempt.status === 'success' ? (
                        <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                      ) : attempt.status === 'error' ? (
                        <ExclamationCircleIcon className="w-4 h-4 text-red-400" />
                      ) : (
                        <ArrowPathIcon className="w-4 h-4 text-indigo-400 animate-spin" />
                      )}
                      <span className={cn(
                        attempt.status === 'success' ? 'text-emerald-400' :
                        attempt.status === 'error' ? 'text-red-400' :
                        'text-indigo-400'
                      )}>
                        {attempt.status === 'success' ? 'Saved' :
                         attempt.status === 'error' ? 'Failed' :
                         'Pending'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatTime(attempt.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conflict Modal */}
      <AnimatePresence>
        {showConflictModal && state.conflictData && (
          <ConflictResolutionModal
            conflict={state.conflictData}
            onResolve={handleResolveConflict}
            onClose={() => setShowConflictModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Hook for managing auto-save state
// ============================================================================

export function useAutoSaveState() {
  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    lastAttempt: null,
    error: null,
    attempts: [],
    retryCount: 0,
    isOffline: false,
  });

  const startSaving = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'saving',
      lastAttempt: new Date(),
      error: null,
    }));
  }, []);

  const markSaved = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'saved',
      lastSaved: new Date(),
      retryCount: 0,
      error: null,
      attempts: [
        ...prev.attempts,
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          status: 'success',
          retryCount: prev.retryCount,
        },
      ].slice(-10), // Keep last 10 attempts
    }));

    // Return to idle after 3 seconds
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        status: prev.status === 'saved' ? 'idle' : prev.status,
      }));
    }, 3000);
  }, []);

  const markError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      status: 'error',
      error,
      retryCount: prev.retryCount + 1,
      attempts: [
        ...prev.attempts,
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          status: 'error',
          error,
          retryCount: prev.retryCount,
        },
      ].slice(-10),
    }));
  }, []);

  const markConflict = useCallback((conflictData: AutoSaveState['conflictData']) => {
    setState(prev => ({
      ...prev,
      status: 'conflict',
      conflictData,
    }));
  }, []);

  const markOffline = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'offline',
      isOffline: true,
    }));
  }, []);

  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'idle',
      error: null,
      retryCount: 0,
    }));
  }, []);

  const resolveConflict = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'idle',
      conflictData: undefined,
    }));
  }, []);

  return {
    state,
    actions: {
      startSaving,
      markSaved,
      markError,
      markConflict,
      markOffline,
      resetError,
      resolveConflict,
    },
  };
}

export default AutoSaveIndicator;
