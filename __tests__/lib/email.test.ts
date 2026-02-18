/**
 * Email Service Tests
 * Comprehensive test coverage for email.ts
 */

import { sendEmail, newQuoteEmailTemplate, quoteStatusUpdateEmailTemplate } from '@/lib/email';

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation((apiKey: string) => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

describe('Email Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('sendEmail', () => {
    it('should send email successfully with valid configuration', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      process.env.FROM_EMAIL = 'test@example.com';

      const { Resend } = require('resend');
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'email-123' }, error: null });
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      // Re-import to get fresh instance with new env
      const { sendEmail: freshSendEmail } = require('@/lib/email');
      
      const result = await freshSendEmail({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });
      expect(result).toEqual({ id: 'email-123' });
    });

    it('should use default from email when FROM_EMAIL not set', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      delete process.env.FROM_EMAIL;

      const { Resend } = require('resend');
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'email-456' }, error: null });
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const { sendEmail: freshSendEmail } = require('@/lib/email');
      
      await freshSendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Content</p>',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'QuoteGen <noreply@quotegen.app>',
        })
      );
    });

    it('should return mock response when Resend is not configured', async () => {
      delete process.env.RESEND_API_KEY;

      const { sendEmail: freshSendEmail } = require('@/lib/email');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const result = await freshSendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Content</p>',
      });

      expect(result).toEqual({ id: 'mock-email-id' });
      expect(consoleSpy).toHaveBeenCalledWith('Email service not configured. Would send to:', 'recipient@example.com');
      
      consoleSpy.mockRestore();
    });

    it('should throw error when Resend returns error', async () => {
      process.env.RESEND_API_KEY = 're_test_key';

      const { Resend } = require('resend');
      const mockError = new Error('API Error');
      const mockSend = jest.fn().mockResolvedValue({ data: null, error: mockError });
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const { sendEmail: freshSendEmail } = require('@/lib/email');
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(freshSendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Content</p>',
      })).rejects.toThrow('API Error');

      expect(consoleSpy).toHaveBeenCalledWith('Error sending email:', mockError);
      consoleSpy.mockRestore();
    });

    it('should throw error when network request fails', async () => {
      process.env.RESEND_API_KEY = 're_test_key';

      const { Resend } = require('resend');
      const networkError = new Error('Network error');
      const mockSend = jest.fn().mockRejectedValue(networkError);
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const { sendEmail: freshSendEmail } = require('@/lib/email');
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(freshSendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Content</p>',
      })).rejects.toThrow('Network error');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to send email:', networkError);
      consoleSpy.mockRestore();
    });

    it('should handle empty HTML content', async () => {
      process.env.RESEND_API_KEY = 're_test_key';

      const { Resend } = require('resend');
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'email-empty' }, error: null });
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const { sendEmail: freshSendEmail } = require('@/lib/email');
      
      await freshSendEmail({
        to: 'recipient@example.com',
        subject: 'Empty Test',
        html: '',
      });

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ html: '' }));
    });

    it('should handle special characters in subject', async () => {
      process.env.RESEND_API_KEY = 're_test_key';

      const { Resend } = require('resend');
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'email-special' }, error: null });
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const { sendEmail: freshSendEmail } = require('@/lib/email');
      
      await freshSendEmail({
        to: 'recipient@example.com',
        subject: 'Test with <special> & "characters"',
        html: '<p>Content</p>',
      });

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        subject: 'Test with <special> & "characters"',
      }));
    });

    it('should handle multiple recipients format', async () => {
      process.env.RESEND_API_KEY = 're_test_key';

      const { Resend } = require('resend');
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'email-multi' }, error: null });
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const { sendEmail: freshSendEmail } = require('@/lib/email');
      
      await freshSendEmail({
        to: 'recipient1@example.com, recipient2@example.com',
        subject: 'Test',
        html: '<p>Content</p>',
      });

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        to: 'recipient1@example.com, recipient2@example.com',
      }));
    });

    it('should handle very long HTML content', async () => {
      process.env.RESEND_API_KEY = 're_test_key';

      const { Resend } = require('resend');
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'email-long' }, error: null });
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const { sendEmail: freshSendEmail } = require('@/lib/email');
      
      const longHtml = '<p>' + 'a'.repeat(10000) + '</p>';
      
      await freshSendEmail({
        to: 'recipient@example.com',
        subject: 'Long Content',
        html: longHtml,
      });

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ html: longHtml }));
    });

    it('should log errors when sending fails', async () => {
      process.env.RESEND_API_KEY = 're_test_key';

      const { Resend } = require('resend');
      const apiError = new Error('Resend API failure');
      const mockSend = jest.fn().mockResolvedValue({ data: null, error: apiError });
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const { sendEmail: freshSendEmail } = require('@/lib/email');
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        await freshSendEmail({
          to: 'recipient@example.com',
          subject: 'Test',
          html: '<p>Content</p>',
        });
      } catch (e) {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith('Error sending email:', apiError);
      consoleSpy.mockRestore();
    });

    it('should log Resend errors when API returns error', async () => {
      process.env.RESEND_API_KEY = 're_test_key';

      const { Resend } = require('resend');
      const resendError = { message: 'Invalid API key', statusCode: 403 };
      const mockSend = jest.fn().mockResolvedValue({ data: null, error: resendError });
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const { sendEmail: freshSendEmail } = require('@/lib/email');
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        await freshSendEmail({
          to: 'recipient@example.com',
          subject: 'Test',
          html: '<p>Content</p>',
        });
      } catch (e) {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith('Error sending email:', resendError);
      consoleSpy.mockRestore();
    });
  });

  describe('newQuoteEmailTemplate', () => {
    it('should generate template with all fields', () => {
      const quoteData = {
        productTitle: 'Premium Widget',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        quantity: 5,
        message: 'Need this ASAP',
        quoteId: 'quote-123',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-123',
      };

      const result = newQuoteEmailTemplate(quoteData);

      expect(result.subject).toBe('New Quote Request: Premium Widget');
      expect(result.html).toContain('Premium Widget');
      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('john@example.com');
      expect(result.html).toContain('5');
      expect(result.html).toContain('Need this ASAP');
      expect(result.html).toContain('quote-123');
      expect(result.html).toContain('https://app.quotegen.app/quotes/quote-123');
    });

    it('should generate template without optional fields', () => {
      const quoteData = {
        productTitle: 'Basic Widget',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        quoteId: 'quote-456',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-456',
      };

      const result = newQuoteEmailTemplate(quoteData);

      expect(result.subject).toBe('New Quote Request: Basic Widget');
      expect(result.html).toContain('Jane Smith');
      expect(result.html).not.toContain('Quantity:');
      expect(result.html).not.toContain('Message:');
    });

    it('should handle empty customer name', () => {
      const quoteData = {
        productTitle: 'Widget',
        customerName: '',
        customerEmail: 'test@example.com',
        quoteId: 'quote-789',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-789',
      };

      const result = newQuoteEmailTemplate(quoteData);

      expect(result.html).toContain('N/A');
    });

    it('should handle special characters in product title', () => {
      const quoteData = {
        productTitle: 'Widget <Pro> & "Premium" Version',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        quoteId: 'quote-special',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-special',
      };

      const result = newQuoteEmailTemplate(quoteData);

      expect(result.subject).toBe('New Quote Request: Widget <Pro> & "Premium" Version');
      expect(result.html).toContain('Widget <Pro> & "Premium" Version');
    });

    it('should contain proper HTML structure', () => {
      const quoteData = {
        productTitle: 'Test Product',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        quoteId: 'quote-test',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-test',
      };

      const result = newQuoteEmailTemplate(quoteData);

      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('<html>');
      expect(result.html).toContain('</html>');
      expect(result.html).toContain('<head>');
      expect(result.html).toContain('<body>');
    });

    it('should include inline CSS styles', () => {
      const quoteData = {
        productTitle: 'Test Product',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        quoteId: 'quote-test',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-test',
      };

      const result = newQuoteEmailTemplate(quoteData);

      expect(result.html).toContain('style');
      expect(result.html).toContain('font-family');
      expect(result.html).toContain('background');
      expect(result.html).toContain('color');
    });
  });

  describe('quoteStatusUpdateEmailTemplate', () => {
    it('should generate template for quoted status', () => {
      const quoteData = {
        productTitle: 'Premium Service',
        status: 'quoted',
        quoteAmount: 1500,
        shopName: 'My Store',
        shopUrl: 'https://mystore.com',
      };

      const result = quoteStatusUpdateEmailTemplate(quoteData);

      expect(result.subject).toBe('Quote Update: Premium Service');
      expect(result.html).toContain('Premium Service');
      expect(result.html).toContain('Quoted');
      expect(result.html).toContain('$1500');
      expect(result.html).toContain('My Store');
    });

    it('should generate template for accepted status', () => {
      const quoteData = {
        productTitle: 'Consulting Package',
        status: 'accepted',
        shopName: 'Tech Solutions',
        shopUrl: 'https://techsolutions.com',
      };

      const result = quoteStatusUpdateEmailTemplate(quoteData);

      expect(result.subject).toBe('Quote Update: Consulting Package');
      expect(result.html).toContain('Accepted');
      expect(result.html).toContain('Great news! Your quote has been accepted');
    });

    it('should generate template for declined status', () => {
      const quoteData = {
        productTitle: 'Custom Development',
        status: 'declined',
        shopName: 'Dev Shop',
        shopUrl: 'https://devshop.com',
      };

      const result = quoteStatusUpdateEmailTemplate(quoteData);

      expect(result.html).toContain('Declined');
      expect(result.html).toContain('Unfortunately, we cannot fulfill this request');
    });

    it('should handle quoted status without amount', () => {
      const quoteData = {
        productTitle: 'Basic Service',
        status: 'quoted',
        shopName: 'Simple Store',
        shopUrl: 'https://simplestore.com',
      };

      const result = quoteStatusUpdateEmailTemplate(quoteData);

      expect(result.html).toContain('Quoted');
      expect(result.html).not.toContain('Amount:');
    });

    it('should handle unknown status gracefully', () => {
      const quoteData = {
        productTitle: 'Unknown Item',
        status: 'unknown_status',
        shopName: 'Test Shop',
        shopUrl: 'https://testshop.com',
      };

      const result = quoteStatusUpdateEmailTemplate(quoteData);

      expect(result.html).toContain('Unknown_status');
      expect(result.html).toContain('Your quote request has been updated');
    });

    it('should capitalize first letter of status', () => {
      const quoteData = {
        productTitle: 'Test Item',
        status: 'pending',
        shopName: 'Test Shop',
        shopUrl: 'https://testshop.com',
      };

      const result = quoteStatusUpdateEmailTemplate(quoteData);

      expect(result.html).toContain('Pending');
    });

    it('should contain proper styling for status updates', () => {
      const quoteData = {
        productTitle: 'Test Item',
        status: 'quoted',
        shopName: 'Test Shop',
        shopUrl: 'https://testshop.com',
      };

      const result = quoteStatusUpdateEmailTemplate(quoteData);

      expect(result.html).toContain('class="container"');
      expect(result.html).toContain('class="header"');
      expect(result.html).toContain('class="content"');
      expect(result.html).toContain('class="button"');
    });
  });

  describe('Integration Tests', () => {
    it('should send email using template', async () => {
      process.env.RESEND_API_KEY = 're_test_key';

      const { Resend } = require('resend');
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'email-int' }, error: null });
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const { sendEmail: freshSendEmail, newQuoteEmailTemplate: freshTemplate } = require('@/lib/email');
      
      const template = freshTemplate({
        productTitle: 'Integration Test Product',
        customerName: 'Integration User',
        customerEmail: 'integration@example.com',
        quoteId: 'quote-int',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-int',
      });

      await freshSendEmail({
        to: 'merchant@example.com',
        subject: template.subject,
        html: template.html,
      });

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        to: 'merchant@example.com',
        subject: 'New Quote Request: Integration Test Product',
        html: expect.stringContaining('Integration Test Product'),
      }));
    });

    it('should handle complete quote workflow email', async () => {
      process.env.RESEND_API_KEY = 're_test_key';

      const { Resend } = require('resend');
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'email-workflow' }, error: null });
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const { 
        sendEmail: freshSendEmail, 
        newQuoteEmailTemplate: freshNewTemplate,
        quoteStatusUpdateEmailTemplate: freshStatusTemplate 
      } = require('@/lib/email');
      
      // Step 1: New quote notification
      const newQuoteTemplate = freshNewTemplate({
        productTitle: 'Enterprise Package',
        customerName: 'Corp Inc',
        customerEmail: 'corp@example.com',
        quantity: 100,
        message: 'Need bulk pricing',
        quoteId: 'quote-ent',
        dashboardUrl: 'https://app.quotegen.app/quotes/quote-ent',
      });

      await freshSendEmail({
        to: 'sales@company.com',
        subject: newQuoteTemplate.subject,
        html: newQuoteTemplate.html,
      });

      expect(mockSend).toHaveBeenNthCalledWith(1, expect.objectContaining({
        subject: 'New Quote Request: Enterprise Package',
      }));

      // Step 2: Status update notification
      const statusTemplate = freshStatusTemplate({
        productTitle: 'Enterprise Package',
        status: 'quoted',
        quoteAmount: 50000,
        shopName: 'Company Store',
        shopUrl: 'https://companystore.com',
      });

      await freshSendEmail({
        to: 'corp@example.com',
        subject: statusTemplate.subject,
        html: statusTemplate.html,
      });

      expect(mockSend).toHaveBeenNthCalledWith(2, expect.objectContaining({
        subject: 'Quote Update: Enterprise Package',
        html: expect.stringContaining('$50000'),
      }));
    });
  });
});
