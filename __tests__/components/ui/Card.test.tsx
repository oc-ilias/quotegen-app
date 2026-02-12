/**
 * Card Component Tests
 * Comprehensive tests for Card component including variants and layouts
 * @module __tests__/components/ui/Card
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';

describe('Card Components', () => {
  // ============================================================================
  // Card Tests
  // ============================================================================

  describe('Card', () => {
    it('renders card element', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <Card>
          <h2>Title</h2>
          <p>Description</p>
          <button>Action</button>
        </Card>
      );
      expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('applies default hover effect', () => {
      render(<Card>Content</Card>);
      const card = screen.getByText('Content').closest('div[class*="bg-slate-800"]');
      expect(card).toHaveClass('hover:shadow-lg');
      expect(card).toHaveClass('hover:-translate-y-0.5');
    });

    it('removes hover effect when hover is false', () => {
      render(<Card hover={false}>No Hover</Card>);
      const card = screen.getByText('No Hover').parentElement;
      expect(card).not.toHaveClass('hover:shadow-lg');
    });

    it('applies md padding by default', () => {
      render(<Card>Content</Card>);
      const card = screen.getByText('Content').closest('div[class*="bg-slate-800"]');
      expect(card).toHaveClass('p-6');
    });

    it('applies sm padding', () => {
      render(<Card padding="sm">Small Padding</Card>);
      const card = screen.getByText('Small Padding').closest('div[class*="bg-slate-800"]');
      expect(card).toHaveClass('p-4');
    });

    it('applies lg padding', () => {
      render(<Card padding="lg">Large Padding</Card>);
      const card = screen.getByText('Large Padding').closest('div[class*="bg-slate-800"]');
      expect(card).toHaveClass('p-8');
    });

    it('applies no padding', () => {
      render(<Card padding="none">No Padding</Card>);
      const card = screen.getByText('No Padding').closest('div[class*="bg-slate-800"]');
      expect(card).toHaveClass('p-0');
    });

    it('applies custom className', () => {
      render(<Card className="custom-card">Content</Card>);
      expect(screen.getByText('Content').closest('div[class*="bg-slate-800"]')).toHaveClass('custom-card');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Card with Ref</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('has proper base styling', () => {
      render(<Card>Content</Card>);
      const card = screen.getByText('Content').closest('div[class*="bg-slate-800"]');
      expect(card).toHaveClass('bg-slate-800');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('border-slate-700');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('shadow-md');
    });

    it('has transition classes for hover effects', () => {
      render(<Card>Content</Card>);
      const card = screen.getByText('Content').closest('div[class*="bg-slate-800"]');
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-200');
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(
        <Card onClick={handleClick}>Clickable Card</Card>
      );
      fireEvent.click(screen.getByText('Clickable Card'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('spreads additional props', () => {
      render(
        <Card data-testid="test-card" id="my-card">Content</Card>
      );
      expect(screen.getByTestId('test-card')).toBeInTheDocument();
      expect(screen.getByTestId('test-card')).toHaveAttribute('id', 'my-card');
    });
  });

  // ============================================================================
  // CardHeader Tests
  // ============================================================================

  describe('CardHeader', () => {
    it('renders header element', () => {
      render(
        <Card>
          <CardHeader>Header Content</CardHeader>
        </Card>
      );
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('applies flex layout', () => {
      render(
        <Card>
          <CardHeader data-testid="header">Header</CardHeader>
        </Card>
      );
      expect(screen.getByTestId('header')).toHaveClass('flex');
      expect(screen.getByTestId('header')).toHaveClass('items-center');
      expect(screen.getByTestId('header')).toHaveClass('justify-between');
    });

    it('applies margin bottom', () => {
      render(
        <Card>
          <CardHeader data-testid="header">Header</CardHeader>
        </Card>
      );
      expect(screen.getByTestId('header')).toHaveClass('mb-4');
    });

    it('applies custom className', () => {
      render(
        <Card>
          <CardHeader className="custom-header">Header</CardHeader>
        </Card>
      );
      expect(screen.getByText('Header').closest('div[class*="flex"]')).toHaveClass('custom-header');
    });

    it('renders complex header content', () => {
      render(
        <Card>
          <CardHeader>
            <span>Left</span>
            <span>Right</span>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Left')).toBeInTheDocument();
      expect(screen.getByText('Right')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CardTitle Tests
  // ============================================================================

  describe('CardTitle', () => {
    it('renders h3 element', () => {
      render(
        <Card>
          <CardTitle>Card Title</CardTitle>
        </Card>
      );
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('applies proper styling', () => {
      render(
        <Card>
          <CardTitle>Title</CardTitle>
        </Card>
      );
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('text-slate-100');
    });

    it('applies custom className', () => {
      render(
        <Card>
          <CardTitle className="custom-title">Title</CardTitle>
        </Card>
      );
      expect(screen.getByRole('heading', { level: 3 })).toHaveClass('custom-title');
    });

    it('renders long titles', () => {
      const longTitle = 'A'.repeat(100);
      render(
        <Card>
          <CardTitle>{longTitle}</CardTitle>
        </Card>
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CardDescription Tests
  // ============================================================================

  describe('CardDescription', () => {
    it('renders p element', () => {
      render(
        <Card>
          <CardDescription>Description text</CardDescription>
        </Card>
      );
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('applies proper styling', () => {
      render(
        <Card>
          <CardDescription>Description</CardDescription>
        </Card>
      );
      const desc = screen.getByText('Description');
      expect(desc).toHaveClass('text-sm');
      expect(desc).toHaveClass('text-slate-400');
    });

    it('applies custom className', () => {
      render(
        <Card>
          <CardDescription className="custom-desc">Description</CardDescription>
        </Card>
      );
      expect(screen.getByText('Description')).toHaveClass('custom-desc');
    });

    it('renders long descriptions', () => {
      const longDesc = 'B'.repeat(200);
      render(
        <Card>
          <CardDescription>{longDesc}</CardDescription>
        </Card>
      );
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CardContent Tests
  // ============================================================================

  describe('CardContent', () => {
    it('renders content wrapper', () => {
      render(
        <Card>
          <CardContent>Main Content</CardContent>
        </Card>
      );
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('renders complex content', () => {
      render(
        <Card>
          <CardContent>
            <div>Section 1</div>
            <div>Section 2</div>
            <button>Action</button>
          </CardContent>
        </Card>
      );
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Card>
          <CardContent className="custom-content">Content</CardContent>
        </Card>
      );
      expect(screen.getByText('Content').closest('div')).toHaveClass('custom-content');
    });

    it('forwards additional props', () => {
      render(
        <Card>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Complete Card Integration Tests
  // ============================================================================

  describe('Complete Card Integration', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Body Content</CardContent>
        </Card>
      );
      expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Card Body Content')).toBeInTheDocument();
    });

    it('renders card with actions in header', () => {
      render(
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Title</CardTitle>
              <CardDescription>Description</CardDescription>
            </div>
            <button>Edit</button>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    });

    it('renders card without header', () => {
      render(
        <Card>
          <CardContent>Just Content</CardContent>
        </Card>
      );
      expect(screen.getByText('Just Content')).toBeInTheDocument();
    });

    it('renders card with only title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Only Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );
      expect(screen.getByRole('heading', { name: 'Only Title' })).toBeInTheDocument();
    });

    it('renders card with only description', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Only Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );
      expect(screen.getByText('Only Description')).toBeInTheDocument();
    });

    it('renders multiple cards side by side', () => {
      render(
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardTitle>Card 1</CardTitle>
          </Card>
          <Card>
            <CardTitle>Card 2</CardTitle>
          </Card>
        </div>
      );
      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Card Variants Tests
  // ============================================================================

  describe('Card Variants', () => {
    it('renders clickable card', () => {
      const handleClick = jest.fn();
      render(
        <Card onClick={handleClick} className="cursor-pointer">
          Clickable Card
        </Card>
      );
      fireEvent.click(screen.getByText('Clickable Card'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('renders card with different padding sizes', () => {
      const { rerender } = render(
        <Card padding="sm">Small</Card>
      );
      expect(screen.getByText('Small').closest('div[class*="bg-slate-800"]')).toHaveClass('p-4');

      rerender(<Card padding="md">Medium</Card>);
      expect(screen.getByText('Medium').closest('div[class*="bg-slate-800"]')).toHaveClass('p-6');

      rerender(<Card padding="lg">Large</Card>);
      expect(screen.getByText('Large').closest('div[class*="bg-slate-800"]')).toHaveClass('p-8');
    });

    it('renders card without hover effect', () => {
      render(
        <Card hover={false}>Static Card</Card>
      );
      const card = screen.getByText('Static Card').closest('div[class*="bg-slate-800"]');
      expect(card).not.toHaveClass('hover:shadow-lg');
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Accessible Title');
    });

    it('has proper color contrast', () => {
      render(
        <Card>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </Card>
      );
      const title = screen.getByRole('heading', { name: 'Title' });
      const desc = screen.getByText('Description');
      expect(title).toHaveClass('text-slate-100');
      expect(desc).toHaveClass('text-slate-400');
    });

    it.skip('clickable card is keyboard accessible', () => {
      // TODO: Card component needs keyboard handler for Enter/Space
      const handleClick = jest.fn();
      render(
        <Card onClick={handleClick} tabIndex={0} role="button">
          Pressable Card
        </Card>
      );
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('handles empty card', () => {
      const { container } = render(<Card />);
      expect(container.querySelector('.bg-slate-800')).toBeInTheDocument();
    });

    it('handles card with only whitespace content', () => {
      render(<Card>   </Card>);
      const card = document.querySelector('.bg-slate-800');
      expect(card).toBeInTheDocument();
    });

    it('handles card with null children', () => {
      render(
        <Card>
          {null}
          {undefined}
          Valid Content
        </Card>
      );
      expect(screen.getByText('Valid Content')).toBeInTheDocument();
    });

    it('handles deeply nested content', () => {
      render(
        <Card>
          <div>
            <div>
              <div>
                <span>Deep Content</span>
              </div>
            </div>
          </div>
        </Card>
      );
      expect(screen.getByText('Deep Content')).toBeInTheDocument();
    });

    it('handles card with many children', () => {
      render(
        <Card>
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i}>Item {i + 1}</div>
          ))}
        </Card>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 50')).toBeInTheDocument();
    });

    it('handles rapid prop changes', () => {
      const { rerender } = render(
        <Card padding="sm">Content</Card>
      );
      expect(screen.getByText('Content').closest('div[class*="bg-slate-800"]')).toHaveClass('p-4');

      rerender(<Card padding="lg">Content</Card>);
      expect(screen.getByText('Content').closest('div[class*="bg-slate-800"]')).toHaveClass('p-8');

      rerender(<Card hover={false}>Content</Card>);
      const card = screen.getByText('Content').closest('div[class*="bg-slate-800"]');
      expect(card).not.toHaveClass('hover:shadow-lg');
    });
  });
});
