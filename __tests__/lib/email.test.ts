/**
 * @jest-environment node
 * 
 * Comprehensive tests for email service
 * Tests all email functionality including error handling, templates, and edge cases
 */

const mockSend = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

import { 
  newQuoteEmailTemplate, 
  quoteStatusUpdateEmailTemplate 
} from '@/lib/email';

describe('Email Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.RESEND_API_KEY;
    delete process.env.FROM_EMAIL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('sendEmail (with mocked Resend)', () => {
    // Re-import with different env to test different states
    it('should send email successfully with valid configuration', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      process.env.FROM_EMAIL = 'test@quotegen.app';
      
      // Reset modules to get fresh import
      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');
      
      const mockResponse = { id: 'email-123' };
      mockSend.mockResolvedValueOnce({ data: mockResponse, error: null });

      const result = await sendEmail({
        to: 'customer@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      });

      expect(result).toEqual(mockResponse);
      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@quotegen.app',
        to: 'customer@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      });
    });

    it('should use default from email when FROM_EMAIL not set', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      
      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');
      
      mockSend.mockResolvedValueOnce({ data: { id: 'email-123' }, error: null });

      await sendEmail({
        to: 'customer@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'QuoteGen <noreply@quotegen.app>',
        })
      );
    });

    it('should return mock response when Resend is not configured', async () => {
      // No RESEND_API_KEY set
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');

      const result = await sendEmail({
        to: 'customer@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      });

      expect(result).toEqual({ id: 'mock-email-id' });
      expect(mockSend).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Email service not configured. Would send to:',
        'customer@example.com'
      );

      consoleSpy.mockRestore();
    });

    it('should throw error when Resend returns error', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      
      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');
      
      const resendError = new Error('Invalid API key');
      mockSend.mockResolvedValueOnce({ data: null, error: resendError });

      await expect(sendEmail({
        to: 'customer@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      })).rejects.toThrow('Invalid API key');
    });

    it('should throw error when network request fails', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      
      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');
      
      const networkError = new Error('Network error');
      mockSend.mockRejectedValueOnce(networkError);

      await expect(sendEmail({
        to: 'customer@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      })).rejects.toThrow('Network error');
    });

    it('should handle empty HTML content', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      
      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');
      
      mockSend.mockResolvedValueOnce({ data: { id: 'email-123' }, error: null });

      await sendEmail({
        to: 'customer@example.com',
        subject: 'Empty HTML',
        html: '',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ html: '' })
      );
    });

    it('should handle special characters in subject', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      
      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');
      
      mockSend.mockResolvedValueOnce({ data: { id: 'email-123' }, error: null });

      await sendEmail({
        to: 'customer@example.com',
        subject: 'Special chars: <>&"\'',
        html: '<p>Test</p>',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'Special chars: <>&"\'' })
      );
    });

    it('should handle multiple recipients format', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      
      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');
      
      mockSend.mockResolvedValueOnce({ data: { id: 'email-123' }, error: null });

      await sendEmail({
        to: 'customer1@example.com, customer2@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(mockSend).toHaveBeenCalled();
    });

    it('should handle very long HTML content', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      
      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');
      
      mockSend.mockResolvedValueOnce({ data: { id: 'email-123' }, error: null });
      
      const longHtml = '<p>' + 'A'.repeat(10000) + '</p>';

      await sendEmail({
        to: 'customer@example.com',
        subject: 'Long content',
        html: longHtml,
      });

      expect(mockSend).toHaveBeenCalled();
    });

    it('should log errors when sending fails', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      
      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Send failed');
      mockSend.mockRejectedValueOnce(error);

      await expect(sendEmail({
        to: 'customer@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to send email:', error);
      consoleSpy.mockRestore();
    });

    it('should log Resend errors when API returns error', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      
      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const apiError = new Error('API Error');
      mockSend.mockResolvedValueOnce({ data: null, error: apiError });

      await expect(sendEmail({
        to: 'customer@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Error sending email:', apiError);
      consoleSpy.mockRestore();
    });
  });

  describe('newQuoteEmailTemplate', () => {
    it('should generate template with all fields', () => {
      const quoteData = {
        productTitle: 'Test Product',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        quantity: 5,
        message: 'Please provide a quote for this item.',
        quoteId: 'quote-123',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-123',
      };

      const template = newQuoteEmailTemplate(quoteData);

      expect(template.subject).toBe('New Quote Request: Test Product');
      expect(template.html).toContain('Test Product');
      expect(template.html).toContain('John Doe');
      expect(template.html).toContain('john@example.com');
      expect(template.html).toContain('5');
      expect(template.html).toContain('Please provide a quote for this item.');
      expect(template.html).toContain('https://app.quotegen.app/quotes/quote-123');
      expect(template.html).toContain('View in Dashboard');
    });

    it('should generate template without optional fields', () => {
      const quoteData = {
        productTitle: 'Test Product',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        quoteId: 'quote-456',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-456',
      };

      const template = newQuoteEmailTemplate(quoteData);

      expect(template.subject).toBe('New Quote Request: Test Product');
      expect(template.html).toContain('Test Product');
      expect(template.html).toContain('Jane Smith');
      // Quantity and message should not appear
      expect(template.html).not.toContain('Quantity:');
    });

    it('should handle empty customer name', () => {
      const quoteData = {
        productTitle: 'Test Product',
        customerName: '',
        customerEmail: 'test@example.com',
        quoteId: 'quote-789',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-789',
      };

      const template = newQuoteEmailTemplate(quoteData);

      expect(template.html).toContain('N/A');
    });

    it('should handle special characters in product title', () => {
      const quoteData = {
        productTitle: 'Product with <special> & "chars"',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        quoteId: 'quote-999',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-999',
      };

      const template = newQuoteEmailTemplate(quoteData);

      expect(template.subject).toBe('New Quote Request: Product with <special> & "chars"');
    });

    it('should contain proper HTML structure', () => {
      const quoteData = {
        productTitle: 'Test',
        customerName: 'Test',
        customerEmail: 'test@test.com',
        quoteId: 'q-1',
        dashboardUrl: 'https://test.com',
      };

      const template = newQuoteEmailTemplate(quoteData);

      expect(template.html).toContain('<!DOCTYPE html>');
      expect(template.html).toContain('<html>');
      expect(template.html).toContain('<head>');
      expect(template.html).toContain('<body>');
      expect(template.html).toContain('</html>');
    });

    it('should include inline CSS styles', () => {
      const quoteData = {
        productTitle: 'Test',
        customerName: 'Test',
        customerEmail: 'test@test.com',
        quoteId: 'q-1',
        dashboardUrl: 'https://test.com',
      };

      const template = newQuoteEmailTemplate(quoteData);

      expect(template.html).toContain('<style>');
      expect(template.html).toContain('background:');
      expect(template.html).toContain('font-family:');
    });
  });

  describe('quoteStatusUpdateEmailTemplate', () => {
    it('should generate template for quoted status', () => {
      const quoteData = {
        productTitle: 'Test Product',
        status: 'quoted',
        quoteAmount: 1500,
        shopName: 'My Shop',
        shopUrl: 'https://myshop.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.subject).toBe('Quote Update: Test Product');
      expect(template.html).toContain('Test Product');
      expect(template.html).toContain('Quoted');
      expect(template.html).toContain('1500');
      expect(template.html).toContain('My Shop');
      expect(template.html).toContain('https://myshop.com');
    });

    it('should generate template for accepted status', () => {
      const quoteData = {
        productTitle: 'Test Product',
        status: 'accepted',
        shopName: 'My Shop',
        shopUrl: 'https://myshop.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.html).toContain('Accepted');
      expect(template.html).toContain('Great news!');
    });

    it('should generate template for declined status', () => {
      const quoteData = {
        productTitle: 'Test Product',
        status: 'declined',
        shopName: 'My Shop',
        shopUrl: 'https://myshop.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.html).toContain('Declined');
      expect(template.html).toContain('Unfortunately');
    });

    it('should handle quoted status without amount', () => {
      const quoteData = {
        productTitle: 'Test Product',
        status: 'quoted',
        shopName: 'My Shop',
        shopUrl: 'https://myshop.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.html).toContain('Quoted');
      // Should not contain amount reference
    });

    it('should handle unknown status gracefully', () => {
      const quoteData = {
        productTitle: 'Test Product',
        status: 'unknown_status',
        shopName: 'My Shop',
        shopUrl: 'https://myshop.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.subject).toBe('Quote Update: Test Product');
      expect(template.html).toContain('Unknown_status');
      expect(template.html).toContain('Your quote request has been updated.');
    });

    it('should capitalize first letter of status', () => {
      const quoteData = {
        productTitle: 'Test Product',
        status: 'pending',
        shopName: 'My Shop',
        shopUrl: 'https://myshop.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.html).toContain('Pending');
    });

    it('should contain proper styling for status updates', () => {
      const quoteData = {
        productTitle: 'Test Product',
        status: 'quoted',
        shopName: 'My Shop',
        shopUrl: 'https://myshop.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.html).toContain('Visit Store');
      expect(template.html).toContain('class="button"');
    });
  });

  describe('Integration Tests', () => {
    it('should send email using template', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      
      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');
      
      mockSend.mockResolvedValueOnce({ data: { id: 'email-123' }, error: null });

      const template = newQuoteEmailTemplate({
        productTitle: 'Integration Test Product',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        quoteId: 'quote-int-1',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-int-1',
      });

      await sendEmail({
        to: 'admin@shop.com',
        subject: template.subject,
        html: template.html,
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'New Quote Request: Integration Test Product',
          html: expect.stringContaining('Integration Test Product'),
        })
      );
    });

    it('should handle complete quote workflow email', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      
      jest.resetModules();
      const { sendEmail } = await import('@/lib/email');
      
      mockSend.mockResolvedValueOnce({ data: { id: 'email-1' }, error: null });

      // New quote notification
      const newQuoteTemplate = newQuoteEmailTemplate({
        productTitle: 'Premium Widget',
        customerName: 'Alice Smith',
        customerEmail: 'alice@example.com',
        quantity: 100,
        message: 'Need this by next Friday',
        quoteId: 'q-123',
        dashboardUrl: 'https://app.quotegen.app/dashboard',
      });

      await sendEmail({
        to: 'shop@owner.com',
        subject: newQuoteTemplate.subject,
        html: newQuoteTemplate.html,
      });

      mockSend.mockResolvedValueOnce({ data: { id: 'email-2' }, error: null });

      // Status update notification
      const statusTemplate = quoteStatusUpdateEmailTemplate({
        productTitle: 'Premium Widget',
        status: 'quoted',
        quoteAmount: 5000,
        shopName: 'Premium Store',
        shopUrl: 'https://premium-store.com',
      });

      await sendEmail({
        to: 'alice@example.com',
        subject: statusTemplate.subject,
        html: statusTemplate.html,
      });

      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });
});
