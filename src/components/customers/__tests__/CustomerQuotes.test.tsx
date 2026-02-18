/**
 * CustomerQuotes Component Tests
 * Comprehensive test coverage for CustomerQuotes
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerQuotes } from '@/components/customers/CustomerQuotes';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 days ago',
}));

describe('CustomerQuotes', () => {
  const mockQuotes = [
    {
      id: '1',
      quoteNumber: 'Q-001',
      title: 'Product A Quote',
      status: 'accepted' as const,
      total: 5000,
      createdAt: '2024-01-15T10:00:00',
      updatedAt: '2024-01-16T10:00:00',
    },
    {
      id: '2',
      quoteNumber: 'Q-002',
      title: 'Product B Quote',
      status: 'pending' as const,
      total: 3000,
      createdAt: '2024-01-14T10:00:00',
      updatedAt: '2024-01-14T10:00:00',
    },
    {
      id: '3',
      quoteNumber: 'Q-003',
      title: 'Product C Quote',
      status: 'rejected' as const,
      total: 7500,
      createdAt: '2024-01-13T10:00:00',
      updatedAt: '2024-01-13T10:00:00',
    },
  ];

  it('renders quote list with data', () => {
    render(<CustomerQuotes quotes={mockQuotes} />);

    expect(screen.getByText('Quote History')).toBeInTheDocument();
    // Check for quotes count text using regex to handle dynamic content
    expect(screen.getByText(/3\s+quotes?\s+created/)).toBeInTheDocument();
    expect(screen.getByText('Q-001')).toBeInTheDocument();
    expect(screen.getByText('Q-002')).toBeInTheDocument();
    expect(screen.getByText('Q-003')).toBeInTheDocument();
  });

  it('renders quote titles', () => {
    render(<CustomerQuotes quotes={mockQuotes} />);

    expect(screen.getByText('Product A Quote')).toBeInTheDocument();
    expect(screen.getByText('Product B Quote')).toBeInTheDocument();
  });

  it('renders quote totals', () => {
    render(<CustomerQuotes quotes={mockQuotes} />);

    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('$3,000')).toBeInTheDocument();
    expect(screen.getByText('$7,500')).toBeInTheDocument();
  });

  it('renders status badges', () => {
    render(<CustomerQuotes quotes={mockQuotes} />);

    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const { container } = render(<CustomerQuotes quotes={[]} isLoading={true} />);

    expect(screen.getByText('Quote History')).toBeInTheDocument();
    // TableSkeleton should be rendered
    expect(container.innerHTML.includes('animate-pulse') || 
           container.querySelector('[data-testid="skeleton"]')).toBeTruthy();
  });

  it('renders empty state when no quotes', () => {
    render(<CustomerQuotes quotes={[]} />);

    expect(screen.getByText('Quote History')).toBeInTheDocument();
    expect(screen.getByText('No quotes have been created for this customer yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first quote for this customer')).toBeInTheDocument();
    expect(screen.getByText('Create Quote')).toBeInTheDocument();
  });

  it('calls onViewQuote when quote is clicked', () => {
    const handleViewQuote = jest.fn();
    render(<CustomerQuotes quotes={mockQuotes} onViewQuote={handleViewQuote} />);

    const quoteElements = screen.getAllByText(/Q-00/);
    fireEvent.click(quoteElements[0]);

    expect(handleViewQuote).toHaveBeenCalledWith('1');
  });

  it('calls onViewAll when View All button is clicked', () => {
    const handleViewAll = jest.fn();
    render(<CustomerQuotes quotes={mockQuotes} onViewAll={handleViewAll} />);

    const viewAllButton = screen.getByText('View All');
    fireEvent.click(viewAllButton);

    expect(handleViewAll).toHaveBeenCalledTimes(1);
  });

  it('does not show View All button when onViewAll is not provided', () => {
    render(<CustomerQuotes quotes={mockQuotes} />);

    expect(screen.queryByText('View All')).not.toBeInTheDocument();
  });

  it('renders with single quote', () => {
    render(<CustomerQuotes quotes={[mockQuotes[0]]} />);

    expect(screen.getByText(/1\s+quotes?\s+created/)).toBeInTheDocument();
    expect(screen.getByText('Q-001')).toBeInTheDocument();
  });

  it('renders large quote numbers correctly', () => {
    const largeQuotes = [
      {
        id: '1',
        quoteNumber: 'Q-99999',
        title: 'Large Quote',
        status: 'accepted' as const,
        total: 1000000,
        createdAt: '2024-01-15T10:00:00',
        updatedAt: '2024-01-16T10:00:00',
      },
    ];

    render(<CustomerQuotes quotes={largeQuotes} />);

    expect(screen.getByText('Q-99999')).toBeInTheDocument();
    expect(screen.getByText('$1,000,000')).toBeInTheDocument();
  });

  it('renders quotes with different statuses', () => {
    const statusQuotes = [
      { ...mockQuotes[0], status: 'draft' as const },
      { ...mockQuotes[0], status: 'sent' as const },
      { ...mockQuotes[0], status: 'viewed' as const },
      { ...mockQuotes[0], status: 'expired' as const },
      { ...mockQuotes[0], status: 'converted' as const },
    ];

    render(<CustomerQuotes quotes={statusQuotes} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Sent')).toBeInTheDocument();
    expect(screen.getByText('Viewed')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();
    expect(screen.getByText('Converted')).toBeInTheDocument();
  });

  it('handles very long quote titles', () => {
    const longTitleQuotes = [
      {
        ...mockQuotes[0],
        title: 'This is a very long quote title that might need to be truncated in the UI',
      },
    ];

    render(<CustomerQuotes quotes={longTitleQuotes} />);

    expect(screen.getByText(/This is a very long quote title/)).toBeInTheDocument();
  });
});
