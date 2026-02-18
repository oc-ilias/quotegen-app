/**
 * useThrottledCallback Hook
 * Returns a throttled version of a callback function
 * @module hooks/useThrottledCallback
 */

import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook that returns a throttled version of a callback function.
 * The throttled function will only execute at most once per specified period.
 *
 * @template T - The type of the callback function
 * @param callback - The function to throttle
 * @param delay - The minimum time between calls in milliseconds
 * @returns The throttled callback function
 *
 * @example
 * ```tsx
 * const handleScroll = useThrottledCallback((e) => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 100);
 * window.addEventListener('scroll', handleScroll);
 * ```
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastCallTimeRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  // Keep the callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      // If delay is 0, always execute immediately
      if (delay === 0) {
        callbackRef.current(...args);
        return;
      }

      // If this is the first call or enough time has passed, execute
      if (lastCallTimeRef.current === null || now - lastCallTimeRef.current >= delay) {
        lastCallTimeRef.current = now;
        callbackRef.current(...args);
      }
      // If within throttle period, the call is dropped (throttling behavior)
    },
    [delay]
  );
}

export default useThrottledCallback;
