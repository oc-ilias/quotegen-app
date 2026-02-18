/**
 * useInterval Hook
 * Calls a callback at a specified interval
 * @module hooks/useInterval
 */

import { useRef, useEffect } from 'react';

/**
 * Hook that calls a callback at a specified interval.
 * Properly handles cleanup and dynamic delay changes.
 *
 * @param callback - Function to call on each interval
 * @param delay - Interval in milliseconds (null to pause)
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * useInterval(() => setCount(c => c + 1), 1000);
 * // count increments every second
 * ```
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const callbackRef = useRef(callback);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (delay === null) {
      return;
    }

    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, delay);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [delay]);
}

export default useInterval;
