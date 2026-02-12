/**
 * Badge Component Tests
 * @module __tests__/components/ui/Badge
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { QuoteStatus } from '@/types/quote';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ============================================================================
// Badge Tests
// ============================================================================

describe('Badge', () => {
  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Badge>Test Badge</Badge>);
      
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('renders with different variants', () => {
      const { rerender } = render(<Badge variant="success">Success</Badge>);
      expect(screen.getByText('Success')).toHaveClass('bg-emerald-500/10');

      rerender(<Badge variant="error">Error</Badge>);
      expect(screen.getByText('Error')).toHaveClass('bg-red-500/10');

      rerender(<Badge variant="warning">Warning</Badge>);
      expect(screen.getByText('Warning')).toHaveClass('bg-amber-500/10');

      rerender(<Badge variant="info">Info</Badge>);
      expect(screen.getByText('Info')).toHaveClass('bg-blue-500/10');

      rerender(<Badge variant="primary">Primary</Badge>);
      expect(screen.getByText('Primary')).toHaveClass('bg-indigo-500/10');
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<Badge size="sm">Small</Badge>);
      expect(screen.getByText('Small')).toHaveClass('text-xs');

      rerender(<Badge size="md">Medium</Badge>);
      expect(screen.getByText('Medium')).toHaveClass('text-sm');

      rerender(<Badge size="lg">Large</Badge>);
      expect(screen.getByText('Large')).toHaveClass('text-base');
    });

    it('renders with dot indicator', () => {
      render(<Badge variant="success" dot>With Dot</Badge>);
      
      const badge = screen.getByText('With Dot').parentElement;
      const dot = badge?.querySelector('span');
      expect(dot).toHaveClass('rounded-full');
    });

    it('applies custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>);
      
      expect(screen.getByText('Custom')).toHaveClass('custom-class');
    });
  });

  // ==========================================================================
  // Forward Ref Tests
  // ==========================================================================

  describe('forward ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Badge ref={ref}>Ref Test</Badge>);
      
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  // ==========================================================================
  // Animation Tests
  // ==========================================================================

  describe('animation', () => {
    it('renders with animation when animate prop is true', () => {
      render(<Badge animate={true}>Animated</Badge>);
      
      expect(screen.getByText('Animated')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// StatusBadge Tests
// ============================================================================

describe('StatusBadge', () => {
  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('rendering', () => {
    it('renders with correct status label', () => {
      render(<StatusBadge status={QuoteStatus.ACCEPTED} />);
      
      expect(screen.getByText('Accepted')).toBeInTheDocument();
    });

    it('renders all QuoteStatus values', () => {
      const statuses = Object.values(QuoteStatus);
      
      statuses.forEach((status) => {
        const { unmount } = render(<StatusBadge status={status} />);
        const label = status.charAt(0).toUpperCase() + status.slice(1);
        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });

    it('handles extended status values', () => {
      const { rerender } = render(<StatusBadge status="declined" />);
      expect(screen.getByText('Declined')).toBeInTheDocument();

      rerender(<StatusBadge status="sent" />);
      expect(screen.getByText('Sent')).toBeInTheDocument();

      rerender(<StatusBadge status="viewed" />);
      expect(screen.getByText('Viewed')).toBeInTheDocument();

      rerender(<StatusBadge status="expired" />);
      expect(screen.getByText('Expired')).toBeInTheDocument();

      rerender(<StatusBadge status="draft" />);
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('handles unknown status gracefully', () => {
      render(<StatusBadge status="unknown_status" />);
      
      expect(screen.getByText('unknown_status')).toBeInTheDocument();
    });

    it('applies correct color for each status', () => {
      const { rerender, container } = render(<StatusBadge status={QuoteStatus.ACCEPTED} />);
      expect(container.querySelector('.bg-emerald-500\\/10')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.REJECTED} />);
      expect(container.querySelector('.bg-red-500\\/10')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.PENDING} />);
      expect(container.querySelector('.bg-amber-500\\/10')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.SENT} />);
      expect(container.querySelector('.bg-indigo-500\\/10')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.VIEWED} />);
      expect(container.querySelector('.bg-purple-500\\/10')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.DRAFT} />);
      expect(container.querySelector('.bg-slate-500\\/10')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.EXPIRED} />);
      expect(container.querySelector('.bg-gray-500\\/10')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.CONVERTED} />);
      expect(container.querySelector('.bg-blue-500\\/10')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const { rerender, container } = render(<StatusBadge status={QuoteStatus.ACCEPTED} size="sm" />);
      expect(container.querySelector('.text-xs')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.ACCEPTED} size="md" />);
      expect(container.querySelector('.text-sm')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.ACCEPTED} size="lg" />);
      expect(container.querySelector('.text-base')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <StatusBadge status={QuoteStatus.ACCEPTED} className="custom-class" />
      );
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Status Dot Tests
  // ==========================================================================

  describe('status dot', () => {
    it('renders colored dot for each status', () => {
      const { rerender } = render(<StatusBadge status={QuoteStatus.ACCEPTED} />);
      const acceptedBadge = screen.getByText('Accepted').parentElement;
      expect(acceptedBadge?.querySelector('.bg-emerald-500')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.REJECTED} />);
      const rejectedBadge = screen.getByText('Rejected').parentElement;
      expect(rejectedBadge?.querySelector('.bg-red-500')).toBeInTheDocument();

      rerender(<StatusBadge status={QuoteStatus.PENDING} />);
      const pendingBadge = screen.getByText('Pending').parentElement;
      expect(pendingBadge?.querySelector('.bg-amber-500')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Animation Tests
  // ==========================================================================

  describe('animation', () => {
    it('supports animateOnChange prop', async () => {
      const { rerender } = render(
        <StatusBadge 
          status={QuoteStatus.PENDING} 
          animateOnChange={true} 
        />
      );
      
      expect(screen.getByText('Pending')).toBeInTheDocument();

      rerender(
        <StatusBadge 
          status={QuoteStatus.ACCEPTED} 
          animateOnChange={true} 
        />
      );

      // Wait for animation to complete
      await waitFor(() => {
        expect(screen.getByText('Accepted')).toBeInTheDocument();
      }, { timeout: 300 });
    });

    it('supports pulse animation', () => {
      render(
        <StatusBadge 
          status={QuoteStatus.PENDING} 
          pulse={true} 
        />
      );
      
      const badge = screen.getByText('Pending').parentElement;
      const dot = badge?.querySelector('span');
      expect(dot).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Forward Ref Tests
  // ==========================================================================

  describe('forward ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<StatusBadge ref={ref} status={QuoteStatus.ACCEPTED} />);
      
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });
});

// ============================================================================
// PriorityBadge Tests
// ============================================================================

describe('PriorityBadge', () => {
  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('rendering', () => {
    it('renders with correct priority label', () => {
      render(<PriorityBadge priority="high" />);
      
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('renders all priority levels', () => {
      const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
      
      priorities.forEach((priority) => {
        const { unmount } = render(<PriorityBadge priority={priority} />);
        const label = priority.charAt(0).toUpperCase() + priority.slice(1);
        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });

    it('applies correct color for each priority', () => {
      const { rerender, container } = render(<PriorityBadge priority="low" />);
      expect(container.querySelector('.bg-slate-500\\/10')).toBeInTheDocument();

      rerender(<PriorityBadge priority="medium" />);
      expect(container.querySelector('.bg-blue-500\\/10')).toBeInTheDocument();

      rerender(<PriorityBadge priority="high" />);
      expect(container.querySelector('.bg-amber-500\\/10')).toBeInTheDocument();

      rerender(<PriorityBadge priority="urgent" />);
      expect(container.querySelector('.bg-red-500\\/10')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const { rerender, container } = render(<PriorityBadge priority="high" size="sm" />);
      expect(container.querySelector('.text-xs')).toBeInTheDocument();

      rerender(<PriorityBadge priority="high" size="md" />);
      expect(container.querySelector('.text-sm')).toBeInTheDocument();

      rerender(<PriorityBadge priority="high" size="lg" />);
      expect(container.querySelector('.text-base')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <PriorityBadge priority="urgent" className="custom-class" />
      );
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Animation Tests
  // ==========================================================================

  describe('animation', () => {
    it('supports animateOnChange prop', () => {
      const { rerender } = render(
        <PriorityBadge 
          priority="low" 
          animateOnChange={true} 
        />
      );
      
      expect(screen.getByText('Low')).toBeInTheDocument();

      rerender(
        <PriorityBadge 
          priority="urgent" 
          animateOnChange={true} 
        />
      );

      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Forward Ref Tests
  // ==========================================================================

  describe('forward ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<PriorityBadge ref={ref} priority="high" />);
      
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });
});
