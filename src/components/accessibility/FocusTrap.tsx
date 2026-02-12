import React, { useEffect, useRef, useCallback } from 'react';
import {
  getFocusableElements,
  focusFirstFocusable,
} from '../../lib/accessibility';

/**
 * Props for the FocusTrap component
 */
export interface FocusTrapProps {
  /** Whether the focus trap is active */
  active?: boolean;
  /** Child elements to render inside the trap */
  children: React.ReactNode;
  /** Callback when user attempts to escape (e.g., pressing Escape key) */
  onEscape?: () => void;
  /** Whether to focus first element when trap becomes active */
  autoFocus?: boolean;
  /** Element to return focus to when trap is deactivated (default: previously focused element) */
  returnFocusTo?: HTMLElement | null;
  /** Additional CSS class names */
  className?: string;
}

/**
 * FocusTrap Component
 * 
 * Traps keyboard focus within a container element.
 * Essential for modals, dialogs, and other overlay components.
 * 
 * Features:
 * - Tab cycles through focusable elements within the container
 * - Shift+Tab cycles backwards
 * - Optionally focuses first element on activation
 * - Restores focus to previous element on deactivation
 * - Handles Escape key for closing
 * 
 * WCAG 2.1 AA Compliance:
 * - 2.1.2 No Keyboard Trap (Level A)
 * - 2.4.3 Focus Order (Level A)
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * {isOpen && (
 *   <FocusTrap active={isOpen} onEscape={() => setIsOpen(false)}>
 *     <div role="dialog" aria-modal="true">
 *       <h2>Modal Title</h2>
 *       <button>Action</button>
 *       <button onClick={() => setIsOpen(false)}>Close</button>
 *     </div>
 *   </FocusTrap>
 * )}
 * ```
 */
export const FocusTrap: React.FC<FocusTrapProps> = ({
  active = true,
  children,
  onEscape,
  autoFocus = true,
  returnFocusTo,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /**
   * Store the currently focused element when trap activates
   */
  useEffect(() => {
    if (active) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [active]);

  /**
   * Auto-focus first element when trap becomes active
   */
  useEffect(() => {
    if (active && autoFocus && containerRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        focusFirstFocusable(containerRef.current);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [active, autoFocus]);

  /**
   * Restore focus when trap deactivates or unmounts
   */
  useEffect(() => {
    return () => {
      // Determine where to return focus
      const elementToFocus = returnFocusTo ?? previousFocusRef.current;
      
      if (elementToFocus && typeof elementToFocus.focus === 'function') {
        elementToFocus.focus();
      }
    };
  }, [returnFocusTo]);

  /**
   * Handle keydown events for focus trapping and escape
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!active) {
        return;
      }

      // Handle Escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Only handle Tab key for focus trapping
      if (event.key !== 'Tab') {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      const focusableElements = getFocusableElements(container);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Handle Shift+Tab (backward navigation)
      if (event.shiftKey) {
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Handle Tab (forward navigation)
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [active, onEscape]
  );

  /**
   * Handle focus leaving the container (edge case for some browsers)
   */
  useEffect(() => {
    if (!active) {
      return;
    }

    const handleFocusOut = (event: FocusEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      // Check if focus is moving outside the container
      const relatedTarget = event.relatedTarget as HTMLElement;
      
      if (relatedTarget && !container.contains(relatedTarget)) {
        // Focus moved outside, bring it back
        const focusableElements = getFocusableElements(container);
        
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('focusout', handleFocusOut);
    }

    return () => {
      if (container) {
        container.removeEventListener('focusout', handleFocusOut);
      }
    };
  }, [active]);

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={className}
      data-testid="focus-trap"
    >
      {children}
    </div>
  );
};

/**
 * Default export for convenient importing
 */
export default FocusTrap;
