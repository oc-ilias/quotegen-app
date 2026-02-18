/**
 * CustomerInfoStep Component Tests
 * Tests for the Customer Information wizard step
 * @module components/wizard/steps/__tests__/CustomerInfoStep
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerInfoStep from '../CustomerInfoStep';
import type { CustomerInfoData } from '@/types';
import { CustomerStatus } from '@/types';

// Mock framer-motion properly
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      const { initial, animate, exit, variants, transition, whileHover, whileTap, custom, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      const { initial, animate, exit, variants, transition, whileHover, whileTap, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
    p: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      const { initial, animate, exit, variants, transition, ...rest } = props;
      return <p {...rest}>{children}</p>;
    },
    section: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      const { initial, animate, exit, variants, transition, ...rest } = props;
      return <section {...rest}>{children}</section>;
    },
    span: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      const { initial, animate, exit, variants, transition, ...rest } = props;
      return <span {...rest}>{children}</span>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('CustomerInfoStep', () => {
  const mockOnUpdate = jest.fn();

  const defaultData: CustomerInfoData = {
    email: '',
    companyName: '',
    contactName: '',
    phone: '',
    isExistingCustomer: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders step title and description', () => {
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Customer Information')).toBeInTheDocument();
    expect(screen.getByText('Select an existing customer or create a new one.')).toBeInTheDocument();
  });

  it('renders toggle buttons for new/existing customer', () => {
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Create New Customer')).toBeInTheDocument();
    expect(screen.getByText('Select Existing')).toBeInTheDocument();
  });

  it('shows new customer form when create new is selected', () => {
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByTestId('customer-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('customer-company-input')).toBeInTheDocument();
    expect(screen.getByTestId('customer-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('customer-phone-input')).toBeInTheDocument();
  });

  it('calls onUpdate when email field changes', async () => {
    const user = userEvent.setup();
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const emailInput = screen.getByTestId('customer-email-input');
    await user.type(emailInput, 'test@example.com');
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('calls onUpdate when company name field changes', async () => {
    const user = userEvent.setup();
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const companyInput = screen.getByTestId('customer-company-input');
    await user.type(companyInput, 'Acme Corp');
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('calls onUpdate when contact name field changes', async () => {
    const user = userEvent.setup();
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const nameInput = screen.getByTestId('customer-name-input');
    await user.type(nameInput, 'John Doe');
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Failed to load customers';
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows search input when selecting existing customer', async () => {
    const user = userEvent.setup();
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const selectExistingBtn = screen.getByText('Select Existing');
    await user.click(selectExistingBtn);
    
    expect(screen.getByTestId('customer-search-input')).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const emailInput = screen.getByTestId('customer-email-input');
    await user.type(emailInput, 'invalid-email');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const emailInput = screen.getByTestId('customer-email-input');
    await user.click(emailInput);
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('shows ready to continue when all required fields are valid', () => {
    const validData: CustomerInfoData = {
      email: 'test@example.com',
      companyName: 'Acme Corp',
      contactName: 'John Doe',
      phone: '',
      isExistingCustomer: false,
    };
    
    render(<CustomerInfoStep data={validData} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Ready to continue')).toBeInTheDocument();
  });

  it('displays selected customer when existing customer is selected', () => {
    const dataWithCustomer: CustomerInfoData = {
      customer: {
        id: 'cust_1',
        email: 'john@acme.com',
        companyName: 'Acme Corporation',
        contactName: 'John Smith',
        phone: '+1 (555) 123-4567',
        customerSince: new Date('2023-01-15'),
        tags: ['enterprise'],
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15'),
        status: CustomerStatus.ACTIVE,
      },
      customerId: 'cust_1',
      email: 'john@acme.com',
      companyName: 'Acme Corporation',
      contactName: 'John Smith',
      phone: '+1 (555) 123-4567',
      isExistingCustomer: true,
    };
    
    render(<CustomerInfoStep data={dataWithCustomer} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    expect(screen.getByText(/John Smith/)).toBeInTheDocument();
  });

  it('allows changing selected customer', async () => {
    const user = userEvent.setup();
    const dataWithCustomer: CustomerInfoData = {
      customer: {
        id: 'cust_1',
        email: 'john@acme.com',
        companyName: 'Acme Corporation',
        contactName: 'John Smith',
        phone: '+1 (555) 123-4567',
        customerSince: new Date('2023-01-15'),
        tags: ['enterprise'],
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15'),
        status: CustomerStatus.ACTIVE,
      },
      customerId: 'cust_1',
      email: 'john@acme.com',
      companyName: 'Acme Corporation',
      contactName: 'John Smith',
      phone: '+1 (555) 123-4567',
      isExistingCustomer: true,
    };
    
    render(<CustomerInfoStep data={dataWithCustomer} onUpdate={mockOnUpdate} />);
    
    const changeButton = screen.getByText('Change');
    await user.click(changeButton);
    
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      isExistingCustomer: false,
      customer: undefined,
      customerId: undefined,
    }));
  });

  it('validates company name minimum length', async () => {
    const user = userEvent.setup();
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const companyInput = screen.getByTestId('customer-company-input');
    await user.type(companyInput, 'A');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText('Company name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    const user = userEvent.setup();
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const phoneInput = screen.getByTestId('customer-phone-input');
    await user.type(phoneInput, 'invalid-phone!@#');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
    });
  });

  it('allows valid phone number formats', async () => {
    const user = userEvent.setup();
    render(<CustomerInfoStep data={defaultData} onUpdate={mockOnUpdate} />);
    
    const phoneInput = screen.getByTestId('customer-phone-input');
    await user.type(phoneInput, '+1 (555) 123-4567');
    await user.tab();
    
    expect(screen.queryByText('Please enter a valid phone number')).not.toBeInTheDocument();
  });
});
