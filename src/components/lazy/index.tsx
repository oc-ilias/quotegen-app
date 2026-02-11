/**
 * Lazy Loading Components
 * Provides dynamic imports and code splitting for heavy components
 * @module components/lazy
 */

'use client';

import { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { LoadingSpinner } from '@/components/ErrorBoundary';

// ============================================================================
// Loading Fallback Components
// ============================================================================

interface LoadingFallbackProps {
  message?: string;
  fullPage?: boolean;
}

export function LoadingFallback({ message = 'Loading...', fullPage = false }: LoadingFallbackProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullPage ? 'min-h-[60vh]' : 'py-12'}`}>
      <LoadingSpinner size="lg" />
      <p className="text-gray-500 animate-pulse">{message}</p>
    </div>
  );

  return content;
}

export function TableLoadingFallback() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 rounded mb-2" />
      ))}
    </div>
  );
}

export function CardLoadingFallback({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

// ============================================================================
// Lazy Loaded Components
// ============================================================================

// Heavy: PDF Components - only loaded when needed
export const QuotePDF = lazy(() => 
  import('@/components/pdf/QuotePDF').then(mod => ({ default: mod.QuotePDF }))
);

// Heavy: Analytics Charts - only loaded when analytics tab is accessed
export const AnalyticsDashboard = lazy(() => 
  import('@/components/analytics/AnalyticsDashboard').then(mod => ({ default: mod.AnalyticsDashboard }))
);

// Heavy: Wizard Components - only loaded when creating quotes
export const QuoteWizardEnhanced = lazy(() => 
  import('@/components/wizard/QuoteWizardEnhanced').then(mod => ({ default: mod.QuoteWizardEnhanced }))
);

// ============================================================================
// Suspense Wrapper Components
// ============================================================================

interface LazyComponentProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

export function LazyPDFViewer(props: React.ComponentProps<typeof PDFViewer>) {
  return (
    <Suspense fallback={<LoadingFallback message="Loading PDF viewer..." />}>
      <PDFViewer {...props} />
    </Suspense>
  );
}

export function LazyQuoteAnalytics(props: React.ComponentProps<typeof QuoteAnalytics>) {
  return (
    <Suspense fallback={<LoadingFallback message="Loading analytics..." />}>
      <QuoteAnalytics {...props} />
    </Suspense>
  );
}

export function LazyDataGrid(props: React.ComponentProps<typeof DataGrid>) {
  return (
    <Suspense fallback={<TableLoadingFallback />}>
      <DataGrid {...props} />
    </Suspense>
  );
}

export function LazyRichTextEditor(props: React.ComponentProps<typeof RichTextEditor>) {
  return (
    <Suspense fallback={<LoadingFallback message="Loading editor..." />}>
      <RichTextEditor {...props} />
    </Suspense>
  );
}

export function LazyQuoteWizard(props: React.ComponentProps<typeof QuoteWizard>) {
  return (
    <Suspense fallback={<LoadingFallback message="Loading wizard..." fullPage />}>
      <QuoteWizard {...props} />
    </Suspense>
  );
}

// ============================================================================
// Dynamic Import Helper
// ============================================================================

/**
 * Creates a lazy loaded component with a custom loading fallback
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// ============================================================================
// Preload Utilities
// ============================================================================

const preloadedModules = new Set<string>();

/**
 * Preload a component in the background
 * Call this when you anticipate the user will need a component soon
 */
export function preloadComponent(componentName: 'pdf' | 'analytics' | 'wizard' | 'charts') {
  if (preloadedModules.has(componentName)) return;
  
  preloadedModules.add(componentName);
  
  // Use requestIdleCallback to preload during browser idle time
  const preload = () => {
    switch (componentName) {
      case 'pdf':
        import('@/components/PDFViewer');
        break;
      case 'analytics':
        import('@/components/QuoteAnalytics');
        break;
      case 'wizard':
        import('@/components/QuoteWizard');
        break;
      case 'charts':
        import('@/components/QuoteAnalytics');
        break;
    }
  };

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(preload, { timeout: 2000 });
  } else {
    setTimeout(preload, 100);
  }
}

/**
 * Hook to preload a component on hover or focus
 */
export function usePreloadOnInteraction(componentName: 'pdf' | 'analytics' | 'wizard' | 'charts') {
  return {
    onMouseEnter: () => preloadComponent(componentName),
    onFocus: () => preloadComponent(componentName),
  };
}

export default {
  PDFViewer: LazyPDFViewer,
  QuoteAnalytics: LazyQuoteAnalytics,
  DataGrid: LazyDataGrid,
  RichTextEditor: LazyRichTextEditor,
  QuoteWizard: LazyQuoteWizard,
  LoadingFallback,
  TableLoadingFallback,
  CardLoadingFallback,
  createLazyComponent,
  preloadComponent,
  usePreloadOnInteraction,
};
