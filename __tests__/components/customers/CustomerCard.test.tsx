/**
 * CustomerCard Component Tests
 * @module __tests__/components/customers/CustomerCard
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerCard } from '@/components/customers/CustomerCard';
import { CustomerStatus } from '@/types';
import type { CustomerWithStats } from '@/types/quote';

// Mock framer-motion (already mocked globally in jest.setup.tsx)

// ============================================================================
// Test Data
// ============================================================================

const mockCustomer: CustomerWithStats = {
  id: 'cust-1',
  email: 'john@example.com',
  companyName: 'Acme Corp',
  contactName: 'John Doe',
  phone: '+1 555-0123',
  status: CustomerStatus.ACTIVE,
  tags: ['vip', 'enterprise', 'priority'],
  billingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
  },
  shippingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
  },
  stats: {
    totalQuotes: 15,
    totalRevenue: 50000,
    conversionRate: 75.5,
    avgQuoteValue: 3333,
    pendingQuotes: 3,
    acceptedQuotes: 10,
    declinedQuotes: 2,
    expiredQuotes: 0,
  },
  recentActivity: [],
  quotesCount: 15,
  customerSince: new Date('2023-01-01'),
  lastQuoteDate: new Date('2024-01-15'),
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2024-01-15'),
  paymentTerms: 'Net 30',
  preferredCurrency: 'USD',
  notes: 'Important customer',
};

const inactiveCustomer: CustomerWithStats = {
  ...mockCustomer,
  id: 'cust-2',
  status: CustomerStatus.INACTIVE,
  contactName: 'Jane Smith',
  companyName: 'Beta Inc',
};

const archivedCustomer: CustomerWithStats = {
  ...mockCustomer,
  id: 'cust-3',
  status: CustomerStatus.ARCHIVED,
  contactName: 'Bob Wilson',
  companyName: 'Gamma Co',
};

const customerWithoutPhone: CustomerWithStats = {
  ...mockCustomer,
  id: 'cust-4',
  phone: undefined,
};

const customerWithoutAddress: CustomerWithStats = {
  ...mockCustomer,
  id: 'cust-5',
  billingAddress: undefined,
};

const customerWithManyTags: CustomerWithStats = {
  ...mockCustomer,
  id: 'cust-6',
  tags: ['vip', 'enterprise', 'priority', 'new', 'tech', 'healthcare'],
};

const customerWithNoTags: CustomerWithStats = {
  ...mockCustomer,
  id: 'cust-7',
  tags: [],
};

// ============================================================================
// Test Suite
// ============================================================================

describe('CustomerCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('rendering', () => {
    it('renders customer basic information correctly', () => {
      render(<CustomerCard customer={mockCustomer} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('renders customer contact information', () => {
      render(<CustomerCard customer={mockCustomer} />);

      expect(screen.getByText('+1 555-0123')).toBeInTheDocument();
    });

    it('renders customer address information', () => {
      render(<CustomerCard customer={mockCustomer} />);

      expect(screen.getByText(/New York, USA/)).toBeInTheDocument();
    });

    it('renders customer stats correctly', () => {
      render(<CustomerCard customer={mockCustomer} />);

      expect(screen.getByText('15')).toBeInTheDocument(); // totalQuotes
      expect(screen.getByText('76%')).toBeInTheDocument(); // conversionRate rounded
      expect(screen.getByText('$50.0k')).toBeInTheDocument(); // totalRevenue formatted
    });

    it('renders customer status badge', () => {
      render(<CustomerCard customer={mockCustomer} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders tags correctly', () => {
      render(<CustomerCard customer={mockCustomer} />);

      expect(screen.getByText('vip')).toBeInTheDocument();
      expect(screen.getByText('enterprise')).toBeInTheDocument();
      expect(screen.getByText('priority')).toBeInTheDocument();
    });

    it('renders "Added" timestamp', () => {
      render(<CustomerCard customer={mockCustomer} />);

      expect(screen.getByText(/Added/)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Status Variations
  // ==========================================================================

  describe('status variations', () => {
    it('renders active status correctly', () => {
      render(<CustomerCard customer={mockCustomer} />);

      const statusBadge = screen.getByText('Active');
      expect(statusBadge).toBeInTheDocument();
    });

    it('renders inactive status correctly', () => {
      render(<CustomerCard customer={inactiveCustomer} />);

      const statusBadge = screen.getByText('Inactive');
      expect(statusBadge).toBeInTheDocument();
    });

    it('renders archived status correctly', () => {
      render(<CustomerCard customer={archivedCustomer} />);

      const statusBadge = screen.getByText('Archived');
      expect(statusBadge).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Optional Data Handling
  // ==========================================================================

  describe('optional data handling', () => {
    it('handles missing phone number gracefully', () => {
      render(<CustomerCard customer={customerWithoutPhone} />);

      // Should render without phone but still show email
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.queryByText('+1 555-0123')).not.toBeInTheDocument();
    });

    it('handles missing address gracefully', () => {
      render(<CustomerCard customer={customerWithoutAddress} />);

      // Should render without address info but still show other details
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText(/New York, USA/)).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Tags Display
  // ==========================================================================

  describe('tags display', () => {
    it('shows limited tags when there are many', () => {
      render(<CustomerCard customer={customerWithManyTags} />);

      // Should show first 3 tags
      expect(screen.getByText('vip')).toBeInTheDocument();
      expect(screen.getByText('enterprise')).toBeInTheDocument();
      expect(screen.getByText('priority')).toBeInTheDocument();

      // Should show "+3" for remaining tags
      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it('handles empty tags array', () => {
      render(<CustomerCard customer={customerWithNoTags} />);

      // Should not render tags section - check for the tag container div
      const tagSection = document.querySelector('.flex-wrap.gap-1\\.5');
      expect(tagSection).toBeNull();
    });
  });

  // ==========================================================================
  // Interaction Tests
  // ==========================================================================

  describe('interactions', () => {
    it('calls onClick when card is clicked', () => {
      render(<CustomerCard customer={mockCustomer} onClick={mockOnClick} />);

      const card = screen.getByText('John Doe').closest('div');
      if (card) {
        fireEvent.click(card);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      }
    });

    it('does not throw when clicked without onClick handler', () => {
      render(<CustomerCard customer={mockCustomer} />);

      const card = screen.getByText('John Doe').closest('div');
      if (card) {
        expect(() => fireEvent.click(card)).not.toThrow();
      }
    });
  });

  // ==========================================================================
  // Custom ClassName
  // ==========================================================================

  describe('custom styling', () => {
    it('applies custom className when provided', () => {
      const customClass = 'my-custom-class';
      render(<CustomerCard customer={mockCustomer} className={customClass} />);

      // Check that custom class is applied to the card container
      const card = document.querySelector('.' + customClass);
      expect(card).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Stats Formatting
  // ==========================================================================

  describe('stats formatting', () => {
    it('formats large revenue values correctly', () => {
      const customerWithLargeRevenue: CustomerWithStats = {
        ...mockCustomer,
        stats: {
          ...mockCustomer.stats,
          totalRevenue: 150000,
        },
      };
      render(<CustomerCard customer={customerWithLargeRevenue} />);

      expect(screen.getByText('$150.0k')).toBeInTheDocument();
    });

    it('formats small revenue values correctly', () => {
      const customerWithSmallRevenue: CustomerWithStats = {
        ...mockCustomer,
        stats: {
          ...mockCustomer.stats,
          totalRevenue: 500,
        },
      };
      render(<CustomerCard customer={customerWithSmallRevenue} />);

      expect(screen.getByText('$0.5k')).toBeInTheDocument();
    });

    it('rounds conversion rate correctly', () => {
      const customerWithOddRate: CustomerWithStats = {
        ...mockCustomer,
        stats: {
          ...mockCustomer.stats,
          conversionRate: 66.66,
        },
      };
      render(<CustomerCard customer={customerWithOddRate} />);

      expect(screen.getByText('67%')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================

  describe('accessibility', () => {
    it('has proper semantic structure', () => {
      render(<CustomerCard customer={mockCustomer} />);

      // Check for heading element for customer name
      const nameHeading = screen.getByText('John Doe');
      expect(nameHeading.tagName.toLowerCase()).toBe('h3');
    });

    it('renders clickable card with cursor-pointer', () => {
      render(<CustomerCard customer={mockCustomer} onClick={mockOnClick} />);

      // Find the clickable card by looking for the element with cursor-pointer class
      const card = document.querySelector('.cursor-pointer');
      expect(card).toBeInTheDocument();
    });
  });
});
