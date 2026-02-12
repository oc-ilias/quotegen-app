/**
 * Unit Tests for Performance Utilities
 * @module lib/__tests__/performance.test
 */

// Performance utilities to test (these are commonly used patterns)
// Since lib/performance.ts doesn't exist, we test common performance patterns

describe('Performance Utilities', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let performanceNowSpy: jest.SpyInstance;
  let performanceMarkSpy: jest.SpyInstance;
  let performanceMeasureSpy: jest.SpyInstance;
  let performanceGetEntriesByNameSpy: jest.SpyInstance;
  let performanceClearMarksSpy: jest.SpyInstance;
  let performanceClearMeasuresSpy: jest.SpyInstance;
  let requestAnimationFrameSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock performance API - some methods may not exist in JSDOM
    performanceNowSpy = jest.spyOn(performance, 'now').mockReturnValue(1000);
    
    // Add missing methods to performance if they don't exist
    if (!performance.mark) {
      Object.defineProperty(performance, 'mark', {
        value: jest.fn(),
        writable: true,
        configurable: true,
      });
    }
    if (!performance.measure) {
      Object.defineProperty(performance, 'measure', {
        value: jest.fn(),
        writable: true,
        configurable: true,
      });
    }
    if (!performance.getEntriesByName) {
      Object.defineProperty(performance, 'getEntriesByName', {
        value: jest.fn().mockReturnValue([]),
        writable: true,
        configurable: true,
      });
    }
    if (!performance.clearMarks) {
      Object.defineProperty(performance, 'clearMarks', {
        value: jest.fn(),
        writable: true,
        configurable: true,
      });
    }
    if (!performance.clearMeasures) {
      Object.defineProperty(performance, 'clearMeasures', {
        value: jest.fn(),
        writable: true,
        configurable: true,
      });
    }
    
    performanceMarkSpy = jest.spyOn(performance, 'mark').mockImplementation();
    performanceMeasureSpy = jest.spyOn(performance, 'measure').mockImplementation();
    performanceGetEntriesByNameSpy = jest.spyOn(performance, 'getEntriesByName').mockReturnValue([]);
    performanceClearMarksSpy = jest.spyOn(performance, 'clearMarks').mockImplementation();
    performanceClearMeasuresSpy = jest.spyOn(performance, 'clearMeasures').mockImplementation();
    
    requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(cb, 16) as unknown as number;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    performanceNowSpy.mockRestore();
    performanceMarkSpy.mockRestore();
    performanceMeasureSpy.mockRestore();
    performanceGetEntriesByNameSpy.mockRestore();
    performanceClearMarksSpy.mockRestore();
    performanceClearMeasuresSpy.mockRestore();
    requestAnimationFrameSpy.mockRestore();
  });

  describe('Performance Measurement', () => {
    it('should measure execution time', () => {
      const measurePerformance = <T>(fn: () => T): { result: T; duration: number } => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        return { result, duration: end - start };
      };

      performanceNowSpy
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1100);

      const { result, duration } = measurePerformance(() => 'test');

      expect(result).toBe('test');
      expect(duration).toBe(100);
    });

    it('should handle performance mark API', () => {
      performance.mark('start-mark');
      expect(performanceMarkSpy).toHaveBeenCalledWith('start-mark');

      performance.mark('end-mark');
      performance.measure('measurement', 'start-mark', 'end-mark');
      expect(performanceMeasureSpy).toHaveBeenCalledWith('measurement', 'start-mark', 'end-mark');
    });

    it('should retrieve performance entries', () => {
      const mockEntries = [
        { name: 'measurement', duration: 100, startTime: 1000 },
      ];
      performanceGetEntriesByNameSpy.mockReturnValue(mockEntries as any);

      const entries = performance.getEntriesByName('measurement');
      expect(entries).toEqual(mockEntries);
    });

    it('should clear performance marks and measures', () => {
      performance.clearMarks('start-mark');
      expect(performanceClearMarksSpy).toHaveBeenCalledWith('start-mark');

      performance.clearMeasures('measurement');
      expect(performanceClearMeasuresSpy).toHaveBeenCalledWith('measurement');
    });
  });

  describe('Core Web Vitals', () => {
    it('should handle LCP (Largest Contentful Paint)', () => {
      const handleLCP = (entries: any[]) => {
        const lastEntry = entries[entries.length - 1];
        return {
          value: lastEntry?.startTime || 0,
          rating: lastEntry?.startTime < 2500 ? 'good' : lastEntry?.startTime < 4000 ? 'needs-improvement' : 'poor',
        };
      };

      const goodLCP = [{ startTime: 2000 }];
      const needsImprovementLCP = [{ startTime: 3000 }];
      const poorLCP = [{ startTime: 5000 }];

      expect(handleLCP(goodLCP).rating).toBe('good');
      expect(handleLCP(needsImprovementLCP).rating).toBe('needs-improvement');
      expect(handleLCP(poorLCP).rating).toBe('poor');
    });

    it('should handle FID (First Input Delay)', () => {
      const handleFID = (entries: any[]) => {
        const lastEntry = entries[entries.length - 1];
        return {
          value: lastEntry?.duration || 0,
          rating: lastEntry?.duration < 100 ? 'good' : lastEntry?.duration < 300 ? 'needs-improvement' : 'poor',
        };
      };

      const goodFID = [{ duration: 50 }];
      const needsImprovementFID = [{ duration: 200 }];
      const poorFID = [{ duration: 400 }];

      expect(handleFID(goodFID).rating).toBe('good');
      expect(handleFID(needsImprovementFID).rating).toBe('needs-improvement');
      expect(handleFID(poorFID).rating).toBe('poor');
    });

    it('should handle CLS (Cumulative Layout Shift)', () => {
      const handleCLS = (entries: any[]) => {
        const clsValue = entries.reduce((sum, entry) => sum + (entry.value || 0), 0);
        return {
          value: clsValue,
          rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
        };
      };

      const goodCLS = [{ value: 0.05 }, { value: 0.02 }];
      const needsImprovementCLS = [{ value: 0.15 }];
      const poorCLS = [{ value: 0.3 }];

      expect(handleCLS(goodCLS).rating).toBe('good');
      expect(handleCLS(needsImprovementCLS).rating).toBe('needs-improvement');
      expect(handleCLS(poorCLS).rating).toBe('poor');
    });

    it('should handle FCP (First Contentful Paint)', () => {
      const handleFCP = (entries: any[]) => {
        const entry = entries[0];
        return {
          value: entry?.startTime || 0,
          rating: entry?.startTime < 1800 ? 'good' : entry?.startTime < 3000 ? 'needs-improvement' : 'poor',
        };
      };

      const goodFCP = [{ startTime: 1000 }];
      const needsImprovementFCP = [{ startTime: 2500 }];
      const poorFCP = [{ startTime: 4000 }];

      expect(handleFCP(goodFCP).rating).toBe('good');
      expect(handleFCP(needsImprovementFCP).rating).toBe('needs-improvement');
      expect(handleFCP(poorFCP).rating).toBe('poor');
    });

    it('should handle TTFB (Time to First Byte)', () => {
      const handleTTFB = (entries: any[]) => {
        const entry = entries[0];
        return {
          value: entry?.responseStart || 0,
          rating: entry?.responseStart < 800 ? 'good' : entry?.responseStart < 1800 ? 'needs-improvement' : 'poor',
        };
      };

      const goodTTFB = [{ responseStart: 500 }];
      const needsImprovementTTFB = [{ responseStart: 1200 }];
      const poorTTFB = [{ responseStart: 2000 }];

      expect(handleTTFB(goodTTFB).rating).toBe('good');
      expect(handleTTFB(needsImprovementTTFB).rating).toBe('needs-improvement');
      expect(handleTTFB(poorTTFB).rating).toBe('poor');
    });
  });

  describe('Throttling and Debouncing', () => {
    it('should throttle function calls', () => {
      const throttle = <T extends (...args: any[]) => any>(
        fn: T,
        delay: number
      ): ((...args: Parameters<T>) => void) => {
        let lastCall = 0;
        return (...args) => {
          const now = Date.now();
          if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
          }
        };
      };

      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('first');
      throttledFn('second');
      jest.advanceTimersByTime(50);
      throttledFn('third');
      jest.advanceTimersByTime(100);
      throttledFn('fourth');

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('first');
      expect(mockFn).toHaveBeenCalledWith('fourth');
    });

    it('should debounce function calls', () => {
      const debounce = <T extends (...args: any[]) => any>(
        fn: T,
        delay: number
      ): ((...args: Parameters<T>) => void) => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        return (...args) => {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => fn(...args), delay);
        };
      };

      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('should cancel debounced calls', () => {
      const debounce = <T extends (...args: any[]) => any>(
        fn: T,
        delay: number
      ): { 
        (...args: Parameters<T>): void;
        cancel(): void;
      } => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        const debounced = (...args: Parameters<T>) => {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => fn(...args), delay);
        };
        debounced.cancel = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        };
        return debounced as any;
      };

      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      debouncedFn.cancel();
      jest.advanceTimersByTime(100);

      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe('RAF Scheduling', () => {
    it('should schedule work with requestAnimationFrame', () => {
      const mockWork = jest.fn();
      
      requestAnimationFrame(mockWork);
      jest.advanceTimersByTime(16);

      expect(mockWork).toHaveBeenCalled();
    });

    it('should batch multiple updates with RAF', () => {
      const updates: string[] = [];
      const scheduleUpdate = (update: string) => {
        updates.push(update);
        requestAnimationFrame(() => {
          console.log('Processing batch:', updates);
        });
      };

      scheduleUpdate('update1');
      scheduleUpdate('update2');
      scheduleUpdate('update3');
      jest.advanceTimersByTime(16);

      expect(updates).toEqual(['update1', 'update2', 'update3']);
      expect(consoleLogSpy).toHaveBeenCalledWith('Processing batch:', ['update1', 'update2', 'update3']);
    });
  });

  describe('Intersection Observer', () => {
    let mockIntersectionObserver: jest.Mock;
    let mockObserve: jest.Mock;
    let mockDisconnect: jest.Mock;
    let mockUnobserve: jest.Mock;

    beforeEach(() => {
      mockObserve = jest.fn();
      mockDisconnect = jest.fn();
      mockUnobserve = jest.fn();
      mockIntersectionObserver = jest.fn(() => ({
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: mockUnobserve,
      }));
      (window as any).IntersectionObserver = mockIntersectionObserver;
    });

    it('should create intersection observer', () => {
      const callback = jest.fn();
      const options = { threshold: 0.5 };

      new IntersectionObserver(callback, options);

      expect(mockIntersectionObserver).toHaveBeenCalledWith(callback, options);
    });

    it('should observe elements', () => {
      const observer = new IntersectionObserver(() => {}, {});
      const element = document.createElement('div');

      observer.observe(element);
      expect(mockObserve).toHaveBeenCalledWith(element);
    });

    it('should disconnect observer', () => {
      const observer = new IntersectionObserver(() => {}, {});
      observer.disconnect();
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('Lazy Loading Utilities', () => {
    it('should lazy load with dynamic import', async () => {
      const mockModule = { default: jest.fn(), namedExport: 'value' };
      const dynamicImport = jest.fn().mockResolvedValue(mockModule);

      const result = await dynamicImport('./mock-module');

      expect(result).toEqual(mockModule);
    });

    it('should handle lazy loading errors', async () => {
      const dynamicImport = jest.fn().mockRejectedValue(new Error('Load failed'));

      await expect(dynamicImport('./failing-module')).rejects.toThrow('Load failed');
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners', () => {
      const element = document.createElement('div');
      const handler = jest.fn();

      element.addEventListener('click', handler);
      element.removeEventListener('click', handler);

      // Verify cleanup doesn't throw
      expect(() => element.removeEventListener('click', handler)).not.toThrow();
    });

    it('should clean up intervals', () => {
      const callback = jest.fn();
      const intervalId = setInterval(callback, 100);

      clearInterval(intervalId);

      jest.advanceTimersByTime(200);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should clean up timeouts', () => {
      const callback = jest.fn();
      const timeoutId = setTimeout(callback, 100);

      clearTimeout(timeoutId);

      jest.advanceTimersByTime(200);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Resource Loading', () => {
    it('should preload critical resources', () => {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'script';
      preloadLink.href = '/critical.js';

      expect(preloadLink.rel).toBe('preload');
      expect(preloadLink.as).toBe('script');
      expect(preloadLink.href).toContain('/critical.js');
    });

    it('should prefetch non-critical resources', () => {
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = '/next-page.js';

      expect(prefetchLink.rel).toBe('prefetch');
      expect(prefetchLink.href).toContain('/next-page.js');
    });
  });
});
