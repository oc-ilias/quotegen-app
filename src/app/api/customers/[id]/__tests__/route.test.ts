/**
 * API Integration Tests - Customer Detail Routes
 * Tests for GET, PATCH, DELETE /api/customers/[id]
 * @module src/app/api/customers/[id]/__tests__/route.test
 */

import { GET, PATCH, DELETE } from '@/app/api/customers/[id]/route';
import { CustomerStatus } from '@/types/quote';

// Mock Supabase client
const mockSingle = jest.fn();
const mockMaybeSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle, maybeSingle: mockMaybeSingle }));
const mockNeq = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq, neq: mockNeq }));
const mockUpdate = jest.fn(() => ({ eq: mockEq, select: jest.fn(() => ({ single: mockSingle }) )}));
const mockDelete = jest.fn(() => ({ eq: mockEq }));
const mockInsert = jest.fn(() => Promise.resolve({ data: null, error: null }));
const mockOrder = jest.fn(() => ({ limit: jest.fn(() => Promise.resolve({ data: [], error: null })) }));
const mockFrom = jest.fn((table: string) => {
  if (table === 'customers') {
    return {
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
    };
  }
  if (table === 'quotes') {
    return {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
      })),
    };
  }
  if (table === 'customerActivity') {
    return {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
      })),
      insert: mockInsert,
    };
  }
  return { insert: mockInsert };
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
    auth: { getUser: jest.fn() },
  })),
}));

describe('Customer Detail API', () => {
  const mockCustomer = {
    id: 'cust-1',
    email: 'john@example.com',
    companyName: 'Acme Corp',
    contactName: 'John Doe',
    phone: '+1 555-0123',
    status: CustomerStatus.ACTIVE,
    tags: ['vip'],
    billingAddress: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
    shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
    taxId: 'TAX-123',
    notes: 'Important customer',
    logoUrl: 'https://example.com/logo.png',
    customerSince: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  };

  const mockQuotes = [
    { id: 'quote-1', customerId: 'cust-1', status: 'accepted', total: 5000, createdAt: '2024-01-10T00:00:00Z' },
    { id: 'quote-2', customerId: 'cust-1', status: 'pending', total: 3000, createdAt: '2024-01-15T00:00:00Z' },
  ];

  const mockActivities = [
    { id: 'act-1', customerId: 'cust-1', type: 'quote_created', description: 'Quote created', createdAt: '2024-01-10T00:00:00Z' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // GET Tests
  // ============================================================================

  describe('GET /api/customers/[id]', () => {
    it('should return customer details with stats', async () => {
      mockSingle.mockResolvedValueOnce({ data: mockCustomer, error: null });
      
      // Mock quotes query
      mockFrom.mockImplementation((table: string) => {
        if (table === 'customers') {
          return { select: mockSelect };
        }
        if (table === 'quotes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn().mockResolvedValue({ data: mockQuotes, error: null }),
                })),
              })),
            })),
          };
        }
        if (table === 'customerActivity') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn().mockResolvedValue({ data: mockActivities, error: null }),
                })),
              })),
            })),
          };
        }
        return { insert: mockInsert };
      });

      const request = new Request('http://localhost/api/customers/cust-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.customer).toBeDefined();
      expect(json.data.customer.id).toBe('cust-1');
      expect(json.data.customer.stats).toBeDefined();
    });

    it('should return 400 when customer ID is missing', async () => {
      const request = new Request('http://localhost/api/customers/');
      const response = await GET(request, { params: Promise.resolve({ id: '' }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('MISSING_ID');
    });

    it('should return 404 when customer not found', async () => {
      mockSingle.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Not found' } 
      });

      const request = new Request('http://localhost/api/customers/non-existent');
      const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      mockSingle.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST001', message: 'Database error' } 
      });

      const request = new Request('http://localhost/api/customers/cust-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('FETCH_ERROR');
    });

    it('should calculate stats correctly with accepted quotes', async () => {
      mockSingle.mockResolvedValueOnce({ data: mockCustomer, error: null });
      
      mockFrom.mockImplementation((table: string) => {
        if (table === 'customers') return { select: mockSelect };
        if (table === 'quotes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn().mockResolvedValue({
                    data: [
                      { id: 'q1', status: 'accepted', total: 1000, createdAt: '2024-01-01T00:00:00Z' },
                      { id: 'q2', status: 'accepted', total: 2000, createdAt: '2024-01-02T00:00:00Z' },
                      { id: 'q3', status: 'declined', total: 500, createdAt: '2024-01-03T00:00:00Z' },
                      { id: 'q4', status: 'pending', total: 750, createdAt: '2024-01-04T00:00:00Z' },
                    ],
                    error: null,
                  }),
                })),
              })),
            })),
          };
        }
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              })),
            })),
          })),
        };
      });

      const request = new Request('http://localhost/api/customers/cust-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.customer.stats).toEqual({
        totalQuotes: 4,
        totalRevenue: 3000,
        avgQuoteValue: 1062.5,
        acceptedQuotes: 2,
        declinedQuotes: 1,
        pendingQuotes: 1,
        conversionRate: 50,
        lastQuoteDate: expect.any(String),
        firstQuoteDate: expect.any(String),
      });
    });

    it('should handle customer with no quotes', async () => {
      mockSingle.mockResolvedValueOnce({ data: mockCustomer, error: null });
      
      mockFrom.mockImplementation((table: string) => {
        if (table === 'customers') return { select: mockSelect };
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              })),
            })),
          })),
        };
      });

      const request = new Request('http://localhost/api/customers/cust-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.customer.stats.totalQuotes).toBe(0);
      expect(json.data.customer.stats.conversionRate).toBe(0);
      expect(json.data.customer.stats.avgQuoteValue).toBe(0);
    });
  });

  // ============================================================================
  // PATCH Tests
  // ============================================================================

  describe('PATCH /api/customers/[id]', () => {
    const updateData = {
      contactName: 'Jane Doe',
      phone: '+1 555-0199',
    };

    it('should update customer successfully', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: 'cust-1' }, error: null }) // Check exists
        .mockResolvedValueOnce({ 
          data: { ...mockCustomer, ...updateData }, 
          error: null 
        }); // Update result

      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.contactName).toBe('Jane Doe');
      expect(json.data.phone).toBe('+1 555-0199');
    });

    it('should return 400 when customer ID is missing', async () => {
      const request = new Request('http://localhost/api/customers/', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: '' }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('MISSING_ID');
    });

    it('should return 400 for invalid data', async () => {
      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'PATCH',
        body: JSON.stringify({ email: 'invalid-email' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when customer not found', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      const request = new Request('http://localhost/api/customers/non-existent', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should reject duplicate email', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: 'cust-1' }, error: null }) // Check exists
        .mockResolvedValueOnce({ data: { id: 'cust-2' }, error: null }); // Duplicate check

      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'PATCH',
        body: JSON.stringify({ email: 'existing@example.com' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.error.code).toBe('DUPLICATE_ERROR');
    });

    it('should handle server errors during update', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: 'cust-1' }, error: null }) // Check exists
        .mockRejectedValueOnce(new Error('Database connection failed')); // Update fails

      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error.code).toBe('INTERNAL_ERROR');
    });

    it('should allow partial updates with valid fields only', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: 'cust-1' }, error: null })
        .mockResolvedValueOnce({ 
          data: { ...mockCustomer, notes: 'Updated notes' }, 
          error: null 
        });

      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'PATCH',
        body: JSON.stringify({ notes: 'Updated notes' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.notes).toBe('Updated notes');
    });
  });

  // ============================================================================
  // DELETE Tests
  // ============================================================================

  describe('DELETE /api/customers/[id]', () => {
    it('should delete customer without quotes', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: 'cust-1' }, error: null }) // Check exists
        .mockResolvedValueOnce({ data: [], error: null }); // No quotes

      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.deleted).toBe(true);
    });

    it('should archive customer with existing quotes', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: 'cust-1' }, error: null }) // Check exists
        .mockResolvedValueOnce({ data: [{ id: 'quote-1' }], error: null }); // Has quotes

      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.archived).toBe(true);
    });

    it('should return 400 when customer ID is missing', async () => {
      const request = new Request('http://localhost/api/customers/', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: '' }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('MISSING_ID');
    });

    it('should return 404 when customer not found', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      const request = new Request('http://localhost/api/customers/non-existent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should handle errors when checking for quotes', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: 'cust-1' }, error: null })
        .mockResolvedValueOnce({ data: null, error: { message: 'Query failed' } });

      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error.code).toBe('CHECK_ERROR');
    });

    it('should handle archive errors gracefully', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { id: 'cust-1' }, error: null })
        .mockResolvedValueOnce({ data: [{ id: 'quote-1' }], error: null });

      // Mock failed archive update
      mockFrom.mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: mockSelect,
            update: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } }),
            })),
          };
        }
        return { insert: mockInsert };
      });

      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error.code).toBe('ARCHIVE_ERROR');
    });
  });
});
