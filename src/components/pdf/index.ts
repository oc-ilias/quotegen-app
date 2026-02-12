/**
 * PDF Components Index
 * Exports all PDF-related components and utilities
 * @module components/pdf
 */

// Main PDF Document Component
export {
  QuotePDFDocument,
  PDFDownloadButton,
  PDFPreview,
  PDFActions,
  PDFErrorBoundary,
  usePDFPrintStyles,
  type QuotePDFProps,
  type PDFDownloadButtonProps,
  type PDFPreviewProps,
  type PDFActionsProps,
  type CompanyBranding,
  type PDFGenerationOptions,
} from './QuotePDF';

// PDF Templates
export {
  // Template configurations
  modernTemplate,
  classicTemplate,
  minimalTemplate,
  professionalTemplate,
  // Template functions
  getPDFTemplate,
  getDefaultPDFTemplate,
  isValidPDFTemplate,
  getAllPDFTemplateMetadata,
  getPDFTemplateMetadata,
  // Color utilities
  hexToRGBA,
  lightenColor,
  darkenColor,
  // Types
  type PDFTemplateType,
  type PDFTemplateMetadata,
  type PDFThemeColors,
  type PDFTypography,
  type PDFSpacing,
  type PDFTemplateConfig,
} from './PDFTemplates';

// PDF Template Selector
export {
  PDFTemplateSelector,
  CompactTemplateSelector,
  TemplatePreviewModal,
  type PDFTemplateSelectorProps,
  type CompactTemplateSelectorProps,
  type TemplatePreviewModalProps,
} from './PDFTemplateSelector';

// Default exports
export { default } from './QuotePDF';
