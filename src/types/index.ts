/**
 * QuoteGen - Centralized Type Definitions
 * 
 * Comprehensive TypeScript type definitions organized by category.
 * All types are strictly typed with no `any` usage.
 * 
 * @module types/index
 * @version 1.0.0
 */

import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// ============================================================================
// 1. DATABASE TYPES (Supabase Schema)
// ============================================================================

/**
 * Quote status enum - represents the lifecycle of a quote
 */
export enum QuoteStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
}

/**
 * Customer status enum - represents customer lifecycle states
 */
export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

/**
 * Activity type enum - tracks all system activities
 */
export enum ActivityType {
  QUOTE_CREATED = 'quote_created',
  QUOTE_SENT = 'quote_sent',
  QUOTE_VIEWED = 'quote_viewed',
  QUOTE_ACCEPTED = 'quote_accepted',
  QUOTE_REJECTED = 'quote_rejected',
  QUOTE_EXPIRED = 'quote_expired',
  QUOTE_CONVERTED = 'quote_converted',
  CUSTOMER_ADDED = 'customer_added',
  CUSTOMER_UPDATED = 'customer_updated',
  CUSTOMER_DELETED = 'customer_deleted',
  PRODUCT_ADDED = 'product_added',
  NOTE_ADDED = 'note_added',
  STATUS_CHANGED = 'status_changed',
}

/**
 * Quote priority levels
 */
export enum QuotePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Address structure for customers
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/**
 * Customer address with zipCode variant
 */
export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Customer database record
 */
export interface Customer {
  id: string;
  email: string;
  companyName: string;
  contactName: string;
  phone?: string;
  billingAddress?: CustomerAddress;
  shippingAddress?: CustomerAddress;
  taxId?: string;
  customerSince: Date;
  tags: string[];
  notes?: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  status: CustomerStatus;
}

/**
 * Product variant information
 */
export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  inventoryQuantity: number;
  options: Record<string, string>;
}

/**
 * Product database record
 */
export interface Product {
  id: string;
  title: string;
  description?: string;
  handle: string;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  productType: string;
  vendor: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Quote line item
 */
export interface LineItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  variantTitle?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  originalPrice?: number;
  discountAmount: number;
  discountPercentage?: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  imageUrl?: string;
  notes?: string;
  customFields?: Record<string, string>;
}

/**
 * Quote line item input for forms
 */
export interface LineItemInput {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  product_id?: string;
  sku?: string;
  discount_percent?: number;
  tax_rate?: number;
}

/**
 * Quote terms and conditions
 */
export interface QuoteTerms {
  paymentTerms: string;
  deliveryTerms: string;
  validityPeriod: number;
  depositRequired: boolean;
  depositPercentage?: number;
  currency: string;
  notes?: string;
  internalNotes?: string;
}

/**
 * Quote metadata for tracking
 */
export interface QuoteMetadata {
  createdBy: string;
  createdByName: string;
  updatedBy?: string;
  updatedByName?: string;
  ipAddress?: string;
  userAgent?: string;
  source: 'web' | 'api' | 'import';
}

/**
 * Main Quote database record
 */
export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customer: Customer;
  title: string;
  status: QuoteStatus;
  priority: QuotePriority;
  lineItems: LineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  total: number;
  terms: QuoteTerms;
  metadata: QuoteMetadata;
  expiresAt?: Date;
  sentAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  convertedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Supabase Quote schema (raw database shape)
 */
export interface SupabaseQuote {
  id: string;
  shop_id: string;
  product_id: string;
  product_title: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  quantity?: number;
  message?: string;
  status: 'pending' | 'quoted' | 'accepted' | 'declined';
  admin_notes?: string;
  quote_amount?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Shop settings database record
 */
export interface ShopSettings {
  shop_id: string;
  button_text: string;
  button_color: string;
  form_title: string;
  success_message: string;
  email_notifications: boolean;
  require_quantity: boolean;
  require_phone: boolean;
}

/**
 * Activity log entry
 */
export interface Activity {
  id: string;
  type: ActivityType;
  quoteId?: string;
  quoteNumber?: string;
  customerId?: string;
  customerName?: string;
  userId?: string;
  userName?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Activity item (alternate format)
 */
export interface ActivityItem {
  id: string;
  type: ActivityType;
  quote_id: string;
  quote_number: string;
  customer_name: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Webhook configuration
 */
export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
  failureCount: number;
}

/**
 * Webhook event types
 */
export enum WebhookEvent {
  QUOTE_CREATED = 'quote.created',
  QUOTE_UPDATED = 'quote.updated',
  QUOTE_SENT = 'quote.sent',
  QUOTE_ACCEPTED = 'quote.accepted',
  QUOTE_REJECTED = 'quote.rejected',
  QUOTE_EXPIRED = 'quote.expired',
  CUSTOMER_CREATED = 'customer.created',
  CUSTOMER_UPDATED = 'customer.updated',
}

/**
 * Quote template
 */
export interface QuoteTemplate {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  headerHtml?: string;
  footerHtml?: string;
  cssStyles?: string;
  termsDefault?: Partial<QuoteTerms>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 2. API TYPES
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

/**
 * API metadata for pagination
 */
export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Filter parameters for API requests
 */
export interface FilterParams {
  searchQuery?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string[];
  minValue?: number;
  maxValue?: number;
  tags?: string[];
  customerId?: string;
}

/**
 * Quote-specific filters
 */
export interface QuoteFilters extends FilterParams {
  status?: QuoteStatus[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Customer-specific filters
 */
export interface CustomerFilter extends FilterParams {
  status?: CustomerStatus[];
  minQuotes?: number;
  maxQuotes?: number;
  minRevenue?: number;
  maxRevenue?: number;
  sortBy?: 'name' | 'company' | 'dateAdded' | 'totalQuotes' | 'totalRevenue' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// 3. COMPONENT PROPS TYPES
// ============================================================================

/**
 * Base props common to all components
 */
export interface BaseProps {
  id?: string;
  'data-testid'?: string;
}

/**
 * Props for components that accept children
 */
export interface WithChildren {
  children: ReactNode;
}

/**
 * Props for components with optional children
 */
export interface WithOptionalChildren {
  children?: ReactNode;
}

/**
 * Props for components with className
 */
export interface WithClassName {
  className?: string;
}

/**
 * Props for components with loading state
 */
export interface WithLoading {
  isLoading?: boolean;
}

/**
 * Props for components with disabled state
 */
export interface WithDisabled {
  disabled?: boolean;
}

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'custom';

/**
 * Button size types
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button component props
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, WithLoading {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/**
 * Input component props
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, WithClassName {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
}

/**
 * Modal size types
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Modal/Dialog component props
 */
export interface ModalProps extends WithOptionalChildren, WithClassName {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  preventBackdropClose?: boolean;
}

/**
 * Dialog action button configuration
 */
export interface DialogAction {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Confirmation dialog props
 */
export interface ConfirmDialogProps extends Omit<ModalProps, 'children'> {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: ButtonVariant;
  isConfirming?: boolean;
}

/**
 * Card component props
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement>, WithClassName {
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  noPadding?: boolean;
}

/**
 * Badge variant types
 */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

/**
 * Badge component props
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

/**
 * Table column configuration
 */
export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

/**
 * Table component props
 */
export interface TableProps<T> extends WithClassName {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedRows?: Set<string>;
  onSelectRow?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

/**
 * Pagination component props
 */
export interface PaginationProps extends WithClassName {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast component props
 */
export interface ToastProps extends Toast {
  onDismiss: (id: string) => void;
}

/**
 * Stat card props
 */
export interface StatCardProps extends BaseProps {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  isLoading?: boolean;
  format?: 'number' | 'currency' | 'percent';
  delay?: number;
}

/**
 * Sidebar navigation item
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

// ============================================================================
// 4. FORM TYPES
// ============================================================================

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: FormValidationRule[];
  defaultValue?: unknown;
}

/**
 * Form validation rule
 */
export interface FormValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: number | string | RegExp;
  message: string;
  validator?: (value: unknown) => boolean;
}

/**
 * Field error structure
 */
export interface FieldError {
  field: string;
  message: string;
  type: string;
}

/**
 * Form state structure
 */
export interface FormState<T> {
  values: T;
  errors: Record<string, FieldError>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

/**
 * Form submission handler
 */
export type FormSubmitHandler<T> = (values: T) => Promise<void> | void;

/**
 * Form change handler
 */
export type FormChangeHandler<T> = (field: keyof T, value: unknown) => void;

/**
 * Form validation errors mapping
 */
export interface ValidationErrors {
  [key: string]: string[];
}

/**
 * Quote form data structure
 */
export interface QuoteFormData {
  customer: {
    name: string;
    email: string;
    phone: string;
    company: string;
    address: Address;
  };
  line_items: LineItemInput[];
  title: string;
  description: string;
  notes: string;
  terms: string;
  valid_until: string;
  discount_total: number;
  tax_rate: number;
}

// ============================================================================
// 5. FEATURE-SPECIFIC TYPES
// ============================================================================

/**
 * Quote with related customer data
 */
export interface QuoteWithCustomer extends Quote {
  customer: Customer;
  customerStats?: CustomerStats;
}

/**
 * Quote with full line items
 */
export interface QuoteWithItems extends Quote {
  lineItems: LineItem[];
  itemsCount: number;
}

/**
 * Quote with complete relations
 */
export interface QuoteWithRelations extends QuoteWithCustomer, QuoteWithItems {
  statusHistory: StatusChangeRecord[];
  activities: Activity[];
}

/**
 * Customer statistics
 */
export interface CustomerStats {
  totalQuotes: number;
  totalRevenue: number;
  avgQuoteValue: number;
  acceptedQuotes: number;
  declinedQuotes: number;
  pendingQuotes: number;
  conversionRate: number;
  lastQuoteDate?: Date;
  firstQuoteDate?: Date;
}

/**
 * Customer with statistics and recent activity
 */
export interface CustomerWithStats extends Customer {
  stats: CustomerStats;
  recentActivity: CustomerActivity[];
  quotesCount: number;
}

/**
 * Customer activity entry
 */
export interface CustomerActivity {
  id: string;
  customerId: string;
  type: 'quote_created' | 'quote_sent' | 'quote_viewed' | 'quote_accepted' | 'quote_rejected' | 'quote_expired' | 'note_added' | 'customer_updated';
  description: string;
  metadata?: Record<string, unknown>;
  quoteId?: string;
  quoteNumber?: string;
  amount?: number;
  createdAt: Date;
  createdBy?: string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalQuotes: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  conversionRate: number;
  totalRevenue: number;
  avgQuoteValue: number;
  avgResponseTime: number;
  periodChange: {
    totalQuotes: number;
    conversionRate: number;
    totalRevenue: number;
    avgQuoteValue: number;
  };
}

/**
 * Quote statistics (for dashboard/overview)
 * Same structure as DashboardStats for compatibility
 */
export interface QuoteStats {
  totalQuotes: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  conversionRate: number;
  totalRevenue: number;
  avgQuoteValue: number;
  avgResponseTime: number;
  periodChange: {
    totalQuotes: number;
    conversionRate: number;
    totalRevenue: number;
    avgQuoteValue: number;
  };
}

/**
 * Analytics data point for conversions
 */
export interface ConversionDataPoint {
  date: string;
  sent: number;
  viewed: number;
  accepted: number;
  rejected: number;
  conversionRate: number;
}

/**
 * Analytics data point for revenue
 */
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  quotes: number;
  avgValue: number;
}

/**
 * Status breakdown data
 */
export interface StatusBreakdownData {
  status: QuoteStatus;
  count: number;
  percentage: number;
  value: number;
}

/**
 * Top product data for analytics
 */
export interface TopProductData {
  productId: string;
  title: string;
  quantity: number;
  revenue: number;
  imageUrl?: string;
}

/**
 * Analytics data structure
 */
export interface AnalyticsData {
  conversion: ConversionDataPoint[];
  revenue: RevenueDataPoint[];
  statusBreakdown: StatusBreakdownData[];
  topProducts: TopProductData[];
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * Template variable for dynamic content
 */
export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  type: 'string' | 'number' | 'date' | 'currency';
  required: boolean;
  defaultValue?: string | number;
}

/**
 * Wizard step identifier
 */
export type WizardStep = 'customer-info' | 'product-selection' | 'line-items' | 'terms-notes' | 'review-send';

/**
 * Wizard step configuration
 */
export interface WizardStepConfig {
  id: WizardStep;
  label: string;
  description: string;
}

/**
 * Customer info step data
 */
export interface CustomerInfoData {
  customer?: Customer;
  customerId?: string;
  email: string;
  companyName: string;
  contactName: string;
  phone?: string;
  billingAddress?: CustomerAddress;
  shippingAddress?: CustomerAddress;
  isExistingCustomer: boolean;
}

/**
 * Product selection step data
 */
export interface ProductSelectionData {
  selectedProducts: Product[];
  selectedVariants: Record<string, string>;
  searchQuery?: string;
}

/**
 * Line items step data
 */
export interface LineItemsData {
  items: LineItem[];
}

/**
 * Terms and notes step data
 */
export interface TermsNotesData {
  paymentTerms: string;
  deliveryTerms: string;
  validityPeriod: number;
  depositRequired: boolean;
  depositPercentage: number;
  currency: string;
  notes: string;
  internalNotes: string;
}

/**
 * Complete wizard data structure
 */
export interface WizardData {
  customerInfo: CustomerInfoData;
  productSelection: ProductSelectionData;
  lineItems: LineItemsData;
  termsNotes: TermsNotesData;
}

/**
 * Wizard validation result
 */
export interface WizardValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Quote calculations
 */
export interface QuoteCalculations {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
}

/**
 * Status transition configuration
 */
export interface StatusTransition {
  from: QuoteStatus | QuoteStatus[];
  to: QuoteStatus;
  action: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  allowedRoles?: string[];
}

/**
 * Status change record
 */
export interface StatusChangeRecord {
  id: string;
  quoteId: string;
  fromStatus: QuoteStatus;
  toStatus: QuoteStatus;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  comment?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Status transition result
 */
export interface TransitionResult {
  success: boolean;
  error?: string;
  transition?: StatusChangeRecord;
}

/**
 * Quote with status history
 */
export interface QuoteWithHistory extends Quote {
  statusHistory: StatusChangeRecord[];
}

/**
 * Status action configuration
 */
export interface StatusAction {
  id: string;
  label: string;
  status: QuoteStatus;
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  icon?: string;
}

/**
 * PDF generation options
 */
export interface PDFGenerationOptions {
  includeHeader: boolean;
  includeFooter: boolean;
  includeLogo: boolean;
  includeTerms: boolean;
  includeNotes: boolean;
  format: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
}

/**
 * PDF document properties
 */
export interface PDFDocumentProps {
  quote: Quote;
  options?: Partial<PDFGenerationOptions>;
  companyLogo?: string;
  companyInfo?: CompanyInfo;
}

/**
 * Company information
 */
export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
}

/**
 * Quote settings
 */
export interface QuoteSettings {
  defaultCurrency: string;
  defaultValidityPeriod: number;
  defaultPaymentTerms: string;
  defaultDeliveryTerms: string;
  taxRate: number;
  enableAutoReminders: boolean;
  reminderDays: number[];
  emailTemplate?: string;
  companyLogo?: string;
  companyInfo?: CompanyInfo;
}

/**
 * Notification item
 */
export interface NotificationItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// ============================================================================
// 6. UTILITY TYPES
// ============================================================================

/**
 * Make all properties nullable
 */
export type Nullable<T> = T | null;

/**
 * Make all properties optional
 */
export type Optional<T> = T | undefined;

/**
 * Make all properties deeply partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties deeply required
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Make all properties deeply readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Extract keys of type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Non-nullable properties only
 */
export type NonNullableProps<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * Pick properties that are required
 */
export type RequiredProps<T> = Pick<T, KeysOfType<T, Exclude<T[keyof T], undefined>>>;

/**
 * Entity with timestamps
 */
export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity with soft delete
 */
export interface SoftDeletable {
  deletedAt?: Date;
  isDeleted: boolean;
}

/**
 * Entity with ID
 */
export interface WithId {
  id: string;
}

/**
 * Entity with audit info
 */
export interface Auditable {
  createdBy: string;
  updatedBy?: string;
}

/**
 * Page props for Next.js
 */
export interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Layout props for Next.js
 */
export interface LayoutProps extends WithChildren {
  params: Promise<{ [key: string]: string }>;
}

/**
 * Error boundary fallback props
 */
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Async status states
 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Query result wrapper
 */
export interface QueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Mutation result wrapper
 */
export interface MutationResult<T, V> {
  mutate: (variables: V) => Promise<T>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: T | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Wizard step configurations
 */
export const WIZARD_STEPS: WizardStepConfig[] = [
  { id: 'customer-info', label: 'Customer', description: 'Customer information' },
  { id: 'product-selection', label: 'Products', description: 'Select products' },
  { id: 'line-items', label: 'Line Items', description: 'Configure items' },
  { id: 'terms-notes', label: 'Terms', description: 'Terms & notes' },
  { id: 'review-send', label: 'Review', description: 'Review & send' },
];

/**
 * Quote status labels
 */
export const QuoteStatusLabels: Record<QuoteStatus, string> = {
  [QuoteStatus.DRAFT]: 'Draft',
  [QuoteStatus.PENDING]: 'Pending',
  [QuoteStatus.SENT]: 'Sent',
  [QuoteStatus.VIEWED]: 'Viewed',
  [QuoteStatus.ACCEPTED]: 'Accepted',
  [QuoteStatus.REJECTED]: 'Rejected',
  [QuoteStatus.EXPIRED]: 'Expired',
  [QuoteStatus.CONVERTED]: 'Converted',
};

/**
 * Quote status color classes
 */
export const QuoteStatusColors: Record<QuoteStatus, string> = {
  [QuoteStatus.DRAFT]: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  [QuoteStatus.PENDING]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  [QuoteStatus.SENT]: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  [QuoteStatus.VIEWED]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  [QuoteStatus.ACCEPTED]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  [QuoteStatus.REJECTED]: 'bg-red-500/10 text-red-400 border-red-500/20',
  [QuoteStatus.EXPIRED]: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  [QuoteStatus.CONVERTED]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

/**
 * Customer status labels
 */
export const CustomerStatusLabels: Record<CustomerStatus, string> = {
  [CustomerStatus.ACTIVE]: 'Active',
  [CustomerStatus.INACTIVE]: 'Inactive',
  [CustomerStatus.ARCHIVED]: 'Archived',
};

/**
 * Customer status color classes
 */
export const CustomerStatusColors: Record<CustomerStatus, string> = {
  [CustomerStatus.ACTIVE]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  [CustomerStatus.INACTIVE]: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  [CustomerStatus.ARCHIVED]: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

/**
 * Status metadata for workflow
 */
export const STATUS_METADATA: Record<QuoteStatus, {
  label: string;
  description: string;
  color: string;
  icon: string;
  isFinal: boolean;
  canEdit: boolean;
}> = {
  [QuoteStatus.DRAFT]: {
    label: 'Draft',
    description: 'Quote is being prepared',
    color: 'bg-slate-500',
    icon: 'PencilIcon',
    isFinal: false,
    canEdit: true,
  },
  [QuoteStatus.PENDING]: {
    label: 'Pending',
    description: 'Quote is ready to be sent',
    color: 'bg-amber-500',
    icon: 'ClockIcon',
    isFinal: false,
    canEdit: true,
  },
  [QuoteStatus.SENT]: {
    label: 'Sent',
    description: 'Quote has been sent to customer',
    color: 'bg-indigo-500',
    icon: 'PaperAirplaneIcon',
    isFinal: false,
    canEdit: false,
  },
  [QuoteStatus.VIEWED]: {
    label: 'Viewed',
    description: 'Customer has viewed the quote',
    color: 'bg-purple-500',
    icon: 'EyeIcon',
    isFinal: false,
    canEdit: false,
  },
  [QuoteStatus.ACCEPTED]: {
    label: 'Accepted',
    description: 'Quote has been accepted by customer',
    color: 'bg-emerald-500',
    icon: 'CheckCircleIcon',
    isFinal: true,
    canEdit: false,
  },
  [QuoteStatus.REJECTED]: {
    label: 'Declined',
    description: 'Quote has been declined',
    color: 'bg-red-500',
    icon: 'XCircleIcon',
    isFinal: true,
    canEdit: false,
  },
  [QuoteStatus.EXPIRED]: {
    label: 'Expired',
    description: 'Quote has expired',
    color: 'bg-gray-500',
    icon: 'CalendarIcon',
    isFinal: false,
    canEdit: false,
  },
  [QuoteStatus.CONVERTED]: {
    label: 'Converted',
    description: 'Quote converted to order',
    color: 'bg-blue-500',
    icon: 'ShoppingCartIcon',
    isFinal: true,
    canEdit: false,
  },
};

/**
 * Valid status transitions for workflow
 */
export const STATUS_FLOW: Record<QuoteStatus, QuoteStatus[]> = {
  [QuoteStatus.DRAFT]: [QuoteStatus.SENT, QuoteStatus.PENDING],
  [QuoteStatus.PENDING]: [QuoteStatus.SENT, QuoteStatus.DRAFT],
  [QuoteStatus.SENT]: [QuoteStatus.VIEWED, QuoteStatus.ACCEPTED, QuoteStatus.REJECTED, QuoteStatus.EXPIRED, QuoteStatus.SENT],
  [QuoteStatus.VIEWED]: [QuoteStatus.ACCEPTED, QuoteStatus.REJECTED, QuoteStatus.EXPIRED],
  [QuoteStatus.ACCEPTED]: [],
  [QuoteStatus.REJECTED]: [QuoteStatus.DRAFT],
  [QuoteStatus.EXPIRED]: [QuoteStatus.SENT, QuoteStatus.DRAFT],
  [QuoteStatus.CONVERTED]: [],
};

// ============================================================================
// API CLIENT TYPES
// ============================================================================

/**
 * Create customer input
 */
export interface CreateCustomerInput {
  email: string;
  companyName: string;
  contactName: string;
  phone?: string;
  billingAddress?: CustomerAddress;
  shippingAddress?: CustomerAddress;
  taxId?: string;
  tags?: string[];
  notes?: string;
  logoUrl?: string;
}

/**
 * Update customer input
 */
export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  status?: CustomerStatus;
}

/**
 * Customer list response
 */
export interface CustomersListResponse {
  customers: CustomerWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Customer response
 */
export interface CustomerResponse {
  customer: CustomerWithStats;
}

/**
 * Customer quotes response
 */
export interface CustomerQuotesResponse {
  quotes: Array<{
    id: string;
    quoteNumber: string;
    title: string;
    status: string;
    total: number;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Bulk update input
 */
export interface BulkUpdateInput {
  ids: string[];
  data: UpdateCustomerInput;
}

/**
 * Add note input
 */
export interface AddNoteInput {
  content: string;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * Use quote wizard return type
 */
export interface UseQuoteWizardReturn {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  isLoading: boolean;
  error: string | null;
  validationErrors: ValidationErrors;
  formData: QuoteFormData;
  calculations: QuoteCalculations;
  isStepValid: boolean;
  canProceed: boolean;
  canGoBack: boolean;
  progress: number;
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateFormData: (updates: Partial<QuoteFormData>) => void;
  updateCustomer: (updates: Partial<QuoteFormData['customer']>) => void;
  addLineItem: (item?: Partial<LineItemInput>) => void;
  updateLineItem: (index: number, updates: Partial<LineItemInput>) => void;
  removeLineItem: (index: number) => void;
  clearError: () => void;
  submitQuote: () => Promise<void>;
  reset: () => void;
}

/**
 * Use quote wizard options
 */
export interface UseQuoteWizardOptions {
  shopId: string;
  initialData?: Partial<QuoteFormData>;
  onComplete?: (quote: QuoteFormData) => Promise<void>;
}

/**
 * Customers list hook return
 */
export interface UseCustomersListReturn {
  customers: CustomerWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  revalidate: () => Promise<void>;
}

/**
 * Single customer hook return
 */
export interface UseCustomerReturn {
  customer: CustomerWithStats | null;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  revalidate: () => Promise<void>;
}

/**
 * Customer stats hook return
 */
export interface UseCustomerStatsReturn {
  stats: CustomerStats | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Customer activity hook return
 */
export interface UseCustomerActivityReturn {
  activities: CustomerActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: Error | null;
  revalidate: () => Promise<void>;
}

/**
 * Customer quotes hook return
 */
export interface UseCustomerQuotesReturn {
  quotes: CustomerQuotesResponse['quotes'];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: Error | null;
  revalidate: () => Promise<void>;
}

/**
 * Create customer hook return
 */
export interface UseCreateCustomerReturn {
  createCustomer: (input: CreateCustomerInput) => Promise<Customer>;
  isCreating: boolean;
  error: Error | null;
}

/**
 * Update customer hook return
 */
export interface UseUpdateCustomerReturn {
  updateCustomer: (id: string, input: UpdateCustomerInput) => Promise<Customer>;
  isUpdating: boolean;
  error: Error | null;
}

/**
 * Delete customer hook return
 */
export interface UseDeleteCustomerReturn {
  deleteCustomer: (id: string) => Promise<void>;
  isDeleting: boolean;
  error: Error | null;
}

// ============================================================================
// EXPORT TYPE ALIASES (for backward compatibility)
// ============================================================================

/** @deprecated Use QuoteStatus instead */
export type QuoteStatusType = QuoteStatus;

/** @deprecated Use CustomerStatus instead */
export type CustomerStatusType = CustomerStatus;

/** @deprecated Use ActivityType instead */
export type ActivityTypeType = ActivityType;

// Default export for convenience
export default {
  QuoteStatus,
  CustomerStatus,
  ActivityType,
  QuotePriority,
  WebhookEvent,
  WIZARD_STEPS,
  QuoteStatusLabels,
  QuoteStatusColors,
  CustomerStatusLabels,
  CustomerStatusColors,
  STATUS_METADATA,
  STATUS_FLOW,
};
