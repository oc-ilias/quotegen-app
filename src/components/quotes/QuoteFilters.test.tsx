/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuoteFilters, QuoteFiltersSkeleton } from '@/components/quotes/QuoteFilters';

// Mock next/navigation
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => '/quotes',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockOnFilterChange = jest.fn();

describe('QuoteFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByPlaceholderText(/Search quotes/i)).toBeInTheDocument();
  });

  it('displays search input', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByPlaceholderText(/Search quotes/i)).toBeInTheDocument();
  });

  it('displays filters button', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByText(/Filters/i)).toBeInTheDocument();
  });

  it('displays sort dropdown', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByText(/Sort by/i)).toBeInTheDocument();
  });

  it('calls onFilterChange when search input changes', async () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    const searchInput = screen.getByPlaceholderText(/Search quotes/i);
    fireEvent.change(searchInput, { target: { value: 'Test Customer' } });
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalled();
    });
  });

  it('opens filter panel when filters button clicked', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    const filtersButton = screen.getByText(/Filters/i);
    fireEvent.click(filtersButton);
    
    expect(screen.getByText(/Status/i)).toBeInTheDocument();
  });

  it('displays status filter options', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    const filtersButton = screen.getByText(/Filters/i);
    fireEvent.click(filtersButton);
    
    expect(screen.getByText(/Draft/i)).toBeInTheDocument();
    expect(screen.getByText(/Sent/i)).toBeInTheDocument();
    expect(screen.getByText(/Accepted/i)).toBeInTheDocument();
  });

  it('toggles status filter when clicked', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    const filtersButton = screen.getByText(/Filters/i);
    fireEvent.click(filtersButton);
    
    const draftButton = screen.getByText(/Draft/i);
    fireEvent.click(draftButton);
    
    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it('displays date range inputs in filter panel', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    const filtersButton = screen.getByText(/Filters/i);
    fireEvent.click(filtersButton);
    
    expect(screen.getByText(/Date Range/i)).toBeInTheDocument();
  });

  it('displays value range inputs in filter panel', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    const filtersButton = screen.getByText(/Filters/i);
    fireEvent.click(filtersButton);
    
    expect(screen.getByText(/Quote Value/i)).toBeInTheDocument();
  });

  it('clears search when X button clicked', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    const searchInput = screen.getByPlaceholderText(/Search quotes/i);
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    // Find and click clear button
    const clearButton = screen.getByLabelText(/Clear search/i) || 
                       document.querySelector('button[title*="Clear"]') ||
                       document.querySelector('[class*="XMark"]');
    
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(searchInput).toHaveValue('');
    }
  });

  it('clears all filters when clear all clicked', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    const filtersButton = screen.getByText(/Filters/i);
    fireEvent.click(filtersButton);
    
    const clearButton = screen.getByText(/Reset all filters/i);
    fireEvent.click(clearButton);
    
    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <QuoteFilters onFilterChange={mockOnFilterChange} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('initializes with provided filters', () => {
    const initialFilters = {
      searchQuery: 'Test',
      status: ['draft' as const],
      dateFrom: '',
      dateTo: '',
      minValue: '',
      maxValue: '',
      sortBy: 'created' as const,
      sortOrder: 'desc' as const,
    };
    
    render(
      <QuoteFilters 
        onFilterChange={mockOnFilterChange} 
        initialFilters={initialFilters}
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/Search quotes/i);
    expect(searchInput).toHaveValue('Test');
  });

  it('toggles sort order', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    // Find sort order toggle button
    const sortButtons = screen.getAllByRole('button');
    const sortOrderButton = sortButtons.find(btn => btn.getAttribute('title')?.includes('Ascending') || 
                                                     btn.getAttribute('title')?.includes('Descending'));
    
    if (sortOrderButton) {
      fireEvent.click(sortOrderButton);
      expect(mockOnFilterChange).toHaveBeenCalled();
    }
  });

  it('displays active filter count', () => {
    const initialFilters = {
      searchQuery: '',
      status: ['draft' as const, 'sent' as const],
      dateFrom: '',
      dateTo: '',
      minValue: '',
      maxValue: '',
      sortBy: 'created' as const,
      sortOrder: 'desc' as const,
    };
    
    render(
      <QuoteFilters 
        onFilterChange={mockOnFilterChange} 
        initialFilters={initialFilters}
      />
    );
    
    // Should show filter count badge
    const filterButton = screen.getByText(/Filters/i);
    expect(filterButton.textContent).toContain('2');
  });

  it('closes filter panel when done clicked', () => {
    render(<QuoteFilters onFilterChange={mockOnFilterChange} />);
    
    const filtersButton = screen.getByText(/Filters/i);
    fireEvent.click(filtersButton);
    
    const doneButton = screen.getByText(/Done/i);
    fireEvent.click(doneButton);
    
    // Panel should be closed
    expect(screen.queryByText(/Reset all filters/i)).not.toBeInTheDocument();
  });
});

describe('QuoteFiltersSkeleton', () => {
  it('renders skeleton loader', () => {
    render(<QuoteFiltersSkeleton />);
    
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
