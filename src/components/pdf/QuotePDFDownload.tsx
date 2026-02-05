/**
 * Quote PDF Download Button
 * Enhanced PDF generation with loading states and error handling
 * @module components/pdf/QuotePDFDownload
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { type Quote } from '@/types/quote';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with @react-pdf/renderer
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
  { ssr: false }
);

interface QuotePDFDownloadProps {
  quote: Quote;
  companyName?: string;
  companyInfo?: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
  };
  variant?: 'button' | 'dropdown' | 'icon';
  className?: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onError?: (error: Error) => void;
}

export function QuotePDFDownload({
  quote,
  companyName = 'QuoteGen',
  companyInfo = {},
  variant = 'button',
  className = '',
  onDownloadStart,
  onDownloadComplete,
  onError,
}: QuotePDFDownloadProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showDropdown, setShowDropdown] = useState(false);

  // Dynamic import of QuotePDFDocument to avoid SSR issues
  const [PDFDocument, setPDFDocument] = useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    import('./QuotePDF').then((mod) => {
      setPDFDocument(() => mod.QuotePDFDocument);
    });
  }, []);

  const handleDownloadStart = useCallback(() => {
    setIsGenerating(true);
    onDownloadStart?.();
  }, [onDownloadStart]);

  const handleDownloadComplete = useCallback(() => {
    setIsGenerating(false);
    setDownloadStatus('success');
    onDownloadComplete?.();
    
    // Reset status after 3 seconds
    setTimeout(() => setDownloadStatus('idle'), 3000);
  }, [onDownloadComplete]);

  const handleError = useCallback((error: Error) => {
    setIsGenerating(false);
    setDownloadStatus('error');
    onError?.(error);
  }, [onError]);

  const fileName = `quote-${quote.quoteNumber.toLowerCase().replace(/\s+/g, '-')}.pdf`;

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleEmail = useCallback(() => {
    const subject = encodeURIComponent(`Quote ${quote.quoteNumber} from ${companyName}`);
    const body = encodeURIComponent(`Please find your quote attached.\n\nQuote: ${quote.quoteNumber}\nTotal: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.terms?.currency || 'USD' }).format(quote.total)}`);
    window.location.href = `mailto:${quote.customer?.email}?subject=${subject}&body=${body}`;
  }, [quote, companyName]);

  if (!PDFDocument) {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-400 rounded-lg cursor-not-allowed ${className}`}
      >
        <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
        Loading...
      </button>
    );
  }

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

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ${className}`}
          title="PDF Options"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50 py-2"
              >
                <PDFDownloadLink
                  document={
                    <PDFDocument
                      quote={quote}
                      companyName={companyName}
                      companyInfo={companyInfo}
                    />
                  }
                  fileName={fileName}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700 transition-colors text-left"
                >
                  {({ loading }) => (
                    <>
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      {loading ? 'Generating...' : 'Download'}
                    </>
                  )}
                </PDFDownloadLink>
                
                <button
                  onClick={() => {
                    setShowPreview(true);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700 transition-colors text-left"
                >
                  <EyeIcon className="w-4 h-4" />
                  Preview
                </button>
                
                <button
                  onClick={() => {
                    handlePrint();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700 transition-colors text-left"
                >
                  <PrinterIcon className="w-4 h-4" />
                  Print
                </button>
                
                <button
                  onClick={() => {
                    handleEmail();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700 transition-colors text-left"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  Email
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-50"
                onClick={() => setShowPreview(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 md:inset-10 bg-slate-900 rounded-2xl z-50 flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                  <h3 className="text-lg font-semibold text-slate-200">PDF Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-hidden">
                  <PDFViewer className="w-full h-full rounded-xl">
                    <PDFDocument
                      quote={quote}
                      companyName={companyName}
                      companyInfo={companyInfo}
                    />
                  </PDFViewer>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <PDFDownloadLink
        document={
          <PDFDocument
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
    </>
  );
}

export default QuotePDFDownload;
