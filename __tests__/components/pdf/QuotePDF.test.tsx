/**
 * PDF Generation Components Test Suite
 * Comprehensive tests for QuotePDF, PDFTemplates, and PDFTemplateSelector
 * @module __tests__/components/pdf/QuotePDF
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { pdf } from '@react-pdf/renderer';

// Mock @react-pdf/renderer
jest.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) => <div data-testid="pdf-document">{children}</div>,
  Page: ({ children }: { children: React.ReactNode }) => <div data-testid="pdf-page">{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span data-testid="pdf-text">{children}</span>,
  View: ({ children, style }: { children: React.ReactNode; style?: object }) => (
    <div data-testid="pdf-view" style={style}>{children}</div>
  ),
  Image: ({ src }: { src: string }) => <img data-testid="pdf-image" src={src} alt="" />,
  StyleSheet: {
    create: (styles: object) => styles,
  },
  PDFDownloadLink: ({ children, fileName }: { children: Function; fileName: string }) => (
    <div data-testid="pdf-download-link" data-filename={fileName}>
      {children({ loading: false, error: null })}
    </div>
  ),
  pdf: jest.fn(() => ({
    toBlob: jest.fn().mockResolvedValue(new Blob(['test'], { type: 'application/pdf' })),
  })),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    iframe: ({ ...props }: any) => <iframe {...props} />,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Import components after mocks
import {
  QuotePDFDocument,
  PDFDownloadButton,
  PDFPreview,
  PDFActions,
  PDFErrorBoundary,
  usePDFPrintStyles,
  type CompanyBranding,
  type PDFGenerationOptions,
} from '@/components/pdf/QuotePDF';
import {
  getPDFTemplate,
  getDefaultPDFTemplate,
  isValidPDFTemplate,
  getAllPDFTemplateMetadata,
  hexToRGBA,
  lightenColor,
  darkenColor,
  modernTemplate,
  classicTemplate,
  minimalTemplate,
  professionalTemplate,
  type PDFTemplateType,
} from '@/components/pdf/PDFTemplates';
import {
  PDFTemplateSelector,
  CompactTemplateSelector,
  TemplatePreviewModal,
} from '@/components/pdf/PDFTemplateSelector';
import { Quote, QuoteStatus, Customer } from '@/types';

// ============================================================================
// Test Data
// ============================================================================

const mockCustomer: Customer = {
  id: 'cust-1',
  email: 'john@example.com',
  companyName: 'Acme Corporation',
  contactName: 'John Doe',
  phone: '+1 555-0123',
  customerSince: new Date('2024-01-01'),
  tags: ['enterprise'],
  createdAt: new Date(),
  updatedAt: new Date(),
  status: 'active' as const,
};

const mockQuote: Quote = {
  id: 'quote-1',
  quoteNumber: 'QT-2024-001',
  customerId: mockCustomer.id,
  customer: mockCustomer,
  title: 'Enterprise Software Package',
  status: QuoteStatus.SENT,
  priority: 'high',
  lineItems: [
    {
      id: 'item-1',
      productId: 'prod-1',
      title: 'Premium License',
      variantTitle: 'Annual Subscription',
      sku: 'LIC-PREM-001',
      quantity: 10,
      unitPrice: 999,
      discountAmount: 0,
      discountPercentage: 10,
      taxRate: 0.1,
      taxAmount: 99.9,
      subtotal: 9990,
      total: 8991,
    },
    {
      id: 'item-2',
      productId: 'prod-2',
      title: 'Implementation Services',
      sku: 'SERV-IMPL-001',
      quantity: 40,
      unitPrice: 150,
      discountAmount: 0,
      taxRate: 0.1,
      taxAmount: 600,
      subtotal: 6000,
      total: 6600,
    },
  ],
  subtotal: 15990,
  discountTotal: 999,
  taxTotal: 1699.9,
  shippingTotal: 0,
  total: 16690.9,
  terms: {
    paymentTerms: 'Net 30 days',
    deliveryTerms: 'Immediate upon payment',
    validityPeriod: 30,
    depositRequired: true,
    depositPercentage: 50,
    currency: 'USD',
    notes: 'Thank you for your business!',
  },
  metadata: {
    createdBy: 'user-1',
    createdByName: 'Admin User',
    source: 'web',
  },
  expiresAt: new Date('2024-12-31'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCompanyBranding: CompanyBranding = {
  name: 'QuoteGen Inc.',
  logo: 'https://example.com/logo.png',
  address: '123 Business St, Suite 100\nSan Francisco, CA 94102',
  phone: '+1 555-0199',
  email: 'sales@quotegen.com',
  website: 'www.quotegen.com',
  taxId: '12-3456789',
};

const mockOptions: PDFGenerationOptions = {
  template: 'modern',
  includeHeader: true,
  includeFooter: true,
  includeLogo: true,
  format: 'A4',
  pageNumbers: true,
};

// ============================================================================
// PDF Templates Tests
// ============================================================================

describe('PDFTemplates', () => {
  describe('getPDFTemplate', () => {
    it('should return modern template for modern type', () => {
      const template = getPDFTemplate('modern');
      expect(template.type).toBe('modern');
      expect(template.name).toBe('Modern');
    });

    it('should return classic template for classic type', () => {
      const template = getPDFTemplate('classic');
      expect(template.type).toBe('classic');
      expect(template.name).toBe('Classic');
    });

    it('should return minimal template for minimal type', () => {
      const template = getPDFTemplate('minimal');
      expect(template.type).toBe('minimal');
      expect(template.name).toBe('Minimal');
    });

    it('should return professional template for professional type', () => {
      const template = getPDFTemplate('professional');
      expect(template.type).toBe('professional');
      expect(template.name).toBe('Professional');
    });

    it('should return modern template as fallback for invalid type', () => {
      const template = getPDFTemplate('invalid' as PDFTemplateType);
      expect(template).toBeDefined();
    });
  });

  describe('getDefaultPDFTemplate', () => {
    it('should return modern template as default', () => {
      const template = getDefaultPDFTemplate();
      expect(template.type).toBe('modern');
      expect(template.name).toBe('Modern');
    });
  });

  describe('isValidPDFTemplate', () => {
    it('should return true for valid template types', () => {
      expect(isValidPDFTemplate('modern')).toBe(true);
      expect(isValidPDFTemplate('classic')).toBe(true);
      expect(isValidPDFTemplate('minimal')).toBe(true);
      expect(isValidPDFTemplate('professional')).toBe(true);
    });

    it('should return false for invalid template types', () => {
      expect(isValidPDFTemplate('invalid')).toBe(false);
      expect(isValidPDFTemplate('')).toBe(false);
      expect(isValidPDFTemplate('blue')).toBe(false);
    });
  });

  describe('getAllPDFTemplateMetadata', () => {
    it('should return all template metadata', () => {
      const metadata = getAllPDFTemplateMetadata();
      expect(metadata).toHaveLength(4);
      expect(metadata.map(m => m.id)).toEqual(['modern', 'classic', 'minimal', 'professional']);
    });

    it('should include name and description for each template', () => {
      const metadata = getAllPDFTemplateMetadata();
      metadata.forEach((meta) => {
        expect(meta.name).toBeDefined();
        expect(meta.description).toBeDefined();
        expect(meta.id).toBeDefined();
      });
    });
  });

  describe('Color utilities', () => {
    describe('hexToRGBA', () => {
      it('should convert hex to rgba with default opacity', () => {
        expect(hexToRGBA('#6366f1')).toBe('rgba(99, 102, 241, 1)');
      });

      it('should convert hex to rgba with custom opacity', () => {
        expect(hexToRGBA('#6366f1', 0.5)).toBe('rgba(99, 102, 241, 0.5)');
      });

      it('should handle hex without hash', () => {
        expect(hexToRGBA('6366f1')).toBe('rgba(99, 102, 241, 1)');
      });
    });

    describe('lightenColor', () => {
      it('should lighten a color by given percentage', () => {
        const lightened = lightenColor('#6366f1', 20);
        expect(lightened).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    describe('darkenColor', () => {
      it('should darken a color by given percentage', () => {
        const darkened = darkenColor('#6366f1', 20);
        expect(darkened).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('Template configurations', () => {
    it('modern template should have correct structure', () => {
      expect(modernTemplate).toHaveProperty('type');
      expect(modernTemplate).toHaveProperty('name');
      expect(modernTemplate).toHaveProperty('colors');
      expect(modernTemplate).toHaveProperty('typography');
      expect(modernTemplate).toHaveProperty('spacing');
      expect(modernTemplate).toHaveProperty('page');
      expect(modernTemplate).toHaveProperty('features');
    });

    it('classic template should use Times-Roman font', () => {
      expect(classicTemplate.typography.fontFamily).toBe('Times-Roman');
    });

    it('minimal template should have compact mode enabled', () => {
      expect(minimalTemplate.features.compactMode).toBe(true);
    });

    it('professional template should have watermark enabled', () => {
      expect(professionalTemplate.features.showWatermark).toBe(true);
    });
  });
});

// ============================================================================
// QuotePDFDocument Tests
// ============================================================================

describe('QuotePDFDocument', () => {
  it('should render without crashing', () => {
    render(
      <QuotePDFDocument
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
      />
    );
    expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
  });

  it('should display quote number', () => {
    render(
      <QuotePDFDocument
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
      />
    );
    expect(screen.getByText(/QT-2024-001/)).toBeInTheDocument();
  });

  it('should display customer information', () => {
    render(
      <QuotePDFDocument
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
      />
    );
    expect(screen.getByText(/Acme Corporation/)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
  });

  it('should display line items', () => {
    render(
      <QuotePDFDocument
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
      />
    );
    expect(screen.getByText(/Premium License/)).toBeInTheDocument();
    expect(screen.getByText(/Implementation Services/)).toBeInTheDocument();
  });

  it('should display totals', () => {
    render(
      <QuotePDFDocument
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
      />
    );
    // Check for grand total row with currency value
    expect(screen.getByText(/\$16,690\.90/)).toBeInTheDocument();
  });

  it('should render with different templates', () => {
    const templates: PDFTemplateType[] = ['modern', 'classic', 'minimal', 'professional'];
    templates.forEach((template) => {
      const { container } = render(
        <QuotePDFDocument
          quote={mockQuote}
          companyBranding={mockCompanyBranding}
          options={{ ...mockOptions, template }}
        />
      );
      expect(container.querySelector('[data-testid="pdf-document"]')).toBeInTheDocument();
    });
  });

  it('should render without header when includeHeader is false', () => {
    render(
      <QuotePDFDocument
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={{ ...mockOptions, includeHeader: false }}
      />
    );
    // Document should still render
    expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
  });

  it('should render without footer when includeFooter is false', () => {
    render(
      <QuotePDFDocument
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={{ ...mockOptions, includeFooter: false }}
      />
    );
    expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
  });
});

// ============================================================================
// PDFDownloadButton Tests
// ============================================================================

describe('PDFDownloadButton', () => {
  it('should render download button', () => {
    render(
      <PDFDownloadButton
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
      />
    );
    expect(screen.getByText(/Download PDF/)).toBeInTheDocument();
  });

  it('should render custom children', () => {
    render(
      <PDFDownloadButton
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
      >
        Custom Text
      </PDFDownloadButton>
    );
    expect(screen.getByText(/Custom Text/)).toBeInTheDocument();
  });

  it('should apply variant classes', () => {
    const { rerender } = render(
      <PDFDownloadButton
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        variant="primary"
      />
    );

    rerender(
      <PDFDownloadButton
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        variant="secondary"
      />
    );
  });

  it('should apply size classes', () => {
    const { rerender } = render(
      <PDFDownloadButton
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        size="sm"
      />
    );

    rerender(
      <PDFDownloadButton
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        size="lg"
      />
    );
  });

  it('should call onDownloadStart when download starts', () => {
    const onDownloadStart = jest.fn();
    render(
      <PDFDownloadButton
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        onDownloadStart={onDownloadStart}
      />
    );
    // Button renders successfully
    expect(screen.getByText(/Download PDF/)).toBeInTheDocument();
  });

  it('should have correct filename format', () => {
    render(
      <PDFDownloadButton
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
      />
    );
    const link = screen.getByTestId('pdf-download-link');
    expect(link).toHaveAttribute('data-filename', 'quote-qt-2024-001.pdf');
  });
});

// ============================================================================
// PDFPreview Tests
// ============================================================================

describe('PDFPreview', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:test');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('should show loading state initially', () => {
    render(
      <PDFPreview
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
      />
    );
    expect(screen.getByText(/Generating preview/)).toBeInTheDocument();
  });

  it('should pass accessibility attributes', () => {
    render(
      <PDFPreview
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        height={400}
      />
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Generating PDF preview');
  });

  it('should apply custom height', () => {
    render(
      <PDFPreview
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        height={400}
      />
    );
    expect(screen.getByRole('status')).toHaveStyle({ height: '400px' });
  });
});

// ============================================================================
// PDFActions Tests
// ============================================================================

describe('PDFActions', () => {
  it('should render all action buttons by default', () => {
    render(
      <PDFActions
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        onPrint={jest.fn()}
        onShare={jest.fn()}
        onDuplicate={jest.fn()}
      />
    );
    expect(screen.getByText(/Download PDF/)).toBeInTheDocument();
    expect(screen.getByText(/Preview/)).toBeInTheDocument();
    expect(screen.getByText(/Print/)).toBeInTheDocument();
    expect(screen.getByText(/Share/)).toBeInTheDocument();
    expect(screen.getByText(/Duplicate/)).toBeInTheDocument();
  });

  it('should hide actions based on showActions prop', () => {
    render(
      <PDFActions
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        showActions={{ download: true, print: false, share: false, duplicate: false, preview: false }}
      />
    );
    expect(screen.getByText(/Download PDF/)).toBeInTheDocument();
    expect(screen.queryByText(/Print/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Share/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Duplicate/)).not.toBeInTheDocument();
  });

  it('should call onPrint when print button is clicked', () => {
    const onPrint = jest.fn();
    render(
      <PDFActions
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        onPrint={onPrint}
      />
    );
    fireEvent.click(screen.getByText(/Print/));
    expect(onPrint).toHaveBeenCalled();
  });

  it('should call onShare when share button is clicked', () => {
    const onShare = jest.fn();
    render(
      <PDFActions
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        onShare={onShare}
      />
    );
    fireEvent.click(screen.getByText(/Share/));
    expect(onShare).toHaveBeenCalled();
  });

  it('should call onDuplicate when duplicate button is clicked', () => {
    const onDuplicate = jest.fn();
    render(
      <PDFActions
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        onDuplicate={onDuplicate}
      />
    );
    fireEvent.click(screen.getByText(/Duplicate/));
    expect(onDuplicate).toHaveBeenCalled();
  });

  it('should toggle preview panel when preview button is clicked', () => {
    render(
      <PDFActions
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
      />
    );
    const previewButton = screen.getByText(/Preview/);
    fireEvent.click(previewButton);
    expect(screen.getByText(/Hide Preview/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Hide Preview/));
    expect(screen.getByText(/Preview/)).toBeInTheDocument();
  });
});

// ============================================================================
// PDFErrorBoundary Tests
// ============================================================================

describe('PDFErrorBoundary', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  it('should catch errors and display fallback UI', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <PDFErrorBoundary>
        <ThrowError />
      </PDFErrorBoundary>
    );
    
    expect(screen.getByText(/PDF Generation Error/)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('should render children when no error', () => {
    render(
      <PDFErrorBoundary>
        <div data-testid="child">Child Content</div>
      </PDFErrorBoundary>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should call onError when error occurs', () => {
    const onError = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <PDFErrorBoundary onError={onError}>
        <ThrowError />
      </PDFErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

// ============================================================================
// usePDFPrintStyles Tests
// ============================================================================

describe('usePDFPrintStyles', () => {
  it('should inject print styles on mount', () => {
    const TestComponent = () => {
      usePDFPrintStyles();
      return <div>Test</div>;
    };

    render(<TestComponent />);
    
    const styleElement = document.getElementById('pdf-print-styles');
    expect(styleElement).toBeInTheDocument();
  });

  it('should not inject duplicate styles', () => {
    const TestComponent = () => {
      usePDFPrintStyles();
      return <div>Test</div>;
    };

    const { rerender } = render(<TestComponent />);
    rerender(<TestComponent />);
    
    const styleElements = document.querySelectorAll('#pdf-print-styles');
    expect(styleElements).toHaveLength(1);
  });

  it('should remove styles on unmount', () => {
    const TestComponent = () => {
      usePDFPrintStyles();
      return <div>Test</div>;
    };

    const { unmount } = render(<TestComponent />);
    unmount();
    
    const styleElement = document.getElementById('pdf-print-styles');
    expect(styleElement).not.toBeInTheDocument();
  });
});

// ============================================================================
// PDFTemplateSelector Tests
// ============================================================================

describe('PDFTemplateSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render all template options', () => {
    render(
      <PDFTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
      />
    );
    expect(screen.getByText(/Modern/)).toBeInTheDocument();
    expect(screen.getByText(/Classic/)).toBeInTheDocument();
    expect(screen.getByText(/Minimal/)).toBeInTheDocument();
    expect(screen.getByText(/Professional/)).toBeInTheDocument();
  });

  it('should call onTemplateChange when template is selected', () => {
    render(
      <PDFTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
      />
    );
    fireEvent.click(screen.getByLabelText(/Select Classic template/));
    expect(mockOnChange).toHaveBeenCalledWith('classic');
  });

  it('should not call onTemplateChange when clicking already selected template', () => {
    render(
      <PDFTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
      />
    );
    fireEvent.click(screen.getByLabelText(/Select Modern template/));
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should show default badge on default template', () => {
    render(
      <PDFTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
      />
    );
    expect(screen.getByText(/Default/)).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(
      <PDFTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
        label="Choose Template"
      />
    );
    expect(screen.getByText(/Choose Template/)).toBeInTheDocument();
  });

  it('should render with helper text', () => {
    render(
      <PDFTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
        helperText="Select a template for your PDF"
      />
    );
    expect(screen.getByText(/Select a template for your PDF/)).toBeInTheDocument();
  });

  it('should render with error message', () => {
    render(
      <PDFTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
        error="Please select a template"
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/Please select a template/);
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <PDFTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
        disabled
      />
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('should have correct ARIA attributes', () => {
    render(
      <PDFTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
      />
    );
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'PDF Template Selection');
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Available PDF templates');
  });
});

// ============================================================================
// CompactTemplateSelector Tests
// ============================================================================

describe('CompactTemplateSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render select element with options', () => {
    render(
      <CompactTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
      />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should call onTemplateChange when selection changes', () => {
    render(
      <CompactTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'classic' } });
    expect(mockOnChange).toHaveBeenCalledWith('classic');
  });

  it('should show description of selected template', () => {
    render(
      <CompactTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
      />
    );
    expect(screen.getByText(/Clean, contemporary design/)).toBeInTheDocument();
  });

  it('should apply disabled state', () => {
    render(
      <CompactTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={mockOnChange}
        disabled
      />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

// ============================================================================
// TemplatePreviewModal Tests
// ============================================================================

describe('TemplatePreviewModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render when open', () => {
    render(
      <TemplatePreviewModal
        template="modern"
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText(/Modern Template/)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <TemplatePreviewModal
        template="modern"
        isOpen={false}
        onClose={mockOnClose}
      />
    );
    expect(screen.queryByText(/Modern Template/)).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <TemplatePreviewModal
        template="modern"
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByLabelText(/Close preview/));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display quote information in preview', () => {
    render(
      <TemplatePreviewModal
        template="modern"
        isOpen={true}
        onClose={mockOnClose}
        quote={{
          quoteNumber: 'QT-001',
          customerName: 'Test Company',
        }}
      />
    );
    expect(screen.getByText(/QT-001/)).toBeInTheDocument();
    expect(screen.getByText(/Test Company/)).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(
      <TemplatePreviewModal
        template="modern"
        isOpen={true}
        onClose={mockOnClose}
      />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'template-preview-title');
  });
});

// ============================================================================
// Accessibility Tests
// ============================================================================

describe('Accessibility', () => {
  it('PDFTemplateSelector should have proper button roles', () => {
    render(
      <PDFTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={jest.fn()}
      />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('CompactTemplateSelector should have proper label association', () => {
    render(
      <CompactTemplateSelector
        selectedTemplate="modern"
        onTemplateChange={jest.fn()}
        label="Choose Template"
      />
    );
    const label = screen.getByText(/Choose Template/);
    const select = screen.getByRole('combobox');
    expect(label).toHaveAttribute('for', 'template-select');
    expect(select).toHaveAttribute('id', 'template-select');
  });

  it('PDFActions buttons should have aria-labels', () => {
    render(
      <PDFActions
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
        onPrint={jest.fn()}
        onShare={jest.fn()}
        onDuplicate={jest.fn()}
      />
    );
    expect(screen.getByLabelText(/Print quote/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Share quote/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Duplicate quote/)).toBeInTheDocument();
  });

  it('PDFPreview should have proper ARIA attributes', () => {
    render(
      <PDFPreview
        quote={mockQuote}
        companyBranding={mockCompanyBranding}
        options={mockOptions}
      />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
