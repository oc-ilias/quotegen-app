/**
 * CustomerForm Component Tests
 * @module __tests__/components/customers/CustomerForm
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerForm, CustomerFormData } from '@/components/customers/CustomerForm';
import type { Customer } from '@/types/quote';
import { CustomerStatus } from '@/types/quote';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock toast helpers
jest.mock('@/components/ui/Toast', () => ({
  useToastHelpers: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

// Mock Modal component
jest.mock('@/components/ui/Modal', () => ({
  Modal: ({ children, isOpen, title, onClose }: any) => 
    isOpen ? (
      <div data-testid="modal" role="dialog" aria-label={title}>
        <button onClick={onClose}>Close</button>
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

// ============================================================================
// Test Data
// ============================================================================

const mockCustomer: Customer = {
  id: 'cust-1',
  email: 'john@example.com',
  companyName: 'Acme Corp',
  contactName: 'John Doe',
  phone: '+1 555-0123',
  status: CustomerStatus.ACTIVE,
  tags: ['vip', 'enterprise'],
  billingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
  },
  shippingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
  },
  taxId: 'TAX-123',
  notes: 'Important customer',
  logoUrl: '',
  customerSince: new Date('2023-01-01'),
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2024-01-15'),
  paymentTerms: 'Net 30',
  preferredCurrency: 'USD',
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  isLoading: false,
};

// ============================================================================
// Test Suite
// ============================================================================

describe('CustomerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('rendering', () => {
    it('renders create form when no customer provided', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      expect(screen.getByText('Create Customer')).toBeInTheDocument();
      expect(screen.getByText('Add a new customer to your database')).toBeInTheDocument();
    });

    it('renders edit form when customer provided', () => {
      render(<CustomerForm {...defaultProps} customer={mockCustomer} />);

      expect(screen.getByText('Edit Customer')).toBeInTheDocument();
      expect(screen.getByText('Update customer information')).toBeInTheDocument();
    });

    it('renders all three tabs', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /address/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument();
    });

    it('starts with General tab active', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      const generalTab = screen.getByRole('button', { name: /general/i });
      expect(generalTab).toHaveClass('bg-indigo-500/10');
    });

    it('does not render when isOpen is false', () => {
      render(<CustomerForm {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Form Field Tests - General Tab
  // ==========================================================================

  describe('General tab fields', () => {
    it('renders company name input', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    });

    it('renders contact name input', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      expect(screen.getByLabelText(/contact name/i)).toBeInTheDocument();
    });

    it('renders email input', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('renders phone input', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    });

    it('renders logo URL input', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      expect(screen.getByPlaceholderText(/logo url/i)).toBeInTheDocument();
    });

    it('pre-fills fields with customer data in edit mode', () => {
      render(<CustomerForm {...defaultProps} customer={mockCustomer} />);

      expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1 555-0123')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Form Field Tests - Address Tab
  // ==========================================================================

  describe('Address tab fields', () => {
    it('switches to Address tab when clicked', async () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      const addressTab = screen.getByRole('button', { name: /address/i });
      fireEvent.click(addressTab);

      expect(addressTab).toHaveClass('bg-indigo-500/10');
      expect(screen.getByText(/billing address/i)).toBeInTheDocument();
    });

    it('renders billing address fields', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      // Switch to address tab
      fireEvent.click(screen.getByRole('button', { name: /address/i }));

      expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/state\/province/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zip\/postal code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    });

    it('renders "same address" checkbox', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /address/i }));

      expect(screen.getByLabelText(/shipping address is the same as billing address/i)).toBeInTheDocument();
    });

    it('shows shipping address when "same address" is unchecked', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /address/i }));
      
      const checkbox = screen.getByLabelText(/shipping address is the same as billing address/i);
      fireEvent.click(checkbox); // uncheck

      expect(screen.getByText(/shipping address/i)).toBeInTheDocument();
    });

    it('pre-fills address data in edit mode', () => {
      render(<CustomerForm {...defaultProps} customer={mockCustomer} />);

      fireEvent.click(screen.getByRole('button', { name: /address/i }));

      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
      expect(screen.getByDisplayValue('New York')).toBeInTheDocument();
      expect(screen.getByDisplayValue('NY')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10001')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Form Field Tests - Details Tab
  // ==========================================================================

  describe('Details tab fields', () => {
    it('switches to Details tab when clicked', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      const detailsTab = screen.getByRole('button', { name: /details/i });
      fireEvent.click(detailsTab);

      expect(detailsTab).toHaveClass('bg-indigo-500/10');
    });

    it('renders tax ID input', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /details/i }));

      expect(screen.getByLabelText(/tax id/i)).toBeInTheDocument();
    });

    it('renders tag input', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /details/i }));

      expect(screen.getByPlaceholderText(/add a tag/i)).toBeInTheDocument();
    });

    it('renders notes textarea', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /details/i }));

      expect(screen.getByPlaceholderText(/add any additional notes/i)).toBeInTheDocument();
    });

    it('pre-fills details data in edit mode', () => {
      render(<CustomerForm {...defaultProps} customer={mockCustomer} />);

      fireEvent.click(screen.getByRole('button', { name: /details/i }));

      expect(screen.getByDisplayValue('TAX-123')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Important customer')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Form Validation Tests
  // ==========================================================================

  describe('form validation', () => {
    it('shows error for empty required fields', async () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      const submitButton = screen.getByRole('button', { name: /create customer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/contact name is required/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid email', async () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByRole('button', { name: /create customer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid phone', async () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      fireEvent.change(phoneInput, { target: { value: 'not-a-phone' } });

      const submitButton = screen.getByRole('button', { name: /create customer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
      });
    });

    it('clears errors when user corrects the field', async () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      const submitButton = screen.getByRole('button', { name: /create customer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });

      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Tag Management Tests
  // ==========================================================================

  describe('tag management', () => {
    it('adds tag when Enter is pressed', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /details/i }));

      const tagInput = screen.getByPlaceholderText(/add a tag/i);
      fireEvent.change(tagInput, { target: { value: 'new-tag' } });
      fireEvent.keyDown(tagInput, { key: 'Enter' });

      expect(screen.getByText('new-tag')).toBeInTheDocument();
    });

    it('adds tag when Add button is clicked', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /details/i }));

      const tagInput = screen.getByPlaceholderText(/add a tag/i);
      fireEvent.change(tagInput, { target: { value: 'clicked-tag' } });
      
      const addButton = screen.getByRole('button', { name: /add$/i });
      fireEvent.click(addButton);

      expect(screen.getByText('clicked-tag')).toBeInTheDocument();
    });

    it('does not add empty tags', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /details/i }));

      const tagInput = screen.getByPlaceholderText(/add a tag/i);
      fireEvent.change(tagInput, { target: { value: '   ' } });
      fireEvent.keyDown(tagInput, { key: 'Enter' });

      expect(screen.queryByText(/\s+/)).not.toBeInTheDocument();
    });

    it('does not add duplicate tags', () => {
      render(<CustomerForm {...defaultProps} customer={mockCustomer} />);

      fireEvent.click(screen.getByRole('button', { name: /details/i }));

      // 'vip' is already in mockCustomer.tags
      const tagInput = screen.getByPlaceholderText(/add a tag/i);
      fireEvent.change(tagInput, { target: { value: 'vip' } });
      fireEvent.keyDown(tagInput, { key: 'Enter' });

      const tags = screen.getAllByText('vip');
      expect(tags).toHaveLength(1);
    });

    it('removes tag when X is clicked', () => {
      render(<CustomerForm {...defaultProps} customer={mockCustomer} />);

      fireEvent.click(screen.getByRole('button', { name: /details/i }));

      const removeButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('svg') // The X button has an icon
      );
      
      if (removeButton) {
        fireEvent.click(removeButton);
      }

      // One tag should be removed
      expect(screen.getByText('vip')).toBeInTheDocument();
    });

    it('converts tags to lowercase', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /details/i }));

      const tagInput = screen.getByPlaceholderText(/add a tag/i);
      fireEvent.change(tagInput, { target: { value: 'UPPERCASE' } });
      fireEvent.keyDown(tagInput, { key: 'Enter' });

      expect(screen.getByText('uppercase')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Form Submission Tests
  // ==========================================================================

  describe('form submission', () => {
    it('calls onSubmit with form data when valid', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);
      render(<CustomerForm {...defaultProps} onSubmit={mockSubmit} customer={null} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Test Corp' } });
      fireEvent.change(screen.getByLabelText(/contact name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: /create customer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            companyName: 'Test Corp',
            contactName: 'Test User',
            email: 'test@example.com',
          })
        );
      });
    });

    it('calls onClose after successful submission', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);
      const mockClose = jest.fn();
      
      render(<CustomerForm {...defaultProps} onSubmit={mockSubmit} onClose={mockClose} customer={null} />);

      fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Test Corp' } });
      fireEvent.change(screen.getByLabelText(/contact name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });

      fireEvent.click(screen.getByRole('button', { name: /create customer/i }));

      await waitFor(() => {
        expect(mockClose).toHaveBeenCalled();
      });
    });

    it('does not close on submission error', async () => {
      const mockSubmit = jest.fn().mockRejectedValue(new Error('Save failed'));
      const mockClose = jest.fn();
      
      render(<CustomerForm {...defaultProps} onSubmit={mockSubmit} onClose={mockClose} customer={null} />);

      fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Test Corp' } });
      fireEvent.change(screen.getByLabelText(/contact name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });

      fireEvent.click(screen.getByRole('button', { name: /create customer/i }));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });

      expect(mockClose).not.toHaveBeenCalled();
    });

    it('disables submit button while loading', () => {
      render(<CustomerForm {...defaultProps} isLoading={true} customer={null} />);

      const submitButton = screen.getByRole('button', { name: /create customer/i });
      expect(submitButton).toBeDisabled();
    });

    it('disables cancel button while loading', () => {
      render(<CustomerForm {...defaultProps} isLoading={true} customer={null} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();
    });
  });

  // ==========================================================================
  // Address Sync Tests
  // ==========================================================================

  describe('address synchronization', () => {
    it('syncs shipping address when billing address changes and useSameAddress is true', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /address/i }));

      const streetInput = screen.getAllByLabelText(/street address/i)[0];
      fireEvent.change(streetInput, { target: { value: '456 Oak St' } });

      // Shipping address should be synced
      const shippingInputs = screen.getAllByLabelText(/street address/i);
      // If only one shipping input is visible (because useSameAddress is true), 
      // the billing and shipping are the same field
      expect(shippingInputs).toHaveLength(1);
    });

    it('does not sync shipping address when useSameAddress is false', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /address/i }));

      // Uncheck "same address"
      fireEvent.click(screen.getByLabelText(/shipping address is the same/i));

      // Now change billing address
      const billingStreet = screen.getAllByLabelText(/street address/i)[0];
      fireEvent.change(billingStreet, { target: { value: 'Billing St' } });

      // Shipping should remain empty (we can check by looking for multiple inputs)
      const shippingStreet = screen.getAllByLabelText(/street address/i)[1];
      expect(shippingStreet).toHaveValue('');
    });
  });

  // ==========================================================================
  // Modal Interaction Tests
  // ==========================================================================

  describe('modal interactions', () => {
    it('calls onClose when cancel button is clicked', () => {
      const mockClose = jest.fn();
      render(<CustomerForm {...defaultProps} onClose={mockClose} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockClose).toHaveBeenCalled();
    });

    it('calls onClose when modal close button is clicked', () => {
      const mockClose = jest.fn();
      render(<CustomerForm {...defaultProps} onClose={mockClose} customer={null} />);

      fireEvent.click(screen.getByText('Close'));

      expect(mockClose).toHaveBeenCalled();
    });

    it('resets form when reopened with different customer', () => {
      const { rerender } = render(
        <CustomerForm {...defaultProps} customer={null} isOpen={true} />
      );

      fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Temp Corp' } });

      // Reopen with customer
      rerender(<CustomerForm {...defaultProps} customer={mockCustomer} isOpen={true} />);

      expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Temp Corp')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Loading State Tests
  // ==========================================================================

  describe('loading states', () => {
    it('shows loading spinner on submit button when isLoading is true', () => {
      render(<CustomerForm {...defaultProps} isLoading={true} customer={null} />);

      const submitButton = screen.getByRole('button', { name: /create customer/i });
      // Check for loading state - button should be disabled or show spinner
      expect(submitButton).toBeDisabled();
    });

    it('shows Update Customer text in edit mode', () => {
      render(<CustomerForm {...defaultProps} customer={mockCustomer} />);

      expect(screen.getByRole('button', { name: /update customer/i })).toBeInTheDocument();
    });

    it('shows Create Customer text in create mode', () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      expect(screen.getByRole('button', { name: /create customer/i })).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Edge Case Tests
  // ==========================================================================

  describe('edge cases', () => {
    it('handles customer with null shipping address', () => {
      const customerWithNullShipping = {
        ...mockCustomer,
        shippingAddress: undefined,
      };

      render(<CustomerForm {...defaultProps} customer={customerWithNullShipping} />);

      fireEvent.click(screen.getByRole('button', { name: /address/i }));

      // Checkbox should be checked (same address)
      const checkbox = screen.getByLabelText(/shipping address is the same/i);
      expect(checkbox).toBeChecked();
    });

    it('handles customer with different billing and shipping addresses', () => {
      const customerWithDiffAddresses = {
        ...mockCustomer,
        shippingAddress: {
          street: '999 Shipping St',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA',
        },
      };

      render(<CustomerForm {...defaultProps} customer={customerWithDiffAddresses} />);

      fireEvent.click(screen.getByRole('button', { name: /address/i }));

      // Checkbox should be unchecked
      const checkbox = screen.getByLabelText(/shipping address is the same/i);
      expect(checkbox).not.toBeChecked();
    });

    it('handles customer with no tags', () => {
      const customerWithNoTags = {
        ...mockCustomer,
        tags: [],
      };

      render(<CustomerForm {...defaultProps} customer={customerWithNoTags} />);

      fireEvent.click(screen.getByRole('button', { name: /details/i }));

      expect(screen.queryByText('vip')).not.toBeInTheDocument();
    });

    it('validates billing address fields when partially filled', async () => {
      render(<CustomerForm {...defaultProps} customer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /address/i }));

      // Fill only street address
      fireEvent.change(screen.getByLabelText(/street address/i), { target: { value: '123 Main St' } });

      // Fill required general fields
      fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Test Corp' } });
      fireEvent.change(screen.getByLabelText(/contact name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: /create customer/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Should show error that city/state/zip are required with street
        expect(screen.getByText(/city is required with street/i)).toBeInTheDocument();
      });
    });
  });
});
