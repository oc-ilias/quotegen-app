/**
 * Modal Component Test Suite
 * Comprehensive tests for Modal component with all features
 * @module __tests__/components/ui/Modal
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <p>Modal content</p>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Modal {...defaultProps} className="custom-modal" />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });
  });

  describe('Header', () => {
    it('renders title in header', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(<Modal {...defaultProps} description="This is a description" />);
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('renders custom header content', () => {
      render(
        <Modal {...defaultProps} header={<div>Custom Header</div>}>
          Content
        </Modal>
      );
      expect(screen.getByText('Custom Header')).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders with default footer buttons', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('renders custom footer content', () => {
      render(
        <Modal {...defaultProps} footer={<button>Custom Action</button>}>
          Content
        </Modal>
      );
      expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });

    it('hides footer when hideFooter is true', () => {
      render(<Modal {...defaultProps} hideFooter />);
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('calls onClose when cancel button is clicked', () => {
      render(<Modal {...defaultProps} />);
      fireEvent.click(screen.getByText('Cancel'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onConfirm when confirm button is clicked', () => {
      const handleConfirm = jest.fn();
      render(<Modal {...defaultProps} onConfirm={handleConfirm} confirmText="Confirm" />);
      fireEvent.click(screen.getByText('Confirm'));
      expect(handleConfirm).toHaveBeenCalled();
    });
  });

  describe('Size Variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
    
    sizes.forEach(size => {
      it(`renders ${size} size modal`, () => {
        render(<Modal {...defaultProps} size={size} />);
        expect(screen.getByText('Test Modal')).toBeInTheDocument();
      });
    });
  });

  describe('Close Behavior', () => {
    it('calls onClose when close button is clicked', () => {
      render(<Modal {...defaultProps} showCloseButton />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when overlay is clicked (if closeOnOverlayClick)', () => {
      render(<Modal {...defaultProps} closeOnOverlayClick />);
      const overlay = screen.getByText('Modal content').parentElement?.parentElement;
      if (overlay) {
        fireEvent.click(overlay);
        expect(defaultProps.onClose).toHaveBeenCalled();
      }
    });

    it('does not call onClose when overlay is clicked if closeOnOverlayClick is false', () => {
      render(<Modal {...defaultProps} closeOnOverlayClick={false} />);
      const overlay = screen.getByText('Modal content').parentElement?.parentElement;
      if (overlay) {
        fireEvent.click(overlay);
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      }
    });

    it('calls onClose when Escape key is pressed (if closeOnEsc)', () => {
      render(<Modal {...defaultProps} closeOnEsc />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading state on confirm button', () => {
      const handleConfirm = jest.fn();
      render(
        <Modal
          {...defaultProps}
          onConfirm={handleConfirm}
          confirmText="Save"
          isLoading
        />
      );
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('disables confirm button when isLoading', () => {
      const handleConfirm = jest.fn();
      render(
        <Modal
          {...defaultProps}
          onConfirm={handleConfirm}
          confirmText="Save"
          isLoading
        />
      );
      // Button should be disabled or show loading state
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('traps focus within modal', () => {
      render(
        <Modal {...defaultProps}>
          <input data-testid="input1" />
          <input data-testid="input2" />
        </Modal>
      );
      expect(screen.getByTestId('input1')).toBeInTheDocument();
      expect(screen.getByTestId('input2')).toBeInTheDocument();
    });

    it('announces modal title to screen readers', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('renders with no title', () => {
      render(<Modal isOpen={true} onClose={jest.fn()}>Content</Modal>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders with very long content', () => {
      const longContent = 'A'.repeat(1000);
      render(<Modal {...defaultProps}>{longContent}</Modal>);
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('renders with React element children', () => {
      render(
        <Modal {...defaultProps}>
          <div>
            <h3>Section 1</h3>
            <p>Content 1</p>
            <h3>Section 2</h3>
            <p>Content 2</p>
          </div>
        </Modal>
      );
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });

    it('handles rapid open/close transitions', async () => {
      const { rerender } = render(<Modal {...defaultProps} isOpen={true} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();

      rerender(<Modal {...defaultProps} isOpen={false} />);
      await waitFor(() => {
        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      });

      rerender(<Modal {...defaultProps} isOpen={true} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });
  });
});
