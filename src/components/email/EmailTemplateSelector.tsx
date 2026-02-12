/**
 * Email Template Selector Component
 * Pre-built email templates for sending quotes with preview and variable substitution
 * @module components/email/EmailTemplateSelector
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Quote, QuoteStatus } from '@/types/quote';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

// ============================================================================
// Types
// ============================================================================

/**
 * Email template variable names
 */
export type EmailTemplateVariable =
  | '{{company_name}}'
  | '{{quote_number}}'
  | '{{customer_name}}'
  | '{{quote_total}}'
  | '{{quote_date}}'
  | '{{expiry_date}}'
  | '{{sender_name}}'
  | '{{sender_email}}'
  | '{{view_quote_link}}';

/**
 * Email template structure
 */
export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  category: 'initial' | 'follow-up' | 'reminder' | 'thank-you';
  isDefault?: boolean;
}

interface EmailTemplateSelectorProps {
  /** The quote being sent */
  quote: Quote;
  /** Company/sender information */
  senderInfo: {
    name: string;
    email: string;
    companyName: string;
  };
  /** Optional custom templates */
  customTemplates?: EmailTemplate[];
  /** Callback when template is selected */
  onSelect?: (template: EmailTemplate, processedContent: ProcessedEmailContent) => void;
  /** Callback when email is sent */
  onSend?: (template: EmailTemplate, content: ProcessedEmailContent) => Promise<void>;
  /** Link for viewing the quote */
  viewQuoteLink?: string;
  /** Additional class names */
  className?: string;
  /** Whether the component is loading */
  isLoading?: boolean;
  /** Whether sending is in progress */
  isSending?: boolean;
}

interface ProcessedEmailContent {
  subject: string;
  body: string;
  bodyHtml: string;
}

interface TemplatePreviewProps {
  template: EmailTemplate;
  processedContent: ProcessedEmailContent;
  onClose: () => void;
  onSend: () => void;
  isSending: boolean;
}

// ============================================================================
// Default Email Templates
// ============================================================================

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'initial-send',
    name: 'Initial Quote',
    description: 'Send a new quote to the customer',
    category: 'initial',
    isDefault: true,
    subject: 'Your Quote {{quote_number}} from {{company_name}}',
    body: `Dear {{customer_name}},

Thank you for your interest in our products/services. Please find your quote details below:

Quote Number: {{quote_number}}
Total Amount: {{quote_total}}
Quote Date: {{quote_date}}
Valid Until: {{expiry_date}}

You can view and respond to your quote here: {{view_quote_link}}

If you have any questions, please don't hesitate to contact us.

Best regards,
{{sender_name}}
{{company_name}}`,
  },
  {
    id: 'follow-up',
    name: 'Follow Up',
    description: 'Gentle follow-up on a sent quote',
    category: 'follow-up',
    subject: 'Following up on Quote {{quote_number}}',
    body: `Dear {{customer_name}},

I hope this email finds you well. I wanted to follow up on the quote I sent on {{quote_date}}.

Quote Number: {{quote_number}}
Total Amount: {{quote_total}}
Valid Until: {{expiry_date}}

View your quote: {{view_quote_link}}

Please let me know if you have any questions or if you'd like to discuss any aspects of the quote. I'm here to help!

Best regards,
{{sender_name}}
{{company_name}}`,
  },
  {
    id: 'reminder',
    name: 'Expiry Reminder',
    description: 'Reminder before quote expires',
    category: 'reminder',
    subject: 'Reminder: Quote {{quote_number}} expires soon',
    body: `Dear {{customer_name}},

This is a friendly reminder that your quote will expire soon.

Quote Number: {{quote_number}}
Total Amount: {{quote_total}}
Valid Until: {{expiry_date}}

View and accept your quote: {{view_quote_link}}

To ensure you don't miss out on these prices, please review and respond before the expiry date.

Best regards,
{{sender_name}}
{{company_name}}`,
  },
  {
    id: 'thank-you-accepted',
    name: 'Thank You (Accepted)',
    description: 'Thank you message for accepted quotes',
    category: 'thank-you',
    subject: 'Thank you for accepting Quote {{quote_number}}',
    body: `Dear {{customer_name}},

Thank you for accepting our quote! We're excited to work with you.

Quote Number: {{quote_number}}
Total Amount: {{quote_total}}

We will be in touch shortly with the next steps. If you have any immediate questions, please feel free to reach out.

Best regards,
{{sender_name}}
{{company_name}}`,
  },
  {
    id: 'thank-you-feedback',
    name: 'Thank You (Feedback)',
    description: 'Request feedback on declined quotes',
    category: 'thank-you',
    subject: 'Thank you for considering {{company_name}}',
    body: `Dear {{customer_name}},

Thank you for considering our quote. We appreciate the opportunity to work with you.

Quote Number: {{quote_number}}

We'd love to learn how we can improve our service. If you have a moment, please share any feedback on why you decided not to proceed with this quote.

We hope to work with you in the future!

Best regards,
{{sender_name}}
{{company_name}}`,
  },
];

// ============================================================================
// Variable Substitution Utilities
// ============================================================================

/**
 * Extracts variables from template content
 * @param content - Template content to parse
 * @returns Array of found variables
 */
export function extractVariables(content: string): EmailTemplateVariable[] {
  const variableRegex = /\{\{[a-z_]+\}\}/g;
  const matches = content.match(variableRegex) || [];
  return [...new Set(matches)] as EmailTemplateVariable[];
}

/**
 * Processes a template by substituting variables with actual values
 * @param template - Email template to process
 * @param quote - Quote data for variable substitution
 * @param senderInfo - Sender information
 * @param viewQuoteLink - Link to view the quote
 * @returns Processed email content
 */
export function processTemplate(
  template: EmailTemplate,
  quote: Quote,
  senderInfo: { name: string; email: string; companyName: string },
  viewQuoteLink: string = ''
): ProcessedEmailContent {
  const variables: Record<EmailTemplateVariable, string> = {
    '{{company_name}}': senderInfo.companyName,
    '{{quote_number}}': quote.quoteNumber,
    '{{customer_name}}': quote.customer?.contactName || 'Valued Customer',
    '{{quote_total}}': formatCurrency(quote.total, quote.terms?.currency),
    '{{quote_date}}': formatDate(quote.createdAt),
    '{{expiry_date}}': quote.expiresAt ? formatDate(quote.expiresAt) : 'N/A',
    '{{sender_name}}': senderInfo.name,
    '{{sender_email}}': senderInfo.email,
    '{{view_quote_link}}': viewQuoteLink,
  };

  let processedSubject = template.subject;
  let processedBody = template.body;

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    processedSubject = processedSubject.replace(regex, value);
    processedBody = processedBody.replace(regex, value);
  });

  // Convert plain text to HTML for preview
  const bodyHtml = processedBody
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" class="text-indigo-400 hover:underline">$1</a>');

  return {
    subject: processedSubject,
    body: processedBody,
    bodyHtml: `<div class="space-y-4"><p>${bodyHtml}</p></div>`,
  };
}

// ============================================================================
// Category Icon Component
// ============================================================================

const CategoryIcon: React.FC<{ category: EmailTemplate['category'] }> = ({
  category,
}) => {
  const icons = {
    initial: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    'follow-up': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    reminder: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    'thank-you': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  };

  return icons[category];
};

// ============================================================================
// Template Preview Component
// ============================================================================

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  processedContent,
  onClose,
  onSend,
  isSending,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'source'>('preview');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-preview-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 id="template-preview-title" className="text-xl font-semibold text-white">
              {template.name}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4">
          {(['preview', 'source'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                activeTab === tab
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
              aria-pressed={activeTab === tab}
            >
              {tab === 'preview' ? 'Preview' : 'Plain Text'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'preview' ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Subject:</p>
                  <p className="text-white font-medium">{processedContent.subject}</p>
                </div>
                <div
                  className="bg-white rounded-lg p-6 text-slate-900 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: processedContent.bodyHtml }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="source"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Subject:</p>
                  <p className="text-white">{processedContent.subject}</p>
                </div>
                <pre className="bg-slate-800 rounded-lg p-4 text-slate-300 text-sm whitespace-pre-wrap font-mono">
                  {processedContent.body}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CategoryIcon category={template.category} />
            <span className="capitalize">{template.category.replace('-', ' ')}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onSend}
              disabled={isSending}
              className="relative"
            >
              {isSending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Loading Skeleton Component
// ============================================================================

/**
 * Skeleton loader for Email Template Selector
 */
export const EmailTemplateSelectorSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <Skeleton width={200} height={24} className="mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-start gap-4">
              <Skeleton width={40} height={40} variant="rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton width={120} height={20} />
                <Skeleton width="100%" height={16} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Main Email Template Selector Component
// ============================================================================

/**
 * Email Template Selector Component
 * 
 * Provides pre-built email templates for sending quotes with:
 * - Variable substitution ({{company_name}}, {{quote_number}}, etc.)
 * - Live preview before sending
 * - Custom template support
 * - Category filtering
 * 
 * @example
 * ```tsx
 * <EmailTemplateSelector
 *   quote={quote}
 *   senderInfo={{
 *     name: 'John Doe',
 *     email: 'john@company.com',
 *     companyName: 'Acme Corp'
 *   }}
 *   viewQuoteLink="https://example.com/quote/123"
 *   onSend={async (template, content) => {
 *     await sendEmail(quote.customer.email, content.subject, content.body);
 *   }}
 * />
 * ```
 */
export const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({
  quote,
  senderInfo,
  customTemplates = [],
  onSelect,
  onSend,
  viewQuoteLink = '',
  className,
  isLoading = false,
  isSending = false,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Combine default and custom templates
  const allTemplates = useMemo(() => {
    return [...DEFAULT_TEMPLATES, ...customTemplates];
  }, [customTemplates]);

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups: Record<EmailTemplate['category'], EmailTemplate[]> = {
      initial: [],
      'follow-up': [],
      reminder: [],
      'thank-you': [],
    };

    allTemplates.forEach((template) => {
      groups[template.category].push(template);
    });

    return groups;
  }, [allTemplates]);

  /**
   * Handles template selection
   */
  const handleSelect = useCallback(
    (template: EmailTemplate) => {
      setSelectedTemplate(template);
      setError(null);

      const processedContent = processTemplate(template, quote, senderInfo, viewQuoteLink);
      onSelect?.(template, processedContent);
      setIsPreviewOpen(true);
    },
    [quote, senderInfo, viewQuoteLink, onSelect]
  );

  /**
   * Handles sending the email
   */
  const handleSend = useCallback(async () => {
    if (!selectedTemplate) return;

    setError(null);

    try {
      const processedContent = processTemplate(
        selectedTemplate,
        quote,
        senderInfo,
        viewQuoteLink
      );

      await onSend?.(selectedTemplate, processedContent);
      setIsPreviewOpen(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send email');
      setError(error);
    }
  }, [selectedTemplate, quote, senderInfo, viewQuoteLink, onSend]);

  if (isLoading) {
    return <EmailTemplateSelectorSkeleton />;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Email Templates</h3>
        <p className="text-slate-400 text-sm">
          Choose a template to send with your quote. Variables will be automatically filled.
        </p>
      </div>

      {/* Template Categories */}
      <div className="space-y-6">
        {(Object.keys(groupedTemplates) as EmailTemplate['category'][]).map((category) => {
          const templates = groupedTemplates[category];
          if (templates.length === 0) return null;

          return (
            <div key={category}>
              <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">
                {category.replace('-', ' ')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((template) => (
                  <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelect(template)}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-xl border text-left transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                      selectedTemplate?.id === template.id
                        ? 'bg-indigo-500/10 border-indigo-500/30'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    )}
                    aria-label={`Select ${template.name} template`}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        selectedTemplate?.id === template.id
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-slate-800 text-slate-400'
                      )}
                    >
                      <CategoryIcon category={template.category} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white truncate">{template.name}</p>
                        {template.isDefault && (
                          <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
            role="alert"
          >
            <p className="text-red-400 text-sm">{error.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && selectedTemplate && (
          <TemplatePreview
            template={selectedTemplate}
            processedContent={processTemplate(selectedTemplate, quote, senderInfo, viewQuoteLink)}
            onClose={() => setIsPreviewOpen(false)}
            onSend={handleSend}
            isSending={isSending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailTemplateSelector;
