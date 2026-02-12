/**
 * Enhanced PDF Generation Components
 * Uses @react-pdf/renderer for generating professional quote PDFs
 * @module components/pdf/QuotePDF
 */

'use client';

import React, { useState, useCallback, useMemo, Component, type ErrorInfo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from '@react-pdf/renderer';
import {
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PrinterIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { Quote, QuoteStatus, Customer } from '@/types';
import {
  getPDFTemplate,
  getDefaultPDFTemplate,
  type PDFTemplateType,
  type PDFTemplateConfig,
  hexToRGBA,
} from './PDFTemplates';

// ============================================================================
// Types
// ============================================================================

/**
 * Company branding information
 */
export interface CompanyBranding {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  primaryColor?: string;
  accentColor?: string;
}

/**
 * PDF generation options
 */
export interface PDFGenerationOptions {
  template?: PDFTemplateType;
  includeHeader?: boolean;
  includeFooter?: boolean;
  includeLogo?: boolean;
  includeTerms?: boolean;
  includeNotes?: boolean;
  format?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  pageNumbers?: boolean;
}

/**
 * Props for QuotePDFDocument
 */
export interface QuotePDFProps {
  /** Quote data to render */
  quote: Quote;
  /** Company branding information */
  companyBranding?: CompanyBranding;
  /** PDF generation options */
  options?: PDFGenerationOptions;
  /** Template configuration override */
  templateConfig?: PDFTemplateConfig;
}

/**
 * Props for PDFDownloadButton
 */
export interface PDFDownloadButtonProps {
  /** Quote data */
  quote: Quote;
  /** Company branding */
  companyBranding?: CompanyBranding;
  /** PDF generation options */
  options?: PDFGenerationOptions;
  /** Additional CSS classes */
  className?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom button content */
  children?: ReactNode;
  /** Callback when download starts */
  onDownloadStart?: () => void;
  /** Callback when download completes */
  onDownloadComplete?: () => void;
  /** Callback when download fails */
  onDownloadError?: (error: Error) => void;
}

/**
 * Props for PDFPreview
 */
export interface PDFPreviewProps {
  /** Quote data */
  quote: Quote;
  /** Company branding */
  companyBranding?: CompanyBranding;
  /** PDF generation options */
  options?: PDFGenerationOptions;
  /** Additional CSS classes */
  className?: string;
  /** Preview height in pixels */
  height?: number;
  /** Callback when preview loads */
  onLoad?: () => void;
  /** Callback when preview fails */
  onError?: (error: Error) => void;
}

/**
 * Props for PDFActions
 */
export interface PDFActionsProps {
  /** Quote data */
  quote: Quote;
  /** Company branding */
  companyBranding?: CompanyBranding;
  /** PDF generation options */
  options?: PDFGenerationOptions;
  /** Callback for print action */
  onPrint?: () => void;
  /** Callback for share action */
  onShare?: () => void;
  /** Callback for duplicate action */
  onDuplicate?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Show/hide specific actions */
  showActions?: {
    download?: boolean;
    print?: boolean;
    share?: boolean;
    duplicate?: boolean;
    preview?: boolean;
  };
}

/**
 * Error boundary props
 */
interface PDFErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error boundary state
 */
interface PDFErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// ============================================================================
// PDF Style Generation
// ============================================================================

/**
 * Generate PDF styles based on template configuration
 * @param config - Template configuration
 * @returns React-PDF StyleSheet
 */
const createStyles = (config: PDFTemplateConfig) =>
  StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: config.colors.background,
      padding: config.page.padding,
      fontFamily: config.typography.fontFamily,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: config.spacing.xl,
      borderBottomWidth: 2,
      borderBottomColor: config.colors.primary,
      paddingBottom: config.spacing.md,
    },
    logo: {
      width: 100,
      height: 40,
      objectFit: 'contain',
    },
    companyInfo: {
      fontSize: config.typography.fontSize.sm,
      color: config.colors.textMuted,
      textAlign: 'right',
      lineHeight: config.typography.lineHeight.normal,
    },
    title: {
      fontSize: config.typography.fontSize['3xl'],
      fontWeight: config.typography.fontWeight.bold,
      color: config.colors.text,
      marginBottom: config.spacing.xs,
    },
    quoteNumber: {
      fontSize: config.typography.fontSize.base,
      color: config.colors.textMuted,
      marginBottom: config.spacing.lg,
    },
    section: {
      marginBottom: config.spacing.md,
    },
    sectionTitle: {
      fontSize: config.typography.fontSize.sm,
      fontWeight: config.typography.fontWeight.bold,
      color: config.colors.primary,
      marginBottom: config.spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    text: {
      fontSize: config.typography.fontSize.base,
      color: config.colors.textMuted,
      lineHeight: config.typography.lineHeight.normal,
    },
    table: {
      marginTop: config.spacing.md,
      marginBottom: config.spacing.md,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: hexToRGBA(config.colors.primary, 0.08),
      padding: config.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: config.colors.border,
    },
    tableRow: {
      flexDirection: 'row',
      padding: config.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: config.colors.border,
    },
    tableRowAlternate: {
      flexDirection: 'row',
      padding: config.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: config.colors.border,
      backgroundColor: config.colors.surface,
    },
    tableCell: {
      flex: 1,
      fontSize: config.typography.fontSize.base,
      color: config.colors.textMuted,
    },
    tableCellRight: {
      flex: 1,
      fontSize: config.typography.fontSize.base,
      color: config.colors.textMuted,
      textAlign: 'right',
    },
    totals: {
      marginTop: config.spacing.lg,
      borderTopWidth: 2,
      borderTopColor: config.colors.border,
      paddingTop: config.spacing.md,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: config.spacing.xs,
    },
    totalLabel: {
      fontSize: config.typography.fontSize.base,
      color: config.colors.textMuted,
      width: 100,
    },
    totalValue: {
      fontSize: config.typography.fontSize.base,
      color: config.colors.text,
      width: 100,
      textAlign: 'right',
    },
    grandTotal: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: config.spacing.sm,
      paddingTop: config.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: config.colors.border,
    },
    grandTotalLabel: {
      fontSize: config.typography.fontSize.xl,
      fontWeight: config.typography.fontWeight.bold,
      color: config.colors.text,
      width: 100,
    },
    grandTotalValue: {
      fontSize: config.typography.fontSize.xl,
      fontWeight: config.typography.fontWeight.bold,
      color: config.colors.primary,
      width: 100,
      textAlign: 'right',
    },
    footer: {
      position: 'absolute',
      bottom: config.spacing.xl,
      left: config.page.padding,
      right: config.page.padding,
      textAlign: 'center',
      fontSize: config.typography.fontSize.xs,
      color: config.colors.textMuted,
    },
    notes: {
      marginTop: config.spacing.lg,
      padding: config.spacing.md,
      backgroundColor: config.colors.surface,
      borderRadius: config.features.roundedCorners ? 4 : 0,
    },
    notesTitle: {
      fontSize: config.typography.fontSize.sm,
      fontWeight: config.typography.fontWeight.bold,
      color: config.colors.text,
      marginBottom: config.spacing.xs,
    },
    notesText: {
      fontSize: config.typography.fontSize.xs,
      color: config.colors.textMuted,
      lineHeight: config.typography.lineHeight.normal,
    },
    statusBadge: {
      paddingHorizontal: config.spacing.sm,
      paddingVertical: 4,
      borderRadius: config.features.roundedCorners ? 4 : 0,
      backgroundColor: hexToRGBA(config.colors.primary, 0.1),
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: config.typography.fontSize.sm,
      fontWeight: config.typography.fontWeight.bold,
      color: config.colors.primary,
      textTransform: 'uppercase',
    },
    watermark: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-45deg)',
      fontSize: 64,
      color: hexToRGBA(config.colors.border, 0.3),
      fontWeight: config.typography.fontWeight.bold,
      opacity: 0.5,
    },
  });

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get status color based on quote status
 * @param status - Quote status
 * @param config - Template configuration
 * @returns Color hex code
 */
const getStatusColor = (status: QuoteStatus, config: PDFTemplateConfig): string => {
  switch (status) {
    case 'accepted':
      return config.colors.success;
    case 'sent':
    case 'viewed':
      return config.colors.accent;
    case 'rejected':
      return config.colors.error;
    case 'expired':
      return config.colors.warning;
    case 'converted':
      return config.colors.secondary;
    default:
      return config.colors.textMuted;
  }
};

/**
 * Format currency value
 * @param value - Numeric value
 * @param currency - Currency code
 * @returns Formatted currency string
 */
const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Format date value
 * @param date - Date value
 * @returns Formatted date string
 */
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// ============================================================================
// PDF Error Boundary
// ============================================================================

/**
 * Error boundary for PDF generation errors
 * Catches and displays errors gracefully
 */
export class PDFErrorBoundary extends Component<PDFErrorBoundaryProps, PDFErrorBoundaryState> {
  constructor(props: PDFErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PDFErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    console.error('PDF Generation Error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <View style={{ padding: 20, backgroundColor: '#fef2f2', borderRadius: 8 }}>
            <Text style={{ color: '#dc2626', fontSize: 14, fontWeight: 'bold' }}>
              PDF Generation Error
            </Text>
            <Text style={{ color: '#7f1d1d', fontSize: 12, marginTop: 8 }}>
              {this.state.error?.message || 'An error occurred while generating the PDF'}
            </Text>
          </View>
        )
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// PDF Document Component
// ============================================================================

/**
 * Quote PDF Document Component
 * Renders a complete quote as a PDF document
 */
export const QuotePDFDocument: React.FC<QuotePDFProps> = ({
  quote,
  companyBranding,
  options = {},
  templateConfig,
}) => {
  const config = useMemo(() => {
    if (templateConfig) return templateConfig;
    return options.template ? getPDFTemplate(options.template) : getDefaultPDFTemplate();
  }, [options.template, templateConfig]);

  const styles = useMemo(() => createStyles(config), [config]);

  const {
    includeHeader = true,
    includeFooter = true,
    includeLogo = true,
    includeTerms = true,
    includeNotes = true,
    pageNumbers = true,
  } = options;

  const currency = quote.terms?.currency || 'USD';
  const customer = quote.customer as Customer;

  return (
    <Document
      title={`Quote ${quote.quoteNumber}`}
      author={companyBranding?.name || 'QuoteGen'}
      subject={`Quote for ${customer?.companyName || customer?.contactName || 'Customer'}`}
      keywords="quote, invoice, estimate"
      creator="QuoteGen"
      producer="QuoteGen PDF Generator"
    >
      <Page size={(options.format || 'A4').toUpperCase() as 'A4' | 'LETTER' | 'LEGAL'} style={styles.page}>
        {/* Watermark for professional template */}
        {config.features.showWatermark && (
          <Text style={styles.watermark}>QUOTE</Text>
        )}

        {/* Header */}
        {includeHeader && (
          <View style={styles.header}>
            <View>
              {includeLogo && companyBranding?.logo ? (
                <Image src={companyBranding.logo} style={styles.logo} />
              ) : (
                <Text
                  style={{
                    fontSize: config.typography.fontSize['2xl'],
                    fontWeight: config.typography.fontWeight.bold,
                    color: config.colors.primary,
                  }}
                >
                  {companyBranding?.name || 'QuoteGen'}
                </Text>
              )}
            </View>

            <View style={styles.companyInfo}>
              {companyBranding?.address && <Text>{companyBranding.address}</Text>}
              {companyBranding?.phone && <Text>{companyBranding.phone}</Text>}
              {companyBranding?.email && <Text>{companyBranding.email}</Text>}
              {companyBranding?.website && <Text>{companyBranding.website}</Text>}
              {companyBranding?.taxId && <Text>Tax ID: {companyBranding.taxId}</Text>}
            </View>
          </View>
        )}

        {/* Title & Status */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={styles.title}>Quote</Text>
            <Text style={styles.quoteNumber}>
              Quote #{quote.quoteNumber} • Valid until {formatDate(quote.expiresAt)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: hexToRGBA(getStatusColor(quote.status as QuoteStatus, config), 0.15) },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(quote.status as QuoteStatus, config) }]}>
              {quote.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.text}>{customer?.companyName || customer?.contactName}</Text>
          <Text style={styles.text}>{customer?.contactName}</Text>
          <Text style={styles.text}>{customer?.email}</Text>
          {customer?.phone && <Text style={styles.text}>{customer?.phone}</Text>}
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 3 }]}>Item</Text>
            <Text style={styles.tableCellRight}>Qty</Text>
            <Text style={styles.tableCellRight}>Price</Text>
            <Text style={styles.tableCellRight}>Total</Text>
          </View>

          {quote.lineItems?.map((item, index) => {
            const itemTotal = item.quantity * item.unitPrice;
            const discount = itemTotal * (item.discountPercentage || 0) / 100;
            const total = itemTotal - discount;
            const rowStyle = config.features.zebraStripes && index % 2 === 1
              ? styles.tableRowAlternate
              : styles.tableRow;

            return (
              <View key={item.id || index} style={rowStyle}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.tableCell}>{item.title}</Text>
                  {item.variantTitle && (
                    <Text style={{ fontSize: config.typography.fontSize.xs, color: config.colors.textMuted }}>
                      {item.variantTitle}
                    </Text>
                  )}
                  {item.sku && (
                    <Text style={{ fontSize: config.typography.fontSize.xs, color: config.colors.textMuted }}>
                      SKU: {item.sku}
                    </Text>
                  )}
                </View>
                <Text style={styles.tableCellRight}>{item.quantity}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(item.unitPrice, currency)}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(total, currency)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.subtotal || 0, currency)}</Text>
          </View>

          {quote.discountTotal > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.totalValue}>-{formatCurrency(quote.discountTotal, currency)}</Text>
            </View>
          )}

          {quote.shippingTotal > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={styles.totalValue}>{formatCurrency(quote.shippingTotal, currency)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.taxTotal || 0, currency)}</Text>
          </View>

          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(quote.total || 0, currency)}</Text>
          </View>
        </View>

        {/* Terms & Notes */}
        {includeTerms && includeNotes && (quote.terms?.paymentTerms || quote.terms?.deliveryTerms || quote.terms?.notes) && (
          <View style={styles.notes}>
            {quote.terms?.paymentTerms && (
              <>
                <Text style={styles.notesTitle}>Payment Terms</Text>
                <Text style={styles.notesText}>{quote.terms.paymentTerms}</Text>
              </>
            )}
            {quote.terms?.deliveryTerms && (
              <>
                <Text style={[styles.notesTitle, { marginTop: config.spacing.sm }]}>Delivery Terms</Text>
                <Text style={styles.notesText}>{quote.terms.deliveryTerms}</Text>
              </>
            )}
            {quote.terms?.notes && (
              <>
                <Text style={[styles.notesTitle, { marginTop: config.spacing.sm }]}>Notes</Text>
                <Text style={styles.notesText}>{quote.terms.notes}</Text>
              </>
            )}
          </View>
        )}

        {/* Footer */}
        {includeFooter && (
          <View style={styles.footer}>
            <Text>Thank you for your business!</Text>
            <Text>This quote is valid until {formatDate(quote.expiresAt)}.</Text>
            {quote.terms?.validityPeriod && (
              <Text>Quote valid for {quote.terms.validityPeriod} days.</Text>
            )}
            {pageNumbers && <Text render={({ pageNumber, totalPages }) => (
              `Page ${pageNumber} of ${totalPages}`
            )} />}
          </View>
        )}
      </Page>
    </Document>
  );
};

// ============================================================================
// PDF Download Button Component
// ============================================================================

/**
 * PDF Download Button Component
 * Provides a button to download the quote as a PDF
 */
export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  quote,
  companyBranding,
  options = {},
  className = '',
  variant = 'primary',
  size = 'md',
  children,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
}) => {
  const [hasError, setHasError] = useState(false);

  const fileName = useMemo(() => {
    const sanitizedQuoteNumber = quote.quoteNumber
      ?.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') || 'quote';
    return `quote-${sanitizedQuoteNumber}.pdf`;
  }, [quote.quoteNumber]);

  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200',
    outline: 'border border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const handleRetry = useCallback(() => {
    setHasError(false);
  }, []);

  if (hasError) {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg font-medium transition-colors',
          'bg-red-500/10 text-red-400 border border-red-500/20',
          sizeClasses[size],
          className
        )}
        onClick={handleRetry}
        aria-label="PDF generation failed. Click to retry."
      >
        <ExclamationCircleIcon className="w-4 h-4" aria-hidden="true" />
        PDF Error - Click to Retry
      </motion.button>
    );
  }

  return (
    <PDFErrorBoundary
      fallback={
        <button
          className={cn(
            'inline-flex items-center gap-2 rounded-lg font-medium',
            'bg-red-500/10 text-red-400 border border-red-500/20',
            sizeClasses[size],
            className
          )}
          onClick={handleRetry}
        >
          <ExclamationCircleIcon className="w-4 h-4" />
          PDF Error - Click to Retry
        </button>
      }
      onError={(error) => {
        setHasError(true);
        onDownloadError?.(error);
      }}
    >
      <PDFDownloadLink
        document={
          <QuotePDFDocument
            quote={quote}
            companyBranding={companyBranding}
            options={options}
          />
        }
        fileName={fileName}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg font-medium transition-all',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
      >
        {({ loading, error }) => {
          if (loading) {
            onDownloadStart?.();
          }

          if (error && !hasError) {
            setHasError(true);
            onDownloadError?.(error);
          }

          return (
            <>
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {children || 'Generating...'}
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-4 h-4" aria-hidden="true" />
                  {children || 'Download PDF'}
                </>
              )}
            </>
          );
        }}
      </PDFDownloadLink>
    </PDFErrorBoundary>
  );
};

// ============================================================================
// PDF Preview Component
// ============================================================================

/**
 * PDF Preview Component
 * Displays a live preview of the PDF in an iframe
 */
export const PDFPreview: React.FC<PDFPreviewProps> = ({
  quote,
  companyBranding,
  options = {},
  className,
  height = 600,
  onLoad,
  onError,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    let url: string | null = null;

    const generatePdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const blob = await pdf(
          <QuotePDFDocument
            quote={quote}
            companyBranding={companyBranding}
            options={options}
          />
        ).toBlob();

        url = URL.createObjectURL(blob);

        if (isMounted) {
          setPdfUrl(url);
          setIsLoading(false);
          onLoad?.();
        } else if (url) {
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate PDF');
        if (isMounted) {
          setError(error);
          setIsLoading(false);
          onError?.(error);
        }
      }
    };

    generatePdf();

    return () => {
      isMounted = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [quote, companyBranding, options, onLoad, onError]);

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800',
          className
        )}
        style={{ height }}
        role="status"
        aria-label="Generating PDF preview"
      >
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
          Generating preview...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-red-500/20',
          className
        )}
        style={{ height }}
        role="alert"
        aria-label="PDF preview error"
      >
        <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Preview Error</h3>
        <p className="text-slate-400">{error.message}</p>
      </div>
    );
  }

  if (!pdfUrl) {
    return null;
  }

  return (
    <motion.iframe
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      src={pdfUrl}
      className={cn('w-full bg-white rounded-xl', className)}
      style={{ height }}
      title="Quote PDF Preview"
      aria-label="Quote PDF preview"
    />
  );
};

// ============================================================================
// PDF Actions Component
// ============================================================================

/**
 * PDF Actions Component
 * Provides a toolbar with PDF-related actions
 */
export const PDFActions: React.FC<PDFActionsProps> = ({
  quote,
  companyBranding,
  options = {},
  onPrint,
  onShare,
  onDuplicate,
  className,
  showActions = {
    download: true,
    print: true,
    share: true,
    duplicate: true,
    preview: true,
  },
}) => {
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleAction = useCallback(
    (action: string, handler?: () => void) => {
      handler?.();
      setShowSuccess(action);
      setTimeout(() => setShowSuccess(null), 2000);
    },
    []
  );

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20"
              role="status"
              aria-live="polite"
            >
              <CheckCircleIcon className="w-4 h-4" aria-hidden="true" />
              {showSuccess === 'print' && 'Opening print dialog...'}
              {showSuccess === 'share' && 'Share dialog opened'}
              {showSuccess === 'duplicate' && 'Quote duplicated'}
            </motion.div>
          ) : (
            <>
              {showActions.download && (
                <PDFDownloadButton
                  quote={quote}
                  companyBranding={companyBranding}
                  options={options}
                  variant="primary"
                  size="sm"
                >
                  Download PDF
                </PDFDownloadButton>
              )}

              {showActions.preview && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPreview(!showPreview)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                    showPreview
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'border border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'
                  )}
                  aria-expanded={showPreview}
                  aria-controls="pdf-preview-panel"
                >
                  <EyeIcon className="w-4 h-4" aria-hidden="true" />
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </motion.button>
              )}

              {showActions.print && onPrint && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction('print', onPrint)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50 transition-colors"
                  aria-label="Print quote"
                >
                  <PrinterIcon className="w-4 h-4" aria-hidden="true" />
                  Print
                </motion.button>
              )}

              {showActions.share && onShare && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction('share', onShare)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50 transition-colors"
                  aria-label="Share quote"
                >
                  <ShareIcon className="w-4 h-4" aria-hidden="true" />
                  Share
                </motion.button>
              )}

              {showActions.duplicate && onDuplicate && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction('duplicate', onDuplicate)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50 transition-colors"
                  aria-label="Duplicate quote"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" aria-hidden="true" />
                  Duplicate
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* PDF Preview Panel */}
      <AnimatePresence>
        {showPreview && showActions.preview && (
          <motion.div
            id="pdf-preview-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <PDFPreview
              quote={quote}
              companyBranding={companyBranding}
              options={options}
              height={500}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Print Styles Hook
// ============================================================================

/**
 * Hook to inject print styles for PDF generation
 * Adds CSS print styles to the document
 */
export const usePDFPrintStyles = (): void => {
  React.useEffect(() => {
    const styleId = 'pdf-print-styles';
    
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @media print {
        .no-print {
          display: none !important;
        }
        
        .print-only {
          display: block !important;
        }
        
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        
        .pdf-page {
          page-break-after: always;
          page-break-inside: avoid;
        }
        
        .pdf-page:last-child {
          page-break-after: avoid;
        }
        
        table {
          page-break-inside: avoid;
        }
        
        tr {
          page-break-inside: avoid;
        }
        
        @page {
          margin: 1cm;
          size: auto;
        }
      }
      
      .print-only {
        display: none;
      }
    `;

    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);
};

// ============================================================================
// Default Export
// ============================================================================

export default QuotePDFDocument;
