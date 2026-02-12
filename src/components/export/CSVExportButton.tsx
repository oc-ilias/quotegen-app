/**
 * CSV Export Button Component
 * Exports quotes to CSV format with date range and filter support
 * @module components/export/CSVExportButton
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Quote, QuoteStatus, QuoteFilters } from '@/types/quote';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

// ============================================================================
// Types
// ============================================================================

interface CSVExportButtonProps {
  /** Array of quotes to export */
  quotes: Quote[];
  /** Optional filters applied to the export */
  filters?: QuoteFilters;
  /** Optional date range for the export */
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  /** Callback when export starts */
  onExportStart?: () => void;
  /** Callback when export completes */
  onExportComplete?: () => void;
  /** Callback when export fails */
  onExportError?: (error: Error) => void;
  /** Custom filename prefix (default: 'quotes') */
  filenamePrefix?: string;
  /** Additional class names */
  className?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show preview before download */
  showPreview?: boolean;
}

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: string[][];
  onConfirm: () => void;
  filename: string;
}

interface CSVExportState {
  isExporting: boolean;
  isPreviewOpen: boolean;
  error: Error | null;
  progress: number;
}

// ============================================================================
// CSV Utility Functions
// ============================================================================

/**
 * Escapes a CSV field to handle special characters
 * @param field - The field to escape
 * @returns Escaped field string
 */
function escapeCSVField(field: string | number | undefined): string {
  if (field === undefined || field === null) return '';
  const stringField = String(field);
  // Escape quotes by doubling them
  const escaped = stringField.replace(/"/g, '""');
  // Wrap in quotes if contains comma, newline, or quote
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${escaped}"`;
  }
  return escaped;
}

/**
 * Converts quote data to CSV format
 * @param quotes - Array of quotes to convert
 * @returns CSV string
 */
function convertQuotesToCSV(quotes: Quote[]): string {
  const headers = [
    'Quote Number',
    'Customer Name',
    'Company',
    'Email',
    'Phone',
    'Title',
    'Status',
    'Priority',
    'Subtotal',
    'Discount',
    'Tax',
    'Shipping',
    'Total',
    'Currency',
    'Created Date',
    'Expiry Date',
    'Sent Date',
    'Viewed Date',
    'Accepted Date',
    'Line Items Count',
    'Notes',
  ];

  const rows = quotes.map((quote) => [
    quote.quoteNumber,
    quote.customer?.contactName || '',
    quote.customer?.companyName || '',
    quote.customer?.email || '',
    quote.customer?.phone || '',
    quote.title,
    quote.status,
    quote.priority,
    quote.subtotal,
    quote.discountTotal,
    quote.taxTotal,
    quote.shippingTotal,
    quote.total,
    quote.terms?.currency || 'USD',
    quote.createdAt ? formatDate(quote.createdAt) : '',
    quote.expiresAt ? formatDate(quote.expiresAt) : '',
    quote.sentAt ? formatDate(quote.sentAt) : '',
    quote.viewedAt ? formatDate(quote.viewedAt) : '',
    quote.acceptedAt ? formatDate(quote.acceptedAt) : '',
    quote.lineItems?.length || 0,
    quote.terms?.notes || '',
  ]);

  const csvContent = [
    headers.map(escapeCSVField).join(','),
    ...rows.map((row) => row.map(escapeCSVField).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Generates a filename with timestamp
 * @param prefix - Filename prefix
 * @returns Generated filename
 */
function generateFilename(prefix: string = 'quotes'): string {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0];
  return `${prefix}_${timestamp}.csv`;
}

/**
 * Triggers a file download
 * @param content - File content
 * @param filename - Filename for download
 */
function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// ============================================================================
// Export Preview Modal Component
// ============================================================================

/**
 * Modal component showing CSV export preview
 */
const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  isOpen,
  onClose,
  previewData,
  onConfirm,
  filename,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-preview-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col"
      >
        <h2
          id="export-preview-title"
          className="text-xl font-semibold text-white mb-4"
        >
          Export Preview
        </h2>
        
        <p className="text-slate-400 mb-4">
          Preview of {previewData.length - 1} quotes to be exported
        </p>

        <div className="flex-1 overflow-auto border border-slate-800 rounded-lg mb-6">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 sticky top-0">
              <tr>
                {previewData[0]?.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-2 text-left text-slate-300 font-medium"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {previewData.slice(1, 6).map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-800/50">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2 text-slate-400 truncate max-w-xs">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {previewData.length > 6 && (
            <p className="px-4 py-2 text-slate-500 text-sm italic">
              ... and {previewData.length - 6} more rows
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Download {filename}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// Loading Skeleton Component
// ============================================================================

/**
 * Skeleton loader for CSV export button
 */
export const CSVExportButtonSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
}) => {
  const widthClasses = {
    sm: 'w-24',
    md: 'w-28',
    lg: 'w-32',
  };

  return (
    <Skeleton
      width={widthClasses[size]}
      height={size === 'lg' ? 44 : size === 'sm' ? 32 : 40}
      variant="rounded"
      className="rounded-lg"
    />
  );
};

// ============================================================================
// Main CSV Export Button Component
// ============================================================================

/**
 * CSV Export Button Component
 * 
 * Exports quotes to CSV format with support for:
 * - Date range filtering
 * - Status filtering
 * - Preview before download
 * - Loading states
 * - Error handling
 * 
 * @example
 * ```tsx
 * <CSVExportButton
 *   quotes={quotes}
 *   dateRange={{ from: new Date('2024-01-01'), to: new Date() }}
 *   filenamePrefix="january_quotes"
 *   showPreview={true}
 * />
 * ```
 */
export const CSVExportButton: React.FC<CSVExportButtonProps> = ({
  quotes,
  filters,
  dateRange,
  onExportStart,
  onExportComplete,
  onExportError,
  filenamePrefix = 'quotes',
  className,
  disabled = false,
  size = 'md',
  showPreview = false,
}) => {
  const [state, setState] = useState<CSVExportState>({
    isExporting: false,
    isPreviewOpen: false,
    error: null,
    progress: 0,
  });

  /**
   * Filters quotes based on provided filters and date range
   */
  const filterQuotes = useCallback((): Quote[] => {
    let filtered = [...quotes];

    // Apply status filter
    if (filters?.status && filters.status.length > 0) {
      filtered = filtered.filter((quote) =>
        filters.status?.includes(quote.status)
      );
    }

    // Apply customer filter
    if (filters?.customerId) {
      filtered = filtered.filter(
        (quote) => quote.customerId === filters.customerId
      );
    }

    // Apply date range filter
    if (dateRange?.from) {
      filtered = filtered.filter(
        (quote) => new Date(quote.createdAt) >= dateRange.from!
      );
    }
    if (dateRange?.to) {
      filtered = filtered.filter(
        (quote) => new Date(quote.createdAt) <= dateRange.to!
      );
    }

    // Apply value filters
    if (filters?.minValue !== undefined) {
      filtered = filtered.filter((quote) => quote.total >= filters.minValue!);
    }
    if (filters?.maxValue !== undefined) {
      filtered = filtered.filter((quote) => quote.total <= filters.maxValue!);
    }

    // Apply search query
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (quote) =>
          quote.quoteNumber.toLowerCase().includes(query) ||
          quote.customer?.companyName?.toLowerCase().includes(query) ||
          quote.customer?.contactName?.toLowerCase().includes(query) ||
          quote.title.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [quotes, filters, dateRange]);

  /**
   * Generates preview data for the modal
   */
  const generatePreviewData = useCallback((): string[][] => {
    const filtered = filterQuotes();
    const headers = [
      'Quote Number',
      'Customer',
      'Status',
      'Total',
      'Created Date',
    ];

    const rows = filtered.map((quote) => [
      quote.quoteNumber,
      quote.customer?.companyName || quote.customer?.contactName || 'N/A',
      quote.status,
      formatCurrency(quote.total, quote.terms?.currency),
      formatDate(quote.createdAt),
    ]);

    return [headers, ...rows];
  }, [filterQuotes]);

  /**
   * Handles the export process
   */
  const handleExport = useCallback(async () => {
    setState((prev) => ({ ...prev, isExporting: true, error: null, progress: 0 }));
    onExportStart?.();

    try {
      const filteredQuotes = filterQuotes();

      if (filteredQuotes.length === 0) {
        throw new Error('No quotes match the selected filters');
      }

      // Simulate progress for large datasets
      const totalSteps = 3;
      for (let i = 1; i <= totalSteps; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setState((prev) => ({ ...prev, progress: (i / totalSteps) * 100 }));
      }

      const csvContent = convertQuotesToCSV(filteredQuotes);
      const filename = generateFilename(filenamePrefix);

      if (showPreview) {
        setState((prev) => ({
          ...prev,
          isPreviewOpen: true,
          isExporting: false,
          progress: 100,
        }));
      } else {
        downloadFile(csvContent, filename);
        setState((prev) => ({ ...prev, isExporting: false, progress: 100 }));
        onExportComplete?.();
      }
    } catch (error) {
      const exportError = error instanceof Error ? error : new Error('Export failed');
      setState((prev) => ({ ...prev, error: exportError, isExporting: false }));
      onExportError?.(exportError);
    }
  }, [filterQuotes, filenamePrefix, showPreview, onExportStart, onExportComplete, onExportError]);

  /**
   * Confirms the export and downloads the file
   */
  const handleConfirmExport = useCallback(() => {
    const filteredQuotes = filterQuotes();
    const csvContent = convertQuotesToCSV(filteredQuotes);
    const filename = generateFilename(filenamePrefix);
    
    downloadFile(csvContent, filename);
    setState((prev) => ({ ...prev, isPreviewOpen: false }));
    onExportComplete?.();
  }, [filterQuotes, filenamePrefix, onExportComplete]);

  const filteredCount = filterQuotes().length;
  const isDisabled = disabled || state.isExporting || filteredCount === 0;

  return (
    <>
      <motion.div
        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      >
        <Button
          onClick={handleExport}
          disabled={isDisabled}
          size={size}
          className={cn(
            'relative overflow-hidden',
            state.isExporting && 'cursor-wait',
            className
          )}
          aria-label={`Export ${filteredCount} quotes to CSV`}
          aria-busy={state.isExporting}
          aria-describedby={state.error ? 'export-error' : undefined}
        >
          {/* Progress bar background */}
          {state.isExporting && (
            <motion.div
              className="absolute inset-0 bg-indigo-600/30"
              initial={{ width: 0 }}
              animate={{ width: `${state.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          )}

          <span className="relative flex items-center gap-2">
            {state.isExporting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export CSV
                {filteredCount > 0 && (
                  <span className="ml-1 text-xs opacity-70">({filteredCount})</span>
                )}
              </>
            )}
          </span>
        </Button>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {state.error && (
          <motion.p
            id="export-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-sm mt-2"
            role="alert"
          >
            {state.error.message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && state.isPreviewOpen && (
          <ExportPreviewModal
            isOpen={state.isPreviewOpen}
            onClose={() => setState((prev) => ({ ...prev, isPreviewOpen: false }))}
            previewData={generatePreviewData()}
            onConfirm={handleConfirmExport}
            filename={generateFilename(filenamePrefix)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CSVExportButton;
