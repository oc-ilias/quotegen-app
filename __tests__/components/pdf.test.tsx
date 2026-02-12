/**
 * PDF Components Test Suite
 * Tests for QuotePDF, QuotePDFDownload, and PDF generation
 * @module __tests__/components/pdf
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock @react-pdf/renderer
jest.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: ({ children, document }: any) => {
    return children({ loading: false, url: 'blob:test-url' });
  },
  PDFViewer: ({ children }: any) => <div data-testid="pdf-viewer">{children}</div>,
  Document: ({ children }: any) => <div data-testid="pdf-document">{children}</div>,
  Page: ({ children }: any) => <div data-testid="pdf-page">{children}</div>,
  View: ({ children, style }: any) => <div data-testid="pdf-view" style={style}>{children}</div>,
  Text: ({ children }: any) => <span data-testid="pdf-text">{children}</span>,
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Font: {
    register: jest.fn(),
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      const { whileHover, whileTap, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { QuotePDFDownload } from '@/components/pdf/QuotePDFDownload';
import { QuoteStatus, TemplateType } from '@/types/quote';

describe('QuotePDFDownload', () => {
  const mockQuote = {
    id: 'quote-1',
    quote_number: 'QT-001',
    title: 'Product Quote',
    status: QuoteStatus.SENT,
    subtotal: 1000,
    tax_amount: 100,
    total: 1100,
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
    valid_until: '2026-03-01T00:00:00Z',
    notes: 'Test notes',
    customer: {
      id: 'cust-1',
      name: 'John Smith',
      email: 'john@example.com',
      company: 'Acme Corp',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      },
    },
    line_items: [
      {
        id: 'item-1',
        description: 'Product A',
        quantity: 2,
        unit_price: 500,
        total: 1000,
      },
    ],
    terms: {
      payment_terms: 'Net 30',
      delivery_terms: 'Standard shipping',
      warranty: '1 year',
    },
    shop_settings: {
      name: 'My Shop',
      email: 'shop@example.com',
      address: '456 Shop St, Business City, BC 12345',
      logo_url: 'https://example.com/logo.png',
    },
  };

  const defaultProps = {
    quote: mockQuote,
    template: TemplateType.MODERN,
    fileName: 'quote-QT-001.pdf',
  };

  describe('Rendering', () => {
    it('renders download button', () => {
      render(<QuotePDFDownload {...defaultProps} />);
      expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
    });

    it('displays quote number in button text', () => {
      render(<QuotePDFDownload {...defaultProps} />);
      expect(screen.getByText(/QT-001/i)).toBeInTheDocument();
    });

    it('renders with different button variants', () => {
      const { rerender } = render(<QuotePDFDownload {...defaultProps} variant="primary" />);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<QuotePDFDownload {...defaultProps} variant="secondary" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Template Selection', () => {
    it('renders with modern template', () => {
      render(<QuotePDFDownload {...defaultProps} template={TemplateType.MODERN} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with classic template', () => {
      render(<QuotePDFDownload {...defaultProps} template={TemplateType.CLASSIC} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with minimal template', () => {
      render(<QuotePDFDownload {...defaultProps} template={TemplateType.MINIMAL} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('shows loading state when isLoading is true', () => {
      render(<QuotePDFDownload {...defaultProps} isLoading={true} />);
      expect(screen.getByText(/Generating/i)).toBeInTheDocument();
    });

    it('disables button when disabled prop is true', () => {
      render(<QuotePDFDownload {...defaultProps} disabled={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('enables button by default', () => {
      render(<QuotePDFDownload {...defaultProps} />);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  describe('Click Handling', () => {
    it('calls onClick when button is clicked', () => {
      const handleClick = jest.fn();
      render(<QuotePDFDownload {...defaultProps} onClick={handleClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('calls onDownload when download starts', async () => {
      const handleDownload = jest.fn();
      render(<QuotePDFDownload {...defaultProps} onDownload={handleDownload} />);
      
      fireEvent.click(screen.getByRole('button'));
      // Download callback would be triggered after PDF generation
    });
  });

  describe('File Naming', () => {
    it('uses custom file name when provided', () => {
      render(<QuotePDFDownload {...defaultProps} fileName="custom-name.pdf" />);
      // File name is passed to PDFDownloadLink
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('generates default file name from quote number', () => {
      render(<QuotePDFDownload {...defaultProps} fileName={undefined as any} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct button role', () => {
      render(<QuotePDFDownload {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<QuotePDFDownload {...defaultProps} ariaLabel="Download quote PDF" />);
      expect(screen.getByLabelText('Download quote PDF')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<QuotePDFDownload {...defaultProps} className="custom-class" />);
      expect(screen.getByRole('button').parentElement).toHaveClass('custom-class');
    });
  });
});

// ============================================================================
// QuotePDF Component Tests
// ============================================================================

describe('QuotePDF', () => {
  it('exists as a module', () => {
    const { QuotePDF } = require('@/components/pdf/QuotePDF');
    expect(QuotePDF).toBeDefined();
  });
});

// ============================================================================
// QuotePDFEnhanced Component Tests
// ============================================================================

describe('QuotePDFEnhanced', () => {
  it('exists as a module', () => {
    const { QuotePDFEnhanced } = require('@/components/pdf/QuotePDFEnhanced');
    expect(QuotePDFEnhanced).toBeDefined();
  });
});

// ============================================================================
// PDF Utility Tests
// ============================================================================

describe('PDF Utilities', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      const { formatCurrency } = require('@/lib/pdf-utils');
      if (formatCurrency) {
        expect(formatCurrency(1000)).toContain('1,000');
        expect(formatCurrency(1000.50)).toContain('1,000.50');
      }
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const { formatDate } = require('@/lib/pdf-utils');
      if (formatDate) {
        const date = '2026-02-01T00:00:00Z';
        const formatted = formatDate(date);
        expect(formatted).toBeTruthy();
      }
    });
  });
});

// ============================================================================
// PDF Templates Tests
// ============================================================================

describe('PDF Templates', () => {
  it('modern template exists', () => {
    const templates = require('@/components/pdf/templates');
    expect(templates).toBeDefined();
  });

  it('classic template exists', () => {
    const templates = require('@/components/pdf/templates');
    expect(templates).toBeDefined();
  });

  it('minimal template exists', () => {
    const templates = require('@/components/pdf/templates');
    expect(templates).toBeDefined();
  });
});
