/**
 * API Route - Send Email
 * POST /api/email/send
 * Comprehensive email sending endpoint with validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendQuoteEmail, EmailType } from '@/lib/email-service';
import { Quote, Customer } from '@/types/quote';

// ============================================================================
// Validation
// ============================================================================

interface SendEmailRequest {
  type: EmailType;
  to: string;
  quote: Quote;
  customer: Customer;
  shopName: string;
  shopUrl: string;
  shopLogo?: string;
  message?: string;
}

function validateRequest(body: unknown): { valid: boolean; error?: string; data?: SendEmailRequest } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' };
  }

  const req = body as Record<string, unknown>;

  // Validate required fields
  if (!req.type || typeof req.type !== 'string') {
    return { valid: false, error: 'Email type is required' };
  }

  const validTypes: EmailType[] = ['quote_sent', 'quote_reminder', 'quote_accepted', 'quote_declined', 'quote_expired', 'follow_up', 'welcome'];
  if (!validTypes.includes(req.type as EmailType)) {
    return { valid: false, error: `Invalid email type. Must be one of: ${validTypes.join(', ')}` };
  }

  if (!req.to || typeof req.to !== 'string' || !req.to.includes('@')) {
    return { valid: false, error: 'Valid recipient email is required' };
  }

  if (!req.quote || typeof req.quote !== 'object') {
    return { valid: false, error: 'Quote data is required' };
  }

  if (!req.customer || typeof req.customer !== 'object') {
    return { valid: false, error: 'Customer data is required' };
  }

  if (!req.shopName || typeof req.shopName !== 'string') {
    return { valid: false, error: 'Shop name is required' };
  }

  if (!req.shopUrl || typeof req.shopUrl !== 'string') {
    return { valid: false, error: 'Shop URL is required' };
  }

  return {
    valid: true,
    data: {
      type: req.type as EmailType,
      to: req.to,
      quote: req.quote as Quote,
      customer: req.customer as Customer,
      shopName: req.shopName,
      shopUrl: req.shopUrl,
      shopLogo: req.shopLogo as string | undefined,
      message: req.message as string | undefined,
    },
  };
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { type, to, quote, customer, shopName, shopUrl, shopLogo, message } = validation.data!;

    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quotegen.app';
    const viewUrl = `${baseUrl}/quotes/${quote.id}`;
    const acceptUrl = `${baseUrl}/quotes/${quote.id}/accept`;
    const declineUrl = `${baseUrl}/quotes/${quote.id}/decline`;

    // Send email
    const result = await sendQuoteEmail(type, {
      quote,
      customer,
      shopName,
      shopUrl,
      shopLogo,
      viewUrl,
      acceptUrl,
      declineUrl,
      message,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.id,
      type,
      to,
      sentAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in email send API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET Handler - Email Status/History (placeholder)
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const emailId = searchParams.get('id');

  if (!emailId) {
    return NextResponse.json(
      { success: false, error: 'Email ID required' },
      { status: 400 }
    );
  }

  // In production, fetch status from Resend API
  // For now, return mock status
  return NextResponse.json({
    success: true,
    id: emailId,
    status: 'delivered',
    lastEvent: 'delivered',
    events: [
      { type: 'sent', timestamp: new Date().toISOString() },
      { type: 'delivered', timestamp: new Date().toISOString() },
    ],
  });
}
