import * as Sentry from '@sentry/nextjs';

// Sentry initialization for the server
Sentry.init({
  // DSN should be set in environment variables
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  
  // Environment tracking
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  
  // Tracing configuration - lower rate in production for cost control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Error filtering
  beforeSend(event) {
    // Filter out known non-actionable errors
    if (event.exception?.values?.some(e => 
      e.value?.includes('ECONNRESET') ||
      e.value?.includes('ETIMEDOUT') ||
      e.value?.includes('Network Error')
    )) {
      // Still log but with lower severity
      event.level = 'warning';
    }
    return event;
  },
  
  // Server-specific configuration
  serverName: process.env.VERCEL_REGION || 'unknown',
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Max value length for extra data
  maxValueLength: 1000,
  
  // Normalize depth for serialized objects
  normalizeDepth: 10,
});
