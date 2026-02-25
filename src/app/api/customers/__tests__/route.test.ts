/**
 * Customers API Route Tests
 * Comprehensive test coverage for /api/customers
 */

import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

// Create a chainable mock builder for Supabase queries
const createChainableMock = () => {
  const mockFns: Record<string, jest.Mock> = {};
  
  const chainMethods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'like', 'ilike', 'is', 'in', 'contains',
    'containedBy', 'overlaps', 'or', 'and',
    'order', 'limit', 'range', 'match', 'maybeSingle', 'single'
  ];
  
  const builder: any = {};
  
  chainMethods.forEach(method => {
    mockFns[method] = jest.fn();
    builder[method] = (...args: any[]) => {
      mockFns[method](...args);
      return builder;
    };
  });
  
  // Add thenable for await support
  builder.then = jest.fn();
  
  return { builder, mockFns };
};

// Track all mocks for assertions
let currentMock: ReturnType<typeof createChainableMock> | null = null;

const mockFrom = jest.fn(() => {
  currentMock = createChainableMock();
  return currentMock.builder;
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

describe('GET /api/customers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentMock = null;
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

    // Setup mock responses
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      
      // First query returns customers
      currentMock.builder.then = jest.fn((callback: any) => {
        callback({
          data: mockCustomers,
          error: null,
          count: 1,
        });
        return Promise.resolve({
          data: mockCustomers,
          error: null,
          count: 1,
        });
      });
      
      return currentMock.builder;
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
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      
      currentMock.builder.then = jest.fn((callback: any) => {
        callback({
          data: [],
          error: null,
          count: 0,
        });
        return Promise.resolve({
          data: [],
          error: null,
          count: 0,
        });
      });
      
      return currentMock.builder;
    });

    const request = new NextRequest('http://localhost:3000/api/customers?search=test');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should handle status filter', async () => {
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      
      currentMock.builder.then = jest.fn((callback: any) => {
        callback({
          data: [],
          error: null,
          count: 0,
        });
        return Promise.resolve({
          data: [],
          error: null,
          count: 0,
        });
      });
      
      return currentMock.builder;
    });

    const request = new NextRequest('http://localhost:3000/api/customers?status=active,inactive');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should handle tags filter', async () => {
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      
      currentMock.builder.then = jest.fn((callback: any) => {
        callback({
          data: [],
          error: null,
          count: 0,
        });
        return Promise.resolve({
          data: [],
          error: null,
          count: 0,
        });
      });
      
      return currentMock.builder;
    });

    const request = new NextRequest('http://localhost:3000/api/customers?tags=vip,premium');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should handle date range filters', async () => {
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      
      currentMock.builder.then = jest.fn((callback: any) => {
        callback({
          data: [],
          error: null,
          count: 0,
        });
        return Promise.resolve({
          data: [],
          error: null,
          count: 0,
        });
      });
      
      return currentMock.builder;
    });

    const request = new NextRequest('http://localhost:3000/api/customers?dateFrom=2024-01-01&dateTo=2024-12-31');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
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

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      callCount++;
      
      currentMock.builder.then = jest.fn((callback: any) => {
        if (callCount === 1) {
          callback({
            data: [mockCustomer],
            error: null,
            count: 1,
          });
        } else {
          callback({
            data: [
              { customerId: '1', status: 'accepted', total: 5000, createdAt: '2024-01-01' },
            ],
            error: null,
          });
        }
        return Promise.resolve({
          data: callCount === 1 ? [mockCustomer] : [{ customerId: '1', status: 'accepted', total: 5000, createdAt: '2024-01-01' }],
          error: null,
          count: callCount === 1 ? 1 : undefined,
        });
      });
      
      return currentMock.builder;
    });

    const request = new NextRequest(
      'http://localhost:3000/api/customers?minQuotes=1&maxQuotes=10&minRevenue=1000&maxRevenue=10000'
    );
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should handle custom sorting', async () => {
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      
      currentMock.builder.then = jest.fn((callback: any) => {
        callback({
          data: [],
          error: null,
          count: 0,
        });
        return Promise.resolve({
          data: [],
          error: null,
          count: 0,
        });
      });
      
      return currentMock.builder;
    });

    const request = new NextRequest('http://localhost:3000/api/customers?sortBy=company&sortOrder=asc');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should handle pagination parameters', async () => {
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      
      currentMock.builder.then = jest.fn((callback: any) => {
        callback({
          data: [],
          error: null,
          count: 100,
        });
        return Promise.resolve({
          data: [],
          error: null,
          count: 100,
        });
      });
      
      return currentMock.builder;
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
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      
      currentMock.builder.then = jest.fn((callback: any) => {
        callback({
          data: [],
          error: null,
          count: 0,
        });
        return Promise.resolve({
          data: [],
          error: null,
          count: 0,
        });
      });
      
      return currentMock.builder;
    });

    const request = new NextRequest('http://localhost:3000/api/customers?limit=200');
    const response = await GET(request);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.pagination.limit).toBe(100);
  });

  it('should handle database errors', async () => {
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      
      currentMock.builder.then = jest.fn((callback: any) => {
        callback({
          data: null,
          error: { message: 'Database connection failed' },
          count: null,
        });
        return Promise.resolve({
          data: null,
          error: { message: 'Database connection failed' },
          count: null,
        });
      });
      
      return currentMock.builder;
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

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      callCount++;
      
      currentMock.builder.then = jest.fn((callback: any) => {
        if (callCount === 1) {
          callback({
            data: [mockCustomer],
            error: null,
            count: 1,
          });
        } else {
          callback({
            data: mockQuotes,
            error: null,
          });
        }
        return Promise.resolve({
          data: callCount === 1 ? [mockCustomer] : mockQuotes,
          error: null,
          count: callCount === 1 ? 1 : undefined,
        });
      });
      
      return currentMock.builder;
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
    jest.clearAllMocks();
    currentMock = null;
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
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      callCount++;
      
      if (callCount === 1) {
        // Check for duplicate
        currentMock.builder.maybeSingle = jest.fn().mockResolvedValue({ data: null });
      } else if (callCount === 2) {
        // Insert customer
        currentMock.builder.single = jest.fn().mockResolvedValue({
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
      }
      
      return currentMock.builder;
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
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      
      currentMock.builder.maybeSingle = jest.fn().mockResolvedValue({
        data: { id: 'existing-id' },
        error: null,
      });
      
      return currentMock.builder;
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
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      callCount++;
      
      if (callCount === 1) {
        currentMock.builder.maybeSingle = jest.fn().mockResolvedValue({ data: null });
      } else if (callCount === 2) {
        currentMock.builder.single = jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        });
      }
      
      return currentMock.builder;
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

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      currentMock = createChainableMock();
      callCount++;
      
      if (callCount === 1) {
        currentMock.builder.maybeSingle = jest.fn().mockResolvedValue({ data: null });
      } else if (callCount === 2) {
        currentMock.builder.single = jest.fn().mockResolvedValue({
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
      }
      
      return currentMock.builder;
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
