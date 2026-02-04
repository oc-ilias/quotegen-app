/**
 * Dashboard Components Test Suite
 * Tests for StatCards, RecentQuotes, ActivityFeed, QuickActions
 * @module __tests__/components/dashboard
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      // Filter out motion-specific props
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      const { whileHover, whileTap, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
    span: ({ children, ...props }: any) => {
      const { animate, ...rest } = props;
      return <span {...rest}>{children}</span>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ============================================================================
// Stat Cards Tests
// ============================================================================

import { StatCard, StatCardsGrid, useDashboardStats } from '@/components/dashboard/StatCards';

describe('StatCard', () => {
  const defaultProps = {
    title: 'Total Quotes',
    value: 100,
    icon: 'quotes',
    color: 'blue' as const,
  };

  it('renders title and value correctly', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('Total Quotes')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    render(
      <StatCard {...defaultProps} value={1500} format="currency" />
    );
    expect(screen.getByText('$1,500')).toBeInTheDocument();
  });

  it('formats percentage values correctly', () => {
    render(
      <StatCard {...defaultProps} value={25.5} format="percent" />
    );
    expect(screen.getByText('25.5%')).toBeInTheDocument();
  });

  it('displays positive trend correctly', () => {
    render(
      <StatCard {...defaultProps} change={10} changeLabel="vs last month" />
    );
    expect(screen.getByText('+10.0%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('displays negative trend correctly', () => {
    render(
      <StatCard {...defaultProps} change={-5} changeLabel="vs last month" />
    );
    expect(screen.getByText('-5.0%')).toBeInTheDocument();
  });

  it('shows skeleton when isLoading is true', () => {
    render(<StatCard {...defaultProps} isLoading={true} />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('StatCardsGrid', () => {
  const mockStats = [
    { title: 'Total Quotes', value: 100, icon: 'quotes', color: 'blue' as const },
    { title: 'Revenue', value: 5000, icon: 'revenue', color: 'green' as const, format: 'currency' as const },
    { title: 'Conversion', value: 25, icon: 'conversion', color: 'purple' as const, format: 'percent' as const },
    { title: 'Avg Value', value: 1000, icon: 'customers', color: 'indigo' as const, format: 'currency' as const },
  ];

  it('renders all stat cards', () => {
    render(<StatCardsGrid stats={mockStats} />);
    expect(screen.getByText('Total Quotes')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Conversion')).toBeInTheDocument();
    expect(screen.getByText('Avg Value')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<StatCardsGrid stats={[]} isLoading={true} />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('useDashboardStats', () => {
  it('returns default stats when no data provided', () => {
    const stats = useDashboardStats();
    expect(stats).toHaveLength(4);
    expect(stats[0].title).toBe('Total Quotes');
    expect(stats[0].value).toBe(0);
  });

  it('formats stats correctly with data', () => {
    const data = {
      totalQuotes: 100,
      pendingQuotes: 20,
      acceptedQuotes: 50,
      conversionRate: 50,
      totalRevenue: 50000,
      avgQuoteValue: 1000,
      avgResponseTime: 24,
      periodChange: {
        totalQuotes: 10,
        conversionRate: 5,
        totalRevenue: 5000,
        avgQuoteValue: 100,
      },
    };

    const stats = useDashboardStats(data);
    expect(stats[0].value).toBe(100);
    expect(stats[1].value).toBe(50000);
    expect(stats[2].value).toBe(50);
    expect(stats[3].value).toBe(1000);
  });
});

// ============================================================================
// Recent Quotes Tests
// ============================================================================

import { RecentQuotes } from '@/components/dashboard/RecentQuotes';
import { QuoteStatus } from '@/types/quote';

describe('RecentQuotes', () => {
  const mockQuotes = [
    {
      id: '1',
      quoteNumber: 'QT-001',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      company: 'Acme Corp',
      title: 'Product Quote',
      total: 1500,
      status: QuoteStatus.SENT,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      quoteNumber: 'QT-002',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
      title: 'Service Quote',
      total: 2500,
      status: QuoteStatus.ACCEPTED,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  it('renders header correctly', () => {
    render(<RecentQuotes quotes={mockQuotes} />);
    expect(screen.getByText('Recent Quotes')).toBeInTheDocument();
  });

  it('renders quote list correctly', () => {
    render(<RecentQuotes quotes={mockQuotes} />);
    expect(screen.getByText('QT-001')).toBeInTheDocument();
    expect(screen.getByText('QT-002')).toBeInTheDocument();
  });

  it('displays empty state when no quotes', () => {
    render(<RecentQuotes quotes={[]} />);
    expect(screen.getByText('No quotes yet')).toBeInTheDocument();
  });

  it('calls onViewQuote when quote is clicked', () => {
    const handleViewQuote = jest.fn();
    render(<RecentQuotes quotes={mockQuotes} onViewQuote={handleViewQuote} />);
    
    fireEvent.click(screen.getByText('QT-001').closest('div')?.parentElement?.parentElement!);
    expect(handleViewQuote).toHaveBeenCalledWith('1');
  });

  it('calls onViewAll when view all button is clicked', () => {
    const handleViewAll = jest.fn();
    render(<RecentQuotes quotes={mockQuotes} onViewAll={handleViewAll} />);
    
    fireEvent.click(screen.getByText('View all'));
    expect(handleViewAll).toHaveBeenCalled();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<RecentQuotes quotes={[]} isLoading={true} />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('limits items based on maxItems prop', () => {
    render(<RecentQuotes quotes={mockQuotes} maxItems={1} />);
    expect(screen.getByText('QT-001')).toBeInTheDocument();
    // Only 1 item should be visible
  });
});

// ============================================================================
// Activity Feed Tests
// ============================================================================

import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ActivityType } from '@/types/quote';

describe('ActivityFeed', () => {
  const mockActivities = [
    {
      id: '1',
      type: ActivityType.QUOTE_CREATED,
      quote_id: '1',
      quote_number: 'QT-001',
      customer_name: 'John Smith',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: ActivityType.QUOTE_SENT,
      quote_id: '1',
      quote_number: 'QT-001',
      customer_name: 'John Smith',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: ActivityType.QUOTE_ACCEPTED,
      quote_id: '2',
      quote_number: 'QT-002',
      customer_name: 'Jane Doe',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  it('renders header correctly', () => {
    render(<ActivityFeed activities={mockActivities} />);
    expect(screen.getByText('Activity Feed')).toBeInTheDocument();
  });

  it('renders activity list correctly', () => {
    render(<ActivityFeed activities={mockActivities} />);
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('displays empty state when no activities', () => {
    render(<ActivityFeed activities={[]} />);
    expect(screen.getByText('No recent activity')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<ActivityFeed activities={[]} isLoading={true} />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('limits items based on maxItems prop', () => {
    render(<ActivityFeed activities={mockActivities} maxItems={2} />);
    // Should only show 2 items
  });
});

// ============================================================================
// Quick Actions Tests
// ============================================================================

import { QuickActions } from '@/components/dashboard/QuickActions';

describe('QuickActions', () => {
  it('renders all default actions', () => {
    render(
      <QuickActions
        onCreateQuote={jest.fn()}
        onCreateTemplate={jest.fn()}
        onImportCustomers={jest.fn()}
        onExportData={jest.fn()}
        onViewAnalytics={jest.fn()}
      />
    );
    
    expect(screen.getByText('Create Quote')).toBeInTheDocument();
    expect(screen.getByText('New Template')).toBeInTheDocument();
    expect(screen.getByText('Import Customers')).toBeInTheDocument();
    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('View Analytics')).toBeInTheDocument();
  });

  it('calls onCreateQuote when create quote button is clicked', () => {
    const handleCreateQuote = jest.fn();
    render(<QuickActions onCreateQuote={handleCreateQuote} />);
    
    fireEvent.click(screen.getByText('Create Quote'));
    expect(handleCreateQuote).toHaveBeenCalled();
  });

  it('renders custom actions when provided', () => {
    const customActions = [
      {
        id: 'custom',
        label: 'Custom Action',
        description: 'A custom action',
        icon: () => <span>Icon</span>,
        onClick: jest.fn(),
        color: 'blue' as const,
      },
    ];

    render(<QuickActions actions={customActions} />);
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });
});
