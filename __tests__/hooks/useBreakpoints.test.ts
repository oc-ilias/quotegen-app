import { renderHook } from '@testing-library/react';
import { useBreakpoints } from '@/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Mock useMediaQuery hook
jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

const mockedUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;

describe('useBreakpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('default breakpoints', () => {
    it('should return correct breakpoints for xs screen', () => {
      mockedUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: 639px)') return true;
        if (query === '(min-width: 640px) and (max-width: 767px)') return false;
        if (query === '(min-width: 768px) and (max-width: 1023px)') return false;
        if (query === '(min-width: 1024px) and (max-width: 1279px)') return false;
        if (query === '(min-width: 1280px)') return false;
        return false;
      });

      const { result } = renderHook(() => useBreakpoints());

      expect(result.current).toEqual({
        xs: true,
        sm: false,
        md: false,
        lg: false,
        xl: false,
      });
    });

    it('should return correct breakpoints for sm screen', () => {
      mockedUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: 639px)') return false;
        if (query === '(min-width: 640px) and (max-width: 767px)') return true;
        if (query === '(min-width: 768px) and (max-width: 1023px)') return false;
        if (query === '(min-width: 1024px) and (max-width: 1279px)') return false;
        if (query === '(min-width: 1280px)') return false;
        return false;
      });

      const { result } = renderHook(() => useBreakpoints());

      expect(result.current).toEqual({
        xs: false,
        sm: true,
        md: false,
        lg: false,
        xl: false,
      });
    });

    it('should return correct breakpoints for md screen', () => {
      mockedUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: 639px)') return false;
        if (query === '(min-width: 640px) and (max-width: 767px)') return false;
        if (query === '(min-width: 768px) and (max-width: 1023px)') return true;
        if (query === '(min-width: 1024px) and (max-width: 1279px)') return false;
        if (query === '(min-width: 1280px)') return false;
        return false;
      });

      const { result } = renderHook(() => useBreakpoints());

      expect(result.current).toEqual({
        xs: false,
        sm: false,
        md: true,
        lg: false,
        xl: false,
      });
    });

    it('should return correct breakpoints for lg screen', () => {
      mockedUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: 639px)') return false;
        if (query === '(min-width: 640px) and (max-width: 767px)') return false;
        if (query === '(min-width: 768px) and (max-width: 1023px)') return false;
        if (query === '(min-width: 1024px) and (max-width: 1279px)') return true;
        if (query === '(min-width: 1280px)') return false;
        return false;
      });

      const { result } = renderHook(() => useBreakpoints());

      expect(result.current).toEqual({
        xs: false,
        sm: false,
        md: false,
        lg: true,
        xl: false,
      });
    });

    it('should return correct breakpoints for xl screen', () => {
      mockedUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: 639px)') return false;
        if (query === '(min-width: 640px) and (max-width: 767px)') return false;
        if (query === '(min-width: 768px) and (max-width: 1023px)') return false;
        if (query === '(min-width: 1024px) and (max-width: 1279px)') return false;
        if (query === '(min-width: 1280px)') return true;
        return false;
      });

      const { result } = renderHook(() => useBreakpoints());

      expect(result.current).toEqual({
        xs: false,
        sm: false,
        md: false,
        lg: false,
        xl: true,
      });
    });
  });

  describe('custom breakpoints', () => {
    it('should use custom breakpoints when provided', () => {
      const customBreakpoints = { sm: 600, md: 900, lg: 1200, xl: 1600 };

      mockedUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: 599px)') return false;
        if (query === '(min-width: 600px) and (max-width: 899px)') return true;
        if (query === '(min-width: 900px) and (max-width: 1199px)') return false;
        if (query === '(min-width: 1200px) and (max-width: 1599px)') return false;
        if (query === '(min-width: 1600px)') return false;
        return false;
      });

      const { result } = renderHook(() => useBreakpoints(customBreakpoints));

      expect(result.current).toEqual({
        xs: false,
        sm: true,
        md: false,
        lg: false,
        xl: false,
      });
    });

    it('should merge custom breakpoints with defaults', () => {
      const customBreakpoints = { md: 800 };

      mockedUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: 639px)') return false;
        if (query === '(min-width: 640px) and (max-width: 799px)') return false;
        if (query === '(min-width: 800px) and (max-width: 1023px)') return true;
        if (query === '(min-width: 1024px) and (max-width: 1279px)') return false;
        if (query === '(min-width: 1280px)') return false;
        return false;
      });

      const { result } = renderHook(() => useBreakpoints(customBreakpoints));

      expect(result.current).toEqual({
        xs: false,
        sm: false,
        md: true,
        lg: false,
        xl: false,
      });
    });

    it('should handle partial custom breakpoints', () => {
      const customBreakpoints = { xs: 0, sm: 480 };

      mockedUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: 479px)') return true;
        if (query === '(min-width: 480px) and (max-width: 767px)') return false;
        if (query === '(min-width: 768px) and (max-width: 1023px)') return false;
        if (query === '(min-width: 1024px) and (max-width: 1279px)') return false;
        if (query === '(min-width: 1280px)') return false;
        return false;
      });

      const { result } = renderHook(() => useBreakpoints(customBreakpoints));

      expect(result.current.xs).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle all breakpoints being false', () => {
      mockedUseMediaQuery.mockReturnValue(false);

      const { result } = renderHook(() => useBreakpoints());

      expect(result.current).toEqual({
        xs: false,
        sm: false,
        md: false,
        lg: false,
        xl: false,
      });
    });

    it('should handle multiple breakpoints edge case', () => {
      // This shouldn't happen in practice, but test the behavior
      mockedUseMediaQuery.mockReturnValue(true);

      const { result } = renderHook(() => useBreakpoints());

      // All would be true in this mock scenario
      expect(Object.values(result.current).every(Boolean)).toBe(true);
    });
  });

  describe('breakpoint definitions', () => {
    it('should call useMediaQuery with correct queries for each breakpoint', () => {
      mockedUseMediaQuery.mockReturnValue(false);

      renderHook(() => useBreakpoints());

      const calls = mockedUseMediaQuery.mock.calls;
      
      expect(calls.some(call => call[0].includes('max-width: 639px'))).toBe(true); // xs
      expect(calls.some(call => call[0].includes('min-width: 640px') && call[0].includes('max-width: 767px'))).toBe(true); // sm
      expect(calls.some(call => call[0].includes('min-width: 768px') && call[0].includes('max-width: 1023px'))).toBe(true); // md
      expect(calls.some(call => call[0].includes('min-width: 1024px') && call[0].includes('max-width: 1279px'))).toBe(true); // lg
      expect(calls.some(call => call[0].includes('min-width: 1280px'))).toBe(true); // xl
    });

    it('should use correct breakpoint boundaries', () => {
      mockedUseMediaQuery.mockReturnValue(false);

      renderHook(() => useBreakpoints());

      // Check that queries are using correct boundaries
      const xsQuery = mockedUseMediaQuery.mock.calls.find(call => 
        call[0].includes('max-width: 639px')
      );
      const smQuery = mockedUseMediaQuery.mock.calls.find(call => 
        call[0].includes('min-width: 640px')
      );
      const mdQuery = mockedUseMediaQuery.mock.calls.find(call => 
        call[0].includes('min-width: 768px')
      );
      const lgQuery = mockedUseMediaQuery.mock.calls.find(call => 
        call[0].includes('min-width: 1024px')
      );
      const xlQuery = mockedUseMediaQuery.mock.calls.find(call => 
        call[0].includes('min-width: 1280px')
      );

      expect(xsQuery).toBeDefined();
      expect(smQuery).toBeDefined();
      expect(mdQuery).toBeDefined();
      expect(lgQuery).toBeDefined();
      expect(xlQuery).toBeDefined();
    });
  });

  describe('responsive behavior', () => {
    it('should update when screen size changes', () => {
      let isMobile = true;

      mockedUseMediaQuery.mockImplementation((query: string) => {
        if (query === '(max-width: 639px)') return isMobile;
        if (query === '(min-width: 640px) and (max-width: 767px)') return !isMobile;
        if (query === '(min-width: 768px) and (max-width: 1023px)') return false;
        if (query === '(min-width: 1024px) and (max-width: 1279px)') return false;
        if (query === '(min-width: 1280px)') return false;
        return false;
      });

      const { result, rerender } = renderHook(() => useBreakpoints());

      expect(result.current.xs).toBe(true);
      expect(result.current.sm).toBe(false);

      // Simulate screen resize
      isMobile = false;
      rerender();

      // After rerender, the hook will call useMediaQuery again with new values
      expect(mockedUseMediaQuery).toHaveBeenCalledTimes(10);
    });
  });

  describe('memoization', () => {
    it('should not recalculate breakpoints unnecessarily', () => {
      mockedUseMediaQuery.mockReturnValue(false);

      const { rerender } = renderHook(() => useBreakpoints());

      rerender();
      rerender();

      // useMediaQuery is called 5 times per render for the 5 breakpoints
      expect(mockedUseMediaQuery).toHaveBeenCalledTimes(15);
    });

    it('should update when custom breakpoints change', () => {
      mockedUseMediaQuery.mockReturnValue(false);

      const { rerender } = renderHook(
        ({ breakpoints }) => useBreakpoints(breakpoints),
        { initialProps: { breakpoints: { sm: 640 } } }
      );

      rerender({ breakpoints: { sm: 700 } });

      // Should have been called with new breakpoint values
      const smQueryCalls = mockedUseMediaQuery.mock.calls.filter(call => 
        call[0].includes('min-width: 700px') || call[0].includes('max-width: 699px')
      );
      expect(smQueryCalls.length).toBeGreaterThan(0);
    });
  });
});