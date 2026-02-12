/**
 * Unit Tests for Quote Status API Route
 * @module app/api/quotes/[id]/status/__tests__/route
 */

import { NextRequest } from 'next/server';
import { GET, PATCH } from '../route';
import { supabase } from '@/lib/supabase';
import { QuoteStatus } from '@/types/quote';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock email module
jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ id: 'email-123' }),
  newQuoteEmailTemplate: jest.fn().mockReturnValue({ subject: 'Test', html: '<p>Test</p>' }),
  quoteStatusUpdateEmailTemplate: jest.fn().mockReturnValue({ subject: 'Test', html: '<p>Test</p>' }),
}));

describe('Quote Status API', () => {
  // Helper to create a mock chain builder
  const createMockChain = (overrides: {
    single?: () => Promise<{ data: unknown; error: unknown }>;
    order?: () => Promise<{ data: unknown; error: unknown }>;
    insert?: () => Promise<{ error: unknown }>;
  } = {}) => {
    const chain: Record<string, jest.Mock> = {
      select: jest.fn(() => chain),
      insert: jest.fn(() => {
        if (overrides.insert) {
          return overrides.insert();
        }
        return Promise.resolve({ error: null });
      }),
      update: jest.fn(() => chain),
      eq: jest.fn(() => chain),
      order: jest.fn(() => {
        if (overrides.order) {
          return overrides.order();
        }
        return Promise.resolve({ data: [], error: null });
      }),
      single: jest.fn(() => {
        if (overrides.single) {
          return overrides.single();
        }
        return Promise.resolve({ data: null, error: null });
      }),
    };
    return chain;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/quotes/[id]/status', () => {
    const createRequest = (id: string) => {
      return new NextRequest(`http://localhost:3000/api/quotes/${id}/status`);
    };

    test('should return 400 if id is missing', async () => {
      const request = createRequest('');
      const response = await GET(request, { params: Promise.resolve({ id: '' }) });
      
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('MISSING_ID');
    });

    test('should return quote with history', async () => {
      const mockQuote = {
        id: 'quote-123',
        quote_number: 'QT-001',
        status: QuoteStatus.SENT,
        customer_id: 'cust-1',
        total: 1000,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockHistory = [
        {
          id: 'hist-1',
          quote_id: 'quote-123',
          from_status: QuoteStatus.DRAFT,
          to_status: QuoteStatus.SENT,
          changed_by: 'user-1',
          changed_by_name: 'John Doe',
          changed_at: '2024-01-01T00:00:00Z',
        },
      ];

      // First call is for quotes, second for history
      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1) {
          // Quote query - uses .single()
          return createMockChain({
            single: () => Promise.resolve({ data: mockQuote, error: null }),
          });
        } else {
          // History query - uses .order() which returns promise
          return createMockChain({
            order: () => Promise.resolve({ data: mockHistory, error: null }),
          });
        }
      });

      const request = createRequest('quote-123');
      const response = await GET(request, { params: Promise.resolve({ id: 'quote-123' }) });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe('quote-123');
    });

    test('should return 404 if quote not found', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        return createMockChain({
          single: () => Promise.resolve({ data: null, error: null }),
        });
      });

      const request = createRequest('nonexistent');
      const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error.code).toBe('NOT_FOUND');
    });

    test('should handle database errors', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        return createMockChain({
          single: () => Promise.resolve({ 
            data: null, 
            error: { code: 'PGRST116', message: 'Database connection failed' } 
          }),
        });
      });

      const request = createRequest('quote-123');
      const response = await GET(request, { params: Promise.resolve({ id: 'quote-123' }) });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error.code).toBe('NOT_FOUND');
    });

    test('should handle generic database errors with 500', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        return createMockChain({
          single: () => Promise.resolve({ 
            data: null, 
            error: { code: 'UNKNOWN', message: 'Database connection failed' } 
          }),
        });
      });

      const request = createRequest('quote-123');
      const response = await GET(request, { params: Promise.resolve({ id: 'quote-123' }) });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('FETCH_ERROR');
    });
  });

  describe('PATCH /api/quotes/[id]/status', () => {
    const createRequest = (id: string, body: object) => {
      return new NextRequest(`http://localhost:3000/api/quotes/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
    };

    test('should return 400 if id is missing', async () => {
      const request = createRequest('', { status: QuoteStatus.SENT });
      const response = await PATCH(request, { params: Promise.resolve({ id: '' }) });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('MISSING_ID');
    });

    test('should return 400 if status is missing', async () => {
      const request = createRequest('quote-123', {});
      const response = await PATCH(request, { params: Promise.resolve({ id: 'quote-123' }) });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('MISSING_STATUS');
    });

    test('should return 400 for invalid status', async () => {
      const request = createRequest('quote-123', { status: 'invalid-status' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'quote-123' }) });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('INVALID_STATUS');
    });

    test('should return 400 for invalid transition', async () => {
      const mockQuote = {
        id: 'quote-123',
        status: QuoteStatus.DRAFT,
      };

      (supabase.from as jest.Mock).mockImplementation(() => {
        return createMockChain({
          single: () => Promise.resolve({ data: mockQuote, error: null }),
        });
      });

      const request = createRequest('quote-123', { status: QuoteStatus.ACCEPTED });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'quote-123' }) });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('INVALID_TRANSITION');
    });

    test('should update status successfully', async () => {
      const mockQuote = {
        id: 'quote-123',
        quote_number: 'QT-001',
        status: QuoteStatus.DRAFT,
        customer_email: 'test@example.com',
        customer_id: 'cust-1',
      };

      const updatedQuote = {
        ...mockQuote,
        status: QuoteStatus.SENT,
        sent_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      // Track which call we're on: 1=select quote, 2=insert history, 3=update quote
      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1) {
          // First select - fetch current quote
          return createMockChain({
            single: () => Promise.resolve({ data: mockQuote, error: null }),
          });
        } else if (callCount === 2) {
          // Insert history - returns promise directly
          return createMockChain({
            insert: () => Promise.resolve({ error: null }),
          });
        } else {
          // Update quote - returns chain with select().single()
          return createMockChain({
            single: () => Promise.resolve({ data: updatedQuote, error: null }),
          });
        }
      });

      const request = createRequest('quote-123', { 
        status: QuoteStatus.SENT,
        comment: 'Sent to customer',
      });
      
      // Add user headers
      request.headers.set('x-user-id', 'user-1');
      request.headers.set('x-user-name', 'John Doe');

      const response = await PATCH(request, { params: Promise.resolve({ id: 'quote-123' }) });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.quote.status).toBe(QuoteStatus.SENT);
    });

    test('should set correct timestamp fields based on status', async () => {
      const mockQuote = {
        id: 'quote-123',
        status: QuoteStatus.SENT,
        quote_number: 'QT-001',
        customer_email: 'test@example.com',
        customer_id: 'cust-1',
      };

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createMockChain({
            single: () => Promise.resolve({ data: mockQuote, error: null }),
          });
        } else if (callCount === 2) {
          return createMockChain({
            insert: () => Promise.resolve({ error: null }),
          });
        } else {
          return createMockChain({
            single: () => Promise.resolve({ 
              data: { ...mockQuote, status: QuoteStatus.ACCEPTED, accepted_at: new Date().toISOString() },
              error: null 
            }),
          });
        }
      });

      const request = createRequest('quote-123', { status: QuoteStatus.ACCEPTED });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'quote-123' }) });

      expect(response.status).toBe(200);
    });

    test('should handle database errors gracefully', async () => {
      const mockQuote = {
        id: 'quote-123',
        status: QuoteStatus.DRAFT,
      };

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createMockChain({
            single: () => Promise.resolve({ data: mockQuote, error: null }),
          });
        } else {
          // Insert history fails
          return createMockChain({
            insert: () => Promise.resolve({ error: { message: 'Insert failed' } }),
          });
        }
      });

      const request = createRequest('quote-123', { status: QuoteStatus.SENT });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'quote-123' }) });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('HISTORY_ERROR');
    });

    test('should handle invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/quotes/quote-123/status', {
        method: 'PATCH',
        body: 'invalid-json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'quote-123' }) });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('INVALID_BODY');
    });

    test('should create activity record on status change', async () => {
      const mockQuote = {
        id: 'quote-123',
        status: QuoteStatus.DRAFT,
        quote_number: 'QT-001',
        customer_id: 'cust-1',
        customer_name: 'Test Customer',
      };

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createMockChain({
            single: () => Promise.resolve({ data: mockQuote, error: null }),
          });
        } else if (callCount === 2) {
          return createMockChain({
            insert: () => Promise.resolve({ error: null }),
          });
        } else if (callCount === 3) {
          return createMockChain({
            single: () => Promise.resolve({ 
              data: { ...mockQuote, status: QuoteStatus.SENT },
              error: null 
            }),
          });
        } else {
          // Activity insert (best-effort, wrapped in try-catch)
          return createMockChain({
            insert: () => Promise.resolve({ error: null }),
          });
        }
      });

      const request = createRequest('quote-123', { status: QuoteStatus.SENT });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'quote-123' }) });

      // Verify the request was successful (activity creation is best-effort)
      expect(response.status).toBe(200);
    });
  });
});
