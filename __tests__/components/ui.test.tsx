/**
 * UI Components Test Suite
 * Comprehensive tests for all UI components
 * @module __tests__/components/ui
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { motion } from 'framer-motion';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ============================================================================
// Button Tests
// ============================================================================

import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading spinner when isLoading', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-indigo-500');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

// ============================================================================
// Card Tests
// ============================================================================

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>Card Content</Card>
    );
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies hover effect when hover prop is true', () => {
    render(<Card hover>Hover Card</Card>);
    expect(screen.getByText('Hover Card').parentElement).toHaveClass('hover:shadow-lg');
  });

  it('applies correct padding based on padding prop', () => {
    const { rerender } = render(<Card padding="sm">Small Padding</Card>);
    expect(screen.getByText('Small Padding').parentElement).toHaveClass('p-4');

    rerender(<Card padding="lg">Large Padding</Card>);
    expect(screen.getByText('Large Padding').parentElement).toHaveClass('p-8');
  });

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Card</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

// ============================================================================
// Badge Tests
// ============================================================================

import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { QuoteStatus } from '@/types/quote';

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Badge Content</Badge>);
    expect(screen.getByText('Badge Content')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-emerald-500/10');

    rerender(<Badge variant="error">Error</Badge>);
    expect(screen.getByText('Error')).toHaveClass('bg-red-500/10');
  });

  it('shows dot indicator when dot prop is true', () => {
    render(<Badge variant="success" dot>With Dot</Badge>);
    const badge = screen.getByText('With Dot').parentElement;
    expect(badge?.querySelector('span')).toBeInTheDocument();
  });
});

describe('StatusBadge', () => {
  it('renders with correct status label', () => {
    render(<StatusBadge status={QuoteStatus.ACCEPTED} />);
    expect(screen.getByText('Accepted')).toBeInTheDocument();
  });

  it('applies correct color for each status', () => {
    const { rerender } = render(<StatusBadge status={QuoteStatus.ACCEPTED} />);
    expect(screen.getByText('Accepted')).toHaveClass('bg-emerald-500/10');

    rerender(<StatusBadge status={QuoteStatus.REJECTED} />);
    expect(screen.getByText('Rejected')).toHaveClass('bg-red-500/10');

    rerender(<StatusBadge status={QuoteStatus.PENDING} />);
    expect(screen.getByText('Pending')).toHaveClass('bg-amber-500/10');
  });

  it('handles unknown status gracefully', () => {
    render(<StatusBadge status="unknown" />);
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });
});

describe('PriorityBadge', () => {
  it('renders with correct priority label', () => {
    render(<PriorityBadge priority="high" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('applies correct color for each priority', () => {
    const { rerender } = render(<PriorityBadge priority="urgent" />);
    expect(screen.getByText('Urgent')).toHaveClass('bg-red-500/10');

    rerender(<PriorityBadge priority="low" />);
    expect(screen.getByText('Low')).toHaveClass('bg-slate-500/10');
  });
});

// ============================================================================
// Input Tests
// ============================================================================

import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

// ============================================================================
// Skeleton Tests
// ============================================================================

import { Skeleton, CardSkeleton, StatCardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

describe('Skeleton', () => {
  it('renders with pulse animation by default', () => {
    render(<Skeleton />);
    expect(screen.getByRole('generic')).toHaveClass('animate-pulse');
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Skeleton variant="circular" />);
    expect(screen.getByRole('generic')).toHaveClass('rounded-full');

    rerender(<Skeleton variant="rectangular" />);
    expect(screen.getByRole('generic')).toHaveClass('rounded-none');
  });

  it('applies custom width and height', () => {
    render(<Skeleton width={100} height={50} />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
  });
});

describe('CardSkeleton', () => {
  it('renders card structure', () => {
    render(<CardSkeleton />);
    expect(document.querySelector('.bg-slate-900\\/50')).toBeInTheDocument();
  });

  it('renders with header when header prop is true', () => {
    render(<CardSkeleton header={true} />);
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('StatCardSkeleton', () => {
  it('renders stat card structure', () => {
    render(<StatCardSkeleton color="blue" />);
    expect(document.querySelector('.border-blue-500\\/20')).toBeInTheDocument();
  });
});

describe('TableSkeleton', () => {
  it('renders table rows', () => {
    render(<TableSkeleton rows={3} columns={4} />);
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Toast Tests
// ============================================================================

import { ToastProvider, useToast, useToastHelpers } from '@/components/ui/Toast';

const TestComponent = () => {
  const { addToast, toasts } = useToast();
  const { success, error } = useToastHelpers();

  return (
    <div>
      <button onClick={() => addToast({ type: 'info', title: 'Test' })} data-testid="add-toast">
        Add Toast
      </button>
      <button onClick={() => success('Success!')} data-testid="success-toast">
        Success
      </button>
      <button onClick={() => error('Error!')} data-testid="error-toast">
        Error
      </button>
      <div data-testid="toast-count">{toasts.length}</div>
    </div>
  );
};

describe('Toast', () => {
  it('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');
    
    consoleError.mockRestore();
  });

  it('adds toast when addToast is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('add-toast'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });

  it('adds success toast with helper', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('success-toast'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });
});
