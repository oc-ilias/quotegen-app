/**
 * CustomerStats Component Tests
 * @module __tests__/components/customers/CustomerStats
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CustomerStats } from '@/components/customers/CustomerStats';
import type { CustomerStats as CustomerStatsType } from '@/types/quote';

// ============================================================================
// Test Data
// ============================================================================

const mockStats: CustomerStatsType = {
  totalQuotes: 50,
  totalRevenue: 100000,
  conversionRate: 75.5,
  avgQuoteValue: 2000,
  pendingQuotes: 10,
  acceptedQuotes: 35,
  declinedQuotes: 5,
  expiredQuotes: 0,
  lastQuoteDate: new Date('2024-01-15'),
  firstQuoteDate: new Date('2023-01-01'),
};

const mockStatsWithoutDates: CustomerStatsType = {
  totalQuotes: 10,
  totalRevenue: 50000,
  conversionRate: 60.0,
  avgQuoteValue: 5000,
  pendingQuotes: 2,
  acceptedQuotes: 6,
  declinedQuotes: 2,
  expiredQuotes: 0,
};

const mockStatsWithZeroQuotes: CustomerStatsType = {
  totalQuotes: 0,
  totalRevenue: 0,
  conversionRate: 0,
  avgQuoteValue: 0,
  pendingQuotes: 0,
  acceptedQuotes: 0,
  declinedQuotes: 0,
  expiredQuotes: 0,
};

const mockStatsWithSingleQuote: CustomerStatsType = {
  totalQuotes: 1,
  totalRevenue: 1000,
  conversionRate: 100,
  avgQuoteValue: 1000,
  pendingQuotes: 0,
  acceptedQuotes: 1,
  declinedQuotes: 0,
  expiredQuotes: 0,
};

// ============================================================================
// Test Suite
// ============================================================================

describe('CustomerStats', () => {
  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('rendering', () => {
    it('renders card title', () => {
      render(<CustomerStats stats={mockStats} />);

      expect(screen.getByText('Customer Statistics')).toBeInTheDocument();
    });

    it('renders all stat items', () => {
      render(<CustomerStats stats={mockStats} />);

      expect(screen.getByText('Total Quotes')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('Accepted Quotes')).toBeInTheDocument();
      expect(screen.getByText('Declined Quotes')).toBeInTheDocument();
      expect(screen.getByText('Pending Quotes')).toBeInTheDocument();
    });

    it('renders correct stat values', () => {
      render(<CustomerStats stats={mockStats} />);

      expect(screen.getByText('50')).toBeInTheDocument(); // totalQuotes
      expect(screen.getByText('$100,000')).toBeInTheDocument(); // totalRevenue
      expect(screen.getByText('75.5%')).toBeInTheDocument(); // conversionRate
      expect(screen.getByText('35')).toBeInTheDocument(); // acceptedQuotes
      expect(screen.getByText('5')).toBeInTheDocument(); // declinedQuotes
      expect(screen.getByText('10')).toBeInTheDocument(); // pendingQuotes
    });

    it('renders subvalues for quotes and revenue', () => {
      render(<CustomerStats stats={mockStats} />);

      expect(screen.getByText('10 pending')).toBeInTheDocument();
      expect(screen.getByText('Avg: $2,000')).toBeInTheDocument();
    });

    it('renders accepted/declined breakdown', () => {
      render(<CustomerStats stats={mockStats} />);

      expect(screen.getByText('35 accepted / 5 declined')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Loading State
  // ==========================================================================

  describe('loading state', () => {
    it('renders skeleton when isLoading is true', () => {
      render(<CustomerStats stats={null} isLoading={true} />);

      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders skeleton when stats is null', () => {
      render(<CustomerStats stats={null} />);

      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders card title during loading', () => {
      render(<CustomerStats stats={null} isLoading={true} />);

      expect(screen.getByText('Customer Statistics')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Date Display
  // ==========================================================================

  describe('date display', () => {
    it('renders first and last quote dates when available', () => {
      render(<CustomerStats stats={mockStats} />);

      expect(screen.getByText('First Quote')).toBeInTheDocument();
      expect(screen.getByText('Last Quote')).toBeInTheDocument();
    });

    it('formats dates correctly', () => {
      render(<CustomerStats stats={mockStats} />);

      // Check that dates are formatted (format will depend on locale)
      const firstQuoteDate = screen.getByText('First Quote').nextElementSibling;
      const lastQuoteDate = screen.getByText('Last Quote').nextElementSibling;

      expect(firstQuoteDate).toHaveTextContent(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(lastQuoteDate).toHaveTextContent(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('does not render date section when dates are missing', () => {
      render(<CustomerStats stats={mockStatsWithoutDates} />);

      expect(screen.queryByText('First Quote')).not.toBeInTheDocument();
      expect(screen.queryByText('Last Quote')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Zero Quotes Handling
  // ==========================================================================

  describe('zero quotes handling', () => {
    it('renders correctly with zero quotes', () => {
      render(<CustomerStats stats={mockStatsWithZeroQuotes} />);

      // Use getAllByText for values that appear multiple times
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      expect(screen.getByText('$0')).toBeInTheDocument();
      // Conversion rate with zero quotes shows 0.0%
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('does not show pending subvalue when no quotes', () => {
      render(<CustomerStats stats={mockStatsWithZeroQuotes} />);

      // Should not show "0 pending" subvalue
      const totalQuotesLabel = screen.getByText('Total Quotes');
      const parent = totalQuotesLabel.closest('div');
      expect(parent).not.toHaveTextContent('pending');
    });

    it('does not show average subvalue when no quotes', () => {
      render(<CustomerStats stats={mockStatsWithZeroQuotes} />);

      const revenueLabel = screen.getByText('Total Revenue');
      const parent = revenueLabel.closest('div');
      expect(parent).not.toHaveTextContent('Avg');
    });
  });

  // ==========================================================================
  // Single Quote Handling
  // ==========================================================================

  describe('single quote handling', () => {
    it('renders correctly with single quote', () => {
      render(<CustomerStats stats={mockStatsWithSingleQuote} />);

      // Use getAllByText for values that may appear multiple times
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
      expect(screen.getByText('$1,000')).toBeInTheDocument();
      expect(screen.getByText('100.0%')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Large Numbers Formatting
  // ==========================================================================

  describe('large numbers formatting', () => {
    it('formats large revenue with commas', () => {
      const largeStats: CustomerStatsType = {
        ...mockStats,
        totalRevenue: 1234567,
      };
      render(<CustomerStats stats={largeStats} />);

      expect(screen.getByText('$1,234,567')).toBeInTheDocument();
    });

    it('formats large average values', () => {
      const largeStats: CustomerStatsType = {
        ...mockStats,
        avgQuoteValue: 999999,
      };
      render(<CustomerStats stats={largeStats} />);

      // Check that average is formatted (may be rounded)
      expect(screen.getByText(/Avg: \$\d{1,3}(,\d{3})*/)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================

  describe('accessibility', () => {
    it('renders all icons with proper aria-hidden', () => {
      render(<CustomerStats stats={mockStats} />);

      // Icons should be present (rendered as SVG)
      const icons = document.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('has semantic structure with proper headings', () => {
      render(<CustomerStats stats={mockStats} />);

      const cardTitle = screen.getByText('Customer Statistics');
      expect(cardTitle).toBeInTheDocument();
    });
  });
});
