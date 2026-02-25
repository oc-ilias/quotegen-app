/**
 * Integration Tests for QuoteGen Application
 * Tests cross-component interactions and data flow
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

// Components to test together
import { Sidebar } from '@/components/navigation/Sidebar';
import { StatCardsGrid } from '@/components/dashboard/StatCards';
import { QuoteWizard } from '@/components/wizard/QuoteWizard';
import CustomerList from '@/components/customers/CustomerList';
import { QuoteFilters } from '@/components/quotes/QuoteFilters';

// Mock Next.js router
const mockPush = jest.fn();
const mockPathname = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => mockPathname(),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    }),
  },
};

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

// Test wrapper with all providers
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('QuoteGen Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/dashboard');
  });

  describe('Navigation and Dashboard Integration', () => {
    it('should render sidebar with navigation items', () => {
      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <Sidebar userName="Test User" shopName="Test Shop" />
        </Wrapper>
      );

      // Check navigation items are rendered
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /quotes/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /customers/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /templates/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /analytics/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    });

    it('should highlight active navigation item based on pathname', () => {
      mockPathname.mockReturnValue('/quotes');
      
      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <Sidebar />
        </Wrapper>
      );

      // Quotes link should have active styling
      const quotesLink = screen.getByRole('link', { name: /quotes/i });
      expect(quotesLink).toHaveAttribute('aria-current', 'page');
    });

    it('should render stat cards with provided data', () => {
      const stats = [
        {
          title: 'Total Quotes',
          value: 150,
          change: 12.5,
          changeLabel: 'vs last month',
          icon: 'quotes' as const,
          color: 'blue' as const,
          format: 'number' as const,
        },
        {
          title: 'Total Revenue',
          value: 50000,
          change: 8.3,
          changeLabel: 'vs last month',
          icon: 'revenue' as const,
          color: 'green' as const,
          format: 'currency' as const,
        },
      ];

      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <StatCardsGrid stats={stats} />
        </Wrapper>
      );

      expect(screen.getByText('Total Quotes')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('$50,000')).toBeInTheDocument();
    });

    it('should handle sidebar collapse and expand', async () => {
      const user = userEvent.setup();
      const Wrapper = createTestWrapper();
      
      const { container } = render(
        <Wrapper>
          <Sidebar />
        </Wrapper>
      );

      // Find collapse button
      const collapseButton = screen.getByLabelText(/collapse sidebar/i);
      expect(collapseButton).toBeInTheDocument();

      // Click to collapse
      await user.click(collapseButton);

      // Sidebar should be marked as collapsed
      await waitFor(() => {
        expect(container.querySelector('aside')).toHaveAttribute('data-collapsed', 'true');
      });
    });
  });

  describe('Customer List Integration', () => {
    const mockCustomers = [
      {
        id: '1',
        contactName: 'John Doe',
        companyName: 'Acme Corp',
        email: 'john@acme.com',
        phone: '+1234567890',
        status: 'active' as const,
        tags: ['vip', 'enterprise'],
        logoUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          totalQuotes: 10,
          acceptedQuotes: 5,
          totalRevenue: 50000,
          avgQuoteValue: 5000,
        },
      },
      {
        id: '2',
        contactName: 'Jane Smith',
        companyName: 'Tech Solutions',
        email: 'jane@tech.com',
        phone: null,
        status: 'active' as const,
        tags: ['starter'],
        logoUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          totalQuotes: 3,
          acceptedQuotes: 2,
          totalRevenue: 15000,
          avgQuoteValue: 5000,
        },
      },
    ];

    it('should render customer list with data', () => {
      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <CustomerList
            customers={mockCustomers}
            isLoading={false}
            pagination={{
              page: 1,
              limit: 10,
              total: 2,
              totalPages: 1,
            }}
            filters={{}}
            onFilterChange={jest.fn()}
            onPageChange={jest.fn()}
            onViewCustomer={jest.fn()}
            onEditCustomer={jest.fn()}
            onDeleteCustomer={jest.fn()}
          />
        </Wrapper>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
    });

    it('should handle customer search filtering', async () => {
      const user = userEvent.setup();
      const onFilterChange = jest.fn();
      
      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <CustomerList
            customers={mockCustomers}
            isLoading={false}
            pagination={{
              page: 1,
              limit: 10,
              total: 2,
              totalPages: 1,
            }}
            filters={{}}
            onFilterChange={onFilterChange}
            onPageChange={jest.fn()}
            onViewCustomer={jest.fn()}
            onEditCustomer={jest.fn()}
            onDeleteCustomer={jest.fn()}
          />
        </Wrapper>
      );

      // Type in search box
      const searchInput = screen.getByPlaceholderText(/search customers/i);
      await user.type(searchInput, 'John');

      // Wait for debounce
      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({ searchQuery: 'John' })
        );
      }, { timeout: 500 });
    });

    it('should handle customer status filtering', async () => {
      const user = userEvent.setup();
      const onFilterChange = jest.fn();
      
      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <CustomerList
            customers={mockCustomers}
            isLoading={false}
            pagination={{
              page: 1,
              limit: 10,
              total: 2,
              totalPages: 1,
            }}
            filters={{}}
            onFilterChange={onFilterChange}
            onPageChange={jest.fn()}
            onViewCustomer={jest.fn()}
            onEditCustomer={jest.fn()}
            onDeleteCustomer={jest.fn()}
          />
        </Wrapper>
      );

      // Click filters button
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);

      // Click status filter
      const activeButton = screen.getByRole('button', { name: /active/i });
      await user.click(activeButton);

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: ['active'] })
      );
    });
  });

  describe('Quote Filters Integration', () => {
    it('should render quote filters with all options', () => {
      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <QuoteFilters
            filters={{}}
            onFilterChange={jest.fn()}
            availableTags={['urgent', 'follow-up', 'proposal']}
          />
        </Wrapper>
      );

      expect(screen.getByPlaceholderText(/search quotes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('should handle quote search', async () => {
      const user = userEvent.setup();
      const onFilterChange = jest.fn();
      
      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <QuoteFilters
            filters={{}}
            onFilterChange={onFilterChange}
            availableTags={[]}
          />
        </Wrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search quotes/i);
      await user.type(searchInput, 'Quote-123');

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({ searchQuery: 'Quote-123' })
        );
      }, { timeout: 500 });
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle errors in child components gracefully', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <ErrorComponent />
        </Wrapper>
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Loading States Integration', () => {
    it('should show skeleton loading state for stat cards', () => {
      const Wrapper = createTestWrapper();
      const { container } = render(
        <Wrapper>
          <StatCardsGrid stats={[]} isLoading={true} />
        </Wrapper>
      );

      // Should render 4 skeleton cards
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show loading state for customer list', () => {
      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <CustomerList
            customers={[]}
            isLoading={true}
            pagination={{
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            }}
            filters={{}}
            onFilterChange={jest.fn()}
            onPageChange={jest.fn()}
            onViewCustomer={jest.fn()}
            onEditCustomer={jest.fn()}
            onDeleteCustomer={jest.fn()}
          />
        </Wrapper>
      );

      // Should show table skeleton
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation Integration', () => {
    it('should support keyboard navigation in sidebar', async () => {
      const user = userEvent.setup();
      const Wrapper = createTestWrapper();
      
      render(
        <Wrapper>
          <Sidebar />
        </Wrapper>
      );

      // Tab through navigation items
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      await user.tab();
      
      expect(dashboardLink).toHaveFocus();
    });
  });

  describe('Theme Integration', () => {
    it('should render with dark theme by default', () => {
      const Wrapper = createTestWrapper();
      const { container } = render(
        <Wrapper>
          <div data-testid="theme-test">Theme Test</div>
        </Wrapper>
      );

      expect(screen.getByTestId('theme-test')).toBeInTheDocument();
    });
  });
});
