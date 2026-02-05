/**
 * Email Templates Hook
 * CRUD operations with LocalStorage persistence for email templates
 * @module hooks/useEmailTemplates
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  EmailTemplate,
  TemplateCategory,
  TemplateError,
  TemplateOperations,
  TemplatePreviewData,
  TemplateState,
  TemplateValidationResult,
  TemplateValidationError,
  TemplateValidationErrorCode,
  TemplateValidationWarning,
  TemplateVariable,
  TemplateVariableExamples,
  defaultPreviewData,
  defaultDarkTheme,
  TemplatePreset,
  TemplateTheme,
} from '@/types/template';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'quotegen-email-templates';
const MAX_SUBJECT_LENGTH = 200;
const MAX_CONTENT_LENGTH = 50000;

// ============================================================================
// Default Templates
// ============================================================================

const defaultQuoteTemplate: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
  name: 'Default Quote Email',
  description: 'Standard quote notification email',
  subject: 'Your Quote {{quoteNumber}} from {{shopName}}',
  htmlContent: `<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6;">
  <p>Dear {{customerName}},</p>
  
  <p>Thank you for your interest in our products. We've prepared a custom quote for you.</p>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin: 0 0 10px 0;">Quote Summary</h3>
    <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
    <p><strong>Total Amount:</strong> {{quoteTotal}}</p>
    <p><strong>Valid Until:</strong> {{validUntil}}</p>
  </div>
  
  <p>You can view your full quote details here:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{quoteUrl}}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Your Quote</a>
  </div>
  
  <p>If you have any questions, please don't hesitate to reach out.</p>
  
  <p>Best regards,<br>{{shopName}} Team</p>
</div>`,
  textContent: `Dear {{customerName}},

Thank you for your interest in our products. We've prepared a custom quote for you.

Quote Number: {{quoteNumber}}
Total Amount: {{quoteTotal}}
Valid Until: {{validUntil}}

View your quote: {{quoteUrl}}

If you have any questions, please don't hesitate to reach out.

Best regards,
{{shopName}} Team`,
  theme: defaultDarkTheme,
  footerText: 'This quote is valid until {{expiresAt}}. Prices are subject to change.',
  isDefault: true,
  category: TemplateCategory.QUOTE,
};

const defaultFollowUpTemplate: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
  name: 'Follow-up Email',
  description: 'Gentle reminder for pending quotes',
  subject: 'Following up on Quote {{quoteNumber}}',
  htmlContent: `<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6;">
  <p>Dear {{customerName}},</p>
  
  <p>I hope this email finds you well. I wanted to follow up on the quote we sent for {{quoteNumber}}.</p>
  
  <p>The quote total of {{quoteTotal}} is still valid until {{expiresAt}}.</p>
  
  <p>Please let me know if you have any questions or if you'd like to discuss any modifications to the quote.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{quoteUrl}}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Quote</a>
  </div>
  
  <p>Looking forward to hearing from you.</p>
  
  <p>Best regards,<br>{{shopName}} Team</p>
</div>`,
  textContent: `Dear {{customerName}},

I hope this email finds you well. I wanted to follow up on the quote we sent for {{quoteNumber}}.

The quote total of {{quoteTotal}} is still valid until {{expiresAt}}.

Please let me know if you have any questions or if you'd like to discuss any modifications.

View quote: {{quoteUrl}}

Best regards,
{{shopName}} Team`,
  theme: defaultDarkTheme,
  footerText: 'We value your business and look forward to working with you.',
  isDefault: false,
  category: TemplateCategory.FOLLOW_UP,
};

const defaultReminderTemplate: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
  name: 'Expiration Reminder',
  description: 'Urgent reminder for quotes about to expire',
  subject: 'Action Required: Quote {{quoteNumber}} Expires Soon',
  htmlContent: `<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6;">
  <p>Dear {{customerName}},</p>
  
  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
    <p style="margin: 0; font-weight: 600;">⚠️ This is a friendly reminder that your quote will expire soon.</p>
  </div>
  
  <p><strong>Quote Number:</strong> {{quoteNumber}}<br>
  <strong>Quote Total:</strong> {{quoteTotal}}<br>
  <strong>Expires:</strong> {{expiresAt}}</p>
  
  <p>To secure these prices, please review and accept your quote before the expiration date.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{quoteUrl}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Review Quote Now</a>
  </div>
  
  <p>If you need an extension or have questions, please contact us immediately.</p>
  
  <p>Best regards,<br>{{shopName}} Team</p>
</div>`,
  textContent: `Dear {{customerName}},

⚠️ This is a friendly reminder that your quote will expire soon.

Quote Number: {{quoteNumber}}
Quote Total: {{quoteTotal}}
Expires: {{expiresAt}}

To secure these prices, please review and accept your quote before the expiration date.

Review now: {{quoteUrl}}

If you need an extension or have questions, please contact us immediately.

Best regards,
{{shopName}} Team`,
  theme: defaultDarkTheme,
  footerText: 'Quote expires on {{expiresAt}}. Prices may change after expiration.',
  isDefault: false,
  category: TemplateCategory.REMINDER,
};

const defaultAcceptedTemplate: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
  name: 'Quote Accepted Confirmation',
  description: 'Confirmation email sent when quote is accepted',
  subject: 'Quote {{quoteNumber}} Accepted - Next Steps',
  htmlContent: `<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6;">
  <p>Dear {{customerName}},</p>
  
  <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
    <p style="margin: 0; font-weight: 600; color: #065f46;">✅ Thank you for accepting quote {{quoteNumber}}!</p>
  </div>
  
  <p>We're excited to work with {{companyName}} on this project.</p>
  
  <p>Our team will be in touch within 24 hours to discuss the next steps and begin processing your order.</p>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin: 0 0 10px 0;">Quote Details</h3>
    <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
    <p><strong>Total Amount:</strong> {{quoteTotal}}</p>
  </div>
  
  <p>If you have any immediate questions, please reply to this email or call us.</p>
  
  <p>Thank you for choosing {{shopName}}!</p>
  
  <p>Best regards,<br>{{shopName}} Team</p>
</div>`,
  textContent: `Dear {{customerName}},

✅ Thank you for accepting quote {{quoteNumber}}!

We're excited to work with {{companyName}} on this project.

Our team will be in touch within 24 hours to discuss next steps.

Quote Number: {{quoteNumber}}
Total Amount: {{quoteTotal}}

If you have any immediate questions, please reply to this email.

Thank you for choosing {{shopName}}!

Best regards,
{{shopName}} Team`,
  theme: defaultDarkTheme,
  footerText: 'Thank you for your business! We appreciate your trust in {{shopName}}.',
  isDefault: false,
  category: TemplateCategory.ACCEPTED,
};

// ============================================================================
// Built-in Presets
// ============================================================================

export const builtInPresets: TemplatePreset[] = [
  {
    id: 'preset-quote-standard',
    name: 'Standard Quote',
    description: 'Clean and professional quote email',
    category: TemplateCategory.QUOTE,
    subject: defaultQuoteTemplate.subject,
    htmlContent: defaultQuoteTemplate.htmlContent,
    footerText: defaultQuoteTemplate.footerText,
    theme: {},
  },
  {
    id: 'preset-follow-up',
    name: 'Gentle Follow-up',
    description: 'Polite follow-up for pending quotes',
    category: TemplateCategory.FOLLOW_UP,
    subject: defaultFollowUpTemplate.subject,
    htmlContent: defaultFollowUpTemplate.htmlContent,
    footerText: defaultFollowUpTemplate.footerText,
    theme: {},
  },
  {
    id: 'preset-urgent-reminder',
    name: 'Urgent Reminder',
    description: 'Attention-grabbing expiration reminder',
    category: TemplateCategory.REMINDER,
    subject: defaultReminderTemplate.subject,
    htmlContent: defaultReminderTemplate.htmlContent,
    footerText: defaultReminderTemplate.footerText,
    theme: { primaryColor: '#dc2626' },
  },
  {
    id: 'preset-accepted',
    name: 'Acceptance Confirmation',
    description: 'Confirmation and next steps',
    category: TemplateCategory.ACCEPTED,
    subject: defaultAcceptedTemplate.subject,
    htmlContent: defaultAcceptedTemplate.htmlContent,
    footerText: defaultAcceptedTemplate.footerText,
    theme: { primaryColor: '#10b981' },
  },
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `tpl_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current timestamp in ISO format
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Extract all template variables from content
 */
function extractVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }
  return [...new Set(matches)];
}

/**
 * Validate if a string is a valid hex color
 */
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Apply variable values to template content
 */
function applyVariableValues(content: string, data: TemplatePreviewData): string {
  let result = content;
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useEmailTemplates(): TemplateState & TemplateOperations {
  // State
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTemplate, setActiveTemplateState] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<TemplateError | null>(null);

  // Load templates from LocalStorage on mount
  useEffect(() => {
    const loadTemplates = () => {
      try {
        setIsLoading(true);
        const stored = localStorage.getItem(STORAGE_KEY);
        
        if (stored) {
          const parsed = JSON.parse(stored) as EmailTemplate[];
          setTemplates(parsed);
        } else {
          // Initialize with default templates
          const defaults: EmailTemplate[] = [
            createTemplateFromDefaults(defaultQuoteTemplate),
            createTemplateFromDefaults(defaultFollowUpTemplate),
            createTemplateFromDefaults(defaultReminderTemplate),
            createTemplateFromDefaults(defaultAcceptedTemplate),
          ];
          setTemplates(defaults);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        }
        setError(null);
      } catch (err) {
        setError({
          code: 'LOAD_ERROR',
          message: err instanceof Error ? err.message : 'Failed to load templates',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Save templates to LocalStorage whenever they change
  useEffect(() => {
    if (!isLoading && templates.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
      } catch (err) {
        setError({
          code: 'SAVE_ERROR',
          message: err instanceof Error ? err.message : 'Failed to save templates',
        });
      }
    }
  }, [templates, isLoading]);

  // Helper to create template from defaults
  const createTemplateFromDefaults = (
    defaults: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): EmailTemplate => ({
    ...defaults,
    id: generateId(),
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
    version: 1,
  });

  // Create a new template
  const createTemplate = useCallback(async (
    templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): Promise<EmailTemplate> => {
    const validation = validateTemplate(templateData);
    if (!validation.isValid) {
      throw new Error(validation.errors.map(e => e.message).join(', '));
    }

    const newTemplate: EmailTemplate = {
      ...templateData,
      id: generateId(),
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
      version: 1,
    };

    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, []);

  // Update an existing template
  const updateTemplate = useCallback(async (
    id: string,
    updates: Partial<EmailTemplate>
  ): Promise<EmailTemplate> => {
    const existingTemplate = templates.find(t => t.id === id);
    if (!existingTemplate) {
      throw new Error(`Template with id ${id} not found`);
    }

    const updatedData = { ...existingTemplate, ...updates };
    const validation = validateTemplate(updatedData);
    if (!validation.isValid) {
      throw new Error(validation.errors.map(e => e.message).join(', '));
    }

    const updatedTemplate: EmailTemplate = {
      ...existingTemplate,
      ...updates,
      updatedAt: getTimestamp(),
      version: existingTemplate.version + 1,
    };

    setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
    
    if (activeTemplate?.id === id) {
      setActiveTemplateState(updatedTemplate);
    }

    return updatedTemplate;
  }, [templates, activeTemplate]);

  // Delete a template
  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    const template = templates.find(t => t.id === id);
    if (!template) {
      throw new Error(`Template with id ${id} not found`);
    }

    if (template.isDefault && templates.filter(t => t.isDefault).length === 1) {
      throw new Error('Cannot delete the only default template');
    }

    setTemplates(prev => prev.filter(t => t.id !== id));
    
    if (activeTemplate?.id === id) {
      setActiveTemplateState(null);
    }
  }, [templates, activeTemplate]);

  // Duplicate a template
  const duplicateTemplate = useCallback(async (id: string): Promise<EmailTemplate> => {
    const template = templates.find(t => t.id === id);
    if (!template) {
      throw new Error(`Template with id ${id} not found`);
    }

    const duplicated: EmailTemplate = {
      ...template,
      id: generateId(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
      version: 1,
    };

    setTemplates(prev => [...prev, duplicated]);
    return duplicated;
  }, [templates]);

  // Set active template
  const setActiveTemplate = useCallback((id: string | null): void => {
    if (id === null) {
      setActiveTemplateState(null);
      return;
    }
    const template = templates.find(t => t.id === id);
    if (template) {
      setActiveTemplateState(template);
    }
  }, [templates]);

  // Set default template
  const setDefaultTemplate = useCallback(async (id: string): Promise<void> => {
    const template = templates.find(t => t.id === id);
    if (!template) {
      throw new Error(`Template with id ${id} not found`);
    }

    setTemplates(prev => prev.map(t => ({
      ...t,
      isDefault: t.id === id,
    })));
  }, [templates]);

  // Validate template
  const validateTemplate = useCallback((template: Partial<EmailTemplate>): TemplateValidationResult => {
    const errors: TemplateValidationError[] = [];
    const warnings: TemplateValidationWarning[] = [];

    // Required fields
    if (!template.name?.trim()) {
      errors.push({
        field: 'name',
        message: 'Template name is required',
        code: TemplateValidationErrorCode.REQUIRED_FIELD,
      });
    }

    if (!template.subject?.trim()) {
      errors.push({
        field: 'subject',
        message: 'Subject line is required',
        code: TemplateValidationErrorCode.REQUIRED_FIELD,
      });
    }

    if (!template.htmlContent?.trim()) {
      errors.push({
        field: 'htmlContent',
        message: 'HTML content is required',
        code: TemplateValidationErrorCode.REQUIRED_FIELD,
      });
    }

    // Subject length
    if (template.subject && template.subject.length > MAX_SUBJECT_LENGTH) {
      errors.push({
        field: 'subject',
        message: `Subject must be ${MAX_SUBJECT_LENGTH} characters or less`,
        code: TemplateValidationErrorCode.SUBJECT_TOO_LONG,
      });
    }

    // Content length
    if (template.htmlContent && template.htmlContent.length > MAX_CONTENT_LENGTH) {
      errors.push({
        field: 'htmlContent',
        message: `Content must be ${MAX_CONTENT_LENGTH} characters or less`,
        code: TemplateValidationErrorCode.CONTENT_TOO_LONG,
      });
    }

    // HTML validation (basic)
    if (template.htmlContent) {
      const openTags = (template.htmlContent.match(/\u003c[^/][^\u003e]*\u003e/g) || []).length;
      const closeTags = (template.htmlContent.match(/\u003c\/[^\u003e]+\u003e/g) || []).length;
      
      if (openTags !== closeTags) {
        warnings.push({
          field: 'htmlContent',
          message: 'HTML may have unclosed tags',
          suggestion: 'Check that all opening tags have closing tags',
        });
      }
    }

    // Variable validation
    if (template.htmlContent) {
      const variables = extractVariables(template.htmlContent);
      const validVariables = Object.values(TemplateVariable);
      const invalidVars = variables.filter(v => !validVariables.includes(v as TemplateVariable));
      
      if (invalidVars.length > 0) {
        warnings.push({
          field: 'htmlContent',
          message: `Unknown variables: ${invalidVars.join(', ')}`,
          suggestion: 'Use the variable picker to insert valid variables',
        });
      }
    }

    // Color validation
    if (template.theme) {
      const colorFields: (keyof TemplateTheme)[] = [
        'primaryColor', 'secondaryColor', 'backgroundColor', 'contentBackground',
        'textColor', 'mutedTextColor', 'borderColor', 'headerBackground',
        'footerBackground', 'linkColor', 'buttonTextColor',
      ];

      colorFields.forEach(field => {
        const color = template.theme?.[field];
        if (color && !isValidHexColor(color)) {
          errors.push({
            field: `theme.${field}`,
            message: `Invalid color format: ${color}`,
            code: TemplateValidationErrorCode.INVALID_COLOR,
          });
        }
      });
    }

    // URL validation for logo
    if (template.logoUrl) {
      try {
        new URL(template.logoUrl);
      } catch {
        warnings.push({
          field: 'logoUrl',
          message: 'Logo URL may be invalid',
          suggestion: 'Ensure the URL is complete and accessible',
        });
      }
    }

    // Warning for missing recommended variables
    if (template.htmlContent) {
      const content = template.htmlContent.toLowerCase();
      const hasQuoteNumber = content.includes('{{quotenumber}}');
      const hasQuoteUrl = content.includes('{{quoteurl}}');
      
      if (!hasQuoteNumber) {
        warnings.push({
          field: 'htmlContent',
          message: 'Quote number not included in template',
          suggestion: 'Consider adding {{quoteNumber}} for reference',
        });
      }
      
      if (!hasQuoteUrl) {
        warnings.push({
          field: 'htmlContent',
          message: 'Quote URL not included in template',
          suggestion: 'Consider adding {{quoteUrl}} so customers can view their quote',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  // Generate preview HTML
  const generatePreview = useCallback((
    template: EmailTemplate,
    data?: Partial<TemplatePreviewData>
  ): string => {
    const previewData = { ...defaultPreviewData, ...data };
    const content = applyVariableValues(template.htmlContent, previewData);
    const footerText = applyVariableValues(template.footerText, previewData);
    const subject = applyVariableValues(template.subject, previewData);

    const theme = template.theme;
    const logoHtml = template.logoUrl
      ? `<img src="${template.logoUrl}" alt="Logo" style="max-height: 60px; max-width: 200px;" />`
      : template.headerText
      ? `<h1 style="margin: 0; font-size: 24px; color: ${theme.textColor};">${template.headerText}</h1>`
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${theme.backgroundColor}; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: ${theme.contentBackground}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${theme.headerBackground}; padding: 24px; text-align: center; border-bottom: 1px solid ${theme.borderColor};">
              ${logoHtml}
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px; color: ${theme.textColor};">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${theme.footerBackground}; padding: 24px; text-align: center; border-top: 1px solid ${theme.borderColor}; color: ${theme.mutedTextColor}; font-size: 14px;">
              <p style="margin: 0;">${footerText}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }, []);

  // Apply variables to content
  const applyVariableValuesCallback = useCallback((content: string, data: TemplatePreviewData): string => {
    return applyVariableValues(content, data);
  }, []);

  return {
    templates,
    activeTemplate,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setActiveTemplate,
    setDefaultTemplate,
    validateTemplate,
    generatePreview,
    applyVariableValues: applyVariableValuesCallback,
  };
}

export default useEmailTemplates;
