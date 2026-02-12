/**
 * Quote Expiration API Route
 * POST /api/quotes/expire
 * Triggers expiration processing for quotes
 * @module app/api/quotes/expire/route
 */

import { NextRequest } from 'next/server';
import { handleExpirationRequest } from '@/lib/expiration';

export async function POST(request: NextRequest) {
  return handleExpirationRequest(request);
}

// Also allow GET for simple cron job integrations
export async function GET(request: NextRequest) {
  return handleExpirationRequest(request);
}
