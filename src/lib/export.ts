/**
 * Export Utilities
 * CSV, JSON, and PDF export functions for quotes and data
 * @module lib/export
 */

import { Quote, QuoteStatusLabels } from '@/types/quote';

// ============================================================================
// CSV Export
// ============================================================================

export interface CSVExportOptions {
  headers?: string[];
  delimiter?: string;
  includeHeaders?: boolean;
}

/**
 * Escape CSV field value to handle commas, quotes, and newlines
 */
function escapeCSVField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  // Escape quotes by doubling them
  const escaped = stringValue.replace(/"/g, '""');
  
  // Wrap in quotes if contains comma, quote, or newline
  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }
  
  return escaped;
}

/**
 * Convert array of objects to CSV string
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  options: CSVExportOptions = {}
): string {
  const { 
    headers = data.length > 0 ? Object.keys(data[0]) : [],
    delimiter = ',',
    includeHeaders = true 
  } = options;

  if (data.length === 0) {
    return includeHeaders ? headers.join(delimiter) : '';
  }

  const rows: string[] = [];

  // Add headers
  if (includeHeaders) {
    rows.push(headers.join(delimiter));
  }

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      return escapeCSVField(value as string | number | boolean | null | undefined);
    });
    rows.push(values.join(delimiter));
  });

  return rows.join('\n');
}

/**
 * Export quotes to CSV format
 */
export function exportQuotesToCSV(quotes: Quote[]): string {
  const headers = [
    'Quote Number',
    'Title',
    'Customer',
    'Status',
    'Subtotal',
    'Discount',
    'Tax',
    'Total',
    'Created At',
    'Expires At',
  ];

  const rows = quotes.map((quote) => [
    quote.quoteNumber,
    quote.title,
    quote.customer?.companyName || '',
    QuoteStatusLabels[quote.status],
    quote.subtotal,
    quote.discountTotal,
    quote.taxTotal,
    quote.total,
    new Date(quote.createdAt).toLocaleDateString(),
    quote.expiresAt ? new Date(quote.expiresAt).toLocaleDateString() : '',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// ============================================================================
// JSON Export
// ============================================================================

export interface JSONExportOptions {
  pretty?: boolean;
  includeNullValues?: boolean;
  replacer?: (key: string, value: unknown) => unknown;
}

/**
 * Export data to JSON string
 */
export function exportToJSON<T>(
  data: T,
  options: JSONExportOptions = {}
): string {
  const { pretty = true, replacer } = options;

  try {
    return JSON.stringify(data, replacer as (key: string, value: unknown) => unknown, pretty ? 2 : undefined);
  } catch (error) {
    throw new ExportError('Failed to serialize data to JSON', { cause: error });
  }
}

/**
 * Export quotes to JSON format
 */
export function exportQuotesToJSON(quotes: Quote[]): string {
  return JSON.stringify(quotes, null, 2);
}

// ============================================================================
// PDF Export
// ============================================================================

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter' | 'legal';
}

export interface PDFTableColumn {
  header: string;
  accessor: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

/**
 * Generate PDF content as HTML string (for html2canvas + jspdf)
 */
export function generatePDFContent(
  title: string,
  data: Record<string, unknown>[],
  columns: PDFTableColumn[]
): string {
  const headerRow = columns
    .map((col) => `<th style="text-align: ${col.align || 'left'}; padding: 8px; border-bottom: 2px solid #333;">${col.header}</th>`)
    .join('');

  const bodyRows = data
    .map((row) => {
      const cells = columns
        .map((col) => {
          const value = row[col.accessor] ?? '';
          return `<td style="text-align: ${col.align || 'left'}; padding: 8px; border-bottom: 1px solid #ddd;">${value}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f5f5f5; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <table>
        <thead><tr>${headerRow}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </body>
    </html>
  `;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Export quotes to PDF format
 * Returns HTML content that can be converted to PDF using html2canvas + jspdf
 */
export function exportQuotesToPDF(quotes: Quote[]): string {
  const columns: PDFTableColumn[] = [
    { header: 'Quote #', accessor: 'quoteNumber', width: 100 },
    { header: 'Title', accessor: 'title', width: 200 },
    { header: 'Customer', accessor: 'customerName', width: 150 },
    { header: 'Status', accessor: 'status', width: 80 },
    { header: 'Total', accessor: 'total', width: 100, align: 'right' },
  ];

  const data = quotes.map((quote) => ({
    quoteNumber: quote.quoteNumber,
    title: quote.title,
    customerName: quote.customer?.companyName || 'N/A',
    status: QuoteStatusLabels[quote.status],
    total: formatCurrency(quote.total, quote.terms?.currency),
  }));

  return generatePDFContent('Quotes Report', data, columns);
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// ============================================================================
// File Download
// ============================================================================

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, type: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new ExportError('downloadFile can only be used in browser environment');
  }

  try {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new ExportError('Failed to download file', { cause: error });
  }
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: Record<string, unknown>[], filename: string): void {
  const csv = exportToCSV(data);
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Download data as JSON file
 */
export function downloadJSON<T>(data: T, filename: string): void {
  const json = exportToJSON(data);
  downloadFile(json, filename, 'application/json;charset=utf-8;');
}

// ============================================================================
// Custom Error
// ============================================================================

export class ExportError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'ExportError';
    if (options?.cause) {
      (this as Error & { cause: unknown }).cause = options.cause;
    }
  }
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate export data
 */
export function validateExportData<T>(
  data: T[],
  requiredFields: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { valid: false, errors };
  }

  if (data.length === 0) {
    errors.push('Data array is empty');
    return { valid: false, errors };
  }

  data.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Item at index ${index} is not an object`);
      return;
    }

    requiredFields.forEach((field) => {
      if (!(field in (item as Record<string, unknown>))) {
        errors.push(`Item at index ${index} is missing required field: ${field}`);
      }
    });
  });

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  exportToCSV,
  exportQuotesToCSV,
  exportToJSON,
  exportQuotesToJSON,
  generatePDFContent,
  exportQuotesToPDF,
  downloadFile,
  downloadCSV,
  downloadJSON,
  validateExportData,
  ExportError,
};
