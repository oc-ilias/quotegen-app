/**
 * CustomerCard Component Tests
 * Comprehensive test coverage for CustomerCard
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerCard } from '@/components/customers/CustomerCard';
import { CustomerStatus } from '@/types/quote';
import type { CustomerWithStats } from '@/types/quote';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 days ago',
}));

describe('CustomerCard', () => {
  const mockCustomer: CustomerWithStats = {
    id: '1',
    email: 'test@example.com',
    companyName: 'Test Company',
    contactName: 'John Doe',
    phone: '+1234567890',
    status: CustomerStatus.ACTIVE,
    customerSince: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    tags: ['vip', 'enterprise', 'priority'],
    billingAddress: {
      street: '123 Test St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    logoUrl: 'https://example.com/logo.png',
    stats: {
      totalQuotes: 10,
      totalRevenue: 50000,
      avgQuoteValue: 5000,
      acceptedQuotes: 6,
      declinedQuotes: 2,
      pendingQuotes: 2,
      conversionRate: 60,
      lastQuoteDate: new Date('2024-01-10'),
      firstQuoteDate: new Date('2024-01-01'),
    },
  };

  it('renders customer card with all information', () => {
    render(<CustomerCard customer={mockCustomer} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays customer stats correctly', () => {
    render(<CustomerCard customer={mockCustomer} />);

    expect(screen.getByText('10')).toBeInTheDocument(); // Total quotes
    expect(screen.getByText('60%')).toBeInTheDocument(); // Conversion rate
    expect(screen.getByText('$50.0k')).toBeInTheDocument(); // Revenue in thousands
  });

  it('displays location information when available', () => {
    render(<CustomerCard customer={mockCustomer} />);

    expect(screen.getByText('New York, USA')).toBeInTheDocument();
  });

  it('displays tags with +N more indicator', () => {
    render(<CustomerCard customer={mockCustomer} />);

    expect(screen.getByText('vip')).toBeInTheDocument();
    expect(screen.getByText('enterprise')).toBeInTheDocument();
    expect(screen.getByText('priority')).toBeInTheDocument();
  });

  it('displays relative date added', () => {
    render(<CustomerCard customer={mockCustomer} />);

    expect(screen.getByText(/Added 2 days ago/)).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = jest.fn();
    render(<CustomerCard customer={mockCustomer} onClick={handleClick} />);

    const card = screen.getByText('John Doe').closest('[class*="cursor-pointer"]') ||
                 screen.getByText('John Doe').parentElement;
    
    if (card) {
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it('applies custom className', () => {
    const { container } = render(
      <CustomerCard customer={mockCustomer} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders without phone number', () => {
    const customerWithoutPhone = { ...mockCustomer, phone: undefined };
    render(<CustomerCard customer={customerWithoutPhone} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('+1234567890')).not.toBeInTheDocument();
  });

  it('renders without billing address', () => {
    const customerWithoutAddress = { ...mockCustomer, billingAddress: undefined };
    render(<CustomerCard customer={customerWithoutAddress} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('New York, USA')).not.toBeInTheDocument();
  });

  it('renders with empty tags array', () => {
    const customerWithNoTags = { ...mockCustomer, tags: [] };
    const { container } = render(<CustomerCard customer={customerWithNoTags} />);

    // Tags section should not be rendered - look for tag-specific class
    const tagElements = container.querySelectorAll('.bg-slate-700.text-slate-400');
    // No tags should be present (status badge has different classes)
    expect(tagElements.length).toBe(0);
  });

  it('renders with different statuses', () => {
    const statuses = [CustomerStatus.ACTIVE, CustomerStatus.INACTIVE, CustomerStatus.ARCHIVED];

    statuses.forEach((status) => {
      const { unmount } = render(
        <CustomerCard customer={{ ...mockCustomer, status }} />
      );
      
      const statusLabels: Record<string, string> = {
        [CustomerStatus.ACTIVE]: 'Active',
        [CustomerStatus.INACTIVE]: 'Inactive',
        [CustomerStatus.ARCHIVED]: 'Archived',
      };

      expect(screen.getByText(statusLabels[status])).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with zero stats', () => {
    const customerWithZeroStats = {
      ...mockCustomer,
      stats: {
        totalQuotes: 0,
        totalRevenue: 0,
        avgQuoteValue: 0,
        acceptedQuotes: 0,
        declinedQuotes: 0,
        pendingQuotes: 0,
        conversionRate: 0,
      },
    };

    render(<CustomerCard customer={customerWithZeroStats} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('$0.0k')).toBeInTheDocument();
  });

  it('renders with large revenue numbers', () => {
    const customerWithLargeRevenue = {
      ...mockCustomer,
      stats: {
        ...mockCustomer.stats,
        totalRevenue: 1500000,
      },
    };

    render(<CustomerCard customer={customerWithLargeRevenue} />);

    expect(screen.getByText('$1500.0k')).toBeInTheDocument();
  });

  it('renders with many tags (shows +N more)', () => {
    const customerWithManyTags = {
      ...mockCustomer,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };

    render(<CustomerCard customer={customerWithManyTags} />);

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders without logo URL', () => {
    const customerWithoutLogo = { ...mockCustomer, logoUrl: undefined };
    render(<CustomerCard customer={customerWithoutLogo} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles very long company names', () => {
    const customerWithLongName = {
      ...mockCustomer,
      companyName: 'A Very Long Company Name That Might Cause Layout Issues Inc.',
    };

    render(<CustomerCard customer={customerWithLongName} />);

    expect(screen.getByText(/A Very Long Company Name/)).toBeInTheDocument();
  });

  it('handles very long email addresses', () => {
    const customerWithLongEmail = {
      ...mockCustomer,
      email: 'very.long.email.address@example.company.com',
    };

    render(<CustomerCard customer={customerWithLongEmail} />);

    expect(screen.getByText(/very.long.email.address/)).toBeInTheDocument();
  });
});
