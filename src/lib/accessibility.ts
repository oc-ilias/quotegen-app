/**
 * Accessibility utilities for QuoteGen
 * WCAG 2.1 AA compliant helper functions
 */

/**
 * CSS selector for focusable elements
 * Includes: links, buttons, inputs, selects, textareas, details, and elements with tabindex
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'details:not([disabled])',
  'summary:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ');

/**
 * Check if an element is focusable
 * @param element - The element to check
 * @returns boolean indicating if the element can receive focus
 * @example
 * const button = document.querySelector('button');
 * if (isFocusable(button)) {
 *   button.focus();
 * }
 */
export function isFocusable(element: Element | null): boolean {
  if (!element || !(element instanceof HTMLElement)) {
    return false;
  }

  // Check for hidden elements
  if (element.hidden || element.hasAttribute('aria-hidden')) {
    return false;
  }

  // Check computed style for visibility
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  // Check if element matches focusable selector
  return element.matches(FOCUSABLE_SELECTOR);
}

/**
 * Get all focusable elements within a container
 * @param container - The container element to search within (defaults to document.body)
 * @returns Array of focusable HTMLElements
 * @example
 * const modal = document.getElementById('modal');
 * const focusableElements = getFocusableElements(modal);
 * // focusableElements contains all interactive elements inside the modal
 */
export function getFocusableElements(
  container: HTMLElement = document.body
): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );

  return elements.filter((element) => {
    // Double-check each element is actually focusable
    if (!isFocusable(element)) {
      return false;
    }

    // Check if element is inside a disabled fieldset
    let parent = element.parentElement;
    while (parent) {
      if (
        parent instanceof HTMLFieldSetElement &&
        parent.disabled
      ) {
        return false;
      }
      parent = parent.parentElement;
    }

    return true;
  });
}

/**
 * Focus the first focusable element within a container
 * @param container - The container element to search within
 * @returns The focused element, or null if no focusable element found
 * @example
 * const modal = document.getElementById('modal');
 * focusFirstFocusable(modal);
 */
export function focusFirstFocusable(
  container: HTMLElement | null
): HTMLElement | null {
  if (!container) {
    return null;
  }

  const focusableElements = getFocusableElements(container);
  
  if (focusableElements.length === 0) {
    return null;
  }

  const firstElement = focusableElements[0];
  firstElement.focus();
  return firstElement;
}

/**
 * Priority levels for screen reader announcements
 */
export type AnnouncePriority = 'polite' | 'assertive';

/**
 * Global announcer element IDs
 */
const ANNOUNCER_ID_POLITE = 'live-announcer-polite';
const ANNOUNCER_ID_ASSERTIVE = 'live-announcer-assertive';

/**
 * Announce a message to screen readers via ARIA live regions
 * @param message - The message to announce
 * @param priority - The priority level ('polite' or 'assertive')
 * @example
 * // Non-urgent announcement
 * announceToScreenReader('Item added to cart', 'polite');
 * 
 * // Urgent announcement
 * announceToScreenReader('Form submission failed', 'assertive');
 */
export function announceToScreenReader(
  message: string,
  priority: AnnouncePriority = 'polite'
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const announcerId =
    priority === 'assertive' ? ANNOUNCER_ID_ASSERTIVE : ANNOUNCER_ID_POLITE;

  let announcer = document.getElementById(announcerId);

  // Create announcer if it doesn't exist
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = announcerId;
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.padding = '0';
    announcer.style.margin = '-1px';
    announcer.style.overflow = 'hidden';
    announcer.style.clip = 'rect(0, 0, 0, 0)';
    announcer.style.whiteSpace = 'nowrap';
    announcer.style.border = '0';
    document.body.appendChild(announcer);
  }

  // Clear previous content and set new message
  // Small delay ensures screen readers detect the change
  announcer.textContent = '';
  
  requestAnimationFrame(() => {
    announcer!.textContent = message;
  });
}

/**
 * Keyboard key codes/names for handling keyboard events
 */
export const KeyboardKeys = {
  TAB: 'Tab',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Check if an element is within the viewport
 * @param element - The element to check
 * @returns boolean indicating if element is visible in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Scroll element into view with smooth behavior
 * @param element - The element to scroll to
 * @param behavior - Scroll behavior ('smooth' or 'auto')
 */
export function scrollIntoView(
  element: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
): void {
  element.scrollIntoView({
    behavior,
    block: 'nearest',
    inline: 'nearest',
  });
}

/**
 * Trap focus within a given element
 * Returns cleanup function to remove event listeners
 * @param container - The element to trap focus within
 * @returns Cleanup function to remove trap
 * @example
 * const modal = document.getElementById('modal');
 * const cleanup = trapFocus(modal);
 * 
 * // Later, when closing modal:
 * cleanup();
 */
export function trapFocus(container: HTMLElement): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== KeyboardKeys.TAB) {
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

    // Shift + Tab: move to previous element
    if (event.shiftKey) {
      if (activeElement === firstElement || !container.contains(activeElement)) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: move to next element
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}
