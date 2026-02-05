/**
 * Email Preview Hook
 * Manages email preview state, template selection, and preview generation
 * @module hooks/useEmailPreview
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { QuoteFormData } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export type EmailTemplate = 'modern' | 'classic' | 'minimal' | 'professional';
export type PreviewDevice = 'desktop' | 'mobile';

export interface EmailPreviewState {
  isOpen: boolean;
  device: PreviewDevice;
  selectedTemplate: EmailTemplate;
  html: string | null;
  subject: string;
  senderName: string;
  senderEmail: string;
  isLoading: boolean;
  error: string | null;
  testEmailAddress: string;
  isSendingTest: boolean;
  sendTestError: string | null;
  sendTestSuccess: boolean;
}

export interface UseEmailPreviewOptions {
  shopName?: string;
  shopEmail?: string;
  defaultTemplate?: EmailTemplate;
  onSendTest?: (email: string, html: string, subject: string) => Promise<void>;
}

export interface UseEmailPreviewReturn extends EmailPreviewState {
  // Actions
  open: () => void;
  close: () => void;
  toggleDevice: () => void;
  setDevice: (device: PreviewDevice) => void;
  setTemplate: (template: EmailTemplate) => void;
  setTestEmailAddress: (email: string) => void;
  refreshPreview: () => Promise<void>;
  sendTestEmail: () => Promise<void>;
  clearErrors: () => void;
}

// ============================================================================
// Template Configurations
// ============================================================================

export const EMAIL_TEMPLATES: { id: EmailTemplate; name: string; description: string }[] = [
  { id: 'modern', name: 'Modern', description: 'Clean, contemporary design with gradient accents' },
  { id: 'classic', name: 'Classic', description: 'Traditional business email layout' },
  { id: 'minimal', name: 'Minimal', description: 'Simple, text-focused design' },
  { id: 'professional', name: 'Professional', description: 'Corporate style with full branding' },
];

// ============================================================================
// Helper Functions
// ============================================================================

function generateSubjectLine(quoteTitle: string, shopName: string): string {
  return `Your Quote from ${shopName} - ${quoteTitle}`;
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(date: string | Date | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function calculateTotals(lineItems: QuoteFormData['line_items']) {
  const subtotal = lineItems.reduce((sum, item) => {
    const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
    const discount = itemTotal * (item.discount_percent || 0) / 100;
    return sum + itemTotal - discount;
  }, 0);

  const taxTotal = lineItems.reduce((sum, item) => {
    const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
    const discount = itemTotal * (item.discount_percent || 0) / 100;
    const taxableAmount = itemTotal - discount;
    return sum + (taxableAmount * (item.tax_rate || 0) / 100);
  }, 0);

  return { subtotal, taxTotal, total: subtotal + taxTotal };
}

// ============================================================================
// Template Generators
// ============================================================================

interface TemplateData {
  quote: QuoteFormData;
  shopName: string;
  shopUrl: string;
  totals: { subtotal: number; taxTotal: number; total: number };
}

function generateModernTemplate(data: TemplateData): string {
  const { quote, shopName, shopUrl, totals } = data;
  const lineItems = quote.line_items || [];
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Quote from ${shopName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1f2937; background: #f3f4f6; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 48px 32px; text-align: center; color: white; }
    .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .header p { opacity: 0.9; font-size: 16px; }
    .content { padding: 40px 32px; }
    .greeting { font-size: 18px; margin-bottom: 16px; }
    .message { color: #4b5563; margin-bottom: 32px; }
    .quote-box { background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e5e7eb; }
    .quote-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
    .quote-title { font-size: 20px; font-weight: 600; color: #111827; }
    .badge { display: inline-block; padding: 6px 14px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .line-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .line-item:last-child { border-bottom: none; }
    .item-name { font-weight: 500; color: #111827; }
    .item-desc { font-size: 14px; color: #6b7280; }
    .item-price { font-weight: 600; color: #111827; }
    .totals { margin-top: 16px; padding-top: 16px; border-top: 2px solid #e5e7eb; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-row.final { font-size: 20px; font-weight: 700; color: #4f46e5; padding-top: 16px; border-top: 2px solid #e5e7eb; margin-top: 8px; }
    .button { display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 8px; }
    .button-secondary { background: #ffffff; color: #374151; border: 2px solid #e5e7eb; }
    .button-group { text-align: center; margin: 32px 0; }
    .validity { text-align: center; color: #6b7280; font-size: 14px; margin-top: 16px; }
    .footer { background: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #6b7280; font-size: 14px; margin: 4px 0; }
    @media (max-width: 480px) { .header, .content, .footer { padding: 24px 20px; } .header h1 { font-size: 22px; } .button { display: block; margin: 8px 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Quote is Ready</h1>
      <p>From ${shopName}</p>
    </div>
    <div class="content">
      <p class="greeting">Hi ${quote.customer.name || 'there'},</p>
      <p class="message">Thank you for your interest. We've prepared a personalized quote for you.</p>
      <div class="quote-box">
        <div class="quote-header">
          <span class="quote-title">${quote.title || 'Quote'}</span>
          <span class="badge">Quote</span>
        </div>
        ${lineItems.map(item => `
          <div class="line-item">
            <div>
              <div class="item-name">${item.quantity}x ${item.name}</div>
              ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
            </div>
            <div class="item-price">${formatCurrency(item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100))}</div>
          </div>
        `).join('')}
        <div class="totals">
          <div class="total-row"><span>Subtotal</span><span>${formatCurrency(totals.subtotal)}</span></div>
          ${totals.taxTotal > 0 ? `<div class="total-row"><span>Tax</span><span>${formatCurrency(totals.taxTotal)}</span></div>` : ''}
          <div class="total-row final"><span>Total</span><span>${formatCurrency(totals.total)}</span></div>
        </div>
      </div>
      <div class="button-group">
        <a href="${shopUrl}/quote/accept" class="button">Accept Quote</a>
        <a href="${shopUrl}/quote/view" class="button button-secondary">View Details</a>
      </div>
      <p class="validity">⏰ This quote is valid until ${formatDate(quote.valid_until)}</p>
      ${quote.notes ? `<div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 8px; color: #92400e;"><strong>Note:</strong> ${quote.notes}</div>` : ''}
    </div>
    <div class="footer">
      <p><strong>${shopName}</strong></p>
      <p>Questions? Reply to this email</p>
    </div>
  </div>
</body>
</html>`;
}

function generateClassicTemplate(data: TemplateData): string {
  const { quote, shopName, totals } = data;
  const lineItems = quote.line_items || [];
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote from ${shopName}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #ddd; }
    .header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: normal; }
    .content { padding: 40px; }
    .divider { border-top: 1px solid #ddd; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
    th { font-weight: bold; color: #555; }
    .total { font-weight: bold; font-size: 18px; color: #2c3e50; }
    .button { display: inline-block; background: #2c3e50; color: white; padding: 12px 24px; text-decoration: none; margin: 10px 5px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>QUOTE FROM ${shopName.toUpperCase()}</h1>
    </div>
    <div class="content">
      <p>Dear ${quote.customer.name || 'Valued Customer'},</p>
      <p>Please find your quote details below:</p>
      <div class="divider"></div>
      <h2>${quote.title || 'Quote'}</h2>
      <p><strong>Valid Until:</strong> ${formatDate(quote.valid_until)}</p>
      <table>
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        </thead>
        <tbody>
          ${lineItems.map(item => `
            <tr>
              <td>${item.name}${item.description ? `<br><small>${item.description}</small>` : ''}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.unit_price)}</td>
              <td>${formatCurrency(item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="divider"></div>
      <p style="text-align: right;"><strong>Subtotal:</strong> ${formatCurrency(totals.subtotal)}</p>
      ${totals.taxTotal > 0 ? `<p style="text-align: right;"><strong>Tax:</strong> ${formatCurrency(totals.taxTotal)}</p>` : ''}
      <p style="text-align: right;" class="total"><strong>Total:</strong> ${formatCurrency(totals.total)}</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="#" class="button">Accept Quote</a>
        <a href="#" class="button" style="background: #95a5a6;">View Online</a>
      </div>
      ${quote.notes ? `<div class="divider"></div><p><strong>Notes:</strong> ${quote.notes}</p>` : ''}
    </div>
    <div class="footer">
      <p>${shopName}</p>
      <p>This quote is valid until ${formatDate(quote.valid_until)}</p>
    </div>
  </div>
</body>
</html>`;
}

function generateMinimalTemplate(data: TemplateData): string {
  const { quote, shopName, totals } = data;
  const lineItems = quote.line_items || [];
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote from ${shopName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #000; background: #fff; margin: 0; padding: 40px 20px; }
    .container { max-width: 500px; margin: 0 auto; }
    h1 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
    .meta { color: #666; margin-bottom: 32px; }
    .line-item { padding: 12px 0; border-bottom: 1px solid #eee; }
    .totals { margin-top: 24px; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .total-final { font-weight: 600; font-size: 18px; border-top: 2px solid #000; padding-top: 12px; margin-top: 8px; }
    .button { display: block; text-align: center; background: #000; color: #fff; padding: 16px; text-decoration: none; margin-top: 32px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${quote.title || 'Quote'}</h1>
    <p class="meta">${shopName} • Valid until ${formatDate(quote.valid_until)}</p>
    <p>Hi ${quote.customer.name || 'there'},</p>
    <p>Here's your quote:</p>
    ${lineItems.map(item => `
      <div class="line-item">
        <div><strong>${item.name}</strong> × ${item.quantity}</div>
        <div>${formatCurrency(item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100))}</div>
      </div>
    `).join('')}
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>${formatCurrency(totals.subtotal)}</span></div>
      ${totals.taxTotal > 0 ? `<div class="total-row"><span>Tax</span><span>${formatCurrency(totals.taxTotal)}</span></div>` : ''}
      <div class="total-row total-final"><span>Total</span><span>${formatCurrency(totals.total)}</span></div>
    </div>
    <a href="#" class="button">Accept Quote →</a>
    ${quote.notes ? `<p style="margin-top: 24px; color: #666;">${quote.notes}</p>` : ''}
    <div class="footer">
      <p>Questions? Reply to this email</p>
    </div>
  </div>
</body>
</html>`;
}

function generateProfessionalTemplate(data: TemplateData): string {
  const { quote, shopName, shopUrl, totals } = data;
  const lineItems = quote.line_items || [];
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote - ${shopName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1a1a1a; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 680px; margin: 0 auto; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1a1a1a; color: #fff; padding: 40px; display: flex; justify-content: space-between; align-items: center; }
    .header-left h1 { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0; opacity: 0.7; }
    .header-left .company { font-size: 24px; font-weight: 700; }
    .header-right { text-align: right; }
    .quote-number { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; }
    .content { padding: 48px; }
    .customer-info { margin-bottom: 40px; }
    .customer-info h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 8px; }
    .line-items { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .line-items th { text-align: left; padding: 16px 12px; border-bottom: 2px solid #1a1a1a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; }
    .line-items td { padding: 16px 12px; border-bottom: 1px solid #e5e5e5; }
    .line-items .text-right { text-align: right; }
    .totals { margin-top: 24px; margin-left: auto; width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-final { font-size: 20px; font-weight: 700; border-top: 2px solid #1a1a1a; padding-top: 16px; margin-top: 8px; }
    .actions { margin-top: 48px; text-align: center; }
    .button { display: inline-block; background: #1a1a1a; color: #fff; padding: 16px 48px; text-decoration: none; font-weight: 600; margin: 0 8px; }
    .button-outline { background: transparent; color: #1a1a1a; border: 2px solid #1a1a1a; }
    .terms { margin-top: 48px; padding-top: 32px; border-top: 1px solid #e5e5e5; }
    .footer { background: #f5f5f5; padding: 32px 48px; text-align: center; font-size: 13px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h1>Quote</h1>
        <div class="company">${shopName}</div>
      </div>
      <div class="header-right">
        <div class="quote-number">Quote #</div>
        <div style="font-size: 20px; font-weight: 600;">QT-2024-001</div>
      </div>
    </div>
    <div class="content">
      <div class="customer-info">
        <h3>Bill To</h3>
        <div style="font-size: 18px; font-weight: 600;">${quote.customer.name || quote.customer.company || 'Customer'}</div>
        <div>${quote.customer.company || ''}</div>
        <div>${quote.customer.email}</div>
        ${quote.customer.phone ? `<div>${quote.customer.phone}</div>` : ''}
      </div>
      <table class="line-items">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItems.map(item => `
            <tr>
              <td>
                <strong>${item.name}</strong>
                ${item.description ? `<br><span style="color: #666; font-size: 14px;">${item.description}</span>` : ''}
              </td>
              <td style="text-align: center;">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unit_price)}</td>
              <td class="text-right">${formatCurrency(item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="totals">
        <div class="total-row"><span>Subtotal</span><span>${formatCurrency(totals.subtotal)}</span></div>
        ${totals.taxTotal > 0 ? `<div class="total-row"><span>Tax</span><span>${formatCurrency(totals.taxTotal)}</span></div>` : ''}
        <div class="total-row total-final"><span>Total</span><span>${formatCurrency(totals.total)}</span></div>
      </div>
      <div class="actions">
        <a href="#" class="button">Accept Quote</a>
        <a href="#" class="button button-outline">View Online</a>
      </div>
      ${quote.terms || quote.notes ? `
        <div class="terms">
          ${quote.terms ? `<h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 12px;">Terms & Conditions</h3><p style="color: #666; font-size: 14px;">${quote.terms}</p>` : ''}
          ${quote.notes ? `<h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 24px 0 12px;">Notes</h3><p style="color: #666; font-size: 14px;">${quote.notes}</p>` : ''}
        </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>Thank you for your business</p>
      <p style="margin-top: 8px;">This quote is valid until ${formatDate(quote.valid_until)}</p>
    </div>
  </div>
</body>
</html>`;
}

function generateEmailHtml(template: EmailTemplate, data: TemplateData): string {
  switch (template) {
    case 'modern':
      return generateModernTemplate(data);
    case 'classic':
      return generateClassicTemplate(data);
    case 'minimal':
      return generateMinimalTemplate(data);
    case 'professional':
      return generateProfessionalTemplate(data);
    default:
      return generateModernTemplate(data);
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useEmailPreview(
  quoteData: QuoteFormData,
  options: UseEmailPreviewOptions = {}
): UseEmailPreviewReturn {
  const {
    shopName = 'Your Shop',
    shopEmail = 'quotes@example.com',
    defaultTemplate = 'modern',
  } = options;

  const [state, setState] = useState<EmailPreviewState>({
    isOpen: false,
    device: 'desktop',
    selectedTemplate: defaultTemplate,
    html: null,
    subject: generateSubjectLine(quoteData.title || 'Quote', shopName),
    senderName: shopName,
    senderEmail: shopEmail,
    isLoading: false,
    error: null,
    testEmailAddress: quoteData.customer.email || '',
    isSendingTest: false,
    sendTestError: null,
    sendTestSuccess: false,
  });

  const generatePreview = useCallback(async (): Promise<string> => {
    const totals = calculateTotals(quoteData.line_items);
    const shopUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quotegen.app';
    
    const data: TemplateData = {
      quote: quoteData,
      shopName,
      shopUrl,
      totals,
    };

    // Simulate API call for server-side rendering
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return generateEmailHtml(state.selectedTemplate, data);
  }, [quoteData, shopName, state.selectedTemplate]);

  const open = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true, error: null }));
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isOpen: false,
      sendTestSuccess: false,
      sendTestError: null,
    }));
  }, []);

  const toggleDevice = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      device: prev.device === 'desktop' ? 'mobile' : 'desktop' 
    }));
  }, []);

  const setDevice = useCallback((device: PreviewDevice) => {
    setState(prev => ({ ...prev, device }));
  }, []);

  const setTemplate = useCallback((template: EmailTemplate) => {
    setState(prev => ({ ...prev, selectedTemplate: template }));
  }, []);

  const setTestEmailAddress = useCallback((email: string) => {
    setState(prev => ({ ...prev, testEmailAddress: email }));
  }, []);

  const refreshPreview = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const html = await generatePreview();
      setState(prev => ({ ...prev, html, isLoading: false }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate preview';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
        html: null,
      }));
    }
  }, [generatePreview]);

  const sendTestEmail = useCallback(async () => {
    if (!state.testEmailAddress || !state.testEmailAddress.includes('@')) {
      setState(prev => ({ 
        ...prev, 
        sendTestError: 'Please enter a valid email address',
        sendTestSuccess: false,
      }));
      return;
    }

    if (!state.html) {
      setState(prev => ({ 
        ...prev, 
        sendTestError: 'Preview not ready. Please wait and try again.',
        sendTestSuccess: false,
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isSendingTest: true, 
      sendTestError: null,
      sendTestSuccess: false,
    }));

    try {
      const response = await fetch('/api/email/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: state.testEmailAddress,
          subject: state.subject,
          html: state.html,
          template: state.selectedTemplate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to send test email: ${response.statusText}`);
      }

      setState(prev => ({ 
        ...prev, 
        isSendingTest: false,
        sendTestSuccess: true,
        sendTestError: null,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test email';
      setState(prev => ({ 
        ...prev, 
        isSendingTest: false,
        sendTestError: errorMessage,
        sendTestSuccess: false,
      }));
    }
  }, [state.testEmailAddress, state.html, state.subject, state.selectedTemplate]);

  const clearErrors = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      error: null, 
      sendTestError: null,
      sendTestSuccess: false,
    }));
  }, []);

  // Auto-generate preview when modal opens or template changes
  useEffect(() => {
    if (state.isOpen && !state.html) {
      refreshPreview();
    }
  }, [state.isOpen, state.selectedTemplate]);

  // Update subject when quote data changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      subject: generateSubjectLine(quoteData.title || 'Quote', shopName),
      testEmailAddress: quoteData.customer.email || prev.testEmailAddress,
    }));
  }, [quoteData.title, quoteData.customer.email, shopName]);

  return {
    ...state,
    open,
    close,
    toggleDevice,
    setDevice,
    setTemplate,
    setTestEmailAddress,
    refreshPreview,
    sendTestEmail,
    clearErrors,
  };
}

export default useEmailPreview;
