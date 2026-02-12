/**
 * Customer Components Test Suite - Simplified
 * Tests for CustomerCard, CustomerStats with proper mocks
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { CustomerCard } from '@/components/customers/CustomerCard';
import { CustomerStats } from '@/components/customers/CustomerStats';
import { CustomerStatus } from '@/types';
import { CustomerWithStats } from '@/types/quote';

const mockCustomer: CustomerWithStats = {
  id: 'cust-1',
  email: 'john@example.com',
  companyName: 'Acme Corp',
  contactName: 'John Doe',
  phone: '+1 555-0123',
  status: CustomerStatus.ACTIVE,
  tags: ['vip', 'enterprise'],
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
    averageQuoteValue: 3333,
    pendingQuotes: 3,
    acceptedQuotes: 10,
    expiredQuotes: 2,
  },
  customerSince: new Date('2023-01-01'),
  lastQuoteDate: new Date('2024-01-15'),
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2024-01-15'),
  paymentTerms: 'Net 30',
  preferredCurrency: 'USD',
  notes: 'Important customer',
};

describe('CustomerCard', () => {
  it('renders customer information correctly', () => {
    render(<CustomerCard customer={mockCustomer} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays customer status badge', () => {
    render(<CustomerCard customer={mockCustomer} />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows stats correctly', () => {
    render(<CustomerCard customer={mockCustomer} />);
    
    expect(screen.getByText('15')).toBeInTheDocument(); // totalQuotes
    expect(screen.getByText('76%')).toBeInTheDocument(); // conversionRate rounded
    expect(screen.getByText('$50.0k')).toBeInTheDocument(); // totalRevenue
  });

  it('displays tags', () => {
    render(<CustomerCard customer={mockCustomer} />);
    
    expect(screen.getByText('vip')).toBeInTheDocument();
    expect(screen.getByText('enterprise')).toBeInTheDocument();
  });

  it('displays customer phone number', () => {
    render(<CustomerCard customer={mockCustomer} />);
    
    expect(screen.getByText('+1 555-0123')).toBeInTheDocument();
  });

  it('displays customer address', () => {
    render(<CustomerCard customer={mockCustomer} />);
    
    expect(screen.getByText(/New York, USA/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<CustomerCard customer={mockCustomer} onClick={onClick} />);
    
    const card = screen.getByText('John Doe').closest('div');
    if (card) {
      card.click();
      expect(onClick).toHaveBeenCalled();
    }
  });

  it('renders inactive status correctly', () => {
    const inactiveCustomer = { ...mockCustomer, status: CustomerStatus.INACTIVE };
    render(<CustomerCard customer={inactiveCustomer} />);
    
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});

describe('CustomerStats', () => {
  const mockStats = {
    totalQuotes: 50,
    totalRevenue: 100000,
    conversionRate: 75.5,
    averageQuoteValue: 2000,
    pendingQuotes: 10,
    acceptedQuotes: 35,
    declinedQuotes: 5,
    expiredQuotes: 0,
  };

  it('renders all stat cards', () => {
    render(<CustomerStats stats={mockStats} />);
    
    expect(screen.getByText('50')).toBeInTheDocument(); // totalQuotes
    expect(screen.getByText('35')).toBeInTheDocument(); // acceptedQuotes
  });

  it('displays formatted revenue', () => {
    render(<CustomerStats stats={mockStats} />);
    
    expect(screen.getByText('$100,000')).toBeInTheDocument();
  });

  it('displays conversion rate', () => {
    render(<CustomerStats stats={mockStats} />);
    
    expect(screen.getByText('75.5%')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<CustomerStats stats={null} isLoading={true} />);
    
    expect(document.querySelector('[data-testid="skeleton"]') || document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('Customer Components Integration', () => {
  it('renders multiple customer cards', () => {
    const customers = [
      mockCustomer,
      { ...mockCustomer, id: 'cust-2', companyName: 'Beta Inc', contactName: 'Jane Smith' },
      { ...mockCustomer, id: 'cust-3', companyName: 'Gamma Co', contactName: 'Bob Wilson' },
    ];
    
    render(
      <div>
        {customers.map(c => (
          <CustomerCard key={c.id} customer={c} />
        ))}
      </div>
    );
    
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Beta Inc')).toBeInTheDocument();
    expect(screen.getByText('Gamma Co')).toBeInTheDocument();
  });
});
