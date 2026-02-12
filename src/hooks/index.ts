import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ============================================================================
// Hook 1: useAsync - Handle async operations with loading/error states
// ============================================================================

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: unknown[]) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for handling async operations with loading and error states.
 * Automatically manages loading state and error handling.
 *
 * @template T - The type of data returned by the async function
 * @param asyncFunction - The async function to execute
 * @param immediate - Whether to execute immediately on mount
 * @returns Object containing data, loading state, error, execute function, and reset function
 *
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useAsync(fetchUserData);
 * // Later: execute(userId);
 * ```
 */
export function useAsync<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  immediate: boolean = false
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: unknown[]): Promise<void> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await asyncFunction(...args);
        if (isMounted.current) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (isMounted.current) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { ...state, execute, reset };
}

// ============================================================================
// Hook 2: useDebounce - Debounce values/changes
// ============================================================================

/**
 * Hook that debounces a value.
 * Useful for search inputs or any scenario where you want to wait
 * for a pause in changes before acting on a value.
 *
 * @template T - The type of value to debounce
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * // debouncedSearch updates only after 500ms of no changes
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Hook 3: useThrottledCallback - Throttle function calls
// ============================================================================

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
  const lastCall = useRef<number>(0);
  const callbackRef = useRef(callback);

  // Keep the callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callbackRef.current(...args);
      }
    },
    [delay]
  );
}

// ============================================================================
// Hook 4: useLocalStorage - Sync state with localStorage
// ============================================================================

/**
 * Hook that syncs state with localStorage.
 * Automatically handles JSON serialization/deserialization and errors.
 *
 * @template T - The type of the stored value
 * @param key - The localStorage key
 * @param initialValue - The initial value if none exists in localStorage
 * @returns A tuple of [storedValue, setValue] similar to useState
 *
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 * // Changes to theme are automatically saved to localStorage
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

// ============================================================================
// Hook 5: useMediaQuery - Respond to CSS media queries
// ============================================================================

/**
 * Hook that returns whether a media query matches.
 * Useful for responsive design in JavaScript.
 *
 * @param query - The CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * return isMobile ? <MobileView /> : <DesktopView />;
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent | MediaQueryList) => {
      setMatches(event.matches);
    };

    // Set initial value
    handler(mediaQuery);

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Legacy support
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

// ============================================================================
// Hook 6: useBreakpoints - Hook for responsive breakpoints
// ============================================================================

export interface Breakpoints {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
}

export interface BreakpointValues {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const DEFAULT_BREAKPOINTS: BreakpointValues = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * Hook that provides responsive breakpoint detection.
 * Returns an object with boolean flags for each breakpoint.
 *
 * @param customBreakpoints - Optional custom breakpoint values
 * @returns Object with boolean flags for each breakpoint
 *
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop, isWide } = useBreakpoints();
 * // or with custom breakpoints
 * const bp = useBreakpoints({ sm: 600, md: 900, lg: 1200, xl: 1600 });
 * ```
 */
export function useBreakpoints(customBreakpoints?: Partial<BreakpointValues>): Breakpoints {
  const breakpoints = useMemo(
    () => ({ ...DEFAULT_BREAKPOINTS, ...customBreakpoints }),
    [customBreakpoints]
  );

  // xs: 0 to sm-1 (no min-width needed, just max-width)
  const isXs = useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`);
  
  // sm: sm to md-1
  const isSm = useMediaQuery(
    `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`
  );
  
  // md: md to lg-1
  const isMd = useMediaQuery(
    `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`
  );
  
  // lg: lg to xl-1
  const isLg = useMediaQuery(
    `(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`
  );
  
  // xl: xl and up (no max-width needed, just min-width)
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);

  return {
    xs: isXs,
    sm: isSm,
    md: isMd,
    lg: isLg,
    xl: isXl,
  };
}

// ============================================================================
// Hook 7: useClickOutside - Detect clicks outside an element
// ============================================================================

/**
 * Hook that detects clicks outside a specified element.
 * Useful for dropdowns, modals, and popovers.
 *
 * @param onClickOutside - Callback function when click outside occurs
 * @returns Ref to attach to the element
 *
 * @example
 * ```tsx
 * const ref = useClickOutside(() => setIsOpen(false));
 * return (
 *   <div ref={ref}>
 *     <DropdownMenu />
 *   </div>
 * );
 * ```
 */
export function useClickOutside<T extends HTMLElement>(
  onClickOutside: () => void
): React.RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onClickOutside]);

  return ref;
}

// ============================================================================
// Hook 8: useKeyPress - Listen for keyboard events
// ============================================================================

/**
 * Hook that listens for keyboard events.
 * Supports single keys or combinations with modifiers.
 *
 * @param targetKey - The key to listen for (e.g., 'Escape', 'Enter', 'a')
 * @param callback - Function to call when the key is pressed
 * @param options - Optional configuration
 *
 * @example
 * ```tsx
 * // Simple usage
 * useKeyPress('Escape', () => setIsOpen(false));
 *
 * // With modifiers
 * useKeyPress('k', () => openSearch(), { ctrl: true });
 * ```
 */
export function useKeyPress(
  targetKey: string,
  callback: () => void,
  options?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    preventDefault?: boolean;
  }
): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrl = false, shift = false, alt = false, meta = false, preventDefault = false } = options || {};

      const matchesKey = event.key === targetKey || event.code === targetKey;
      const matchesCtrl = event.ctrlKey === ctrl;
      const matchesShift = event.shiftKey === shift;
      const matchesAlt = event.altKey === alt;
      const matchesMeta = event.metaKey === meta;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
        if (preventDefault) {
          event.preventDefault();
        }
        callbackRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [targetKey, options]);
}

// ============================================================================
// Hook 9: usePagination - Pagination logic
// ============================================================================

export interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
  maxPageButtons?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNumbers: number[];
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

/**
 * Hook that provides pagination logic and state management.
 *
 * @param options - Pagination configuration options
 * @returns Object containing pagination state and navigation functions
 *
 * @example
 * ```tsx
 * const pagination = usePagination({ totalItems: 100, itemsPerPage: 10 });
 * // Use pagination.currentPage, pagination.goToNextPage(), etc.
 * ```
 */
export function usePagination(options: UsePaginationOptions): UsePaginationReturn {
  const { totalItems, itemsPerPage, initialPage = 1, maxPageButtons = 5 } = options;

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const [currentPage, setCurrentPage] = useState(() =>
    Math.min(Math.max(1, initialPage), totalPages)
  );

  // Ensure current page stays valid when total items changes
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pageStart = (currentPage - 1) * itemsPerPage;
  const pageEnd = Math.min(pageStart + itemsPerPage, totalItems);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // Calculate visible page numbers
  const pageNumbers = useMemo(() => {
    let start = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    const end = Math.min(totalPages, start + maxPageButtons - 1);

    if (end - start + 1 < maxPageButtons) {
      start = Math.max(1, end - maxPageButtons + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages, maxPageButtons]);

  return {
    currentPage,
    totalPages,
    pageStart,
    pageEnd,
    hasNextPage,
    hasPreviousPage,
    pageNumbers,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
  };
}

// ============================================================================
// Hook 10: useFormField - Form field state management
// ============================================================================

export interface UseFormFieldOptions<T> {
  initialValue: T;
  validate?: (value: T) => string | null;
  required?: boolean;
}

export interface UseFormFieldReturn<T> {
  value: T;
  setValue: (value: T) => void;
  error: string | null;
  touched: boolean;
  isValid: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: () => void;
  reset: () => void;
  validate: () => boolean;
}

/**
 * Hook for managing form field state with validation.
 *
 * @template T - The type of the field value
 * @param options - Form field configuration
 * @returns Object containing field state and handlers
 *
 * @example
 * ```tsx
 * const email = useFormField({
 *   initialValue: '',
 *   validate: (v) => v.includes('@') ? null : 'Invalid email'
 * });
 * // Use email.value, email.onChange, email.error, etc.
 * ```
 */
export function useFormField<T extends string | number | boolean | string[]>(
  options: UseFormFieldOptions<T>
): UseFormFieldReturn<T> {
  const { initialValue, validate, required = false } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validateField = useCallback(
    (val: T): boolean => {
      if (required && (val === '' || val === 0 || (Array.isArray(val) && val.length === 0))) {
        setError('This field is required');
        return false;
      }

      if (validate) {
        const validationError = validate(val);
        setError(validationError);
        return validationError === null;
      }

      setError(null);
      return true;
    },
    [required, validate]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const newValue = e.target.value as T;
      setValue(newValue);
      if (touched) {
        validateField(newValue);
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    validateField(value);
  }, [value, validateField]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    setValue,
    error,
    touched,
    isValid: error === null,
    onChange: handleChange,
    onBlur: handleBlur,
    reset,
    validate: () => validateField(value),
  };
}

// ============================================================================
// Hook 11: useInterval - setInterval hook
// ============================================================================

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

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const intervalId = setInterval(() => {
      callbackRef.current();
    }, delay);

    return () => clearInterval(intervalId);
  }, [delay]);
}

// ============================================================================
// Hook 12: usePrevious - Track previous values
// ============================================================================

/**
 * Hook that returns the previous value of a state or prop.
 * Useful for comparing current and previous values.
 *
 * @template T - The type of value to track
 * @param value - The current value
 * @returns The previous value (undefined on first render)
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 * // prevCount contains the value from the previous render
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const [current, setCurrent] = useState<T>(value);
  const [previous, setPrevious] = useState<T | undefined>(undefined);

  useEffect(() => {
    if (value !== current) {
      setPrevious(current);
      setCurrent(value);
    }
  }, [value, current]);

  return previous;
}

// ============================================================================
// Hook 13: useDocumentTitle - Update document title
// ============================================================================

/**
 * Hook that updates the document title.
 * Automatically restores the previous title on unmount.
 *
 * @param title - The new document title
 * @param options - Optional configuration
 *
 * @example
 * ```tsx
 * useDocumentTitle('Home - My App');
 * // or with suffix
 * useDocumentTitle('Dashboard', { suffix: ' | My App' });
 * ```
 */
export function useDocumentTitle(
  title: string,
  options?: {
    suffix?: string;
    restoreOnUnmount?: boolean;
  }
): void {
  const { suffix = '', restoreOnUnmount = true } = options || {};
  const previousTitle = useRef<string>(document.title);

  useEffect(() => {
    const fullTitle = suffix ? `${title}${suffix}` : title;
    document.title = fullTitle;

    return () => {
      if (restoreOnUnmount) {
        document.title = previousTitle.current;
      }
    };
  }, [title, suffix, restoreOnUnmount]);
}
