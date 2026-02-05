import * as Sentry from '@sentry/nextjs';

// Sentry initialization for edge runtime
Sentry.init({
  // DSN should be set in environment variables
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  
  // Environment tracking
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  
  // Tracing configuration
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Minimal configuration for edge
  debug: process.env.NODE_ENV === 'development',
});
