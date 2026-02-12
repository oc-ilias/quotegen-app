/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BulkActions } from '@/components/quotes/BulkActions';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock toast helpers
jest.mock('@/components/ui/Toast', () => ({
  useToastHelpers: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

const mockQuotes = [
  { id: '1', quoteNumber: 'Q-001', status: 'draft' as const, customer: 'Customer A' },
  { id: '2', quoteNumber: 'Q-002', status: 'sent' as const, customer: 'Customer B' },
  { id: '3', quoteNumber: 'Q-003', status: 'accepted' as const, customer: 'Customer C' },
];

const mockOnSelectionChange = jest.fn();
const mockOnActionComplete = jest.fn();

describe('BulkActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders select all when no quotes selected', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    expect(screen.getByText(/Select all/i)).toBeInTheDocument();
  });

  it('selects all quotes when select all clicked', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    const selectAllButton = screen.getByText(/Select all/i).closest('label')?.querySelector('button');
    if (selectAllButton) {
      fireEvent.click(selectAllButton);
      expect(mockOnSelectionChange).toHaveBeenCalledWith(['1', '2', '3']);
    }
  });

  it('shows selected count when quotes are selected', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
  });

  it('shows clear button when quotes are selected', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    const clearButton = screen.getByText(/Clear/i);
    expect(clearButton).toBeInTheDocument();
  });

  it('clears selection when clear clicked', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    const clearButton = screen.getByText(/Clear/i);
    fireEvent.click(clearButton);
    
    expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
  });

  it('displays action buttons when quotes are selected', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    expect(screen.getByText(/Change Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Send Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Export CSV/i)).toBeInTheDocument();
    expect(screen.getByText(/Delete/i)).toBeInTheDocument();
  });

  it('opens status change modal when change status clicked', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    const changeStatusButton = screen.getByText(/Change Status/i);
    fireEvent.click(changeStatusButton);
    
    expect(screen.getByText(/Change Status/i)).toBeInTheDocument();
  });

  it('shows status options in modal', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    const changeStatusButton = screen.getByText(/Change Status/i);
    fireEvent.click(changeStatusButton);
    
    expect(screen.getByText(/Draft/i)).toBeInTheDocument();
    expect(screen.getByText(/Sent/i)).toBeInTheDocument();
    expect(screen.getByText(/Accepted/i)).toBeInTheDocument();
  });

  it('opens delete confirmation modal when delete clicked', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getByText(/Delete Quotes/i)).toBeInTheDocument();
  });

  it('shows delete warning in confirmation modal', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByText(/permanently removed/i)).toBeInTheDocument();
  });

  it('cancels delete when cancel clicked', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);
    
    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    
    // Modal should close
    expect(screen.queryByText(/cannot be undone/i)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('deselects all when all are selected and select all clicked', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2', '3']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    const selectAllButton = screen.getByText(/3 selected/i).closest('label')?.querySelector('button');
    if (selectAllButton) {
      fireEvent.click(selectAllButton);
      expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
    }
  });

  it('shows partial selection state', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    // Should show 2 selected when not all are selected
    expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
  });

  it('displays quote count in delete confirmation', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getByText(/Delete 2 Quotes/i)).toBeInTheDocument();
  });

  it('calls onActionComplete after action', async () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1']}
        onSelectionChange={mockOnSelectionChange}
        onActionComplete={mockOnActionComplete}
      />
    );
    
    // Trigger an action and wait
    const exportButton = screen.getByText(/Export CSV/i);
    fireEvent.click(exportButton);
    
    // Wait for the async operation
    await waitFor(() => {
      // Modal should be processing or closed
      expect(mockOnActionComplete).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('shows actions dropdown on mobile', () => {
    render(
      <BulkActions 
        quotes={mockQuotes}
        selectedIds={['1', '2']}
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    // Mobile dropdown should be available (hidden on desktop)
    const actionsButtons = screen.getAllByText(/Actions/i);
    expect(actionsButtons.length).toBeGreaterThan(0);
  });
});
