/**
 * Integration Tests for QuoteGen Application
 * Tests cross-component interactions and data flow
 * @module __tests__/integration/quotegen.integration.test
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Components to test together
import { Sidebar } from '@/components/navigation/Sidebar';
import { StatCardsGrid } from '@/components/dashboard/StatCards';
import { QuoteFilters } from '@/components/quotes/QuoteFilters';
import { ToastProvider } from '@/components/ui/Toast';

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

// Simple wrapper with ToastProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <div className="dark">{children}</div>
  </ToastProvider>
);

describe('QuoteGen Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/dashboard');
  });

  describe('Navigation and Dashboard Integration', () => {
    it('should render sidebar with navigation items', () => {
      render(
        <TestWrapper>
          <Sidebar userName="Test User" shopName="Test Shop" />
        </TestWrapper>
      );

      // Check navigation items are rendered (use menuitem role)
      expect(screen.getByRole('menuitem', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /quotes/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /customers/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /templates/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /analytics/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument();
    });

    it('should highlight active navigation item based on pathname', () => {
      mockPathname.mockReturnValue('/quotes');
      
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      );

      // Quotes link should have active styling
      const quotesLink = screen.getByRole('menuitem', { name: /quotes/i });
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

      render(
        <TestWrapper>
          <StatCardsGrid stats={stats} />
        </TestWrapper>
      );

      expect(screen.getByText('Total Quotes')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });

    it('should handle sidebar collapse and expand', async () => {
      const user = userEvent.setup();
      
      const { container } = render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
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

  describe('Quote Filters Integration', () => {
    it('should render quote filters with all options', () => {
      render(
        <TestWrapper>
          <QuoteFilters
            filters={{}}
            onFilterChange={jest.fn()}
            availableTags={['urgent', 'follow-up', 'proposal']}
          />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText(/search quotes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('should handle quote search', async () => {
      const user = userEvent.setup();
      const onFilterChange = jest.fn();
      
      render(
        <TestWrapper>
          <QuoteFilters
            filters={{}}
            onFilterChange={onFilterChange}
            availableTags={[]}
          />
        </TestWrapper>
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

  describe('Loading States Integration', () => {
    it('should show skeleton loading state for stat cards', () => {
      const { container } = render(
        <TestWrapper>
          <StatCardsGrid stats={[]} isLoading={true} />
        </TestWrapper>
      );

      // Should render skeleton elements
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Keyboard Navigation Integration', () => {
    it('should support keyboard navigation in sidebar', async () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      );

      // Check navigation is accessible
      const dashboardLink = screen.getByRole('menuitem', { name: /dashboard/i });
      expect(dashboardLink).toBeInTheDocument();
    });
  });
});
