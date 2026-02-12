/**
 * Quote Status Update API Route
 * PATCH /api/quotes/[id]/status
 * Handles status transitions with validation and history tracking
 * @module app/api/quotes/[id]/status/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { 
  validateTransition, 
  createStatusChangeRecord,
  getActivityTypeForStatusChange,
  type StatusChangeRecord 
} from '@/lib/quoteWorkflow';
import { QuoteStatus } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface StatusUpdateRequest {
  status: QuoteStatus;
  comment?: string;
  metadata?: Record<string, unknown>;
  notifyCustomer?: boolean;
}

interface StatusUpdateResponse {
  success: boolean;
  data?: {
    quote: QuoteWithHistory;
    transition: StatusChangeRecord;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface QuoteWithHistory {
  id: string;
  quote_number: string;
  status: QuoteStatus;
  customer_id: string;
  customer_email?: string;
  customer_name?: string;
  title: string;
  total: number;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  sent_at?: string;
  viewed_at?: string;
  accepted_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  status_history?: StatusChangeRecord[];
}

interface SupabaseError {
  code: string;
  message: string;
  details?: string;
}

// ============================================================================
// GET - Fetch quote with status history
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_ID', message: 'Quote ID is required' } },
        { status: 400 }
      );
    }

    // Fetch quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (quoteError) {
      console.error('Error fetching quote:', quoteError);
      // PGRST116 = no rows returned (not found)
      if (quoteError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Quote not found' } },
          { status: 404 }
        );
      }
      // Return 500 for any database error (including generic errors without code)
      return NextResponse.json(
        { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch quote' } },
        { status: 500 }
      );
    }

    if (!quote) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Quote not found' } },
        { status: 404 }
      );
    }

    // Fetch status history
    const { data: history, error: historyError } = await supabase
      .from('quote_status_history')
      .select('*')
      .eq('quote_id', id)
      .order('changed_at', { ascending: false });

    if (historyError) {
      console.error('Error fetching status history:', historyError);
      // Don't fail the request if history fetch fails
    }

    const quoteWithHistory: QuoteWithHistory = {
      ...quote,
      status_history: history || [],
    };

    return NextResponse.json({
      success: true,
      data: quoteWithHistory,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/quotes/[id]/status:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update quote status
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_ID', message: 'Quote ID is required' } },
        { status: 400 }
      );
    }

    // Parse request body
    let body: StatusUpdateRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_BODY', message: 'Invalid JSON in request body' } },
        { status: 400 }
      );
    }

    const { status: newStatus, comment, metadata, notifyCustomer = true } = body;

    // Validate new status
    if (!newStatus) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_STATUS', message: 'New status is required' } },
        { status: 400 }
      );
    }

    if (!Object.values(QuoteStatus).includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: `Invalid status: ${newStatus}` } },
        { status: 400 }
      );
    }

    // Get current quote
    const { data: currentQuote, error: fetchError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching quote:', fetchError);
      return NextResponse.json(
        { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch quote' } },
        { status: 500 }
      );
    }

    if (!currentQuote) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Quote not found' } },
        { status: 404 }
      );
    }

    const currentStatus = currentQuote.status as QuoteStatus;

    // Validate transition
    const validation = validateTransition(currentStatus, newStatus);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TRANSITION', message: validation.error } },
        { status: 400 }
      );
    }

    // Get user info from request (in a real app, this would come from auth)
    const userId = request.headers.get('x-user-id') || 'system';
    const userName = request.headers.get('x-user-name') || 'System';

    // Create status change record
    const statusChange = createStatusChangeRecord(
      id,
      currentStatus,
      newStatus,
      userId,
      userName,
      comment,
      metadata
    );

    // Start a transaction
    const { error: historyError } = await supabase
      .from('quote_status_history')
      .insert({
        id: statusChange.id,
        quote_id: id,
        from_status: statusChange.fromStatus,
        to_status: statusChange.toStatus,
        changed_by: statusChange.changedBy,
        changed_by_name: statusChange.changedByName,
        changed_at: statusChange.changedAt,
        comment: statusChange.comment,
        metadata: statusChange.metadata,
      });

    if (historyError) {
      console.error('Error recording status history:', historyError);
      return NextResponse.json(
        { success: false, error: { code: 'HISTORY_ERROR', message: 'Failed to record status history' } },
        { status: 500 }
      );
    }

    // Update quote status with timestamp fields
    const updateData: Record<string, string | null> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Set timestamp fields based on status
    switch (newStatus) {
      case QuoteStatus.SENT:
        updateData.sent_at = new Date().toISOString();
        break;
      case QuoteStatus.VIEWED:
        updateData.viewed_at = new Date().toISOString();
        break;
      case QuoteStatus.ACCEPTED:
        updateData.accepted_at = new Date().toISOString();
        break;
      case QuoteStatus.REJECTED:
        updateData.rejected_at = new Date().toISOString();
        if (comment) {
          updateData.rejection_reason = comment;
        }
        break;
    }

    const { data: updatedQuote, error: updateError } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating quote status:', updateError);
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to update quote status' } },
        { status: 500 }
      );
    }

    // Send notification if enabled and transition is important
    if (notifyCustomer) {
      try {
        await sendStatusNotification(updatedQuote, newStatus, currentStatus);
      } catch (error) {
        console.error('Error sending notification:', error);
        // Don't fail the request if notification fails
      }
    }

    // Create activity record
    try {
      await createActivityRecord(updatedQuote, newStatus, userId, userName);
    } catch (error) {
      console.error('Error creating activity record:', error);
      // Don't fail the request if activity creation fails
    }

    const response: StatusUpdateResponse = {
      success: true,
      data: {
        quote: {
          ...updatedQuote,
          status_history: [statusChange],
        } as QuoteWithHistory,
        transition: statusChange,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in PATCH /api/quotes/[id]/status:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Send notification for important status changes
 */
async function sendStatusNotification(
  quote: Record<string, unknown>,
  newStatus: QuoteStatus,
  previousStatus: QuoteStatus
): Promise<void> {
  // Only notify on certain transitions
  const notifyStatuses = [QuoteStatus.SENT, QuoteStatus.ACCEPTED, QuoteStatus.REJECTED];
  
  if (!notifyStatuses.includes(newStatus)) {
    return;
  }

  const customerEmail = quote.customer_email as string | undefined;
  if (!customerEmail) {
    console.log('No customer email available for notification');
    return;
  }

  // Import email service dynamically to avoid circular dependencies
  const { sendEmail } = await import('@/lib/email');

  const quoteTitle = quote.title as string || 'Your Quote';
  const quoteNumber = quote.quote_number as string || quote.id as string;

  let subject: string;
  let html: string;

  switch (newStatus) {
    case QuoteStatus.SENT:
      subject = `Quote ${quoteNumber} - Ready for Review`;
      html = generateEmailTemplate('sent', quoteTitle, quoteNumber);
      break;
    case QuoteStatus.ACCEPTED:
      subject = `Quote ${quoteNumber} - Accepted!`;
      html = generateEmailTemplate('accepted', quoteTitle, quoteNumber);
      break;
    case QuoteStatus.REJECTED:
      subject = `Quote ${quoteNumber} - Update`;
      html = generateEmailTemplate('rejected', quoteTitle, quoteNumber);
      break;
    default:
      return;
  }

  await sendEmail({
    to: customerEmail,
    subject,
    html,
  });
}

/**
 * Create activity record for the status change
 */
async function createActivityRecord(
  quote: Record<string, unknown>,
  status: QuoteStatus,
  userId: string,
  userName: string
): Promise<void> {
  const activityType = getActivityTypeForStatusChange(status);

  await supabase.from('activities').insert({
    type: activityType,
    quote_id: quote.id,
    quote_number: quote.quote_number,
    customer_id: quote.customer_id,
    customer_name: quote.customer_name,
    user_id: userId,
    user_name: userName,
    description: `Quote status changed to ${status}`,
    created_at: new Date().toISOString(),
  });
}

/**
 * Generate email template for status notifications
 */
function generateEmailTemplate(
  status: 'sent' | 'accepted' | 'rejected',
  quoteTitle: string,
  quoteNumber: string
): string {
  const templates: Record<string, { title: string; message: string; cta: string }> = {
    sent: {
      title: 'Your Quote is Ready',
      message: `Your quote "${quoteTitle}" (${quoteNumber}) has been prepared and is ready for your review.`,
      cta: 'View Quote',
    },
    accepted: {
      title: 'Quote Accepted!',
      message: `Great news! Your quote "${quoteTitle}" (${quoteNumber}) has been accepted. We'll be in touch shortly with next steps.`,
      cta: 'View Details',
    },
    rejected: {
      title: 'Quote Update',
      message: `Thank you for your interest. Unfortunately, we are unable to fulfill your quote request "${quoteTitle}" (${quoteNumber}) at this time.`,
      cta: 'Contact Us',
    },
  };

  const template = templates[status];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${template.title}</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>${template.message}</p>
          <a href="#" class="button">${template.cta}</a>
        </div>
        <div class="footer">
          <p>This email was sent by QuoteGen</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
