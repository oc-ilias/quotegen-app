// API Routes for QuoteGen
import { NextRequest, NextResponse } from 'next/server';
import { createQuote, getQuotes, updateQuoteStatus, getShopSettings } from '@/lib/supabase';
import { sendEmail, newQuoteEmailTemplate, quoteStatusUpdateEmailTemplate } from '@/lib/email';

// POST /api/quotes - Create new quote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.shop_id || !body.product_id || !body.customer_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customer_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
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
    
    // Send email notification if enabled
    const settings = await getShopSettings(body.shop_id);
    if (settings.email_notifications) {
      try {
        const { subject, html } = newQuoteEmailTemplate({
          productTitle: body.product_title,
          customerName: body.customer_name,
          customerEmail: body.customer_email,
          quantity: body.quantity,
          message: body.message,
          quoteId: quote.id,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });
        
        // Note: In production, you'd get the merchant email from Shopify
        // For now, we'll skip the actual send to avoid errors
        // await sendEmail({ to: merchantEmail, subject, html });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}

// GET /api/quotes?shop_id=xxx - Get quotes for shop
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shop_id');
    
    if (!shopId) {
      return NextResponse.json(
        { error: 'Shop ID required' },
        { status: 400 }
      );
    }
    
    const quotes = await getQuotes(shopId);
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

// PATCH /api/quotes/:id - Update quote status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, admin_notes, quote_amount } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Quote ID and status required' },
        { status: 400 }
      );
    }
    
    const validStatuses = ['pending', 'quoted', 'accepted', 'declined'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    const quote = await updateQuoteStatus(id, status, admin_notes, quote_amount);
    
    // Send status update email to customer
    if (status === 'quoted' || status === 'accepted' || status === 'declined') {
      try {
        const { subject, html } = quoteStatusUpdateEmailTemplate({
          productTitle: quote.product_title,
          status,
          quoteAmount: quote_amount,
          shopName: 'Your Store', // Get from Shopify
          shopUrl: `https://${quote.shop_id}`,
        });
        
        // await sendEmail({ to: quote.customer_email, subject, html });
      } catch (emailError) {
        console.error('Failed to send status email:', emailError);
      }
    }
    
    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}