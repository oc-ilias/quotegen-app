/**
 * Email Template Types
 * Comprehensive TypeScript definitions for email templates
 * @module types/template
 */

// ============================================================================
// Template Variable Enum
// ============================================================================

/**
 * Available template variables for dynamic content insertion
 */
export enum TemplateVariable {
  SHOP_NAME = 'shopName',
  CUSTOMER_NAME = 'customerName',
  QUOTE_NUMBER = 'quoteNumber',
  QUOTE_TOTAL = 'quoteTotal',
  QUOTE_URL = 'quoteUrl',
  EXPIRES_AT = 'expiresAt',
  COMPANY_NAME = 'companyName',
  CUSTOMER_EMAIL = 'customerEmail',
  QUOTE_DATE = 'quoteDate',
  VALID_UNTIL = 'validUntil',
}

/**
 * Human-readable labels for template variables
 */
export const TemplateVariableLabels: Record<TemplateVariable, string> = {
  [TemplateVariable.SHOP_NAME]: 'Shop Name',
  [TemplateVariable.CUSTOMER_NAME]: 'Customer Name',
  [TemplateVariable.QUOTE_NUMBER]: 'Quote Number',
  [TemplateVariable.QUOTE_TOTAL]: 'Quote Total',
  [TemplateVariable.QUOTE_URL]: 'Quote URL',
  [TemplateVariable.EXPIRES_AT]: 'Expiration Date',
  [TemplateVariable.COMPANY_NAME]: 'Company Name',
  [TemplateVariable.CUSTOMER_EMAIL]: 'Customer Email',
  [TemplateVariable.QUOTE_DATE]: 'Quote Date',
  [TemplateVariable.VALID_UNTIL]: 'Valid Until',
};

/**
 * Descriptions for template variables
 */
export const TemplateVariableDescriptions: Record<TemplateVariable, string> = {
  [TemplateVariable.SHOP_NAME]: 'The name of your shop/store',
  [TemplateVariable.CUSTOMER_NAME]: 'The full name of the customer',
  [TemplateVariable.QUOTE_NUMBER]: 'The unique quote reference number',
  [TemplateVariable.QUOTE_TOTAL]: 'The total amount of the quote',
  [TemplateVariable.QUOTE_URL]: 'Direct link to view the quote',
  [TemplateVariable.EXPIRES_AT]: 'When the quote expires',
  [TemplateVariable.COMPANY_NAME]: "The customer's company name",
  [TemplateVariable.CUSTOMER_EMAIL]: "The customer's email address",
  [TemplateVariable.QUOTE_DATE]: 'The date the quote was created',
  [TemplateVariable.VALID_UNTIL]: 'The date until the quote is valid',
};

/**
 * Example values for template variables (for preview)
 */
export const TemplateVariableExamples: Record<TemplateVariable, string> = {
  [TemplateVariable.SHOP_NAME]: 'Acme Store',
  [TemplateVariable.CUSTOMER_NAME]: 'John Smith',
  [TemplateVariable.QUOTE_NUMBER]: 'QT-ABC123',
  [TemplateVariable.QUOTE_TOTAL]: '$1,250.00',
  [TemplateVariable.QUOTE_URL]: 'https://quotes.example.com/view/abc123',
  [TemplateVariable.EXPIRES_AT]: 'February 28, 2026',
  [TemplateVariable.COMPANY_NAME]: 'Acme Corporation',
  [TemplateVariable.CUSTOMER_EMAIL]: 'john@example.com',
  [TemplateVariable.QUOTE_DATE]: 'February 5, 2026',
  [TemplateVariable.VALID_UNTIL]: 'March 5, 2026',
};

// ============================================================================
// Template Theme Interface
// ============================================================================

/**
 * Color theme configuration for email templates
 */
export interface TemplateTheme {
  /** Primary brand color (buttons, links) */
  primaryColor: string;
  /** Secondary accent color */
  secondaryColor: string;
  /** Background color for the email */
  backgroundColor: string;
  /** Main content background */
  contentBackground: string;
  /** Primary text color */
  textColor: string;
  /** Secondary/muted text color */
  mutedTextColor: string;
  /** Border color */
  borderColor: string;
  /** Header background color */
  headerBackground: string;
  /** Footer background color */
  footerBackground: string;
  /** Link color */
  linkColor: string;
  /** Button text color */
  buttonTextColor: string;
}

/**
 * Default dark theme configuration
 */
export const defaultDarkTheme: TemplateTheme = {
  primaryColor: '#6366f1', // indigo-500
  secondaryColor: '#8b5cf6', // violet-500
  backgroundColor: '#0f172a', // slate-900
  contentBackground: '#1e293b', // slate-800
  textColor: '#f8fafc', // slate-50
  mutedTextColor: '#94a3b8', // slate-400
  borderColor: '#334155', // slate-700
  headerBackground: '#1e293b', // slate-800
  footerBackground: '#0f172a', // slate-900
  linkColor: '#6366f1', // indigo-500
  buttonTextColor: '#ffffff',
};

/**
 * Default light theme configuration
 */
export const defaultLightTheme: TemplateTheme = {
  primaryColor: '#4f46e5', // indigo-600
  secondaryColor: '#7c3aed', // violet-600
  backgroundColor: '#f8fafc', // slate-50
  contentBackground: '#ffffff',
  textColor: '#0f172a', // slate-900
  mutedTextColor: '#64748b', // slate-500
  borderColor: '#e2e8f0', // slate-200
  headerBackground: '#ffffff',
  footerBackground: '#f1f5f9', // slate-100
  linkColor: '#4f46e5', // indigo-600
  buttonTextColor: '#ffffff',
};

// ============================================================================
// Email Template Interface
// ============================================================================

/**
 * Email template structure
 */
export interface EmailTemplate {
  /** Unique identifier */
  id: string;
  /** Template name */
  name: string;
  /** Optional description */
  description?: string;
  /** Email subject line */
  subject: string;
  /** HTML content (can include template variables) */
  htmlContent: string;
  /** Plain text content fallback */
  textContent?: string;
  /** Theme configuration */
  theme: TemplateTheme;
  /** Header logo URL (optional) */
  logoUrl?: string;
  /** Header text (optional, shown if no logo) */
  headerText?: string;
  /** Footer content */
  footerText: string;
  /** Whether this is the default template */
  isDefault: boolean;
  /** Template category/type */
  category: TemplateCategory;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Version number for tracking changes */
  version: number;
}

/**
 * Template categories
 */
export enum TemplateCategory {
  QUOTE = 'quote',
  FOLLOW_UP = 'follow_up',
  REMINDER = 'reminder',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  GENERAL = 'general',
}

/**
 * Human-readable labels for template categories
 */
export const TemplateCategoryLabels: Record<TemplateCategory, string> = {
  [TemplateCategory.QUOTE]: 'Quote Email',
  [TemplateCategory.FOLLOW_UP]: 'Follow-up',
  [TemplateCategory.REMINDER]: 'Reminder',
  [TemplateCategory.ACCEPTED]: 'Quote Accepted',
  [TemplateCategory.DECLINED]: 'Quote Declined',
  [TemplateCategory.GENERAL]: 'General',
};

// ============================================================================
// Template Presets
// ============================================================================

/**
 * Built-in template presets
 */
export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  subject: string;
  htmlContent: string;
  footerText: string;
  theme: Partial<TemplateTheme>;
}

// ============================================================================
// Template Validation
// ============================================================================

/**
 * Validation result for template operations
 */
export interface TemplateValidationResult {
  isValid: boolean;
  errors: TemplateValidationError[];
  warnings: TemplateValidationWarning[];
}

/**
 * Template validation error
 */
export interface TemplateValidationError {
  field: string;
  message: string;
  code: TemplateValidationErrorCode;
}

/**
 * Template validation warning
 */
export interface TemplateValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * Template validation error codes
 */
export enum TemplateValidationErrorCode {
  REQUIRED_FIELD = 'required_field',
  INVALID_HTML = 'invalid_html',
  INVALID_VARIABLE = 'invalid_variable',
  INVALID_COLOR = 'invalid_color',
  SUBJECT_TOO_LONG = 'subject_too_long',
  CONTENT_TOO_LONG = 'content_too_long',
  INVALID_URL = 'invalid_url',
}

// ============================================================================
// Template Preview Data
// ============================================================================

/**
 * Data for template preview generation
 */
export interface TemplatePreviewData {
  [TemplateVariable.SHOP_NAME]: string;
  [TemplateVariable.CUSTOMER_NAME]: string;
  [TemplateVariable.QUOTE_NUMBER]: string;
  [TemplateVariable.QUOTE_TOTAL]: string;
  [TemplateVariable.QUOTE_URL]: string;
  [TemplateVariable.EXPIRES_AT]: string;
  [TemplateVariable.COMPANY_NAME]: string;
  [TemplateVariable.CUSTOMER_EMAIL]: string;
  [TemplateVariable.QUOTE_DATE]: string;
  [TemplateVariable.VALID_UNTIL]: string;
}

/**
 * Default preview data
 */
export const defaultPreviewData: TemplatePreviewData = {
  ...TemplateVariableExamples,
};

// ============================================================================
// Template Hook Types
// ============================================================================

/**
 * Template state for useEmailTemplates hook
 */
export interface TemplateState {
  templates: EmailTemplate[];
  activeTemplate: EmailTemplate | null;
  isLoading: boolean;
  error: TemplateError | null;
}

/**
 * Template error structure
 */
export interface TemplateError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * Template CRUD operations
 */
export interface TemplateOperations {
  createTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<EmailTemplate>;
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => Promise<EmailTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<EmailTemplate>;
  setActiveTemplate: (id: string | null) => void;
  setDefaultTemplate: (id: string) => Promise<void>;
  validateTemplate: (template: Partial<EmailTemplate>) => TemplateValidationResult;
  generatePreview: (template: EmailTemplate, data?: Partial<TemplatePreviewData>) => string;
  applyVariableValues: (content: string, data: TemplatePreviewData) => string;
}

// ============================================================================
// Template Builder Component Types
// ============================================================================

/**
 * Props for EmailTemplateBuilder component
 */
export interface EmailTemplateBuilderProps {
  /** Initial template to edit (optional) */
  initialTemplate?: EmailTemplate;
  /** Callback when template is saved */
  onSave?: (template: EmailTemplate) => void;
  /** Callback when template is cancelled */
  onCancel?: () => void;
  /** Callback when template is deleted */
  onDelete?: (id: string) => void;
  /** Whether to show the preset selector */
  showPresets?: boolean;
  /** Default category for new templates */
  defaultCategory?: TemplateCategory;
  /** Available presets to show */
  availablePresets?: TemplatePreset[];
}

/**
 * Editor tab types
 */
export type EditorTab = 'content' | 'design' | 'preview';

/**
 * Template editor state
 */
export interface TemplateEditorState {
  activeTab: EditorTab;
  isDirty: boolean;
  isSaving: boolean;
  showVariableMenu: boolean;
  selectedTextRange: { start: number; end: number } | null;
  previewData: TemplatePreviewData;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Color picker color format
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

/**
 * Template export format
 */
export type TemplateExportFormat = 'json' | 'html';

/**
 * Template sort options
 */
export type TemplateSortBy = 'name' | 'createdAt' | 'updatedAt' | 'category';

/**
 * Template filter options
 */
export interface TemplateFilterOptions {
  category?: TemplateCategory;
  searchQuery?: string;
  sortBy?: TemplateSortBy;
  sortOrder?: 'asc' | 'desc';
}
