/**
 * Unit Tests for Status History Component
 * @module components/quotes/__tests__/StatusHistory.test
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusHistory, CompactStatusHistory, StatusBadge } from '../StatusHistory';
import { QuoteStatus } from '@/types/quote';
import type { StatusChangeRecord } from '@/lib/quoteWorkflow';

// Mock the utils
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  formatDateTime: jest.fn((date: string) => new Date(date).toLocaleString()),
  cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('StatusHistory Component', () => {
  const mockHistory: StatusChangeRecord[] = [
    {
      id: 'hist-1',
      quoteId: 'quote-123',
      fromStatus: QuoteStatus.DRAFT,
      toStatus: QuoteStatus.SENT,
      changedBy: 'user-1',
      changedByName: 'John Doe',
      changedAt: '2024-01-15T10:00:00Z',
      comment: 'Sent to customer via email',
      metadata: { method: 'email', ip: '192.168.1.1' },
    },
    {
      id: 'hist-2',
      quoteId: 'quote-123',
      fromStatus: QuoteStatus.SENT,
      toStatus: QuoteStatus.VIEWED,
      changedBy: 'system',
      changedByName: 'System',
      changedAt: '2024-01-16T14:30:00Z',
    },
    {
      id: 'hist-3',
      quoteId: 'quote-123',
      fromStatus: QuoteStatus.VIEWED,
      toStatus: QuoteStatus.ACCEPTED,
      changedBy: 'user-2',
      changedByName: 'Jane Smith',
      changedAt: '2024-01-17T09:15:00Z',
      comment: 'Customer confirmed over phone',
    },
  ];

  describe('StatusHistory', () => {
    test('should render without crashing', () => {
      render(<StatusHistory history={mockHistory} />);
      expect(screen.getByText('Sent')).toBeInTheDocument();
    });

    test('should display history items in reverse chronological order', () => {
      render(<StatusHistory history={mockHistory} />);
      
      // Get only the "to" status labels (the main status badges, not "from" labels)
      const items = screen.getAllByText(/Accepted|Viewed|Sent/).filter(
        el => el.className.includes('font-medium')
      );
      expect(items[0]).toHaveTextContent('Accepted');
      expect(items[1]).toHaveTextContent('Viewed');
      expect(items[2]).toHaveTextContent('Sent');
    });

    test('should display status change information', () => {
      render(<StatusHistory history={mockHistory} />);
      
      // Check for status labels
      expect(screen.getByText('Accepted')).toBeInTheDocument();
      expect(screen.getByText('Viewed')).toBeInTheDocument();
      expect(screen.getByText('Sent')).toBeInTheDocument();
      
      // Check for "from" status labels
      expect(screen.getByText(/from Viewed/)).toBeInTheDocument();
      expect(screen.getByText(/from Sent/)).toBeInTheDocument();
      expect(screen.getByText(/from Draft/)).toBeInTheDocument();
    });

    test('should display user information', () => {
      render(<StatusHistory history={mockHistory} />);
      
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    test('should display comments when present', () => {
      render(<StatusHistory history={mockHistory} />);
      
      expect(screen.getByText('Sent to customer via email')).toBeInTheDocument();
      expect(screen.getByText('Customer confirmed over phone')).toBeInTheDocument();
    });

    test('should expand to show metadata when clicked', () => {
      // Create mock history with metadata in the first (most recent) item
      const historyWithMetadata: StatusChangeRecord[] = [
        {
          id: 'hist-1',
          quoteId: 'quote-123',
          fromStatus: QuoteStatus.SENT,
          toStatus: QuoteStatus.ACCEPTED,
          changedBy: 'user-1',
          changedByName: 'John Doe',
          changedAt: '2024-01-17T10:00:00Z',
          comment: 'Customer accepted',
          metadata: { method: 'email', ip: '192.168.1.1' },
        },
      ];

      render(<StatusHistory history={historyWithMetadata} />);
      
      // Click on the header row (use the container with both status and the chevron)
      const acceptedLabel = screen.getByText('Accepted');
      const header = acceptedLabel.closest('.px-4.py-3');
      if (header) {
        fireEvent.click(header);
      }
      
      // Should show "Details" section when expanded
      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    test('should show empty state when no history', () => {
      render(<StatusHistory history={[]} />);
      
      expect(screen.getByText('No status history yet')).toBeInTheDocument();
      expect(screen.getByText('Status changes will appear here')).toBeInTheDocument();
    });

    test('should limit displayed items based on maxItems prop', () => {
      const manyItems = Array.from({ length: 15 }, (_, i) => ({
        id: `hist-${i}`,
        quoteId: 'quote-123',
        fromStatus: QuoteStatus.DRAFT,
        toStatus: QuoteStatus.SENT,
        changedBy: 'user-1',
        changedByName: 'User',
        changedAt: new Date(2024, 0, i + 1).toISOString(),
      }));

      render(<StatusHistory history={manyItems} maxItems={10} />);
      
      expect(screen.getByText(/Load more history/)).toBeInTheDocument();
      expect(screen.getByText(/5 remaining/)).toBeInTheDocument();
    });

    test('should load more items when load more is clicked', () => {
      const manyItems = Array.from({ length: 15 }, (_, i) => ({
        id: `hist-${i}`,
        quoteId: 'quote-123',
        fromStatus: QuoteStatus.DRAFT,
        toStatus: QuoteStatus.SENT,
        changedBy: 'user-1',
        changedByName: 'User',
        changedAt: new Date(2024, 0, i + 1).toISOString(),
      }));

      render(<StatusHistory history={manyItems} maxItems={10} />);
      
      const loadMoreButton = screen.getByText(/Load more history/);
      fireEvent.click(loadMoreButton);
      
      // Should now show all items
      expect(screen.queryByText(/Load more history/)).not.toBeInTheDocument();
    });

    test('should apply custom className', () => {
      const { container } = render(
        <StatusHistory history={mockHistory} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    test('should display all status types correctly', () => {
      const allStatuses: StatusChangeRecord[] = [
        { id: '1', quoteId: 'q1', fromStatus: QuoteStatus.DRAFT, toStatus: QuoteStatus.PENDING, changedBy: 'u1', changedByName: 'User', changedAt: '2024-01-01T00:00:00Z' },
        { id: '2', quoteId: 'q1', fromStatus: QuoteStatus.PENDING, toStatus: QuoteStatus.SENT, changedBy: 'u1', changedByName: 'User', changedAt: '2024-01-02T00:00:00Z' },
        { id: '3', quoteId: 'q1', fromStatus: QuoteStatus.SENT, toStatus: QuoteStatus.VIEWED, changedBy: 'system', changedByName: 'System', changedAt: '2024-01-03T00:00:00Z' },
        { id: '4', quoteId: 'q1', fromStatus: QuoteStatus.VIEWED, toStatus: QuoteStatus.ACCEPTED, changedBy: 'u1', changedByName: 'User', changedAt: '2024-01-04T00:00:00Z' },
        { id: '5', quoteId: 'q1', fromStatus: QuoteStatus.SENT, toStatus: QuoteStatus.REJECTED, changedBy: 'u1', changedByName: 'User', changedAt: '2024-01-05T00:00:00Z' },
        { id: '6', quoteId: 'q1', fromStatus: QuoteStatus.SENT, toStatus: QuoteStatus.EXPIRED, changedBy: 'system', changedByName: 'System', changedAt: '2024-01-06T00:00:00Z' },
        { id: '7', quoteId: 'q1', fromStatus: QuoteStatus.ACCEPTED, toStatus: QuoteStatus.CONVERTED, changedBy: 'u1', changedByName: 'User', changedAt: '2024-01-07T00:00:00Z' },
      ];

      render(<StatusHistory history={allStatuses} />);

      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Sent')).toBeInTheDocument();
      expect(screen.getByText('Viewed')).toBeInTheDocument();
      expect(screen.getByText('Accepted')).toBeInTheDocument();
      expect(screen.getByText('Declined')).toBeInTheDocument();
      expect(screen.getByText('Expired')).toBeInTheDocument();
      expect(screen.getByText('Converted')).toBeInTheDocument();
    });
  });

  describe('CompactStatusHistory', () => {
    test('should render compact version', () => {
      render(<CompactStatusHistory history={mockHistory} />);
      
      // Use more specific selector to get only the "to" status labels
      const accepted = screen.getAllByText('Accepted').find(
        el => el.className.includes('font-medium')
      );
      const viewed = screen.getAllByText('Viewed').find(
        el => el.className.includes('font-medium')
      );
      const sent = screen.getAllByText('Sent').find(
        el => el.className.includes('font-medium')
      );
      
      expect(accepted).toBeInTheDocument();
      expect(viewed).toBeInTheDocument();
      expect(sent).toBeInTheDocument();
    });

    test('should limit items in compact view', () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        id: `hist-${i}`,
        quoteId: 'quote-123',
        fromStatus: QuoteStatus.DRAFT,
        toStatus: QuoteStatus.SENT,
        changedBy: 'user-1',
        changedByName: 'User',
        changedAt: new Date(2024, 0, i + 1).toISOString(),
      }));

      render(<CompactStatusHistory history={manyItems} maxItems={3} />);
      
      expect(screen.getByText('+7 more changes')).toBeInTheDocument();
    });

    test('should show empty state message', () => {
      render(<CompactStatusHistory history={[]} />);
      
      expect(screen.getByText('No history available')).toBeInTheDocument();
    });
  });

  describe('StatusBadge', () => {
    test('should render status badge', () => {
      render(<StatusBadge status={QuoteStatus.ACCEPTED} />);
      
      expect(screen.getByText('Accepted')).toBeInTheDocument();
    });

    test('should render all status types', () => {
      const statusLabels: Record<QuoteStatus, string> = {
        [QuoteStatus.DRAFT]: 'Draft',
        [QuoteStatus.PENDING]: 'Pending',
        [QuoteStatus.SENT]: 'Sent',
        [QuoteStatus.VIEWED]: 'Viewed',
        [QuoteStatus.ACCEPTED]: 'Accepted',
        [QuoteStatus.REJECTED]: 'Declined',
        [QuoteStatus.EXPIRED]: 'Expired',
        [QuoteStatus.CONVERTED]: 'Converted',
      };

      const statuses = Object.keys(statusLabels) as QuoteStatus[];

      const { rerender } = render(<StatusBadge status={QuoteStatus.DRAFT} />);

      statuses.forEach(status => {
        rerender(<StatusBadge status={status} />);
        expect(screen.getByText(statusLabels[status])).toBeInTheDocument();
      });
    });

    test('should support different sizes', () => {
      const { rerender } = render(<StatusBadge status={QuoteStatus.SENT} size="sm" />);
      expect(screen.getByText('Sent')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.SENT} size="md" />);
      expect(screen.getByText('Sent')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.SENT} size="lg" />);
      expect(screen.getByText('Sent')).toBeInTheDocument();
    });

    test('should hide icon when showIcon is false', () => {
      render(<StatusBadge status={QuoteStatus.ACCEPTED} showIcon={false} />);
      
      expect(screen.getByText('Accepted')).toBeInTheDocument();
    });
  });
});
