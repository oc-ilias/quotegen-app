import { renderHook, act } from '@testing-library/react';
import { useKeyPress } from '@/hooks';

describe('useKeyPress', () => {
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockCallback = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any remaining event listeners
    window.removeEventListener('keydown', jest.fn());
  });

  describe('basic key press', () => {
    it('should call callback when target key is pressed', () => {
      renderHook(() => useKeyPress('Escape', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should not call callback when different key is pressed', () => {
      renderHook(() => useKeyPress('Escape', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle Enter key', () => {
      renderHook(() => useKeyPress('Enter', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle Space key', () => {
      renderHook(() => useKeyPress(' ', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: ' ' });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle letter keys', () => {
      renderHook(() => useKeyPress('a', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'a' });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle number keys', () => {
      renderHook(() => useKeyPress('1', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: '1' });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should be case sensitive for letter keys', () => {
      renderHook(() => useKeyPress('A', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'a' });
        window.dispatchEvent(keyEvent);
      });

      // Should not match lowercase 'a' when looking for 'A'
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should match using key code', () => {
      renderHook(() => useKeyPress('KeyK', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { code: 'KeyK' });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('modifier keys', () => {
    it('should call callback when Ctrl+key is pressed', () => {
      renderHook(() => useKeyPress('k', mockCallback, { ctrl: true }));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should not call callback when Ctrl is not pressed', () => {
      renderHook(() => useKeyPress('k', mockCallback, { ctrl: true }));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'k', ctrlKey: false });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should call callback when Shift+key is pressed', () => {
      renderHook(() => useKeyPress('K', mockCallback, { shift: true }));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'K', shiftKey: true });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should call callback when Alt+key is pressed', () => {
      renderHook(() => useKeyPress('f', mockCallback, { alt: true }));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'f', altKey: true });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should call callback when Meta+key is pressed', () => {
      renderHook(() => useKeyPress('k', mockCallback, { meta: true }));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple modifier keys', () => {
      renderHook(() => useKeyPress('k', mockCallback, { ctrl: true, shift: true }));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { 
          key: 'k', 
          ctrlKey: true, 
          shiftKey: true 
        });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should not call callback when modifiers do not match exactly', () => {
      renderHook(() => useKeyPress('k', mockCallback, { ctrl: true, shift: true }));

      act(() => {
        // Only Ctrl pressed, not Shift
        const keyEvent = new KeyboardEvent('keydown', { 
          key: 'k', 
          ctrlKey: true, 
          shiftKey: false 
        });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('preventDefault', () => {
    it('should call preventDefault when preventDefault option is true', () => {
      renderHook(() => useKeyPress('k', mockCallback, { preventDefault: true }));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'k', cancelable: true });
        const preventDefaultSpy = jest.spyOn(keyEvent, 'preventDefault');
        window.dispatchEvent(keyEvent);
        expect(preventDefaultSpy).toHaveBeenCalled();
      });
    });

    it('should not call preventDefault by default', () => {
      renderHook(() => useKeyPress('k', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'k', cancelable: true });
        const preventDefaultSpy = jest.spyOn(keyEvent, 'preventDefault');
        window.dispatchEvent(keyEvent);
        expect(preventDefaultSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useKeyPress('Escape', mockCallback));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('callback updates', () => {
    it('should use the latest callback', () => {
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();

      const { rerender } = renderHook(
        ({ callback }) => useKeyPress('Escape', callback),
        { initialProps: { callback: firstCallback } }
      );

      // Update callback
      rerender({ callback: secondCallback });

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        window.dispatchEvent(keyEvent);
      });

      expect(secondCallback).toHaveBeenCalled();
    });
  });

  describe('key combinations', () => {
    it('should handle Ctrl+Enter', () => {
      renderHook(() => useKeyPress('Enter', mockCallback, { ctrl: true }));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { 
          key: 'Enter', 
          ctrlKey: true 
        });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle Ctrl+Shift+K', () => {
      renderHook(() => useKeyPress('k', mockCallback, { ctrl: true, shift: true }));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { 
          key: 'k', 
          ctrlKey: true,
          shiftKey: true
        });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle all four modifiers', () => {
      renderHook(() => useKeyPress('k', mockCallback, { 
        ctrl: true, 
        shift: true, 
        alt: true, 
        meta: true 
      }));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { 
          key: 'k', 
          ctrlKey: true,
          shiftKey: true,
          altKey: true,
          metaKey: true
        });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('special keys', () => {
    it('should handle Arrow keys', () => {
      renderHook(() => useKeyPress('ArrowUp', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle Tab key', () => {
      renderHook(() => useKeyPress('Tab', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle Backspace key', () => {
      renderHook(() => useKeyPress('Backspace', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle Delete key', () => {
      renderHook(() => useKeyPress('Delete', mockCallback));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'Delete' });
        window.dispatchEvent(keyEvent);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('multiple hook instances', () => {
    it('should handle multiple hooks independently', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      renderHook(() => useKeyPress('a', callback1));
      renderHook(() => useKeyPress('b', callback2));

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'a' });
        window.dispatchEvent(keyEvent);
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();

      act(() => {
        const keyEvent = new KeyboardEvent('keydown', { key: 'b' });
        window.dispatchEvent(keyEvent);
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });
});
