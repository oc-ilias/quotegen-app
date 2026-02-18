/**
 * Customers API Route Tests
 * Comprehensive test coverage for /api/customers
 */

import { GET, POST } from '@/app/api/customers/route';
import { NextRequest } from 'next/server';

// Mock the route module's Supabase client
const mockQueryResult = {
  data: null as any,
  error: null as any,
  count: null as number | null,
};

const mockSelect = jest.fn().mockReturnValue(mockQueryResult);
const mockInsert = jest.fn().mockReturnValue(mockQueryResult);
const mockOrder = jest.fn().mockReturnValue(mockQueryResult);
const mockRange = jest.fn().mockReturnValue(mockQueryResult);
const mockOr = jest.fn().mockReturnValue(mockQueryResult);
const mockIn = jest.fn().mockReturnValue(mockQueryResult);
const mockOverlaps = jest.fn().mockReturnValue(mockQueryResult);
const mockGte = jest.fn().mockReturnValue(mockQueryResult);
const mockLte = jest.fn().mockReturnValue(mockQueryResult);
const mockEq = jest.fn().mockReturnValue(mockQueryResult);
const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });

const mockFromResult = {
  select: mockSelect,
  insert: mockInsert,
  order: mockOrder,
  range: mockRange,
  or: mockOr,
  in: mockIn,
  overlaps: mockOverlaps,
  gte: mockGte,
  lte: mockLte,
  eq: mockEq,
  maybeSingle: mockMaybeSingle,
  single: mockSingle,
};

const mockFrom = jest.fn().mockReturnValue(mockFromResult);

// Reset all mocks before each test
const resetMocks = () => {
  mockSelect.mockClear().mockReturnValue(mockQueryResult);
  mockInsert.mockClear().mockReturnValue(mockQueryResult);
  mockOrder.mockClear().mockReturnValue(mockQueryResult);
  mockRange.mockClear().mockReturnValue(mockQueryResult);
  mockOr.mockClear().mockReturnValue(mockQueryResult);
  mockIn.mockClear().mockReturnValue(mockQueryResult);
  mockOverlaps.mockClear().mockReturnValue(mockQueryResult);
  mockGte.mockClear().mockReturnValue(mockQueryResult);
  mockLte.mockClear().mockReturnValue(mockQueryResult);
  mockEq.mockClear().mockReturnValue(mockQueryResult);
  mockMaybeSingle.mockClear().mockResolvedValue({ data: null, error: null });
  mockSingle.mockClear().mockResolvedValue({ data: null, error: null });
  mockFrom.mockClear().mockReturnValue(mockFromResult);
  mockQueryResult.data = null;
  mockQueryResult.error = null;
  mockQueryResult.count = null;
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

describe('GET /api/customers', () => {
  beforeEach(() => {
    resetMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  it('should return customers with default pagination', async () => {
    const mockCustomers = [
      {
        id: '1',
        email: 'test@example.com',
        companyName: 'Test Company',
        contactName: 'Test Contact',
        status: 'active',
        customerSince: '2024-01-01',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        tags: [],
      },
    ];

    // First call: get customers
    mockSelect
      .mockResolvedValueOnce({
        data: mockCustomers,
        error: null,
        count: 1,
      })
      // Second call: get quotes for stats
      .mockResolvedValueOnce({
        data: [],
        error: null,
      });

    const request = new NextRequest('http://localhost:3000/api/customers');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.customers).toHaveLength(1);
    expect(body.data.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('should handle search query', async () => {
    mockSelect
      .mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      })
      .mockResolvedValueOnce({
        data: [],
        error: null,
      });

    const request = new NextRequest('http://localhost:3000/api/customers?search=test');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(mockOr).toHaveBeenCalledWith('companyName.ilike.%test%,contactName.ilike.%test%,email.ilike.%test%');
  });

  it('should handle status filter', async () => {
    mockSelect
      .mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      })
      .mockResolvedValueOnce({
        data: [],
        error: null,
      });

    const request = new NextRequest('http://localhost:3000/api/customers?status=active,inactive');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(mockIn).toHaveBeenCalledWith('status', ['active', 'inactive']);
  });

  it('should handle tags filter', async () => {
    mockSelect
      .mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      })
      .mockResolvedValueOnce({
        data: [],
        error: null,
      });

    const request = new NextRequest('http://localhost:3000/api/customers?tags=vip,premium');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(mockOverlaps).toHaveBeenCalledWith('tags', ['vip', 'premium']);
  });

  it('should handle date range filters', async () => {
    mockSelect
      .mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      })
      .mockResolvedValueOnce({
        data: [],
        error: null,
      });

    const request = new NextRequest('http://localhost:3000/api/customers?dateFrom=2024-01-01&dateTo=2024-12-31');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(mockGte).toHaveBeenCalledWith('createdAt', '2024-01-01');
    expect(mockLte).toHaveBeenCalledWith('createdAt', '2024-12-31');
  });

  it('should handle quote count and revenue filters', async () => {
    const mockCustomer = {
      id: '1',
      email: 'test@example.com',
      companyName: 'Test Company',
      contactName: 'Test Contact',
      status: 'active',
      customerSince: '2024-01-01',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      tags: [],
    };

    mockSelect
      .mockResolvedValueOnce({
        data: [mockCustomer],
        error: null,
        count: 1,
      })
      .mockResolvedValueOnce({
        data: [
          { customerId: '1', status: 'accepted', total: 5000, createdAt: '2024-01-01' },
        ],
        error: null,
      });

    const request = new NextRequest(
      'http://localhost:3000/api/customers?minQuotes=1&maxQuotes=10&minRevenue=1000&maxRevenue=10000'
    );
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should handle custom sorting', async () => {
    mockSelect
      .mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      })
      .mockResolvedValueOnce({
        data: [],
        error: null,
      });

    const request = new NextRequest('http://localhost:3000/api/customers?sortBy=company&sortOrder=asc');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should handle pagination parameters', async () => {
    mockSelect
      .mockResolvedValueOnce({
        data: [],
        error: null,
        count: 100,
      })
      .mockResolvedValueOnce({
        data: [],
        error: null,
      });

    const request = new NextRequest('http://localhost:3000/api/customers?page=2&limit=20');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.pagination).toEqual({
      page: 2,
      limit: 20,
      total: 100,
      totalPages: 5,
    });
  });

  it('should limit max page size to 100', async () => {
    mockSelect
      .mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      })
      .mockResolvedValueOnce({
        data: [],
        error: null,
      });

    const request = new NextRequest('http://localhost:3000/api/customers?limit=200');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.pagination.limit).toBe(100);
  });

  it('should handle database errors', async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database connection failed' },
      count: null,
    });

    const request = new NextRequest('http://localhost:3000/api/customers');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FETCH_ERROR');
  });

  it('should handle unexpected errors', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    
    const request = new NextRequest('http://localhost:3000/api/customers');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should calculate customer stats correctly', async () => {
    const mockCustomer = {
      id: '1',
      email: 'test@example.com',
      companyName: 'Test Company',
      contactName: 'Test Contact',
      status: 'active',
      customerSince: '2024-01-01',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      tags: [],
    };

    const mockQuotes = [
      { customerId: '1', status: 'accepted', total: 5000, createdAt: '2024-01-15' },
      { customerId: '1', status: 'accepted', total: 3000, createdAt: '2024-02-15' },
      { customerId: '1', status: 'declined', total: 2000, createdAt: '2024-03-15' },
      { customerId: '1', status: 'draft', total: 1000, createdAt: '2024-04-15' },
    ];

    mockSelect
      .mockResolvedValueOnce({
        data: [mockCustomer],
        error: null,
        count: 1,
      })
      .mockResolvedValueOnce({
        data: mockQuotes,
        error: null,
      });

    const request = new NextRequest('http://localhost:3000/api/customers');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.customers[0].stats).toMatchObject({
      totalQuotes: 4,
      totalRevenue: 8000,
      acceptedQuotes: 2,
      declinedQuotes: 1,
      pendingQuotes: 1,
      conversionRate: 50,
      avgQuoteValue: 2750,
    });
  });
});

describe('POST /api/customers', () => {
  beforeEach(() => {
    resetMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  const validCustomer = {
    email: 'new@example.com',
    companyName: 'New Company',
    contactName: 'New Contact',
    phone: '+1234567890',
    billingAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'USA',
    },
    tags: ['vip', 'enterprise'],
    notes: 'Test notes',
  };

  it('should create a new customer successfully', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null });
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'new-id',
        ...validCustomer,
        status: 'active',
        customerSince: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/customers', {
      method: 'POST',
      body: JSON.stringify(validCustomer),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(validCustomer.email);
  });

  it('should validate required fields', async () => {
    const invalidCustomer = {
      email: 'invalid-email',
      companyName: '',
      contactName: '',
    };

    const request = new NextRequest('http://localhost:3000/api/customers', {
      method: 'POST',
      body: JSON.stringify(invalidCustomer),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { id: 'existing-id' },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/customers', {
      method: 'POST',
      body: JSON.stringify(validCustomer),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('DUPLICATE_ERROR');
  });

  it('should handle database insert errors', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null });
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Insert failed' },
    });

    const request = new NextRequest('http://localhost:3000/api/customers', {
      method: 'POST',
      body: JSON.stringify(validCustomer),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('CREATE_ERROR');
  });

  it('should handle unexpected errors', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';

    const request = new NextRequest('http://localhost:3000/api/customers', {
      method: 'POST',
      body: JSON.stringify(validCustomer),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should handle missing request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/customers', {
      method: 'POST',
      body: '',
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });

  it('should accept optional address fields', async () => {
    const customerWithAddresses = {
      ...validCustomer,
      billingAddress: {
        street: '123 Billing St',
        city: 'Billing City',
        state: 'BC',
        zipCode: '54321',
        country: 'USA',
      },
      shippingAddress: {
        street: '456 Shipping Ave',
        city: 'Shipping City',
        state: 'SC',
        zipCode: '98765',
        country: 'USA',
      },
    };

    mockMaybeSingle.mockResolvedValueOnce({ data: null });
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'new-id',
        ...customerWithAddresses,
        status: 'active',
        customerSince: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/customers', {
      method: 'POST',
      body: JSON.stringify(customerWithAddresses),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it('should validate address fields when provided', async () => {
    const customerWithInvalidAddress = {
      ...validCustomer,
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    };

    const request = new NextRequest('http://localhost:3000/api/customers', {
      method: 'POST',
      body: JSON.stringify(customerWithInvalidAddress),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
