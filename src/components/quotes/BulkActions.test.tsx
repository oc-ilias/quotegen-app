/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BulkActions } from '@/components/quotes/BulkActions';

const mockQuotes = [
  { id: '1', title: 'Quote 1', status: 'draft', customer: 'Customer A' },
  { id: '2', title: 'Quote 2', status: 'sent', customer: 'Customer B' },
  { id: '3', title: 'Quote 3', status: 'accepted', customer: 'Customer C' },
];

const mockOnDelete = jest.fn();
const mockOnStatusChange = jest.fn();
const mockOnExport = jest.fn();
const mockOnSend = jest.fn();

describe('BulkActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <BulkActions 
        selectedQuotes={[]}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );
    
    expect(screen.getByText(/Bulk Actions/i)).toBeInTheDocument();
  });

  it('shows selected count when quotes are selected', () => {
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );
    
    expect(screen.getByText(/3 selected/i)).toBeInTheDocument();
  });

  it('shows singular when one quote is selected', () => {
    render(
      <BulkActions 
        selectedQuotes={[mockQuotes[0]]}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );
    
    expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
  });

  it('disables actions when no quotes selected', () => {
    render(
      <BulkActions 
        selectedQuotes={[]}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );
    
    const deleteButton = screen.getByText(/Delete/i);
    expect(deleteButton).toBeDisabled();
  });

  it('enables actions when quotes are selected', () => {
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );
    
    const deleteButton = screen.getByText(/Delete/i);
    expect(deleteButton).not.toBeDisabled();
  });

  it('calls onDelete when delete is confirmed', async () => {
    window.confirm = jest.fn(() => true);
    
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );
    
    const deleteButton = screen.getByText(/Delete/i);
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(['1', '2', '3']);
    });
  });

  it('does not call onDelete when delete is cancelled', () => {
    window.confirm = jest.fn(() => false);
    
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );
    
    const deleteButton = screen.getByText(/Delete/i);
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('calls onStatusChange when status is selected', () => {
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );
    
    const statusSelect = screen.getByLabelText(/Change Status/i);
    fireEvent.change(statusSelect, { target: { value: 'sent' } });
    
    expect(mockOnStatusChange).toHaveBeenCalledWith(['1', '2', '3'], 'sent');
  });

  it('displays status options', () => {
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );
    
    const statusSelect = screen.getByLabelText(/Change Status/i);
    expect(statusSelect).toHaveTextContent(/Mark as Draft/i);
    expect(statusSelect).toHaveTextContent(/Mark as Sent/i);
    expect(statusSelect).toHaveTextContent(/Mark as Accepted/i);
    expect(statusSelect).toHaveTextContent(/Mark as Declined/i);
    expect(statusSelect).toHaveTextContent(/Mark as Expired/i);
  });

  it('calls onExport when export is clicked', () => {
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onExport={mockOnExport}
      />
    );
    
    const exportButton = screen.getByText(/Export/i);
    fireEvent.click(exportButton);
    
    expect(mockOnExport).toHaveBeenCalledWith(mockQuotes);
  });

  it('calls onSend when send is clicked', () => {
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onSend={mockOnSend}
      />
    );
    
    const sendButton = screen.getByText(/Send/i);
    fireEvent.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith(mockQuotes);
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        isLoading={true}
      />
    );
    
    expect(screen.getByText(/Processing/i)).toBeInTheDocument();
  });

  it('allows selecting all quotes', () => {
    const mockOnSelectAll = jest.fn();
    
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onSelectAll={mockOnSelectAll}
        totalQuotes={10}
      />
    );
    
    const selectAllButton = screen.getByText(/Select All/i);
    fireEvent.click(selectAllButton);
    
    expect(mockOnSelectAll).toHaveBeenCalled();
  });

  it('allows clearing selection', () => {
    const mockOnClearSelection = jest.fn();
    
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onClearSelection={mockOnClearSelection}
      />
    );
    
    const clearButton = screen.getByText(/Clear/i);
    fireEvent.click(clearButton);
    
    expect(mockOnClearSelection).toHaveBeenCalled();
  });

  it('displays dropdown menu with more actions', () => {
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );
    
    const moreButton = screen.getByLabelText(/More actions/i);
    fireEvent.click(moreButton);
    
    expect(screen.getByText(/Duplicate/i)).toBeInTheDocument();
    expect(screen.getByText(/Archive/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays only allowed actions based on permissions', () => {
    render(
      <BulkActions 
        selectedQuotes={mockQuotes}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        permissions={{ canDelete: false, canEdit: true }}
      />
    );
    
    const deleteButton = screen.getByText(/Delete/i);
    expect(deleteButton).toBeDisabled();
  });
});
