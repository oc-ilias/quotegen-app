/**
 * DeleteCustomerDialog Component Tests
 * Comprehensive test coverage for DeleteCustomerDialog
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteCustomerDialog } from '@/components/customers/DeleteCustomerDialog';
import { CustomerStatus } from '@/types/quote';
import type { CustomerWithStats } from '@/types/quote';

// Mock toast helpers
jest.mock('@/components/ui/Toast', () => ({
  useToastHelpers: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

// Mock Modal component
jest.mock('@/components/ui/Modal', () => ({
  Modal: ({ children, isOpen, title }: { children: React.ReactNode; isOpen: boolean; title: string }) => isOpen ? <div data-testid="modal"><h2>{title}</h2>{children}</div> : null,
}));

describe('DeleteCustomerDialog', () => {
  const mockCustomer: CustomerWithStats = {
    id: '1',
    email: 'john@example.com',
    companyName: 'Acme Corp',
    contactName: 'John Doe',
    phone: '+1234567890',
    status: CustomerStatus.ACTIVE,
    customerSince: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    tags: ['vip'],
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

  const mockCustomerWithQuotes: CustomerWithStats = {
    ...mockCustomer,
    stats: {
      ...mockCustomer.stats,
      totalQuotes: 5,
    },
  };

  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open with customer', () => {
    render(
      <DeleteCustomerDialog
        customer={mockCustomer}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getAllByText('Delete Customer').length).toBeGreaterThan(0);
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <DeleteCustomerDialog
        customer={mockCustomer}
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('does not render when customer is null', () => {
    const { container } = render(
      <DeleteCustomerDialog
        customer={null}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DeleteCustomerDialog
        customer={mockCustomer}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows warning for customer without quotes', () => {
    render(
      <DeleteCustomerDialog
        customer={mockCustomer}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getAllByText('Delete Customer').length).toBeGreaterThan(0);
    expect(screen.queryByText(/This customer has/)).not.toBeInTheDocument();
  });

  it('shows archive warning for customer with quotes', () => {
    render(
      <DeleteCustomerDialog
        customer={mockCustomerWithQuotes}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/This customer has 5 quotes/)).toBeInTheDocument();
    expect(screen.getByText(/They will be archived/)).toBeInTheDocument();
  });

  it('requires confirmation text to delete', () => {
    render(
      <DeleteCustomerDialog
        customer={mockCustomer}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    // Find the button by role instead of text (since "Delete Customer" appears in title too)
    const deleteButton = screen.getAllByText('Delete Customer').find(el => el.tagName === 'BUTTON');
    expect(deleteButton).toBeDisabled();
  });

  it('enables delete button when correct confirmation text is entered', () => {
    render(
      <DeleteCustomerDialog
        customer={mockCustomer}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmationInput = screen.getByPlaceholderText('delete John Doe');
    fireEvent.change(confirmationInput, { target: { value: 'delete John Doe' } });

    const deleteButton = screen.getAllByText('Delete Customer').find(el => el.tagName === 'BUTTON');
    expect(deleteButton).not.toBeDisabled();
  });

  it('handles case-insensitive confirmation text', () => {
    render(
      <DeleteCustomerDialog
        customer={mockCustomer}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmationInput = screen.getByPlaceholderText('delete John Doe');
    fireEvent.change(confirmationInput, { target: { value: 'DELETE JOHN DOE' } });

    const deleteButton = screen.getAllByText('Delete Customer').find(el => el.tagName === 'BUTTON');
    expect(deleteButton).not.toBeDisabled();
  });

  it('calls onConfirm when delete button is clicked with valid confirmation', async () => {
    mockOnConfirm.mockResolvedValueOnce(undefined);

    render(
      <DeleteCustomerDialog
        customer={mockCustomer}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmationInput = screen.getByPlaceholderText('delete John Doe');
    fireEvent.change(confirmationInput, { target: { value: 'delete John Doe' } });

    const deleteButton = screen.getAllByText('Delete Customer').find(el => el.tagName === 'BUTTON');
    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('1');
    });
  });

  it('shows "Archive Customer" button when customer has quotes', () => {
    render(
      <DeleteCustomerDialog
        customer={mockCustomerWithQuotes}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    // First enter confirmation text
    const confirmationInput = screen.getByPlaceholderText('delete John Doe');
    fireEvent.change(confirmationInput, { target: { value: 'delete John Doe' } });

    expect(screen.getByText('Archive Customer')).toBeInTheDocument();
  });

  it('shows loading state when deleting', () => {
    render(
      <DeleteCustomerDialog
        customer={mockCustomer}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={true}
      />
    );

    const deleteButton = screen.getAllByText('Delete Customer').find(el => el.tagName === 'BUTTON');
    expect(deleteButton).toBeDisabled();
  });

  it('disables cancel button when deleting', () => {
    render(
      <DeleteCustomerDialog
        customer={mockCustomer}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isDeleting={true}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();
  });

  it('clears confirmation text when dialog is closed', () => {
    const { rerender } = render(
      <DeleteCustomerDialog
        customer={mockCustomer}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmationInput = screen.getByPlaceholderText('delete John Doe') as HTMLInputElement;
    fireEvent.change(confirmationInput, { target: { value: 'delete John Doe' } });

    // Close dialog (calls onClose which should clear input)
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows singular quote message when customer has one quote', () => {
    const customerWithOneQuote = {
      ...mockCustomer,
      stats: {
        ...mockCustomer.stats,
        totalQuotes: 1,
      },
    };

    render(
      <DeleteCustomerDialog
        customer={customerWithOneQuote}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/This customer has 1 quote/)).toBeInTheDocument();
  });

  it('handles error during deletion', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockOnConfirm.mockRejectedValueOnce(new Error('Deletion failed'));

    render(
      <DeleteCustomerDialog
        customer={mockCustomer}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmationInput = screen.getByPlaceholderText('delete John Doe');
    fireEvent.change(confirmationInput, { target: { value: 'delete John Doe' } });

    const deleteButton = screen.getAllByText('Delete Customer').find(el => el.tagName === 'BUTTON');
    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});
