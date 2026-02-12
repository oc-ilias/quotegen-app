/**
 * Analytics Library Tests
 * Tests for trackEvent, trackPageView, identifyUser functions
 * @module lib/__tests__/analytics.test.ts
 */

import {
  trackEvent,
  trackPageView,
  reportWebVitals,
  trackError,
  metrics,
} from '@/lib/analytics';

// ============================================================================
// Mocks
// ============================================================================

const mockGtag = jest.fn();
const mockConsoleLog = jest.fn();
const mockConsoleError = jest.fn();
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Analytics Library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGtag.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    
    // Reset console mocks
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    
    // Setup window.gtag mock
    (window as Window & { gtag?: jest.Mock }).gtag = mockGtag;
    
    // Reset window location
    delete (window as Window).location;
    (window as Window).location = {
      pathname: '/test-path',
    } as Location;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  // ============================================================================
  // trackPageView
  // ============================================================================

  describe('trackPageView', () => {
    it('should track page view when gtag is available', () => {
      trackPageView('/test-page');

      expect(mockGtag).toHaveBeenCalledWith('config', expect.any(String), {
        page_path: '/test-page',
      });
    });

    it('should not throw when gtag is not available', () => {
      delete (window as Window & { gtag?: jest.Mock }).gtag;

      expect(() => trackPageView('/test-page')).not.toThrow();
    });

    it('should not call gtag when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing undefined window
      delete global.window;

      expect(() => trackPageView('/test-page')).not.toThrow();

      global.window = originalWindow;
    });

    it('should track page view with different URLs', () => {
      const urls = ['/', '/quotes', '/quotes/123', '/settings/profile'];

      urls.forEach((url) => {
        trackPageView(url);
      });

      expect(mockGtag).toHaveBeenCalledTimes(urls.length);
      urls.forEach((url, index) => {
        expect(mockGtag).toHaveBeenNthCalledWith(index + 1, 'config', expect.any(String), {
          page_path: url,
        });
      });
    });
  });

  // ============================================================================
  // trackEvent
  // ============================================================================

  describe('trackEvent', () => {
    it('should track event with action and category', () => {
      trackEvent('button_click', 'engagement');

      expect(mockGtag).toHaveBeenCalledWith('event', 'button_click', {
        event_category: 'engagement',
        event_label: undefined,
        value: undefined,
      });
    });

    it('should track event with all parameters', () => {
      trackEvent('form_submit', 'conversion', 'contact_form', 1);

      expect(mockGtag).toHaveBeenCalledWith('event', 'form_submit', {
        event_category: 'conversion',
        event_label: 'contact_form',
        value: 1,
      });
    });

    it('should track event with label only', () => {
      trackEvent('page_scroll', 'engagement', '50%');

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_scroll', {
        event_category: 'engagement',
        event_label: '50%',
        value: undefined,
      });
    });

    it('should track event with value only', () => {
      trackEvent('purchase', 'revenue', undefined, 99.99);

      expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
        event_category: 'revenue',
        event_label: undefined,
        value: 99.99,
      });
    });

    it('should not throw when gtag is not available', () => {
      delete (window as Window & { gtag?: jest.Mock }).gtag;

      expect(() => trackEvent('test', 'category')).not.toThrow();
    });

    it('should handle zero value', () => {
      trackEvent('scroll', 'engagement', 'top', 0);

      expect(mockGtag).toHaveBeenCalledWith('event', 'scroll', {
        event_category: 'engagement',
        event_label: 'top',
        value: 0,
      });
    });

    it('should handle negative values', () => {
      trackEvent('refund', 'revenue', 'order_123', -50);

      expect(mockGtag).toHaveBeenCalledWith('event', 'refund', {
        event_category: 'revenue',
        event_label: 'order_123',
        value: -50,
      });
    });
  });

  // ============================================================================
  // reportWebVitals
  // ============================================================================

  describe('reportWebVitals', () => {
    it('should log web vitals metric to console', () => {
      const mockMetric = {
        name: 'LCP',
        value: 2500,
        delta: 2500,
        id: 'v1',
      };

      reportWebVitals(mockMetric);

      expect(mockConsoleLog).toHaveBeenCalledWith('Web Vital:', mockMetric);
    });

    it('should handle different metric types', () => {
      const metrics = [
        { name: 'FID', value: 100, delta: 100, id: 'v1' },
        { name: 'CLS', value: 0.1, delta: 0.1, id: 'v2' },
        { name: 'FCP', value: 1500, delta: 1500, id: 'v3' },
        { name: 'TTFB', value: 200, delta: 200, id: 'v4' },
        { name: 'INP', value: 150, delta: 150, id: 'v5' },
      ];

      metrics.forEach((metric) => {
        reportWebVitals(metric);
      });

      expect(mockConsoleLog).toHaveBeenCalledTimes(5);
    });

    it('should handle metric with zero value', () => {
      const mockMetric = { name: 'CLS', value: 0, delta: 0, id: 'v1' };

      reportWebVitals(mockMetric);

      expect(mockConsoleLog).toHaveBeenCalledWith('Web Vital:', mockMetric);
    });
  });

  // ============================================================================
  // trackError
  // ============================================================================

  describe('trackError', () => {
    it('should log error to console', () => {
      const error = new Error('Test error');

      trackError(error);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Tracked error:',
        error,
        undefined
      );
    });

    it('should log error with context', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'save_quote' };

      trackError(error, context);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Tracked error:',
        error,
        context
      );
    });

    it('should handle errors with different types', () => {
      const errors = [
        new Error('Standard error'),
        new TypeError('Type error'),
        new RangeError('Range error'),
        new ReferenceError('Reference error'),
      ];

      errors.forEach((error) => {
        trackError(error);
      });

      // Verify each error type was tracked (at least the expected number of calls)
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Tracked error:',
        expect.objectContaining({ name: 'Error', message: 'Standard error' }),
        undefined
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Tracked error:',
        expect.objectContaining({ name: 'TypeError', message: 'Type error' }),
        undefined
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Tracked error:',
        expect.objectContaining({ name: 'RangeError', message: 'Range error' }),
        undefined
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Tracked error:',
        expect.objectContaining({ name: 'ReferenceError', message: 'Reference error' }),
        undefined
      );
    });

    it('should handle complex context objects', () => {
      const error = new Error('Complex error');
      const complexContext = {
        userId: '123',
        metadata: {
          page: '/quotes',
          action: 'create',
        },
        tags: ['critical', 'frontend'],
        count: 42,
      };

      trackError(error, complexContext);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Tracked error:',
        error,
        complexContext
      );
    });

    it('should handle empty context object', () => {
      const error = new Error('Test');

      trackError(error, {});

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Tracked error:',
        error,
        {}
      );
    });
  });

  // ============================================================================
  // metrics
  // ============================================================================

  describe('metrics', () => {
    beforeEach(() => {
      mockGtag.mockClear();
    });

    it('should track quoteCreated event', () => {
      metrics.quoteCreated();

      expect(mockGtag).toHaveBeenCalledWith('event', 'quote_created', {
        event_category: 'engagement',
        event_label: undefined,
        value: undefined,
      });
    });

    it('should track quoteStatusUpdated event with status label', () => {
      metrics.quoteStatusUpdated('accepted');

      expect(mockGtag).toHaveBeenCalledWith('event', 'quote_status_updated', {
        event_category: 'engagement',
        event_label: 'accepted',
        value: undefined,
      });
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

    it('should handle different quote statuses', () => {
      const statuses = ['draft', 'pending', 'sent', 'accepted', 'declined', 'expired'];

      statuses.forEach((status) => {
        metrics.quoteStatusUpdated(status);
      });

      expect(mockGtag).toHaveBeenCalledTimes(statuses.length);
      statuses.forEach((status, index) => {
        expect(mockGtag).toHaveBeenNthCalledWith(index + 1, 'event', 'quote_status_updated', {
          event_category: 'engagement',
          event_label: status,
          value: undefined,
        });
      });
    });

    it('should not throw when gtag is not available', () => {
      delete (window as Window & { gtag?: jest.Mock }).gtag;

      expect(() => {
        metrics.quoteCreated();
        metrics.quoteStatusUpdated('sent');
        metrics.settingsSaved();
        metrics.buttonClicked();
        metrics.formSubmitted();
        metrics.upgradeClicked();
      }).not.toThrow();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('should handle very long event labels', () => {
      const longLabel = 'a'.repeat(1000);
      trackEvent('test', 'category', longLabel);

      expect(mockGtag).toHaveBeenCalledWith('event', 'test', {
        event_category: 'category',
        event_label: longLabel,
        value: undefined,
      });
    });

    it('should handle special characters in event parameters', () => {
      trackEvent('test_event-123', 'category_name', 'label@example.com');

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event-123', {
        event_category: 'category_name',
        event_label: 'label@example.com',
        value: undefined,
      });
    });

    it('should handle Unicode characters in event parameters', () => {
      trackEvent('测试', 'カテゴリ', '标签');

      expect(mockGtag).toHaveBeenCalledWith('event', '测试', {
        event_category: 'カテゴリ',
        event_label: '标签',
        value: undefined,
      });
    });

    it('should handle very large value numbers', () => {
      trackEvent('purchase', 'revenue', 'item', 999999999);

      expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
        event_category: 'revenue',
        event_label: 'item',
        value: 999999999,
      });
    });

    it('should handle decimal values', () => {
      trackEvent('purchase', 'revenue', 'item', 99.99);

      expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
        event_category: 'revenue',
        event_label: 'item',
        value: 99.99,
      });
    });

    it('should handle empty string parameters', () => {
      trackEvent('', '', '');

      expect(mockGtag).toHaveBeenCalledWith('event', '', {
        event_category: '',
        event_label: '',
        value: undefined,
      });
    });

    it('should handle null and undefined in error context gracefully', () => {
      const error = new Error('Test');
      trackError(error, { nullValue: null, undefinedValue: undefined });

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Tracked error:',
        error,
        { nullValue: null, undefinedValue: undefined }
      );
    });
  });
});
