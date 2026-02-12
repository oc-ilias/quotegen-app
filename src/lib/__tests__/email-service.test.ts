/**
 * Unit Tests for Email Module
 * @module lib/__tests__/email.test
 */

// Mock Resend before importing the module
const mockSend = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

// Now import after mocking
import {
  sendEmail,
  newQuoteEmailTemplate,
  quoteStatusUpdateEmailTemplate,
} from '@/lib/email';

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('Email Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockSend.mockClear();
    delete process.env.RESEND_API_KEY;
    delete process.env.FROM_EMAIL;
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('newQuoteEmailTemplate', () => {
    it('should generate email template with all fields', () => {
      const quoteData = {
        productTitle: 'Premium Widget',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        quantity: 5,
        message: 'Need this urgently',
        quoteId: 'QT-123456-ABC',
        dashboardUrl: 'https://app.quotegen.app/quotes/QT-123456-ABC',
      };

      const template = newQuoteEmailTemplate(quoteData);

      expect(template.subject).toBe('New Quote Request: Premium Widget');
      expect(template.html).toContain('Premium Widget');
      expect(template.html).toContain('John Doe');
      expect(template.html).toContain('john@example.com');
      expect(template.html).toContain('5');
      expect(template.html).toContain('Need this urgently');
      expect(template.html).toContain('https://app.quotegen.app/quotes/QT-123456-ABC');
    });

    it('should handle optional fields being undefined', () => {
      const quoteData = {
        productTitle: 'Basic Widget',
        customerName: '',
        customerEmail: 'jane@example.com',
        quoteId: 'QT-789012-DEF',
        dashboardUrl: 'https://app.quotegen.app/quotes/QT-789012-DEF',
      };

      const template = newQuoteEmailTemplate(quoteData);

      expect(template.subject).toBe('New Quote Request: Basic Widget');
      expect(template.html).toContain('N/A');
      expect(template.html).not.toContain('Quantity');
      expect(template.html).not.toContain('Message');
    });

    it('should include proper HTML structure', () => {
      const quoteData = {
        productTitle: 'Test Product',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        quoteId: 'QT-TEST-123',
        dashboardUrl: 'https://example.com',
      };

      const template = newQuoteEmailTemplate(quoteData);

      expect(template.html).toContain('<!DOCTYPE html>');
      expect(template.html).toContain('<html>');
      expect(template.html).toContain('<head>');
      expect(template.html).toContain('<body>');
      expect(template.html).toContain('<style>');
    });

    it('should contain styled elements', () => {
      const quoteData = {
        productTitle: 'Test Product',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        quoteId: 'QT-TEST-123',
        dashboardUrl: 'https://example.com',
      };

      const template = newQuoteEmailTemplate(quoteData);

      expect(template.html).toContain('class="container"');
      expect(template.html).toContain('class="header"');
      expect(template.html).toContain('class="content"');
      expect(template.html).toContain('class="button"');
      expect(template.html).toContain('background: #008060');
    });
  });

  describe('quoteStatusUpdateEmailTemplate', () => {
    it('should generate quoted status email', () => {
      const quoteData = {
        productTitle: 'Premium Widget',
        status: 'quoted',
        quoteAmount: 500,
        shopName: 'My Store',
        shopUrl: 'https://mystore.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.subject).toBe('Quote Update: Premium Widget');
      expect(template.html).toContain('Quoted');
      expect(template.html).toContain('$500');
      expect(template.html).toContain('My Store');
      expect(template.html).toContain('https://mystore.com');
    });

    it('should generate accepted status email', () => {
      const quoteData = {
        productTitle: 'Premium Widget',
        status: 'accepted',
        shopName: 'My Store',
        shopUrl: 'https://mystore.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.subject).toBe('Quote Update: Premium Widget');
      expect(template.html).toContain('Accepted');
      expect(template.html).toContain('Great news!');
    });

    it('should generate declined status email', () => {
      const quoteData = {
        productTitle: 'Premium Widget',
        status: 'declined',
        shopName: 'My Store',
        shopUrl: 'https://mystore.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.html).toContain('Declined');
      expect(template.html).toContain('Unfortunately');
    });

    it('should handle unknown status', () => {
      const quoteData = {
        productTitle: 'Test Product',
        status: 'unknown',
        shopName: 'My Store',
        shopUrl: 'https://mystore.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.html).toContain('Unknown');
      expect(template.html).toContain('Your quote request has been updated');
    });

    it('should capitalize status in email', () => {
      const quoteData = {
        productTitle: 'Test',
        status: 'quoted',
        shopName: 'Store',
        shopUrl: 'https://store.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.html).toContain('Quoted');
    });

    it('should include proper styling', () => {
      const quoteData = {
        productTitle: 'Test',
        status: 'quoted',
        shopName: 'Store',
        shopUrl: 'https://store.com',
      };

      const template = quoteStatusUpdateEmailTemplate(quoteData);

      expect(template.html).toContain('<!DOCTYPE html>');
      expect(template.html).toContain('background: #008060');
      expect(template.html).toContain('class="container"');
    });
  });
});
