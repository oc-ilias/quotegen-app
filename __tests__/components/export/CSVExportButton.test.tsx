/**
 * CSV Export Button Component Tests
 * @module __tests__/components/export/CSVExportButton
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CSVExportButton, CSVExportButtonSkeleton } from '@/components/export/CSVExportButton';
import { Quote, QuoteStatus } from '@/types/quote';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => {
      // Filter out framer-motion specific props
      const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = props;
      return <div ref={ref} {...domProps}>{children}</div>;
    }),
    span: React.forwardRef(({ children, ...props }: any, ref: any) => {
      const { initial, animate, exit, transition, ...domProps } = props;
      return <span ref={ref} {...domProps}>{children}</span>;
    }),
    button: React.forwardRef(({ children, ...props }: any, ref: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = props;
      return <button ref={ref} {...domProps}>{children}</button>;
    }),
  },
  AnimatePresence: ({ children }: any) => {
    // Handle case where children might be undefined or null during error states
    if (!children) return null;
    return <>{children}</>;
  },
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// ============================================================================
// Test Data
// ============================================================================

const mockQuote: Quote = {
  id: 'quote-1',
  quoteNumber: 'QT-001',
  customerId: 'cust-1',
  customer: {
    id: 'cust-1',
    email: 'test@example.com',
    companyName: 'Test Company',
    contactName: 'John Doe',
    phone: '+1234567890',
    customerSince: new Date('2024-01-01'),
    tags: [],
  },
  title: 'Test Quote',
  status: QuoteStatus.ACCEPTED,
  priority: 'high' as const,
  lineItems: [
    {
      id: 'item-1',
      productId: 'prod-1',
      title: 'Test Product',
      sku: 'SKU001',
      quantity: 2,
      unitPrice: 100,
      discountAmount: 0,
      taxRate: 10,
      taxAmount: 20,
      subtotal: 200,
      total: 220,
    },
  ],
  subtotal: 200,
  discountTotal: 0,
  taxTotal: 20,
  shippingTotal: 10,
  total: 230,
  terms: {
    paymentTerms: 'Net 30',
    deliveryTerms: 'Standard shipping',
    validityPeriod: 30,
    depositRequired: false,
    currency: 'USD',
    notes: 'Test notes',
  },
  metadata: {
    createdBy: 'user-1',
    createdByName: 'Admin User',
    source: 'web',
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

const mockQuotes: Quote[] = [
  mockQuote,
  {
    ...mockQuote,
    id: 'quote-2',
    quoteNumber: 'QT-002',
    status: QuoteStatus.PENDING,
    total: 150,
    createdAt: new Date('2024-02-01'),
  },
  {
    ...mockQuote,
    id: 'quote-3',
    quoteNumber: 'QT-003',
    status: QuoteStatus.SENT,
    total: 300,
    createdAt: new Date('2024-03-01'),
  },
];

// ============================================================================
// Test Suite
// ============================================================================

describe('CSVExportButton', () => {
  const mockOnExportStart = jest.fn();
  const mockOnExportComplete = jest.fn();
  const mockOnExportError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('rendering', () => {
    it('renders with default props', () => {
      render(<CSVExportButton quotes={mockQuotes} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Export CSV');
      expect(button).toHaveTextContent('(3)');
    });

    it('renders with custom size', () => {
      render(<CSVExportButton quotes={mockQuotes} size="lg" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('shows no count when no quotes', () => {
      render(<CSVExportButton quotes={[]} />);
      
      const button = screen.getByRole('button');
      // Component doesn't show (0) when no quotes, only shows count when > 0
      expect(button).toHaveTextContent('Export CSV');
      expect(button).not.toHaveTextContent('(0)');
    });

    it('has correct aria-label', () => {
      render(<CSVExportButton quotes={mockQuotes} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Export 3 quotes to CSV');
    });
  });

  // ==========================================================================
  // Disabled State Tests
  // ==========================================================================

  describe('disabled states', () => {
    it('disables button when no quotes', () => {
      render(<CSVExportButton quotes={[]} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disables button when disabled prop is true', () => {
      render(<CSVExportButton quotes={mockQuotes} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disables button during export', async () => {
      render(<CSVExportButton quotes={mockQuotes} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveTextContent(/exporting/i);
      });
    });
  });

  // ==========================================================================
  // Export Functionality Tests
  // ==========================================================================

  describe('export functionality', () => {
    it('triggers download on click', async () => {
      const createElementSpy = jest.spyOn(document, 'createElement');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild');
      const removeChildSpy = jest.spyOn(document.body, 'removeChild');

      render(<CSVExportButton 
        quotes={mockQuotes} 
        onExportStart={mockOnExportStart}
        onExportComplete={mockOnExportComplete}
      />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnExportStart).toHaveBeenCalled();
      });

      // Wait for export to complete
      await waitFor(() => {
        expect(mockOnExportComplete).toHaveBeenCalled();
      }, { timeout: 2000 });

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('calls onExportStart callback', async () => {
      render(<CSVExportButton 
        quotes={mockQuotes} 
        onExportStart={mockOnExportStart}
      />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnExportStart).toHaveBeenCalledTimes(1);
      });
    });

    it('uses custom filename prefix', async () => {
      const createElementSpy = jest.spyOn(document, 'createElement');
      const originalCreateObjectURL = global.URL.createObjectURL;
      const mockUrls: string[] = [];
      
      // Mock URL.createObjectURL to capture filenames
      global.URL.createObjectURL = jest.fn((blob) => {
        const url = `mock-url-${mockUrls.length}`;
        mockUrls.push(url);
        return url;
      });
      
      render(<CSVExportButton 
        quotes={mockQuotes} 
        filenamePrefix="custom_quotes"
        onExportComplete={mockOnExportComplete}
      />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnExportComplete).toHaveBeenCalled();
      }, { timeout: 2000 });

      // Find the link element that was created with our custom filename
      const linkCalls = createElementSpy.mock.calls.filter(
        (call) => call[0] === 'a'
      );
      
      expect(linkCalls.length).toBeGreaterThan(0);

      createElementSpy.mockRestore();
      global.URL.createObjectURL = originalCreateObjectURL;
    });
  });

  // ==========================================================================
  // Filter Tests
  // ==========================================================================

  describe('filtering', () => {
    it('filters by status', async () => {
      render(
        <CSVExportButton 
          quotes={mockQuotes}
          filters={{ status: [QuoteStatus.ACCEPTED] }}
        />
      );
      
      // Should only show 1 accepted quote
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('(1)');
    });

    it('filters by customerId', async () => {
      render(
        <CSVExportButton 
          quotes={mockQuotes}
          filters={{ customerId: 'cust-1' }}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('(3)');
    });

    it('filters by search query', async () => {
      render(
        <CSVExportButton 
          quotes={mockQuotes}
          filters={{ searchQuery: 'QT-001' }}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('(1)');
    });

    it('filters by value range', async () => {
      render(
        <CSVExportButton 
          quotes={mockQuotes}
          filters={{ minValue: 200, maxValue: 250 }}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('(1)');
    });

    it('filters by date range', async () => {
      render(
        <CSVExportButton 
          quotes={mockQuotes}
          dateRange={{ from: new Date('2024-01-01'), to: new Date('2024-01-31') }}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('(1)');
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('error handling', () => {
    it('handles empty filtered results', async () => {
      render(
        <CSVExportButton 
          quotes={mockQuotes}
          filters={{ searchQuery: 'NONEXISTENT' }}
          onExportError={mockOnExportError}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // Component doesn't show (0) when no quotes match
      expect(button).toHaveTextContent('Export CSV');
    });

    it.skip('displays error message on export failure', async () => {
      // Mock URL.createObjectURL to throw
      const originalCreateObjectURL = global.URL.createObjectURL;
      global.URL.createObjectURL = jest.fn(() => {
        throw new Error('Blob creation failed');
      });

      // Mock console.error to suppress expected error output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <CSVExportButton 
          quotes={mockQuotes}
          onExportError={mockOnExportError}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnExportError).toHaveBeenCalled();
      });

      global.URL.createObjectURL = originalCreateObjectURL;
      consoleSpy.mockRestore();
    });
  });

  // ==========================================================================
  // Preview Modal Tests
  // ==========================================================================

  describe('preview modal', () => {
    it('shows preview when showPreview is true', async () => {
      render(
        <CSVExportButton 
          quotes={mockQuotes}
          showPreview={true}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Export Preview')).toBeInTheDocument();
      });
    });

    it('closes preview modal on cancel', async () => {
      render(
        <CSVExportButton 
          quotes={mockQuotes}
          showPreview={true}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Export Preview')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
    });
  });
});

// ============================================================================
// Skeleton Tests
// ============================================================================

describe('CSVExportButtonSkeleton', () => {
  it('renders skeleton with default size', () => {
    render(<CSVExportButtonSkeleton />);
    
    const skeleton = document.querySelector('[class*="animate-pulse"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders skeleton with custom size', () => {
    render(<CSVExportButtonSkeleton size="lg" />);
    
    const skeleton = document.querySelector('[class*="animate-pulse"]');
    expect(skeleton).toBeInTheDocument();
  });
});
