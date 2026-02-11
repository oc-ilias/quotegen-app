/**
 * Accessibility Utilities
 * Shared utilities for accessibility features across the application
 * @module lib/accessibility
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ============================================================================
// Focus Management
// ============================================================================

/**
 * Focusable elements selector for keyboard navigation
 */
export const FOCUSABLE_ELEMENTS = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
  'audio[controls]',
  'video[controls]',
  'summary',
].join(', ');

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll(FOCUSABLE_ELEMENTS);
  return Array.from(elements) as HTMLElement[];
}

/**
 * Focus the first focusable element in a container
 */
export function focusFirstElement(container: HTMLElement): void {
  const elements = getFocusableElements(container);
  if (elements.length > 0) {
    elements[0].focus();
  }
}

/**
 * Focus the last focusable element in a container
 */
export function focusLastElement(container: HTMLElement): void {
  const elements = getFocusableElements(container);
  if (elements.length > 0) {
    elements[elements.length - 1].focus();
  }
}

// ============================================================================
// Focus Trap Hook
// ============================================================================

export interface UseFocusTrapOptions {
  isActive: boolean;
  onEscape?: () => void;
  initialFocus?: boolean;
  returnFocus?: boolean;
}

/**
 * Hook to trap focus within a modal/dialog element
 */
export function useFocusTrap<T extends HTMLElement>(options: UseFocusTrapOptions) {
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (options.isActive) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the first element when activated
      if (options.initialFocus !== false && containerRef.current) {
        // Small delay to ensure DOM is ready
        setTimeout(() => focusFirstElement(containerRef.current!), 0);
      }
    }

    return () => {
      if (options.isActive && options.returnFocus !== false && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [options.isActive, options.initialFocus, options.returnFocus]);

  // Handle keyboard events for focus trap
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Handle Tab key
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }

    // Handle Escape key
    if (event.key === 'Escape' && options.onEscape) {
      event.preventDefault();
      options.onEscape();
    }
  }, [options.onEscape]);

  return { containerRef, handleKeyDown };
}

// ============================================================================
// Announcer Hook
// ============================================================================

export type AnnouncerPriority = 'polite' | 'assertive';

/**
 * Hook to announce messages to screen readers
 */
export function useAnnouncer() {
  const announce = useCallback((message: string, priority: AnnouncerPriority = 'polite') => {
    const regionId = `aria-announcer-${priority}`;
    let region = document.getElementById(regionId);

    // Create the region if it doesn't exist
    if (!region) {
      region = document.createElement('div');
      region.id = regionId;
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', priority);
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      document.body.appendChild(region);
    }

    // Clear and set the message
    region.textContent = '';
    // Small delay to ensure the screen reader notices the change
    setTimeout(() => {
      if (region) {
        region.textContent = message;
      }
    }, 100);
  }, []);

  return { announce };
}

// ============================================================================
// Reduced Motion Hook
// ============================================================================

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// ============================================================================
// Keyboard Navigation Hook
// ============================================================================

export interface UseKeyboardNavigationOptions {
  onEnter?: () => void;
  onSpace?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onEscape?: () => void;
  preventDefault?: boolean;
}

/**
 * Hook for keyboard navigation handlers
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions) {
  return useCallback((event: React.KeyboardEvent) => {
    const handlers: Record<string, (() => void) | undefined> = {
      Enter: options.onEnter,
      ' ': options.onSpace,
      ArrowUp: options.onArrowUp,
      ArrowDown: options.onArrowDown,
      ArrowLeft: options.onArrowLeft,
      ArrowRight: options.onArrowRight,
      Home: options.onHome,
      End: options.onEnd,
      Escape: options.onEscape,
    };

    const handler = handlers[event.key];
    if (handler) {
      if (options.preventDefault) {
        event.preventDefault();
      }
      handler();
    }
  }, [options]);
}

// ============================================================================
// ARIA ID Generation
// ============================================================================

let idCounter = 0;

/**
 * Generate unique IDs for ARIA attributes
 */
export function generateAriaId(prefix: string = 'aria'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Label Association Helper
// ============================================================================

export interface LabelAssociation {
  id: string;
  labelId: string;
  describedById?: string;
  errorId?: string;
  helpId?: string;
}

/**
 * Generate IDs for proper label/input association
 */
export function useLabelAssociation(prefix: string = 'field'): LabelAssociation {
  const id = useRef(generateAriaId(prefix)).current;
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  return {
    id,
    labelId,
    errorId,
    helpId,
    get describedById() {
      const ids: string[] = [];
      // Note: errorId and helpId are available but should be conditionally included
      return ids.length > 0 ? ids.join(' ') : undefined;
    },
  };
}

// ============================================================================
// Skip Link Handler
// ============================================================================

/**
 * Handle skip link navigation
 */
export function handleSkipLink(targetId: string): void {
  const target = document.getElementById(targetId);
  if (target) {
    target.tabIndex = -1;
    target.focus();
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

// ============================================================================
// Color Contrast Utilities
// ============================================================================

/**
 * Calculate relative luminance of a color
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Parse hex colors
  const parseColor = (color: string): [number, number, number] => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return [r, g, b];
  };

  const [r1, g1, b1] = parseColor(color1);
  const [r2, g2, b2] = parseColor(color2);

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG AA standard (4.5:1 for normal text)
 */
export function meetsWCAGAA(color1: string, color2: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(color1, color2);
  const threshold = isLargeText ? 3 : 4.5;
  return ratio >= threshold;
}
