/**
 * Badge Component Test Suite
 * Comprehensive tests for Badge, StatusBadge, and PriorityBadge components
 * @module __tests__/components/ui/Badge
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { QuoteStatus, Priority } from '@/types/quote';

describe('Badge', () => {
  describe('Basic Rendering', () => {
    it('renders badge with text', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Badge className="custom-badge">Custom</Badge>);
      expect(screen.getByText('Custom')).toHaveClass('custom-badge');
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'primary', 'success', 'warning', 'danger', 'info'] as const;
    
    variants.forEach(variant => {
      it(`renders ${variant} variant`, () => {
        render(<Badge variant={variant}>{variant}</Badge>);
        expect(screen.getByText(variant)).toBeInTheDocument();
      });
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Badge size="sm">Small</Badge>);
      expect(screen.getByText('Small')).toBeInTheDocument();
    });

    it('renders medium size (default)', () => {
      render(<Badge>Medium</Badge>);
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('renders large size', () => {
      render(<Badge size="lg">Large</Badge>);
      expect(screen.getByText('Large')).toBeInTheDocument();
    });
  });

  describe('Dot Indicator', () => {
    it('renders with dot indicator', () => {
      render(<Badge dot>With Dot</Badge>);
      expect(screen.getByText('With Dot')).toBeInTheDocument();
    });

    it('renders with custom dot color', () => {
      render(<Badge dot dotColor="bg-red-500">Red Dot</Badge>);
      expect(screen.getByText('Red Dot')).toBeInTheDocument();
    });
  });

  describe('Rounded Styles', () => {
    it('renders with full rounded style', () => {
      render(<Badge rounded="full">Pill</Badge>);
      expect(screen.getByText('Pill')).toHaveClass('rounded-full');
    });

    it('renders with default rounded style', () => {
      render(<Badge>Default Round</Badge>);
      expect(screen.getByText('Default Round')).toBeInTheDocument();
    });
  });

  describe('Removable', () => {
    it('renders remove button when onRemove is provided', () => {
      const handleRemove = jest.fn();
      render(<Badge onRemove={handleRemove}>Removable</Badge>);
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    it('calls onRemove when remove button is clicked', () => {
      const handleRemove = jest.fn();
      render(<Badge onRemove={handleRemove}>Removable</Badge>);
      const removeButton = screen.getByRole('button', { name: /remove/i });
      removeButton.click();
      expect(handleRemove).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label when provided', () => {
      render(<Badge aria-label="5 notifications">5</Badge>);
      expect(screen.getByLabelText('5 notifications')).toBeInTheDocument();
    });

    it('supports role="status" for live regions', () => {
      render(<Badge role="status">Status</Badge>);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});

describe('StatusBadge', () => {
  describe('Quote Status Badges', () => {
    const statusTests = [
      { status: QuoteStatus.DRAFT, expectedLabel: 'Draft' },
      { status: QuoteStatus.PENDING, expectedLabel: 'Pending' },
      { status: QuoteStatus.SENT, expectedLabel: 'Sent' },
      { status: QuoteStatus.ACCEPTED, expectedLabel: 'Accepted' },
      { status: QuoteStatus.DECLINED, expectedLabel: 'Declined' },
      { status: QuoteStatus.EXPIRED, expectedLabel: 'Expired' },
      { status: QuoteStatus.REVISED, expectedLabel: 'Revised' },
    ];

    statusTests.forEach(({ status, expectedLabel }) => {
      it(`renders ${status} status correctly`, () => {
        render(<StatusBadge status={status} />);
        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      });
    });
  });

  describe('Customer Status Badges', () => {
    it('renders active customer status', () => {
      render(<StatusBadge status="active" type="customer" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders inactive customer status', () => {
      render(<StatusBadge status="inactive" type="customer" />);
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('renders lead customer status', () => {
      render(<StatusBadge status="lead" type="customer" />);
      expect(screen.getByText('Lead')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders small size', () => {
      render(<StatusBadge status={QuoteStatus.SENT} size="sm" />);
      expect(screen.getByText('Sent')).toBeInTheDocument();
    });

    it('renders large size', () => {
      render(<StatusBadge status={QuoteStatus.ACCEPTED} size="lg" />);
      expect(screen.getByText('Accepted')).toBeInTheDocument();
    });
  });
});

describe('PriorityBadge', () => {
  describe('Priority Levels', () => {
    it('renders low priority badge', () => {
      render(<PriorityBadge priority={Priority.LOW} />);
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('renders medium priority badge', () => {
      render(<PriorityBadge priority={Priority.MEDIUM} />);
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('renders high priority badge', () => {
      render(<PriorityBadge priority={Priority.HIGH} />);
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('renders urgent priority badge', () => {
      render(<PriorityBadge priority={Priority.URGENT} />);
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });
  });

  describe('With Dot Indicator', () => {
    it('renders with dot by default', () => {
      render(<PriorityBadge priority={Priority.HIGH} />);
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('renders without dot when showDot is false', () => {
      render(<PriorityBadge priority={Priority.LOW} showDot={false} />);
      expect(screen.getByText('Low')).toBeInTheDocument();
    });
  });
});
