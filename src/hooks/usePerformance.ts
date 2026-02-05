/**
 * Performance Hooks
 * Custom React hooks for optimizing component performance
 * @module hooks/usePerformance
 */

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ============================================================================
// Debounce Hook
// ============================================================================

interface UseDebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export function useDebounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number,
  options: UseDebounceOptions = {}
): (...args: Parameters<T>) => void {
  const { leading = false, trailing = true, maxWait } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const leadingExecutedRef = useRef(false);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      lastArgsRef.current = args;
      const now = Date.now();
      const shouldCallLeading = leading && !timeoutRef.current && !leadingExecutedRef.current;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Execute leading edge
      if (shouldCallLeading) {
        leadingExecutedRef.current = true;
        callback(...args);
        lastCallTimeRef.current = now;
      }

      // Setup maxWait timeout
      if (maxWait && !maxTimeoutRef.current) {
        const timeSinceLastCall = now - lastCallTimeRef.current;
        const timeToMaxWait = Math.max(0, maxWait - timeSinceLastCall);

        maxTimeoutRef.current = setTimeout(() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (trailing && lastArgsRef.current) {
            callback(...lastArgsRef.current);
            lastCallTimeRef.current = Date.now();
          }
          maxTimeoutRef.current = null;
          leadingExecutedRef.current = false;
        }, timeToMaxWait);
      }

      // Setup trailing timeout
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          if (maxTimeoutRef.current) {
            clearTimeout(maxTimeoutRef.current);
            maxTimeoutRef.current = null;
          }
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current);
            lastCallTimeRef.current = Date.now();
          }
          timeoutRef.current = null;
          leadingExecutedRef.current = false;
        }, delay);
      }
    },
    [callback, delay, leading, trailing, maxWait]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);

  return debouncedFunction;
}

// ============================================================================
// Throttle Hook
// ============================================================================

interface UseThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function useThrottle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  limit: number,
  options: UseThrottleOptions = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = false } = options;
  const lastCallTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calledLeadingRef = useRef(false);

  const throttledFunction = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;
      lastArgsRef.current = args;

      const execute = () => {
        if (lastArgsRef.current) {
          callback(...lastArgsRef.current);
          lastCallTimeRef.current = Date.now();
          calledLeadingRef.current = false;
        }
      };

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (timeSinceLastCall >= limit) {
        if (leading && !calledLeadingRef.current) {
          execute();
          calledLeadingRef.current = true;
        } else if (trailing) {
          execute();
        } else {
          lastCallTimeRef.current = now;
        }
      } else if (trailing) {
        const remainingTime = limit - timeSinceLastCall;
        timeoutRef.current = setTimeout(() => {
          if (leading && !calledLeadingRef.current) {
            execute();
          } else if (!leading) {
            execute();
          }
          timeoutRef.current = null;
        }, remainingTime);
      }
    },
    [callback, limit, leading, trailing]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledFunction;
}

// ============================================================================
// Intersection Observer Hook
// ============================================================================

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseIntersectionObserverReturn<T extends Element = Element> {
  ref: React.RefObject<T | null>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

export function useIntersectionObserver<T extends Element = Element>(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn<T> {
  const { threshold = 0, root = null, rootMargin = '0px', triggerOnce = false } = options;
  const ref = useRef<T>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredRef = useRef(false);

  const isIntersecting = entry?.isIntersecting ?? false;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Don't re-observe if triggerOnce is true and element has already intersected
    if (triggerOnce && hasTriggeredRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([observedEntry]) => {
        setEntry(observedEntry);

        if (triggerOnce && observedEntry.isIntersecting) {
          hasTriggeredRef.current = true;
          observerRef.current?.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce]);

  return { ref, isIntersecting, entry };
}

// ============================================================================
// Memoized Callback Hook
// ============================================================================

export function useMemoizedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => callbackRef.current(...args),
    deps
  ) as T;
}

// ============================================================================
// RAF (Request Animation Frame) Hook
// ============================================================================

export function useRaf(callback: (deltaTime: number) => void, isActive: boolean = true): void {
  const callbackRef = useRef(callback);
  const rafRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number>(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isActive) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = timestamp - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = timestamp;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive]);
}

// ============================================================================
// Idle Callback Hook
// ============================================================================

export function useIdleCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  deps: React.DependencyList
): void {
  const callbackRef = useRef(callback);
  const idRef = useRef<ReturnType<typeof requestIdleCallback> | number | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const runCallback = () => {
      callbackRef.current();
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idRef.current = requestIdleCallback(runCallback);
    } else {
      // Fallback to setTimeout with 1ms delay
      idRef.current = setTimeout(runCallback, 1);
    }

    return () => {
      if (idRef.current) {
        if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
          cancelIdleCallback(idRef.current as ReturnType<typeof requestIdleCallback>);
        } else {
          clearTimeout(idRef.current);
        }
      }
    };
  }, deps);
}

// ============================================================================
// Visibility Change Hook
// ============================================================================

export function useVisibilityChange(callback: (isVisible: boolean) => void): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      callbackRef.current(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

// ============================================================================
// Performance Measurement Hook
// ============================================================================

interface UsePerformanceMeasureOptions {
  markName: string;
  measureName?: string;
}

export function usePerformanceMeasure({
  markName,
  measureName,
}: UsePerformanceMeasureOptions): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const startMark = `${markName}_start`;
    const endMark = `${markName}_end`;
    const finalMeasureName = measureName || `${markName}_measure`;

    performance.mark(startMark);

    return () => {
      performance.mark(endMark);
      performance.measure(finalMeasureName, startMark, endMark);

      // Cleanup marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
    };
  }, [markName, measureName]);
}

// ============================================================================
// Window Size Hook (throttled)
// ============================================================================

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(throttleMs: number = 200): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const throttledSetSize = useThrottle(() => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, throttleMs);

  useEffect(() => {
    window.addEventListener('resize', throttledSetSize);
    return () => window.removeEventListener('resize', throttledSetSize);
  }, [throttledSetSize]);

  return size;
}

// ============================================================================
// Scroll Position Hook (throttled)
// ============================================================================

interface ScrollPosition {
  x: number;
  y: number;
}

export function useScrollPosition(throttleMs: number = 100): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  const throttledSetPosition = useThrottle(() => {
    setPosition({
      x: window.scrollX,
      y: window.scrollY,
    });
  }, throttleMs);

  useEffect(() => {
    window.addEventListener('scroll', throttledSetPosition, { passive: true });
    return () => window.removeEventListener('scroll', throttledSetPosition);
  }, [throttledSetPosition]);

  return position;
}

// ============================================================================
// Network Status Hook
// ============================================================================

export function useNetworkStatus(): {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} {
  const [status, setStatus] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  useEffect(() => {
    const updateStatus = () => {
      const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
      setStatus({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
      });
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    connection?.addEventListener('change', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      connection?.removeEventListener('change', updateStatus);
    };
  }, []);

  return status;
}

export default {
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useMemoizedCallback,
  useRaf,
  useIdleCallback,
  useVisibilityChange,
  usePerformanceMeasure,
  useWindowSize,
  useScrollPosition,
  useNetworkStatus,
};
