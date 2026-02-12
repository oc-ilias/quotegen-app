import { useState, useEffect } from 'react';

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
