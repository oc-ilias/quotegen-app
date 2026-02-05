/**
 * Performance Monitoring Library
 * Web Vitals tracking and custom performance marks
 * @module lib/performance
 */

'use client';

import { useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface WebVitalsMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
  CLS?: number; // Cumulative Layout Shift
  INP?: number; // Interaction to Next Paint
  
  // Additional metrics
  TTI?: number; // Time to Interactive
  TBT?: number; // Total Blocking Time
}

export interface PerformanceReport {
  metrics: WebVitalsMetrics;
  url: string;
  timestamp: number;
  userAgent: string;
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
}

export type MetricName = keyof WebVitalsMetrics;

export type PerformanceObserverCallback = (metric: {
  name: string;
  value: number;
  delta?: number;
  id?: string;
  entries?: PerformanceEntry[];
}) => void;

// ============================================================================
// Web Vitals Collection
// ============================================================================

const webVitalsCallbacks = new Map<MetricName, Set<PerformanceObserverCallback>>();

function getOrCreateCallbacks(metric: MetricName): Set<PerformanceObserverCallback> {
  if (!webVitalsCallbacks.has(metric)) {
    webVitalsCallbacks.set(metric, new Set());
  }
  return webVitalsCallbacks.get(metric)!;
}

/**
 * Register a callback for a specific Web Vital metric
 */
export function onWebVital(metric: MetricName, callback: PerformanceObserverCallback): () => void {
  const callbacks = getOrCreateCallbacks(metric);
  callbacks.add(callback);

  return () => {
    callbacks.delete(callback);
  };
}

/**
 * Report a metric to all registered callbacks
 */
function reportMetric(name: MetricName, value: number, entries?: PerformanceEntry[]): void {
  const callbacks = webVitalsCallbacks.get(name);
  if (callbacks) {
    callbacks.forEach((cb) => {
      try {
        cb({
          name,
          value,
          entries,
        });
      } catch (error) {
        console.error(`Error in Web Vitals callback for ${name}:`, error);
      }
    });
  }
}

// ============================================================================
// Metric Collectors
// ============================================================================

/**
 * Collect Largest Contentful Paint (LCP)
 */
function collectLCP(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  let lcpValue = 0;
  let lcpEntries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((entries) => {
    const lastEntry = entries.getEntries().at(-1) as PerformanceEntry &amp; { startTime: number };
    if (lastEntry) {
      lcpValue = lastEntry.startTime;
      lcpEntries = Array.from(entries.getEntries());
      reportMetric('LCP', lcpValue, lcpEntries);
    }
  });

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // Report final LCP on page hide
    const reportFinalLCP = () => {
      if (lcpValue > 0) {
        reportMetric('LCP', lcpValue, lcpEntries);
      }
      observer.disconnect();
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportFinalLCP();
      }
    });
  } catch {
    // LCP not supported
  }
}

/**
 * Collect First Input Delay (FID) and Interaction to Next Paint (INP)
 */
function collectFID(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((entries) => {
    entries.getEntries().forEach((entry) => {
      const eventEntry = entry as PerformanceEventTiming;
      if (eventEntry.processingStart && eventEntry.startTime) {
        const delay = eventEntry.processingStart - eventEntry.startTime;
        reportMetric('FID', delay, [entry]);
      }
    });
  });

  try {
    observer.observe({ type: 'first-input', buffered: true });
  } catch {
    // FID not supported
  }
}

/**
 * Collect First Contentful Paint (FCP)
 */
function collectFCP(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((entries) => {
    entries.getEntries().forEach((entry) => {
      const paintEntry = entry as PerformancePaintTiming;
      if (paintEntry.name === 'first-contentful-paint') {
        reportMetric('FCP', paintEntry.startTime, [entry]);
      }
    });
  });

  try {
    observer.observe({ type: 'paint', buffered: true });
  } catch {
    // FCP not supported
  }
}

/**
 * Collect Time to First Byte (TTFB)
 */
function collectTTFB(): void {
  if (typeof window === 'undefined') return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    const ttfb = navigation.responseStart - navigation.startTime;
    reportMetric('TTFB', ttfb, [navigation]);
  }
}

/**
 * Collect Cumulative Layout Shift (CLS)
 */
function collectCLS(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  let clsValue = 0;
  let clsEntries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((entries) => {
    entries.getEntries().forEach((entry) => {
      const layoutShiftEntry = entry as PerformanceEntry &amp; { hadRecentInput: boolean; value: number };
      if (!layoutShiftEntry.hadRecentInput) {
        clsValue += layoutShiftEntry.value;
        clsEntries.push(entry);
      }
    });
  });

  try {
    observer.observe({ type: 'layout-shift', buffered: true });

    // Report final CLS on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' &amp;&amp; clsValue > 0) {
        reportMetric('CLS', clsValue, clsEntries);
      }
    });
  } catch {
    // CLS not supported
  }
}

/**
 * Collect Interaction to Next Paint (INP) - modern replacement for FID
 */
function collectINP(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  let maxDuration = 0;
  const inpEntries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((entries) => {
    entries.getEntries().forEach((entry) => {
      const eventEntry = entry as PerformanceEventTiming;
      const duration = eventEntry.duration;
      if (duration > maxDuration) {
        maxDuration = duration;
        inpEntries.push(entry);
      }
      reportMetric('INP', maxDuration, inpEntries);
    });
  });

  try {
    observer.observe({ type: 'event', buffered: true, durationThreshold: 0 });
  } catch {
    // INP not supported
  }
}

// ============================================================================
// Performance Marks and Measures
// ============================================================================

const marks = new Map<string, number>();

/**
 * Create a performance mark
 */
export function mark(name: string): void {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const markName = `quotegen_${name}`;
  performance.mark(markName);
  marks.set(name, performance.now());
}

/**
 * Measure duration between two marks
 */
export function measure(name: string, startMark?: string, endMark?: string): number | null {
  if (typeof window === 'undefined' || !('performance' in window)) return null;

  const measureName = `quotegen_${name}`;
  const start = startMark ? `quotegen_${startMark}` : undefined;
  const end = endMark ? `quotegen_${endMark}` : undefined;

  try {
    performance.measure(measureName, start, end);
    const measures = performance.getEntriesByName(measureName, 'measure');
    return measures[measures.length - 1]?.duration ?? null;
  } catch (error) {
    console.warn(`Failed to create measure ${name}:`, error);
    return null;
  }
}

/**
 * Get duration since a mark was created
 */
export function getDurationSinceMark(name: string): number | null {
  const markTime = marks.get(name);
  if (!markTime || typeof window === 'undefined') return null;
  return performance.now() - markTime;
}

/**
 * Clear a performance mark
 */
export function clearMark(name: string): void {
  if (typeof window === 'undefined') return;
  
  const markName = `quotegen_${name}`;
  performance.clearMarks(markName);
  marks.delete(name);
}

// ============================================================================
// Analytics Reporting
// ============================================================================

const analyticsCallbacks: ((report: PerformanceReport) => void)[] = [];

/**
 * Register an analytics callback
 */
export function onPerformanceReport(callback: (report: PerformanceReport) => void): () => void {
  analyticsCallbacks.push(callback);
  return () => {
    const index = analyticsCallbacks.indexOf(callback);
    if (index > -1) {
      analyticsCallbacks.splice(index, 1);
    }
  };
}

/**
 * Report performance metrics to all registered analytics callbacks
 */
export function reportToAnalytics(metrics: WebVitalsMetrics): void {
  const report: PerformanceReport = {
    metrics,
    url: typeof window !== 'undefined' ? window.location.href : '',
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    connection: typeof navigator !== 'undefined' &amp;&amp; 'connection' in navigator
      ? {
          effectiveType: (navigator as Navigator &amp; { connection?: NetworkInformation }).connection?.effectiveType,
          downlink: (navigator as Navigator &amp; { connection?: NetworkInformation }).connection?.downlink,
          rtt: (navigator as Navigator &amp; { connection?: NetworkInformation }).connection?.rtt,
          saveData: (navigator as Navigator &amp; { connection?: NetworkInformation }).connection?.saveData,
        }
      : undefined,
  };

  analyticsCallbacks.forEach((cb) => {
    try {
      cb(report);
    } catch (error) {
      console.error('Error in performance analytics callback:', error);
    }
  });
}

/**
 * Send metrics to Google Analytics 4
 */
export function sendToGA4(metrics: WebVitalsMetrics): void {
  if (typeof window === 'undefined' || !('gtag' in window)) return;

  const gtag = (window as Window &amp; { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;

  Object.entries(metrics).forEach(([name, value]) => {
    if (value !== undefined) {
      gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(value),
        custom_parameter_1: name,
      });
    }
  });
}

// ============================================================================
// Initialization
// ============================================================================

let isInitialized = false;

/**
 * Initialize Web Vitals collection
 */
export function initPerformanceMonitoring(options: {
  reportToConsole?: boolean;
  reportToAnalytics?: boolean;
  analyticsCallback?: (report: PerformanceReport) => void;
} = {}): void {
  if (isInitialized || typeof window === 'undefined') return;
  
  const { 
    reportToConsole = process.env.NODE_ENV === 'development',
    reportToAnalytics: shouldReportToAnalytics = false,
    analyticsCallback,
  } = options;

  // Collect all metrics
  collectLCP();
  collectFID();
  collectFCP();
  collectTTFB();
  collectCLS();
  collectINP();

  // Console reporting
  if (reportToConsole) {
    const metricsBuffer: Partial<WebVitalsMetrics> = {};
    
    const logMetric = (name: MetricName, value: number) => {
      metricsBuffer[name] = value;
      
      // Log with color coding based on thresholds
      let color = '#22c55e'; // green (good)
      let rating = 'good';
      
      switch (name) {
        case 'LCP':
          if (value > 4000) { color = '#ef4444'; rating = 'poor'; }
          else if (value > 2500) { color = '#eab308'; rating = 'needs improvement'; }
          break;
        case 'FID':
        case 'INP':
          if (value > 500) { color = '#ef4444'; rating = 'poor'; }
          else if (value > 200) { color = '#eab308'; rating = 'needs improvement'; }
          break;
        case 'CLS':
          if (value > 0.25) { color = '#ef4444'; rating = 'poor'; }
          else if (value > 0.1) { color = '#eab308'; rating = 'needs improvement'; }
          break;
        case 'FCP':
          if (value > 3000) { color = '#ef4444'; rating = 'poor'; }
          else if (value > 1800) { color = '#eab308'; rating = 'needs improvement'; }
          break;
      }

      // eslint-disable-next-line no-console
      console.log(
        `%c[Web Vitals] ${name}: ${value.toFixed(2)}ms (${rating})`,
        `color: ${color}; font-weight: bold;`
      );

      // Report full buffer when we have all core vitals
      if (metricsBuffer.LCP &amp;&amp; metricsBuffer.FID &amp;&amp; metricsBuffer.CLS) {
        // eslint-disable-next-line no-console
        console.log('%c[Web Vitals] Full Report:', 'color: #6366f1; font-weight: bold;', metricsBuffer);
      }
    };

    (['LCP', 'FID', 'FCP', 'TTFB', 'CLS', 'INP'] as MetricName[]).forEach((metric) => {
      onWebVital(metric, ({ name, value }) => logMetric(name as MetricName, value));
    });
  }

  // Analytics reporting
  if (shouldReportToAnalytics || analyticsCallback) {
    if (analyticsCallback) {
      onPerformanceReport(analyticsCallback);
    }

    const metricsBuffer: Partial<WebVitalsMetrics> = {};
    
    (['LCP', 'FID', 'FCP', 'TTFB', 'CLS', 'INP'] as MetricName[]).forEach((metric) => {
      onWebVital(metric, ({ name, value }) => {
        metricsBuffer[name as MetricName] = value;
        reportToAnalytics(metricsBuffer as WebVitalsMetrics);
      });
    });
  }

  isInitialized = true;
}

// ============================================================================
// React Hook
// ============================================================================

export function usePerformanceMonitoring(options: {
  componentName?: string;
  reportOnMount?: boolean;
  reportOnUnmount?: boolean;
} = {}): void {
  const { componentName = 'Component', reportOnMount = false, reportOnUnmount = false } = options;

  useEffect(() => {
    const mountMark = `${componentName}_mount`;
    mark(mountMark);

    if (reportOnMount) {
      // eslint-disable-next-line no-console
      console.log(`[Performance] ${componentName} mounted`);
    }

    return () => {
      if (reportOnUnmount) {
        const duration = getDurationSinceMark(mountMark);
        // eslint-disable-next-line no-console
        console.log(`[Performance] ${componentName} lifetime: ${duration?.toFixed(2)}ms`);
      }
      clearMark(mountMark);
    };
  }, [componentName, reportOnMount, reportOnUnmount]);
}

// ============================================================================
// Resource Loading
// ============================================================================

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: 'script' | 'style' | 'font' | 'image' | 'fetch', 
  options?: { type?: string; crossOrigin?: boolean }): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (options?.type) {
    link.type = options.type;
  }
  
  if (options?.crossOrigin) {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Prefetch resources for next navigation
 */
export function prefetchResource(href: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Preconnect to a domain
 */
export function preconnect(href: string, crossOrigin = true): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = href;
  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

/**
 * DNS prefetch
 */
export function dnsPrefetch(href: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = href;
  document.head.appendChild(link);
}

// ============================================================================
// Export default object
// ============================================================================

export default {
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
};
