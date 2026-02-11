/**
 * Comprehensive Email Service with Resend
 * Exhaustive email templates, history tracking, and error handling
 * @module lib/email-service
 */

import { Resend } from 'resend';
import { Quote, QuoteStatus, Customer, LineItem } from '@/types/quote';

// ============================================================================
// Configuration
// ============================================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'QuoteGen <quotes@quotegen.app>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://quotegen.app';

// Initialize Resend client
const resend = RESEND_API_KEY && RESEND_API_KEY !== 're_placeholder' 
  ? new Resend(RESEND_API_KEY) 
  : null;

// ============================================================================
// Types
// ============================================================================

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailTag {
  name: string;
  value: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  tags?: EmailTag[];
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface EmailTemplateData {
  quote: Quote;
  customer: Customer;
  shopName: string;
  shopLogo?: string;
  shopUrl: string;
  viewUrl: string;
  acceptUrl: string;
  declineUrl: string;
  message?: string;
}

export interface EmailHistoryEntry {
  id: string;
  quoteId: string;
  type: EmailType;
  to: string;
  subject: string;
  sentAt: Date;
  status: 'sent' | 'failed' | 'bounced' | 'delivered' | 'opened';
  error?: string;
}

export type EmailType = 
  | 'quote_sent'
  | 'quote_reminder'
  | 'quote_accepted'
  | 'quote_declined'
  | 'quote_expired'
  | 'quote_viewed'
  | 'follow_up'
  | 'welcome'
  | 'password_reset';

// ============================================================================
// Core Email Functions
// ============================================================================

/**
 * Send an email with comprehensive error handling
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // Development mode - log instead of sending
  if (!resend) {
    console.log('📧 [EMAIL - DEVELOPMENT MODE]');
    console.log('   To:', options.to);
    console.log('   Subject:', options.subject);
    console.log('   From:', options.from || FROM_EMAIL);
    return { success: true, id: `mock-${Date.now()}` };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: options.from || FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
      })),
      tags: options.tags?.map(tag => ({
        name: tag.name,
        value: tag.value,
      })),
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Email sent:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to send email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send bulk emails with rate limiting
 */
export async function sendBulkEmails(
  emails: EmailOptions[],
  batchSize: number = 10,
  delayMs: number = 1000
): Promise<EmailResult[]> {
  const results: EmailResult[] = [];
  
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(sendEmail));
    results.push(...batchResults);
    
    // Rate limiting delay between batches
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

// ============================================================================
// Email Template Generators
// ============================================================================

/**
 * Generate base email HTML with consistent styling
 */
function generateEmailBase(content: string, options: {
  title: string;
  shopName: string;
  shopLogo?: string;
  footerText?: string;
  primaryColor?: string;
}): string {
  const { title, shopName, shopLogo, footerText, primaryColor = '#4f46e5' } = options;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f3f4f6;
      -webkit-font-smoothing: antialiased;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .header {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%);
      padding: 40px 30px;
      text-align: center;
    }
    
    .header img {
      max-height: 50px;
      margin-bottom: 15px;
    }
    
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .button {
      display: inline-block;
      background-color: ${primaryColor};
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      transition: all 0.2s;
    }
    
    .button:hover {
      background-color: ${adjustColor(primaryColor, -10)};
      transform: translateY(-1px);
    }
    
    .button-secondary {
      background-color: #ffffff;
      color: #374151;
      border: 2px solid #e5e7eb;
    }
    
    .button-secondary:hover {
      background-color: #f9fafb;
      border-color: #d1d5db;
    }
    
    .quote-summary {
      background-color: #f9fafb;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      border: 1px solid #e5e7eb;
    }
    
    .quote-summary h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #111827;
    }
    
    .quote-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .quote-row:last-child {
      border-bottom: none;
      font-weight: 700;
      font-size: 18px;
      color: ${primaryColor};
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-sent { background-color: #dbeafe; color: #1e40af; }
    .status-accepted { background-color: #d1fae5; color: #065f46; }
    .status-declined { background-color: #fee2e2; color: #991b1b; }
    .status-expired { background-color: #f3f4f6; color: #4b5563; }
    
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer p {
      color: #6b7280;
      font-size: 14px;
      margin: 4px 0;
    }
    
    .footer a {
      color: ${primaryColor};
      text-decoration: none;
    }
    
    @media (max-width: 600px) {
      .header, .content, .footer {
        padding: 24px 20px;
      }
      
      .header h1 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${shopLogo ? `<img src="${shopLogo}" alt="${shopName}" />` : ''}
      <h1>${title}</h1>
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="footer">
      <p><strong>${shopName}</strong></p>
      ${footerText ? `<p>${footerText}</p>` : ''}
      <p style="margin-top: 16px; font-size: 12px;">
        Powered by <a href="${APP_URL}">QuoteGen</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Adjust color brightness
 */
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Format currency
 */
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============================================================================
// Template Generators
// ============================================================================

export function generateQuoteSentEmail(data: EmailTemplateData): { subject: string; html: string } {
  const { quote, customer, shopName, shopUrl, viewUrl, acceptUrl, declineUrl, message } = data;
  
  const lineItemsHtml = quote.lineItems?.map(item => `
    <div class="quote-row">
      <span>${item.quantity}x ${item.title}${item.variantTitle ? ` (${item.variantTitle})` : ''}</span>
      <span>${formatCurrency(item.total, quote.terms?.currency)}</span>
    </div>
  `).join('') || '';
  
  const content = `
    <p style="font-size: 18px; margin-bottom: 16px;">Hi ${customer.contactName || customer.companyName},</p>
    
    <p style="margin-bottom: 24px;">
      ${message || `Thank you for your interest. We've prepared a personalized quote for you from ${shopName}.`}
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${viewUrl}" class="button">View Your Quote</a>
    </div>
    
    <div class="quote-summary">
      <h3>Quote #${quote.quoteNumber}</h3>
      <p style="color: #6b7280; margin-bottom: 16px;">
        <span class="status-badge status-sent">Sent</span>
        <span style="margin-left: 12px;">Valid until ${formatDate(quote.expiresAt)}</span>
      </p>
      
      ${lineItemsHtml}
      
      <div class="quote-row">
        <span>Subtotal</span>
        <span>${formatCurrency(quote.subtotal, quote.terms?.currency)}</span>
      </div>
      ${quote.discountTotal > 0 ? `
        <div class="quote-row">
          <span>Discount</span>
          <span>-${formatCurrency(quote.discountTotal, quote.terms?.currency)}</span>
        </div>
      ` : ''}
      ${quote.taxTotal > 0 ? `
        <div class="quote-row">
          <span>Tax</span>
          <span>${formatCurrency(quote.taxTotal, quote.terms?.currency)}</span>
        </div>
      ` : ''}
      <div class="quote-row">
        <span>Total</span>
        <span>${formatCurrency(quote.total, quote.terms?.currency)}</span>
      </div>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${acceptUrl}" class="button" style="margin-right: 12px;">Accept Quote</a>
      <a href="${declineUrl}" class="button button-secondary">Decline</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
      Questions? Simply reply to this email or <a href="${shopUrl}/contact">contact us</a>.
    </p>
  `;
  
  return {
    subject: `Your Quote from ${shopName} - #${quote.quoteNumber}`,
    html: generateEmailBase(content, {
      title: 'Your Quote is Ready',
      shopName,
      shopLogo: data.shopLogo,
      footerText: 'This quote is valid until ' + formatDate(quote.expiresAt),
    }),
  };
}

export function generateQuoteReminderEmail(data: EmailTemplateData): { subject: string; html: string } {
  const { quote, customer, shopName, viewUrl, acceptUrl } = data;
  
  const content = `
    <p style="font-size: 18px; margin-bottom: 16px;">Hi ${customer.contactName || customer.companyName},</p>
    
    <p style="margin-bottom: 24px;">
      We wanted to follow up on the quote we sent you from ${shopName}. 
      This quote expires on <strong>${formatDate(quote.expiresAt)}</strong>.
    </p>
    
    <div class="quote-summary">
      <h3>Quote #${quote.quoteNumber}</h3>
      <p style="font-size: 24px; font-weight: 700; color: #4f46e5; margin: 16px 0;">
        ${formatCurrency(quote.total, quote.terms?.currency)}
      </p>
      <p style="color: #ef4444; font-weight: 600;">
        ⏰ Expires ${formatDate(quote.expiresAt)}
      </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${acceptUrl}" class="button">Accept Quote Now</a>
    </div>
    
    <p style="text-align: center; margin-top: 16px;">
      <a href="${viewUrl}" style="color: #4f46e5;">View full quote details →</a>
    </p>
  `;
  
  return {
    subject: `Reminder: Your Quote from ${shopName} Expires Soon`,
    html: generateEmailBase(content, {
      title: 'Quote Reminder',
      shopName,
      shopLogo: data.shopLogo,
    }),
  };
}

export function generateQuoteAcceptedEmail(data: EmailTemplateData): { subject: string; html: string } {
  const { quote, customer, shopName, shopUrl } = data;
  
  const content = `
    <p style="font-size: 18px; margin-bottom: 16px;">Hi ${customer.contactName || customer.companyName},</p>
    
    <p style="margin-bottom: 24px;">
      Great news! Your quote has been confirmed and we're moving forward with your order.
    </p>
    
    <div class="quote-summary" style="border-color: #10b981; background-color: #ecfdf5;">
      <h3>✅ Quote Accepted</h3>
      <p style="font-size: 32px; font-weight: 700; color: #059669; margin: 16px 0;">
        ${formatCurrency(quote.total, quote.terms?.currency)}
      </p>
      <p style="color: #6b7280;">Quote #${quote.quoteNumber}</p>
    </div>
    
    <p style="margin: 24px 0;">
      <strong>Next Steps:</strong>
    </p>
    <ul style="margin-left: 24px; margin-bottom: 24px;">
      <li>Our team will begin processing your order</li>
      <li>You'll receive an invoice within 24 hours</li>
      <li>Delivery updates will be sent to this email</li>
    </ul>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${shopUrl}/account/orders" class="button">View Order Status</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
      Questions? Contact us at <a href="mailto:support@${shopUrl}">support</a>
    </p>
  `;
  
  return {
    subject: `✅ Quote Accepted - Order Confirmed`,
    html: generateEmailBase(content, {
      title: 'Quote Accepted!',
      shopName,
      shopLogo: data.shopLogo,
      primaryColor: '#10b981',
    }),
  };
}

export function generateQuoteDeclinedEmail(data: EmailTemplateData): { subject: string; html: string } {
  const { quote, customer, shopName, shopUrl, message } = data;
  
  const content = `
    <p style="font-size: 18px; margin-bottom: 16px;">Hi ${customer.contactName || customer.companyName},</p>
    
    <p style="margin-bottom: 24px;">
      We understand you've decided not to proceed with this quote at this time.
    </p>
    
    ${message ? `<p style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 24px;"><strong>Note:</strong> ${message}</p>` : ''}
    
    <div class="quote-summary" style="background-color: #fef2f2; border-color: #fca5a5;">
      <h3>Quote Declined</h3>
      <p style="color: #6b7280;">Quote #${quote.quoteNumber}</p>
    </div>
    
    <p style="margin: 24px 0;">
      If you have any feedback or would like to discuss alternative options, we're here to help.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${shopUrl}/contact" class="button button-secondary">Contact Us</a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
      We hope to work with you in the future!
    </p>
  `;
  
  return {
    subject: `Quote Declined - ${shopName}`,
    html: generateEmailBase(content, {
      title: 'Quote Update',
      shopName,
      shopLogo: data.shopLogo,
    }),
  };
}

export function generateQuoteExpiredEmail(data: EmailTemplateData): { subject: string; html: string } {
  const { quote, customer, shopName, shopUrl } = data;
  
  const content = `
    <p style="font-size: 18px; margin-bottom: 16px;">Hi ${customer.contactName || customer.companyName},</p>
    
    <p style="margin-bottom: 24px;">
      Your quote #${quote.quoteNumber} from ${shopName} has expired.
    </p>
    
    <div class="quote-summary" style="background-color: #f3f4f6;">
      <h3>⏰ Quote Expired</h3>
      <p style="color: #6b7280;">Expired on ${formatDate(quote.expiresAt)}</p>
    </div>
    
    <p style="margin: 24px 0;">
      Would you like us to refresh this quote with current pricing? 
      Simply reply to this email or request a new quote.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${shopUrl}/quotes/request" class="button">Request New Quote</a>
    </div>
  `;
  
  return {
    subject: `Quote Expired - ${shopName}`,
    html: generateEmailBase(content, {
      title: 'Quote Expired',
      shopName,
      shopLogo: data.shopLogo,
    }),
  };
}

export function generateWelcomeEmail(data: {
  customerName: string;
  shopName: string;
  shopUrl: string;
  shopLogo?: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const { customerName, shopName, shopUrl, dashboardUrl } = data;
  
  const content = `
    <p style="font-size: 18px; margin-bottom: 16px;">Welcome ${customerName}!</p>
    
    <p style="margin-bottom: 24px;">
      Thank you for choosing ${shopName}. Your account has been created and you can now 
      request quotes, track orders, and manage your business with us.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
    </div>
    
    <div style="background-color: #f9fafb; padding: 24px; border-radius: 12px; margin: 24px 0;">
      <h3 style="margin-bottom: 16px;">What you can do:</h3>
      <ul style="margin-left: 24px;">
        <li>Request custom quotes for bulk orders</li>
        <li>Track quote status in real-time</li>
        <li>View your order history</li>
        <li>Manage your account settings</li>
      </ul>
    </div>
  `;
  
  return {
    subject: `Welcome to ${shopName}!`,
    html: generateEmailBase(content, {
      title: 'Welcome Aboard!',
      shopName,
      shopLogo: data.shopLogo,
    }),
  };
}

// ============================================================================
// Convenience Functions
// ============================================================================

export async function sendQuoteEmail(
  type: EmailType,
  data: EmailTemplateData
): Promise<EmailResult> {
  let template: { subject: string; html: string };
  
  switch (type) {
    case 'quote_sent':
      template = generateQuoteSentEmail(data);
      break;
    case 'quote_reminder':
      template = generateQuoteReminderEmail(data);
      break;
    case 'quote_accepted':
      template = generateQuoteAcceptedEmail(data);
      break;
    case 'quote_declined':
      template = generateQuoteDeclinedEmail(data);
      break;
    case 'quote_expired':
      template = generateQuoteExpiredEmail(data);
      break;
    default:
      return { success: false, error: 'Unknown email type' };
  }
  
  return sendEmail({
    to: data.customer.email,
    subject: template.subject,
    html: template.html,
    tags: [
      { name: 'type', value: type },
      { name: 'quote_id', value: data.quote.id },
    ],
  });
}

// ============================================================================
// Export Default
// ============================================================================

export default {
  sendEmail,
  sendBulkEmails,
  sendQuoteEmail,
  generateQuoteSentEmail,
  generateQuoteReminderEmail,
  generateQuoteAcceptedEmail,
  generateQuoteDeclinedEmail,
  generateQuoteExpiredEmail,
  generateWelcomeEmail,
};
