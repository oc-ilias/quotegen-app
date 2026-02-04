// Email notification service using Resend
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || 're_placeholder';
const resend = resendApiKey !== 're_placeholder' ? new Resend(resendApiKey) : null;

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailData) {
  if (!resend) {
    console.log('Email service not configured. Would send to:', to);
    return { id: 'mock-email-id' };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'QuoteGen <noreply@quotegen.app>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Email templates
export function newQuoteEmailTemplate(quoteData: {
  productTitle: string;
  customerName: string;
  customerEmail: string;
  quantity?: number;
  message?: string;
  quoteId: string;
  dashboardUrl: string;
}) {
  return {
    subject: `New Quote Request: ${quoteData.productTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #008060; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
          .button { background: #008060; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Quote Request</h1>
          </div>
          
          <div class="content">
            <p><strong>Product:</strong> ${quoteData.productTitle}</p>
            <p><strong>Customer:</strong> ${quoteData.customerName || 'N/A'}</p>
            <p><strong>Email:</strong> ${quoteData.customerEmail}</p>
            ${quoteData.quantity ? `<p><strong>Quantity:</strong> ${quoteData.quantity}</p>` : ''}
            ${quoteData.message ? `<p><strong>Message:</strong> ${quoteData.message}</p>` : ''}
          </div>
          
          <p>
            <a href="${quoteData.dashboardUrl}" class="button">View in Dashboard</a>
          </p>
          
          <div class="footer">
            <p>You're receiving this because you have QuoteGen installed on your Shopify store.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function quoteStatusUpdateEmailTemplate(quoteData: {
  productTitle: string;
  status: string;
  quoteAmount?: number;
  shopName: string;
  shopUrl: string;
}) {
  const statusMessages: Record<string, string> = {
    quoted: `We've prepared a quote for you. ${quoteData.quoteAmount ? `Amount: $${quoteData.quoteAmount}` : ''}`,
    accepted: 'Great news! Your quote has been accepted.',
    declined: 'Thank you for your interest. Unfortunately, we cannot fulfill this request at this time.',
  };

  return {
    subject: `Quote Update: ${quoteData.productTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #008060; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
          .button { background: #008060; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Quote Update</h1>
          </div>
          
          <div class="content">
            <p><strong>Product:</strong> ${quoteData.productTitle}</p>
            <p><strong>Status:</strong> ${quoteData.status.charAt(0).toUpperCase() + quoteData.status.slice(1)}</p>
            <p>${statusMessages[quoteData.status] || 'Your quote request has been updated.'}</p>
          </div>
          
          <p>
            <a href="${quoteData.shopUrl}" class="button">Visit Store</a>
          </p>
          
          <div class="footer">
            <p><a href="${quoteData.shopUrl}">${quoteData.shopName}</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}