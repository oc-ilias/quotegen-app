/"use client";

/**
 * PDF Generation Components
 * Uses @react-pdf/renderer for generating quote PDFs
 */

import React from 'react';
import { motion } from 'framer-motion';
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
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { Quote } from '@/types/quote';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 20,
  },
  logo: {
    width: 100,
    height: 40,
  },
  companyInfo: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  quoteNumber: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.4,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    paddingTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 10,
    color: '#64748b',
    width: 100,
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
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    width: 100,
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
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.5,
  },
});

// PDF Document Component
interface QuotePDFProps {
  quote: Quote;
  companyName?: string;
  companyInfo?: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export const QuotePDFDocument: React.FC<QuotePDFProps> = ({
  quote,
  companyName = 'QuoteGen',
  companyInfo = {},
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.terms?.currency || 'USD',
    }).format(value);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4f46e5' }}>
              {companyName}
            </Text>
          </View>
          
          <View style={styles.companyInfo}>
            {companyInfo.address && <Text>{companyInfo.address}</Text>}
            {companyInfo.phone && <Text>{companyInfo.phone}</Text>}
            {companyInfo.email && <Text>{companyInfo.email}</Text>}
            {companyInfo.website && <Text>{companyInfo.website}</Text>}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Quote</Text>
        <Text style={styles.quoteNumber}>
          Quote #{quote.quoteNumber} • Valid until {formatDate(quote.expiresAt)}
        </Text>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.text}>{quote.customer?.companyName || quote.customer?.contactName}</Text>
          <Text style={styles.text}>{quote.customer?.contactName}</Text>
          <Text style={styles.text}>{quote.customer?.email}</Text>
          {quote.customer?.phone && <Text style={styles.text}>{quote.customer?.phone}</Text>}
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

            return (
              <View key={index} style={styles.tableRow}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.tableCell}>{item.title}</Text>
                  {item.variantTitle && <Text style={{ fontSize: 8, color: '#94a3b8' }}>{item.variantTitle}</Text>}
                </View>
                <Text style={styles.tableCellRight}>{item.quantity}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(total)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={styles.totalValue}>-{formatCurrency(quote.discountTotal)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.taxTotal)}</Text>
          </View>
          
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {/* Terms & Notes */}
        {(quote.terms?.paymentTerms || quote.terms?.deliveryTerms || quote.terms?.notes) && (
          <View style={styles.notes}>
            {quote.terms?.paymentTerms && (
              <>
                <Text style={styles.notesTitle}>Payment Terms</Text>
                <Text style={styles.notesText}>{quote.terms.paymentTerms}</Text>
              </>
            )}
            {quote.terms?.deliveryTerms && (
              <>
                <Text style={styles.notesTitle}>Delivery Terms</Text>
                <Text style={styles.notesText}>{quote.terms.deliveryTerms}</Text>
              </>
            )}
            {quote.terms?.notes && (
              <>
                <Text style={styles.notesTitle}>Notes</Text>
                <Text style={styles.notesText}>{quote.terms.notes}</Text>
              </>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text>This quote is valid until {formatDate(quote.expiresAt)}.</Text>
        </View>
      </Page>
    </Document>
  );
};

// PDF Download Button Component
interface PDFDownloadButtonProps {
  quote: Quote;
  companyName?: string;
  companyInfo?: QuotePDFProps['companyInfo'];
  className?: string;
}

export function PDFDownloadButton({
  quote,
  companyName,
  companyInfo,
  className = '',
}: PDFDownloadButtonProps) {
  const fileName = `quote-${quote.quoteNumber.toLowerCase().replace(/\s+/g, '-')}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <QuotePDFDocument
          quote={quote}
          companyName={companyName}
          companyInfo={companyInfo}
        />
      }
      fileName={fileName}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors ${className}`}
    >
      {({ loading }) => (
        <>
          <ArrowDownTrayIcon className="w-4 h-4" />
          {loading ? 'Generating...' : 'Download PDF'}
        </>
      )}
    </PDFDownloadLink>
  );
}

// PDF Preview Component
interface PDFPreviewProps {
  quote: Quote;
  companyName?: string;
  companyInfo?: QuotePDFProps['companyInfo'];
}

export function PDFPreview({ quote, companyName, companyInfo }: PDFPreviewProps) {
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const generatePdf = async () => {
      const blob = await pdf(
        <QuotePDFDocument
          quote={quote}
          companyName={companyName}
          companyInfo={companyInfo}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    };

    generatePdf();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [quote, companyName, companyInfo]);

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-slate-900/50 rounded-xl">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
          Generating preview...
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={pdfUrl}
      className="w-full h-[600px] bg-white rounded-xl"
      title="Quote PDF Preview"
    />
  );
}

export default QuotePDFDocument;
