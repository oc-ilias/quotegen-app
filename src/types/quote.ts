/**
 * Comprehensive Type Definitions for QuoteGen
 * Exhaustive TypeScript types with proper documentation
 * @module types/quote
 */

// ============================================================================
// Enums
// ============================================================================

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

export enum QuotePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ActivityType {
  QUOTE_CREATED = 'quote_created',
  QUOTE_SENT = 'quote_sent',
  QUOTE_VIEWED = 'quote_viewed',
  QUOTE_ACCEPTED = 'quote_accepted',
  QUOTE_REJECTED = 'quote_rejected',
  QUOTE_EXPIRED = 'quote_expired',
  QUOTE_CONVERTED = 'quote_converted',
  CUSTOMER_ADDED = 'customer_added',
  PRODUCT_ADDED = 'product_added',
  NOTE_ADDED = 'note_added',
  STATUS_CHANGED = 'status_changed',
}

// ============================================================================
// Status Configuration
// ============================================================================

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

// ============================================================================
// Address Types
// ============================================================================

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// ============================================================================
// Customer Types
// ============================================================================

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
}

// ============================================================================
// Product Types
// ============================================================================

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  inventoryQuantity: number;
  options: Record<string, string>;
}

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

// ============================================================================
// Quote Line Item Types
// ============================================================================

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

// ============================================================================
// Quote Terms Types
// ============================================================================

export interface QuoteTerms {
  paymentTerms: string;
  deliveryTerms: string;
  validityPeriod: number; // days
  depositRequired: boolean;
  depositPercentage?: number;
  currency: string;
  notes?: string;
  internalNotes?: string;
}

export interface QuoteMetadata {
  createdBy: string;
  createdByName: string;
  updatedBy?: string;
  updatedByName?: string;
  ipAddress?: string;
  userAgent?: string;
  source: 'web' | 'api' | 'import';
}

// ============================================================================
// Main Quote Type
// ============================================================================

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

// ============================================================================
// Quote Form Data (for wizard)
// ============================================================================

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
// Activity Types
// ============================================================================

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

export interface ActivityItem {
  id: string;
  type: ActivityType;
  quote_id: string;
  quote_number: string;
  customer_name: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface QuoteStats {
  totalQuotes: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  conversionRate: number;
  totalRevenue: number;
  avgQuoteValue: number;
  avgResponseTime: number; // hours
  periodChange: {
    totalQuotes: number;
    conversionRate: number;
    totalRevenue: number;
    avgQuoteValue: number;
  };
}

export interface ConversionDataPoint {
  date: string;
  sent: number;
  viewed: number;
  accepted: number;
  rejected: number;
  conversionRate: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  quotes: number;
  avgValue: number;
}

export interface StatusBreakdownData {
  status: QuoteStatus;
  count: number;
  percentage: number;
  value: number;
}

export interface TopProductData {
  productId: string;
  title: string;
  quantity: number;
  revenue: number;
  imageUrl?: string;
}

// ============================================================================
// Wizard Types
// ============================================================================

export type WizardStep = 'customer-info' | 'product-selection' | 'line-items' | 'terms-notes' | 'review-send';

export interface WizardStepConfig {
  id: WizardStep;
  label: string;
  description: string;
}

export const WIZARD_STEPS: WizardStepConfig[] = [
  { id: 'customer-info', label: 'Customer', description: 'Customer information' },
  { id: 'product-selection', label: 'Products', description: 'Select products' },
  { id: 'line-items', label: 'Line Items', description: 'Configure items' },
  { id: 'terms-notes', label: 'Terms', description: 'Terms & notes' },
  { id: 'review-send', label: 'Review', description: 'Review & send' },
];

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

export interface ProductSelectionData {
  selectedProducts: Product[];
  selectedVariants: Record<string, string>; // productId -> variantId
}

export interface LineItemsData {
  items: LineItem[];
}

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

export interface WizardData {
  customerInfo: CustomerInfoData;
  productSelection: ProductSelectionData;
  lineItems: LineItemsData;
  termsNotes: TermsNotesData;
}

export interface WizardValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

// ============================================================================
// Template Types
// ============================================================================

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
// Settings Types
// ============================================================================

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
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface QuoteFilters {
  status?: QuoteStatus[];
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minValue?: number;
  maxValue?: number;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// PDF Types
// ============================================================================

export interface PDFGenerationOptions {
  includeHeader: boolean;
  includeFooter: boolean;
  includeLogo: boolean;
  includeTerms: boolean;
  includeNotes: boolean;
  format: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
}

export interface PDFDocumentProps {
  quote: Quote;
  options?: Partial<PDFGenerationOptions>;
  companyLogo?: string;
  companyInfo?: QuoteSettings['companyInfo'];
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface StatCardProps {
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

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export type NavItemId = 'dashboard' | 'quotes' | 'templates' | 'analytics' | 'settings' | 'customers';

export interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
  icon: string;
  badge?: number;
}
