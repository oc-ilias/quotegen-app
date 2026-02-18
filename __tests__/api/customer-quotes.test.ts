/**
 * API Tests - Customer Quotes Route
 * @module __tests__/api/customer-quotes
 */

import { GET } from '@/app/api/customers/[id]/quotes/route';

// Mock Supabase
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();
const mockRange = jest.fn();
const mockIn = jest.fn();
const mockGte = jest.fn();
const mockLte = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

describe('Customer Quotes API', () => {
  const mockCustomer = {
    id: 'customer-1',
    companyName: 'Acme Corp',
    contactName: 'John Doe',
  };

  const mockQuotes = [
    {
      id: 'quote-1',
      quoteNumber: 'QT-001',
      title: 'Quote for Widgets',
      status: 'sent',
      total: 1000.00,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 'quote-2',
      quoteNumber: 'QT-002',
      title: 'Quote for Gadgets',
      status: 'accepted',
      total: 2500.00,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-04T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  function setupMockChain(result: any) {
    mockRange.mockResolvedValue(result);
    mockOrder.mockReturnValue({ range: mockRange });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });
  }

  function setupCustomerMock(customer: any) {
    mockSingle.mockResolvedValue({ data: customer, error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });
  }

  describe('GET /api/customers/[id]/quotes', () => {
    it('should return quotes for a valid customer', async () => {
      // First call for customer lookup
      mockSingle.mockResolvedValueOnce({ data: mockCustomer, error: null });
      
      // Reset and setup for quotes query
      mockFrom.mockClear();
      setupMockChain({ data: mockQuotes, error: null, count: 2 });

      // Need to handle the two calls to from()
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Customer lookup
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: mockCustomer, error: null }),
              }),
            }),
          };
        }
        // Quotes query
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                range: () => Promise.resolve({ data: mockQuotes, error: null, count: 2 }),
              }),
            }),
          }),
        };
      });

      const request = new Request('http://localhost/api/customers/customer-1/quotes');
      const response = await GET(request, { params: Promise.resolve({ id: 'customer-1' }) });

      expect(response.status).toBe(200);
    });

    it('should return 400 for missing customer ID', async () => {
      const request = new Request('http://localhost/api/customers//quotes');
      const response = await GET(request, { params: Promise.resolve({ id: '' }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('MISSING_ID');
    });

    it('should return 404 for non-existent customer', async () => {
      mockFrom.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      }));

      const request = new Request('http://localhost/api/customers/non-existent/quotes');
      const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      mockFrom.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: mockCustomer, error: null }),
          }),
        }),
      }));

      // Second call will fail
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: mockCustomer, error: null }),
              }),
            }),
          };
        }
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                range: () => Promise.resolve({ data: null, error: { message: 'DB error' }, count: 0 }),
              }),
            }),
          }),
        };
      });

      const request = new Request('http://localhost/api/customers/customer-1/quotes');
      const response = await GET(request, { params: Promise.resolve({ id: 'customer-1' }) });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
    });

    it('should handle unexpected errors', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new Request('http://localhost/api/customers/customer-1/quotes');
      const response = await GET(request, { params: Promise.resolve({ id: 'customer-1' }) });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
    });
  });
});
