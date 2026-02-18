/**
 * API Integration Tests - Customer Detail Routes
 * @module __tests__/api/customers/[id]
 */

import { GET, PATCH, DELETE } from '@/app/api/customers/[id]/route';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => {
  const mockSupabaseFrom = jest.fn();
  const mockSupabaseClient = {
    from: mockSupabaseFrom,
    auth: { getUser: jest.fn() },
  };
  return {
    createClient: jest.fn(() => mockSupabaseClient),
    __mockSupabaseFrom: mockSupabaseFrom,
    __mockSupabaseClient: mockSupabaseClient,
  };
});

const { __mockSupabaseFrom: mockSupabaseFrom } = jest.requireMock('@supabase/supabase-js');

describe('Customer Detail API', () => {
  const mockCustomer = {
    id: 'cust-1',
    email: 'john@example.com',
    companyName: 'Acme Corp',
    contactName: 'John Doe',
    phone: '123-456-7890',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    customerSince: '2024-01-01T00:00:00Z',
    tags: [],
  };

  const mockQuotes = [
    { id: 'quote-1', customerId: 'cust-1', status: 'accepted', total: 1000, createdAt: '2024-01-03T00:00:00Z' },
    { id: 'quote-2', customerId: 'cust-1', status: 'pending', total: 500, createdAt: '2024-01-04T00:00:00Z' },
  ];

  const mockActivities = [
    { id: 'act-1', customerId: 'cust-1', type: 'customer_created', description: 'Customer created', createdAt: '2024-01-01T00:00:00Z', metadata: {} },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/customers/[id]', () => {
    it('should return customer with stats and activity', async () => {
      let callCount = 0;
      mockSupabaseFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === 'customers') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockCustomer,
              error: null,
            }),
          };
        }
        if (table === 'quotes') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: mockQuotes,
              error: null,
            }),
          };
        }
        if (table === 'customerActivity') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: mockActivities,
              error: null,
            }),
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });

      const request = new Request('http://localhost/api/customers/cust-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.customer.id).toBe('cust-1');
      expect(json.data.customer.stats).toBeDefined();
      expect(json.data.customer.stats.totalQuotes).toBe(2);
      expect(json.data.customer.stats.totalRevenue).toBe(1000);
      expect(json.data.customer.recentActivity).toHaveLength(1);
    });

    it('should return 400 if customer ID is missing', async () => {
      const request = new Request('http://localhost/api/customers/');
      const response = await GET(request, { params: Promise.resolve({ id: '' }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('MISSING_ID');
    });

    it('should return 404 if customer not found', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      }));

      const request = new Request('http://localhost/api/customers/nonexistent');
      const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'DB_ERROR', message: 'Database error' },
        }),
      }));

      const request = new Request('http://localhost/api/customers/cust-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('FETCH_ERROR');
    });

    it('should handle customer with no quotes', async () => {
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockCustomer,
              error: null,
            }),
          };
        }
        if (table === 'quotes') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          };
        }
        if (table === 'customerActivity') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });

      const request = new Request('http://localhost/api/customers/cust-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.customer.stats.totalQuotes).toBe(0);
      expect(json.data.customer.stats.totalRevenue).toBe(0);
      expect(json.data.customer.stats.conversionRate).toBe(0);
    });
  });

  describe('PATCH /api/customers/[id]', () => {
    it('should update customer successfully', async () => {
      const updateData = {
        companyName: 'Updated Corp',
        contactName: 'Updated Contact',
      };

      let callCount = 0;
      mockSupabaseFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === 'customers') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { ...mockCustomer, ...updateData },
              error: null,
            }),
            neq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
            update: jest.fn().mockReturnThis(),
          };
        }
        if (table === 'customerActivity') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return { insert: jest.fn().mockResolvedValue({ error: null }) };
      });

      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('should return 400 for invalid email format', async () => {
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

    it('should return 400 if customer ID is missing', async () => {
      const request = new Request('http://localhost/api/customers/', {
        method: 'PATCH',
        body: JSON.stringify({ companyName: 'Test' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: '' }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('MISSING_ID');
    });

    it('should return 404 if customer not found', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      }));

      const request = new Request('http://localhost/api/customers/nonexistent', {
        method: 'PATCH',
        body: JSON.stringify({ companyName: 'Test' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'nonexistent' }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should return 409 for duplicate email', async () => {
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockCustomer,
              error: null,
            }),
            neq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: { id: 'cust-2' },
              error: null,
            }),
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });

      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'PATCH',
        body: JSON.stringify({ email: 'existing@example.com' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.error.code).toBe('DUPLICATE_ERROR');
    });
  });

  describe('DELETE /api/customers/[id]', () => {
    it('should delete customer without quotes', async () => {
      let callCount = 0;
      mockSupabaseFrom.mockImplementation((table: string) => {
        callCount++;
        if (table === 'customers') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockCustomer,
              error: null,
            }),
            delete: jest.fn().mockReturnThis(),
          };
        }
        if (table === 'quotes') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });

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
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockCustomer,
              error: null,
            }),
            update: jest.fn().mockReturnThis(),
          };
        }
        if (table === 'quotes') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [{ id: 'quote-1' }],
              error: null,
            }),
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });

      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.archived).toBe(true);
    });

    it('should return 400 if customer ID is missing', async () => {
      const request = new Request('http://localhost/api/customers/', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: '' }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('MISSING_ID');
    });

    it('should return 404 if customer not found', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      }));

      const request = new Request('http://localhost/api/customers/nonexistent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'nonexistent' }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should handle database error when checking quotes', async () => {
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockCustomer,
              error: null,
            }),
          };
        }
        if (table === 'quotes') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });

      const request = new Request('http://localhost/api/customers/cust-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error.code).toBe('CHECK_ERROR');
    });
  });
});
