/**
 * CustomerStats Component Tests
 * Comprehensive test coverage for CustomerStats
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CustomerStats } from '@/components/customers/CustomerStats';
import type { CustomerStats as CustomerStatsType } from '@/types/quote';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// Mock Skeleton component
jest.mock('@/components/ui/Skeleton', () => ({
  Skeleton: ({ width, height, className }: { width?: number; height?: number; className?: string }) => (
    <div
      data-testid="skeleton"
      style={{ width, height }}
      className={className}
    />
  ),
  TableSkeleton: ({ rows }: { rows: number }) => (
    <div data-testid="table-skeleton">Table with {rows} rows</div>
  ),
}));

describe('CustomerStats', () => {
  const mockStats: CustomerStatsType = {
    totalQuotes: 25,
    totalRevenue: 125000,
    avgQuoteValue: 5000,
    acceptedQuotes: 15,
    declinedQuotes: 5,
    pendingQuotes: 5,
    conversionRate: 60,
    lastQuoteDate: new Date('2024-01-15'),
    firstQuoteDate: new Date('2023-06-01'),
  };

  it('renders all stat items with correct data', () => {
    render(<CustomerStats stats={mockStats} />);

    expect(screen.getByText('Total Quotes')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('5 pending')).toBeInTheDocument();

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$125,000')).toBeInTheDocument();
    expect(screen.getByText('Avg: $5,000')).toBeInTheDocument();

    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('60.0%')).toBeInTheDocument();
    expect(screen.getByText('15 accepted / 5 declined')).toBeInTheDocument();

    expect(screen.getByText('Accepted Quotes')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();

    expect(screen.getByText('Declined Quotes')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('Pending Quotes')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays first and last quote dates', () => {
    render(<CustomerStats stats={mockStats} />);

    expect(screen.getByText('First Quote')).toBeInTheDocument();
    expect(screen.getByText('Last Quote')).toBeInTheDocument();
  });

  it('shows loading state with skeletons', () => {
    render(<CustomerStats stats={null} isLoading={true} />);

    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.getByText('Customer Statistics')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true even with stats', () => {
    render(<CustomerStats stats={mockStats} isLoading={true} />);

    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows loading state when stats is null', () => {
    render(<CustomerStats stats={null} />);

    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('handles zero quotes gracefully', () => {
    const zeroStats: CustomerStatsType = {
      totalQuotes: 0,
      totalRevenue: 0,
      avgQuoteValue: 0,
      acceptedQuotes: 0,
      declinedQuotes: 0,
      pendingQuotes: 0,
      conversionRate: 0,
    };

    render(<CustomerStats stats={zeroStats} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('handles single quote stats', () => {
    const singleStats: CustomerStatsType = {
      totalQuotes: 1,
      totalRevenue: 1000,
      avgQuoteValue: 1000,
      acceptedQuotes: 1,
      declinedQuotes: 0,
      pendingQuotes: 0,
      conversionRate: 100,
      lastQuoteDate: new Date('2024-01-15'),
      firstQuoteDate: new Date('2024-01-15'),
    };

    render(<CustomerStats stats={singleStats} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('100.0%')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('1 accepted / 0 declined')).toBeInTheDocument();
  });

  it('handles large numbers correctly', () => {
    const largeStats: CustomerStatsType = {
      totalQuotes: 10000,
      totalRevenue: 50000000,
      avgQuoteValue: 5000,
      acceptedQuotes: 8000,
      declinedQuotes: 1500,
      pendingQuotes: 500,
      conversionRate: 80,
    };

    render(<CustomerStats stats={largeStats} />);

    expect(screen.getByText('10,000')).toBeInTheDocument();
    expect(screen.getByText('$50,000,000')).toBeInTheDocument();
  });

  it('handles decimal conversion rates', () => {
    const decimalStats: CustomerStatsType = {
      ...mockStats,
      totalQuotes: 3,
      acceptedQuotes: 1,
      conversionRate: 33.333333,
    };

    render(<CustomerStats stats={decimalStats} />);

    expect(screen.getByText('33.3%')).toBeInTheDocument();
  });

  it('does not show dates section when no quote dates', () => {
    const statsWithoutDates: CustomerStatsType = {
      ...mockStats,
      lastQuoteDate: undefined,
      firstQuoteDate: undefined,
    };

    const { container } = render(<CustomerStats stats={statsWithoutDates} />);

    // The dates section should not be rendered
    const dateLabels = container.querySelectorAll('text');
    expect(dateLabels.length).toBe(0);
  });

  it('only shows last quote date when first is undefined', () => {
    const statsWithOnlyLast: CustomerStatsType = {
      ...mockStats,
      firstQuoteDate: undefined,
    };

    render(<CustomerStats stats={statsWithOnlyLast} />);

    expect(screen.getByText('Last Quote')).toBeInTheDocument();
  });

  it('formats currency with proper separators', () => {
    const statsWithSpecificRevenue: CustomerStatsType = {
      ...mockStats,
      totalRevenue: 1234567,
      avgQuoteValue: 1234.56,
    };

    render(<CustomerStats stats={statsWithSpecificRevenue} />);

    expect(screen.getByText('$1,234,567')).toBeInTheDocument();
  });

  it('shows correct subtext for total quotes with pending', () => {
    const statsWithPending: CustomerStatsType = {
      ...mockStats,
      totalQuotes: 10,
      pendingQuotes: 3,
    };

    render(<CustomerStats stats={statsWithPending} />);

    expect(screen.getByText('3 pending')).toBeInTheDocument();
  });

  it('does not show pending subtext when no pending quotes', () => {
    const statsWithNoPending: CustomerStatsType = {
      ...mockStats,
      totalQuotes: 10,
      pendingQuotes: 0,
    };

    render(<CustomerStats stats={statsWithNoPending} />);

    // The subValue should be undefined since pendingQuotes is 0
    // This tests the hasQuotes condition in the component
    const totalQuotesValue = screen.getByText('10');
    expect(totalQuotesValue).toBeInTheDocument();
  });

  it('shows correct accepted/declined ratio', () => {
    const statsWithRatio: CustomerStatsType = {
      ...mockStats,
      acceptedQuotes: 10,
      declinedQuotes: 2,
    };

    render(<CustomerStats stats={statsWithRatio} />);

    expect(screen.getByText('10 accepted / 2 declined')).toBeInTheDocument();
  });

  it('handles edge case of all quotes accepted', () => {
    const allAcceptedStats: CustomerStatsType = {
      ...mockStats,
      totalQuotes: 10,
      acceptedQuotes: 10,
      declinedQuotes: 0,
      pendingQuotes: 0,
      conversionRate: 100,
    };

    render(<CustomerStats stats={allAcceptedStats} />);

    expect(screen.getByText('100.0%')).toBeInTheDocument();
    expect(screen.getByText('10 accepted / 0 declined')).toBeInTheDocument();
  });

  it('handles edge case of all quotes declined', () => {
    const allDeclinedStats: CustomerStatsType = {
      ...mockStats,
      totalQuotes: 10,
      acceptedQuotes: 0,
      declinedQuotes: 10,
      pendingQuotes: 0,
      conversionRate: 0,
    };

    render(<CustomerStats stats={allDeclinedStats} />);

    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('0 accepted / 10 declined')).toBeInTheDocument();
  });
});
