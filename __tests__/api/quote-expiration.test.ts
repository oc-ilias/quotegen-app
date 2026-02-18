/**
 * API Tests - Quote Expiration Route
 * @module __tests__/api/quote-expiration
 */

import { GET, POST } from '@/app/api/quotes/expire/route';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      ...init,
      json: () => Promise.resolve(data),
    })),
  },
  NextRequest: jest.fn(),
}));

// Mock the expiration lib
const mockHandleExpirationRequest = jest.fn();

jest.mock('@/lib/expiration', () => ({
  handleExpirationRequest: (...args: any[]) => mockHandleExpirationRequest(...args),
  processQuoteExpirations: jest.fn(),
  checkAndExpireQuotes: jest.fn(),
  sendExpirationReminders: jest.fn(),
  DEFAULT_REMINDER_CONFIG: {
    enabled: true,
    reminderDays: [7, 3, 1],
    fromEmail: 'quotes@quotegen.app',
    companyName: 'QuoteGen',
  },
}));

describe('Quote Expiration API', () => {
  const mockResult = {
    expired: 5,
    expiringSoon: 10,
    remindersSent: 8,
    errors: [] as string[],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPIRATION_API_KEY = 'test-api-key';
  });

  describe('POST /api/quotes/expire', () => {
    it('should process expirations successfully with valid API key', async () => {
      mockHandleExpirationRequest.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockResult }),
      });

      const request = new Request('http://localhost/api/quotes/expire', {
        method: 'POST',
        headers: {
          'x-api-key': 'test-api-key',
        },
      });

      await POST(request);

      expect(mockHandleExpirationRequest).toHaveBeenCalled();
    });

    it('should allow disabled config via query param', async () => {
      mockHandleExpirationRequest.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockResult }),
      });

      const request = new Request('http://localhost/api/quotes/expire?enabled=false', {
        method: 'POST',
        headers: {
          'x-api-key': 'test-api-key',
        },
      });

      await POST(request);

      expect(mockHandleExpirationRequest).toHaveBeenCalled();
    });

    it('should call handleExpirationRequest with invalid API key', async () => {
      mockHandleExpirationRequest.mockResolvedValue({
        status: 401,
        json: () => Promise.resolve({ success: false, error: 'Unauthorized' }),
      });

      const request = new Request('http://localhost/api/quotes/expire', {
        method: 'POST',
        headers: {
          'x-api-key': 'invalid-key',
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(mockHandleExpirationRequest).toHaveBeenCalled();
      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
    });

    it('should call handleExpirationRequest when API key is missing', async () => {
      mockHandleExpirationRequest.mockResolvedValue({
        status: 401,
        json: () => Promise.resolve({ success: false, error: 'Unauthorized' }),
      });

      const request = new Request('http://localhost/api/quotes/expire', {
        method: 'POST',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(mockHandleExpirationRequest).toHaveBeenCalled();
      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
    });

    it('should allow request when API key is not configured', async () => {
      delete process.env.EXPIRATION_API_KEY;
      mockHandleExpirationRequest.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockResult }),
      });

      const request = new Request('http://localhost/api/quotes/expire', {
        method: 'POST',
      });

      await POST(request);

      expect(mockHandleExpirationRequest).toHaveBeenCalled();
    });

    it('should process with result containing errors', async () => {
      const resultWithErrors = {
        expired: 3,
        expiringSoon: 5,
        remindersSent: 4,
        errors: ['Quote QT-001: Failed to send email'],
      };
      mockHandleExpirationRequest.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ success: true, data: resultWithErrors }),
      });

      const request = new Request('http://localhost/api/quotes/expire', {
        method: 'POST',
        headers: {
          'x-api-key': 'test-api-key',
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.errors).toHaveLength(1);
    });
  });

  describe('GET /api/quotes/expire', () => {
    it('should process expirations successfully via GET', async () => {
      mockHandleExpirationRequest.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockResult }),
      });

      const request = new Request('http://localhost/api/quotes/expire', {
        method: 'GET',
        headers: {
          'x-api-key': 'test-api-key',
        },
      });

      const response = await POST(request);

      expect(mockHandleExpirationRequest).toHaveBeenCalled();
    });

    it('should support cron job integrations without API key', async () => {
      delete process.env.EXPIRATION_API_KEY;
      mockHandleExpirationRequest.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ success: true, data: mockResult }),
      });

      const request = new Request('http://localhost/api/quotes/expire', {
        method: 'GET',
      });

      await POST(request);

      expect(mockHandleExpirationRequest).toHaveBeenCalled();
    });

    it('should handle empty result', async () => {
      const emptyResult = {
        expired: 0,
        expiringSoon: 0,
        remindersSent: 0,
        errors: [] as string[],
      };
      mockHandleExpirationRequest.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ success: true, data: emptyResult }),
      });

      const request = new Request('http://localhost/api/quotes/expire', {
        method: 'GET',
        headers: {
          'x-api-key': 'test-api-key',
        },
      });

      const response = await POST(request);

      expect(mockHandleExpirationRequest).toHaveBeenCalled();
    });
  });
});
