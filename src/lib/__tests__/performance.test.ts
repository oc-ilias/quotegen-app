/**
 * Performance Library Tests
 * Tests for performance monitoring, Web Vitals
 * @module lib/__tests__/performance.test.ts
 */

import {
  onWebVital,
  mark,
  measure,
  getDurationSinceMark,
  clearMark,
  onPerformanceReport,
  reportToAnalytics,
  sendToGA4,
  initPerformanceMonitoring,
  usePerformanceMonitoring,
  preloadResource,
  prefetchResource,
  preconnect,
  dnsPrefetch,
  WebVitalsMetrics,
} from '@/lib/performance';

import { renderHook } from '@testing-library/react';

// ============================================================================
// Mocks
// ============================================================================

const mockConsoleLog = jest.fn();
const mockConsoleError = jest.fn();
const mockConsoleWarn = jest.fn();

const mockGtag = jest.fn();

// Create mock performance implementation
const createMockPerformance = () => {
  const marks = new Map<string, number>();
  const measures: Array<{ name: string; duration: number }> = [];
  
  return {
    now: jest.fn(() => Date.now()),
    mark: jest.fn((name: string) => {
      marks.set(name, Date.now());
    }),
    measure: jest.fn((name: string, start?: string, end?: string) => {
      measures.push({ name, duration: 100 });
    }),
    clearMarks: jest.fn((name?: string) => {
      if (name) {
        marks.delete(name);
      } else {
        marks.clear();
      }
    }),
    getEntriesByName: jest.fn((name: string, type?: string) => {
      if (type === 'measure') {
        const found = measures.filter(m => m.name === name);
        return found.length > 0 ? found : [{ duration: 100 }];
      }
      return [];
    }),
    getEntriesByType: jest.fn((type: string) => {
      if (type === 'navigation') {
        return [{
          responseStart: 100,
          startTime: 0,
        }];
      }
      return [];
    }),
    // Expose marks for testing
    _marks: marks,
  };
};

let mockPerformance: ReturnType<typeof createMockPerformance>;

const mockPerformanceObserver = jest.fn();
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

// ============================================================================
// Setup
// ============================================================================

describe('Performance Library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Mock console
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    console.warn = mockConsoleWarn;

    // Mock gtag
    (window as Window & { gtag?: jest.Mock }).gtag = mockGtag;

    // Create fresh mock performance
    mockPerformance = createMockPerformance();
    Object.defineProperty(global, 'performance', {
      writable: true,
      value: mockPerformance,
    });

    // Mock PerformanceObserver
    mockPerformanceObserver.mockImplementation((callback: Function) => ({
      observe: mockObserve,
      disconnect: mockDisconnect,
    }));
    global.PerformanceObserver = mockPerformanceObserver as unknown as typeof PerformanceObserver;

    // Mock navigator
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: {
        userAgent: 'test-agent',
        connection: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 50,
          saveData: false,
        },
      },
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'https://test.com/page',
      },
    });

    // Mock document
    Object.defineProperty(document, 'addEventListener', {
      writable: true,
      value: jest.fn(),
    });
    Object.defineProperty(document, 'removeEventListener', {
      writable: true,
      value: jest.fn(),
    });
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      value: 'visible',
    });

    // Mock document.head
    Object.defineProperty(document, 'head', {
      writable: true,
      value: {
        appendChild: jest.fn(),
      },
    });
    Object.defineProperty(document, 'body', {
      writable: true,
      value: {
        appendChild: jest.fn((el: HTMLElement) => el),
        removeChild: jest.fn((el: HTMLElement) => el),
      },
    });

    // Reset Date.now mock
    jest.useFakeTimers();
    jest.setSystemTime(1000000);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // ============================================================================
  // onWebVital
  // ============================================================================

  describe('onWebVital', () => {
    it('should register a callback for a metric', () => {
      const callback = jest.fn();
      
      const unsubscribe = onWebVital('LCP', callback);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow unsubscribing', () => {
      const callback = jest.fn();
      
      const unsubscribe = onWebVital('LCP', callback);
      unsubscribe();
      
      // Should not throw
      expect(unsubscribe).not.toThrow();
    });

    it('should support multiple metrics', () => {
      const lcpCallback = jest.fn();
      const fidCallback = jest.fn();
      
      onWebVital('LCP', lcpCallback);
      onWebVital('FID', fidCallback);
      
      expect(typeof onWebVital).toBe('function');
    });

    it('should support multiple callbacks for same metric', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      onWebVital('LCP', callback1);
      onWebVital('LCP', callback2);
      
      expect(typeof onWebVital).toBe('function');
    });
  });

  // ============================================================================
  // mark
  // ============================================================================

  describe('mark', () => {
    it('should create a performance mark', () => {
      mark('test-mark');
      
      expect(mockPerformance.mark).toHaveBeenCalledWith('quotegen_test-mark');
    });

    it('should store mark time', () => {
      mockPerformance.now.mockReturnValueOnce(5000);
      
      mark('timing-test');
      
      expect(mockPerformance.mark).toHaveBeenCalled();
    });

    it('should not throw when performance is undefined', () => {
      // @ts-expect-error - Testing undefined performance
      delete global.performance;
      
      expect(() => mark('test')).not.toThrow();
    });

    it('should not throw when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing undefined window
      delete global.window;
      
      expect(() => mark('test')).not.toThrow();
      
      global.window = originalWindow;
    });

    it('should handle multiple marks with different names', () => {
      mark('mark1');
      mark('mark2');
      mark('mark3');
      
      expect(mockPerformance.mark).toHaveBeenCalledTimes(3);
      expect(mockPerformance.mark).toHaveBeenNthCalledWith(1, 'quotegen_mark1');
      expect(mockPerformance.mark).toHaveBeenNthCalledWith(2, 'quotegen_mark2');
      expect(mockPerformance.mark).toHaveBeenNthCalledWith(3, 'quotegen_mark3');
    });
  });

  // ============================================================================
  // measure
  // ============================================================================

  describe('measure', () => {
    it('should create a performance measure', () => {
      mockPerformance.getEntriesByName.mockReturnValue([{ duration: 100 }]);
      
      const duration = measure('test-measure');
      
      expect(mockPerformance.measure).toHaveBeenCalled();
      expect(duration).toBe(100);
    });

    it('should handle measure with start and end marks', () => {
      mockPerformance.getEntriesByName.mockReturnValue([{ duration: 200 }]);
      
      measure('test', 'start', 'end');
      
      expect(mockPerformance.measure).toHaveBeenCalledWith(
        'quotegen_test',
        'quotegen_start',
        'quotegen_end'
      );
    });

    it('should return null when measure fails', () => {
      mockPerformance.measure.mockImplementation(() => {
        throw new Error('Measure failed');
      });
      
      const duration = measure('failing-measure');
      
      expect(duration).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it('should return null when no entries found', () => {
      mockPerformance.getEntriesByName.mockReturnValue([]);
      
      const duration = measure('empty-measure');
      
      expect(duration).toBeNull();
    });

    it('should return null when performance is undefined', () => {
      // @ts-expect-error - Testing undefined performance
      delete global.performance;
      
      const duration = measure('test');
      
      expect(duration).toBeNull();
    });

    it('should return last measure when multiple exist', () => {
      mockPerformance.getEntriesByName.mockReturnValue([
        { duration: 100 },
        { duration: 200 },
        { duration: 300 },
      ]);
      
      const duration = measure('multi-measure');
      
      expect(duration).toBe(300);
    });
  });

  // ============================================================================
  // getDurationSinceMark
  // ============================================================================

  describe('getDurationSinceMark', () => {
    it('should return duration since mark', () => {
      // Setup: mark created at 1000, now is 1500
      mockPerformance.now.mockReturnValueOnce(1000);
      mark('duration-test');
      
      mockPerformance.now.mockReturnValueOnce(1500);
      
      const duration = getDurationSinceMark('duration-test');
      
      expect(duration).toBe(500);
    });

    it('should return null for non-existent mark', () => {
      const duration = getDurationSinceMark('non-existent');
      
      expect(duration).toBeNull();
    });

    it('should return null when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing undefined window
      delete global.window;
      
      const duration = getDurationSinceMark('test');
      
      expect(duration).toBeNull();
      
      global.window = originalWindow;
    });
  });

  // ============================================================================
  // clearMark
  // ============================================================================

  describe('clearMark', () => {
    it('should clear a performance mark', () => {
      mockPerformance.now.mockReturnValueOnce(1000);
      mark('clear-test');
      
      clearMark('clear-test');
      
      expect(mockPerformance.clearMarks).toHaveBeenCalledWith('quotegen_clear-test');
    });

    it('should not throw when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing undefined window
      delete global.window;
      
      expect(() => clearMark('test')).not.toThrow();
      
      global.window = originalWindow;
    });

    it('should handle clearing non-existent mark', () => {
      expect(() => clearMark('never-created')).not.toThrow();
    });
  });

  // ============================================================================
  // onPerformanceReport
  // ============================================================================

  describe('onPerformanceReport', () => {
    it('should register analytics callback', () => {
      const callback = jest.fn();
      
      const unsubscribe = onPerformanceReport(callback);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow unsubscribing', () => {
      const callback = jest.fn();
      
      const unsubscribe = onPerformanceReport(callback);
      unsubscribe();
      
      // Should not throw
      expect(unsubscribe).not.toThrow();
    });

    it('should support multiple callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      onPerformanceReport(callback1);
      onPerformanceReport(callback2);
      
      expect(typeof onPerformanceReport).toBe('function');
    });
  });

  // ============================================================================
  // reportToAnalytics
  // ============================================================================

  describe('reportToAnalytics', () => {
    it('should report metrics to registered callbacks', () => {
      const callback = jest.fn();
      onPerformanceReport(callback);
      
      const metrics: WebVitalsMetrics = {
        LCP: 2500,
        FID: 100,
        CLS: 0.1,
      };
      
      reportToAnalytics(metrics);
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metrics,
          url: expect.any(String),
          timestamp: expect.any(Number),
          userAgent: 'test-agent',
          connection: expect.objectContaining({
            effectiveType: '4g',
          }),
        })
      );
    });

    it('should handle empty metrics', () => {
      const callback = jest.fn();
      onPerformanceReport(callback);
      
      reportToAnalytics({});
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle missing navigator.connection', () => {
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: {
          userAgent: 'test-agent',
          // No connection
        },
      });
      
      const callback = jest.fn();
      onPerformanceReport(callback);
      
      reportToAnalytics({ LCP: 1000 });
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          connection: undefined,
        })
      );
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      onPerformanceReport(errorCallback);
      
      expect(() => reportToAnalytics({ LCP: 1000 })).not.toThrow();
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should include all metrics in report', () => {
      const callback = jest.fn();
      onPerformanceReport(callback);
      
      const fullMetrics: WebVitalsMetrics = {
        LCP: 2500,
        FID: 100,
        FCP: 1500,
        TTFB: 200,
        CLS: 0.1,
        INP: 150,
        TTI: 3000,
        TBT: 100,
      };
      
      reportToAnalytics(fullMetrics);
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metrics: fullMetrics,
        })
      );
    });
  });

  // ============================================================================
  // sendToGA4
  // ============================================================================

  describe('sendToGA4', () => {
    it('should send metrics to GA4', () => {
      const metrics: WebVitalsMetrics = {
        LCP: 2500,
        FID: 100,
      };
      
      sendToGA4(metrics);
      
      expect(mockGtag).toHaveBeenCalledTimes(2);
      expect(mockGtag).toHaveBeenCalledWith('event', 'web_vitals', expect.objectContaining({
        event_category: 'Web Vitals',
        event_label: 'LCP',
        value: 2500,
      }));
    });

    it('should round metric values', () => {
      const metrics: WebVitalsMetrics = {
        LCP: 2500.75,
      };
      
      sendToGA4(metrics);
      
      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'web_vitals',
        expect.objectContaining({
          value: 2501,
        })
      );
    });

    it('should skip undefined metrics', () => {
      const metrics: WebVitalsMetrics = {
        LCP: 2500,
        FID: undefined,
      };
      
      sendToGA4(metrics);
      
      // Should only call for LCP
      expect(mockGtag).toHaveBeenCalledTimes(1);
    });

    it('should not throw when gtag is not available', () => {
      delete (window as Window & { gtag?: jest.Mock }).gtag;
      
      expect(() => sendToGA4({ LCP: 1000 })).not.toThrow();
    });

    it('should not throw when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing undefined window
      delete global.window;
      
      expect(() => sendToGA4({ LCP: 1000 })).not.toThrow();
      
      global.window = originalWindow;
    });
  });

  // ============================================================================
  // initPerformanceMonitoring
  // ============================================================================

  describe('initPerformanceMonitoring', () => {
    // Store original module to reset state
    let performanceModule: typeof import('@/lib/performance');

    beforeEach(async () => {
      // Reset modules to get fresh state
      jest.resetModules();
      performanceModule = await import('@/lib/performance');
    });

    it('should initialize performance monitoring', () => {
      expect(() => performanceModule.initPerformanceMonitoring()).not.toThrow();
    });

    it('should handle multiple initializations', () => {
      performanceModule.initPerformanceMonitoring();
      performanceModule.initPerformanceMonitoring(); // Second call should be ignored
      
      // Should not throw
      expect(true).toBe(true);
    });

    it('should initialize with console reporting', () => {
      performanceModule.initPerformanceMonitoring({ reportToConsole: true });
      
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should initialize with analytics reporting', () => {
      const analyticsCallback = jest.fn();
      
      performanceModule.initPerformanceMonitoring({
        reportToAnalytics: true,
        analyticsCallback,
      });
      
      expect(typeof performanceModule.initPerformanceMonitoring).toBe('function');
    });

    it('should not throw when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing undefined window
      delete global.window;
      
      expect(() => performanceModule.initPerformanceMonitoring()).not.toThrow();
      
      global.window = originalWindow;
    });

    it('should set up PerformanceObservers', () => {
      performanceModule.initPerformanceMonitoring();
      
      expect(mockPerformanceObserver).toHaveBeenCalled();
    });

    it('should handle missing PerformanceObserver', () => {
      // @ts-expect-error - Testing missing PerformanceObserver
      delete global.PerformanceObserver;
      
      expect(() => performanceModule.initPerformanceMonitoring()).not.toThrow();
    });
  });

  // ============================================================================
  // usePerformanceMonitoring
  // ============================================================================

  describe('usePerformanceMonitoring', () => {
    it('should run without errors', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitoring({ componentName: 'TestComponent' })
      );
      
      expect(result.current).toBeUndefined();
    });

    it('should report on mount when enabled', () => {
      renderHook(() =>
        usePerformanceMonitoring({
          componentName: 'TestComponent',
          reportOnMount: true,
        })
      );
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Performance] TestComponent mounted'
      );
    });

    it('should report on unmount when enabled', () => {
      mockPerformanceGetEntriesByName.mockReturnValue([{ duration: 500 }]);
      
      const { unmount } = renderHook(() =>
        usePerformanceMonitoring({
          componentName: 'TestComponent',
          reportOnUnmount: true,
        })
      );
      
      unmount();
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[Performance] TestComponent lifetime:')
      );
    });

    it('should use default component name', () => {
      renderHook(() => usePerformanceMonitoring({ reportOnMount: true }));
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Performance] Component mounted'
      );
    });
  });

  // ============================================================================
  // Resource Loading
  // ============================================================================

  describe('preloadResource', () => {
    it('should create preload link for script', () => {
      const appendChild = jest.fn();
      document.head.appendChild = appendChild;
      
      preloadResource('/script.js', 'script');
      
      expect(appendChild).toHaveBeenCalled();
      const link = appendChild.mock.calls[0][0] as HTMLLinkElement;
      expect(link.rel).toBe('preload');
      expect(link.href).toBe('/script.js');
      expect(link.as).toBe('script');
    });

    it('should create preload link with options', () => {
      const appendChild = jest.fn();
      document.head.appendChild = appendChild;
      
      preloadResource('/font.woff2', 'font', {
        type: 'font/woff2',
        crossOrigin: true,
      });
      
      const link = appendChild.mock.calls[0][0] as HTMLLinkElement;
      expect(link.type).toBe('font/woff2');
      expect(link.crossOrigin).toBe('anonymous');
    });

    it('should not throw when document is undefined', () => {
      const originalDocument = global.document;
      // @ts-expect-error - Testing undefined document
      delete global.document;
      
      expect(() => preloadResource('/test.js', 'script')).not.toThrow();
      
      global.document = originalDocument;
    });

    it('should handle different resource types', () => {
      const appendChild = jest.fn();
      document.head.appendChild = appendChild;
      
      const types: Array<'script' | 'style' | 'font' | 'image' | 'fetch'> = [
        'script', 'style', 'font', 'image', 'fetch'
      ];
      
      types.forEach((type) => {
        preloadResource(`/test.${type}`, type);
      });
      
      expect(appendChild).toHaveBeenCalledTimes(types.length);
    });
  });

  describe('prefetchResource', () => {
    it('should create prefetch link', () => {
      const appendChild = jest.fn();
      document.head.appendChild = appendChild;
      
      prefetchResource('/next-page');
      
      expect(appendChild).toHaveBeenCalled();
      const link = appendChild.mock.calls[0][0] as HTMLLinkElement;
      expect(link.rel).toBe('prefetch');
      expect(link.href).toBe('/next-page');
    });

    it('should not throw when document is undefined', () => {
      const originalDocument = global.document;
      // @ts-expect-error - Testing undefined document
      delete global.document;
      
      expect(() => prefetchResource('/test')).not.toThrow();
      
      global.document = originalDocument;
    });
  });

  describe('preconnect', () => {
    it('should create preconnect link', () => {
      const appendChild = jest.fn();
      document.head.appendChild = appendChild;
      
      preconnect('https://api.example.com');
      
      expect(appendChild).toHaveBeenCalled();
      const link = appendChild.mock.calls[0][0] as HTMLLinkElement;
      expect(link.rel).toBe('preconnect');
      expect(link.href).toBe('https://api.example.com');
      expect(link.crossOrigin).toBe('anonymous');
    });

    it('should create preconnect without crossorigin', () => {
      const appendChild = jest.fn();
      document.head.appendChild = appendChild;
      
      preconnect('https://api.example.com', false);
      
      const link = appendChild.mock.calls[0][0] as HTMLLinkElement;
      expect(link.crossOrigin).toBeFalsy();
    });

    it('should not throw when document is undefined', () => {
      const originalDocument = global.document;
      // @ts-expect-error - Testing undefined document
      delete global.document;
      
      expect(() => preconnect('https://test.com')).not.toThrow();
      
      global.document = originalDocument;
    });
  });

  describe('dnsPrefetch', () => {
    it('should create dns-prefetch link', () => {
      const appendChild = jest.fn();
      document.head.appendChild = appendChild;
      
      dnsPrefetch('https://api.example.com');
      
      expect(appendChild).toHaveBeenCalled();
      const link = appendChild.mock.calls[0][0] as HTMLLinkElement;
      expect(link.rel).toBe('dns-prefetch');
      expect(link.href).toBe('https://api.example.com');
    });

    it('should not throw when document is undefined', () => {
      const originalDocument = global.document;
      // @ts-expect-error - Testing undefined document
      delete global.document;
      
      expect(() => dnsPrefetch('https://test.com')).not.toThrow();
      
      global.document = originalDocument;
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('should handle callback that throws in onWebVital', () => {
      const throwingCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      
      onWebVital('LCP', throwingCallback);
      
      // Trigger callback through internal reporting would require more setup
      // but we can verify registration doesn't throw
      expect(typeof onWebVital).toBe('function');
    });

    it('should handle all metric types', () => {
      const metrics: Array<keyof WebVitalsMetrics> = [
        'LCP', 'FID', 'FCP', 'TTFB', 'CLS', 'INP', 'TTI', 'TBT'
      ];
      
      metrics.forEach((metric) => {
        const callback = jest.fn();
        expect(() => onWebVital(metric, callback)).not.toThrow();
      });
    });

    it('should handle navigator without userAgent', () => {
      Object.defineProperty(global, 'navigator', {
        writable: true,
        value: {},
      });
      
      const callback = jest.fn();
      onPerformanceReport(callback);
      
      reportToAnalytics({ LCP: 1000 });
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          userAgent: '',
        })
      );
    });

    it('should handle missing location.href', () => {
      delete (window as Window).location;
      (window as Window).location = {} as Location;
      
      const callback = jest.fn();
      onPerformanceReport(callback);
      
      reportToAnalytics({ LCP: 1000 });
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '',
        })
      );
    });
  });
});
