/**
 * Quotes API Route
 * 
 * CRUD operations for quotes with comprehensive error handling,
 * logging, and performance monitoring.
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createQuote, getQuotes, updateQuoteStatus, getShopSettings } from '@/lib/supabase';
import { sendEmail, newQuoteEmailTemplate, quoteStatusUpdateEmailTemplate } from '@/lib/email';
import { logger } from '@/lib/logging';
import { trackApiCall } from '@/lib/performance-monitor';
import { trackDatabaseError } from '@/lib/alerting';
import { withRequestContextAsync, getRequestId, getRequestDuration } from '@/lib/logging/context';

// Validation helpers
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validStatuses = ['pending', 'quoted', 'accepted', 'declined'] as const;
type QuoteStatus = typeof validStatuses[number];

interface CreateQuoteBody {
  shop_id: string;
  product_id: string;
  product_title: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  quantity?: number;
  message?: string;
}

interface UpdateQuoteBody {
  id: string;
  status: QuoteStatus;
  admin_notes?: string;
  quote_amount?: number;
}

/**
 * Standard API response helper
 */
function createApiResponse<T>(
  data: T | null,
  success: boolean,
  statusCode: number,
  message?: string
) {
  return NextResponse.json(
    {
      success,
      data,
      message,
      requestId: getRequestId(),
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Error handler wrapper for API routes
 */
async function handleApiError(
  error: unknown,
  operation: string,
  request: NextRequest
): Promise<NextResponse> {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // Log error with context
  logger.error(`API Error in ${operation}`, error as Error, {
    operation,
    url: request.url,
    method: request.method,
    requestId: getRequestId(),
  });
  
  // Track database errors for alerting
  if (errorMessage.includes('database') || errorMessage.includes('supabase')) {
    await trackDatabaseError();
  }
  
  // Send to Sentry
  Sentry.captureException(error, {
    level: 'error',
    tags: {
      api_operation: operation,
      api_method: request.method,
    },
    extra: {
      url: request.url,
      requestId: getRequestId(),
    },
  });
  
  // Return safe error response
  return createApiResponse(
    null,
    false,
    500,
    process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again.'
      : errorMessage
  );
}

// POST /api/quotes - Create new quote
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  const requestId = getRequestId();
  
  return withRequestContextAsync({ requestId, startTime }, async () => {
    try {
      logger.info('Creating new quote', { method: 'POST', url: request.url });
      
      const body: CreateQuoteBody = await request.json();
      
      // Validate required fields
      if (!body.shop_id || !body.product_id || !body.customer_email) {
        logger.warn('Quote creation failed: Missing required fields', {
          body: { shop_id: body.shop_id, product_id: body.product_id, hasEmail: !!body.customer_email },
        });
        
        return createApiResponse(
          null,
          false,
          400,
          'Missing required fields: shop_id, product_id, customer_email'
        );
      }
      
      // Validate email format
      if (!emailRegex.test(body.customer_email)) {
        logger.warn('Quote creation failed: Invalid email format', {
          email: body.customer_email,
        });
        
        return createApiResponse(
          null,
          false,
          400,
          'Invalid email format'
        );
      }
      
      // Create quote
      const quote = await createQuote({
        shop_id: body.shop_id,
        product_id: body.product_id,
        product_title: body.product_title,
        customer_email: body.customer_email,
        customer_name: body.customer_name || null,
        customer_phone: body.customer_phone || null,
        quantity: body.quantity || null,
        message: body.message || null,
        status: 'pending',
      });
      
      logger.info('Quote created successfully', {
        quoteId: quote.id,
        shopId: body.shop_id,
      });
      
      // Track business event
      Sentry.addBreadcrumb({
        category: 'business',
        message: 'Quote created',
        data: {
          quoteId: quote.id,
          shopId: body.shop_id,
        },
      });
      
      // Send email notification if enabled (async, don't block)
      getShopSettings(body.shop_id).then((settings) => {
        if (settings.email_notifications) {
          const { subject, html } = newQuoteEmailTemplate({
            productTitle: body.product_title,
            customerName: body.customer_name,
            customerEmail: body.customer_email,
            quantity: body.quantity,
            message: body.message,
            quoteId: quote.id,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          });
          
          // Log email attempt (actual sending would require merchant email from Shopify)
          logger.info('Email notification prepared', {
            quoteId: quote.id,
            subject,
          });
        }
      }).catch((emailError) => {
        logger.warn('Failed to prepare email notification', emailError as Error, {
          quoteId: quote.id,
        });
      });
      
      // Track API performance
      const duration = getRequestDuration();
      trackApiCall({
        url: '/api/quotes',
        method: 'POST',
        duration,
        status: 201,
        success: true,
        timestamp: Date.now(),
      });
      
      return createApiResponse(quote, true, 201);
      
    } catch (error) {
      return handleApiError(error, 'createQuote', request);
    }
  });
}

// GET /api/quotes?shop_id=xxx - Get quotes for shop
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const requestId = getRequestId();
  
  return withRequestContextAsync({ requestId, startTime }, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const shopId = searchParams.get('shop_id');
      
      logger.info('Fetching quotes', { shopId, method: 'GET' });
      
      if (!shopId) {
        logger.warn('Quote fetch failed: Missing shop_id');
        
        return createApiResponse(
          null,
          false,
          400,
          'Shop ID required'
        );
      }
      
      const quotes = await getQuotes(shopId);
      
      logger.info('Quotes fetched successfully', {
        shopId,
        count: quotes?.length || 0,
      });
      
      // Track API performance
      const duration = getRequestDuration();
      trackApiCall({
        url: '/api/quotes',
        method: 'GET',
        duration,
        status: 200,
        success: true,
        timestamp: Date.now(),
      });
      
      return createApiResponse(quotes, true, 200);
      
    } catch (error) {
      return handleApiError(error, 'getQuotes', request);
    }
  });
}

// PATCH /api/quotes - Update quote status
export async function PATCH(request: NextRequest) {
  const startTime = performance.now();
  const requestId = getRequestId();
  
  return withRequestContextAsync({ requestId, startTime }, async () => {
    try {
      const body: UpdateQuoteBody = await request.json();
      
      logger.info('Updating quote', {
        quoteId: body.id,
        status: body.status,
      });
      
      if (!body.id || !body.status) {
        logger.warn('Quote update failed: Missing id or status');
        
        return createApiResponse(
          null,
          false,
          400,
          'Quote ID and status required'
        );
      }
      
      if (!validStatuses.includes(body.status)) {
        logger.warn('Quote update failed: Invalid status', {
          status: body.status,
          validStatuses,
        });
        
        return createApiResponse(
          null,
          false,
          400,
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        );
      }
      
      const quote = await updateQuoteStatus(
        body.id,
        body.status,
        body.admin_notes,
        body.quote_amount
      );
      
      logger.info('Quote updated successfully', {
        quoteId: body.id,
        status: body.status,
      });
      
      // Track business event
      Sentry.addBreadcrumb({
        category: 'business',
        message: 'Quote status updated',
        data: {
          quoteId: body.id,
          status: body.status,
          quoteAmount: body.quote_amount,
        },
      });
      
      // Send status update email (async)
      if (['quoted', 'accepted', 'declined'].includes(body.status)) {
        Promise.resolve().then(async () => {
          try {
            const { subject, html } = quoteStatusUpdateEmailTemplate({
              productTitle: quote.product_title,
              status: body.status,
              quoteAmount: body.quote_amount,
              shopName: 'Your Store',
              shopUrl: `https://${quote.shop_id}`,
            });
            
            logger.info('Status update email prepared', {
              quoteId: body.id,
              subject,
            });
          } catch (emailError) {
            logger.warn('Failed to prepare status email', emailError as Error, {
              quoteId: body.id,
            });
          }
        });
      }
      
      // Track API performance
      const duration = getRequestDuration();
      trackApiCall({
        url: '/api/quotes',
        method: 'PATCH',
        duration,
        status: 200,
        success: true,
        timestamp: Date.now(),
      });
      
      return createApiResponse(quote, true, 200);
      
    } catch (error) {
      return handleApiError(error, 'updateQuote', request);
    }
  });
}
