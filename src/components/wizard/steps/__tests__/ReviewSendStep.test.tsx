/**
 * ReviewSendStep Component Tests
 * Tests for the Review and Send wizard step
 * @module components/wizard/steps/__tests__/ReviewSendStep
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewSendStep from '../ReviewSendStep';

describe('ReviewSendStep', () => {
  const mockOnSubmit = jest.fn();

  const defaultData = {
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Corp',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      },
    },
    line_items: [
      {
        name: 'Product A',
        description: 'Test product',
        quantity: 2,
        unit_price: 100,
        discount_percent: 0,
        tax_rate: 10,
      },
    ],
    title: 'Quote #001',
    notes: 'Please review and approve',
    terms: 'Net 30',
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders step title and description', () => {
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    expect(screen.getByText('Review & Send')).toBeInTheDocument();
    expect(screen.getByText('Review your quote before sending it to the customer.')).toBeInTheDocument();
  });

  it('renders preview tab by default', () => {
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    expect(screen.getByTestId('tab-preview')).toHaveClass('bg-indigo-500');
  });

  it('switches to details tab when clicked', async () => {
    const user = userEvent.setup();
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    const detailsTab = screen.getByTestId('tab-details');
    await user.click(detailsTab);
    
    expect(detailsTab).toHaveClass('bg-indigo-500');
  });

  it('displays customer information in preview', () => {
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    expect(screen.getByText('Bill To')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays line items in preview', () => {
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Test product')).toBeInTheDocument();
  });

  it('calculates and displays totals correctly', () => {
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('displays notes in preview', () => {
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Please review and approve')).toBeInTheDocument();
  });

  it('calls onSubmit when send button is clicked', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    const sendButton = screen.getByTestId('send-quote-button');
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('disables send button when isSubmitting is true', () => {
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={true} 
      />
    );
    
    const sendButton = screen.getByTestId('send-quote-button');
    expect(sendButton).toBeDisabled();
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Failed to send quote';
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
        error={errorMessage} 
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders send method options', () => {
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    expect(screen.getByTestId('send-method-email')).toBeInTheDocument();
    expect(screen.getByTestId('send-method-link')).toBeInTheDocument();
    expect(screen.getByTestId('send-method-download')).toBeInTheDocument();
  });

  it('allows selecting different send methods', async () => {
    const user = userEvent.setup();
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    const linkMethod = screen.getByTestId('send-method-link');
    await user.click(linkMethod);
    
    expect(linkMethod).toHaveClass('border-indigo-500');
  });

  it('displays quote summary', () => {
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    expect(screen.getByText('Quote Summary')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('shows ready to send status when data is valid', () => {
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    expect(screen.getByText('Ready to send')).toBeInTheDocument();
  });

  it('shows validation errors when data is invalid', () => {
    const invalidData = {
      ...defaultData,
      customer: {
        ...defaultData.customer,
        name: '',
        email: '',
      },
    };
    
    render(
      <ReviewSendStep 
        data={invalidData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    expect(screen.getByText('Please complete all required fields before sending')).toBeInTheDocument();
  });

  it('shows missing required fields message in summary', () => {
    const invalidData = {
      ...defaultData,
      customer: {
        ...defaultData.customer,
        name: '',
        email: '',
      },
    };
    
    render(
      <ReviewSendStep 
        data={invalidData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    expect(screen.getByText('Missing required fields')).toBeInTheDocument();
  });

  it('displays correct item count in summary', () => {
    render(
      <ReviewSendStep 
        data={defaultData} 
        onSubmit={mockOnSubmit} 
        isSubmitting={false} 
      />
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
