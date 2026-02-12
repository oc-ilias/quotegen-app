import { renderHook, act } from '@testing-library/react';
import { useThrottledCallback } from '@/hooks';

describe('useThrottledCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call callback immediately on first invocation', () => {
    const callback = jest.fn();
    
    const { result } = renderHook(() => useThrottledCallback(callback, 1000));
    
    act(() => {
      result.current();
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to callback', () => {
    const callback = jest.fn();
    
    const { result } = renderHook(() => useThrottledCallback(callback, 1000));
    
    act(() => {
      result.current('arg1', 42, { key: 'value' });
    });
    
    expect(callback).toHaveBeenCalledWith('arg1', 42, { key: 'value' });
  });

  it('should throttle subsequent calls within delay period', () => {
    const callback = jest.fn();
    
    const { result } = renderHook(() => useThrottledCallback(callback, 1000));
    
    act(() => {
      result.current();
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Call again immediately - should be throttled
    act(() => {
      result.current();
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Advance time but not enough
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    act(() => {
      result.current();
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should allow callback after throttle delay', () => {
    const callback = jest.fn();
    
    const { result } = renderHook(() => useThrottledCallback(callback, 1000));
    
    act(() => {
      result.current();
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Advance past the delay
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    act(() => {
      result.current();
    });
    
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple throttle periods correctly', () => {
    const callback = jest.fn();
    
    const { result } = renderHook(() => useThrottledCallback(callback, 1000));
    
    // First call - executes
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Wait and call again - executes
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(2);
    
    // Call immediately - throttled
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(2);
    
    // Wait and call again - executes
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should use latest callback reference', () => {
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();
    
    const { result, rerender } = renderHook(
      ({ cb }) => useThrottledCallback(cb, 1000),
      { initialProps: { cb: firstCallback } }
    );
    
    act(() => {
      result.current();
    });
    
    expect(firstCallback).toHaveBeenCalledTimes(1);
    
    // Change callback
    rerender({ cb: secondCallback });
    
    // Wait for throttle to clear
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    act(() => {
      result.current();
    });
    
    // Should use the new callback
    expect(secondCallback).toHaveBeenCalledTimes(1);
    expect(firstCallback).toHaveBeenCalledTimes(1);
  });

  it('should maintain stable function reference', () => {
    const callback = jest.fn();
    
    const { result, rerender } = renderHook(() => useThrottledCallback(callback, 1000));
    
    const firstReference = result.current;
    
    rerender();
    
    expect(result.current).toBe(firstReference);
  });

  it('should handle zero delay', () => {
    const callback = jest.fn();
    
    const { result } = renderHook(() => useThrottledCallback(callback, 0));
    
    act(() => {
      result.current();
      result.current();
      result.current();
    });
    
    // With 0 delay, all calls should execute
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should handle very short delay', () => {
    const callback = jest.fn();
    
    const { result } = renderHook(() => useThrottledCallback(callback, 1));
    
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Immediate next call should be throttled
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);
    
    // After 1ms, should execute
    act(() => {
      jest.advanceTimersByTime(1);
    });
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should preserve this context through callback ref', () => {
    const mockObject = {
      value: 42,
      method: jest.fn(function(this: typeof mockObject) {
        return this.value;
      })
    };
    
    const { result } = renderHook(() => useThrottledCallback(mockObject.method, 1000));
    
    act(() => {
      result.current();
    });
    
    expect(mockObject.method).toHaveBeenCalled();
  });

  it('should handle callback that throws', () => {
    const throwingCallback = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    
    const { result } = renderHook(() => useThrottledCallback(throwingCallback, 1000));
    
    expect(() => {
      act(() => {
        result.current();
      });
    }).toThrow('Test error');
    
    // Should still throttle even if callback throws
    act(() => {
      result.current();
    });
    
    expect(throwingCallback).toHaveBeenCalledTimes(1);
  });

  it('should handle rapid successive calls with different arguments', () => {
    const callback = jest.fn();
    
    const { result } = renderHook(() => useThrottledCallback(callback, 1000));
    
    act(() => {
      result.current('first');
      result.current('second');
      result.current('third');
    });
    
    // Only first call should execute
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');
    
    // After delay
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    act(() => {
      result.current('fourth');
    });
    
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('fourth');
  });

  it('should not be affected by re-renders with same delay', () => {
    const callback = jest.fn();
    
    const { result, rerender } = renderHook(
      ({ delay }) => useThrottledCallback(callback, delay),
      { initialProps: { delay: 1000 } }
    );
    
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Re-render with same delay should not reset throttle
    rerender({ delay: 1000 });
    
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
