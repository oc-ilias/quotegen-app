/**
 * Global Error Component
 * 
 * Next.js app directory global error handler.
 * Catches errors at the root layout level.
 */

'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error, {
      level: 'fatal',
      tags: {
        source: 'global_error_boundary',
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something Went Wrong
          </h1>
          
          <p className="text-gray-600 mb-6">
            We apologize for the inconvenience. Our team has been notified and is working on the issue.
          </p>
          
          {error.digest && (
            <p className="text-sm text-gray-400 mb-6">
              Error ID: {error.digest}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Try Again
            </button>
            
            <a
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
