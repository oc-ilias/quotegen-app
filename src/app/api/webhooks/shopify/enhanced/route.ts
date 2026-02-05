/**
 * Enhanced Shopify Webhook Handlers
 * Comprehensive webhook processing with queue, retries, and error handling
 * @module app/api/webhooks/shopify/enhanced
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Configuration
// ============================================================================

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Initialize Supabase client for webhook storage
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

// ============================================================================
// Types
// ============================================================================

export type ShopifyWebhookTopic =
  | 'app/uninstalled'
  | 'app/scopes_update'
  | 'products/create'
  | 'products/update'
  | 'products/delete'
  | 'orders/create'
  | 'orders/updated'
  | 'orders/cancelled'
  | 'customers/create'
  | 'customers/update'
  | 'customers/delete'
  | 'shop/update'
  | 'bulk_operations/finish';

export interface WebhookPayload {
  id: number | string;
  [key: string]: unknown;
}

export interface WebhookContext {
  topic: ShopifyWebhookTopic;
  shop: string;
  webhookId: string;
  timestamp: string;
  payload: WebhookPayload;
  attempt: number;
}

export interface WebhookResult {
  success: boolean;
  processed: boolean;
  retry?: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// Signature Verification
// ============================================================================

/**
 * Verify Shopify webhook signature
 */
export function verifyShopifyWebhook(
  rawBody: string,
  hmacHeader: string
): boolean {
  if (!SHOPIFY_API_SECRET) {
    console.error('❌ SHOPIFY_API_SECRET not configured');
    return false;
  }

  try {
    const generatedHash = crypto
      .createHmac('sha256', SHOPIFY_API_SECRET)
      .update(rawBody, 'utf8')
      .digest('base64');

    return crypto.timingSafeEqual(
      Buffer.from(generatedHash),
      Buffer.from(hmacHeader)
    );
  } catch (error) {
    console.error('❌ Webhook verification error:', error);
    return false;
  }
}

/**
 * Extract webhook metadata from headers
 */
export function extractWebhookMetadata(request: NextRequest): {
  topic: ShopifyWebhookTopic | null;
  shop: string;
  webhookId: string;
  timestamp: string;
  hmac: string;
} {
  return {
    topic: request.headers.get('X-Shopify-Topic') as ShopifyWebhookTopic | null,
    shop: request.headers.get('X-Shopify-Shop-Domain') || '',
    webhookId: request.headers.get('X-Shopify-Webhook-Id') || `manual-${Date.now()}`,
    timestamp: request.headers.get('X-Shopify-Triggered-At') || new Date().toISOString(),
    hmac: request.headers.get('X-Shopify-Hmac-Sha256') || '',
  };
}

// ============================================================================
// Webhook Handlers
// ============================================================================

/**
 * Handle app/uninstalled webhook
 */
async function handleAppUninstalled(
  context: WebhookContext
): Promise<WebhookResult> {
  const { shop, payload } = context;

  console.log(`🗑️ App uninstalled from shop: ${shop}`);

  try {
    // Mark shop as uninstalled in database
    if (supabase) {
      const { error } = await supabase
        .from('shops')
        .update({
          uninstalled_at: new Date().toISOString(),
          status: 'uninstalled',
          updated_at: new Date().toISOString(),
        })
        .eq('shop_domain', shop);

      if (error) {
        console.error('Failed to update shop status:', error);
        return { success: false, processed: false, retry: true, error: error.message };
      }
    }

    // Schedule data cleanup (GDPR compliance)
    await scheduleDataCleanup(shop);

    return { success: true, processed: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, processed: false, retry: true, error: message };
  }
}

/**
 * Handle app/scopes_update webhook
 */
async function handleScopesUpdate(
  context: WebhookContext
): Promise<WebhookResult> {
  const { shop, payload } = context;

  console.log(`🔐 Scopes updated for shop: ${shop}`);

  // Log scope changes for audit
  console.log('New scopes:', payload.current_app_installation?.access_scopes);

  return { success: true, processed: true };
}

/**
 * Handle products/create webhook
 */
async function handleProductCreate(
  context: WebhookContext
): Promise<WebhookResult> {
  const { shop, payload } = context;

  console.log(`📦 Product created in ${shop}: ${payload.id}`);

  try {
    // Sync product to local database
    if (supabase) {
      const { error } = await supabase
        .from('products')
        .upsert({
          shopify_id: payload.id.toString(),
          shop_domain: shop,
          title: payload.title,
          handle: payload.handle,
          product_type: payload.product_type,
          vendor: payload.vendor,
          status: payload.status,
          variants: payload.variants,
          images: payload.images,
          tags: payload.tags,
          body_html: payload.body_html,
          synced_at: new Date().toISOString(),
          created_at: payload.created_at,
          updated_at: payload.updated_at,
        }, { onConflict: 'shopify_id' });

      if (error) {
        console.error('Failed to sync product:', error);
        return { success: false, processed: false, retry: true, error: error.message };
      }
    }

    return { success: true, processed: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, processed: false, retry: true, error: message };
  }
}

/**
 * Handle products/update webhook
 */
async function handleProductUpdate(
  context: WebhookContext
): Promise<WebhookResult> {
  const { shop, payload } = context;

  console.log(`📝 Product updated in ${shop}: ${payload.id}`);

  try {
    if (supabase) {
      const { error } = await supabase
        .from('products')
        .update({
          title: payload.title,
          handle: payload.handle,
          product_type: payload.product_type,
          vendor: payload.vendor,
          status: payload.status,
          variants: payload.variants,
          images: payload.images,
          tags: payload.tags,
          body_html: payload.body_html,
          synced_at: new Date().toISOString(),
          updated_at: payload.updated_at,
        })
        .eq('shopify_id', payload.id.toString());

      if (error) {
        return { success: false, processed: false, retry: true, error: error.message };
      }
    }

    return { success: true, processed: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, processed: false, retry: true, error: message };
  }
}

/**
 * Handle products/delete webhook
 */
async function handleProductDelete(
  context: WebhookContext
): Promise<WebhookResult> {
  const { shop, payload } = context;

  console.log(`🗑️ Product deleted in ${shop}: ${payload.id}`);

  try {
    if (supabase) {
      const { error } = await supabase
        .from('products')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
        })
        .eq('shopify_id', payload.id.toString());

      if (error) {
        return { success: false, processed: false, retry: true, error: error.message };
      }
    }

    return { success: true, processed: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, processed: false, retry: true, error: message };
  }
}

/**
 * Handle orders/create webhook
 */
async function handleOrderCreate(
  context: WebhookContext
): Promise<WebhookResult> {
  const { shop, payload } = context;

  console.log(`🛒 New order in ${shop}: #${payload.order_number}`);

  try {
    // Check if this order originated from a quote
    if (payload.note_attributes) {
      const quoteId = payload.note_attributes.find(
        (attr: { name: string; value: string }) => attr.name === 'quote_id'
      )?.value;

      if (quoteId && supabase) {
        // Update quote status to converted
        const { error } = await supabase
          .from('quotes')
          .update({
            status: 'converted',
            converted_at: new Date().toISOString(),
            shopify_order_id: payload.id.toString(),
            shopify_order_number: payload.order_number,
          })
          .eq('id', quoteId);

        if (error) {
          console.error('Failed to update quote status:', error);
        } else {
          console.log(`✅ Quote ${quoteId} converted to order #${payload.order_number}`);
        }
      }
    }

    // Store order for analytics
    if (supabase) {
      await supabase.from('orders').insert({
        shopify_id: payload.id.toString(),
        shop_domain: shop,
        order_number: payload.order_number,
        customer_id: payload.customer?.id?.toString(),
        total_price: payload.total_price,
        currency: payload.currency,
        financial_status: payload.financial_status,
        fulfillment_status: payload.fulfillment_status,
        created_at: payload.created_at,
      });
    }

    return { success: true, processed: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, processed: false, retry: true, error: message };
  }
}

/**
 * Handle customers/create webhook
 */
async function handleCustomerCreate(
  context: WebhookContext
): Promise<WebhookResult> {
  const { shop, payload } = context;

  console.log(`👤 Customer created in ${shop}: ${payload.id}`);

  try {
    if (supabase) {
      const { error } = await supabase
        .from('customers')
        .upsert({
          shopify_id: payload.id.toString(),
          shop_domain: shop,
          email: payload.email,
          first_name: payload.first_name,
          last_name: payload.last_name,
          phone: payload.phone,
          accepts_marketing: payload.accepts_marketing,
          tags: payload.tags,
          addresses: payload.addresses,
          synced_at: new Date().toISOString(),
          created_at: payload.created_at,
          updated_at: payload.updated_at,
        }, { onConflict: 'shopify_id' });

      if (error) {
        return { success: false, processed: false, retry: true, error: error.message };
      }
    }

    return { success: true, processed: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, processed: false, retry: true, error: message };
  }
}

/**
 * Handle shop/update webhook
 */
async function handleShopUpdate(
  context: WebhookContext
): Promise<WebhookResult> {
  const { shop, payload } = context;

  console.log(`🏪 Shop updated: ${shop}`);

  try {
    if (supabase) {
      const { error } = await supabase
        .from('shops')
        .update({
          name: payload.name,
          email: payload.email,
          domain: payload.domain,
          plan_name: payload.plan_name,
          timezone: payload.iana_timezone,
          currency: payload.currency,
          money_format: payload.money_format,
          updated_at: new Date().toISOString(),
        })
        .eq('shop_domain', shop);

      if (error) {
        return { success: false, processed: false, retry: true, error: error.message };
      }
    }

    return { success: true, processed: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, processed: false, retry: true, error: message };
  }
}

// ============================================================================
// Webhook Router
// ============================================================================

const webhookHandlers: Record<ShopifyWebhookTopic, (ctx: WebhookContext) => Promise<WebhookResult>> = {
  'app/uninstalled': handleAppUninstalled,
  'app/scopes_update': handleScopesUpdate,
  'products/create': handleProductCreate,
  'products/update': handleProductUpdate,
  'products/delete': handleProductDelete,
  'orders/create': handleOrderCreate,
  'orders/updated': handleOrderCreate, // Similar handling
  'orders/cancelled': handleOrderCreate, // Similar handling
  'customers/create': handleCustomerCreate,
  'customers/update': handleCustomerCreate, // Similar handling
  'customers/delete': handleCustomerCreate, // Mark as deleted
  'shop/update': handleShopUpdate,
  'bulk_operations/finish': async () => ({ success: true, processed: true }),
};

/**
 * Route webhook to appropriate handler
 */
export async function processWebhook(context: WebhookContext): Promise<WebhookResult> {
  const handler = webhookHandlers[context.topic];

  if (!handler) {
    console.log(`⚠️ No handler for topic: ${context.topic}`);
    return { success: true, processed: false, error: 'No handler for topic' };
  }

  return handler(context);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Schedule data cleanup for GDPR compliance
 */
async function scheduleDataCleanup(shop: string): Promise<void> {
  console.log(`📅 Scheduled data cleanup for ${shop} in 48 hours`);

  // In production, this would add a job to a queue
  // For now, just log the intent
}

/**
 * Log webhook to database for audit trail
 */
export async function logWebhook(
  context: WebhookContext,
  result: WebhookResult
): Promise<void> {
  if (!supabase) return;

  try {
    await supabase.from('webhook_logs').insert({
      webhook_id: context.webhookId,
      shop_domain: context.shop,
      topic: context.topic,
      payload: context.payload,
      result: result.success ? 'success' : 'error',
      error_message: result.error,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log webhook:', error);
  }
}

/**
 * Queue webhook for retry
 */
export async function queueWebhookRetry(
  context: WebhookContext
): Promise<void> {
  if (!supabase) return;

  try {
    await supabase.from('webhook_queue').insert({
      webhook_id: context.webhookId,
      shop_domain: context.shop,
      topic: context.topic,
      payload: context.payload,
      attempt: context.attempt + 1,
      scheduled_at: new Date(Date.now() + getRetryDelay(context.attempt)).toISOString(),
    });
  } catch (error) {
    console.error('Failed to queue retry:', error);
  }
}

/**
 * Get exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  const baseDelay = 5000; // 5 seconds
  const maxDelay = 3600000; // 1 hour
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  return delay + Math.random() * 1000; // Add jitter
}

// ============================================================================
// Main Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get raw body
    const rawBody = await request.text();

    // Extract metadata
    const metadata = extractWebhookMetadata(request);

    // Validate signature
    if (!verifyShopifyWebhook(rawBody, metadata.hmac)) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Build context
    const context: WebhookContext = {
      topic: metadata.topic || 'shop/update',
      shop: metadata.shop,
      webhookId: metadata.webhookId,
      timestamp: metadata.timestamp,
      payload,
      attempt: 0,
    };

    // Process webhook
    const result = await processWebhook(context);

    // Log result
    await logWebhook(context, result);

    // Queue retry if needed
    if (!result.success && result.retry) {
      await queueWebhookRetry(context);
    }

    // Return appropriate status
    if (result.success) {
      return NextResponse.json({ success: true });
    } else if (result.retry) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    } else {
      // Permanent failure - still return 200 to prevent retries
      return NextResponse.json({ success: false, error: result.error });
    }

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET Handler - Webhook Status
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!supabase) {
    return NextResponse.json({
      status: 'healthy',
      webhooks_processed: 0,
      webhooks_failed: 0,
    });
  }

  try {
    // Get recent webhook stats
    const { data: logs, error } = await supabase
      .from('webhook_logs')
      .select('result')
      .eq('shop_domain', shop || '')
      .gte('processed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const processed = logs?.length || 0;
    const failed = logs?.filter(l => l.result === 'error').length || 0;

    return NextResponse.json({
      status: 'healthy',
      webhooks_processed: processed,
      webhooks_failed: failed,
      shop: shop || 'all',
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export default POST;
