/**
 * API Integration Tests - Customers Route
 * @module __tests__/api/customers
 */

import { GET, POST } from '@/app/api/customers/route';

// Mock Supabase client - use a module-level mock that doesn't rely on external variables
jest.mock('@supabase/supabase-js', () => {
  const mockSupabaseFrom = jest.fn();
  return {
    createClient: jest.fn(() => ({
      from: mockSupabaseFrom,
      auth: {
        getUser: jest.fn(),
      },
    })),
    __mockSupabaseFrom: mockSupabaseFrom,
  };
});

// Import the mocked module to access the mock function
const { __mockSupabaseFrom: mockSupabaseFrom } = jest.requireMock('@supabase/supabase-js');

describe('Customers API', () => {
  const mockCustomers = [
    {
      id: 'cust-1',
      email: 'john@example.com',
      companyName: 'Acme Corp',
      contactName: 'John Doe',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      customerSince: '2024-01-01T00:00:00Z',
      tags: [],
    },
    {
      id: 'cust-2',
      email: 'jane@example.com',
      companyName: 'Tech Inc',
      contactName: 'Jane Smith',
      status: 'active',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      customerSince: '2024-01-02T00:00:00Z',
      tags: [],
    },
  ];

  const mockQuotes = [
    { customerId: 'cust-1', status: 'accepted', total: 1000, createdAt: '2024-01-03T00:00:00Z' },
    { customerId: 'cust-1', status: 'pending', total: 500, createdAt: '2024-01-04T00:00:00Z' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/customers', () => {
    it('should return customers with pagination', async () => {
      // Mock the customers query
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: jest.fn(() => ({
              or: jest.fn().mockReturnThis(),
              ilike: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              overlaps: jest.fn().mockReturnThis(),
              gte: jest.fn().mockReturnThis(),
              lte: jest.fn().mockReturnThis(),
              order: jest.fn(() => ({
                range: jest.fn().mockResolvedValue({
                  data: mockCustomers,
                  error: null,
                  count: 2,
                }),
              })),
            })),
          };
        }
        if (table === 'quotes') {
          return {
            select: jest.fn(() => ({
              in: jest.fn().mockResolvedValue({
                data: mockQuotes,
                error: null,
              }),
            })),
          };
        }
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      const request = new Request('http://localhost/api/customers?page=1&limit=10');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.customers).toHaveLength(2);
      expect(json.data.pagination).toBeDefined();
    });

    it('should handle search query', async () => {
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: jest.fn(() => ({
              or: jest.fn(() => ({
                order: jest.fn(() => ({
                  range: jest.fn().mockResolvedValue({
                    data: [mockCustomers[0]],
                    error: null,
                    count: 1,
                  }),
                })),
              })),
            })),
          };
        }
        if (table === 'quotes') {
          return {
            select: jest.fn(() => ({
              in: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          };
        }
        return { insert: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });

      const request = new Request('http://localhost/api/customers?search=acme');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const newCustomer = {
        email: 'new@example.com',
        companyName: 'New Corp',
        contactName: 'New Contact',
      };

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
              })),
            })),
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'cust-3',
                    ...newCustomer,
                    status: 'active',
                    createdAt: '2024-01-03T00:00:00Z',
                    updatedAt: '2024-01-03T00:00:00Z',
                    customerSince: '2024-01-03T00:00:00Z',
                    tags: [],
                  },
                  error: null,
                }),
              })),
            })),
          };
        }
        if (table === 'customerActivity') {
          return {
            insert: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        return { insert: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });

      const request = new Request('http://localhost/api/customers', {
        method: 'POST',
        body: JSON.stringify(newCustomer),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
    });

    it('should validate required fields', async () => {
      const request = new Request('http://localhost/api/customers', {
        method: 'POST',
        body: JSON.stringify({ email: 'invalid' }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate emails', async () => {
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'cust-1' }, error: null }),
              })),
            })),
          };
        }
        return { insert: jest.fn().mockResolvedValue({ data: null, error: null }) };
      });

      const request = new Request('http://localhost/api/customers', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          companyName: 'Test Corp',
          contactName: 'Test User',
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('DUPLICATE_ERROR');
    });
  });
});
