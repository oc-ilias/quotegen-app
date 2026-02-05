/**
 * Modal Component (Accessibility Enhanced)
 * Accessible modal dialog with focus trapping and ARIA attributes
 * @module components/ui/Modal
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { FocusTrap } from '@/components/accessibility/FocusTrap';
import { useLiveAnnouncer } from '@/components/accessibility/LiveAnnouncer';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  footer?: React.ReactNode;
  role?: 'dialog' | 'alertdialog';
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  initialFocusRef,
  footer,
  role = 'dialog',
}: ModalProps) => {
  const { announce } = useLiveAnnouncer();
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`).current;
  const descriptionId = useRef(`modal-desc-${Math.random().toString(36).substr(2, 9)}`).current;
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store previously focused element
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Announce modal opening to screen readers
      if (title) {
        announce(`${title} dialog opened`, 'polite');
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, title, announce]);

  // Return focus on close
  useEffect(() => {
    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, []);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  const handleEscape = useCallback(() => {
    if (closeOnEscape) {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      <FocusTrap
        isActive={isOpen}
        onEscape={handleEscape}
        initialFocus={!initialFocusRef}
        className="relative w-full max-h-[90vh]"
      >
        {/* Modal */}
        <div
          role={role}
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            'relative bg-slate-800 rounded-xl shadow-2xl border border-slate-700',
            'w-full max-h-[90vh] overflow-hidden flex flex-col',
            'animate-in fade-in zoom-in-95 duration-200',
            {
              'max-w-sm': size === 'sm',
              'max-w-md': size === 'md',
              'max-w-lg': size === 'lg',
              'max-w-2xl': size === 'xl',
              'max-w-full h-full': size === 'full',
            }
          )}
        >
          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
              <div className="flex-1 pr-4">
                {title && (
                  <h2
                    id={titleId}
                    className="text-lg font-semibold text-slate-100"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id={descriptionId}
                    className="mt-1 text-sm text-slate-400"
                  >
                    {description}
                  </p>
                )}
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'flex-shrink-0 p-2 text-slate-400 hover:text-slate-100',
                    'hover:bg-slate-700 rounded-lg transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800'
                  )}
                  aria-label="Close dialog"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-slate-700 flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </FocusTrap>
    </div>
  );

  // Use createPortal to render outside the component tree
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

export default Modal;