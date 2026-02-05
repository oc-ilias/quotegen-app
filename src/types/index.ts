/**
 * TypeScript Type Definitions
 * Centralized type exports for the QuoteGen application
 */

// ============================================
// Entity Types
// ============================================

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: QuoteStatus;
  priority: Priority;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  validUntil: string;
  notes?: string;
  terms?: string;
  lineItems: LineItem[];
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  expiredAt?: string;
  metadata?: Record<string, unknown>;
}

export type QuoteStatus = 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'accepted' 
  | 'declined' 
  | 'expired' 
  | 'converted';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface LineItem {
  id: string;
  quoteId: string;
  productId?: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  total: number;
  sortOrder: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: Address;
  taxId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  quoteCount?: number;
  totalSpent?: number;
  lastQuoteAt?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost?: number;
  category?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'pdf' | 'quote';
  content: string;
  variables: TemplateVariable[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  defaultValue?: string;
}

// ============================================
// User & Team Types
// ============================================

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'owner' | 'admin' | 'manager' | 'user';

export type UserStatus = 'active' | 'inactive' | 'pending';

export type Permission = 
  | 'quotes:read' | 'quotes:create' | 'quotes:edit' | 'quotes:delete' | 'quotes:send'
  | 'customers:read' | 'customers:create' | 'customers:edit' | 'customers:delete'
  | 'products:read' | 'products:create' | 'products:edit' | 'products:delete'
  | 'templates:read' | 'templates:create' | 'templates:edit' | 'templates:delete'
  | 'analytics:read'
  | 'settings:read' | 'settings:edit'
  | 'team:read' | 'team:manage'
  | 'billing:read' | 'billing:manage';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  quoteCreated: boolean;
  quoteSent: boolean;
  quoteAccepted: boolean;
  quoteDeclined: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
}

// ============================================
// Analytics Types
// ============================================

export interface AnalyticsData {
  overview: OverviewMetrics;
  revenue: RevenueData;
  conversion: ConversionData;
  geographic: GeographicData[];
  products: ProductPerformance[];
  trends: TrendData;
}

export interface OverviewMetrics {
  totalQuotes: number;
  totalRevenue: number;
  conversionRate: number;
  averageQuoteValue: number;
  quotesThisMonth: number;
  revenueThisMonth: number;
  quotesChange: number;
  revenueChange: number;
}

export interface RevenueData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface ConversionData {
  stages: {
    name: string;
    value: number;
    count: number;
    dropOff?: number;
  }[];
}

export interface GeographicData {
  region: string;
  quotes: number;
  revenue: number;
  customers: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  quoteCount: number;
  revenue: number;
  quantity: number;
}

export interface TrendData {
  labels: string[];
  quotes: number[];
  revenue: number[];
  conversion: number[];
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ============================================
// Form Types
// ============================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// ============================================
// UI Component Types
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// ============================================
// Settings Types
// ============================================

export interface CompanySettings {
  name: string;
  logo?: string;
  address?: Address;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  currency: string;
  timezone: string;
}

export interface QuoteDefaults {
  defaultTerms?: string;
  defaultNotes?: string;
  defaultValidDays: number;
  defaultTaxRate: number;
  defaultDiscount: number;
  requireApproval: boolean;
  autoSendNotifications: boolean;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
  createdAt: string;
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// ============================================
// Re-export for convenience
// ============================================

export type { ReactNode, ReactElement, ReactPortal } from 'react';
