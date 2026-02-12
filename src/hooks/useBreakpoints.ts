import { useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';

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
