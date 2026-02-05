import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Server-side Sentry configuration
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  // Edge runtime Sentry configuration
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
