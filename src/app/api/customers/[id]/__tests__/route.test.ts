/**
 * API Integration Tests - Customer Detail Routes
 * Tests for GET, PATCH, DELETE /api/customers/[id]
 * @module src/app/api/customers/[id]/__tests__/route.test
 */

import { CustomerStatus } from '@/types/quote';

// Mock Supabase client
const mockSingleResults: any[] = [];
let mockSingleIndex = 0;

const mockSingle = jest.fn(() => {
  const result = mockSingleResults[mockSingleIndex] || { data: null, error: null };
  mockSingleIndex++;
  return Promise.resolve(result);
});

const mockSelect = jest.fn(() => ({
  eq: jest.fn(() => ({
    single: mockSingle,
    maybeSingle: mockSingle,
    order: jest.fn(() => ({
      limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
  order: jest.fn(() => ({
    limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
}));

const mockUpdate = jest.fn(() => ({
  eq: jest.fn(() => ({
    select: jest.fn(() => ({
      single: mockSingle,
    })),
  })),
}));

const mockDelete = jest.fn(() => ({
  eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
}));

const mockInsert = jest.fn(() => Promise.resolve({ data: null, error: null }));

const mockFrom = jest.fn((table: string) => {
  if (table === 'customers') {
    return {
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
      insert: mockInsert,
    };
  }
  if (table === 'quotes') {
    return {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    };
  }
  if (table === 'customerActivity') {
    return {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
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

// Import after mocks are set up
import { GET, PATCH, DELETE } from '@/app/api/customers/[id]/route';

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

  beforeEach(() => {
    jest.clearAllMocks();
    mockSingleResults.length = 0;
    mockSingleIndex = 0;
  });

  // ============================================================================
  // GET Tests
  // ============================================================================

  describe('GET /api/customers/[id]', () => {
    it('should return customer details with stats', async () => {
      mockSingleResults.push({ data: mockCustomer, error: null });
      
      const request = new Request('http://localhost/api/customers/cust-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.customer).toBeDefined();
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
      mockSingleResults.push({ data: null, error: { code: 'PGRST116', message: 'Not found' } });

      const request = new Request('http://localhost/api/customers/non-existent');
      const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      mockSingleResults.push({ data: null, error: { code: 'PGRST001', message: 'Database error' } });

      const request = new Request('http://localhost/api/customers/cust-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'cust-1' }) });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('FETCH_ERROR');
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

    it('should return 404 when customer not found', async () => {
      mockSingleResults.push({ data: null, error: { code: 'PGRST116' } });

      const request = new Request('http://localhost/api/customers/non-existent', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });

  // ============================================================================
  // DELETE Tests
  // ============================================================================

  describe('DELETE /api/customers/[id]', () => {
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
      mockSingleResults.push({ data: null, error: { code: 'PGRST116' } });

      const request = new Request('http://localhost/api/customers/non-existent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });
});
