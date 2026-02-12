/**
 * API Integration Tests - Quotes Route
 * @module __tests__/api/quotes
 */

import { GET, POST, PATCH } from '@/app/api/quotes/route';
import { createQuote, getQuotes, updateQuoteStatus, getShopSettings } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

// Mock the lib modules
jest.mock('@/lib/supabase', () => ({
  createQuote: jest.fn(),
  getQuotes: jest.fn(),
  updateQuoteStatus: jest.fn(),
  getShopSettings: jest.fn(),
}));

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn(),
  newQuoteEmailTemplate: jest.fn(),
  quoteStatusUpdateEmailTemplate: jest.fn(),
}));

describe('Quotes API', () => {
  const mockQuotes = [
    {
      id: 'quote-1',
      quote_number: 'QT-001',
      shop_id: 'shop-1',
      product_id: 'prod-1',
      product_title: 'Test Product 1',
      customer_email: 'john@example.com',
      customer_name: 'John Doe',
      status: 'pending',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'quote-2',
      quote_number: 'QT-002',
      shop_id: 'shop-1',
      product_id: 'prod-2',
      product_title: 'Test Product 2',
      customer_email: 'jane@example.com',
      customer_name: 'Jane Smith',
      status: 'quoted',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/quotes', () => {
    it('should return all quotes for a shop', async () => {
      (getQuotes as jest.Mock).mockResolvedValue(mockQuotes);

      const request = new Request('http://localhost/api/quotes?shop_id=shop-1');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual(mockQuotes);
      expect(getQuotes).toHaveBeenCalledWith('shop-1');
    });

    it('should return 400 if shop_id is missing', async () => {
      const request = new Request('http://localhost/api/quotes');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Shop ID required');
    });

    it('should handle database errors', async () => {
      (getQuotes as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new Request('http://localhost/api/quotes?shop_id=shop-1');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to fetch quotes');
    });
  });

  describe('POST /api/quotes', () => {
    it('should create a new quote', async () => {
      const newQuote = {
        shop_id: 'shop-1',
        product_id: 'prod-1',
        product_title: 'Test Product',
        customer_email: 'test@example.com',
        customer_name: 'Test User',
        quantity: 2,
        message: 'Test message',
      };

      const createdQuote = {
        id: 'quote-3',
        ...newQuote,
        status: 'pending',
        created_at: '2024-01-03T00:00:00Z',
      };

      (createQuote as jest.Mock).mockResolvedValue(createdQuote);
      (getShopSettings as jest.Mock).mockResolvedValue({ email_notifications: false });

      const request = new Request('http://localhost/api/quotes', {
        method: 'POST',
        body: JSON.stringify(newQuote),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.id).toBe('quote-3');
      expect(createQuote).toHaveBeenCalledWith(expect.objectContaining({
        shop_id: 'shop-1',
        product_id: 'prod-1',
        customer_email: 'test@example.com',
      }));
    });

    it('should validate required fields', async () => {
      const request = new Request('http://localhost/api/quotes', {
        method: 'POST',
        body: JSON.stringify({ customer_name: 'Test' }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Missing required fields');
    });

    it('should validate email format', async () => {
      const request = new Request('http://localhost/api/quotes', {
        method: 'POST',
        body: JSON.stringify({
          shop_id: 'shop-1',
          product_id: 'prod-1',
          customer_email: 'invalid-email',
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid email format');
    });
  });

  describe('PATCH /api/quotes', () => {
    it('should update quote status', async () => {
      const updatedQuote = {
        id: 'quote-1',
        status: 'quoted',
        quote_amount: 1000,
      };

      (updateQuoteStatus as jest.Mock).mockResolvedValue({
        ...mockQuotes[0],
        status: 'quoted',
        quote_amount: 1000,
      });

      const request = new Request('http://localhost/api/quotes', {
        method: 'PATCH',
        body: JSON.stringify(updatedQuote),
      });

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.status).toBe('quoted');
    });

    it('should validate required fields', async () => {
      const request = new Request('http://localhost/api/quotes', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'quoted' }),
      });

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Quote ID and status required');
    });

    it('should validate status value', async () => {
      const request = new Request('http://localhost/api/quotes', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'quote-1', status: 'invalid' }),
      });

      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid status');
    });
  });
});
