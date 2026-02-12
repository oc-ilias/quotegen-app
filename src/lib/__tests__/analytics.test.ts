/**
 * Unit Tests for Analytics Module
 * @module lib/__tests__/analytics.test
 */

import {
  trackPageView,
  trackEvent,
  useAnalytics,
  reportWebVitals,
  trackError,
  metrics,
} from '@/lib/analytics';
import { renderHook } from '@testing-library/react';

// Mock window.gtag before importing
const mockGtag = jest.fn();
Object.defineProperty(global, 'gtag', {
  writable: true,
  value: mockGtag,
  configurable: true,
});

describe('Analytics Module', () => {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('trackPageView', () => {
    it('should track page view when gtag is available', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'GA-TEST-ID';
      trackPageView('/test-page');

      expect(mockGtag).toHaveBeenCalledWith('config', 'GA-TEST-ID', {
        page_path: '/test-page',
      });
    });

    it('should not throw when gtag is not available', () => {
      Object.defineProperty(global, 'gtag', {
        writable: true,
        value: undefined,
        configurable: true,
      });

      expect(() => trackPageView('/test-page')).not.toThrow();

      // Restore mock
      Object.defineProperty(global, 'gtag', {
        writable: true,
        value: mockGtag,
        configurable: true,
      });
    });

    it('should not track when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing SSR scenario
      global.window = undefined;

      expect(() => trackPageView('/test-page')).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('trackEvent', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'gtag', {
        writable: true,
        value: mockGtag,
        configurable: true,
      });
    });

    it('should track event with all parameters', () => {
      trackEvent('button_click', 'engagement', 'submit', 1);

      expect(mockGtag).toHaveBeenCalledWith('event', 'button_click', {
        event_category: 'engagement',
        event_label: 'submit',
        value: 1,
      });
    });

    it('should track event without optional parameters', () => {
      trackEvent('page_view', 'navigation');

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        event_category: 'navigation',
        event_label: undefined,
        value: undefined,
      });
    });

    it('should not throw when gtag is not available', () => {
      Object.defineProperty(global, 'gtag', {
        writable: true,
        value: undefined,
        configurable: true,
      });

      expect(() => trackEvent('test', 'category')).not.toThrow();
    });
  });

  describe('useAnalytics', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'gtag', {
        writable: true,
        value: mockGtag,
        configurable: true,
      });
    });

    it('should track initial page view on mount', () => {
      renderHook(() => useAnalytics());

      expect(mockGtag).toHaveBeenCalledWith(
        'config',
        expect.any(String),
        expect.objectContaining({
          page_path: expect.any(String),
        })
      );
    });

    it('should not throw during SSR', () => {
      // Just verify it doesn't throw during render
      expect(() => renderHook(() => useAnalytics())).not.toThrow();
    });
  });

  describe('reportWebVitals', () => {
    it('should log web vitals to console', () => {
      const mockMetric = {
        id: 'test-metric',
        name: 'CLS',
        value: 0.1,
      };

      reportWebVitals(mockMetric);

      expect(console.log).toHaveBeenCalledWith('Web Vital:', mockMetric);
    });

    it('should handle different metric types', () => {
      const testMetrics = [
        { id: '1', name: 'LCP', value: 2.5 },
        { id: '2', name: 'FID', value: 100 },
        { id: '3', name: 'CLS', value: 0.05 },
        { id: '4', name: 'FCP', value: 1.8 },
        { id: '5', name: 'TTFB', value: 300 },
      ];

      testMetrics.forEach((metric) => {
        reportWebVitals(metric);
        expect(console.log).toHaveBeenCalledWith('Web Vital:', metric);
      });
    });
  });

  describe('trackError', () => {
    it('should log error to console', () => {
      const error = new Error('Test error');
      trackError(error);

      expect(console.error).toHaveBeenCalledWith(
        'Tracked error:',
        error,
        undefined
      );
    });

    it('should include context when provided', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'submit' };

      trackError(error, context);

      expect(console.error).toHaveBeenCalledWith(
        'Tracked error:',
        error,
        context
      );
    });
  });

  describe('metrics', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'gtag', {
        writable: true,
        value: mockGtag,
        configurable: true,
      });
    });

    it('should track quoteCreated event', () => {
      metrics.quoteCreated();

      expect(mockGtag).toHaveBeenCalledWith('event', 'quote_created', {
        event_category: 'engagement',
        event_label: undefined,
        value: undefined,
      });
    });

    it('should track quoteStatusUpdated event', () => {
      metrics.quoteStatusUpdated('accepted');

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'quote_status_updated',
        {
          event_category: 'engagement',
          event_label: 'accepted',
          value: undefined,
        }
      );
    });

    it('should track settingsSaved event', () => {
      metrics.settingsSaved();

      expect(mockGtag).toHaveBeenCalledWith('event', 'settings_saved', {
        event_category: 'engagement',
        event_label: undefined,
        value: undefined,
      });
    });

    it('should track buttonClicked event', () => {
      metrics.buttonClicked();

      expect(mockGtag).toHaveBeenCalledWith('event', 'button_clicked', {
        event_category: 'engagement',
        event_label: undefined,
        value: undefined,
      });
    });

    it('should track formSubmitted event', () => {
      metrics.formSubmitted();

      expect(mockGtag).toHaveBeenCalledWith('event', 'form_submitted', {
        event_category: 'conversion',
        event_label: undefined,
        value: undefined,
      });
    });

    it('should track upgradeClicked event', () => {
      metrics.upgradeClicked();

      expect(mockGtag).toHaveBeenCalledWith('event', 'upgrade_clicked', {
        event_category: 'revenue',
        event_label: undefined,
        value: undefined,
      });
    });
  });
});
