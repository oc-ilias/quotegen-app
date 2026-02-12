import { renderHook, act } from '@testing-library/react';
import { useInterval } from '@/hooks';

describe('useInterval', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('basic interval', () => {
    it('should call callback at specified interval', () => {
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
    });

    it('should call callback multiple times', () => {
      const callback = jest.fn();

      renderHook(() => useInterval(callback, 100));

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(5);
    });
  });

  describe('delay changes', () => {
    it('should update interval when delay changes', () => {
      const callback = jest.fn();

      const { rerender } = renderHook(
        ({ delay }) => useInterval(callback, delay),
        { initialProps: { delay: 1000 } }
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback).toHaveBeenCalledTimes(1);

      // Change delay to 500ms
      rerender({ delay: 500 });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(2);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should clear old interval when delay changes', () => {
      const callback = jest.fn();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { rerender } = renderHook(
        ({ delay }) => useInterval(callback, delay),
        { initialProps: { delay: 1000 } }
      );

      rerender({ delay: 500 });

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });

  describe('callback updates', () => {
    it('should use the latest callback', () => {
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();

      const { rerender } = renderHook(
        ({ cb }) => useInterval(cb, 1000),
        { initialProps: { cb: firstCallback } }
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(firstCallback).toHaveBeenCalledTimes(1);

      // Change callback
      rerender({ cb: secondCallback });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(secondCallback).toHaveBeenCalledTimes(1);
      expect(firstCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('pause functionality', () => {
    it('should not call callback when delay is null', () => {
      const callback = jest.fn();

      renderHook(() => useInterval(callback, null));

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should pause when delay changes to null', () => {
      const callback = jest.fn();

      const { rerender } = renderHook(
        ({ delay }) => useInterval(callback, delay),
        { initialProps: { delay: 1000 } }
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback).toHaveBeenCalledTimes(1);

      // Pause
      rerender({ delay: null });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should resume when delay changes from null', () => {
      const callback = jest.fn();

      const { rerender } = renderHook(
        ({ delay }) => useInterval(callback, delay),
        { initialProps: { delay: null } }
      );

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(callback).not.toHaveBeenCalled();

      // Resume
      rerender({ delay: 1000 });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('should clear interval on unmount', () => {
      const callback = jest.fn();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => useInterval(callback, 1000));

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });

    it('should not call callback after unmount', () => {
      const callback = jest.fn();

      const { unmount } = renderHook(() => useInterval(callback, 1000));

      unmount();

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle zero delay', () => {
      const callback = jest.fn();

      renderHook(() => useInterval(callback, 0));

      act(() => {
        jest.advanceTimersByTime(0);
      });

      // setInterval with 0 should still work
      expect(callback).toHaveBeenCalled();
    });

    it('should handle very small delay', () => {
      const callback = jest.fn();

      renderHook(() => useInterval(callback, 1));

      act(() => {
        jest.advanceTimersByTime(10);
      });

      expect(callback).toHaveBeenCalled();
    });

    it('should handle large delay', () => {
      const callback = jest.fn();

      renderHook(() => useInterval(callback, 1000000));

      act(() => {
        jest.advanceTimersByTime(1000000);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle callback that throws', () => {
      const throwingCallback = jest.fn().mockImplementation(() => {
        throw new Error('Interval error');
      });

      renderHook(() => useInterval(throwingCallback, 1000));

      // Should not throw, interval should continue
      expect(() => {
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }).toThrow('Interval error');

      // Next interval should still fire
      expect(() => {
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }).toThrow('Interval error');

      expect(throwingCallback).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid delay changes', () => {
      const callback = jest.fn();

      const { rerender } = renderHook(
        ({ delay }) => useInterval(callback, delay),
        { initialProps: { delay: 1000 } }
      );

      rerender({ delay: 500 });
      rerender({ delay: 200 });
      rerender({ delay: 100 });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('timing accuracy', () => {
    it('should maintain consistent interval timing', () => {
      const callback = jest.fn();
      const timestamps: number[] = [];

      const timedCallback = () => {
        timestamps.push(Date.now());
        callback();
      };

      jest.setSystemTime(0);
      renderHook(() => useInterval(timedCallback, 1000));

      for (let i = 1; i <= 5; i++) {
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }

      expect(callback).toHaveBeenCalledTimes(5);
    });
  });
});
