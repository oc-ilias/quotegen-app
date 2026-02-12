/**
 * Accessibility Library Tests
 * Tests for focus management, keyboard helpers, announceToScreenReader
 * @module lib/__tests__/accessibility.test.ts
 */

import React, { useRef } from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  FOCUSABLE_ELEMENTS,
  getFocusableElements,
  focusFirstElement,
  focusLastElement,
  useFocusTrap,
  useAnnouncer,
  usePrefersReducedMotion,
  useKeyboardNavigation,
  generateAriaId,
  useLabelAssociation,
  handleSkipLink,
  getLuminance,
  getContrastRatio,
  meetsWCAGAA,
} from '@/lib/accessibility';

// ============================================================================
// getFocusableElements
// ============================================================================

describe('getFocusableElements', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should return empty array for empty container', () => {
    const elements = getFocusableElements(container);
    expect(elements).toEqual([]);
  });

  it('should find button elements', () => {
    container.innerHTML = `
      <button>Button 1</button>
      <button>Button 2</button>
    `;

    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(2);
    expect(elements[0].tagName).toBe('BUTTON');
  });

  it('should find input elements', () => {
    container.innerHTML = `
      <input type="text" />
      <input type="checkbox" />
      <input type="radio" />
    `;

    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(3);
  });

  it('should find anchor elements with href', () => {
    container.innerHTML = `
      <a href="/page1">Link 1</a>
      <a href="/page2">Link 2</a>
      <a>No href</a>
    `;

    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(2);
  });

  it('should find select elements', () => {
    container.innerHTML = `
      <select><option>1</option></select>
    `;

    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(1);
  });

  it('should find textarea elements', () => {
    container.innerHTML = `
      <textarea></textarea>
    `;

    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(1);
  });

  it('should find elements with positive tabindex', () => {
    container.innerHTML = `
      <div tabindex="0">Tabbable</div>
      <div tabindex="1">Tabbable 2</div>
      <div tabindex="-1">Not tabbable</div>
    `;

    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(2);
  });

  it('should find contenteditable elements', () => {
    container.innerHTML = `
      <div contenteditable="true">Editable</div>
    `;

    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(1);
  });

  it('should find audio and video controls', () => {
    container.innerHTML = `
      <audio controls></audio>
      <video controls></video>
    `;

    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(2);
  });

  it('should find summary elements', () => {
    container.innerHTML = `
      <details>
        <summary>Click me</summary>
        <p>Content</p>
      </details>
    `;

    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(1);
  });

  it('should exclude disabled elements', () => {
    container.innerHTML = `
      <button>Enabled</button>
      <button disabled>Disabled</button>
      <input disabled />
      <select disabled></select>
      <textarea disabled></textarea>
    `;

    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(1);
  });

  it('should return elements in DOM order', () => {
    container.innerHTML = `
      <button id="btn1">First</button>
      <input id="inp1" />
      <a href="/" id="link1">Link</a>
    `;

    const elements = getFocusableElements(container);
    expect(elements[0].id).toBe('btn1');
    expect(elements[1].id).toBe('inp1');
    expect(elements[2].id).toBe('link1');
  });

  it('should handle mixed focusable elements', () => {
    container.innerHTML = `
      <button>Button</button>
      <a href="/">Link</a>
      <input />
      <select></select>
      <textarea></textarea>
    `;

    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(5);
  });
});

// ============================================================================
// focusFirstElement
// ============================================================================

describe('focusFirstElement', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should focus the first focusable element', () => {
    container.innerHTML = `
      <button id="btn1">First</button>
      <button id="btn2">Second</button>
    `;

    focusFirstElement(container);

    expect(document.activeElement?.id).toBe('btn1');
  });

  it('should do nothing if no focusable elements', () => {
    container.innerHTML = `<div>No buttons here</div>`;
    const previouslyFocused = document.activeElement;

    focusFirstElement(container);

    expect(document.activeElement).toBe(previouslyFocused);
  });

  it('should skip disabled elements', () => {
    container.innerHTML = `
      <button disabled id="btn1">Disabled</button>
      <button id="btn2">Enabled</button>
    `;

    focusFirstElement(container);

    expect(document.activeElement?.id).toBe('btn2');
  });
});

// ============================================================================
// focusLastElement
// ============================================================================

describe('focusLastElement', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should focus the last focusable element', () => {
    container.innerHTML = `
      <button id="btn1">First</button>
      <button id="btn2">Last</button>
    `;

    focusLastElement(container);

    expect(document.activeElement?.id).toBe('btn2');
  });

  it('should do nothing if no focusable elements', () => {
    container.innerHTML = `<div>No buttons here</div>`;
    const previouslyFocused = document.activeElement;

    focusLastElement(container);

    expect(document.activeElement).toBe(previouslyFocused);
  });

  it('should focus single element', () => {
    container.innerHTML = `<button id="only">Only</button>`;

    focusLastElement(container);

    expect(document.activeElement?.id).toBe('only');
  });
});

// ============================================================================
// useFocusTrap
// ============================================================================

describe('useFocusTrap', () => {
  it('should return containerRef and handleKeyDown', () => {
    const { result } = renderHook(() =>
      useFocusTrap({ isActive: true })
    );

    expect(result.current.containerRef).toBeDefined();
    expect(typeof result.current.handleKeyDown).toBe('function');
  });

  it('should handle Tab key navigation', () => {
    const onEscape = jest.fn();
    const { result } = renderHook(() =>
      useFocusTrap({ isActive: true, onEscape })
    );

    const mockEvent = {
      key: 'Tab',
      shiftKey: false,
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    // Since no container is attached, it should not throw
    expect(result.current.handleKeyDown).toBeDefined();
  });

  it('should handle Shift+Tab key navigation', () => {
    const { result } = renderHook(() =>
      useFocusTrap({ isActive: true })
    );

    const mockEvent = {
      key: 'Tab',
      shiftKey: true,
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.handleKeyDown).toBeDefined();
  });

  it('should call onEscape when Escape key pressed', () => {
    const onEscape = jest.fn();
    const { result } = renderHook(() =>
      useFocusTrap({ isActive: true, onEscape })
    );

    const mockEvent = {
      key: 'Escape',
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(onEscape).toHaveBeenCalled();
  });

  it('should not call onEscape when not provided', () => {
    const { result } = renderHook(() =>
      useFocusTrap({ isActive: true })
    );

    const mockEvent = {
      key: 'Escape',
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    // Should not throw
    expect(result.current.handleKeyDown).toBeDefined();
  });

  it('should ignore other keys', () => {
    const onEscape = jest.fn();
    const { result } = renderHook(() =>
      useFocusTrap({ isActive: true, onEscape })
    );

    const keys = ['Enter', 'ArrowDown', 'ArrowUp', 'a', '1'];

    keys.forEach((key) => {
      const mockEvent = {
        key,
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });
    });

    expect(onEscape).not.toHaveBeenCalled();
  });
});

// ============================================================================
// useAnnouncer
// ============================================================================

describe('useAnnouncer', () => {
  beforeEach(() => {
    // Clean up any existing announcer elements
    document.querySelectorAll('[id^="aria-announcer"]').forEach((el) => el.remove());
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create polite announcer region', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('Test message');
    });

    jest.advanceTimersByTime(100);

    const region = document.getElementById('aria-announcer-polite');
    expect(region).toBeTruthy();
    expect(region?.getAttribute('role')).toBe('status');
    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.getAttribute('aria-atomic')).toBe('true');
  });

  it('should create assertive announcer region', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('Urgent message', 'assertive');
    });

    jest.advanceTimersByTime(100);

    const region = document.getElementById('aria-announcer-assertive');
    expect(region).toBeTruthy();
    expect(region?.getAttribute('aria-live')).toBe('assertive');
  });

  it('should announce message with delay', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('Hello world');
    });

    // Initially empty
    const region = document.getElementById('aria-announcer-polite');
    expect(region?.textContent).toBe('');

    // After delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(region?.textContent).toBe('Hello world');
  });

  it('should reuse existing region', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('First message');
    });

    act(() => {
      result.current.announce('Second message');
    });

    jest.advanceTimersByTime(100);

    const regions = document.querySelectorAll('#aria-announcer-polite');
    expect(regions).toHaveLength(1);
  });

  it('should update message content', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('First');
    });

    jest.advanceTimersByTime(100);

    act(() => {
      result.current.announce('Second');
    });

    jest.advanceTimersByTime(100);

    const region = document.getElementById('aria-announcer-polite');
    expect(region?.textContent).toBe('Second');
  });
});

// ============================================================================
// usePrefersReducedMotion
// ============================================================================

describe('usePrefersReducedMotion', () => {
  const mockMatchMedia = jest.fn();

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  it('should return false by default', () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);
  });

  it('should return true when user prefers reduced motion', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(true);
  });

  it('should update when preference changes', () => {
    let changeCallback: ((event: { matches: boolean }) => void) | null = null;

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn((event, callback) => {
        if (event === 'change') {
          changeCallback = callback;
        }
      }),
      removeEventListener: jest.fn(),
    });

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);

    // Simulate preference change
    act(() => {
      if (changeCallback) {
        changeCallback({ matches: true });
      }
    });

    expect(result.current).toBe(true);
  });

  it('should handle window undefined', () => {
    const originalWindow = global.window;
    // @ts-expect-error - Testing undefined window
    delete global.window;

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);

    global.window = originalWindow;
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListener = jest.fn();

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener,
    });

    const { unmount } = renderHook(() => usePrefersReducedMotion());

    unmount();

    expect(removeEventListener).toHaveBeenCalled();
  });
});

// ============================================================================
// useKeyboardNavigation
// ============================================================================

describe('useKeyboardNavigation', () => {
  it('should call onEnter when Enter key pressed', () => {
    const onEnter = jest.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ onEnter })
    );

    const mockEvent = {
      key: 'Enter',
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current(mockEvent);
    });

    expect(onEnter).toHaveBeenCalled();
  });

  it('should call onSpace when Space key pressed', () => {
    const onSpace = jest.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ onSpace })
    );

    const mockEvent = {
      key: ' ',
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current(mockEvent);
    });

    expect(onSpace).toHaveBeenCalled();
  });

  it('should call arrow key handlers', () => {
    const handlers = {
      onArrowUp: jest.fn(),
      onArrowDown: jest.fn(),
      onArrowLeft: jest.fn(),
      onArrowRight: jest.fn(),
    };

    const { result } = renderHook(() => useKeyboardNavigation(handlers));

    Object.entries(handlers).forEach(([key, handler]) => {
      const eventKey = key.replace('onArrow', 'Arrow');
      const mockEvent = {
        key: eventKey,
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current(mockEvent);
      });

      expect(handler).toHaveBeenCalled();
    });
  });

  it('should call onHome and onEnd handlers', () => {
    const onHome = jest.fn();
    const onEnd = jest.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({ onHome, onEnd })
    );

    act(() => {
      result.current({ key: 'Home', preventDefault: jest.fn() } as React.KeyboardEvent);
    });
    expect(onHome).toHaveBeenCalled();

    act(() => {
      result.current({ key: 'End', preventDefault: jest.fn() } as React.KeyboardEvent);
    });
    expect(onEnd).toHaveBeenCalled();
  });

  it('should call onEscape handler', () => {
    const onEscape = jest.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({ onEscape })
    );

    act(() => {
      result.current({ key: 'Escape', preventDefault: jest.fn() } as React.KeyboardEvent);
    });

    expect(onEscape).toHaveBeenCalled();
  });

  it('should prevent default when preventDefault option is true', () => {
    const onEnter = jest.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ onEnter, preventDefault: true })
    );

    const preventDefault = jest.fn();
    const mockEvent = {
      key: 'Enter',
      preventDefault,
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current(mockEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('should not prevent default when preventDefault is false', () => {
    const onEnter = jest.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ onEnter, preventDefault: false })
    );

    const preventDefault = jest.fn();
    const mockEvent = {
      key: 'Enter',
      preventDefault,
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current(mockEvent);
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('should ignore unmapped keys', () => {
    const onEnter = jest.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ onEnter })
    );

    const mockEvent = {
      key: 'a',
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;

    act(() => {
      result.current(mockEvent);
    });

    expect(onEnter).not.toHaveBeenCalled();
  });

  it('should handle multiple handlers', () => {
    const onEnter = jest.fn();
    const onEscape = jest.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({ onEnter, onEscape })
    );

    act(() => {
      result.current({ key: 'Enter', preventDefault: jest.fn() } as React.KeyboardEvent);
    });
    expect(onEnter).toHaveBeenCalledTimes(1);

    act(() => {
      result.current({ key: 'Escape', preventDefault: jest.fn() } as React.KeyboardEvent);
    });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// generateAriaId
// ============================================================================

describe('generateAriaId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateAriaId();
    const id2 = generateAriaId();

    expect(id1).not.toBe(id2);
  });

  it('should include prefix in generated ID', () => {
    const id = generateAriaId('test');

    expect(id.startsWith('test-')).toBe(true);
  });

  it('should use default prefix when not specified', () => {
    const id = generateAriaId();

    expect(id.startsWith('aria-')).toBe(true);
  });

  it('should generate IDs with random component', () => {
    const id = generateAriaId('prefix');
    const parts = id.split('-');

    expect(parts.length).toBeGreaterThanOrEqual(2);
    expect(parts[0]).toBe('prefix');
  });

  it('should generate sequential IDs', () => {
    const ids = Array.from({ length: 5 }, () => generateAriaId('seq'));

    // All IDs should be unique
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ============================================================================
// useLabelAssociation
// ============================================================================

describe('useLabelAssociation', () => {
  it('should return id, labelId, errorId, and helpId', () => {
    const { result } = renderHook(() => useLabelAssociation('field'));

    expect(result.current.id).toBeDefined();
    expect(result.current.labelId).toBe(`${result.current.id}-label`);
    expect(result.current.errorId).toBe(`${result.current.id}-error`);
    expect(result.current.helpId).toBe(`${result.current.id}-help`);
  });

  it('should use default prefix', () => {
    const { result } = renderHook(() => useLabelAssociation());

    expect(result.current.id.startsWith('field-')).toBe(true);
  });

  it('should use custom prefix', () => {
    const { result } = renderHook(() => useLabelAssociation('custom'));

    expect(result.current.id.startsWith('custom-')).toBe(true);
  });

  it('should return describedById as undefined initially', () => {
    const { result } = renderHook(() => useLabelAssociation());

    expect(result.current.describedById).toBeUndefined();
  });

  it('should maintain consistent IDs across renders', () => {
    const { result, rerender } = renderHook(() => useLabelAssociation('test'));

    const firstId = result.current.id;
    rerender();
    const secondId = result.current.id;

    expect(firstId).toBe(secondId);
  });

  it('should generate unique IDs for different instances', () => {
    const { result: result1 } = renderHook(() => useLabelAssociation());
    const { result: result2 } = renderHook(() => useLabelAssociation());

    expect(result1.current.id).not.toBe(result2.current.id);
  });
});

// ============================================================================
// handleSkipLink
// ============================================================================

describe('handleSkipLink', () => {
  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('should focus and scroll to target element', () => {
    const target = document.createElement('div');
    target.id = 'main-content';
    document.body.appendChild(target);

    handleSkipLink('main-content');

    expect(target.tabIndex).toBe(-1);
    expect(document.activeElement).toBe(target);
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(target);
  });

  it('should handle non-existent target gracefully', () => {
    expect(() => handleSkipLink('non-existent')).not.toThrow();
  });

  it('should handle multiple calls to same target', () => {
    const target = document.createElement('div');
    target.id = 'repeat-target';
    document.body.appendChild(target);

    handleSkipLink('repeat-target');
    handleSkipLink('repeat-target');

    expect(target.tabIndex).toBe(-1);

    document.body.removeChild(target);
  });

  it('should work with different element types', () => {
    const main = document.createElement('main');
    main.id = 'content';
    document.body.appendChild(main);

    handleSkipLink('content');

    expect(main.tabIndex).toBe(-1);

    document.body.removeChild(main);
  });
});

// ============================================================================
// getLuminance
// ============================================================================

describe('getLuminance', () => {
  it('should return 0 for black', () => {
    expect(getLuminance(0, 0, 0)).toBe(0);
  });

  it('should return 1 for white', () => {
    expect(getLuminance(255, 255, 255)).toBe(1);
  });

  it('should calculate luminance for red', () => {
    const lum = getLuminance(255, 0, 0);
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(1);
  });

  it('should calculate luminance for gray', () => {
    const lum = getLuminance(128, 128, 128);
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(1);
  });

  it('should handle mid-range colors', () => {
    const lum = getLuminance(100, 150, 200);
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(1);
  });
});

// ============================================================================
// getContrastRatio
// ============================================================================

describe('getContrastRatio', () => {
  it('should return 21 for black and white', () => {
    const ratio = getContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 1);
  });

  it('should return 1 for same colors', () => {
    const ratio = getContrastRatio('#ff0000', '#ff0000');
    expect(ratio).toBe(1);
  });

  it('should calculate ratio for different colors', () => {
    const ratio = getContrastRatio('#000000', '#ff0000');
    expect(ratio).toBeGreaterThan(1);
    expect(ratio).toBeLessThan(21);
  });

  it('should be symmetric', () => {
    const ratio1 = getContrastRatio('#000000', '#ffffff');
    const ratio2 = getContrastRatio('#ffffff', '#000000');
    expect(ratio1).toBe(ratio2);
  });

  it('should handle colors without hash prefix', () => {
    const ratio1 = getContrastRatio('#000000', '#ffffff');
    const ratio2 = getContrastRatio('000000', 'ffffff');
    expect(ratio1).toBe(ratio2);
  });

  it('should handle gray colors', () => {
    const ratio = getContrastRatio('#808080', '#ffffff');
    expect(ratio).toBeGreaterThan(1);
    expect(ratio).toBeLessThan(21);
  });
});

// ============================================================================
// meetsWCAGAA
// ============================================================================

describe('meetsWCAGAA', () => {
  it('should return true for black on white (normal text)', () => {
    expect(meetsWCAGAA('#000000', '#ffffff')).toBe(true);
  });

  it('should return true for white on black (normal text)', () => {
    expect(meetsWCAGAA('#ffffff', '#000000')).toBe(true);
  });

  it('should return true for high contrast colors', () => {
    expect(meetsWCAGAA('#000000', '#ffff00')).toBe(true);
  });

  it('should return false for low contrast colors', () => {
    expect(meetsWCAGAA('#777777', '#888888')).toBe(false);
  });

  it('should use lower threshold for large text', () => {
    // Same colors, different thresholds
    const normalResult = meetsWCAGAA('#777777', '#ffffff', false);
    const largeResult = meetsWCAGAA('#777777', '#ffffff', true);

    expect(largeResult).toBe(true);
    expect(normalResult).toBe(false);
  });

  it('should return false for very low contrast', () => {
    expect(meetsWCAGAA('#eeeeee', '#ffffff')).toBe(false);
  });

  it('should handle edge case at exactly 4.5:1', () => {
    // Colors that produce approximately 4.5:1 ratio
    const result = meetsWCAGAA('#767676', '#ffffff');
    expect(typeof result).toBe('boolean');
  });

  it('should handle edge case at exactly 3:1 for large text', () => {
    const result = meetsWCAGAA('#949494', '#ffffff', true);
    expect(typeof result).toBe('boolean');
  });
});

// ============================================================================
// FOCUSABLE_ELEMENTS constant
// ============================================================================

describe('FOCUSABLE_ELEMENTS', () => {
  it('should be defined', () => {
    expect(FOCUSABLE_ELEMENTS).toBeDefined();
    expect(typeof FOCUSABLE_ELEMENTS).toBe('string');
  });

  it('should include button selector', () => {
    expect(FOCUSABLE_ELEMENTS).toContain('button:not([disabled])');
  });

  it('should include anchor selector', () => {
    expect(FOCUSABLE_ELEMENTS).toContain('a[href]');
  });

  it('should include input selector', () => {
    expect(FOCUSABLE_ELEMENTS).toContain('input:not([disabled])');
  });

  it('should include select selector', () => {
    expect(FOCUSABLE_ELEMENTS).toContain('select:not([disabled])');
  });

  it('should include textarea selector', () => {
    expect(FOCUSABLE_ELEMENTS).toContain('textarea:not([disabled])');
  });

  it('should include tabindex selector', () => {
    expect(FOCUSABLE_ELEMENTS).toContain('[tabindex]:not([tabindex="-1"])');
  });
});
