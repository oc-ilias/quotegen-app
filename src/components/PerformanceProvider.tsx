/**
 * Performance Provider Component
 * Initializes performance monitoring and Web Vitals tracking
 * @module components/PerformanceProvider
 */

'use client';

import { ReactNode, useEffect, useCallback, useState } from 'react';
import { initPerformanceMonitoring, onWebVital, type WebVitalsMetrics } from '@/lib/performance';

interface PerformanceProviderProps {
  children: ReactNode;
  enableConsoleReporting?: boolean;
  enableAnalyticsReporting?: boolean;
  onMetricsCollected?: (metrics: WebVitalsMetrics) => void;
}

interface PerformanceContextValue {
  metrics: WebVitalsMetrics;
  isMonitoring: boolean;
}

export function PerformanceProvider({
  children,
  enableConsoleReporting = process.env.NODE_ENV === 'development',
  enableAnalyticsReporting = false,
  onMetricsCollected,
}: PerformanceProviderProps) {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [isMonitoring, setIsMonitoring] = useState(false);

  const handleMetric = useCallback(
    (name: keyof WebVitalsMetrics, value: number) => {
      setMetrics((prev) => {
        const updated = { ...prev, [name]: value };
        onMetricsCollected?.(updated);
        return updated;
      });
    },
    [onMetricsCollected]
  );

  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring({
      reportToConsole: enableConsoleReporting,
      reportToAnalytics: enableAnalyticsReporting,
    });

    // Register metric collectors
    const unsubscribeLCP = onWebVital('LCP', ({ value }) => handleMetric('LCP', value));
    const unsubscribeFID = onWebVital('FID', ({ value }) => handleMetric('FID', value));
    const unsubscribeFCP = onWebVital('FCP', ({ value }) => handleMetric('FCP', value));
    const unsubscribeTTFB = onWebVital('TTFB', ({ value }) => handleMetric('TTFB', value));
    const unsubscribeCLS = onWebVital('CLS', ({ value }) => handleMetric('CLS', value));
    const unsubscribeINP = onWebVital('INP', ({ value }) => handleMetric('INP', value));

    setIsMonitoring(true);

    return () => {
      unsubscribeLCP();
      unsubscribeFID();
      unsubscribeFCP();
      unsubscribeTTFB();
      unsubscribeCLS();
      unsubscribeINP();
    };
  }, [enableConsoleReporting, enableAnalyticsReporting, handleMetric]);

  // Log performance budget violations
  useEffect(() => {
    if (Object.keys(metrics).length === 0) return;

    // Check Core Web Vitals thresholds
    const violations: string[] = [];

    if (metrics.LCP && metrics.LCP > 2500) {
      violations.push(`LCP: ${metrics.LCP.toFixed(0)}ms (threshold: 2500ms)`);
    }
    if (metrics.FID && metrics.FID > 100) {
      violations.push(`FID: ${metrics.FID.toFixed(0)}ms (threshold: 100ms)`);
    }
    if (metrics.CLS && metrics.CLS > 0.1) {
      violations.push(`CLS: ${metrics.CLS.toFixed(3)} (threshold: 0.1)`);
    }
    if (metrics.FCP && metrics.FCP > 1800) {
      violations.push(`FCP: ${metrics.FCP.toFixed(0)}ms (threshold: 1800ms)`);
    }
    if (metrics.TTFB && metrics.TTFB > 600) {
      violations.push(`TTFB: ${metrics.TTFB.toFixed(0)}ms (threshold: 600ms)`);
    }
    if (metrics.INP && metrics.INP > 200) {
      violations.push(`INP: ${metrics.INP.toFixed(0)}ms (threshold: 200ms)`);
    }

    if (violations.length > 0 && process.env.NODE_ENV === 'development') {
      console.warn(
        '%c[Performance Budget] Threshold exceeded:\n',
        'color: #ef4444; font-weight: bold;',
        violations.join('\n')
      );
    }
  }, [metrics]);

  return <>{children}</>;
}

// ============================================================================
// Performance Budget Monitor
// ============================================================================

interface PerformanceBudgetProps {
  metric: keyof WebVitalsMetrics;
  threshold: number;
  onViolation?: (value: number, threshold: number) => void;
  children: (value: number | undefined, isViolating: boolean) => ReactNode;
}

export function PerformanceBudget({
  metric,
  threshold,
  onViolation,
  children,
}: PerformanceBudgetProps) {
  const [value, setValue] = useState<number | undefined>();

  useEffect(() => {
    return onWebVital(metric as any, ({ value: metricValue }) => {
      setValue(metricValue);
      
      if (metricValue > threshold) {
        onViolation?.(metricValue, threshold);
      }
    });
  }, [metric, threshold, onViolation]);

  const isViolating = value !== undefined && value > threshold;

  return <>{children(value, isViolating)}</>;
}

// ============================================================================
// Performance Metrics Display (Development Only)
// ============================================================================

export function PerformanceMetricsDisplay() {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Alt+P
      if (e.altKey && e.key === 'p') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Subscribe to all metrics
    const unsubscribers = [
      onWebVital('LCP', ({ value }) => setMetrics((m) => ({ ...m, LCP: value }))),
      onWebVital('FID', ({ value }) => setMetrics((m) => ({ ...m, FID: value }))),
      onWebVital('FCP', ({ value }) => setMetrics((m) => ({ ...m, FCP: value }))),
      onWebVital('TTFB', ({ value }) => setMetrics((m) => ({ ...m, TTFB: value }))),
      onWebVital('CLS', ({ value }) => setMetrics((m) => ({ ...m, CLS: value }))),
      onWebVital('INP', ({ value }) => setMetrics((m) => ({ ...m, INP: value }))),
    ];

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  const getMetricColor = (name: keyof WebVitalsMetrics, value: number): string => {
    switch (name) {
      case 'LCP':
        return value > 4000 ? 'text-red-500' : value > 2500 ? 'text-yellow-500' : 'text-green-500';
      case 'FID':
      case 'INP':
        return value > 500 ? 'text-red-500' : value > 200 ? 'text-yellow-500' : 'text-green-500';
      case 'CLS':
        return value > 0.25 ? 'text-red-500' : value > 0.1 ? 'text-yellow-500' : 'text-green-500';
      case 'FCP':
        return value > 3000 ? 'text-red-500' : value > 1800 ? 'text-yellow-500' : 'text-green-500';
      case 'TTFB':
        return value > 800 ? 'text-red-500' : value > 600 ? 'text-yellow-500' : 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatValue = (name: keyof WebVitalsMetrics, value: number): string => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900">Web Vitals</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        {Object.entries(metrics).map(([name, value]) => (
          <div key={name} className="flex justify-between">
            <span className="text-gray-600">{name}:</span>
            <span className={getMetricColor(name as keyof WebVitalsMetrics, value)}>
              {formatValue(name as keyof WebVitalsMetrics, value)}
            </span>
          </div>
        ))}
        
        {Object.keys(metrics).length === 0 && (
          <p className="text-gray-400 italic">Waiting for metrics...</p>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t text-xs text-gray-400">
        Press Alt+P to toggle
      </div>
    </div>
  );
}

export default PerformanceProvider;
