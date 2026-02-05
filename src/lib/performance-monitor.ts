/**
 * Performance Monitoring
 * 
 * Real User Monitoring (RUM) implementation for tracking:
 * - Core Web Vitals
 * - API response times
 * - User interactions
 * - Custom performance metrics
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logging';

// Core Web Vitals thresholds (based on Google's recommendations)
const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
  FID: { good: 100, poor: 300 },        // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
  TTFB: { good: 800, poor: 1800 },      // Time to First Byte
  INP: { good: 200, poor: 500 },        // Interaction to Next Paint
};

type WebVitalName = keyof typeof WEB_VITALS_THRESHOLDS;

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
  navigationType?: string;
}

// API performance tracking
interface ApiMetric {
  url: string;
  method: string;
  duration: number;
  status: number;
  success: boolean;
  timestamp: number;
}

// Performance observer callbacks
const performanceCallbacks = new Map<string, ((metric: PerformanceMetric) => void)[]>();

/**
 * Get rating for a metric value
 */
function getMetricRating(name: WebVitalName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name];
  if (!thresholds) return 'good';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report metric to analytics services
 */
function reportMetric(metric: PerformanceMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`[Web Vital] ${metric.name}: ${metric.value} (${metric.rating})`);
  }
  
  // Send to Sentry as a transaction or measurement
  if (metric.rating === 'poor') {
    Sentry.captureMessage(
      `Poor ${metric.name}: ${metric.value}`,
      {
        level: 'warning',
        tags: {
          metric: metric.name,
          rating: metric.rating,
        },
        extra: {
          value: metric.value,
          delta: metric.delta,
        },
      }
    );
  }
  
  // Send to Google Analytics 4 if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      metric_name: metric.name,
      metric_rating: metric.rating,
      metric_delta: metric.delta,
    });
  }
  
  // Call registered callbacks
  const callbacks = performanceCallbacks.get(metric.name) || [];
  callbacks.forEach(cb => cb(metric));
}

/**
 * Observe Core Web Vitals using Performance Observer
 */
function observeWebVitals() {
  if (typeof window === 'undefined') return;
  
  // Check if PerformanceObserver is supported
  if (!('PerformanceObserver' in window)) {
    logger.warn('PerformanceObserver not supported');
    return;
  }
  
  // Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      const metric: PerformanceMetric = {
        name: 'LCP',
        value: lastEntry.startTime,
        rating: getMetricRating('LCP', lastEntry.startTime),
        id: (lastEntry as any).id,
      };
      
      reportMetric(metric);
    });
    
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    logger.debug('LCP observation not supported');
  }
  
  // First Input Delay
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEventTiming;
        const delay = fidEntry.processingStart - fidEntry.startTime;
        
        const metric: PerformanceMetric = {
          name: 'FID',
          value: delay,
          rating: getMetricRating('FID', delay),
        };
        
        reportMetric(metric);
      });
    });
    
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    logger.debug('FID observation not supported');
  }
  
  // Cumulative Layout Shift
  try {
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];
    
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        // Only count layout shifts without recent user input
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
        }
      });
      
      const metric: PerformanceMetric = {
        name: 'CLS',
        value: clsValue,
        rating: getMetricRating('CLS', clsValue),
      };
      
      reportMetric(metric);
    });
    
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    logger.debug('CLS observation not supported');
  }
  
  // First Contentful Paint
  try {
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          const metric: PerformanceMetric = {
            name: 'FCP',
            value: entry.startTime,
            rating: getMetricRating('FCP', entry.startTime),
          };
          
          reportMetric(metric);
        }
      });
    });
    
    paintObserver.observe({ entryTypes: ['paint'] });
  } catch (e) {
    logger.debug('FCP observation not supported');
  }
  
  // Interaction to Next Paint (modern browsers)
  try {
    const inpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        const duration = (entry as PerformanceEventTiming).duration;
        
        const metric: PerformanceMetric = {
          name: 'INP',
          value: duration,
          rating: getMetricRating('INP', duration),
        };
        
        reportMetric(metric);
      });
    });
    
    inpObserver.observe({ entryTypes: ['event'] });
  } catch (e) {
    logger.debug('INP observation not supported');
  }
  
  // Time to First Byte
  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const ttfb = navigation.responseStart;
      
      const metric: PerformanceMetric = {
        name: 'TTFB',
        value: ttfb,
        rating: getMetricRating('TTFB', ttfb),
      };
      
      reportMetric(metric);
    }
  } catch (e) {
    logger.debug('TTFB calculation failed');
  }
}

/**
 * Track API performance
 */
export function trackApiCall(metric: ApiMetric) {
  // Log slow API calls
  if (metric.duration > 5000) {
    logger.warn(`Slow API call: ${metric.method} ${metric.url}`, {
      duration: metric.duration,
      status: metric.status,
    });
  }
  
  // Send to Sentry for monitoring
  Sentry.addBreadcrumb({
    category: 'api',
    message: `${metric.method} ${metric.url}`,
    data: {
      duration: metric.duration,
      status: metric.status,
      success: metric.success,
    },
    level: metric.success ? 'info' : 'error',
  });
  
  // Track as a span in Sentry
  if (!metric.success || metric.duration > 1000) {
    Sentry.captureMessage(
      `API ${metric.success ? 'slow' : 'error'}: ${metric.url}`,
      {
        level: metric.success ? 'warning' : 'error',
        tags: {
          api_method: metric.method,
          api_status: metric.status.toString(),
        },
        extra: {
          url: metric.url,
          duration: metric.duration,
        },
      }
    );
  }
}

/**
 * Register a callback for a specific metric
 */
export function onMetric(name: string, callback: (metric: PerformanceMetric) => void) {
  const callbacks = performanceCallbacks.get(name) || [];
  callbacks.push(callback);
  performanceCallbacks.set(name, callbacks);
  
  // Return unsubscribe function
  return () => {
    const currentCallbacks = performanceCallbacks.get(name) || [];
    performanceCallbacks.set(
      name,
      currentCallbacks.filter(cb => cb !== callback)
    );
  };
}

/**
 * Measure custom performance
 */
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  
  try {
    fn();
  } finally {
    const duration = performance.now() - start;
    
    const metric: PerformanceMetric = {
      name,
      value: duration,
      rating: duration < 100 ? 'good' : duration < 500 ? 'needs-improvement' : 'poor',
    };
    
    reportMetric(metric);
  }
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    observeWebVitals();
  }, []);
}

/**
 * Hook for tracking API calls
 */
export function useApiTracking() {
  const trackCall = useCallback(async <T>(
    url: string,
    method: string,
    fn: () => Promise<{ status: number; data: T }>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      
      trackApiCall({
        url,
        method,
        duration,
        status: result.status,
        success: result.status >= 200 && result.status < 300,
        timestamp: Date.now(),
      });
      
      return result.data;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      trackApiCall({
        url,
        method,
        duration,
        status: (error as any).status || 0,
        success: false,
        timestamp: Date.now(),
      });
      
      throw error;
    }
  }, []);
  
  return { trackCall };
}

/**
 * Hook for measuring component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    // Log slow re-renders
    if (renderCount.current > 1 && timeSinceLastRender > 16.67) { // 60fps threshold
      logger.debug(`Slow re-render detected: ${componentName}`, {
        renderCount: renderCount.current,
        timeSinceLastRender,
      });
    }
    
    lastRenderTime.current = now;
  });
  
  return {
    renderCount: renderCount.current,
  };
}
