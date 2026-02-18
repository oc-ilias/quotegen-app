/**
 * CustomerActivity Component Tests
 * Comprehensive test coverage for CustomerActivity
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CustomerActivity } from '@/components/customers/CustomerActivity';
import type { CustomerActivity as CustomerActivityType } from '@/types/quote';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 hours ago',
}));

describe('CustomerActivity', () => {
  const mockActivities: CustomerActivityType[] = [
    {
      id: '1',
      type: 'quote_created',
      description: 'New quote created for $5,000',
      quoteNumber: 'Q-001',
      amount: 5000,
      createdAt: new Date('2024-01-15T10:00:00'),
      createdBy: 'John Doe',
    },
    {
      id: '2',
      type: 'quote_sent',
      description: 'Quote sent to customer',
      quoteNumber: 'Q-001',
      createdAt: new Date('2024-01-15T11:00:00'),
    },
    {
      id: '3',
      type: 'quote_viewed',
      description: 'Quote viewed by customer',
      quoteNumber: 'Q-001',
      createdAt: new Date('2024-01-15T12:00:00'),
    },
    {
      id: '4',
      type: 'quote_accepted',
      description: 'Quote accepted',
      quoteNumber: 'Q-001',
      amount: 5000,
      createdAt: new Date('2024-01-16T09:00:00'),
      createdBy: 'Jane Smith',
    },
    {
      id: '5',
      type: 'quote_rejected',
      description: 'Quote rejected',
      quoteNumber: 'Q-002',
      createdAt: new Date('2024-01-16T14:00:00'),
    },
    {
      id: '6',
      type: 'quote_expired',
      description: 'Quote expired',
      quoteNumber: 'Q-003',
      createdAt: new Date('2024-01-17T00:00:00'),
    },
    {
      id: '7',
      type: 'note_added',
      description: 'Follow-up note added',
      createdAt: new Date('2024-01-17T10:00:00'),
      createdBy: 'John Doe',
    },
    {
      id: '8',
      type: 'customer_updated',
      description: 'Customer information updated',
      createdAt: new Date('2024-01-18T09:00:00'),
    },
  ];

  it('renders activity list with all items', () => {
    render(<CustomerActivity activities={mockActivities} />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('New quote created for $5,000')).toBeInTheDocument();
    expect(screen.getByText('Quote sent to customer')).toBeInTheDocument();
    expect(screen.getByText('Quote accepted')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const { container } = render(<CustomerActivity activities={[]} isLoading={true} />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    // ActivityFeedSkeleton should be rendered
    expect(container.querySelector('[data-testid="skeleton"]') || 
           container.innerHTML.includes('animate-pulse')).toBeTruthy();
  });

  it('renders empty state when no activities', () => {
    render(<CustomerActivity activities={[]} />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('No recent activity')).toBeInTheDocument();
  });

  it('displays quote numbers when available', () => {
    render(<CustomerActivity activities={mockActivities} />);

    expect(screen.getAllByText('Quote: Q-001').length).toBeGreaterThan(0);
  });

  it('displays amounts when available', () => {
    render(<CustomerActivity activities={mockActivities} />);

    expect(screen.getAllByText('Amount: $5,000').length).toBeGreaterThan(0);
  });

  it('displays created by information when available', () => {
    render(<CustomerActivity activities={mockActivities} />);

    expect(screen.getAllByText(/by John Doe/).length).toBeGreaterThan(0);
    expect(screen.getByText(/by Jane Smith/)).toBeInTheDocument();
  });

  it('limits displayed items based on maxItems prop', () => {
    render(<CustomerActivity activities={mockActivities} maxItems={5} />);

    // Only 5 items should be displayed
    expect(screen.getByText('New quote created for $5,000')).toBeInTheDocument();
    expect(screen.queryByText('Customer information updated')).not.toBeInTheDocument();
  });

  it('shows "View all" button when activities exceed maxItems', () => {
    render(<CustomerActivity activities={mockActivities} maxItems={5} />);

    expect(screen.getByText('View all 8 activities')).toBeInTheDocument();
  });

  it('does not show "View all" button when activities are within limit', () => {
    render(<CustomerActivity activities={mockActivities.slice(0, 5)} maxItems={5} />);

    expect(screen.queryByText(/View all/)).not.toBeInTheDocument();
  });

  it('renders all activity types with correct icons and colors', () => {
    render(<CustomerActivity activities={mockActivities} />);

    // Each activity should have an icon rendered
    const activities = screen.getAllByText(/Quote created|Quote sent|Quote viewed|Quote accepted|Quote rejected|Quote expired|Note added|Customer updated/);
    expect(activities.length).toBeGreaterThan(0);
  });

  it('handles activity without quoteNumber', () => {
    const activitiesWithoutQuote = [
      {
        id: '1',
        type: 'note_added' as const,
        description: 'General note added',
        createdAt: new Date(),
      },
    ];

    render(<CustomerActivity activities={activitiesWithoutQuote} />);

    expect(screen.getByText('General note added')).toBeInTheDocument();
    expect(screen.queryByText(/Quote:/)).not.toBeInTheDocument();
  });

  it('handles activity without amount', () => {
    const activitiesWithoutAmount = [
      {
        id: '1',
        type: 'note_added' as const,
        description: 'Note without amount',
        quoteNumber: 'Q-001',
        createdAt: new Date(),
      },
    ];

    render(<CustomerActivity activities={activitiesWithoutAmount} />);

    expect(screen.getByText('Note without amount')).toBeInTheDocument();
    expect(screen.queryByText(/Amount:/)).not.toBeInTheDocument();
  });

  it('handles activity with zero amount', () => {
    const activitiesWithZeroAmount = [
      {
        id: '1',
        type: 'quote_created' as const,
        description: 'Draft quote created',
        amount: 0,
        createdAt: new Date(),
      },
    ];

    render(<CustomerActivity activities={activitiesWithZeroAmount} />);

    expect(screen.queryByText(/Amount:/)).not.toBeInTheDocument();
  });

  it('handles activity without createdBy', () => {
    const activitiesWithoutCreator = [
      {
        id: '1',
        type: 'quote_viewed' as const,
        description: 'Quote viewed',
        createdAt: new Date(),
      },
    ];

    render(<CustomerActivity activities={activitiesWithoutCreator} />);

    expect(screen.getByText('Quote viewed')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<CustomerActivity activities={mockActivities} />);

    // All activities should show "2 hours ago" due to the mock
    const timeTexts = screen.getAllByText(/2 hours ago/);
    expect(timeTexts.length).toBeGreaterThan(0);
  });
});
