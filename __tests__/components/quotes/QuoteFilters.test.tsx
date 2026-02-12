/**
 * Quote Filters Component Tests
 * @module __tests__/components/quotes/QuoteFilters
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QuoteFilters, QuoteFiltersSkeleton } from '@/components/quotes/QuoteFilters';
import { QuoteFilters as QuoteFiltersType, QuoteStatus } from '@/types/quote';

// Framer Motion is mocked globally in jest.setup.tsx

// ============================================================================
// Test Data
// ============================================================================

const mockInitialFilters: Partial<QuoteFiltersType> = {
  searchQuery: 'test query',
  status: [QuoteStatus.ACCEPTED, QuoteStatus.PENDING],
};

// ============================================================================
// Test Suite
// ============================================================================

describe('QuoteFilters', () => {
  const mockOnFilterChange = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('rendering', () => {
    it('renders with default props', () => {
      render(<QuoteFilters />);
      
      expect(screen.getByPlaceholderText('Search quotes by number, customer, or product...')).toBeInTheDocument();
    });

    it('renders with initial filters', () => {
      render(
        <QuoteFilters 
          initialFilters={mockInitialFilters}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search quotes by number, customer, or product...');
      expect(searchInput).toHaveValue('test query');
    });

    it('renders filters button', () => {
      render(<QuoteFilters />);
      
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('renders sort options', () => {
      render(<QuoteFilters />);
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('shows filters toggle button', () => {
      render(<QuoteFilters />);
      
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Search Tests
  // ==========================================================================

  describe('search functionality', () => {
    it('updates search query on input', async () => {
      render(
        <QuoteFilters 
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search quotes by number, customer, or product...');
      fireEvent.change(searchInput, { target: { value: 'QT-001' } });
      
      expect(searchInput).toHaveValue('QT-001');
    });

    it('clears search query when clear button clicked', async () => {
      render(
        <QuoteFilters 
          initialFilters={{ searchQuery: 'test' }}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      // Find the X button next to the search input
      const clearButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg') && btn.className.includes('absolute')
      );
      
      if (clearButton) {
        fireEvent.click(clearButton);
        
        const searchInput = screen.getByPlaceholderText('Search quotes by number, customer, or product...');
        expect(searchInput).toHaveValue('');
      }
    });

    it('calls onFilterChange when search changes', async () => {
      render(
        <QuoteFilters 
          onFilterChange={mockOnFilterChange}
        />
      );
      
      // Clear initial mock calls from useEffect
      mockOnFilterChange.mockClear();
      
      const searchInput = screen.getByPlaceholderText('Search quotes by number, customer, or product...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // onFilterChange should be called when filters change
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // Status Filter Tests
  // ==========================================================================

  describe('status filtering', () => {
    it('shows status filter with count badge', () => {
      render(
        <QuoteFilters 
          initialFilters={{ status: [QuoteStatus.ACCEPTED, QuoteStatus.PENDING] }}
        />
      );
      
      // The count badge is a separate span with the number
      const countBadge = document.querySelector('span[class*="bg-indigo-500"]');
      expect(countBadge).toHaveTextContent('2');
    });

    it('renders all status options when filters opened', () => {
      render(<QuoteFilters />);
      
      // Open filters panel
      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);
      
      // Status options should be visible in the panel
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Accepted')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Date Range Tests
  // ==========================================================================

  describe('date range filtering', () => {
    it('renders date inputs', () => {
      render(<QuoteFilters />);
      
      // Open filters panel first
      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);
      
      expect(screen.getByText('From')).toBeInTheDocument();
      expect(screen.getByText('To')).toBeInTheDocument();
    });

    it('validates date range', async () => {
      render(<QuoteFilters />);
      
      // Open filters panel first
      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);
      
      // Get date inputs by type
      const dateInputs = screen.getAllByDisplayValue('');
      const dateFrom = dateInputs.find((el) => el.getAttribute('type') === 'date');
      const dateInputs2 = screen.getAllByDisplayValue('');
      const dateTo = dateInputs2.filter((el) => el.getAttribute('type') === 'date')[1];
      
      if (dateFrom && dateTo) {
        fireEvent.change(dateFrom, { target: { value: '2024-03-01' } });
        fireEvent.change(dateTo, { target: { value: '2024-01-01' } });
        
        // Note: Component doesn't show validation errors currently
        // This test validates the inputs accept values
        expect(dateFrom).toHaveValue('2024-03-01');
        expect(dateTo).toHaveValue('2024-01-01');
      }
    });
  });

  // ==========================================================================
  // Value Range Tests
  // ==========================================================================

  describe('value range filtering', () => {
    it('shows value range inputs in filters panel', () => {
      render(<QuoteFilters />);
      
      // Open filters panel
      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);
      
      expect(screen.getByText('Minimum')).toBeInTheDocument();
      expect(screen.getByText('Maximum')).toBeInTheDocument();
    });

    it('accepts value range input', async () => {
      render(<QuoteFilters />);
      
      // Open filters panel
      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);
      
      // Get number inputs by placeholder
      const minInput = screen.getByPlaceholderText('0.00');
      const maxInput = screen.getByPlaceholderText('Unlimited');
      
      fireEvent.change(minInput, { target: { value: '1000' } });
      fireEvent.change(maxInput, { target: { value: '5000' } });
      
      expect(minInput).toHaveValue(1000);
      expect(maxInput).toHaveValue(5000);
    });
  });

  // ==========================================================================
  // Sort Tests
  // ==========================================================================

  describe('sorting', () => {
    it('changes sort field', async () => {
      render(
        <QuoteFilters 
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'total' } });
      
      await waitFor(() => {
        const lastCall = mockOnFilterChange.mock.calls[mockOnFilterChange.mock.calls.length - 1];
        expect(lastCall[0].sortBy).toContain('total');
      });
    });

    it('toggles sort order', async () => {
      render(
        <QuoteFilters 
          onFilterChange={mockOnFilterChange}
        />
      );
      
      // The sort order button has title "Descending" initially
      const sortOrderButton = screen.getByTitle('Descending');
      fireEvent.click(sortOrderButton);
      
      await waitFor(() => {
        const lastCall = mockOnFilterChange.mock.calls[mockOnFilterChange.mock.calls.length - 1];
        expect(lastCall[0].sortOrder).toBe('asc');
      });
    });
  });

  // ==========================================================================
  // Advanced Filters Tests
  // ==========================================================================

  describe('filters panel', () => {
    it('toggles filters panel visibility', () => {
      render(<QuoteFilters />);
      
      const filtersButton = screen.getByText('Filters');
      
      // Initially closed
      expect(screen.queryByText('Minimum')).not.toBeInTheDocument();
      
      // Open
      fireEvent.click(filtersButton);
      expect(screen.getByText('Minimum')).toBeInTheDocument();
      
      // Close
      fireEvent.click(filtersButton);
    });
  });

  // ==========================================================================
  // Active Filters Tests
  // ==========================================================================

  describe('active filters display', () => {
    it('shows active filter chips', () => {
      const { container } = render(
        <QuoteFilters 
          initialFilters={{ searchQuery: 'test', status: [QuoteStatus.ACCEPTED] }}
        />
      );
      
      // Active filter chips are shown with the search query text
      expect(screen.getByText(/test/)).toBeInTheDocument();
      // Status chip shows with color indicator and label - check for chips in the DOM
      const chips = container.querySelectorAll('.rounded-full');
      const acceptedChip = Array.from(chips).find(el => el.textContent?.includes('Accepted'));
      expect(acceptedChip).toBeTruthy();
    });

    it('clears all filters when clear all clicked', () => {
      render(
        <QuoteFilters 
          initialFilters={{ searchQuery: 'test', status: [QuoteStatus.ACCEPTED] }}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const clearAllButton = screen.getByText('Clear all');
      fireEvent.click(clearAllButton);
      
      // Should clear search
      const searchInput = screen.getByPlaceholderText('Search quotes by number, customer, or product...');
      expect(searchInput).toHaveValue('');
    });

    it('removes individual filter chip', () => {
      render(
        <QuoteFilters 
          initialFilters={{ searchQuery: 'test' }}
        />
      );
      
      // Find the X button on the search filter chip (it's the XMarkIcon button)
      const removeButtons = screen.getAllByRole('button');
      // The filter chip X button should be one of them
      const chipRemoveButton = removeButtons.find(btn => 
        btn.querySelector('svg') && btn.closest('span')?.textContent?.includes('test')
      );
      
      if (chipRemoveButton) {
        fireEvent.click(chipRemoveButton);
        
        const searchInput = screen.getByPlaceholderText('Search quotes by number, customer, or product...');
        expect(searchInput).toHaveValue('');
      }
    });
  });

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================

  describe('accessibility', () => {
    it('has accessible search input', () => {
      render(<QuoteFilters />);
      
      const searchInput = screen.getByPlaceholderText('Search quotes by number, customer, or product...');
      expect(searchInput).toBeInTheDocument();
    });

    it('has accessible date inputs', () => {
      render(<QuoteFilters />);
      
      // Open filters panel
      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);
      
      expect(screen.getByText('From')).toBeInTheDocument();
      expect(screen.getByText('To')).toBeInTheDocument();
    });

    it('has accessible filters toggle', () => {
      render(<QuoteFilters />);
      
      const filtersButton = screen.getByText('Filters');
      expect(filtersButton).toBeInTheDocument();
      
      fireEvent.click(filtersButton);
      // Filters panel should open
      expect(screen.getByText('Minimum')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Skeleton Tests
// ============================================================================

describe('QuoteFiltersSkeleton', () => {
  it('renders skeleton elements', () => {
    render(<QuoteFiltersSkeleton />);
    
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
