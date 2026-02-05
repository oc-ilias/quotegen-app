/**
 * Lazy Loaded Components
 * Exports dynamically imported components for code splitting
 * @module components/lazy
 */

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import {
  ChartSkeleton,
  CardSkeleton,
  ActivityFeedSkeleton,
  WizardStepSkeleton,
} from '@/components/ui/Skeleton';

// ============================================================================
// Analytics Components (Heavy - Lazy Loaded)
// ============================================================================

export const LazyAnalyticsDashboard = dynamic(
  () => import('@/components/analytics/AnalyticsDashboard').then(mod => mod.AnalyticsDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSkeleton height={300} />
          <ChartSkeleton height={300} />
        </div>
      </div>
    ),
  }
);

export const LazyRevenueChart = dynamic(
  () => import('@/components/analytics/RevenueChart').then(mod => mod.RevenueChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={400} />,
  }
);

export const LazyConversionChart = dynamic(
  () => import('@/components/analytics/ConversionChart').then(mod => mod.ConversionChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={400} />,
  }
);

export const LazyStatusBreakdown = dynamic(
  () => import('@/components/analytics/StatusBreakdown').then(mod => mod.StatusBreakdown),
  {
    ssr: false,
    loading: () => <CardSkeleton header contentLines={5} />,
  }
);

export const LazyTopProducts = dynamic(
  () => import('@/components/analytics/TopProducts').then(mod => mod.TopProducts),
  {
    ssr: false,
    loading: () => <CardSkeleton header contentLines={5} />,
  }
);

// ============================================================================
// PDF Components (Heavy - Lazy Loaded)
// ============================================================================

export const LazyQuotePDF = dynamic(
  () => import('@/components/pdf/QuotePDF').then(mod => mod.QuotePDFDocument),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
          Loading PDF generator...
        </div>
      </div>
    ),
  }
);

export const LazyPDFDownloadButton = dynamic(
  () => import('@/components/pdf/QuotePDF').then(mod => mod.PDFDownloadButton),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-400 rounded-lg cursor-not-allowed"
      >
        <div className="w-4 h-4 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin" />
        Loading...
      </button>
    ),
  }
);

export const LazyPDFPreview = dynamic(
  () => import('@/components/pdf/QuotePDF').then(mod => mod.PDFPreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] bg-slate-900/50 rounded-xl">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
          Loading PDF preview...
        </div>
      </div>
    ),
  }
);

// ============================================================================
// Wizard Step Components (Lazy Loaded for Progressive Loading)
// ============================================================================

export const LazyCustomerInfoStep = dynamic(
  () => import('@/components/wizard/steps/CustomerInfoStep'),
  {
    ssr: false,
    loading: () => <WizardStepSkeleton />,
  }
);

export const LazyProductSelectionStep = dynamic(
  () => import('@/components/wizard/steps/ProductSelectionStep'),
  {
    ssr: false,
    loading: () => <WizardStepSkeleton />,
  }
);

export const LazyLineItemsStep = dynamic(
  () => import('@/components/wizard/steps/LineItemsStep'),
  {
    ssr: false,
    loading: () => <WizardStepSkeleton />,
  }
);

export const LazyTermsNotesStep = dynamic(
  () => import('@/components/wizard/steps/TermsNotesStep'),
  {
    ssr: false,
    loading: () => <WizardStepSkeleton />,
  }
);

export const LazyReviewSendStep = dynamic(
  () => import('@/components/wizard/steps/ReviewSendStep'),
  {
    ssr: false,
    loading: () => <WizardStepSkeleton />,
  }
);

// ============================================================================
// Dashboard Components
// ============================================================================

export const LazyActivityFeed = dynamic(
  () => import('@/components/dashboard/ActivityFeed').then(mod => mod.ActivityFeed),
  {
    ssr: false,
    loading: () => (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <ActivityFeedSkeleton />
      </div>
    ),
  }
);

export const LazyRecentQuotes = dynamic(
  () => import('@/components/dashboard/RecentQuotes'),
  {
    ssr: false,
    loading: () => <CardSkeleton header contentLines={5} />,
  }
);

// ============================================================================
// Email Components
// ============================================================================

export const LazyEmailHistory = dynamic(
  () => import('@/components/email/EmailHistory').then(mod => mod.EmailHistory),
  {
    ssr: false,
    loading: () => <CardSkeleton header contentLines={5} />,
  }
);

// ============================================================================
// Wrappers with Suspense boundaries
// ============================================================================

interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyAnalyticsWrapper({ children, fallback }: LazyComponentWrapperProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartSkeleton height={300} />
              <ChartSkeleton height={300} />
            </div>
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

export function LazyPDFWrapper({ children, fallback }: LazyComponentWrapperProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-slate-500">
              <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
              Loading PDF...
            </div>
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

export function LazyWizardWrapper({ children, fallback }: LazyComponentWrapperProps) {
  return (
    <Suspense fallback={fallback || <WizardStepSkeleton />}>
      {children}
    </Suspense>
  );
}

// ============================================================================
// Preload functions for eager loading when needed
// ============================================================================

export function preloadAnalytics(): void {
  void import('@/components/analytics/AnalyticsDashboard');
  void import('@/components/analytics/RevenueChart');
  void import('@/components/analytics/ConversionChart');
}

export function preloadPDF(): void {
  void import('@/components/pdf/QuotePDF');
}

export function preloadWizardStep(step: 'customer-info' | 'product-selection' | 'line-items' | 'terms-notes' | 'review-send'): void {
  const stepImports = {
    'customer-info': () => import('@/components/wizard/steps/CustomerInfoStep'),
    'product-selection': () => import('@/components/wizard/steps/ProductSelectionStep'),
    'line-items': () => import('@/components/wizard/steps/LineItemsStep'),
    'terms-notes': () => import('@/components/wizard/steps/TermsNotesStep'),
    'review-send': () => import('@/components/wizard/steps/ReviewSendStep'),
  };
  void stepImports[step]();
}

// Re-export original components for static imports when needed
export { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
export { RevenueChart } from '@/components/analytics/RevenueChart';
export { PDFDownloadButton, PDFPreview } from '@/components/pdf/QuotePDF';
