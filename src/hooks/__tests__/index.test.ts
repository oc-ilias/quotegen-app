/**
 * Comprehensive tests for custom React hooks
 * @module hooks/__tests__/index.test
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useAsync,
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback,
  useLocalStorage,
  useMediaQuery,
  useBreakpoints,
  useClickOutside,
  useKeyPress,
  usePagination,
  useFormField,
  useInterval,
  usePrevious,
  useDocumentTitle,
} from '../index';

// ============================================
// useAsync Tests
// ============================================
describe('useAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const asyncFn = jest.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(asyncFn));

    expect(result.current[0]).toEqual({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  it('should set loading state during execution', async () => {
    const asyncFn = jest.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(asyncFn));

    act(() => {
      result.current[1].execute();
    });

    expect(result.current[0].isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current[0].isLoading).toBe(false);
    });
  });

  it('should return data on successful execution', async () => {
    const mockData = { id: 1, name: 'Test' };
    const asyncFn = jest.fn().mockResolvedValue(mockData);
    const { result } = renderHook(() => useAsync(asyncFn));

    let executeResult: typeof mockData | null = null;
    await act(async () => {
      executeResult = await result.current[1].execute();
    });

    expect(executeResult).toEqual(mockData);
    expect(result.current[0].data).toEqual(mockData);
    expect(result.current[0].error).toBeNull();
  });

  it('should handle errors correctly', async () => {
    const mockError = new Error('Test error');
    const asyncFn = jest.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useAsync(asyncFn));

    await act(async () => {
      await result.current[1].execute();
    });

    expect(result.current[0].data).toBeNull();
    expect(result.current[0].error).toEqual(mockError);
    expect(result.current[0].isLoading).toBe(false);
  });

  it('should reset state to initial values', async () => {
    const mockData = { id: 1 };
    const asyncFn = jest.fn().mockResolvedValue(mockData);
    const { result } = renderHook(() => useAsync(asyncFn));

    await act(async () => {
      await result.current[1].execute();
    });

    expect(result.current[0].data).toEqual(mockData);

    act(() => {
      result.current[1].reset();
    });

    expect(result.current[0]).toEqual({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  it('should execute immediately when immediate is true', async () => {
    const mockData = { id: 1 };
    const asyncFn = jest.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useAsync(asyncFn, true));

    expect(asyncFn).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(result.current[0].data).toEqual(mockData);
    });
  });

  it('should not execute immediately when immediate is false', () => {
    const asyncFn = jest.fn().mockResolvedValue({ id: 1 });
    renderHook(() => useAsync(asyncFn, false));

    expect(asyncFn).not.toHaveBeenCalled();
  });

  it('should pass arguments to async function', async () => {
    const asyncFn = jest.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(asyncFn));

    await act(async () => {
      await result.current[1].execute('arg1', 'arg2', 123);
    });

    expect(asyncFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });

  it('should return null on error', async () => {
    const asyncFn = jest.fn().mockRejectedValue(new Error('Test error'));
    const { result } = renderHook(() => useAsync(asyncFn));

    let executeResult: string | null = 'initial';
    await act(async () => {
      executeResult = await result.current[1].execute();
    });

    expect(executeResult).toBeNull();
  });
});

// ============================================
// useDebounce Tests
// ============================================
describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'changed', delay: 500 });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('changed');
  });

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'change1', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    rerender({ value: 'change2', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('change2');
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    );

    rerender({ value: 'changed', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('changed');
  });

  it('should cleanup timer on unmount', () => {
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'changed', delay: 500 });
    unmount();

    // Should not throw or have lingering timers
    expect(() => {
      act(() => {
        jest.runAllTimers();
      });
    }).not.toThrow();
  });
});

// ============================================
// useDebouncedCallback Tests
// ============================================
describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call callback after delay', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('arg1', 'arg2');
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should debounce multiple calls', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('call1');
      result.current('call2');
      result.current('call3');
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('call3');
  });

  it('should reset timer on subsequent calls', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('first');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    act(() => {
      result.current('second');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(callback).toHaveBeenCalledWith('second');
  });

  it('should pass all arguments to callback', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    act(() => {
      result.current(1, 'two', { three: true }, [4]);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledWith(1, 'two', { three: true }, [4]);
  });

  it('should update callback reference when dependencies change', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 100),
      { initialProps: { cb: callback1 } }
    );

    act(() => {
      result.current();
    });

    rerender({ cb: callback2 });

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});

// ============================================
// useThrottledCallback Tests
// ============================================
describe('useThrottledCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call callback immediately on first call', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 500));

    act(() => {
      result.current('arg');
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg');
  });

  it('should throttle subsequent calls', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 500));

    act(() => {
      result.current('first');
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      result.current('second');
      result.current('third');
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    act(() => {
      result.current('fourth');
    });
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('fourth');
  });

  it('should allow calls after throttle period expires', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 300));

    act(() => {
      result.current('first');
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    act(() => {
      result.current('second');
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should pass all arguments to callback', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 100));

    act(() => {
      result.current('arg1', 2, { key: 'value' });
    });

    expect(callback).toHaveBeenCalledWith('arg1', 2, { key: 'value' });
  });

  it('should handle rapid calls correctly', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 100));

    // First call executes immediately
    act(() => {
      result.current(1);
    });

    // These should be throttled
    for (let i = 2; i <= 10; i++) {
      act(() => {
        result.current(i);
      });
    }

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(1);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Next call executes
    act(() => {
      result.current(11);
    });
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(11);
  });
});

// ============================================
// useLocalStorage Tests
// ============================================
describe('useLocalStorage', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should initialize with stored value when available', () => {
    localStorageMock['testKey'] = JSON.stringify('stored');
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('updated'));
  });

  it('should handle complex objects', () => {
    const initialValue = { name: 'John', age: 30, nested: { key: 'value' } };
    const { result } = renderHook(() => useLocalStorage('testKey', initialValue));

    expect(result.current[0]).toEqual(initialValue);

    const newValue = { name: 'Jane', age: 25, nested: { key: 'other' } };
    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(newValue));
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(1));

    act(() => {
      result.current[1]((prev) => (prev || 0) + 5);
    });

    expect(result.current[0]).toBe(6);
  });

  it('should handle JSON parse errors gracefully', () => {
    localStorageMock['testKey'] = 'invalid json';
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));

    expect(result.current[0]).toBe('default');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should handle localStorage set errors gracefully', () => {
    (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    // Value should update in state even if localStorage fails
    expect(result.current[0]).toBe('updated');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should handle SSR (no window)', () => {
    const originalWindow = global.window;
    // @ts-expect-error: Testing SSR scenario
    global.window = undefined;

    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));
    expect(result.current[0]).toBe('default');

    global.window = originalWindow;
  });
});

// ============================================
// useMediaQuery Tests
// ============================================
describe('useMediaQuery', () => {
  let mediaQueryListMock: {
    matches: boolean;
    media: string;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };

  beforeEach(() => {
    mediaQueryListMock = {
      matches: false,
      media: '',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        ...mediaQueryListMock,
        media: query,
      })),
    });
  });

  it('should return initial match state', () => {
    mediaQueryListMock.matches = true;
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('should return false when query does not match', () => {
    mediaQueryListMock.matches = false;
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should add event listener on mount', () => {
    renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(mediaQueryListMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    unmount();
    expect(mediaQueryListMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update state when media query changes', () => {
    let changeHandler: ((e: { matches: boolean }) => void) | null = null;
    mediaQueryListMock.addEventListener = jest.fn((_, handler) => {
      changeHandler = handler;
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true });
      }
    });

    expect(result.current).toBe(true);
  });

  it('should handle SSR (no window)', () => {
    const originalWindow = global.window;
    // @ts-expect-error: Testing SSR scenario
    global.window = undefined;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    global.window = originalWindow;
  });

  it('should update when query changes', () => {
    const { rerender, result } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 768px)' } }
    );

    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');

    rerender({ query: '(min-width: 1024px)' });
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
  });
});

// ============================================
// useBreakpoints Tests
// ============================================
describe('useBreakpoints', () => {
  const setupMatchMedia = (matches: { [key: string]: boolean }) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: matches[query] || false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });
  };

  it('should detect mobile breakpoint', () => {
    setupMatchMedia({ '(max-width: 639px)': true });
    const { result } = renderHook(() => useBreakpoints());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouch).toBe(true);
  });

  it('should detect tablet breakpoint', () => {
    setupMatchMedia({
      '(min-width: 640px) and (max-width: 1023px)': true,
      '(min-width: 640px)': true,
    });
    const { result } = renderHook(() => useBreakpoints());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouch).toBe(true);
  });

  it('should detect desktop breakpoint', () => {
    setupMatchMedia({
      '(min-width: 1024px)': true,
      '(min-width: 1280px)': false,
    });
    const { result } = renderHook(() => useBreakpoints());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isLargeDesktop).toBe(false);
    expect(result.current.isTouch).toBe(false);
  });

  it('should detect large desktop breakpoint', () => {
    setupMatchMedia({
      '(min-width: 1024px)': true,
      '(min-width: 1280px)': true,
    });
    const { result } = renderHook(() => useBreakpoints());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isLargeDesktop).toBe(true);
  });

  it('should return memoized object', () => {
    setupMatchMedia({});
    const { result, rerender } = renderHook(() => useBreakpoints());

    const firstResult = result.current;
    rerender();
    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });
});

// ============================================
// useClickOutside Tests
// ============================================
describe('useClickOutside', () => {
  it('should return a ref', () => {
    const handler = jest.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(handler));
    expect(result.current).toHaveProperty('current');
  });

  it('should call handler when clicking outside', () => {
    const handler = jest.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(handler));

    // Create a container element
    const container = document.createElement('div');
    const outsideElement = document.createElement('button');
    document.body.appendChild(container);
    document.body.appendChild(outsideElement);

    // Assign ref manually
    result.current.current = container;

    // Simulate click outside
    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      outsideElement.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(container);
    document.body.removeChild(outsideElement);
  });

  it('should not call handler when clicking inside', () => {
    const handler = jest.fn();
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(handler));

    const container = document.createElement('div');
    const insideElement = document.createElement('button');
    container.appendChild(insideElement);
    document.body.appendChild(container);

    result.current.current = container;

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      insideElement.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(container);
  });

  it('should not call handler when ref is null', () => {
    const handler = jest.fn();
    renderHook(() => useClickOutside<HTMLDivElement>(handler));

    const element = document.createElement('button');
    document.body.appendChild(element);

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      element.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(element);
  });

  it('should remove event listener on unmount', () => {
    const handler = jest.fn();
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useClickOutside<HTMLDivElement>(handler));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });
});

// ============================================
// useKeyPress Tests
// ============================================
describe('useKeyPress', () => {
  it('should call callback when target key is pressed', () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress('Enter', callback));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      window.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback for different keys', () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress('Enter', callback));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should call preventDefault when option is set', () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress('Enter', callback, { preventDefault: true }));

    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not call preventDefault by default', () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress('Enter', callback));

    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should remove event listener on unmount', () => {
    const callback = jest.fn();
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyPress('Enter', callback));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });

  it('should update when targetKey changes', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ key }) => useKeyPress(key, callback),
      { initialProps: { key: 'Enter' } }
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(callback).not.toHaveBeenCalled();

    rerender({ key: 'Escape' });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

// ============================================
// usePagination Tests
// ============================================
describe('usePagination', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 10,
    }));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(10);
    expect(result.current.pageItems).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should calculate totalPages correctly', () => {
    const { result: r1 } = renderHook(() => usePagination({
      totalItems: 95,
      itemsPerPage: 10,
    }));
    expect(r1.current.totalPages).toBe(10);

    const { result: r2 } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 20,
    }));
    expect(r2.current.totalPages).toBe(5);
  });

  it('should initialize with custom initial page', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 10,
      initialPage: 5,
    }));

    expect(result.current.currentPage).toBe(5);
    expect(result.current.pageItems).toEqual([40, 41, 42, 43, 44, 45, 46, 47, 48, 49]);
  });

  it('should navigate to specific page', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 10,
    }));

    act(() => {
      result.current.goToPage(5);
    });

    expect(result.current.currentPage).toBe(5);
  });

  it('should clamp page to valid range', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 50,
      itemsPerPage: 10,
    }));

    act(() => {
      result.current.goToPage(-5);
    });
    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.goToPage(100);
    });
    expect(result.current.currentPage).toBe(5);
  });

  it('should navigate to next page', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 10,
      initialPage: 3,
    }));

    act(() => {
      result.current.goToNextPage();
    });

    expect(result.current.currentPage).toBe(4);
  });

  it('should not go past last page', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 30,
      itemsPerPage: 10,
      initialPage: 3,
    }));

    act(() => {
      result.current.goToNextPage();
    });

    expect(result.current.currentPage).toBe(3);
  });

  it('should navigate to previous page', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 10,
      initialPage: 5,
    }));

    act(() => {
      result.current.goToPreviousPage();
    });

    expect(result.current.currentPage).toBe(4);
  });

  it('should not go before first page', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 10,
    }));

    act(() => {
      result.current.goToPreviousPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should navigate to first page', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 10,
      initialPage: 8,
    }));

    act(() => {
      result.current.goToFirstPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should navigate to last page', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 100,
      itemsPerPage: 10,
    }));

    act(() => {
      result.current.goToLastPage();
    });

    expect(result.current.currentPage).toBe(10);
  });

  it('should update page items when current page changes', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 50,
      itemsPerPage: 10,
    }));

    expect(result.current.pageItems).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.pageItems).toEqual([20, 21, 22, 23, 24, 25, 26, 27, 28, 29]);
  });

  it('should handle last page with fewer items', () => {
    const { result } = renderHook(() => usePagination({
      totalItems: 25,
      itemsPerPage: 10,
    }));

    act(() => {
      result.current.goToLastPage();
    });

    expect(result.current.pageItems).toEqual([20, 21, 22, 23, 24]);
  });
});

// ============================================
// useFormField Tests
// ============================================
describe('useFormField', () => {
  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useFormField('initial'));

    expect(result.current[0]).toEqual({
      value: 'initial',
      error: null,
      touched: false,
    });
  });

  it('should update value', () => {
    const { result } = renderHook(() => useFormField(''));

    act(() => {
      result.current[1].setValue('new value');
    });

    expect(result.current[0].value).toBe('new value');
  });

  it('should validate on value change when validate function provided', () => {
    const validate = jest.fn((value: string) => value.length < 3 ? 'Too short' : null);
    const { result } = renderHook(() => useFormField('', validate));

    act(() => {
      result.current[1].setValue('ab');
    });

    expect(validate).toHaveBeenCalledWith('ab');
    expect(result.current[0].error).toBe('Too short');

    act(() => {
      result.current[1].setValue('valid');
    });

    expect(result.current[0].error).toBeNull();
  });

  it('should update touched state', () => {
    const { result } = renderHook(() => useFormField(''));

    act(() => {
      result.current[1].setTouched(true);
    });

    expect(result.current[0].touched).toBe(true);
  });

  it('should validate when touched and validate function provided', () => {
    const validate = jest.fn((value: string) => value === '' ? 'Required' : null);
    const { result } = renderHook(() => useFormField('', validate));

    act(() => {
      result.current[1].setTouched(true);
    });

    expect(validate).toHaveBeenCalledWith('');
    expect(result.current[0].error).toBe('Required');
  });

  it('should set error directly', () => {
    const { result } = renderHook(() => useFormField(''));

    act(() => {
      result.current[1].setError('Custom error');
    });

    expect(result.current[0].error).toBe('Custom error');

    act(() => {
      result.current[1].setError(null);
    });

    expect(result.current[0].error).toBeNull();
  });

  it('should reset to initial state', () => {
    const validate = jest.fn(() => null);
    const { result } = renderHook(() => useFormField('initial', validate));

    act(() => {
      result.current[1].setValue('changed');
      result.current[1].setTouched(true);
      result.current[1].setError('some error');
    });

    act(() => {
      result.current[1].reset();
    });

    expect(result.current[0]).toEqual({
      value: 'initial',
      error: null,
      touched: false,
    });
  });

  it('should handle complex types', () => {
    interface FormData {
      name: string;
      age: number;
    }

    const initialValue: FormData = { name: 'John', age: 30 };
    const { result } = renderHook(() => useFormField<FormData>(initialValue));

    act(() => {
      result.current[1].setValue({ name: 'Jane', age: 25 });
    });

    expect(result.current[0].value).toEqual({ name: 'Jane', age: 25 });
  });
});

// ============================================
// useInterval Tests
// ============================================
describe('useInterval', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call callback at interval', () => {
    const callback = jest.fn();
    renderHook(() => useInterval(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(2);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(callback).toHaveBeenCalledTimes(4);
  });

  it('should not set interval when delay is null', () => {
    const callback = jest.fn();
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    renderHook(() => useInterval(callback, null));

    expect(setIntervalSpy).not.toHaveBeenCalled();
    setIntervalSpy.mockRestore();
  });

  it('should clear interval on unmount', () => {
    const callback = jest.fn();
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useInterval(callback, 1000));
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('should update callback reference without resetting interval', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const { rerender } = renderHook(
      ({ cb }) => useInterval(cb, 1000),
      { initialProps: { cb: callback1 } }
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(callback1).toHaveBeenCalledTimes(1);

    rerender({ cb: callback2 });

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    // Second callback should be called, not the first
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should reset interval when delay changes', () => {
    const callback = jest.fn();
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 } }
    );

    rerender({ delay: 2000 });

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

// ============================================
// usePrevious Tests
// ============================================
describe('usePrevious', () => {
  it('should return undefined on first render', () => {
    const { result } = renderHook(() => usePrevious('initial'));
    expect(result.current).toBeUndefined();
  });

  it('should return previous value after update', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'first' } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 'second' });
    expect(result.current).toBe('first');

    rerender({ value: 'third' });
    expect(result.current).toBe('second');
  });

  it('should not update when value has not changed', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'same' } }
    );

    rerender({ value: 'same' });
    expect(result.current).toBeUndefined();

    rerender({ value: 'same' });
    expect(result.current).toBeUndefined();
  });

  it('should handle different types', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 1 });
    expect(result.current).toBe(0);

    rerender({ value: { key: 'value' } });
    expect(result.current).toBe(1);
  });

  it('should handle object references correctly', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };

    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: obj1 } }
    );

    rerender({ value: obj2 });
    expect(result.current).toBe(obj1);

    // Same reference should not trigger update
    rerender({ value: obj2 });
    expect(result.current).toBe(obj1);
  });
});

// ============================================
// useDocumentTitle Tests
// ============================================
describe('useDocumentTitle', () => {
  const originalTitle = 'Original Title';

  beforeEach(() => {
    document.title = originalTitle;
  });

  it('should update document title', () => {
    renderHook(() => useDocumentTitle('New Title'));
    expect(document.title).toBe('New Title');
  });

  it('should restore original title on unmount', () => {
    const { unmount } = renderHook(() => useDocumentTitle('New Title'));
    expect(document.title).toBe('New Title');

    unmount();
    expect(document.title).toBe(originalTitle);
  });

  it('should update title when it changes', () => {
    const { rerender } = renderHook(
      ({ title }) => useDocumentTitle(title),
      { initialProps: { title: 'First Title' } }
    );

    expect(document.title).toBe('First Title');

    rerender({ title: 'Second Title' });
    expect(document.title).toBe('Second Title');
  });

  it('should restore the most recent previous title on unmount', () => {
    const { rerender, unmount } = renderHook(
      ({ title }) => useDocumentTitle(title),
      { initialProps: { title: 'Title 1' } }
    );

    rerender({ title: 'Title 2' });
    rerender({ title: 'Title 3' });

    unmount();
    expect(document.title).toBe(originalTitle);
  });
});
