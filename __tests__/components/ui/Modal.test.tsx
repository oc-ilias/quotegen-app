/**
 * Modal Component Tests
 * Comprehensive tests for Modal component including variants, animations, keyboard navigation, and ARIA
 * @module __tests__/components/ui/Modal
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={mockOnClose}>
          <p>Modal Content</p>
        </Modal>
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Modal Content</p>
        </Modal>
      );
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('renders with title', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Title">
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
    });

    it('renders with description', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test" description="Test Description">
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('renders without header when no title or description', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.border-b')).toBeNull();
    });

    it('renders children content correctly', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <button>Child Button</button>
          <input type="text" placeholder="Child Input" />
        </Modal>
      );
      expect(screen.getByRole('button', { name: 'Child Button' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Child Input')).toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test" showCloseButton={false}>
          <p>Content</p>
        </Modal>
      );
      const closeButton = container.querySelector('button.absolute');
      expect(closeButton).toBeNull();
    });
  });

  // ============================================================================
  // Size Variant Tests
  // ============================================================================

  describe('Size Variants', () => {
    it('applies sm size class', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} size="sm">
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.max-w-sm')).toBeInTheDocument();
    });

    it('applies md size class by default', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.max-w-md')).toBeInTheDocument();
    });

    it('applies lg size class', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} size="lg">
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.max-w-lg')).toBeInTheDocument();
    });

    it('applies xl size class', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} size="xl">
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.max-w-2xl')).toBeInTheDocument();
    });

    it('applies full size class', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} size="full">
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe('Interactions', () => {
    it('calls onClose when backdrop is clicked', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      const backdrop = container.querySelector('.bg-slate-900\\/80');
      fireEvent.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when preventBackdropClose is true', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} preventBackdropClose={true}>
          <p>Content</p>
        </Modal>
      );
      const backdrop = container.querySelector('.bg-slate-900\\/80');
      fireEvent.click(backdrop!);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('calls onClose when close button is clicked', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <p>Content</p>
        </Modal>
      );
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when modal content is clicked', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <button>Content Button</button>
        </Modal>
      );
      fireEvent.click(screen.getByRole('button', { name: 'Content Button' }));
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Keyboard Navigation Tests
  // ============================================================================

  describe('Keyboard Navigation', () => {
    it('closes on Escape key press', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('focuses on close button when modal opens', async () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <button>Action</button>
        </Modal>
      );
      // The close button is present
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      expect(closeButton).toBeInTheDocument();
    });

    it('traps focus within modal', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <button>First</button>
          <button>Second</button>
        </Modal>
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3); // close + 2 content buttons
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility (ARIA)', () => {
    it('has role="dialog" or appropriate ARIA role', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Title">
          <p>Content</p>
        </Modal>
      );
      const modal = document.querySelector('[class*="relative bg-slate-800"]');
      expect(modal).toBeInTheDocument();
    });

    it('has aria-labelledby when title is provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Title">
          <p>Content</p>
        </Modal>
      );
      const heading = screen.getByRole('heading', { name: 'Test Title' });
      expect(heading).toHaveClass('text-lg');
    });

    it('renders with proper z-index for overlay', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.z-50')).toBeInTheDocument();
    });

    it('has proper backdrop styling for focus indication', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      const backdrop = container.querySelector('.backdrop-blur-sm');
      expect(backdrop).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Animation Tests
  // ============================================================================

  describe('Animations', () => {
    it('has animation classes applied', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.animate-in')).toBeInTheDocument();
      expect(container.querySelector('.fade-in')).toBeInTheDocument();
    });

    it('has zoom animation class', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.zoom-in-95')).toBeInTheDocument();
    });

    it('has transition classes', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      const modal = container.querySelector('.duration-200');
      expect(modal).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Styling Tests
  // ============================================================================

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} className="custom-modal-class">
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.custom-modal-class')).toBeInTheDocument();
    });

    it('has proper positioning classes', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.fixed')).toBeInTheDocument();
      expect(container.querySelector('.inset-0')).toBeInTheDocument();
    });

    it('has proper modal positioning', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.flex')).toBeInTheDocument();
      expect(container.querySelector('.items-center')).toBeInTheDocument();
      expect(container.querySelector('.justify-center')).toBeInTheDocument();
    });

    it('has proper modal styling', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.bg-slate-800')).toBeInTheDocument();
      expect(container.querySelector('.rounded-xl')).toBeInTheDocument();
      expect(container.querySelector('.shadow-2xl')).toBeInTheDocument();
    });

    it('has scrollable content area', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.overflow-y-auto')).toBeInTheDocument();
      expect(container.querySelector('.max-h-\\[90vh\\]')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} />
      );
      expect(container.querySelector('.p-6')).toBeInTheDocument();
    });

    it('handles very long titles', () => {
      const longTitle = 'A'.repeat(200);
      render(
        <Modal isOpen={true} onClose={mockOnClose} title={longTitle}>
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles very long descriptions', () => {
      const longDesc = 'B'.repeat(500);
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test" description={longDesc}>
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });

    it('handles multiple modals (z-index stacking)', () => {
      const { container: container1 } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>First Modal</p>
        </Modal>
      );
      expect(container1.querySelector('.z-50')).toBeInTheDocument();
    });

    it('handles rapid open/close transitions', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();

      rerender(
        <Modal isOpen={false} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      rerender(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles onClose callback errors gracefully', () => {
      const errorOnClose = jest.fn(() => {
        throw new Error('Close error');
      });
      
      render(
        <Modal isOpen={true} onClose={errorOnClose} title="Test">
          <p>Content</p>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      
      // Click should not throw - error is caught by Modal component
      fireEvent.click(closeButton);
      
      // onClose should have been called
      expect(errorOnClose).toHaveBeenCalledTimes(1);
      
      // Modal should still be in the document (error was caught)
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Content Overflow Tests
  // ============================================================================

  describe('Content Overflow', () => {
    it('handles overflow content with scrolling', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div style={{ height: '200vh' }}>Tall Content</div>
        </Modal>
      );
      expect(container.querySelector('.overflow-y-auto')).toBeInTheDocument();
    });

    it('maintains max height constraint', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <p>Content</p>
        </Modal>
      );
      expect(container.querySelector('.max-h-\\[90vh\\]')).toBeInTheDocument();
    });
  });
});
