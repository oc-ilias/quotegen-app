import * as Sentry from '@sentry/nextjs';

// Sentry initialization for the browser/client
Sentry.init({
  // DSN should be set in environment variables
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  
  // Environment tracking
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',
  
  // Release tracking (requires VERCEL_GIT_COMMIT_SHA or package version)
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  
  // Tracing configuration
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay configuration
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Error filtering
  beforeSend(event) {
    // Filter out specific errors if needed
    if (event.exception?.values?.some(e => 
      e.value?.includes('ResizeObserver loop limit exceeded') ||
      e.value?.includes('Script error')
    )) {
      return null;
    }
    return event;
  },
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Attach stack traces
  attachStacktrace: true,
  
  // Max breadcrumbs
  maxBreadcrumbs: 100,
  
  // Sample rate for performance monitoring
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});
