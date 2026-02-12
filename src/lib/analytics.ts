// Analytics and monitoring setup
import { useEffect } from 'react';

// Track page views
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
  }
}

// Track events
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Custom analytics hook
export function useAnalytics() {
  useEffect(() => {
    // Track initial page view
    trackPageView(window.location.pathname);
    
    // Track on route change
    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };
    
    window.addEventListener('popstate', () => handleRouteChange(window.location.pathname));
    
    return () => {
      window.removeEventListener('popstate', () => handleRouteChange(window.location.pathname));
    };
  }, []);
}

// Performance monitoring
export function reportWebVitals(metric: any) {
  // Send to analytics
  console.log('Web Vital:', metric);
  
  // TODO: Send to your analytics service
  // Example: send to Vercel Analytics, Google Analytics, etc.
}

// Error tracking
export function trackError(error: Error, context?: Record<string, any>) {
  console.error('Tracked error:', error, context);
  
  // TODO: Send to error tracking service (Sentry, etc.)
  // Sentry.captureException(error, { extra: context });
}

// Business metrics
export const metrics = {
  quoteCreated: () => trackEvent('quote_created', 'engagement'),
  quoteStatusUpdated: (status: string) => 
    trackEvent('quote_status_updated', 'engagement', status),
  settingsSaved: () => trackEvent('settings_saved', 'engagement'),
  buttonClicked: () => trackEvent('button_clicked', 'engagement'),
  formSubmitted: () => trackEvent('form_submitted', 'conversion'),
  upgradeClicked: () => trackEvent('upgrade_clicked', 'revenue'),
};