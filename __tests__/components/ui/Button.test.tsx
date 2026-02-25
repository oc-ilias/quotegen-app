/**
 * Button Component Test Suite
 * Comprehensive tests for Button component with all variants and states
 * @module __tests__/components/ui/Button
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  describe('Basic Rendering', () => {
    it('renders button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders button with custom className', () => {
      render(<Button className="custom-class">Test</Button>);
      expect(screen.getByText('Test')).toHaveClass('custom-class');
    });

    it('renders as disabled', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByText('Disabled')).toBeDisabled();
    });

    it('renders with aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>);
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders primary variant', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByText('Primary');
      expect(button).toBeInTheDocument();
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByText('Secondary');
      expect(button).toBeInTheDocument();
    });

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByText('Outline');
      expect(button).toBeInTheDocument();
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByText('Ghost');
      expect(button).toBeInTheDocument();
    });

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByText('Danger');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByText('Small')).toBeInTheDocument();
    });

    it('renders medium size (default)', () => {
      render(<Button>Medium</Button>);
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByText('Large')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders loading spinner when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>);
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('disables button when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>);
      expect(screen.getByText('Loading')).toBeDisabled();
    });

    it('shows loading text when provided', () => {
      render(<Button isLoading loadingText="Saving...">Save</Button>);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Icon Support', () => {
    it('renders with left icon', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      render(<Button leftIcon={<LeftIcon />}>With Icon</Button>);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      render(<Button rightIcon={<RightIcon />}>With Icon</Button>);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('renders icon only button', () => {
      const Icon = () => <span data-testid="icon">⚙</span>;
      render(<Button iconOnly aria-label="Settings"><Icon /></Button>);
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByText('Click'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      fireEvent.click(screen.getByText('Disabled'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} isLoading>Loading</Button>);
      fireEvent.click(screen.getByText('Loading'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Type Attribute', () => {
    it('renders with type="button" by default', () => {
      render(<Button>Default</Button>);
      expect(screen.getByText('Default')).toHaveAttribute('type', 'button');
    });

    it('renders with type="submit"', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByText('Submit')).toHaveAttribute('type', 'submit');
    });

    it('renders with type="reset"', () => {
      render(<Button type="reset">Reset</Button>);
      expect(screen.getByText('Reset')).toHaveAttribute('type', 'reset');
    });
  });

  describe('Full Width', () => {
    it('renders full width when isFullWidth is true', () => {
      render(<Button isFullWidth>Full Width</Button>);
      expect(screen.getByText('Full Width')).toHaveClass('w-full');
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByText('Focusable');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('has correct role', () => {
      render(<Button>Role Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with aria-pressed for toggle buttons', () => {
      render(<Button aria-pressed="true">Toggle</Button>);
      expect(screen.getByText('Toggle')).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders with aria-expanded for dropdown triggers', () => {
      render(<Button aria-expanded="false">Menu</Button>);
      expect(screen.getByText('Menu')).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Edge Cases', () => {
    it('renders with children as React elements', () => {
      render(
        <Button>
          <span>Complex</span> <strong>Children</strong>
        </Button>
      );
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Children')).toBeInTheDocument();
    });

    it('handles rapid clicks gracefully', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Rapid</Button>);
      const button = screen.getByText('Rapid');
      
      // Simulate rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('renders with data-testid', () => {
      render(<Button data-testid="test-button">Test</Button>);
      expect(screen.getByTestId('test-button')).toBeInTheDocument();
    });
  });
});
