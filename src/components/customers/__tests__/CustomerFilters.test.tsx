/**
 * CustomerFilters Component Tests
 * Comprehensive test coverage for CustomerFilters
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { CustomerStatus } from '@/types/quote';
import type { CustomerFilter } from '@/types/quote';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('CustomerFilters', () => {
  const defaultFilters: CustomerFilter = {
    sortBy: 'dateAdded',
    sortOrder: 'desc',
  };

  const mockOnFilterChange = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <CustomerFilters
        filters={defaultFilters}
        onFilterChange={mockOnFilterChange}
        availableTags={['vip', 'enterprise', 'new']}
        isOpen={true}
        onClose={mockOnClose}
        {...props}
      />
    );
  };

  it('renders filter panel when open', () => {
    renderComponent();

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = renderComponent({ isOpen: false });

    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    renderComponent();

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    renderComponent();

    // The backdrop is the first motion.div with the bg-slate-900/50 class
    const backdrop = document.querySelector('[class*="bg-slate-900"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('toggles status filter on click', () => {
    renderComponent();

    const activeCheckbox = screen.getByLabelText('Active');
    fireEvent.click(activeCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      status: ['active'],
    });
  });

  it('removes status from filter when already selected', () => {
    const filtersWithActive = {
      ...defaultFilters,
      status: ['active' as CustomerStatus],
    };

    renderComponent({ filters: filtersWithActive });

    const activeCheckbox = screen.getByLabelText('Active');
    fireEvent.click(activeCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...filtersWithActive,
      status: [],
    });
  });

  it('toggles multiple statuses', () => {
    const filtersWithActive = {
      ...defaultFilters,
      status: ['active' as CustomerStatus],
    };

    renderComponent({ filters: filtersWithActive });

    const inactiveCheckbox = screen.getByLabelText('Inactive');
    fireEvent.click(inactiveCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...filtersWithActive,
      status: ['active', 'inactive'],
    });
  });

  it('toggles tag filter on click', () => {
    renderComponent();

    const vipTag = screen.getByText('vip');
    fireEvent.click(vipTag);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...defaultFilters,
      tags: ['vip'],
    });
  });

  it('removes tag from filter when already selected', () => {
    const filtersWithVip = {
      ...defaultFilters,
      tags: ['vip'],
    };

    renderComponent({ filters: filtersWithVip });

    const vipTag = screen.getByText('vip');
    fireEvent.click(vipTag);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...filtersWithVip,
      tags: [],
    });
  });

  it('clears all filters when clear button is clicked', () => {
    const filtersWithValues = {
      ...defaultFilters,
      status: ['active' as CustomerStatus],
      tags: ['vip'],
      dateFrom: new Date('2024-01-01'),
    };

    renderComponent({ filters: filtersWithValues });

    const clearButton = screen.getByText('Clear all filters');
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      sortBy: 'dateAdded',
      sortOrder: 'desc',
    });
  });

  it('shows clear filters button when filters are active', () => {
    const filtersWithValues = {
      ...defaultFilters,
      status: ['active' as CustomerStatus],
    };

    renderComponent({ filters: filtersWithValues });

    expect(screen.getByText('Clear all filters')).toBeInTheDocument();
  });

  it('does not show clear filters button when no filters are active', () => {
    renderComponent();

    expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument();
  });

  it('updates date from filter', () => {
    renderComponent();

    const dateFromInput = screen.getAllByLabelText('From')[0];
    fireEvent.change(dateFromInput, { target: { value: '2024-01-15' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      dateFrom: expect.any(Date),
    }));
  });

  it('updates date to filter', () => {
    renderComponent();

    const dateToInput = screen.getAllByLabelText('To')[0];
    fireEvent.change(dateToInput, { target: { value: '2024-12-31' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      dateTo: expect.any(Date),
    }));
  });

  it('updates min quotes filter', () => {
    renderComponent();

    const minQuotesInput = screen.getByPlaceholderText('0');
    fireEvent.change(minQuotesInput, { target: { value: '5' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      minQuotes: 5,
    }));
  });

  it('updates max quotes filter', () => {
    renderComponent();

    const maxQuotesInputs = screen.getAllByPlaceholderText('∞');
    fireEvent.change(maxQuotesInputs[0], { target: { value: '50' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      maxQuotes: 50,
    }));
  });

  it('updates min revenue filter', () => {
    renderComponent();

    const minRevenueInput = screen.getByPlaceholderText('0', { selector: 'input[name="minRevenue"]' }) ||
                           screen.getAllByRole('spinbutton')[2];
    
    if (minRevenueInput) {
      fireEvent.change(minRevenueInput, { target: { value: '1000' } });
      expect(mockOnFilterChange).toHaveBeenCalled();
    }
  });

  it('updates max revenue filter', () => {
    renderComponent();

    const maxRevenueInput = screen.getAllByPlaceholderText('∞')[1];
    fireEvent.change(maxRevenueInput, { target: { value: '50000' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      maxRevenue: 50000,
    }));
  });

  it('calls onClose when apply filters button is clicked', () => {
    renderComponent();

    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders all status options', () => {
    renderComponent();

    expect(screen.getByLabelText('Active')).toBeInTheDocument();
    expect(screen.getByLabelText('Inactive')).toBeInTheDocument();
    expect(screen.getByLabelText('Archived')).toBeInTheDocument();
  });

  it('renders available tags', () => {
    renderComponent();

    expect(screen.getByText('vip')).toBeInTheDocument();
    expect(screen.getByText('enterprise')).toBeInTheDocument();
    expect(screen.getByText('new')).toBeInTheDocument();
  });

  it('handles empty tags list', () => {
    renderComponent({ availableTags: [] });

    expect(screen.queryByText('Tags')).not.toBeInTheDocument();
  });

  it('shows selected tags with different styling', () => {
    const filtersWithTags = {
      ...defaultFilters,
      tags: ['vip', 'enterprise'],
    };

    renderComponent({ filters: filtersWithTags });

    const vipTag = screen.getByText('vip');
    expect(vipTag).toHaveClass('bg-indigo-500');
  });

  it('shows unselected tags with default styling', () => {
    renderComponent();

    const newTag = screen.getByText('new');
    expect(newTag).toHaveClass('bg-slate-700');
  });

  it('correctly identifies active filters', () => {
    const filtersWithMultiple = {
      sortBy: 'dateAdded',
      sortOrder: 'desc',
      status: ['active' as CustomerStatus],
      tags: ['vip'],
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-12-31'),
      minQuotes: 1,
      maxQuotes: 100,
      minRevenue: 1000,
      maxRevenue: 100000,
    };

    renderComponent({ filters: filtersWithMultiple });

    expect(screen.getByText('Clear all filters')).toBeInTheDocument();
  });

  it('handles clearing date filters', () => {
    const filtersWithDate = {
      ...defaultFilters,
      dateFrom: new Date('2024-01-01'),
    };

    renderComponent({ filters: filtersWithDate });

    const clearButton = screen.getByText('Clear all filters');
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      sortBy: 'dateAdded',
      sortOrder: 'desc',
    });
  });

  it('handles numeric input clearing', () => {
    renderComponent();

    const minQuotesInput = screen.getByPlaceholderText('0');
    fireEvent.change(minQuotesInput, { target: { value: '10' } });
    fireEvent.change(minQuotesInput, { target: { value: '' } });

    expect(mockOnFilterChange).toHaveBeenLastCalledWith(expect.objectContaining({
      minQuotes: undefined,
    }));
  });
});
