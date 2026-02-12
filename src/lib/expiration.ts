/**
 * Quote Expiration Handler
 * Checks for expired quotes and sends reminder emails
 * @module lib/expiration
 */

import { supabase } from '@/lib/supabase';
import { getActivityTypeForStatusChange } from '@/lib/quoteWorkflow';
import { QuoteStatus } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export interface ExpirationCheck {
  quoteId: string;
  quoteNumber: string;
  customerEmail: string;
  customerName?: string;
  expiresAt: string;
  daysUntilExpiry: number;
  status: QuoteStatus;
}

export interface ExpirationResult {
  expired: number;
  expiringSoon: number;
  remindersSent: number;
  errors: string[];
}

export interface ReminderConfig {
  enabled: boolean;
  reminderDays: number[];
  fromEmail: string;
  companyName: string;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  enabled: true,
  reminderDays: [7, 3, 1], // Remind at 7 days, 3 days, and 1 day before expiry
  fromEmail: process.env.FROM_EMAIL || 'quotes@quotegen.app',
  companyName: process.env.COMPANY_NAME || 'QuoteGen',
};

// ============================================================================
// Expiration Checking
// ============================================================================

/**
 * Check for quotes that have expired and update their status
 */
export async function checkAndExpireQuotes(): Promise<ExpirationResult> {
  const result: ExpirationResult = {
    expired: 0,
    expiringSoon: 0,
    remindersSent: 0,
    errors: [],
  };

  try {
    const now = new Date().toISOString();

    // Find quotes that have expired (expires_at < now) but haven't been marked as expired
    const { data: expiredQuotes, error: fetchError } = await supabase
      .from('quotes')
      .select('id, quote_number, customer_email, customer_name, expires_at, status')
      .lt('expires_at', now)
      .in('status', [QuoteStatus.SENT, QuoteStatus.VIEWED])
      .order('expires_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching expired quotes:', fetchError);
      result.errors.push(`Fetch error: ${fetchError.message}`);
      return result;
    }

    if (!expiredQuotes || expiredQuotes.length === 0) {
      console.log('No expired quotes found');
      return result;
    }

    console.log(`Found ${expiredQuotes.length} expired quotes`);

    // Update each expired quote
    for (const quote of expiredQuotes) {
      try {
        await expireQuote(quote.id, quote.quote_number);
        result.expired++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to expire quote ${quote.id}:`, error);
        result.errors.push(`Quote ${quote.quote_number}: ${errorMessage}`);
      }
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error in checkAndExpireQuotes:', error);
    result.errors.push(`Unexpected error: ${errorMessage}`);
    return result;
  }
}

/**
 * Expire a single quote and record the status change
 */
async function expireQuote(quoteId: string, quoteNumber: string): Promise<void> {
  const now = new Date().toISOString();

  // Start a transaction
  const { error: historyError } = await supabase
    .from('quote_status_history')
    .insert({
      quote_id: quoteId,
      from_status: QuoteStatus.SENT, // Assume sent was previous state
      to_status: QuoteStatus.EXPIRED,
      changed_by: 'system',
      changed_by_name: 'System',
      changed_at: now,
      comment: 'Quote automatically expired',
      metadata: { reason: 'expired', auto: true },
    });

  if (historyError) {
    console.error('Error recording status history:', historyError);
    throw new Error(`Failed to record history: ${historyError.message}`);
  }

  // Update quote status
  const { error: updateError } = await supabase
    .from('quotes')
    .update({
      status: QuoteStatus.EXPIRED,
      updated_at: now,
    })
    .eq('id', quoteId);

  if (updateError) {
    console.error('Error updating quote status:', updateError);
    throw new Error(`Failed to update status: ${updateError.message}`);
  }

  // Create activity record
  await supabase.from('activities').insert({
    type: getActivityTypeForStatusChange(QuoteStatus.EXPIRED),
    quote_id: quoteId,
    quote_number: quoteNumber,
    description: 'Quote automatically expired',
    created_at: now,
  });

  console.log(`Quote ${quoteNumber} has been marked as expired`);
}

// ============================================================================
// Reminder Emails
// ============================================================================

/**
 * Check for quotes expiring soon and send reminder emails
 */
export async function sendExpirationReminders(
  config: ReminderConfig = DEFAULT_REMINDER_CONFIG
): Promise<ExpirationResult> {
  const result: ExpirationResult = {
    expired: 0,
    expiringSoon: 0,
    remindersSent: 0,
    errors: [],
  };

  if (!config.enabled) {
    console.log('Expiration reminders are disabled');
    return result;
  }

  try {
    const now = new Date();

    // Check each reminder day
    for (const days of config.reminderDays) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Find quotes expiring on this day
      const { data: expiringQuotes, error: fetchError } = await supabase
        .from('quotes')
        .select('id, quote_number, customer_email, customer_name, expires_at, title, total, status')
        .gte('expires_at', startOfDay.toISOString())
        .lte('expires_at', endOfDay.toISOString())
        .in('status', [QuoteStatus.SENT, QuoteStatus.VIEWED]);

      if (fetchError) {
        console.error(`Error fetching quotes expiring in ${days} days:`, fetchError);
        result.errors.push(`Fetch error (${days} days): ${fetchError.message}`);
        continue;
      }

      if (!expiringQuotes || expiringQuotes.length === 0) {
        continue;
      }

      result.expiringSoon += expiringQuotes.length;

      // Send reminder for each quote
      for (const quote of expiringQuotes) {
        try {
          // Check if reminder already sent for this quote at this threshold
          const alreadySent = await hasReminderBeenSent(quote.id, days);
          if (alreadySent) {
            console.log(`Reminder already sent for quote ${quote.quote_number} at ${days} days`);
            continue;
          }

          await sendReminderEmail(quote, days, config);
          await recordReminderSent(quote.id, days);
          result.remindersSent++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Failed to send reminder for quote ${quote.id}:`, error);
          result.errors.push(`Quote ${quote.quote_number}: ${errorMessage}`);
        }
      }
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error in sendExpirationReminders:', error);
    result.errors.push(`Unexpected error: ${errorMessage}`);
    return result;
  }
}

/**
 * Check if a reminder has already been sent for this quote at this threshold
 */
async function hasReminderBeenSent(quoteId: string, daysBeforeExpiry: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('quote_reminders')
    .select('id')
    .eq('quote_id', quoteId)
    .eq('days_before_expiry', daysBeforeExpiry)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error checking reminder status:', error);
  }

  return !!data;
}

/**
 * Record that a reminder has been sent
 */
async function recordReminderSent(quoteId: string, daysBeforeExpiry: number): Promise<void> {
  const { error } = await supabase.from('quote_reminders').insert({
    quote_id: quoteId,
    days_before_expiry: daysBeforeExpiry,
    sent_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error recording reminder:', error);
  }
}

/**
 * Send a reminder email for an expiring quote
 */
async function sendReminderEmail(
  quote: Record<string, unknown>,
  daysUntilExpiry: number,
  config: ReminderConfig
): Promise<void> {
  const customerEmail = quote.customer_email as string | undefined;
  if (!customerEmail) {
    console.log(`No customer email for quote ${quote.quote_number}`);
    return;
  }

  // Import email service dynamically
  const { sendEmail } = await import('@/lib/email');

  const quoteTitle = quote.title as string || 'Your Quote';
  const quoteNumber = quote.quote_number as string;
  const customerName = quote.customer_name as string | undefined;
  const total = quote.total as number;

  const daysText = daysUntilExpiry === 1 ? 'tomorrow' : `in ${daysUntilExpiry} days`;
  
  const subject = `Reminder: Quote ${quoteNumber} expires ${daysText}`;
  const html = generateReminderEmailTemplate({
    quoteTitle,
    quoteNumber,
    customerName,
    total,
    daysUntilExpiry,
    companyName: config.companyName,
  });

  await sendEmail({
    to: customerEmail,
    subject,
    html,
  });

  console.log(`Reminder sent for quote ${quoteNumber} (${daysUntilExpiry} days until expiry)`);
}

/**
 * Generate reminder email template
 */
function generateReminderEmailTemplate({
  quoteTitle,
  quoteNumber,
  customerName,
  total,
  daysUntilExpiry,
  companyName,
}: {
  quoteTitle: string;
  quoteNumber: string;
  customerName?: string;
  total?: number;
  daysUntilExpiry: number;
  companyName: string;
}): string {
  const daysText = daysUntilExpiry === 1 ? 'tomorrow' : `in ${daysUntilExpiry} days`;
  const greeting = customerName ? `Hello ${customerName},` : 'Hello,';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote Expiration Reminder</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
          color: white; 
          padding: 30px; 
          text-align: center; 
        }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .quote-box { 
          background: #f9fafb; 
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 4px 4px 0;
        }
        .quote-title { font-weight: 600; color: #111827; margin-bottom: 5px; }
        .quote-number { color: #6b7280; font-size: 14px; }
        .quote-total { 
          font-size: 24px; 
          font-weight: 700; 
          color: #059669;
          margin-top: 10px;
        }
        .urgency { 
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 12px 16px;
          margin: 20px 0;
          color: #92400e;
        }
        .button { 
          display: inline-block; 
          background: #059669; 
          color: white; 
          padding: 14px 28px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin-top: 20px;
          font-weight: 600;
        }
        .button:hover { background: #047857; }
        .footer { 
          text-align: center; 
          color: #6b7280; 
          font-size: 12px; 
          padding: 20px;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Expiration Reminder</h1>
        </div>
        
        <div class="content">
          <p>${greeting}</p>
          
          <p>This is a friendly reminder that your quote is set to expire <strong>${daysText}</strong>.</p>
          
          <div class="quote-box">
            <div class="quote-title">${quoteTitle}</div>
            <div class="quote-number">Quote #${quoteNumber}</div>
            ${total ? `<div class="quote-total">${formatCurrency(total)}</div>` : ''}
          </div>
          
          <div class="urgency">
            ⚠️ Please review and respond to this quote before it expires to ensure the pricing remains valid.
          </div>
          
          <p>If you have any questions or need more time to decide, please don't hesitate to reach out to us.</p>
          
          <a href="#" class="button">View Quote</a>
        </div>
        
        <div class="footer">
          <p>${companyName}</p>
          <p>This email was sent automatically. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// ============================================================================
// Combined Processing
// ============================================================================

/**
 * Run all expiration-related tasks
 * This is the main entry point for scheduled expiration processing
 */
export async function processQuoteExpirations(
  config: ReminderConfig = DEFAULT_REMINDER_CONFIG
): Promise<ExpirationResult> {
  console.log('Starting quote expiration processing...');
  
  const startTime = Date.now();
  
  // Check and expire quotes
  const expireResult = await checkAndExpireQuotes();
  
  // Send reminders for quotes expiring soon
  const reminderResult = await sendExpirationReminders(config);
  
  const duration = Date.now() - startTime;
  
  const combinedResult: ExpirationResult = {
    expired: expireResult.expired,
    expiringSoon: reminderResult.expiringSoon,
    remindersSent: reminderResult.remindersSent,
    errors: [...expireResult.errors, ...reminderResult.errors],
  };
  
  console.log(`Quote expiration processing complete in ${duration}ms:`, combinedResult);
  
  return combinedResult;
}

// ============================================================================
// API Route Handler
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

/**
 * Handler for the expiration processing API endpoint
 * Can be used with a cron job or scheduled task
 */
export async function handleExpirationRequest(
  request: NextRequest
): Promise<NextResponse> {
  // Verify API key for security
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.EXPIRATION_API_KEY;
  
  if (expectedKey && apiKey !== expectedKey) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const config: ReminderConfig = {
      ...DEFAULT_REMINDER_CONFIG,
      // Allow overriding via query params
      enabled: request.nextUrl.searchParams.get('enabled') !== 'false',
    };
    
    const result = await processQuoteExpirations(config);
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in expiration processing:', error);
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// ============================================================================
// Exports
// ============================================================================

export default {
  checkAndExpireQuotes,
  sendExpirationReminders,
  processQuoteExpirations,
  handleExpirationRequest,
  DEFAULT_REMINDER_CONFIG,
};
