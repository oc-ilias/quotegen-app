/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuoteFilters } from '@/components/quotes/QuoteFilters';

const mockFilters = {
  status: '',
  dateRange: '',
  customer: '',
  search: '',
  minAmount: '',
  maxAmount: '',
};

const mockOnFilterChange = jest.fn();
const mockOnReset = jest.fn();

describe('QuoteFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByText(/Filters/i)).toBeInTheDocument();
  });

  it('displays status filter dropdown', () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
  });

  it('displays date range filter', () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByLabelText(/Date Range/i)).toBeInTheDocument();
  });

  it('displays search input', () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
  });

  it('displays amount range inputs', () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByLabelText(/Min Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Amount/i)).toBeInTheDocument();
  });

  it('calls onFilterChange when status is changed', () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    const statusSelect = screen.getByLabelText(/Status/i);
    fireEvent.change(statusSelect, { target: { value: 'accepted' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('status', 'accepted');
  });

  it('calls onFilterChange when search input changes', async () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(searchInput, { target: { value: 'Test Customer' } });
    
    // Debounced call
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith('search', 'Test Customer');
    }, { timeout: 600 });
  });

  it('calls onFilterChange when min amount changes', () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    const minInput = screen.getByLabelText(/Min Amount/i);
    fireEvent.change(minInput, { target: { value: '1000' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('minAmount', '1000');
  });

  it('calls onFilterChange when max amount changes', () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    const maxInput = screen.getByLabelText(/Max Amount/i);
    fireEvent.change(maxInput, { target: { value: '5000' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('maxAmount', '5000');
  });

  it('calls onReset when reset button is clicked', () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    const resetButton = screen.getByText(/Reset/i);
    fireEvent.click(resetButton);
    
    expect(mockOnReset).toHaveBeenCalled();
  });

  it('displays active filter count', () => {
    const activeFilters = {
      ...mockFilters,
      status: 'accepted',
      search: 'test',
    };
    
    render(
      <QuoteFilters 
        filters={activeFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByText(/2/)).toBeInTheDocument(); // 2 active filters
  });

  it('toggles filter visibility on mobile', () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    const toggleButton = screen.getByLabelText(/Toggle filters/i);
    fireEvent.click(toggleButton);
    
    // Should toggle filter visibility
    expect(screen.getByText(/Filters/i)).toBeInTheDocument();
  });

  it('displays status options correctly', () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    const statusSelect = screen.getByLabelText(/Status/i);
    expect(statusSelect).toHaveTextContent(/All/i);
    expect(statusSelect).toHaveTextContent(/Draft/i);
    expect(statusSelect).toHaveTextContent(/Sent/i);
    expect(statusSelect).toHaveTextContent(/Accepted/i);
    expect(statusSelect).toHaveTextContent(/Declined/i);
    expect(statusSelect).toHaveTextContent(/Expired/i);
  });

  it('displays date range options', () => {
    render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    const dateSelect = screen.getByLabelText(/Date Range/i);
    expect(dateSelect).toHaveTextContent(/All Time/i);
    expect(dateSelect).toHaveTextContent(/Today/i);
    expect(dateSelect).toHaveTextContent(/This Week/i);
    expect(dateSelect).toHaveTextContent(/This Month/i);
  });

  it('validates amount range', () => {
    const invalidFilters = {
      ...mockFilters,
      minAmount: '5000',
      maxAmount: '1000',
    };
    
    render(
      <QuoteFilters 
        filters={invalidFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    // Should show validation error
    expect(screen.getByText(/Min amount cannot be greater than max/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuoteFilters 
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('clears individual filters', () => {
    const activeFilters = {
      ...mockFilters,
      status: 'accepted',
    };
    
    render(
      <QuoteFilters 
        filters={activeFilters}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
      />
    );
    
    const clearButton = screen.getByLabelText(/Clear status filter/i);
    fireEvent.click(clearButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('status', '');
  });
});
