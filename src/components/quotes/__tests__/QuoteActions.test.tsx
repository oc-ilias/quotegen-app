/**
 * Unit Tests for Quote Actions Component
 * @module components/quotes/__tests__/QuoteActions.test
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteActions } from '../QuoteActions';
import { QuoteStatus } from '@/types/quote';

// Mock the UI components
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, isLoading, variant, disabled }: any) => (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      data-variant={variant}
      data-loading={isLoading}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/Modal', () => ({
  Modal: ({ isOpen, onClose, title, children }: any) => 
    isOpen ? (
      <div data-testid="modal">
        <button onClick={onClose}>Close</button>
        <h3>{title}</h3>
        {children}
      </div>
    ) : null,
}));

describe('QuoteActions Component', () => {
  const defaultProps = {
    quoteId: 'quote-123',
    currentStatus: QuoteStatus.DRAFT,
    quoteNumber: 'QT-001',
    onStatusChange: jest.fn(),
    onEdit: jest.fn(),
    onView: jest.fn(),
    onDownload: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render without crashing', () => {
      render(<QuoteActions {...defaultProps} />);
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    test('should show edit button for draft status', () => {
      render(<QuoteActions {...defaultProps} currentStatus={QuoteStatus.DRAFT} />);
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    test('should show edit button for pending status', () => {
      render(<QuoteActions {...defaultProps} currentStatus={QuoteStatus.PENDING} />);
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    test('should not show edit button for sent status', () => {
      render(<QuoteActions {...defaultProps} currentStatus={QuoteStatus.SENT} />);
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    test('should show view button when onView is provided', () => {
      render(<QuoteActions {...defaultProps} />);
      expect(screen.getByText('View')).toBeInTheDocument();
    });

    test('should show download button when onDownload is provided', () => {
      render(<QuoteActions {...defaultProps} />);
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });

    test('should show action buttons based on status', () => {
      render(<QuoteActions {...defaultProps} currentStatus={QuoteStatus.DRAFT} />);
      expect(screen.getByText('Send Quote')).toBeInTheDocument();
      expect(screen.getByText('Save as Pending')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    test('should call onEdit when edit button is clicked', async () => {
      render(<QuoteActions {...defaultProps} />);
      await userEvent.click(screen.getByText('Edit'));
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });

    test('should call onView when view button is clicked', async () => {
      render(<QuoteActions {...defaultProps} />);
      await userEvent.click(screen.getByText('View'));
      expect(defaultProps.onView).toHaveBeenCalledTimes(1);
    });

    test('should call onDownload when download button is clicked', async () => {
      render(<QuoteActions {...defaultProps} />);
      await userEvent.click(screen.getByText('Download PDF'));
      expect(defaultProps.onDownload).toHaveBeenCalledTimes(1);
    });

    test('should call onStatusChange when action button is clicked', async () => {
      const onStatusChange = jest.fn().mockResolvedValue(undefined);
      render(
        <QuoteActions 
          {...defaultProps} 
          currentStatus={QuoteStatus.DRAFT}
          onStatusChange={onStatusChange}
        />
      );

      await userEvent.click(screen.getByText('Save as Pending'));
      
      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith(QuoteStatus.PENDING, undefined);
      });
    });
  });

  describe('Confirmation Dialog', () => {
    test('should show confirmation modal for irreversible actions', async () => {
      const onStatusChange = jest.fn().mockResolvedValue(undefined);
      render(
        <QuoteActions 
          {...defaultProps} 
          currentStatus={QuoteStatus.SENT}
          onStatusChange={onStatusChange}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Mark as Accepted' }));
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    test('should not show confirmation for reversible actions', async () => {
      render(<QuoteActions {...defaultProps} currentStatus={QuoteStatus.DRAFT} />);
      await userEvent.click(screen.getByText('Save as Pending'));
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    test('should close modal when cancel is clicked', async () => {
      render(<QuoteActions {...defaultProps} currentStatus={QuoteStatus.SENT} />);
      
      await userEvent.click(screen.getByText('Mark as Accepted'));
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      
      await userEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    test('should call onStatusChange with comment after confirmation', async () => {
      const onStatusChange = jest.fn().mockResolvedValue(undefined);
      render(
        <QuoteActions 
          {...defaultProps} 
          currentStatus={QuoteStatus.SENT}
          onStatusChange={onStatusChange}
        />
      );

      await userEvent.click(screen.getByText('Mark as Accepted'));
      
      // Type a comment
      const textarea = screen.getByPlaceholderText(/notes/i);
      await userEvent.type(textarea, 'Customer confirmed via email');

      // Click confirm
      const confirmButton = screen.getByText('Accept Quote');
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith(
          QuoteStatus.ACCEPTED,
          'Customer confirmed via email'
        );
      });
    });
  });

  describe('Loading States', () => {
    test('should disable buttons when isLoading is true', () => {
      render(<QuoteActions {...defaultProps} isLoading={true} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    test('should disable buttons during status change', async () => {
      const onStatusChange = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(
        <QuoteActions 
          {...defaultProps} 
          currentStatus={QuoteStatus.DRAFT}
          onStatusChange={onStatusChange}
        />
      );

      await userEvent.click(screen.getByText('Save as Pending'));

      // Check if buttons are in loading state
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('data-loading', 'true');
      });
    });
  });

  describe('Compact Variant', () => {
    test('should render compact variant', () => {
      render(<QuoteActions {...defaultProps} variant="compact" />);
      
      // In compact mode, buttons should have icons only
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
  });

  describe('Different Statuses', () => {
    const testCases = [
      {
        status: QuoteStatus.SENT,
        expectedActions: ['Mark as Viewed', 'Mark as Accepted', 'Mark as Declined', 'Mark as Expired'],
      },
      {
        status: QuoteStatus.VIEWED,
        expectedActions: ['Mark as Accepted', 'Mark as Declined', 'Mark as Expired'],
      },
      {
        status: QuoteStatus.EXPIRED,
        expectedActions: ['Resend Quote', 'Move to Draft'],
      },
      {
        status: QuoteStatus.REJECTED,
        expectedActions: ['Reopen as Draft'],
      },
    ];

    testCases.forEach(({ status, expectedActions }) => {
      test(`should show correct actions for ${status} status`, () => {
        render(
          <QuoteActions 
            {...defaultProps} 
            currentStatus={status}
            onEdit={undefined}
            onView={undefined}
            onDownload={undefined}
          />
        );

        expectedActions.forEach(action => {
          expect(screen.getByText(action)).toBeInTheDocument();
        });
      });
    });

    test('should show no actions for final statuses', () => {
      const { container } = render(
        <QuoteActions 
          {...defaultProps} 
          currentStatus={QuoteStatus.ACCEPTED}
          onEdit={undefined}
          onView={undefined}
          onDownload={undefined}
        />
      );

      // Should only have action buttons container but no buttons
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle status change errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const onStatusChange = jest.fn().mockRejectedValue(new Error('Update failed'));
      
      render(
        <QuoteActions 
          {...defaultProps} 
          currentStatus={QuoteStatus.DRAFT}
          onStatusChange={onStatusChange}
        />
      );

      await userEvent.click(screen.getByText('Save as Pending'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to change status:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });
});
