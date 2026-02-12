/**
 * Modal Component Tests
 * Comprehensive tests for Modal component including accessibility and interactions
 * @module components/ui/__tests__/Modal
 */

import React, { createRef } from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';
import { LiveAnnouncerProvider } from '@/components/accessibility/LiveAnnouncer';

// ============================================================================
// Mocks
// ============================================================================

// Mock createPortal to render inline for testing
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}));

// Mock FocusTrap
jest.mock('@/components/accessibility/FocusTrap', () => ({
  FocusTrap: ({
    children,
    isActive,
    onEscape,
    initialFocus,
    className,
  }: {
    children: React.ReactNode;
    isActive: boolean;
    onEscape?: () => void;
    initialFocus?: boolean;
    className?: string;
  }) => (
    <div
      data-testid="focus-trap"
      data-active={isActive}
      data-initial-focus={initialFocus}
      className={className}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && onEscape) {
          onEscape();
        }
      }}
      tabIndex={-1}
    >
      {children}
    </div>
  ),
}));

// Mock LiveAnnouncer
const mockAnnounce = jest.fn();
jest.mock('@/components/accessibility/LiveAnnouncer', () => ({
  ...jest.requireActual('@/components/accessibility/LiveAnnouncer'),
  useLiveAnnouncer: () => ({
    announce: mockAnnounce,
    clearAnnouncements: jest.fn(),
  }),
}));

// ============================================================================
// Test Wrapper
// ============================================================================

const ModalWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => <LiveAnnouncerProvider>{children}</LiveAnnouncerProvider>;

// ============================================================================
// Modal Tests
// ============================================================================

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} isOpen={false} />
        </ModalWrapper>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders with title', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} title="Test Modal Title" />
        </ModalWrapper>
      );

      expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
    });

    it('renders with description', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} description="Test modal description" />
        </ModalWrapper>
      );

      expect(screen.getByText('Test modal description')).toBeInTheDocument();
    });

    it('renders with footer', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} footer={<button>Footer Action</button>} />
        </ModalWrapper>
      );

      expect(screen.getByRole('button', { name: 'Footer Action' })).toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} showCloseButton={false} />
        </ModalWrapper>
      );

      expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Size Variant Tests
  // ============================================================================

  describe('Size Variants', () => {
    it('applies small size classes', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} size="sm" />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('max-w-sm');
    });

    it('applies medium size classes (default)', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} size="md" />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('max-w-md');
    });

    it('applies large size classes', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} size="lg" />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('max-w-lg');
    });

    it('applies extra large size classes', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} size="xl" />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('max-w-2xl');
    });

    it('applies full size classes', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} size="full" />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('max-w-full');
      expect(dialog).toHaveClass('h-full');
    });
  });

  // ============================================================================
  // Close Behavior Tests
  // ============================================================================

  describe('Close Behavior', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(
        <ModalWrapper>
          <Modal {...defaultProps} onClose={onClose} />
        </ModalWrapper>
      );

      fireEvent.click(screen.getByLabelText('Close dialog'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay is clicked', () => {
      const onClose = jest.fn();
      render(
        <ModalWrapper>
          <Modal {...defaultProps} onClose={onClose} />
        </ModalWrapper>
      );

      const overlay = screen.getByRole('presentation');
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when overlay click is disabled', () => {
      const onClose = jest.fn();
      render(
        <ModalWrapper>
          <Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />
        </ModalWrapper>
      );

      const overlay = screen.getByRole('presentation');
      fireEvent.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when escape key is pressed', () => {
      const onClose = jest.fn();
      render(
        <ModalWrapper>
          <Modal {...defaultProps} onClose={onClose} />
        </ModalWrapper>
      );

      const focusTrap = screen.getByTestId('focus-trap');
      fireEvent.keyDown(focusTrap, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when escape key handling is disabled', () => {
      const onClose = jest.fn();
      render(
        <ModalWrapper>
          <Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />
        </ModalWrapper>
      );

      const focusTrap = screen.getByTestId('focus-trap');
      fireEvent.keyDown(focusTrap, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when clicking modal content', () => {
      const onClose = jest.fn();
      render(
        <ModalWrapper>
          <Modal {...defaultProps} onClose={onClose}>
            <button>Click me</button>
          </Modal>
        </ModalWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Focus Trap Tests
  // ============================================================================

  describe('Focus Trap', () => {
    it('renders FocusTrap with correct props', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      const focusTrap = screen.getByTestId('focus-trap');
      expect(focusTrap).toHaveAttribute('data-active', 'true');
      expect(focusTrap).toHaveAttribute('data-initial-focus', 'true');
    });

    it('passes initialFocusRef to FocusTrap when provided', () => {
      const initialFocusRef = createRef<HTMLButtonElement>();
      render(
        <ModalWrapper>
          <Modal {...defaultProps} initialFocusRef={initialFocusRef}>
            <button ref={initialFocusRef}>Focus Target</button>
          </Modal>
        </ModalWrapper>
      );

      const focusTrap = screen.getByTestId('focus-trap');
      expect(focusTrap).toHaveAttribute('data-initial-focus', 'false');
    });
  });

  // ============================================================================
  // ARIA Attribute Tests
  // ============================================================================

  describe('ARIA Attributes', () => {
    it('has correct role and aria-modal attributes', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has alertdialog role when specified', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} role="alertdialog" />
        </ModalWrapper>
      );

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('has aria-labelledby when title is provided', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} title="Modal Title" />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      const titleId = dialog.getAttribute('aria-labelledby');
      expect(titleId).toBeDefined();
      
      const title = document.getElementById(titleId!);
      expect(title).toHaveTextContent('Modal Title');
    });

    it('does not have aria-labelledby when title is not provided', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-labelledby');
    });

    it('has aria-describedby when description is provided', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} description="Modal description" />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      const descId = dialog.getAttribute('aria-describedby');
      expect(descId).toBeDefined();
      
      const description = document.getElementById(descId!);
      expect(description).toHaveTextContent('Modal description');
    });

    it('does not have aria-describedby when description is not provided', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-describedby');
    });

    it('close button has aria-label', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('backdrop has aria-hidden', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Body Scroll Tests
  // ============================================================================

  describe('Body Scroll Lock', () => {
    it('prevents body scroll when open', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when unmounted', () => {
      const { unmount } = render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      expect(document.body.style.overflow).toBe('hidden');
      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  // ============================================================================
  // Live Announcer Tests
  // ============================================================================

  describe('Live Announcer', () => {
    it('announces modal opening when title is provided', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} title="Important Modal" />
        </ModalWrapper>
      );

      expect(mockAnnounce).toHaveBeenCalledWith(
        'Important Modal dialog opened',
        'polite'
      );
    });

    it('does not announce when title is not provided', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      expect(mockAnnounce).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Portal Rendering Tests
  // ============================================================================

  describe('Portal Rendering', () => {
    it('renders modal content through portal', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps}>
            <div data-testid="portal-content">Portaled Content</div>
          </Modal>
        </ModalWrapper>
      );

      expect(screen.getByTestId('portal-content')).toBeInTheDocument();
    });

    it('renders in document body', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      // The dialog should be rendered (via our mock, inline)
      expect(dialog).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Styling Tests
  // ============================================================================

  describe('Styling', () => {
    it('has correct base styling classes', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('bg-slate-800');
      expect(dialog).toHaveClass('rounded-xl');
      expect(dialog).toHaveClass('shadow-2xl');
      expect(dialog).toHaveClass('border');
      expect(dialog).toHaveClass('border-slate-700');
    });

    it('has animation classes', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('animate-in');
      expect(dialog).toHaveClass('fade-in');
      expect(dialog).toHaveClass('zoom-in-95');
    });

    it('close button has hover and focus styling', () => {
      render(
        <ModalWrapper>
          <Modal {...defaultProps} />
        </ModalWrapper>
      );

      const closeButton = screen.getByLabelText('Close dialog');
      expect(closeButton).toHaveClass('hover:bg-slate-700');
      expect(closeButton).toHaveClass('focus:ring-2');
      expect(closeButton).toHaveClass('focus:ring-indigo-500');
    });
  });

  // ============================================================================
  // Complex Integration Tests
  // ============================================================================

  describe('Complex Scenarios', () => {
    it('renders complete modal with all elements', () => {
      render(
        <ModalWrapper>
          <Modal
            {...defaultProps}
            title="Complete Modal"
            description="This is a complete modal"
            size="lg"
            footer={<button>Save Changes</button>}
          >
            <p>Main content goes here</p>
          </Modal>
        </ModalWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Complete Modal')).toBeInTheDocument();
      expect(screen.getByText('This is a complete modal')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('handles rapid open/close transitions', () => {
      const onClose = jest.fn();
      const { rerender } = render(
        <ModalWrapper>
          <Modal {...defaultProps} isOpen={true} onClose={onClose} />
        </ModalWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(
        <ModalWrapper>
          <Modal {...defaultProps} isOpen={false} onClose={onClose} />
        </ModalWrapper>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <ModalWrapper>
          <Modal {...defaultProps} isOpen={true} onClose={onClose} />
        </ModalWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders without header when no title, description, or close button', () => {
      render(
        <ModalWrapper>
          <Modal
            {...defaultProps}
            showCloseButton={false}
          >
            <p>Content only</p>
          </Modal>
        </ModalWrapper>
      );

      expect(screen.getByText('Content only')).toBeInTheDocument();
      expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
    });
  });
});

export default {};
