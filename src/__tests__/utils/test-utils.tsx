/**
 * Test Utilities for QuoteGen
 * Shared helpers and mocks for consistent testing
 */

import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

// ============================================================================
// Mock Setup
// ============================================================================

/**
 * Setup mocks for Next.js router
 */
export function setupNextRouterMocks(pathname = '/dashboard') {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockBack = jest.fn();
  const mockForward = jest.fn();
  const mockRefresh = jest.fn();
  const mockPrefetch = jest.fn();

  jest.mock('next/navigation', () => ({
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
      forward: mockForward,
      refresh: mockRefresh,
      prefetch: mockPrefetch,
    }),
    usePathname: () => pathname,
    useSearchParams: () => new URLSearchParams(),
  }));

  return {
    mockPush,
    mockReplace,
    mockBack,
    mockForward,
    mockRefresh,
    mockPrefetch,
  };
}

/**
 * Mock Supabase client
 */
export function createMockSupabaseClient() {
  const mockFrom = jest.fn();
  const mockSelect = jest.fn();
  const mockInsert = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockEq = jest.fn();
  const mockOrder = jest.fn();
  const mockRange = jest.fn();

  // Chain methods
  mockSelect.mockReturnValue({
    order: mockOrder,
    range: mockRange,
    eq: mockEq,
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: jest.fn().mockResolvedValue({ data: [], error: null }),
  });

  mockFrom.mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  });

  const mockAuth = {
    getSession: jest.fn().mockResolvedValue({
      data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } },
      error: null,
    }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
  };

  return {
    from: mockFrom,
    auth: mockAuth,
    mockFrom,
    mockSelect,
    mockInsert,
    mockUpdate,
    mockDelete,
    mockEq,
    mockOrder,
    mockRange,
  };
}

// ============================================================================
// Test Providers
// ============================================================================

interface TestProviderProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

/**
 * All-providers wrapper for tests
 */
export function AllProviders({ children, queryClient }: TestProviderProps) {
  const client = queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// ============================================================================
// Custom Render
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

/**
 * Custom render with all providers
 */
export function render(
  ui: React.ReactElement,
  { queryClient, ...options }: CustomRenderOptions = {}
) {
  return rtlRender(ui, {
    wrapper: (props) => <AllProviders {...props} queryClient={queryClient} />,
    ...options,
  });
}

// ============================================================================
// Test Data Factories
// ============================================================================

/**
 * Factory for creating test customers
 */
export function createCustomer(overrides: Partial<CustomerWithStats> = {}): CustomerWithStats {
  return {
    id: `customer-${Math.random().toString(36).substr(2, 9)}`,
    contactName: 'John Doe',
    companyName: 'Acme Corporation',
    email: 'john@acme.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
    status: 'active',
    tags: ['enterprise', 'vip'],
    notes: 'Important client',
    logoUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      totalQuotes: 10,
      acceptedQuotes: 5,
      declinedQuotes: 2,
      pendingQuotes: 3,
      totalRevenue: 50000,
      avgQuoteValue: 5000,
    },
    ...overrides,
  };
}

/**
 * Factory for creating test quotes
 */
export function createQuote(overrides: Partial<Quote> = {}): Quote {
  const now = new Date().toISOString();
  
  return {
    id: `quote-${Math.random().toString(36).substr(2, 9)}`,
    quoteNumber: `Q-${Date.now()}`,
    customerId: 'customer-123',
    customer: {
      id: 'customer-123',
      contactName: 'John Doe',
      companyName: 'Acme Corporation',
      email: 'john@acme.com',
    },
    title: 'Website Development Quote',
    description: 'Full website development project',
    status: 'draft',
    issueDate: now,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: 10000,
    taxRate: 0.1,
    taxAmount: 1000,
    total: 11000,
    currency: 'USD',
    notes: 'Payment terms: Net 30',
    terms: 'Standard terms apply',
    lineItems: [
      {
        id: 'item-1',
        description: 'Design',
        quantity: 1,
        unitPrice: 3000,
        discount: 0,
        total: 3000,
      },
      {
        id: 'item-2',
        description: 'Development',
        quantity: 1,
        unitPrice: 7000,
        discount: 0,
        total: 7000,
      },
    ],
    template: 'modern',
    createdAt: now,
    updatedAt: now,
    createdBy: 'user-123',
    ...overrides,
  };
}

/**
 * Factory for creating test stats
 */
export function createStats(overrides: Partial<DashboardStatsData> = {}): DashboardStatsData {
  return {
    totalQuotes: 150,
    pendingQuotes: 25,
    sentQuotes: 100,
    acceptedQuotes: 20,
    declinedQuotes: 5,
    totalRevenue: 150000,
    conversionRate: 20,
    averageQuoteValue: 1000,
    quoteChange: 12.5,
    revenueChange: 8.3,
    conversionChange: -2.1,
    ...overrides,
  };
}

// ============================================================================
// Type Imports (for reference)
// ============================================================================

// These would normally be imported from your types file
type CustomerStatus = 'active' | 'inactive' | 'archived';
type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CustomerStats {
  totalQuotes: number;
  acceptedQuotes: number;
  declinedQuotes: number;
  pendingQuotes: number;
  totalRevenue: number;
  avgQuoteValue: number;
}

interface CustomerWithStats {
  id: string;
  contactName: string;
  companyName: string;
  email: string;
  phone: string | null;
  address: CustomerAddress;
  status: CustomerStatus;
  tags: string[];
  notes: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  stats: CustomerStats;
}

interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface QuoteCustomer {
  id: string;
  contactName: string;
  companyName: string;
  email: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customer: QuoteCustomer;
  title: string;
  description: string;
  status: QuoteStatus;
  issueDate: string;
  expiryDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes: string;
  terms: string;
  lineItems: QuoteLineItem[];
  template: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface DashboardStatsData {
  totalQuotes: number;
  pendingQuotes: number;
  sentQuotes: number;
  acceptedQuotes: number;
  declinedQuotes?: number;
  totalRevenue: number;
  conversionRate: number;
  averageQuoteValue: number;
  quoteChange: number;
  revenueChange: number;
  conversionChange: number;
}

// ============================================================================
// Re-exports
// ============================================================================

export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
export { waitFor, within } from '@testing-library/react';
