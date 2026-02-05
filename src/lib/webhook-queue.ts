/**
 * Webhook Queue Processor
 * Background job processor for failed webhooks
 * @module lib/webhook-queue
 */

import { createClient } from '@supabase/supabase-js';
import { processWebhook, WebhookContext } from '@/app/api/webhooks/shopify/enhanced/route';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

export interface QueuedWebhook {
  id: string;
  webhook_id: string;
  shop_domain: string;
  topic: string;
  payload: Record<string, unknown>;
  attempt: number;
  scheduled_at: string;
}

/**
 * Process queued webhooks
 */
export async function processWebhookQueue(batchSize: number = 10): Promise<{
  processed: number;
  failed: number;
  remaining: number;
}> {
  if (!supabase) {
    return { processed: 0, failed: 0, remaining: 0 };
  }

  try {
    // Get pending webhooks
    const { data: queued, error } = await supabase
      .from('webhook_queue')
      .select('*')
      .lte('scheduled_at', new Date().toISOString())
      .lt('attempt', 5) // Max 5 attempts
      .limit(batchSize);

    if (error) throw error;

    let processed = 0;
    let failed = 0;

    for (const item of (queued || [])) {
      const context: WebhookContext = {
        topic: item.topic as any,
        shop: item.shop_domain,
        webhookId: item.webhook_id,
        timestamp: new Date().toISOString(),
        payload: item.payload as any,
        attempt: item.attempt,
      };

      const result = await processWebhook(context);

      if (result.success) {
        processed++;
        // Remove from queue
        await supabase
          .from('webhook_queue')
          .delete()
          .eq('id', item.id);
      } else {
        failed++;
        // Update attempt count
        await supabase
          .from('webhook_queue')
          .update({
            attempt: item.attempt + 1,
            scheduled_at: new Date(Date.now() + getRetryDelay(item.attempt)).toISOString(),
            last_error: result.error,
          })
          .eq('id', item.id);
      }
    }

    // Get remaining count
    const { count } = await supabase
      .from('webhook_queue')
      .select('*', { count: 'exact', head: true });

    return {
      processed,
      failed,
      remaining: count || 0,
    };

  } catch (error) {
    console.error('Queue processing error:', error);
    return { processed: 0, failed: 0, remaining: 0 };
  }
}

function getRetryDelay(attempt: number): number {
  const delays = [5000, 15000, 60000, 300000, 3600000]; // 5s, 15s, 1m, 5m, 1h
  return delays[Math.min(attempt, delays.length - 1)];
}

/**
 * Clean up old webhook logs
 */
export async function cleanupWebhookLogs(daysToKeep: number = 30): Promise<number> {
  if (!supabase) return 0;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const { error, count } = await supabase
    .from('webhook_logs')
    .delete()
    .lt('processed_at', cutoffDate.toISOString())
    .select('count');

  if (error) {
    console.error('Cleanup error:', error);
    return 0;
  }

  return count || 0;
}

export default {
  processWebhookQueue,
  cleanupWebhookLogs,
};
