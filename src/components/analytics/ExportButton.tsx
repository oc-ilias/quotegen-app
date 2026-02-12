/**
 * Export Button Component
 * Handles CSV and PDF export functionality with loading states
 * @module components/analytics/ExportButton
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

export type ExportFormat = 'csv' | 'pdf';

export interface ExportButtonProps {
  onExport: (format: ExportFormat) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  formats?: ExportFormat[];
  labels?: Record<ExportFormat, string>;
  loadingLabels?: Record<ExportFormat, string>;
}

interface ExportOption {
  value: ExportFormat;
  label: string;
  icon: React.ElementType;
  description: string;
}

// ============================================================================
// CSV Export Utility
// ============================================================================

/**
 * Convert data to CSV format
 */
export function exportToCSV(
  data: Record<string, string | number | boolean | null | undefined>[],
  filename: string,
  options?: {
    headers?: Record<string, string>;
    excludeColumns?: string[];
  }
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = options?.headers || {};
  const excludeColumns = options?.excludeColumns || [];

  // Get all unique keys from data
  const allKeys = Array.from(
    new Set(data.flatMap((row) => Object.keys(row)))
  ).filter((key) => !excludeColumns.includes(key));

  // Create CSV header row
  const headerRow = allKeys.map((key) => headers[key] || key).join(',');

  // Create data rows
  const rows = data.map((row) => {
    return allKeys
      .map((key) => {
        const value = row[key];
        // Handle values that might need escaping
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        // Escape values containing commas, quotes, or newlines
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',');
  });

  // Combine header and rows
  const csv = [headerRow, ...rows].join('\n');

  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// PDF Export Utility (simplified - uses print to PDF)
// ============================================================================

/**
 * Export element content to PDF using print dialog
 * For more advanced PDF generation, use @react-pdf/renderer or html2canvas + jspdf
 */
export function exportToPDF(
  elementId: string,
  filename: string,
  options?: {
    title?: string;
    orientation?: 'portrait' | 'landscape';
  }
): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id "${elementId}" not found`);
    return;
  }

  // Create a print-friendly clone
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.warn('Popup blocked. Please allow popups to export PDF.');
    return;
  }

  const title = options?.title || filename;
  const orientation = options?.orientation || 'landscape';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @page {
          size: ${orientation === 'landscape' ? 'landscape' : 'portrait'};
          margin: 1cm;
        }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.5;
          color: #1e293b;
          background: white;
        }
        .print-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
        }
        .print-header h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #0f172a;
        }
        .print-header p {
          margin: 0.5rem 0 0;
          color: #64748b;
          font-size: 0.875rem;
        }
        .print-content {
          padding: 1rem 0;
        }
        .print-footer {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 0.75rem;
          color: #94a3b8;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          font-weight: 600;
          background: #f8fafc;
          color: #475569;
        }
        tr:nth-child(even) {
          background: #f8fafc;
        }
        .metric {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          border-radius: 0.5rem;
          margin: 0.25rem;
        }
        .metric-value {
          font-weight: 700;
          color: #0f172a;
        }
        .metric-label {
          font-size: 0.75rem;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}</p>
      </div>
      <div class="print-content">
        ${element.innerHTML}
      </div>
      <div class="print-footer">
        <p>QuoteGen Analytics Report</p>
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    // Some browsers close the window after printing, others don't
    // printWindow.close();
  }, 250);
}

// ============================================================================
// Main Export Button Component
// ============================================================================

const DEFAULT_OPTIONS: ExportOption[] = [
  {
    value: 'csv',
    label: 'Export as CSV',
    icon: TableCellsIcon,
    description: 'Download data as spreadsheet',
  },
  {
    value: 'pdf',
    label: 'Export as PDF',
    icon: DocumentTextIcon,
    description: 'Generate printable report',
  },
];

export function ExportButton({
  onExport,
  disabled = false,
  className,
  formats = ['csv', 'pdf'],
  labels = { csv: 'Export CSV', pdf: 'Export PDF' },
  loadingLabels = { csv: 'Exporting...', pdf: 'Generating PDF...' },
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (isExporting) return;

      setIsExporting(format);
      setIsOpen(false);

      try {
        await onExport(format);
        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 2000);
      } catch (error) {
        console.error('Export failed:', error);
      } finally {
        setIsExporting(null);
      }
    },
    [isExporting, onExport]
  );

  const availableOptions = DEFAULT_OPTIONS.filter((opt) => formats.includes(opt.value));

  // Single format mode - no dropdown
  if (availableOptions.length === 1) {
    const option = availableOptions[0];
    const Icon = option.icon;
    const isLoading = isExporting === option.value;

    return (
      <motion.button
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        onClick={() => handleExport(option.value)}
        disabled={disabled || isLoading}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
          'border bg-slate-900/50',
          disabled || isLoading
            ? 'border-slate-800 text-slate-600 cursor-not-allowed'
            : justCompleted
              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
              : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
        )}
      >
        {justCompleted ? (
          <>
            <CheckIcon className="w-4 h-4" />
            <span>Done!</span>
          </>
        ) : isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
            <span>{loadingLabels[option.value]}</span>
          </>
        ) : (
          <>
            <Icon className="w-4 h-4" />
            <span>{labels[option.value]}</span>
          </>
        )}
      </motion.button>
    );
  }

  // Multi-format mode with dropdown
  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <motion.button
        whileHover={{ scale: disabled || isExporting ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isExporting ? 1 : 0.98 }}
        onClick={() => !disabled && !isExporting && setIsOpen(!isOpen)}
        disabled={disabled || !!isExporting}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
          'border bg-slate-900/50',
          disabled || isExporting
            ? 'border-slate-800 text-slate-600 cursor-not-allowed'
            : justCompleted
              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
              : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
        )}
      >
        {justCompleted ? (
          <>
            <CheckIcon className="w-4 h-4" />
            <span>Done!</span>
          </>
        ) : isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
            <span>{loadingLabels[isExporting]}</span>
          </>
        ) : (
          <>
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export</span>
            <ChevronDownIcon
              className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')}
            />
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && !disabled && !isExporting && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 sm:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
              role="listbox"
            >
              {availableOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleExport(option.value)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-slate-800"
                    role="option"
                  >
                    <div className="mt-0.5">
                      <Icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{option.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Simple CSV export button
 */
export function CSVExportButton({
  data,
  filename,
  disabled,
  className,
  options,
}: {
  data: Record<string, string | number | boolean | null | undefined>[];
  filename: string;
  disabled?: boolean;
  className?: string;
  options?: Parameters<typeof exportToCSV>[2];
}) {
  const handleExport = useCallback(() => {
    exportToCSV(data, filename, options);
  }, [data, filename, options]);

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleExport}
      disabled={disabled || data.length === 0}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
        'border bg-slate-900/50',
        disabled || data.length === 0
          ? 'border-slate-800 text-slate-600 cursor-not-allowed'
          : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
      )}
    >
      <TableCellsIcon className="w-4 h-4" />
      <span>Export CSV</span>
    </motion.button>
  );
}

export default ExportButton;
