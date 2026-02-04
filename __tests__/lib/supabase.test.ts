// __tests__/lib/supabase.test.ts
import { createQuote, getQuotes, updateQuoteStatus } from '@/lib/supabase';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  ...jest.requireActual('@/lib/supabase'),
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: mockQuote, error: null })),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [mockQuote], error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockQuote, error: null })),
          })),
        })),
      })),
    })),
  },
}));

const mockQuote = {
  id: 'test-id',
  shop_id: 'test-shop',
  product_id: 'test-product',
  product_title: 'Test Product',
  customer_email: 'test@example.com',
  customer_name: 'Test User',
  status: 'pending',
  created_at: '2026-02-04T00:00:00Z',
  updated_at: '2026-02-04T00:00:00Z',
};

describe('Supabase API', () => {
  describe('createQuote', () => {
    it('creates a quote successfully', async () => {
      const result = await createQuote({
        shop_id: 'test-shop',
        product_id: 'test-product',
        product_title: 'Test Product',
        customer_email: 'test@example.com',
        customer_name: 'Test User',
        status: 'pending',
      });
      
      expect(result).toBeDefined();
      expect(result.shop_id).toBe('test-shop');
    });
  });
  
  describe('getQuotes', () => {
    it('fetches quotes for a shop', async () => {
      const quotes = await getQuotes('test-shop');
      
      expect(quotes).toBeDefined();
      expect(Array.isArray(quotes)).toBe(true);
    });
  });
  
  describe('updateQuoteStatus', () => {
    it('updates quote status', async () => {
      const result = await updateQuoteStatus('test-id', 'quoted', 'Test notes', 100);
      
      expect(result).toBeDefined();
      expect(result.status).toBe('quoted');
    });
  });
});