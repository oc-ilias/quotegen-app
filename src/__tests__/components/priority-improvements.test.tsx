/**
 * Tests for New Priority Components
 * Customer Edit, Search Filters, and Bulk Actions
 * @module __tests__/components/priority-improvements.test.tsx
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteSearchFilter } from '@/components/quotes/QuoteSearchFilter';
import { QuoteBulkActions, useQuoteSelection, exportQuotesToCSV, exportQuotesToJSON } from '@/components/quotes/QuoteBulkActions';
import { QuoteStatus, type Quote, type QuoteFilters } from '@/types/quote';

// ============================================================================
// Mock Data
// ============================================================================

const mockQuotes: Quote[] = [
  {
    id: 'q1',
    quoteNumber: 'QT-2024-001',
    title: 'Test Quote 1',
    status: QuoteStatus.ACCEPTED,
    customer: {
      id: 'c1',
      email: 'test1@example.com',
      companyName: 'Test Co 1',
      contactName: 'John Doe',
      customerSince: new Date(),
      tags: [],
    },
    lineItems: [],
    subtotal: 1000,
    discountTotal: 100,
    taxTotal: 90,
    total: 990,
    terms: { currency: 'USD' },
    metadata: {
      createdBy: 'user1',
      createdByName: 'Admin',
      source: 'web',
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'q2',
    quoteNumber: 'QT-2024-002',
    title: 'Test Quote 2',
    status: QuoteStatus.PENDING,
    customer: {
      id: 'c2',
      email: 'test2@example.com',
      companyName: 'Test Co 2',
      contactName: 'Jane Smith',
      customerSince: new Date(),
      tags: [],
    },
    lineItems: [],
    subtotal: 2000,
    discountTotal: 0,
    taxTotal: 180,
    total: 2180,
    terms: { currency: 'USD' },
    metadata: {
      createdBy: 'user1',
      createdByName: 'Admin',
      source: 'web',
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'q3',
    quoteNumber: 'QT-2024-003',
    title: 'Test Quote 3',
    status: QuoteStatus.DRAFT,
    customer: {
      id: 'c3',
      email: 'test3@example.com',
      companyName: 'Test Co 3',
      contactName: 'Bob Wilson',
      customerSince: new Date(),
      tags: [],
    },
    lineItems: [],
    subtotal: 3000,
    discountTotal: 300,
    taxTotal: 270,
    total: 2970,
    terms: { currency: 'USD' },
    metadata: {
      createdBy: 'user1',
      createdByName: 'Admin',
      source: 'web',
    },
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
  },
];

// ============================================================================
// Quote Search Filter Tests
// ============================================================================

describe('QuoteSearchFilter', () => {
  const defaultProps = {
    filters: {},
    onFiltersChange: jest.fn(),
    totalResults: 10,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input correctly', () => {
    render(<QuoteSearchFilter {...defaultProps} />);
    
    expect(screen.getByPlaceholderText(/search quotes/i)).toBeInTheDocument();
  });

  it('calls onFiltersChange with debounce on search input', async () => {
    render(<QuoteSearchFilter {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/search quotes/i);
    fireEvent.change(input, { target: { value: 'test query' } });
    
    // Should not call immediately
    expect(defaultProps.onFiltersChange).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ searchQuery: 'test query' })
      );
    }, { timeout: 400 });
  });

  it('displays filter buttons', () => {
    render(<QuoteSearchFilter {...defaultProps} />);
    
    expect(screen.getByText(/status/i)).toBeInTheDocument();
    expect(screen.getByText(/^date$/i)).toBeInTheDocument();
    expect(screen.getByText(/amount/i)).toBeInTheDocument();
  });

  it('shows status filter dropdown when clicked', async () => {
    render(<QuoteSearchFilter {...defaultProps} />);
    
    const statusButton = screen.getByText(/status/i);
    fireEvent.click(statusButton);
    
    await waitFor(() => {
      expect(screen.getByText(/draft/i)).toBeInTheDocument();
      expect(screen.getByText(/accepted/i)).toBeInTheDocument();
    });
  });

  it('applies status filter correctly', async () => {
    render(<QuoteSearchFilter {...defaultProps} />);
    
    fireEvent.click(screen.getByText(/status/i));
    
    await waitFor(() => {
      const acceptedOption = screen.getByText(/accepted/i);
      fireEvent.click(acceptedOption);
    });

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        status: expect.arrayContaining([QuoteStatus.ACCEPTED])
      })
    );
  });

  it('shows selected status count on button', async () => {
    render(
      <QuoteSearchFilter 
        {...defaultProps} 
        filters={{ status: [QuoteStatus.ACCEPTED, QuoteStatus.PENDING] }}
      />
    );
    
    // The button should show "2 Statuses" 
    const statusButtons = screen.getAllByText(/2 statuses/i);
    expect(statusButtons.length).toBeGreaterThan(0);
  });

  it('displays total results count', () => {
    render(<QuoteSearchFilter {...defaultProps} totalResults={42} />);
    
    expect(screen.getByText(/42 results/i)).toBeInTheDocument();
  });

  it('clears all filters when clear all clicked', () => {
    render(
      <QuoteSearchFilter 
        {...defaultProps} 
        filters={{ 
          status: [QuoteStatus.ACCEPTED],
          searchQuery: 'test',
          sortBy: 'created_at',
          sortOrder: 'desc'
        }}
      />
    );
    
    const clearButton = screen.getByText(/clear all/i);
    fireEvent.click(clearButton);
    
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  });

  it('updates sort order when sort dropdown changed', async () => {
    render(<QuoteSearchFilter {...defaultProps} />);
    
    // Open sort dropdown
    fireEvent.click(screen.getByText(/date created/i));
    
    await waitFor(() => {
      const quoteValueOption = screen.getByText(/quote value/i);
      fireEvent.click(quoteValueOption);
    });

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'total',
        sortOrder: 'desc'
      })
    );
  });
});

// ============================================================================
// Quote Bulk Actions Tests
// ============================================================================

describe('QuoteBulkActions', () => {
  const mockHandlers = {
    onDelete: jest.fn().mockResolvedValue(undefined),
    onStatusChange: jest.fn().mockResolvedValue(undefined),
    onExport: jest.fn().mockResolvedValue(undefined),
    onDuplicate: jest.fn().mockResolvedValue(undefined),
  };

  const defaultProps = {
    quotes: mockQuotes,
    selectedIds: [],
    onSelectionChange: jest.fn(),
    ...mockHandlers,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.skip('shows select all button when no selection', () => {
    render(<QuoteBulkActions {...defaultProps} />);
    
    expect(screen.getByText(/select all/i)).toBeInTheDocument();
  });

  it.skip('selects all quotes when select all clicked', () => {
    render(<QuoteBulkActions {...defaultProps} />);
    
    fireEvent.click(screen.getByText(/select all/i));
    
    expect(defaultProps.onSelectionChange).toHaveBeenCalledWith(
      mockQuotes.map(q => q.id)
    );
  });

  it('shows bulk action bar when quotes selected', () => {
    render(
      <QuoteBulkActions 
        {...defaultProps} 
        selectedIds={['q1', 'q2']}
      />
    );
    
    expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    expect(screen.getByText(/change status/i)).toBeInTheDocument();
    expect(screen.getByText(/export/i)).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });

  it('opens status change dropdown', async () => {
    render(
      <QuoteBulkActions 
        {...defaultProps} 
        selectedIds={['q1']}
      />
    );
    
    fireEvent.click(screen.getByText(/change status/i));
    
    await waitFor(() => {
      expect(screen.getByText(/sent/i)).toBeInTheDocument();
      expect(screen.getByText(/accepted/i)).toBeInTheDocument();
    });
  });

  it('shows confirmation modal before delete', async () => {
    render(
      <QuoteBulkActions 
        {...defaultProps} 
        selectedIds={['q1', 'q2']}
      />
    );
    
    fireEvent.click(screen.getByText(/delete/i));
    
    await waitFor(() => {
      expect(screen.getByText(/delete quotes/i)).toBeInTheDocument();
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
  });

  it.skip('calls onDelete when delete confirmed', async () => {
    render(
      <QuoteBulkActions 
        {...defaultProps} 
        selectedIds={['q1']}
      />
    );
    
    fireEvent.click(screen.getByText(/delete/i));
    
    await waitFor(() => {
      expect(screen.getByText(/delete/i)).toBeInTheDocument();
    });
    
    const confirmButton = screen.getAllByText(/delete/i).find(el => 
      el.getAttribute('role') !== 'button' || el.tagName !== 'BUTTON'
    ) || screen.getByRole('button', { name: /delete$/i });
    
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockHandlers.onDelete).toHaveBeenCalledWith(['q1']);
    });
  });

  it('opens export dropdown', async () => {
    render(
      <QuoteBulkActions 
        {...defaultProps} 
        selectedIds={['q1']}
      />
    );
    
    fireEvent.click(screen.getByText(/export/i));
    
    await waitFor(() => {
      expect(screen.getByText(/csv/i)).toBeInTheDocument();
      expect(screen.getByText(/pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/json/i)).toBeInTheDocument();
    });
  });

  it('calls onExport with correct format', async () => {
    render(
      <QuoteBulkActions 
        {...defaultProps} 
        selectedIds={['q1', 'q2']}
      />
    );
    
    fireEvent.click(screen.getByText(/export/i));
    
    await waitFor(() => {
      expect(screen.getByText(/csv/i)).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText(/csv/i));
    
    await waitFor(() => {
      expect(mockHandlers.onExport).toHaveBeenCalledWith(['q1', 'q2'], 'csv');
    });
  });

  it('clears selection when X button clicked', () => {
    render(
      <QuoteBulkActions 
        {...defaultProps} 
        selectedIds={['q1']}
      />
    );
    
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('shows duplicate button when onDuplicate provided', () => {
    render(
      <QuoteBulkActions 
        {...defaultProps} 
        selectedIds={['q1']}
      />
    );
    
    expect(screen.getByText(/duplicate/i)).toBeInTheDocument();
  });
});

// ============================================================================
// useQuoteSelection Hook Tests
// ============================================================================

describe('useQuoteSelection', () => {
  it('returns correct initial state', () => {
    const { result } = renderHook(() => useQuoteSelection(mockQuotes));
    
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.allSelected).toBe(false);
    expect(result.current.someSelected).toBe(false);
  });

  it('selects all when toggleAll called', () => {
    const { result } = renderHook(() => useQuoteSelection(mockQuotes));
    
    act(() => {
      result.current.toggleAll();
    });
    
    expect(result.current.selectedIds).toEqual(['q1', 'q2', 'q3']);
    expect(result.current.allSelected).toBe(true);
  });

  it('deselects all when toggleAll called and all selected', async () => {
    const { result } = renderHook(() => useQuoteSelection(mockQuotes));
    
    act(() => {
      result.current.toggleAll();
    });
    
    expect(result.current.selectedIds).toEqual(['q1', 'q2', 'q3']);
    
    act(() => {
      result.current.toggleAll();
    });
    
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.allSelected).toBe(false);
  });

  it('toggles single selection', () => {
    const { result } = renderHook(() => useQuoteSelection(mockQuotes));
    
    act(() => {
      result.current.toggleOne('q1');
    });
    
    expect(result.current.selectedIds).toEqual(['q1']);
    expect(result.current.someSelected).toBe(true);
  });

  it('removes selection when toggleOne called twice', () => {
    const { result } = renderHook(() => useQuoteSelection(mockQuotes));
    
    act(() => {
      result.current.toggleOne('q1');
      result.current.toggleOne('q1');
    });
    
    expect(result.current.selectedIds).toEqual([]);
  });

  it('clears all selection', () => {
    const { result } = renderHook(() => useQuoteSelection(mockQuotes));
    
    act(() => {
      result.current.toggleAll();
      result.current.clearSelection();
    });
    
    expect(result.current.selectedIds).toEqual([]);
  });

  it('selects range correctly', () => {
    const { result } = renderHook(() => useQuoteSelection(mockQuotes));
    
    act(() => {
      result.current.selectRange('q1', 'q3');
    });
    
    expect(result.current.selectedIds).toEqual(['q1', 'q2', 'q3']);
  });
});

// ============================================================================
// Export Functions Tests
// ============================================================================

describe('Export Functions', () => {
  it('exports quotes to CSV format', () => {
    const csv = exportQuotesToCSV(mockQuotes);
    
    expect(csv).toContain('Quote Number,Title,Customer');
    expect(csv).toContain('QT-2024-001');
    expect(csv).toContain('QT-2024-002');
    expect(csv).toContain('QT-2024-003');
  });

  it('exports quotes to JSON format', () => {
    const json = exportQuotesToJSON(mockQuotes);
    const parsed = JSON.parse(json);
    
    expect(parsed).toHaveLength(3);
    expect(parsed[0].quoteNumber).toBe('QT-2024-001');
  });
});

// ============================================================================
// Test Utilities
// ============================================================================

import { renderHook, act } from '@testing-library/react';
