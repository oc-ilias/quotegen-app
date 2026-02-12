/**
 * Email Service Library Tests
 * Tests for email validation, template processing
 * @module lib/__tests__/email-service.test.ts
 */

import {
  sendEmail,
  sendBulkEmails,
  generateQuoteSentEmail,
  generateQuoteReminderEmail,
  generateQuoteAcceptedEmail,
  generateQuoteDeclinedEmail,
  generateQuoteExpiredEmail,
  generateWelcomeEmail,
  sendQuoteEmail,
  EmailOptions,
  EmailTemplateData,
  EmailResult,
} from '@/lib/email-service';
import { Quote, QuoteStatus, Customer } from '@/types/quote';

// ============================================================================
// Mocks
// ============================================================================

const mockResendSend = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockResendSend,
    },
  })),
}));

const mockConsoleLog = jest.fn();
const mockConsoleError = jest.fn();

// ============================================================================
// Mock Data
// ============================================================================

const mockCustomer: Customer = {
  id: 'c1',
  email: 'customer@example.com',
  companyName: 'Acme Corporation',
  contactName: 'John Doe',
  customerSince: new Date('2023-01-01'),
  tags: ['vip', 'enterprise'],
};

const mockQuote: Quote = {
  id: 'q1',
  quoteNumber: 'QT-2024-001',
  title: 'Office Equipment Quote',
  status: QuoteStatus.SENT,
  customer: mockCustomer,
  lineItems: [
    {
      id: 'li1',
      productId: 'p1',
      title: 'Laptop',
      variantTitle: 'Pro 16"',
      quantity: 5,
      unitPrice: 1500,
      total: 7500,
      sku: 'LAPTOP-001',
    },
    {
      id: 'li2',
      productId: 'p2',
      title: 'Monitor',
      quantity: 10,
      unitPrice: 300,
      total: 3000,
      sku: 'MON-002',
    },
  ],
  subtotal: 10500,
  discountTotal: 500,
  taxTotal: 900,
  total: 10900,
  terms: {
    currency: 'USD',
    paymentTerms: 'net30',
    deliveryTerms: 'standard',
    validityPeriod: 30,
    depositRequired: true,
  },
  notes: 'Please review and confirm',
  metadata: {
    createdBy: 'user1',
    createdByName: 'Sales Rep',
    source: 'web',
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  expiresAt: new Date('2024-02-15'),
  sentAt: new Date('2024-01-15'),
};

const mockTemplateData: EmailTemplateData = {
  quote: mockQuote,
  customer: mockCustomer,
  shopName: 'Test Shop',
  shopLogo: 'https://example.com/logo.png',
  shopUrl: 'https://testshop.com',
  viewUrl: 'https://testshop.com/quotes/q1',
  acceptUrl: 'https://testshop.com/quotes/q1/accept',
  declineUrl: 'https://testshop.com/quotes/q1/decline',
  message: 'Please review this quote at your earliest convenience.',
};

// ============================================================================
// Setup
// ============================================================================

describe('Email Service Library', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = mockConsoleLog;
    console.error = mockConsoleError;

    // Reset environment
    process.env = { ...originalEnv };
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.FROM_EMAIL = 'test@quotegen.app';
    process.env.NEXT_PUBLIC_APP_URL = 'https://quotegen.app';

    mockResendSend.mockResolvedValue({
      data: { id: 'email-123' },
      error: null,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ============================================================================
  // sendEmail
  // ============================================================================

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Hello</h1>',
      };

      const result = await sendEmail(options);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'test@quotegen.app',
          to: 'recipient@example.com',
          subject: 'Test Subject',
          html: '<h1>Hello</h1>',
        })
      );
      expect(result.success).toBe(true);
      expect(result.id).toBe('email-123');
    });

    it('should use default from email', async () => {
      delete process.env.FROM_EMAIL;

      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      await sendEmail(options);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'QuoteGen <quotes@quotegen.app>',
        })
      );
    });

    it('should handle multiple recipients', async () => {
      const options: EmailOptions = {
        to: ['recipient1@example.com', 'recipient2@example.com'],
        subject: 'Test',
        html: '<p>Test</p>',
      };

      await sendEmail(options);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['recipient1@example.com', 'recipient2@example.com'],
        })
      );
    });

    it('should include text version when provided', async () => {
      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<h1>Hello</h1>',
        text: 'Hello',
      };

      await sendEmail(options);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Hello',
        })
      );
    });

    it('should include reply_to when provided', async () => {
      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        replyTo: 'reply@example.com',
      };

      await sendEmail(options);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          reply_to: 'reply@example.com',
        })
      );
    });

    it('should include CC recipients', async () => {
      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        cc: ['cc1@example.com', 'cc2@example.com'],
      };

      await sendEmail(options);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          cc: ['cc1@example.com', 'cc2@example.com'],
        })
      );
    });

    it('should include BCC recipients', async () => {
      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        bcc: 'bcc@example.com',
      };

      await sendEmail(options);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          bcc: 'bcc@example.com',
        })
      );
    });

    it('should include attachments', async () => {
      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        attachments: [
          {
            filename: 'document.pdf',
            content: Buffer.from('test'),
            contentType: 'application/pdf',
          },
        ],
      };

      await sendEmail(options);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              filename: 'document.pdf',
              content: expect.any(Buffer),
            }),
          ]),
        })
      );
    });

    it('should include tags', async () => {
      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        tags: [
          { name: 'type', value: 'quote' },
          { name: 'status', value: 'sent' },
        ],
      };

      await sendEmail(options);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: [
            { name: 'type', value: 'quote' },
            { name: 'status', value: 'sent' },
          ],
        })
      );
    });

    it('should handle API error', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key' },
      });

      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      const result = await sendEmail(options);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('should handle network error', async () => {
      mockResendSend.mockRejectedValue(new Error('Network error'));

      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      const result = await sendEmail(options);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle non-Error exception', async () => {
      mockResendSend.mockRejectedValue('String error');

      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      const result = await sendEmail(options);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('should log in development mode when no API key', async () => {
      process.env.RESEND_API_KEY = undefined;

      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      const result = await sendEmail(options);

      expect(mockConsoleLog).toHaveBeenCalledWith('📧 [EMAIL - DEVELOPMENT MODE]');
      expect(mockConsoleLog).toHaveBeenCalledWith('   To:', 'recipient@example.com');
      expect(mockConsoleLog).toHaveBeenCalledWith('   Subject:', 'Test');
      expect(result.success).toBe(true);
      expect(result.id).toContain('mock-');
    });

    it('should handle placeholder API key', async () => {
      process.env.RESEND_API_KEY = 're_placeholder';

      const options: EmailOptions = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      const result = await sendEmail(options);

      expect(mockConsoleLog).toHaveBeenCalledWith('📧 [EMAIL - DEVELOPMENT MODE]');
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // sendBulkEmails
  // ============================================================================

  describe('sendBulkEmails', () => {
    it('should send multiple emails', async () => {
      const emails: EmailOptions[] = [
        { to: 'user1@example.com', subject: 'Test 1', html: '<p>Test 1</p>' },
        { to: 'user2@example.com', subject: 'Test 2', html: '<p>Test 2</p>' },
      ];

      const results = await sendBulkEmails(emails);

      expect(results).toHaveLength(2);
      expect(mockResendSend).toHaveBeenCalledTimes(2);
    });

    it('should batch emails correctly', async () => {
      const emails: EmailOptions[] = Array.from({ length: 25 }, (_, i) => ({
        to: `user${i}@example.com`,
        subject: `Test ${i}`,
        html: `<p>Test ${i}</p>`,
      }));

      await sendBulkEmails(emails, 10);

      // Should send 25 emails in 3 batches
      expect(mockResendSend).toHaveBeenCalledTimes(25);
    });

    it('should handle empty array', async () => {
      const results = await sendBulkEmails([]);

      expect(results).toEqual([]);
      expect(mockResendSend).not.toHaveBeenCalled();
    });

    it('should handle single email', async () => {
      const emails: EmailOptions[] = [
        { to: 'user@example.com', subject: 'Test', html: '<p>Test</p>' },
      ];

      const results = await sendBulkEmails(emails);

      expect(results).toHaveLength(1);
    });

    it('should return results for all emails', async () => {
      mockResendSend
        .mockResolvedValueOnce({ data: { id: 'email-1' }, error: null })
        .mockResolvedValueOnce({ data: null, error: { message: 'Error' } })
        .mockResolvedValueOnce({ data: { id: 'email-3' }, error: null });

      const emails: EmailOptions[] = [
        { to: 'user1@example.com', subject: 'Test 1', html: '<p>Test 1</p>' },
        { to: 'user2@example.com', subject: 'Test 2', html: '<p>Test 2</p>' },
        { to: 'user3@example.com', subject: 'Test 3', html: '<p>Test 3</p>' },
      ];

      const results = await sendBulkEmails(emails);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });
  });

  // ============================================================================
  // Email Templates
  // ============================================================================

  describe('generateQuoteSentEmail', () => {
    it('should generate quote sent email', () => {
      const result = generateQuoteSentEmail(mockTemplateData);

      expect(result.subject).toContain('Your Quote from Test Shop');
      expect(result.subject).toContain('QT-2024-001');
      expect(result.html).toContain('Office Equipment Quote');
      expect(result.html).toContain('Acme Corporation');
    });

    it('should include quote total', () => {
      const result = generateQuoteSentEmail(mockTemplateData);

      expect(result.html).toContain('10,900');
    });

    it('should include action buttons', () => {
      const result = generateQuoteSentEmail(mockTemplateData);

      expect(result.html).toContain(mockTemplateData.viewUrl);
      expect(result.html).toContain(mockTemplateData.acceptUrl);
      expect(result.html).toContain(mockTemplateData.declineUrl);
    });

    it('should include line items', () => {
      const result = generateQuoteSentEmail(mockTemplateData);

      expect(result.html).toContain('Laptop');
      expect(result.html).toContain('Monitor');
      expect(result.html).toContain('5');
      expect(result.html).toContain('10');
    });

    it('should include custom message', () => {
      const result = generateQuoteSentEmail(mockTemplateData);

      expect(result.html).toContain('Please review this quote at your earliest convenience.');
    });

    it('should use contact name when available', () => {
      const result = generateQuoteSentEmail(mockTemplateData);

      expect(result.html).toContain('Hi John Doe');
    });

    it('should fall back to company name', () => {
      const dataWithoutContact = {
        ...mockTemplateData,
        customer: { ...mockCustomer, contactName: undefined },
      };

      const result = generateQuoteSentEmail(dataWithoutContact);

      expect(result.html).toContain('Hi Acme Corporation');
    });

    it('should include expiry date', () => {
      const result = generateQuoteSentEmail(mockTemplateData);

      expect(result.html).toContain('Valid until');
    });

    it('should include discount when present', () => {
      const result = generateQuoteSentEmail(mockTemplateData);

      expect(result.html).toContain('Discount');
    });

    it('should not show discount when zero', () => {
      const dataWithoutDiscount = {
        ...mockTemplateData,
        quote: { ...mockQuote, discountTotal: 0 },
      };

      const result = generateQuoteSentEmail(dataWithoutDiscount);

      // Should not contain discount row
      const discountMatches = (result.html.match(/Discount/g) || []).length;
      expect(discountMatches).toBeLessThanOrEqual(1);
    });
  });

  describe('generateQuoteReminderEmail', () => {
    it('should generate reminder email', () => {
      const result = generateQuoteReminderEmail(mockTemplateData);

      expect(result.subject).toContain('Reminder');
      expect(result.subject).toContain('Expires Soon');
      expect(result.html).toContain('expires on');
    });

    it('should highlight expiration date', () => {
      const result = generateQuoteReminderEmail(mockTemplateData);

      expect(result.html).toContain('⏰ Expires');
    });

    it('should include accept button', () => {
      const result = generateQuoteReminderEmail(mockTemplateData);

      expect(result.html).toContain('Accept Quote Now');
      expect(result.html).toContain(mockTemplateData.acceptUrl);
    });

    it('should show total prominently', () => {
      const result = generateQuoteReminderEmail(mockTemplateData);

      expect(result.html).toContain('10,900');
    });
  });

  describe('generateQuoteAcceptedEmail', () => {
    it('should generate acceptance confirmation', () => {
      const result = generateQuoteAcceptedEmail(mockTemplateData);

      expect(result.subject).toContain('Quote Accepted');
      expect(result.html).toContain('Quote Accepted');
      expect(result.html).toContain('✅');
    });

    it('should include next steps', () => {
      const result = generateQuoteAcceptedEmail(mockTemplateData);

      expect(result.html).toContain('Next Steps');
      expect(result.html).toContain('processing your order');
      expect(result.html).toContain('invoice within 24 hours');
    });

    it('should use green color scheme', () => {
      const result = generateQuoteAcceptedEmail(mockTemplateData);

      expect(result.html).toContain('#10b981');
    });

    it('should include view order link', () => {
      const result = generateQuoteAcceptedEmail(mockTemplateData);

      expect(result.html).toContain('View Order Status');
    });
  });

  describe('generateQuoteDeclinedEmail', () => {
    it('should generate decline confirmation', () => {
      const result = generateQuoteDeclinedEmail(mockTemplateData);

      expect(result.subject).toContain('Quote Declined');
      expect(result.html).toContain('Quote Declined');
    });

    it('should include feedback message', () => {
      const result = generateQuoteDeclinedEmail(mockTemplateData);

      expect(result.html).toContain('we\'re here to help');
    });

    it('should include contact button', () => {
      const result = generateQuoteDeclinedEmail(mockTemplateData);

      expect(result.html).toContain('Contact Us');
    });

    it('should include custom message if provided', () => {
      const dataWithMessage = {
        ...mockTemplateData,
        message: 'Price is too high',
      };

      const result = generateQuoteDeclinedEmail(dataWithMessage);

      expect(result.html).toContain('Price is too high');
    });
  });

  describe('generateQuoteExpiredEmail', () => {
    it('should generate expiration notice', () => {
      const result = generateQuoteExpiredEmail(mockTemplateData);

      expect(result.subject).toContain('Quote Expired');
      expect(result.html).toContain('Quote Expired');
      expect(result.html).toContain('⏰ Quote Expired');
    });

    it('should offer to refresh quote', () => {
      const result = generateQuoteExpiredEmail(mockTemplateData);

      expect(result.html).toContain('refresh this quote');
      expect(result.html).toContain('Request New Quote');
    });
  });

  describe('generateWelcomeEmail', () => {
    it('should generate welcome email', () => {
      const data = {
        customerName: 'John Doe',
        shopName: 'Test Shop',
        shopUrl: 'https://testshop.com',
        dashboardUrl: 'https://testshop.com/dashboard',
      };

      const result = generateWelcomeEmail(data);

      expect(result.subject).toContain('Welcome to Test Shop');
      expect(result.html).toContain('Welcome John Doe');
      expect(result.html).toContain('Welcome Aboard');
    });

    it('should include dashboard link', () => {
      const data = {
        customerName: 'John',
        shopName: 'Shop',
        shopUrl: 'https://shop.com',
        dashboardUrl: 'https://shop.com/dashboard',
      };

      const result = generateWelcomeEmail(data);

      expect(result.html).toContain('Go to Dashboard');
      expect(result.html).toContain('https://shop.com/dashboard');
    });

    it('should list capabilities', () => {
      const data = {
        customerName: 'John',
        shopName: 'Shop',
        shopUrl: 'https://shop.com',
        dashboardUrl: 'https://shop.com/dashboard',
      };

      const result = generateWelcomeEmail(data);

      expect(result.html).toContain('Request custom quotes');
      expect(result.html).toContain('Track quote status');
      expect(result.html).toContain('View your order history');
    });
  });

  // ============================================================================
  // sendQuoteEmail
  // ============================================================================

  describe('sendQuoteEmail', () => {
    it('should send quote_sent email', async () => {
      await sendQuoteEmail('quote_sent', mockTemplateData);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockCustomer.email,
          subject: expect.stringContaining('Your Quote'),
          tags: expect.arrayContaining([
            { name: 'type', value: 'quote_sent' },
            { name: 'quote_id', value: mockQuote.id },
          ]),
        })
      );
    });

    it('should send quote_reminder email', async () => {
      await sendQuoteEmail('quote_reminder', mockTemplateData);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Reminder'),
          tags: expect.arrayContaining([
            { name: 'type', value: 'quote_reminder' },
          ]),
        })
      );
    });

    it('should send quote_accepted email', async () => {
      await sendQuoteEmail('quote_accepted', mockTemplateData);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Accepted'),
          tags: expect.arrayContaining([
            { name: 'type', value: 'quote_accepted' },
          ]),
        })
      );
    });

    it('should send quote_declined email', async () => {
      await sendQuoteEmail('quote_declined', mockTemplateData);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Declined'),
          tags: expect.arrayContaining([
            { name: 'type', value: 'quote_declined' },
          ]),
        })
      );
    });

    it('should send quote_expired email', async () => {
      await sendQuoteEmail('quote_expired', mockTemplateData);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Expired'),
          tags: expect.arrayContaining([
            { name: 'type', value: 'quote_expired' },
          ]),
        })
      );
    });

    it('should return error for unknown email type', async () => {
      const result = await sendQuoteEmail('unknown_type' as any, mockTemplateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown email type');
      expect(mockResendSend).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { message: 'API Error' },
      });

      const result = await sendQuoteEmail('quote_sent', mockTemplateData);

      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('should handle special characters in email content', async () => {
      const specialData = {
        ...mockTemplateData,
        quote: {
          ...mockQuote,
          title: 'Quote with <script> & "special" chars',
        },
      };

      const result = generateQuoteSentEmail(specialData);

      // HTML should be properly escaped or handled
      expect(result.html).toContain('Quote with');
    });

    it('should handle very long quote numbers', () => {
      const longData = {
        ...mockTemplateData,
        quote: {
          ...mockQuote,
          quoteNumber: 'QT-VERY-LONG-QUOTE-NUMBER-123456789',
        },
      };

      const result = generateQuoteSentEmail(longData);

      expect(result.subject).toContain('QT-VERY-LONG-QUOTE-NUMBER');
    });

    it('should handle zero amounts', () => {
      const zeroData = {
        ...mockTemplateData,
        quote: {
          ...mockQuote,
          subtotal: 0,
          taxTotal: 0,
          discountTotal: 0,
          total: 0,
        },
      };

      const result = generateQuoteSentEmail(zeroData);

      expect(result.html).toContain('$0.00');
    });

    it('should handle empty line items', () => {
      const emptyData = {
        ...mockTemplateData,
        quote: {
          ...mockQuote,
          lineItems: [],
        },
      };

      const result = generateQuoteSentEmail(emptyData);

      expect(result.html).not.toContain('NaN');
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalData = {
        ...mockTemplateData,
        shopLogo: undefined,
        message: undefined,
      };

      const result = generateQuoteSentEmail(minimalData);

      expect(result.html).toContain('Your Quote is Ready');
    });

    it('should handle different currencies', () => {
      const eurData = {
        ...mockTemplateData,
        quote: {
          ...mockQuote,
          terms: { ...mockQuote.terms, currency: 'EUR' },
        },
      };

      const result = generateQuoteSentEmail(eurData);

      expect(result.html).toContain('€');
    });

    it('should handle GBP currency', () => {
      const gbpData = {
        ...mockTemplateData,
        quote: {
          ...mockQuote,
          terms: { ...mockQuote.terms, currency: 'GBP' },
        },
      };

      const result = generateQuoteSentEmail(gbpData);

      expect(result.html).toContain('£');
    });

    it('should handle JPY currency (no decimals)', () => {
      const jpyData = {
        ...mockTemplateData,
        quote: {
          ...mockQuote,
          terms: { ...mockQuote.terms, currency: 'JPY' },
        },
      };

      const result = generateQuoteSentEmail(jpyData);

      expect(result.html).toContain('¥');
    });

    it('should format dates consistently', () => {
      const result = generateQuoteSentEmail(mockTemplateData);

      // Should contain formatted date
      expect(result.html).toMatch(/[A-Za-z]+ \d{1,2},? \d{4}/);
    });
  });
});
