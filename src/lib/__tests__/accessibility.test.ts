/**
 * Unit Tests for Accessibility Utilities
 * @module lib/__tests__/accessibility.test
 */

import {
  isFocusable,
  getFocusableElements,
  focusFirstFocusable,
  announceToScreenReader,
  KeyboardKeys,
  isInViewport,
  scrollIntoView,
  trapFocus,
} from '@/lib/accessibility';

describe('Accessibility Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('isFocusable', () => {
    it('should return false for null element', () => {
      expect(isFocusable(null)).toBe(false);
    });

    it('should return false for non-HTMLElement', () => {
      const textNode = document.createTextNode('text');
      expect(isFocusable(textNode as any)).toBe(false);
    });

    it('should return false for hidden element', () => {
      document.body.innerHTML = '<button hidden>Hidden Button</button>';
      const button = document.querySelector('button');
      expect(isFocusable(button)).toBe(false);
    });

    it('should return false for aria-hidden element', () => {
      document.body.innerHTML = '<button aria-hidden="true">Hidden Button</button>';
      const button = document.querySelector('button');
      expect(isFocusable(button)).toBe(false);
    });

    it('should return false for display:none element', () => {
      document.body.innerHTML = '<button style="display:none">Hidden Button</button>';
      const button = document.querySelector('button');
      expect(isFocusable(button)).toBe(false);
    });

    it('should return false for visibility:hidden element', () => {
      document.body.innerHTML = '<button style="visibility:hidden">Hidden Button</button>';
      const button = document.querySelector('button');
      expect(isFocusable(button)).toBe(false);
    });

    it('should return true for visible button', () => {
      document.body.innerHTML = '<button>Visible Button</button>';
      const button = document.querySelector('button');
      expect(isFocusable(button)).toBe(true);
    });

    it('should return true for visible link with href', () => {
      document.body.innerHTML = '<a href="/test">Link</a>';
      const link = document.querySelector('a');
      expect(isFocusable(link)).toBe(true);
    });

    it('should return false for link without href', () => {
      document.body.innerHTML = '<a>Link without href</a>';
      const link = document.querySelector('a');
      expect(isFocusable(link)).toBe(false);
    });

    it('should return true for visible input', () => {
      document.body.innerHTML = '<input type="text" />';
      const input = document.querySelector('input');
      expect(isFocusable(input)).toBe(true);
    });

    it('should return false for disabled input', () => {
      document.body.innerHTML = '<input type="text" disabled />';
      const input = document.querySelector('input');
      expect(isFocusable(input)).toBe(false);
    });

    it('should return false for hidden input', () => {
      document.body.innerHTML = '<input type="hidden" />';
      const input = document.querySelector('input');
      expect(isFocusable(input)).toBe(false);
    });

    it('should return true for visible select', () => {
      document.body.innerHTML = '<select><option>1</option></select>';
      const select = document.querySelector('select');
      expect(isFocusable(select)).toBe(true);
    });

    it('should return false for disabled select', () => {
      document.body.innerHTML = '<select disabled><option>1</option></select>';
      const select = document.querySelector('select');
      expect(isFocusable(select)).toBe(false);
    });

    it('should return true for visible textarea', () => {
      document.body.innerHTML = '<textarea></textarea>';
      const textarea = document.querySelector('textarea');
      expect(isFocusable(textarea)).toBe(true);
    });

    it('should return true for element with tabindex', () => {
      document.body.innerHTML = '<div tabindex="0">Focusable Div</div>';
      const div = document.querySelector('div');
      expect(isFocusable(div)).toBe(true);
    });

    it('should return false for element with tabindex="-1"', () => {
      document.body.innerHTML = '<div tabindex="-1">Not Focusable</div>';
      const div = document.querySelector('div');
      expect(isFocusable(div)).toBe(false);
    });

    it('should return true for contenteditable element', () => {
      document.body.innerHTML = '<div contenteditable="true">Editable</div>';
      const div = document.querySelector('div');
      expect(isFocusable(div)).toBe(true);
    });

    it('should return false for contenteditable="false"', () => {
      document.body.innerHTML = '<div contenteditable="false">Not Editable</div>';
      const div = document.querySelector('div');
      expect(isFocusable(div)).toBe(false);
    });

    it('should return true for details element', () => {
      document.body.innerHTML = '<details><summary>Summary</summary></details>';
      const details = document.querySelector('details');
      expect(isFocusable(details)).toBe(true);
    });
  });

  describe('getFocusableElements', () => {
    it('should return empty array when no focusable elements exist', () => {
      document.body.innerHTML = '<div>No focusable elements</div>';
      const result = getFocusableElements();
      expect(result).toEqual([]);
    });

    it('should return focusable buttons', () => {
      document.body.innerHTML = `
        <button>Button 1</button>
        <button>Button 2</button>
      `;
      const result = getFocusableElements();
      expect(result).toHaveLength(2);
      expect(result[0].tagName).toBe('BUTTON');
    });

    it('should return focusable links', () => {
      document.body.innerHTML = `
        <a href="/link1">Link 1</a>
        <a href="/link2">Link 2</a>
      `;
      const result = getFocusableElements();
      expect(result).toHaveLength(2);
    });

    it('should return focusable inputs', () => {
      document.body.innerHTML = `
        <input type="text" />
        <input type="checkbox" />
        <input type="radio" />
      `;
      const result = getFocusableElements();
      expect(result).toHaveLength(3);
    });

    it('should exclude disabled elements', () => {
      document.body.innerHTML = `
        <button>Enabled</button>
        <button disabled>Disabled</button>
      `;
      const result = getFocusableElements();
      expect(result).toHaveLength(1);
    });

    it('should exclude hidden elements', () => {
      document.body.innerHTML = `
        <button>Visible</button>
        <button hidden>Hidden</button>
      `;
      const result = getFocusableElements();
      expect(result).toHaveLength(1);
    });

    it('should exclude elements in disabled fieldset', () => {
      document.body.innerHTML = `
        <fieldset disabled>
          <button>In Disabled Fieldset</button>
          <input type="text" />
        </fieldset>
        <button>Outside Fieldset</button>
      `;
      const result = getFocusableElements();
      expect(result).toHaveLength(1);
      expect(result[0].textContent).toBe('Outside Fieldset');
    });

    it('should filter by custom container', () => {
      document.body.innerHTML = `
        <div id="container1">
          <button>Button 1</button>
        </div>
        <div id="container2">
          <button>Button 2</button>
        </div>
      `;
      const container = document.getElementById('container1');
      const result = getFocusableElements(container!);
      expect(result).toHaveLength(1);
      expect(result[0].textContent).toBe('Button 1');
    });

    it('should default to document.body when no container provided', () => {
      document.body.innerHTML = '<button>Body Button</button>';
      const result = getFocusableElements();
      expect(result).toHaveLength(1);
    });

    it('should return elements in DOM order', () => {
      document.body.innerHTML = `
        <button>First</button>
        <input type="text" />
        <a href="/">Third</a>
      `;
      const result = getFocusableElements();
      expect(result[0].tagName).toBe('BUTTON');
      expect(result[1].tagName).toBe('INPUT');
      expect(result[2].tagName).toBe('A');
    });
  });

  describe('focusFirstFocusable', () => {
    it('should return null for null container', () => {
      const result = focusFirstFocusable(null);
      expect(result).toBeNull();
    });

    it('should return null when no focusable elements exist', () => {
      document.body.innerHTML = '<div id="container"><p>No buttons</p></div>';
      const container = document.getElementById('container');
      const result = focusFirstFocusable(container!);
      expect(result).toBeNull();
    });

    it('should focus first focusable element', () => {
      document.body.innerHTML = `
        <div id="modal">
          <p>Text</p>
          <button id="first">First Button</button>
          <button>Second Button</button>
        </div>
      `;
      const container = document.getElementById('modal');
      const firstButton = document.getElementById('first');
      const focusSpy = jest.spyOn(firstButton!, 'focus');

      const result = focusFirstFocusable(container!);

      expect(focusSpy).toHaveBeenCalled();
      expect(result).toBe(firstButton);
    });

    it('should skip non-focusable elements', () => {
      document.body.innerHTML = `
        <div id="modal">
          <p>Text</p>
          <div>Div</div>
          <a href="/">Link</a>
        </div>
      `;
      const container = document.getElementById('modal');
      const result = focusFirstFocusable(container!);

      expect(result?.tagName).toBe('A');
    });
  });

  describe('announceToScreenReader', () => {
    it('should create announcer element if not exists', () => {
      announceToScreenReader('Test message');

      const announcer = document.getElementById('live-announcer-polite');
      expect(announcer).toBeTruthy();
      expect(announcer?.getAttribute('aria-live')).toBe('polite');
      expect(announcer?.getAttribute('aria-atomic')).toBe('true');
    });

    it('should use existing announcer if already created', () => {
      announceToScreenReader('First message');
      const firstAnnouncer = document.getElementById('live-announcer-polite');

      announceToScreenReader('Second message');
      const secondAnnouncer = document.getElementById('live-announcer-polite');

      expect(firstAnnouncer).toBe(secondAnnouncer);
    });

    it('should create assertive announcer for assertive priority', () => {
      announceToScreenReader('Urgent message', 'assertive');

      const announcer = document.getElementById('live-announcer-assertive');
      expect(announcer).toBeTruthy();
      expect(announcer?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should have proper screen reader only styles', () => {
      announceToScreenReader('Test');

      const announcer = document.getElementById('live-announcer-polite');
      const styles = window.getComputedStyle(announcer!);
      expect(announcer?.style.position).toBe('absolute');
      expect(announcer?.style.width).toBe('1px');
      expect(announcer?.style.height).toBe('1px');
      expect(announcer?.style.overflow).toBe('hidden');
    });

    it('should handle empty message', () => {
      announceToScreenReader('');

      const announcer = document.getElementById('live-announcer-polite');
      expect(announcer).toBeTruthy();
    });

    it('should return early when document is undefined', () => {
      const originalDocument = global.document;
      // @ts-ignore
      global.document = undefined;

      expect(() => announceToScreenReader('Test')).not.toThrow();

      global.document = originalDocument;
    });
  });

  describe('KeyboardKeys', () => {
    it('should have correct key values', () => {
      expect(KeyboardKeys.TAB).toBe('Tab');
      expect(KeyboardKeys.ENTER).toBe('Enter');
      expect(KeyboardKeys.ESCAPE).toBe('Escape');
      expect(KeyboardKeys.SPACE).toBe(' ');
      expect(KeyboardKeys.ARROW_UP).toBe('ArrowUp');
      expect(KeyboardKeys.ARROW_DOWN).toBe('ArrowDown');
      expect(KeyboardKeys.ARROW_LEFT).toBe('ArrowLeft');
      expect(KeyboardKeys.ARROW_RIGHT).toBe('ArrowRight');
      expect(KeyboardKeys.HOME).toBe('Home');
      expect(KeyboardKeys.END).toBe('End');
      expect(KeyboardKeys.PAGE_UP).toBe('PageUp');
      expect(KeyboardKeys.PAGE_DOWN).toBe('PageDown');
    });
  });

  describe('isInViewport', () => {
    it('should return true for element in viewport', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          top: 100,
          left: 100,
          bottom: 200,
          right: 200,
        }),
      } as HTMLElement;

      Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });

      expect(isInViewport(mockElement)).toBe(true);
    });

    it('should return false for element above viewport', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          top: -100,
          left: 100,
          bottom: -50,
          right: 200,
        }),
      } as HTMLElement;

      expect(isInViewport(mockElement)).toBe(false);
    });

    it('should return false for element below viewport', () => {
      Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });

      const mockElement = {
        getBoundingClientRect: () => ({
          top: 700,
          left: 100,
          bottom: 800,
          right: 200,
        }),
      } as HTMLElement;

      expect(isInViewport(mockElement)).toBe(false);
    });

    it('should return false for element left of viewport', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          top: 100,
          left: -100,
          bottom: 200,
          right: -50,
        }),
      } as HTMLElement;

      expect(isInViewport(mockElement)).toBe(false);
    });

    it('should return false for element right of viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });

      const mockElement = {
        getBoundingClientRect: () => ({
          top: 100,
          left: 900,
          bottom: 200,
          right: 1000,
        }),
      } as HTMLElement;

      expect(isInViewport(mockElement)).toBe(false);
    });

    it('should handle element at edge of viewport', () => {
      Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });

      const mockElement = {
        getBoundingClientRect: () => ({
          top: 0,
          left: 0,
          bottom: 100,
          right: 100,
        }),
      } as HTMLElement;

      expect(isInViewport(mockElement)).toBe(true);
    });
  });

  describe('scrollIntoView', () => {
    it('should scroll element into view with smooth behavior', () => {
      const mockScrollIntoView = jest.fn();
      const mockElement = {
        scrollIntoView: mockScrollIntoView,
      } as unknown as HTMLElement;

      scrollIntoView(mockElement, 'smooth');

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    });

    it('should scroll element into view with auto behavior', () => {
      const mockScrollIntoView = jest.fn();
      const mockElement = {
        scrollIntoView: mockScrollIntoView,
      } as unknown as HTMLElement;

      scrollIntoView(mockElement, 'auto');

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest',
      });
    });

    it('should default to smooth behavior', () => {
      const mockScrollIntoView = jest.fn();
      const mockElement = {
        scrollIntoView: mockScrollIntoView,
      } as unknown as HTMLElement;

      scrollIntoView(mockElement);

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    });
  });

  describe('trapFocus', () => {
    it('should return cleanup function', () => {
      document.body.innerHTML = `
        <div id="modal">
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      `;
      const container = document.getElementById('modal')!;

      const cleanup = trapFocus(container);

      expect(typeof cleanup).toBe('function');
    });

    it('should handle Tab key press', () => {
      document.body.innerHTML = `
        <div id="modal">
          <button id="first">Button 1</button>
          <button id="last">Button 2</button>
        </div>
      `;
      const container = document.getElementById('modal')!;
      const firstButton = document.getElementById('first')!;
      const lastButton = document.getElementById('last')!;

      trapFocus(container);

      // Simulate Tab on last element
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      Object.defineProperty(document, 'activeElement', {
        value: lastButton,
        writable: true,
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      container.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle Shift+Tab key press', () => {
      document.body.innerHTML = `
        <div id="modal">
          <button id="first">Button 1</button>
          <button id="last">Button 2</button>
        </div>
      `;
      const container = document.getElementById('modal')!;
      const firstButton = document.getElementById('first')!;

      trapFocus(container);

      // Simulate Shift+Tab on first element
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
      Object.defineProperty(document, 'activeElement', {
        value: firstButton,
        writable: true,
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      container.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not handle non-Tab keys', () => {
      document.body.innerHTML = `
        <div id="modal">
          <button>Button</button>
        </div>
      `;
      const container = document.getElementById('modal')!;

      trapFocus(container);

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      container.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should cleanup event listeners when called', () => {
      document.body.innerHTML = `
        <div id="modal">
          <button>Button</button>
        </div>
      `;
      const container = document.getElementById('modal')!;
      const removeEventListenerSpy = jest.spyOn(container, 'removeEventListener');

      const cleanup = trapFocus(container);
      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should handle empty container', () => {
      document.body.innerHTML = '<div id="modal"></div>';
      const container = document.getElementById('modal')!;

      const cleanup = trapFocus(container);

      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      container.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(typeof cleanup).toBe('function');
    });

    it('should handle focus outside container', () => {
      document.body.innerHTML = `
        <button id="outside">Outside</button>
        <div id="modal">
          <button id="inside">Inside</button>
        </div>
      `;
      const container = document.getElementById('modal')!;
      const outsideButton = document.getElementById('outside')!;

      trapFocus(container);

      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
      Object.defineProperty(document, 'activeElement', {
        value: outsideButton,
        writable: true,
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      container.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});
