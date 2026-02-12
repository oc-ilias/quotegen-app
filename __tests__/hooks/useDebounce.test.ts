import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks';

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

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    expect(result.current).toBe('initial');
    
    rerender({ value: 'updated', delay: 500 });
    
    // Value should not update immediately
    expect(result.current).toBe('initial');
    
    // Fast-forward past the delay
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe('updated');
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
    
    // Value should not have updated yet
    expect(result.current).toBe('initial');
    
    // Another change should reset the timer
    rerender({ value: 'change2', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Still should not have updated
    expect(result.current).toBe('initial');
    
    // Complete the full delay
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Now it should update to the latest value
    expect(result.current).toBe('change2');
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );
    
    rerender({ value: 'updated', delay: 0 });
    
    // With 0 delay, it should update on next tick
    act(() => {
      jest.advanceTimersByTime(0);
    });
    
    expect(result.current).toBe('updated');
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    rerender({ value: 'updated', delay: 500 });
    
    // Change the delay
    rerender({ value: 'updated', delay: 1000 });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Should not have updated yet because delay changed
    expect(result.current).toBe('initial');
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Now it should have updated
    expect(result.current).toBe('updated');
  });

  it('should handle object values', () => {
    const initialObj = { key: 'value1' };
    const updatedObj = { key: 'value2' };
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 300 } }
    );
    
    expect(result.current).toBe(initialObj);
    
    rerender({ value: updatedObj, delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(result.current).toBe(updatedObj);
  });

  it('should handle number values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 200 } }
    );
    
    rerender({ value: 42, delay: 200 });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    expect(result.current).toBe(42);
  });

  it('should handle boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: false, delay: 200 } }
    );
    
    rerender({ value: true, delay: 200 });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    expect(result.current).toBe(true);
  });

  it('should handle array values', () => {
    const initialArray = [1, 2, 3];
    const updatedArray = [4, 5, 6];
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialArray, delay: 200 } }
    );
    
    rerender({ value: updatedArray, delay: 200 });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    expect(result.current).toEqual(updatedArray);
  });

  it('should handle null values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 200 } }
    );
    
    rerender({ value: null, delay: 200 });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    expect(result.current).toBeNull();
  });

  it('should handle undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 200 } }
    );
    
    rerender({ value: undefined, delay: 200 });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    expect(result.current).toBeUndefined();
  });

  it('should cleanup timeout on unmount', () => {
    const { rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    rerender({ value: 'updated', delay: 500 });
    
    unmount();
    
    // Should not throw when timer fires after unmount
    act(() => {
      jest.advanceTimersByTime(500);
    });
  });

  it('should cleanup previous timeout when value changes', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const { rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    // Change value multiple times rapidly
    rerender({ value: 'change1', delay: 500 });
    rerender({ value: 'change2', delay: 500 });
    rerender({ value: 'change3', delay: 500 });
    
    // clearTimeout should have been called for each change except the first
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });
});
