/**
 * Export Library Tests
 * Tests for CSV, JSON, PDF export functions
 * @module lib/__tests__/export.test.ts
 */

import {
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
  escapeCSVField,
  CSVExportOptions,
  JSONExportOptions,
  PDFExportOptions,
  PDFTableColumn,
} from '@/lib/export';
import { Quote, QuoteStatus } from '@/types/quote';

// ============================================================================
// Mock Data
// ============================================================================

const mockQuotes: Quote[] = [
  {
    id: 'q1',
    quoteNumber: 'QT-2024-001',
    title: 'Office Supplies Quote',
    status: QuoteStatus.ACCEPTED,
    customer: {
      id: 'c1',
      email: 'john@example.com',
      companyName: 'Acme Corp',
      contactName: 'John Doe',
      customerSince: new Date('2023-01-01'),
      tags: [],
    },
    lineItems: [],
    subtotal: 1000,
    discountTotal: 100,
    taxTotal: 90,
    total: 990,
    terms: {
      currency: 'USD',
      paymentTerms: 'net30',
      deliveryTerms: 'standard',
      validityPeriod: 30,
      depositRequired: false,
    },
    metadata: {
      createdBy: 'user1',
      createdByName: 'Admin',
      source: 'web',
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    expiresAt: new Date('2024-02-15'),
  },
  {
    id: 'q2',
    quoteNumber: 'QT-2024-002',
    title: 'IT Equipment Quote',
    status: QuoteStatus.PENDING,
    customer: {
      id: 'c2',
      email: 'jane@company.com',
      companyName: 'Tech Solutions Inc',
      contactName: 'Jane Smith',
      customerSince: new Date('2023-06-01'),
      tags: [],
    },
    lineItems: [],
    subtotal: 5000,
    discountTotal: 500,
    taxTotal: 450,
    total: 4950,
    terms: {
      currency: 'USD',
      paymentTerms: 'net15',
      deliveryTerms: 'express',
      validityPeriod: 15,
      depositRequired: true,
    },
    metadata: {
      createdBy: 'user2',
      createdByName: 'Sales Rep',
      source: 'email',
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    expiresAt: new Date('2024-02-16'),
  },
  {
    id: 'q3',
    quoteNumber: 'QT-2024-003',
    title: 'Furniture Quote',
    status: QuoteStatus.DRAFT,
    customer: {
      id: 'c3',
      email: 'bob@business.org',
      companyName: 'Business Solutions LLC',
      contactName: 'Bob Wilson',
      customerSince: new Date('2024-01-01'),
      tags: [],
    },
    lineItems: [],
    subtotal: 2500,
    discountTotal: 0,
    taxTotal: 225,
    total: 2725,
    terms: {
      currency: 'USD',
      paymentTerms: 'net30',
      deliveryTerms: 'standard',
      validityPeriod: 30,
      depositRequired: false,
    },
    metadata: {
      createdBy: 'user1',
      createdByName: 'Admin',
      source: 'phone',
    },
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
    // No expiresAt
  },
];

// ============================================================================
// Mocks
// ============================================================================

const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

// ============================================================================
// Setup
// ============================================================================

describe('Export Library', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock URL methods
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document methods
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    // Mock anchor element
    const mockAnchor = {
      click: mockClick,
      set href(value: string) {},
      set download(value: string) {},
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================================
  // exportToCSV
  // ============================================================================

  describe('exportToCSV', () => {
    it('should export data to CSV format', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' },
      ];

      const result = exportToCSV(data);

      expect(result).toContain('name,age,city');
      expect(result).toContain('John,30,New York');
      expect(result).toContain('Jane,25,Los Angeles');
    });

    it('should use custom headers', () => {
      const data = [{ a: 1, b: 2 }];
      const options: CSVExportOptions = { headers: ['a'] };

      const result = exportToCSV(data, options);

      expect(result).toBe('a\n1');
    });

    it('should use custom delimiter', () => {
      const data = [{ name: 'John', age: 30 }];
      const options: CSVExportOptions = { delimiter: ';' };

      const result = exportToCSV(data, options);

      expect(result).toContain('name;age');
      expect(result).toContain('John;30');
    });

    it('should exclude headers when specified', () => {
      const data = [{ name: 'John', age: 30 }];
      const options: CSVExportOptions = { includeHeaders: false };

      const result = exportToCSV(data, options);

      expect(result).not.toContain('name,age');
      expect(result).toBe('John,30');
    });

    it('should handle empty data array', () => {
      const result = exportToCSV([]);

      expect(result).toBe('');
    });

    it('should handle empty data with custom headers', () => {
      const options: CSVExportOptions = { headers: ['col1', 'col2'] };
      const result = exportToCSV([], options);

      expect(result).toBe('col1,col2');
    });

    it('should handle null and undefined values', () => {
      const data = [
        { name: 'John', value: null, other: undefined },
      ];

      const result = exportToCSV(data);

      expect(result).toContain('name,value,other');
      expect(result).toContain('John,,');
    });

    it('should handle values with commas', () => {
      const data = [{ description: 'Item, with comma' }];

      const result = exportToCSV(data);

      expect(result).toContain('"Item, with comma"');
    });

    it('should handle values with quotes', () => {
      const data = [{ description: 'Item with "quotes"' }];

      const result = exportToCSV(data);

      expect(result).toContain('"Item with ""quotes"""');
    });

    it('should handle values with newlines', () => {
      const data = [{ description: 'Line 1\nLine 2' }];

      const result = exportToCSV(data);

      expect(result).toContain('"Line 1\nLine 2"');
    });

    it('should handle numeric values', () => {
      const data = [{ int: 42, float: 3.14, negative: -10 }];

      const result = exportToCSV(data);

      expect(result).toContain('42,3.14,-10');
    });

    it('should handle boolean values', () => {
      const data = [{ active: true, deleted: false }];

      const result = exportToCSV(data);

      expect(result).toContain('true,false');
    });
  });

  // ============================================================================
  // exportQuotesToCSV
  // ============================================================================

  describe('exportQuotesToCSV', () => {
    it('should export quotes to CSV', () => {
      const result = exportQuotesToCSV(mockQuotes);

      expect(result).toContain('Quote Number,Title,Customer');
      expect(result).toContain('QT-2024-001');
      expect(result).toContain('Office Supplies Quote');
      expect(result).toContain('Acme Corp');
    });

    it('should include all quote fields', () => {
      const result = exportQuotesToCSV(mockQuotes);

      expect(result).toContain('Status');
      expect(result).toContain('Subtotal');
      expect(result).toContain('Discount');
      expect(result).toContain('Tax');
      expect(result).toContain('Total');
      expect(result).toContain('Created At');
      expect(result).toContain('Expires At');
    });

    it('should format quote status labels', () => {
      const result = exportQuotesToCSV(mockQuotes);

      expect(result).toContain('Accepted');
      expect(result).toContain('Pending');
      expect(result).toContain('Draft');
    });

    it('should handle empty quotes array', () => {
      const result = exportQuotesToCSV([]);

      expect(result).toContain('Quote Number,Title,Customer');
      expect(result.split('\n')).toHaveLength(1);
    });

    it('should handle quote without expiresAt', () => {
      const result = exportQuotesToCSV([mockQuotes[2]]);

      const lines = result.split('\n');
      const dataLine = lines[1];
      expect(dataLine.endsWith(',')).toBe(true);
    });

    it('should format currency values as numbers', () => {
      const result = exportQuotesToCSV(mockQuotes);

      expect(result).toContain('1000');
      expect(result).toContain('990');
      expect(result).toContain('4950');
    });

    it('should format dates', () => {
      const result = exportQuotesToCSV(mockQuotes);

      // Should contain formatted dates
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  // ============================================================================
  // exportToJSON
  // ============================================================================

  describe('exportToJSON', () => {
    it('should export data to JSON format', () => {
      const data = { name: 'John', age: 30 };

      const result = exportToJSON(data);

      expect(JSON.parse(result)).toEqual(data);
    });

    it('should pretty print by default', () => {
      const data = { name: 'John' };

      const result = exportToJSON(data);

      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    it('should minify when pretty is false', () => {
      const data = { name: 'John', age: 30 };
      const options: JSONExportOptions = { pretty: false };

      const result = exportToJSON(data, options);

      expect(result).not.toContain('\n');
      expect(result).toBe('{"name":"John","age":30}');
    });

    it('should use custom replacer', () => {
      const data = { password: 'secret', name: 'John' };
      const options: JSONExportOptions = {
        replacer: (key, value) => (key === 'password' ? '[REDACTED]' : value),
      };

      const result = exportToJSON(data, options);

      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('secret');
    });

    it('should handle arrays', () => {
      const data = [{ id: 1 }, { id: 2 }];

      const result = exportToJSON(data);

      expect(JSON.parse(result)).toEqual(data);
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          profile: {
            name: 'John',
          },
        },
      };

      const result = exportToJSON(data);

      expect(JSON.parse(result)).toEqual(data);
    });

    it('should throw ExportError for circular references', () => {
      const data: Record<string, unknown> = { name: 'John' };
      data.self = data; // Circular reference

      expect(() => exportToJSON(data)).toThrow(ExportError);
    });

    it('should handle null values', () => {
      const data = { value: null };

      const result = exportToJSON(data);

      expect(JSON.parse(result)).toEqual(data);
    });

    it('should handle undefined values (stripped in JSON)', () => {
      const data = { value: undefined, other: 'test' };

      const result = exportToJSON(data);

      expect(JSON.parse(result)).toEqual({ other: 'test' });
    });
  });

  // ============================================================================
  // exportQuotesToJSON
  // ============================================================================

  describe('exportQuotesToJSON', () => {
    it('should export quotes to JSON', () => {
      const result = exportQuotesToJSON(mockQuotes);

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(3);
      expect(parsed[0].quoteNumber).toBe('QT-2024-001');
    });

    it('should pretty print JSON', () => {
      const result = exportQuotesToJSON(mockQuotes);

      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    it('should include all quote properties', () => {
      const result = exportQuotesToJSON(mockQuotes);

      const parsed = JSON.parse(result);
      expect(parsed[0]).toHaveProperty('id');
      expect(parsed[0]).toHaveProperty('quoteNumber');
      expect(parsed[0]).toHaveProperty('customer');
      expect(parsed[0]).toHaveProperty('total');
    });

    it('should handle empty array', () => {
      const result = exportQuotesToJSON([]);

      expect(JSON.parse(result)).toEqual([]);
    });

    it('should serialize dates as ISO strings', () => {
      const result = exportQuotesToJSON(mockQuotes);

      expect(result).toContain('2024-01-15');
    });
  });

  // ============================================================================
  // generatePDFContent
  // ============================================================================

  describe('generatePDFContent', () => {
    it('should generate HTML content', () => {
      const data = [{ name: 'John', age: 30 }];
      const columns: PDFTableColumn[] = [
        { header: 'Name', accessor: 'name' },
        { header: 'Age', accessor: 'age' },
      ];

      const result = generatePDFContent('Test Report', data, columns);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('Test Report');
      expect(result).toContain('Name');
      expect(result).toContain('Age');
    });

    it('should include table data', () => {
      const data = [{ name: 'John', age: 30 }];
      const columns: PDFTableColumn[] = [
        { header: 'Name', accessor: 'name' },
        { header: 'Age', accessor: 'age' },
      ];

      const result = generatePDFContent('Report', data, columns);

      expect(result).toContain('John');
      expect(result).toContain('30');
    });

    it('should handle column alignment', () => {
      const data = [{ value: 100 }];
      const columns: PDFTableColumn[] = [
        { header: 'Value', accessor: 'value', align: 'right' },
      ];

      const result = generatePDFContent('Report', data, columns);

      expect(result).toContain('text-align: right');
    });

    it('should handle empty data', () => {
      const columns: PDFTableColumn[] = [
        { header: 'Name', accessor: 'name' },
      ];

      const result = generatePDFContent('Report', [], columns);

      expect(result).toContain('Name');
      expect(result).toContain('</tbody>');
    });

    it('should escape HTML in title', () => {
      const data: Record<string, unknown>[] = [];
      const columns: PDFTableColumn[] = [];

      const result = generatePDFContent('<script>alert("xss")</script>', data, columns);

      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should handle null values in data', () => {
      const data = [{ name: 'John', value: null }];
      const columns: PDFTableColumn[] = [
        { header: 'Name', accessor: 'name' },
        { header: 'Value', accessor: 'value' },
      ];

      const result = generatePDFContent('Report', data, columns);

      expect(result).toContain('John');
    });

    it('should include CSS styles', () => {
      const data: Record<string, unknown>[] = [];
      const columns: PDFTableColumn[] = [];

      const result = generatePDFContent('Report', data, columns);

      expect(result).toContain('<style>');
      expect(result).toContain('font-family');
    });
  });

  // ============================================================================
  // exportQuotesToPDF
  // ============================================================================

  describe('exportQuotesToPDF', () => {
    it('should generate PDF content for quotes', () => {
      const result = exportQuotesToPDF(mockQuotes);

      expect(result).toContain('Quotes Report');
      expect(result).toContain('QT-2024-001');
      expect(result).toContain('Acme Corp');
    });

    it('should format total as currency', () => {
      const result = exportQuotesToPDF(mockQuotes);

      expect(result).toContain('$');
    });

    it('should handle empty quotes array', () => {
      const result = exportQuotesToPDF([]);

      expect(result).toContain('Quotes Report');
    });

    it('should use status labels', () => {
      const result = exportQuotesToPDF(mockQuotes);

      expect(result).toContain('Accepted');
      expect(result).toContain('Pending');
      expect(result).toContain('Draft');
    });

    it('should show N/A for missing customer', () => {
      const quoteWithoutCustomer = {
        ...mockQuotes[0],
        customer: { ...mockQuotes[0].customer, companyName: '' },
      };

      const result = exportQuotesToPDF([quoteWithoutCustomer]);

      expect(result).toContain('N/A');
    });
  });

  // ============================================================================
  // downloadFile
  // ============================================================================

  describe('downloadFile', () => {
    it('should trigger file download', () => {
      downloadFile('content', 'test.txt', 'text/plain');

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should create blob with correct type', () => {
      const blobMock = jest.fn();
      global.Blob = blobMock as unknown as typeof Blob;

      downloadFile('content', 'test.csv', 'text/csv');

      expect(blobMock).toHaveBeenCalledWith(['content'], { type: 'text/csv' });
    });

    it('should throw ExportError when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing undefined window
      delete global.window;

      expect(() => downloadFile('content', 'test.txt', 'text/plain')).toThrow(ExportError);

      global.window = originalWindow;
    });

    it('should throw ExportError when document is undefined', () => {
      const originalDocument = global.document;
      // @ts-expect-error - Testing undefined document
      delete global.document;

      expect(() => downloadFile('content', 'test.txt', 'text/plain')).toThrow(ExportError);

      global.document = originalDocument;
    });

    it('should handle download errors', () => {
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Blob creation failed');
      });

      expect(() => downloadFile('content', 'test.txt', 'text/plain')).toThrow(ExportError);
    });
  });

  // ============================================================================
  // downloadCSV
  // ============================================================================

  describe('downloadCSV', () => {
    it('should download data as CSV file', () => {
      const data = [{ name: 'John', age: 30 }];

      downloadCSV(data, 'users.csv');

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('should use correct MIME type', () => {
      const blobMock = jest.fn();
      global.Blob = blobMock as unknown as typeof Blob;

      downloadCSV([{ test: 'value' }], 'test.csv');

      expect(blobMock).toHaveBeenCalledWith(
        expect.any(Array),
        { type: 'text/csv;charset=utf-8;' }
      );
    });
  });

  // ============================================================================
  // downloadJSON
  // ============================================================================

  describe('downloadJSON', () => {
    it('should download data as JSON file', () => {
      const data = { name: 'John', age: 30 };

      downloadJSON(data, 'user.json');

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('should use correct MIME type', () => {
      const blobMock = jest.fn();
      global.Blob = blobMock as unknown as typeof Blob;

      downloadJSON({ test: 'value' }, 'test.json');

      expect(blobMock).toHaveBeenCalledWith(
        expect.any(Array),
        { type: 'application/json;charset=utf-8;' }
      );
    });

    it('should pretty print JSON', () => {
      const data = { name: 'John' };

      downloadJSON(data, 'test.json');

      // The blob should contain pretty-printed JSON
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // validateExportData
  // ============================================================================

  describe('validateExportData', () => {
    it('should return valid for correct data', () => {
      const data = [{ id: '1', name: 'John' }];
      const result = validateExportData(data, ['id', 'name']);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for non-array data', () => {
      const result = validateExportData('not an array', ['id']);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Data must be an array');
    });

    it('should return invalid for empty array', () => {
      const result = validateExportData([], ['id']);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Data array is empty');
    });

    it('should detect missing required fields', () => {
      const data = [{ id: '1' }];
      const result = validateExportData(data, ['id', 'name']);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item at index 0 is missing required field: name');
    });

    it('should detect non-object items', () => {
      const data = ['not an object'];
      const result = validateExportData(data, ['id']);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item at index 0 is not an object');
    });

    it('should validate multiple items', () => {
      const data = [
        { id: '1', name: 'John' },
        { id: '2' }, // Missing name
      ];
      const result = validateExportData(data, ['id', 'name']);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should handle null values as present', () => {
      const data = [{ id: '1', name: null }];
      const result = validateExportData(data, ['id', 'name']);

      expect(result.valid).toBe(true);
    });

    it('should handle all items invalid', () => {
      const data = [{}, {}];
      const result = validateExportData(data, ['id']);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  // ============================================================================
  // ExportError
  // ============================================================================

  describe('ExportError', () => {
    it('should create error with message', () => {
      const error = new ExportError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ExportError');
    });

    it('should create error with cause', () => {
      const cause = new Error('Original error');
      const error = new ExportError('Test error', { cause });

      expect(error.message).toBe('Test error');
      expect((error as Error & { cause: Error }).cause).toBe(cause);
    });

    it('should be instance of Error', () => {
      const error = new ExportError('Test');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ExportError);
    });

    it('should work with throw', () => {
      expect(() => {
        throw new ExportError('Test error');
      }).toThrow(ExportError);
    });

    it('should be catchable as Error', () => {
      try {
        throw new ExportError('Test');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('should handle special characters in CSV fields', () => {
      const data = [{ text: 'Special: @#$%^\u0026*()' }];
      const result = exportToCSV(data);

      expect(result).toContain('Special: @#$%^\u0026*()');
    });

    it('should handle Unicode characters in CSV', () => {
      const data = [{ name: 'José', city: '北京' }];
      const result = exportToCSV(data);

      expect(result).toContain('José');
      expect(result).toContain('北京');
    });

    it('should handle very long values in CSV', () => {
      const longValue = 'a'.repeat(10000);
      const data = [{ value: longValue }];
      const result = exportToCSV(data);

      expect(result).toContain(longValue);
    });

    it('should handle deeply nested objects in JSON', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              level4: { value: 'deep' },
            },
          },
        },
      };

      const result = exportToJSON(data);

      expect(JSON.parse(result)).toEqual(data);
    });

    it('should handle arrays in JSON values', () => {
      const data = { items: [1, 2, 3], names: ['a', 'b', 'c'] };

      const result = exportToJSON(data);

      expect(JSON.parse(result)).toEqual(data);
    });

    it('should handle empty strings in CSV', () => {
      const data = [{ name: '', value: 'test' }];
      const result = exportToCSV(data);

      expect(result).toContain(',test');
    });

    it('should handle CRLF in CSV fields', () => {
      const data = [{ text: 'Line1\r\nLine2' }];
      const result = exportToCSV(data);

      expect(result).toContain('"Line1\r\nLine2"');
    });

    it('should handle tab characters in CSV fields', () => {
      const data = [{ text: 'Col1\tCol2' }];
      const result = exportToCSV(data);

      expect(result).toContain('Col1\tCol2');
    });
  });
});
