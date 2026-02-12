import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks';

describe('useLocalStorage', () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  describe('initialization', () => {
    it('should return initial value when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
      
      expect(result.current[0]).toBe('default-value');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should return parsed value from localStorage when available', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('stored-value'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
      
      expect(result.current[0]).toBe('stored-value');
    });

    it('should handle complex objects from localStorage', () => {
      const complexObject = { nested: { key: 'value' }, array: [1, 2, 3] };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(complexObject));
      
      const { result } = renderHook(() => useLocalStorage('test-key', {}));
      
      expect(result.current[0]).toEqual(complexObject);
    });

    it('should handle numbers from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(42));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 0));
      
      expect(result.current[0]).toBe(42);
    });

    it('should handle booleans from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(true));
      
      const { result } = renderHook(() => useLocalStorage('test-key', false));
      
      expect(result.current[0]).toBe(true);
    });

    it('should handle arrays from localStorage', () => {
      const array = [1, 2, 3];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(array));
      
      const { result } = renderHook(() => useLocalStorage('test-key', []));
      
      expect(result.current[0]).toEqual(array);
    });

    it('should return initial value when localStorage throws on read', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
      
      expect(result.current[0]).toBe('fallback');
    });

    it('should handle invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      expect(result.current[0]).toBe('default');
    });
  });

  describe('SSR safety', () => {
    it('should return initial value when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'ssr-value'));
      
      expect(result.current[0]).toBe('ssr-value');
      
      global.window = originalWindow;
    });
  });

  describe('setValue', () => {
    it('should update state and localStorage with direct value', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      act(() => {
        result.current[1]('new-value');
      });
      
      expect(result.current[0]).toBe('new-value');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
    });

    it('should update state and localStorage with function updater', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage('test-key', 5));
      
      act(() => {
        result.current[1]((prev) => prev + 10);
      });
      
      expect(result.current[0]).toBe(15);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(15));
    });

    it('should handle complex object updates', () => {
      const initial = { count: 0, items: [] };
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage('test-key', initial));
      
      act(() => {
        result.current[1]({ count: 1, items: ['item1'] });
      });
      
      expect(result.current[0]).toEqual({ count: 1, items: ['item1'] });
    });

    it('should handle null values', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      act(() => {
        result.current[1](null);
      });
      
      expect(result.current[0]).toBeNull();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(null));
    });

    it('should handle errors when setting localStorage gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
      
      // Should not throw
      act(() => {
        result.current[1]('new-value');
      });
      
      // State should still be updated
      expect(result.current[0]).toBe('new-value');
    });
  });

  describe('cross-tab synchronization', () => {
    it('should update state when storage event fires for same key', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      // Simulate storage event from another tab
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'test-key',
          newValue: JSON.stringify('updated-from-other-tab'),
        });
        window.dispatchEvent(storageEvent);
      });
      
      expect(result.current[0]).toBe('updated-from-other-tab');
    });

    it('should not update state when storage event fires for different key', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'different-key',
          newValue: JSON.stringify('other-value'),
        });
        window.dispatchEvent(storageEvent);
      });
      
      expect(result.current[0]).toBe('initial');
    });

    it('should not update state when storage event has null newValue', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'test-key',
          newValue: null,
        });
        window.dispatchEvent(storageEvent);
      });
      
      expect(result.current[0]).toBe('initial');
    });

    it('should handle invalid JSON in storage event gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      // Should not throw
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'test-key',
          newValue: 'invalid json',
        });
        window.dispatchEvent(storageEvent);
      });
      
      // Value should remain unchanged
      expect(result.current[0]).toBe('initial');
    });

    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useLocalStorage('test-key', 'value'));
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('multiple instances', () => {
    it('should handle multiple hooks with different keys independently', () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'key1') return JSON.stringify('value1');
        if (key === 'key2') return JSON.stringify('value2');
        return null;
      });
      
      const { result: result1 } = renderHook(() => useLocalStorage('key1', 'default1'));
      const { result: result2 } = renderHook(() => useLocalStorage('key2', 'default2'));
      
      expect(result1.current[0]).toBe('value1');
      expect(result2.current[0]).toBe('value2');
      
      act(() => {
        result1.current[1]('updated1');
      });
      
      expect(result1.current[0]).toBe('updated1');
      expect(result2.current[0]).toBe('value2');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined as initial value', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage('test-key', undefined));
      
      expect(result.current[0]).toBeUndefined();
    });

    it('should handle empty string values', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(''));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      expect(result.current[0]).toBe('');
    });

    it('should handle zero as value', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(0));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 100));
      
      expect(result.current[0]).toBe(0);
    });

    it('should handle false as value', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(false));
      
      const { result } = renderHook(() => useLocalStorage('test-key', true));
      
      expect(result.current[0]).toBe(false);
    });

    it('should handle empty array', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));
      
      const { result } = renderHook(() => useLocalStorage('test-key', [1, 2, 3]));
      
      expect(result.current[0]).toEqual([]);
    });

    it('should handle empty object', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({}));
      
      const { result } = renderHook(() => useLocalStorage('test-key', { a: 1 }));
      
      expect(result.current[0]).toEqual({});
    });
  });
});
