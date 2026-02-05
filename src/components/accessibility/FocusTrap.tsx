/**
 * Focus Trap Component
 * Traps focus within a container for modals/dialogs
 * @module components/accessibility/FocusTrap
 */

'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  onEscape?: () => void;
  initialFocus?: boolean;
  returnFocus?: boolean;
  className?: string;
  ariaLabel?: string;
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]',
  'summary',
  'details[open] summary',
].join(', ');

export function FocusTrap({
  children,
  isActive,
  onEscape,
  initialFocus = true,
  returnFocus = true,
  className,
  ariaLabel,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store previously focused element when trap activates
  useEffect(() => {
    if (isActive) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      if (initialFocus) {
        // Delay to ensure DOM is ready
        const timer = setTimeout(() => {
          const focusable = containerRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
          const firstElement = focusable?.[0] as HTMLElement | undefined;
          firstElement?.focus();
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isActive, initialFocus]);

  // Return focus when trap deactivates
  useEffect(() => {
    return () => {
      if (returnFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [returnFocus]);

  // Handle Tab key for focus trap
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isActive || !containerRef.current) return;

      const focusableElements = Array.from(
        containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      ) as HTMLElement[];

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Handle Tab
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift+Tab: move to previous element
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move to next element
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Handle Escape
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
      }
    },
    [isActive, onEscape]
  );

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={cn(className)}
      role={ariaLabel ? 'region' : undefined}
      aria-label={ariaLabel}
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

export default FocusTrap;