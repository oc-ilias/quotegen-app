/**
 * Email Template Selector Component Tests
 * @module __tests__/components/email/EmailTemplateSelector
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  EmailTemplateSelector, 
  EmailTemplateSelectorSkeleton,
  processTemplate,
  extractVariables,
  EmailTemplate,
} from '@/components/email/EmailTemplateSelector';
import { Quote, QuoteStatus } from '@/types/quote';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, exit, whileHover, whileTap, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, whileHover, whileTap, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => {
    // Filter out null/undefined children to match real AnimatePresence behavior
    const validChildren = React.Children.toArray(children).filter(Boolean);
    return <>{validChildren}</>;
  },
}));

// ============================================================================
// Test Data
// ============================================================================

const mockQuote: Quote = {
  id: 'quote-1',
  quoteNumber: 'QT-001',
  customerId: 'cust-1',
  customer: {
    id: 'cust-1',
    email: 'customer@example.com',
    companyName: 'Acme Corp',
    contactName: 'Jane Smith',
    phone: '+1234567890',
    customerSince: new Date('2024-01-01'),
    tags: [],
  },
  title: 'Product Quote',
  status: QuoteStatus.SENT,
  priority: 'medium' as const,
  lineItems: [],
  subtotal: 1000,
  discountTotal: 100,
  taxTotal: 90,
  shippingTotal: 50,
  total: 1040,
  terms: {
    paymentTerms: 'Net 30',
    deliveryTerms: 'Standard',
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
  expiresAt: new Date('2024-02-15'),
  sentAt: new Date('2024-01-15'),
};

const mockSenderInfo = {
  name: 'John Doe',
  email: 'john@company.com',
  companyName: 'Best Company',
};

const mockCustomTemplate: EmailTemplate = {
  id: 'custom-1',
  name: 'Custom Template',
  description: 'A custom email template',
  category: 'follow-up',
  subject: 'Custom: {{quote_number}}',
  body: 'Hello {{customer_name}},\n\nYour quote {{quote_number}} is ready.',
};

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('extractVariables', () => {
  it('extracts all variables from template content', () => {
    const content = 'Hello {{customer_name}}, your quote {{quote_number}} from {{company_name}}.';
    const variables = extractVariables(content);
    
    expect(variables).toContain('{{customer_name}}');
    expect(variables).toContain('{{quote_number}}');
    expect(variables).toContain('{{company_name}}');
    expect(variables).toHaveLength(3);
  });

  it('returns unique variables only', () => {
    const content = '{{quote_number}} and {{quote_number}}';
    const variables = extractVariables(content);
    
    expect(variables).toHaveLength(1);
    expect(variables).toContain('{{quote_number}}');
  });

  it('returns empty array for no variables', () => {
    const content = 'No variables here';
    const variables = extractVariables(content);
    
    expect(variables).toHaveLength(0);
  });
});

describe('processTemplate', () => {
  it('replaces all variables correctly', () => {
    const template: EmailTemplate = {
      id: 'test',
      name: 'Test',
      description: 'Test template',
      category: 'initial',
      subject: 'Quote {{quote_number}} from {{company_name}}',
      body: 'Dear {{customer_name}},\n\nYour quote for {{quote_total}} is ready.',
    };

    const result = processTemplate(template, mockQuote, mockSenderInfo, 'https://example.com/quote/1');

    expect(result.subject).toBe('Quote QT-001 from Best Company');
    expect(result.subject).not.toContain('{{');
    expect(result.body).toContain('Jane Smith');
    expect(result.body).toContain('$1,040.00');
    expect(result.body).not.toContain('{{');
  });

  it('handles missing optional data gracefully', () => {
    const quoteWithoutCustomer = { ...mockQuote, customer: undefined } as any;
    
    const template: EmailTemplate = {
      id: 'test',
      name: 'Test',
      description: 'Test template',
      category: 'initial',
      subject: 'Quote',
      body: 'Hello {{customer_name}}',
    };

    const result = processTemplate(template, quoteWithoutCustomer, mockSenderInfo);

    expect(result.body).toContain('Valued Customer');
  });

  it('formats dates correctly', () => {
    const template: EmailTemplate = {
      id: 'test',
      name: 'Test',
      description: 'Test template',
      category: 'initial',
      subject: 'Quote',
      body: 'Created: {{quote_date}}, Expires: {{expiry_date}}',
    };

    const result = processTemplate(template, mockQuote, mockSenderInfo);

    expect(result.body).toContain('Jan 15, 2024');
    expect(result.body).toContain('Feb 15, 2024');
  });

  it('formats currency correctly', () => {
    const template: EmailTemplate = {
      id: 'test',
      name: 'Test',
      description: 'Test template',
      category: 'initial',
      subject: 'Quote',
      body: 'Total: {{quote_total}}',
    };

    const result = processTemplate(template, mockQuote, mockSenderInfo);

    expect(result.body).toContain('$');
    expect(result.body).toContain('1,040');
  });

  it('generates valid HTML from plain text', () => {
    const template: EmailTemplate = {
      id: 'test',
      name: 'Test',
      description: 'Test template',
      category: 'initial',
      subject: 'Quote',
      body: 'Line 1\n\nLine 2\nLine 3',
    };

    const result = processTemplate(template, mockQuote, mockSenderInfo);

    expect(result.bodyHtml).toContain('<p>');
    expect(result.bodyHtml).toContain('<br />');
  });

  it('converts URLs to links in HTML', () => {
    const template: EmailTemplate = {
      id: 'test',
      name: 'Test',
      description: 'Test template',
      category: 'initial',
      subject: 'Quote',
      body: 'View at: {{view_quote_link}}',
    };

    const result = processTemplate(template, mockQuote, mockSenderInfo, 'https://example.com/quote');

    expect(result.bodyHtml).toContain('<a');
    expect(result.bodyHtml).toContain('href="https://example.com/quote"');
  });
});

// ============================================================================
// Component Tests
// ============================================================================

describe('EmailTemplateSelector', () => {
  const mockOnSelect = jest.fn();
  const mockOnSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('rendering', () => {
    it('renders with default templates', () => {
      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
        />
      );

      expect(screen.getByText('Email Templates')).toBeInTheDocument();
      expect(screen.getByText('Initial Quote')).toBeInTheDocument();
      expect(screen.getByText('Follow Up')).toBeInTheDocument();
      expect(screen.getByText('Expiry Reminder')).toBeInTheDocument();
    });

    it('renders custom templates', () => {
      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
          customTemplates={[mockCustomTemplate]}
        />
      );

      expect(screen.getByText('Custom Template')).toBeInTheDocument();
    });

    it('shows category headers', () => {
      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
        />
      );

      expect(screen.getByText('initial')).toBeInTheDocument();
      expect(screen.getByText('follow up')).toBeInTheDocument();
      expect(screen.getByText('reminder')).toBeInTheDocument();
      expect(screen.getByText('thank you')).toBeInTheDocument();
    });

    it('marks default template', () => {
      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
        />
      );

      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Loading State Tests
  // ==========================================================================

  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
          isLoading={true}
        />
      );

      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // Interaction Tests
  // ==========================================================================

  describe('interactions', () => {
    it('opens preview when template is selected', async () => {
      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
          onSelect={mockOnSelect}
        />
      );

      const templateButton = screen.getByLabelText('Select Initial Quote template');
      fireEvent.click(templateButton);

      // Wait for the modal to appear - check for the dialog role
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // The preview should show the template name as the title (heading level 2 in the modal)
      const modalTitle = screen.getByRole('heading', { level: 2, name: 'Initial Quote' });
      expect(modalTitle).toBeInTheDocument();
      // The preview tab should be visible
      expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument();
    });

    it('calls onSelect with processed content', async () => {
      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
          onSelect={mockOnSelect}
        />
      );

      const templateButton = screen.getByLabelText('Select Initial Quote template');
      fireEvent.click(templateButton);

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalled();
      });

      const [, processedContent] = mockOnSelect.mock.calls[0];
      expect(processedContent.subject).toContain('QT-001');
      expect(processedContent.body).toBeDefined();
    });

    it('switches between preview and source tabs', async () => {
      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
        />
      );

      const templateButton = screen.getByLabelText('Select Initial Quote template');
      fireEvent.click(templateButton);

      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument();
      });

      const sourceTab = screen.getByText('Plain Text');
      fireEvent.click(sourceTab);
    });

    it('closes preview on cancel', async () => {
      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
        />
      );

      const templateButton = screen.getByLabelText('Select Initial Quote template');
      fireEvent.click(templateButton);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
    });
  });

  // ==========================================================================
  // Send Functionality Tests
  // ==========================================================================

  describe('send functionality', () => {
    it('calls onSend when send button is clicked', async () => {
      mockOnSend.mockResolvedValue(undefined);

      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
          onSend={mockOnSend}
        />
      );

      const templateButton = screen.getByLabelText('Select Initial Quote template');
      fireEvent.click(templateButton);

      await waitFor(() => {
        expect(screen.getByText('Send Email')).toBeInTheDocument();
      });

      const sendButton = screen.getByText('Send Email');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalled();
      });
    });

    it('displays error when send fails', async () => {
      mockOnSend.mockRejectedValue(new Error('Send failed'));

      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
          onSend={mockOnSend}
        />
      );

      const templateButton = screen.getByLabelText('Select Initial Quote template');
      fireEvent.click(templateButton);

      await waitFor(() => {
        expect(screen.getByText('Send Email')).toBeInTheDocument();
      });

      const sendButton = screen.getByText('Send Email');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================

  describe('accessibility', () => {
    it('has correct ARIA labels on template buttons', () => {
      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
        />
      );

      expect(screen.getByLabelText('Select Initial Quote template')).toBeInTheDocument();
    });

    it('has accessible modal dialog', async () => {
      render(
        <EmailTemplateSelector
          quote={mockQuote}
          senderInfo={mockSenderInfo}
        />
      );

      const templateButton = screen.getByLabelText('Select Initial Quote template');
      fireEvent.click(templateButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });
    });
  });
});

// ============================================================================
// Skeleton Tests
// ============================================================================

describe('EmailTemplateSelectorSkeleton', () => {
  it('renders skeleton elements', () => {
    render(<EmailTemplateSelectorSkeleton />);

    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
