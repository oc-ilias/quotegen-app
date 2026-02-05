// __tests__/lib/supabase.test.ts

// Mock the supabase client before importing
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table: string) => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: {
                id: 'test-id',
                shop_id: 'test-shop',
                product_id: 'test-product',
                product_title: 'Test Product',
                customer_email: 'test@example.com',
                customer_name: 'Test User',
                status: 'pending',
                created_at: '2026-02-04T00:00:00Z',
                updated_at: '2026-02-04T00:00:00Z',
              },
              error: null,
            })
          ),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() =>
            Promise.resolve({
              data: [
                {
                  id: 'test-id',
                  shop_id: 'test-shop',
                  product_id: 'test-product',
                  product_title: 'Test Product',
                  customer_email: 'test@example.com',
                  customer_name: 'Test User',
                  status: 'pending',
                  created_at: '2026-02-04T00:00:00Z',
                  updated_at: '2026-02-04T00:00:00Z',
                },
              ],
              error: null,
            })
          ),
        })),
        single: jest.fn(() =>
          Promise.resolve({
            data: {
              id: 'test-id',
              shop_id: 'test-shop',
              product_id: 'test-product',
              product_title: 'Test Product',
              customer_email: 'test@example.com',
              customer_name: 'Test User',
              status: 'quoted',
              admin_notes: 'Test notes',
              quote_amount: 100,
              created_at: '2026-02-04T00:00:00Z',
              updated_at: '2026-02-04T00:00:00Z',
            },
            error: null,
          })
        ),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: {
                  id: 'test-id',
                  shop_id: 'test-shop',
                  product_id: 'test-product',
                  product_title: 'Test Product',
                  customer_email: 'test@example.com',
                  customer_name: 'Test User',
                  status: 'quoted',
                  admin_notes: 'Test notes',
                  quote_amount: 100,
                  created_at: '2026-02-04T00:00:00Z',
                  updated_at: '2026-02-04T00:00:00Z',
                },
                error: null,
              })
            ),
          })),
        })),
      })),
    })),
  })),
}));

// Import after mock
import { createQuote, getQuotes, updateQuoteStatus } from '@/lib/supabase';

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
