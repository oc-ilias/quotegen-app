/**
 * Enhanced PDF Generation Components
 * Multiple templates, custom branding, and advanced PDF features
 * @module components/pdf/QuotePDFEnhanced
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
  Font,
} from '@react-pdf/renderer';
import {
  ArrowDownTrayIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  EnvelopeIcon,
  PaletteIcon,
  SettingsIcon,
  FileTextIcon,
  LayoutTemplateIcon,
} from '@heroicons/react/24/outline';
import type { Quote, QuoteTemplate, CompanySettings } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export type PDFTemplate = 'modern' | 'classic' | 'minimal' | 'professional';

export interface QuotePDFEnhancedProps {
  quote: Quote;
  template?: PDFTemplate;
  companySettings?: CompanySettings;
  className?: string;
}

export interface PDFDownloadButtonProps {
  quote: Quote;
  companySettings?: CompanySettings;
  variant?: 'button' | 'dropdown' | 'icon' | 'full';
  className?: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// Register Fonts
// ============================================================================

// Note: In a real app, you'd register custom fonts
// Font.register({
//   family: 'Inter',
//   fonts: [
//     { src: '/fonts/Inter-Regular.ttf' },
//     { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
//   ],
// });

// ============================================================================
// Template Styles
// ============================================================================

const modernStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#4f46e5',
  },
  logo: {
    width: 120,
    height: 50,
  },
  companyInfo: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'right',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  quoteNumber: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  text: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
  },
  customerBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: '8 8 0 0',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  tableRowAlternate: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
  },
  tableCellRight: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
    textAlign: 'right',
  },
  totals: {
    marginTop: 24,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b',
    width: 120,
  },
  totalValue: {
    fontSize: 10,
    color: '#1e293b',
    width: 100,
    textAlign: 'right',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#4f46e5',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    width: 120,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4f46e5',
    width: 100,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#94a3b8',
  },
  notes: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fefce8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#eab308',
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#854d0e',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#a16207',
    lineHeight: 1.5,
  },
  status: {
    position: 'absolute',
    top: 40,
    right: 40,
    padding: '8 16',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusSent: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  statusAccepted: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusDeclined: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
});

const classicStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 50,
    fontFamily: 'Times-Roman',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  quoteNumber: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  column: {
    width: '45%',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 10,
    lineHeight: 1.6,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cccccc',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  grandTotal: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 9,
  },
});

// ============================================================================
// PDF Document Components
// ============================================================================

const ModernQuotePDF = ({ quote, companySettings }: { quote: Quote; companySettings?: CompanySettings }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.currency || 'USD',
    }).format(value);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return modernStyles.statusPending;
      case 'sent': return modernStyles.statusSent;
      case 'accepted': return modernStyles.statusAccepted;
      case 'declined': return modernStyles.statusDeclined;
      default: return modernStyles.statusPending;
    }
  };

  return (
    <Document>
      <Page size="A4" style={modernStyles.page}>
        {/* Status Badge */}
        <View style={[modernStyles.status, getStatusStyle(quote.status)]}>
          <Text>{quote.status?.toUpperCase() || 'PENDING'}</Text>
        </View>

        {/* Header */}
        <View style={modernStyles.header}>
          <View>
            <Text style={modernStyles.title}>QUOTE</Text>
            <Text style={modernStyles.quoteNumber}>
              #{quote.quote_number} • {formatDate(new Date())}
            </Text>
          </View>
          
          <View style={modernStyles.companyInfo}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 }}>
              {companySettings?.name || 'QuoteGen'}
            </Text>
            {companySettings?.address && <Text>{companySettings.address}</Text>}
            {companySettings?.phone && <Text>{companySettings.phone}</Text>}
            {companySettings?.email && <Text>{companySettings.email}</Text>}
            {companySettings?.website && <Text>{companySettings.website}</Text>}
          </View>
        </View>

        {/* Customer Info */}
        <View style={modernStyles.customerBox}>
          <Text style={modernStyles.sectionTitle}>Bill To</Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 }}>
            {quote.customer?.company || quote.customer?.name}
          </Text>
          <Text style={modernStyles.text}>{quote.customer?.name}</Text>
          <Text style={modernStyles.text}>{quote.customer?.email}</Text>
          {quote.customer?.phone && <Text style={modernStyles.text}>{quote.customer.phone}</Text>}
        </View>

        {/* Line Items Table */}
        <View style={modernStyles.table}>
          <View style={modernStyles.tableHeader}>
            <Text style={[modernStyles.tableHeaderCell, { flex: 3 }]}>Description</Text>
            <Text style={modernStyles.tableHeaderCell}>Qty</Text>
            <Text style={modernStyles.tableHeaderCell}>Price</Text>
            <Text style={modernStyles.tableHeaderCell}>Total</Text>
          </View>

          {quote.line_items?.map((item, index) => {
            const itemTotal = item.quantity * item.unit_price;
            const discount = itemTotal * (item.discount_percent || 0) / 100;
            const total = itemTotal - discount;

            return (
              <View 
                key={index} 
                style={[
                  modernStyles.tableRow,
                  index % 2 === 1 && modernStyles.tableRowAlternate,
                ]}
              >
                <View style={{ flex: 3 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e293b' }}>
                    {item.name}
                  </Text>
                  {item.description && <Text style={{ fontSize: 9, color: '#64748b' }}>{item.description}</Text>}
                </View>
                <Text style={modernStyles.tableCell}>{item.quantity}</Text>
                <Text style={modernStyles.tableCell}>{formatCurrency(item.unit_price)}</Text>
                <Text style={modernStyles.tableCell}>{formatCurrency(total)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={modernStyles.totals}>
          <View style={modernStyles.totalRow}>
            <Text style={modernStyles.totalLabel}>Subtotal</Text>
            <Text style={modernStyles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
          </View>
          
          {quote.discount_total > 0 && (
            <View style={modernStyles.totalRow}>
              <Text style={modernStyles.totalLabel}>Discount</Text>
              <Text style={modernStyles.totalValue}>-{formatCurrency(quote.discount_total)}</Text>
            </View>
          )}
          
          <View style={modernStyles.totalRow}>
            <Text style={modernStyles.totalLabel}>Tax</Text>
            <Text style={modernStyles.totalValue}>{formatCurrency(quote.tax_total)}</Text>
          </View>
          
          <View style={modernStyles.grandTotal}>
            <Text style={modernStyles.grandTotalLabel}>Total</Text>
            <Text style={modernStyles.grandTotalValue}>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {/* Terms & Notes */}
        {(quote.terms || quote.notes) && (
          <View style={modernStyles.notes}>
            {quote.terms && (
              <>
                <Text style={modernStyles.notesTitle}>Terms & Conditions</Text>
                <Text style={modernStyles.notesText}>{quote.terms}</Text>
              </>
            )}
            {quote.notes && (
              <>
                <Text style={[modernStyles.notesTitle, { marginTop: quote.terms ? 12 : 0 }]}">Notes</Text>
                <Text style={modernStyles.notesText}>{quote.notes}</Text>
              </>
            )}
          </View>
        )}

        {/* Valid Until */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 10, color: '#64748b', textAlign: 'center' }}>
            This quote is valid until {formatDate(quote.valid_until)}
          </Text>
        </View>

        {/* Footer */}
        <View style={modernStyles.footer}>
          <Text>Thank you for your business!</Text>
          <Text>If you have any questions, please contact us at {companySettings?.email || 'support@quotegen.com'}</Text>
        </View>
      </Page>
    </Document>
  );
};

// ============================================================================
// PDF Download Button Component
// ============================================================================

export function QuotePDFDownloadEnhanced({
  quote,
  companySettings,
  variant = 'button',
  className,
  onDownloadStart,
  onDownloadComplete,
  onError,
}: PDFDownloadButtonProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showDropdown, setShowDropdown] = useState(false);
  const { showToast } = useToast();

  const fileName = `quote-${quote.quote_number?.toLowerCase().replace(/\s+/g, '-') || 'draft'}.pdf`;

  const templates: { id: PDFTemplate; label: string; icon: React.ElementType }[] = [
    { id: 'modern', label: 'Modern', icon: LayoutTemplateIcon },
    { id: 'classic', label: 'Classic', icon: FileTextIcon },
    { id: 'minimal', label: 'Minimal', icon: FileTextIcon },
    { id: 'professional', label: 'Professional', icon: FileTextIcon },
  ];

  const handleDownloadStart = useCallback(() => {
    setIsGenerating(true);
    onDownloadStart?.();
  }, [onDownloadStart]);

  const handleDownloadComplete = useCallback(() => {
    setIsGenerating(false);
    setDownloadStatus('success');
    onDownloadComplete?.();
    
    showToast({
      title: 'PDF Downloaded',
      description: `Quote ${quote.quote_number} has been downloaded.`,
      variant: 'success',
    });

    setTimeout(() => setDownloadStatus('idle'), 3000);
  }, [onDownloadComplete, quote.quote_number, showToast]);

  const handleError = useCallback((error: Error) => {
    setIsGenerating(false);
    setDownloadStatus('error');
    onError?.(error);

    showToast({
      title: 'Download Failed',
      description: error.message,
      variant: 'error',
    });
  }, [onError, showToast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleEmail = useCallback(() => {
    const subject = encodeURIComponent(`Quote ${quote.quote_number} from ${companySettings?.name || 'QuoteGen'}`);
    const body = encodeURIComponent(`Please find your quote attached.\n\nQuote: ${quote.quote_number}\nTotal: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency || 'USD' }).format(quote.total)}`);
    window.location.href = `mailto:${quote.customer?.email}?subject=${subject}&body=${body}`;
  }, [quote, companySettings]);

  const ButtonContent = () => (
    <>
      {isGenerating ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Generating...
        </>
      ) : downloadStatus === 'success' ? (
        <>
          <CheckIcon className="w-4 h-4" />
          Downloaded!
        </>
      ) : downloadStatus === 'error' ? (
        <>
          <ExclamationTriangleIcon className="w-4 h-4" />
          Error
        </>
      ) : (
        <>
          <ArrowDownTrayIcon className="w-4 h-4" />
          Download PDF
        </>
      )}
    </>
  );

  if (variant === 'full') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Template Selector */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <PaletteIcon className="w-4 h-4" />
          <span>Template:</span>
          <div className="flex gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs transition-colors',
                  selectedTemplate === template.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                )}
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <PDFDownloadLink
            document={<ModernQuotePDF quote={quote} companySettings={companySettings} />}
            fileName={fileName}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              'bg-indigo-600 hover:bg-indigo-700 text-white'
            )}
          >
            {({ loading }) => (
              <>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </>
            )}
          </PDFDownloadLink>

          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            <EyeIcon className="w-4 h-4" />
            Preview
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            <PrinterIcon className="w-4 h-4" />
            Print
          </button>

          <button
            onClick={handleEmail}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            <EnvelopeIcon className="w-4 h-4" />
            Email
          </button>
        </div>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={() => setShowPreview(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 md:inset-10 bg-slate-900 rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-slate-200">PDF Preview</h3>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value as PDFTemplate)}
                      className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200"
                    >
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-auto bg-slate-950">
                  <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-8 min-h-[800px]">
                    <div className="text-slate-900">
                      <!-- Preview content would be rendered here -->
                      <div className="text-center text-slate-400 py-20">
                        PDF Preview ({selectedTemplate} template)
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default button variant
  return (
    <PDFDownloadLink
      document={<ModernQuotePDF quote={quote} companySettings={companySettings} />}
      fileName={fileName}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
        'bg-indigo-600 hover:bg-indigo-700 text-white font-medium',
        className
      )}
    >
      {({ loading }) => (
        <>
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download PDF
            </>
          )}
        </>
      )}
    </PDFDownloadLink>
  );
}

export default QuotePDFDownloadEnhanced;
