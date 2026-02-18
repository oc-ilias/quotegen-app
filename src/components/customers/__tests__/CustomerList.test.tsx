/**
 * CustomerList Component Tests
 * Comprehensive test coverage for CustomerList
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CustomerList } from '@/components/customers/CustomerList';
import { CustomerStatus } from '@/types/quote';
import type { CustomerWithStats, CustomerFilter } from '@/types/quote';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    tr: ({ children, ...props }: { children: React.ReactNode }) => <tr {...props}>{children}</tr>,
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: { children: React.ReactNode }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 days ago',
}));

// Mock toast helpers
jest.mock('@/components/ui/Toast', () => ({
  useToastHelpers: () => ({
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('CustomerList', () => {
  const mockCustomers: CustomerWithStats[] = [
    {
      id: '1',
      email: 'john@example.com',
      companyName: 'Acme Corp',
      contactName: 'John Doe',
      phone: '+1234567890',
      status: CustomerStatus.ACTIVE,
      customerSince: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      tags: ['vip', 'enterprise'],
      stats: {
        totalQuotes: 10,
        totalRevenue: 50000,
        avgQuoteValue: 5000,
        acceptedQuotes: 6,
        declinedQuotes: 2,
        pendingQuotes: 2,
        conversionRate: 60,
      },
    },
    {
      id: '2',
      email: 'jane@example.com',
      companyName: 'Tech Inc',
      contactName: 'Jane Smith',
      phone: '+0987654321',
      status: CustomerStatus.INACTIVE,
      customerSince: new Date('2023-06-01'),
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2024-01-10'),
      tags: ['new'],
      stats: {
        totalQuotes: 5,
        totalRevenue: 15000,
        avgQuoteValue: 3000,
        acceptedQuotes: 3,
        declinedQuotes: 1,
        pendingQuotes: 1,
        conversionRate: 60,
      },
    },
  ];

  const defaultFilters: CustomerFilter = {
    sortBy: 'dateAdded',
    sortOrder: 'desc',
  };

  const defaultPagination = {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
  };

  const mockProps = {
    customers: mockCustomers,
    isLoading: false,
    pagination: defaultPagination,
    filters: defaultFilters,
    onFilterChange: jest.fn(),
    onPageChange: jest.fn(),
    onViewCustomer: jest.fn(),
    onEditCustomer: jest.fn(),
    onDeleteCustomer: jest.fn(),
    availableTags: ['vip', 'enterprise', 'new'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders customer list with data', () => {
    render(<CustomerList {...mockProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Tech Inc')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<CustomerList {...mockProps} />);

    expect(screen.getByPlaceholderText(/Search customers/)).toBeInTheDocument();
  });

  it('handles search input change with debounce', async () => {
    render(<CustomerList {...mockProps} />);

    const searchInput = screen.getByPlaceholderText(/Search customers/);
    
    fireEvent.change(searchInput, { target: { value: 'john' } });

    // Wait for debounce
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockProps.onFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        searchQuery: 'john',
      });
    });
  });

  it('renders filters button', () => {
    render(<CustomerList {...mockProps} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('toggles filters panel on button click', () => {
    render(<CustomerList {...mockProps} />);

    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);

    // Filters panel should be visible - look for Status filter label in the filters section
    const filterSection = document.querySelector('[data-testid="filters-panel"]') || 
                         document.querySelector('.filters-panel') ||
                         screen.getAllByText('Status')[0];
    expect(filterSection).toBeTruthy();
  });

  it('renders status filter buttons', () => {
    render(<CustomerList {...mockProps} />);

    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);

    // Get all "Active" elements and verify at least one exists
    const activeElements = screen.getAllByText('Active');
    expect(activeElements.length).toBeGreaterThanOrEqual(1);
    
    const inactiveElements = screen.getAllByText('Inactive');
    expect(inactiveElements.length).toBeGreaterThanOrEqual(1);
    
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('toggles status filter', () => {
    render(<CustomerList {...mockProps} />);

    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);

    const activeButton = screen.getByText('Active');
    fireEvent.click(activeButton);

    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      status: ['active'],
    });
  });

  it('renders tags filter buttons', () => {
    render(<CustomerList {...mockProps} />);

    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);

    expect(screen.getByText('vip')).toBeInTheDocument();
    expect(screen.getByText('enterprise')).toBeInTheDocument();
    expect(screen.getByText('new')).toBeInTheDocument();
  });

  it('toggles tag filter', () => {
    render(<CustomerList {...mockProps} />);

    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);

    const vipButton = screen.getByText('vip');
    fireEvent.click(vipButton);

    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      tags: ['vip'],
    });
  });

  it('clears all filters', () => {
    const propsWithFilters = {
      ...mockProps,
      filters: {
        ...defaultFilters,
        status: ['active' as CustomerStatus],
        tags: ['vip'],
      },
    };

    render(<CustomerList {...propsWithFilters} />);

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      sortBy: 'dateAdded',
      sortOrder: 'desc',
    });
  });

  it('shows clear button when filters are active', () => {
    const propsWithFilters = {
      ...mockProps,
      filters: {
        ...defaultFilters,
        status: ['active' as CustomerStatus],
      },
    };

    render(<CustomerList {...propsWithFilters} />);

    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('shows filter count badge', () => {
    const propsWithFilters = {
      ...mockProps,
      filters: {
        ...defaultFilters,
        status: ['active' as CustomerStatus],
        tags: ['vip'],
      },
    };

    render(<CustomerList {...propsWithFilters} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles pagination - previous button', () => {
    const propsWithPage2 = {
      ...mockProps,
      pagination: {
        ...defaultPagination,
        page: 2,
        totalPages: 3,
      },
    };

    render(<CustomerList {...propsWithPage2} />);

    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);

    expect(mockProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it('handles pagination - next button', () => {
    const propsWithPage1 = {
      ...mockProps,
      pagination: {
        ...defaultPagination,
        page: 1,
        totalPages: 3,
      },
    };

    render(<CustomerList {...propsWithPage1} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(mockProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(<CustomerList {...mockProps} />);

    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    const propsWithLastPage = {
      ...mockProps,
      pagination: {
        ...defaultPagination,
        page: 3,
        totalPages: 3,
      },
    };

    render(<CustomerList {...propsWithLastPage} />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('handles sort by clicking column headers', () => {
    render(<CustomerList {...mockProps} />);

    const nameHeader = screen.getByText('Customer');
    fireEvent.click(nameHeader);

    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  });

  it('toggles sort order on repeated clicks', () => {
    const propsWithNameSort = {
      ...mockProps,
      filters: {
        ...defaultFilters,
        sortBy: 'name',
        sortOrder: 'asc' as const,
      },
    };

    render(<CustomerList {...propsWithNameSort} />);

    const nameHeader = screen.getByText('Customer');
    fireEvent.click(nameHeader);

    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      ...propsWithNameSort.filters,
      sortOrder: 'desc',
    });
  });

  it('renders empty state when no customers', () => {
    const propsWithNoCustomers = {
      ...mockProps,
      customers: [],
      pagination: {
        ...defaultPagination,
        total: 0,
      },
    };

    render(<CustomerList {...propsWithNoCustomers} />);

    expect(screen.getByText('No customers found')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first customer')).toBeInTheDocument();
  });

  it('renders empty state with filter message when filters are active', () => {
    const propsWithFiltersNoResults = {
      ...mockProps,
      customers: [],
      pagination: {
        ...defaultPagination,
        total: 0,
      },
      filters: {
        ...defaultFilters,
        status: ['active' as CustomerStatus],
      },
    };

    render(<CustomerList {...propsWithFiltersNoResults} />);

    expect(screen.getByText('No customers found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters to see more results')).toBeInTheDocument();
  });

  it('shows clear filters button in empty state when filters are active', () => {
    const propsWithFiltersNoResults = {
      ...mockProps,
      customers: [],
      pagination: {
        ...defaultPagination,
        total: 0,
      },
      filters: {
        ...defaultFilters,
        status: ['active' as CustomerStatus],
      },
    };

    render(<CustomerList {...propsWithFiltersNoResults} />);

    const clearButton = screen.getAllByText('Clear Filters')[0];
    expect(clearButton).toBeInTheDocument();
  });

  it('handles view customer click', () => {
    render(<CustomerList {...mockProps} />);

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    expect(mockProps.onViewCustomer).toHaveBeenCalledWith('1');
  });

  it('handles edit customer click', () => {
    render(<CustomerList {...mockProps} />);

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(mockProps.onEditCustomer).toHaveBeenCalledWith(mockCustomers[0]);
  });

  it('handles delete customer click', () => {
    render(<CustomerList {...mockProps} />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockProps.onDeleteCustomer).toHaveBeenCalledWith(mockCustomers[0]);
  });

  it('shows pagination info', () => {
    const propsWithMultiplePages = {
      ...mockProps,
      pagination: {
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    };

    render(<CustomerList {...propsWithMultiplePages} />);

    expect(screen.getByText(/Showing 11 - 20 of 25 customers/)).toBeInTheDocument();
  });

  it('renders customer stats correctly', () => {
    render(<CustomerList {...mockProps} />);

    expect(screen.getByText('10')).toBeInTheDocument(); // Total quotes
    expect(screen.getByText('$50,000')).toBeInTheDocument(); // Revenue
  });

  it('renders customer without phone', () => {
    const customersWithoutPhone = [
      { ...mockCustomers[0], phone: undefined },
    ];

    render(<CustomerList {...mockProps} customers={customersWithoutPhone} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
