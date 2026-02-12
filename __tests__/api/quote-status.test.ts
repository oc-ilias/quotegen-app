/**
 * API Integration Tests - Quote Status Route
 * @module __tests__/api/quotes/status
 */

import { GET, PATCH } from '@/app/api/quotes/[id]/status/route';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('Quote Status API', () => {
  const mockQuote = {
    id: 'quote-1',
    quote_number: 'QT-001',
    status: 'draft',
    customer_id: 'cust-1',
    total: 1000,
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/quotes/[id]/status', () => {
    it('should return quote status history', async () => {
      const mockStatusHistory = [
        {
          id: 'hist-1',
          quote_id: 'quote-1',
          old_status: 'draft',
          new_status: 'sent',
          changed_at: '2024-01-02T00:00:00Z',
          changed_by: 'user-1',
        },
      ];

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1 && table === 'quotes') {
          // First call: fetch quote
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockQuote,
              error: null,
            }),
          };
        }
        if (callCount === 2 && table === 'quote_status_history') {
          // Second call: fetch history
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: mockStatusHistory,
              error: null,
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      const request = new Request('http://localhost/api/quotes/quote-1/status');
      const response = await GET(request, { params: Promise.resolve({ id: 'quote-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual(expect.objectContaining(mockQuote));
    });

    it('should handle quote not found', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' },
        }),
      }));

      const request = new Request('http://localhost/api/quotes/nonexistent/status');
      const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBeDefined();
    });
  });

  describe('PATCH /api/quotes/[id]/status', () => {
    it('should update quote status', async () => {
      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        callCount++;
        // Call 1: quotes - fetch current
        if (callCount === 1 && table === 'quotes') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockQuote,
              error: null,
            }),
          };
        }
        // Call 2: quote_status_history - insert
        if (callCount === 2 && table === 'quote_status_history') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        // Call 3: quotes - update
        if (callCount === 3 && table === 'quotes') {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { ...mockQuote, status: 'sent' },
              error: null,
            }),
          };
        }
        // Call 4: activities - insert
        if (callCount === 4 && table === 'activities') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
          insert: jest.fn().mockResolvedValue({ error: null }),
          update: jest.fn().mockReturnThis(),
        };
      });

      const request = new Request('http://localhost/api/quotes/quote-1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'sent' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'quote-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.quote.status).toBe('sent');
    });

    it('should validate status transitions', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockQuote, status: 'accepted' },
          error: null,
        }),
      }));

      // Try invalid transition: accepted -> draft (accepted is final)
      const request = new Request('http://localhost/api/quotes/quote-1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'draft' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'quote-1' }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.message).toContain('Cannot transition from final status');
    });

    it('should require status field', async () => {
      const request = new Request('http://localhost/api/quotes/quote-1/status', {
        method: 'PATCH',
        body: JSON.stringify({}),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'quote-1' }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.message).toContain('required');
    });

    it('should handle database errors during update', async () => {
      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        callCount++;
        // Call 1: quotes - fetch current
        if (callCount === 1 && table === 'quotes') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockQuote,
              error: null,
            }),
          };
        }
        // Call 2: quote_status_history - insert succeeds
        if (callCount === 2 && table === 'quote_status_history') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        // Call 3: quotes - update fails
        if (callCount === 3 && table === 'quotes') {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Update failed' },
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
          insert: jest.fn().mockResolvedValue({ error: null }),
          update: jest.fn().mockReturnThis(),
        };
      });

      const request = new Request('http://localhost/api/quotes/quote-1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'sent' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'quote-1' }) });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBeDefined();
    });
  });
});
