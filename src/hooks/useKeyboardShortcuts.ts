/**
 * Keyboard Shortcuts Hook
 * Manage keyboard shortcuts for enhanced navigation
 * @module hooks/useKeyboardShortcuts
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  modifier?: 'ctrl' | 'alt' | 'shift' | 'meta';
  description: string;
  action: () => void;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Hook to manage keyboard shortcuts
 * @example
 * const shortcuts = [
 *   {
 *     key: 'k',
 *     modifier: 'ctrl',
 *     description: 'Open search',
 *     action: () => setIsSearchOpen(true),
 *   },
 *   {
 *     key: 'Escape',
 *     description: 'Close modal',
 *     action: () => setIsModalOpen(false),
 *   },
 * ];
 * 
 * useKeyboardShortcuts({ shortcuts });
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in an input
    const target = event.target as HTMLElement;
    const isInputElement =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable;

    shortcutsRef.current.forEach((shortcut) => {
      const keyMatches =
        event.key.toLowerCase() === shortcut.key.toLowerCase() ||
        event.code === shortcut.key;

      let modifierMatches = true;
      if (shortcut.modifier) {
        switch (shortcut.modifier) {
          case 'ctrl':
            modifierMatches = event.ctrlKey;
            break;
          case 'alt':
            modifierMatches = event.altKey;
            break;
          case 'shift':
            modifierMatches = event.shiftKey;
            break;
          case 'meta':
            modifierMatches = event.metaKey;
            break;
        }
      }

      if (keyMatches && modifierMatches) {
        // Don't trigger shortcuts in input fields unless it's Escape
        if (isInputElement && shortcut.key !== 'Escape') {
          return;
        }

        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }

        shortcut.action();
      }
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

/**
 * Hook for focus management within a container
 */
export function useFocusManager(containerRef: React.RefObject<HTMLElement>) {
  const focusNext = useCallback(() => {
    if (!containerRef.current) return;

    const focusable = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const currentIndex = Array.from(focusable).indexOf(
      document.activeElement as Element
    );

    if (currentIndex > -1 && currentIndex < focusable.length - 1) {
      (focusable[currentIndex + 1] as HTMLElement).focus();
    }
  }, [containerRef]);

  const focusPrevious = useCallback(() => {
    if (!containerRef.current) return;

    const focusable = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const currentIndex = Array.from(focusable).indexOf(
      document.activeElement as Element
    );

    if (currentIndex > 0) {
      (focusable[currentIndex - 1] as HTMLElement).focus();
    }
  }, [containerRef]);

  return { focusNext, focusPrevious };
}

export default useKeyboardShortcuts;