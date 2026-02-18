/**
 * TermsNotesStep Component Tests
 * Tests for the Terms and Notes wizard step
 * @module components/wizard/steps/__tests__/TermsNotesStep
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TermsNotesStep from '../TermsNotesStep';
import type { TermsNotesData } from '@/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      const { initial, animate, exit, variants, transition, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      const { initial, animate, exit, variants, transition, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
    p: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      const { initial, animate, exit, variants, transition, ...rest } = props;
      return <p {...rest}>{children}</p>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('TermsNotesStep', () => {
  const mockOnUpdate = jest.fn();

  const defaultData: TermsNotesData = {
    paymentTerms: 'Net 30',
    deliveryTerms: 'Standard (5-7 days)',
    validityPeriod: 30,
    depositRequired: false,
    depositPercentage: 50,
    currency: 'USD',
    notes: '',
    internalNotes: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders step title and description', () => {
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Terms & Notes')).toBeInTheDocument();
    expect(screen.getByText('Set payment terms, delivery options, and add any additional notes.')).toBeInTheDocument();
  });

  it('renders payment terms section', () => {
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Payment Terms')).toBeInTheDocument();
    expect(screen.getByTestId('payment-terms-select')).toBeInTheDocument();
  });

  it('calls onUpdate when payment terms change', async () => {
    const user = userEvent.setup();
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const select = screen.getByTestId('payment-terms-select');
    await user.selectOptions(select, 'Net 15');
    
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      paymentTerms: 'Net 15'
    }));
  });

  it('renders delivery terms section', () => {
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Delivery Terms')).toBeInTheDocument();
    expect(screen.getByTestId('delivery-terms-select')).toBeInTheDocument();
  });

  it('calls onUpdate when delivery terms change', async () => {
    const user = userEvent.setup();
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const select = screen.getByTestId('delivery-terms-select');
    await user.selectOptions(select, 'Express (2-3 days)');
    
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      deliveryTerms: 'Express (2-3 days)'
    }));
  });

  it('renders quote validity section', () => {
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Quote Validity')).toBeInTheDocument();
    expect(screen.getByTestId('validity-period-input')).toBeInTheDocument();
  });

  it('calls onUpdate when validity period changes', async () => {
    const user = userEvent.setup();
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const input = screen.getByTestId('validity-period-input');
    await user.clear(input);
    await user.type(input, '60');
    
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      validityPeriod: 60
    }));
  });

  it('renders deposit required checkbox', () => {
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Require deposit')).toBeInTheDocument();
    expect(screen.getByTestId('deposit-required-checkbox')).toBeInTheDocument();
  });

  it('shows deposit percentage input when deposit is required', async () => {
    const user = userEvent.setup();
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const checkbox = screen.getByTestId('deposit-required-checkbox');
    await user.click(checkbox);
    
    expect(screen.getByTestId('deposit-percentage-input')).toBeInTheDocument();
  });

  it('renders customer notes textarea', () => {
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Customer Notes')).toBeInTheDocument();
    expect(screen.getByTestId('customer-notes-textarea')).toBeInTheDocument();
  });

  it('calls onUpdate when customer notes change', async () => {
    const user = userEvent.setup();
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const textarea = screen.getByTestId('customer-notes-textarea');
    await user.type(textarea, 'Special delivery instructions');
    
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      notes: 'Special delivery instructions'
    }));
  });

  it('renders internal notes textarea', () => {
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Internal Notes')).toBeInTheDocument();
    expect(screen.getByTestId('internal-notes-textarea')).toBeInTheDocument();
  });

  it('calls onUpdate when internal notes change', async () => {
    const user = userEvent.setup();
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const textarea = screen.getByTestId('internal-notes-textarea');
    await user.type(textarea, 'Follow up required');
    
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      internalNotes: 'Follow up required'
    }));
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Failed to save terms';
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders pro tips section', () => {
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Pro Tips')).toBeInTheDocument();
  });

  it('shows ready to review status', () => {
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Ready to review')).toBeInTheDocument();
  });

  it('displays expiry date based on validity period', () => {
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText(/This quote will expire on/)).toBeInTheDocument();
  });

  it('shows character count for customer notes', () => {
    render(<TermsNotesStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText(/\/ 2000 characters/)).toBeInTheDocument();
  });
});
