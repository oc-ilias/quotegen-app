/**
 * PDF Template Definitions
 * Defines multiple PDF templates for Quote generation
 * @module components/pdf/PDFTemplates
 */

import type { StyleSheet } from '@react-pdf/renderer';

// ============================================================================
// Template Types
// ============================================================================

/**
 * Available PDF template types
 */
export type PDFTemplateType = 'modern' | 'classic' | 'minimal' | 'professional';

/**
 * Template metadata
 */
export interface PDFTemplateMetadata {
  id: PDFTemplateType;
  name: string;
  description: string;
  previewImage?: string;
  isDefault?: boolean;
}

/**
 * Color theme configuration
 */
export interface PDFThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

/**
 * Typography configuration
 */
export interface PDFTypography {
  fontFamily: string;
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

/**
 * Spacing configuration
 */
export interface PDFSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
}

/**
 * Complete template configuration
 */
export interface PDFTemplateConfig {
  type: PDFTemplateType;
  name: string;
  description: string;
  colors: PDFThemeColors;
  typography: PDFTypography;
  spacing: PDFSpacing;
  page: {
    padding: number;
    margin: number;
  };
  features: {
    showLogo: boolean;
    showHeader: boolean;
    showFooter: boolean;
    showWatermark: boolean;
    roundedCorners: boolean;
    zebraStripes: boolean;
    compactMode: boolean;
  };
}

// ============================================================================
// Default Colors
// ============================================================================

const defaultColors: PDFThemeColors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1e293b',
  textMuted: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

// ============================================================================
// Template Configurations
// ============================================================================

/**
 * Modern template - Clean, contemporary design with indigo accents
 */
export const modernTemplate: PDFTemplateConfig = {
  type: 'modern',
  name: 'Modern',
  description: 'Clean, contemporary design with smooth gradients and modern typography',
  colors: {
    ...defaultColors,
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
  },
  typography: {
    fontFamily: 'Helvetica',
    fontSize: {
      xs: 8,
      sm: 9,
      base: 10,
      lg: 11,
      xl: 12,
      '2xl': 16,
      '3xl': 24,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  },
  page: {
    padding: 40,
    margin: 30,
  },
  features: {
    showLogo: true,
    showHeader: true,
    showFooter: true,
    showWatermark: false,
    roundedCorners: true,
    zebraStripes: true,
    compactMode: false,
  },
};

/**
 * Classic template - Traditional business document styling
 */
export const classicTemplate: PDFTemplateConfig = {
  type: 'classic',
  name: 'Classic',
  description: 'Traditional business document with formal structure and serif accents',
  colors: {
    ...defaultColors,
    primary: '#1e3a5f',
    secondary: '#2c5282',
    accent: '#c53030',
    text: '#1a202c',
    textMuted: '#4a5568',
    border: '#cbd5e0',
  },
  typography: {
    fontFamily: 'Times-Roman',
    fontSize: {
      xs: 9,
      sm: 10,
      base: 11,
      lg: 12,
      xl: 14,
      '2xl': 18,
      '3xl': 28,
    },
    fontWeight: {
      normal: 400,
      medium: 400,
      semibold: 700,
      bold: 700,
    },
    lineHeight: {
      tight: 1.3,
      normal: 1.6,
      relaxed: 2,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 28,
    '2xl': 40,
    '3xl': 56,
  },
  page: {
    padding: 50,
    margin: 40,
  },
  features: {
    showLogo: true,
    showHeader: true,
    showFooter: true,
    showWatermark: false,
    roundedCorners: false,
    zebraStripes: false,
    compactMode: false,
  },
};

/**
 * Minimal template - Ultra-clean, whitespace-focused design
 */
export const minimalTemplate: PDFTemplateConfig = {
  type: 'minimal',
  name: 'Minimal',
  description: 'Ultra-clean design with maximum whitespace and subtle accents',
  colors: {
    ...defaultColors,
    primary: '#171717',
    secondary: '#404040',
    accent: '#525252',
    text: '#171717',
    textMuted: '#737373',
    border: '#e5e5e5',
    surface: '#fafafa',
  },
  typography: {
    fontFamily: 'Helvetica',
    fontSize: {
      xs: 8,
      sm: 9,
      base: 10,
      lg: 11,
      xl: 12,
      '2xl': 14,
      '3xl': 20,
    },
    fontWeight: {
      normal: 400,
      medium: 400,
      semibold: 500,
      bold: 600,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },
  spacing: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
    '2xl': 32,
    '3xl': 48,
  },
  page: {
    padding: 60,
    margin: 50,
  },
  features: {
    showLogo: true,
    showHeader: false,
    showFooter: true,
    showWatermark: false,
    roundedCorners: false,
    zebraStripes: false,
    compactMode: true,
  },
};

/**
 * Professional template - Bold, corporate styling
 */
export const professionalTemplate: PDFTemplateConfig = {
  type: 'professional',
  name: 'Professional',
  description: 'Bold corporate styling with strong visual hierarchy',
  colors: {
    ...defaultColors,
    primary: '#0f172a',
    secondary: '#334155',
    accent: '#0ea5e9',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#cbd5e1',
    surface: '#f1f5f9',
  },
  typography: {
    fontFamily: 'Helvetica-Bold',
    fontSize: {
      xs: 8,
      sm: 9,
      base: 10,
      lg: 11,
      xl: 13,
      '2xl': 16,
      '3xl': 26,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 800,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 36,
    '3xl': 52,
  },
  page: {
    padding: 45,
    margin: 35,
  },
  features: {
    showLogo: true,
    showHeader: true,
    showFooter: true,
    showWatermark: true,
    roundedCorners: true,
    zebraStripes: true,
    compactMode: false,
  },
};

// ============================================================================
// Template Registry
// ============================================================================

/**
 * All available templates
 */
export const pdfTemplates: Record<PDFTemplateType, PDFTemplateConfig> = {
  modern: modernTemplate,
  classic: classicTemplate,
  minimal: minimalTemplate,
  professional: professionalTemplate,
};

/**
 * Template metadata for selection UI
 */
export const pdfTemplateMetadata: PDFTemplateMetadata[] = [
  { id: 'modern', name: 'Modern', description: 'Clean, contemporary design with smooth gradients', isDefault: true },
  { id: 'classic', name: 'Classic', description: 'Traditional business document styling' },
  { id: 'minimal', name: 'Minimal', description: 'Ultra-clean with maximum whitespace' },
  { id: 'professional', name: 'Professional', description: 'Bold corporate styling' },
];

/**
 * Get template by type
 * @param type - Template type
 * @returns Template configuration
 */
export function getPDFTemplate(type: PDFTemplateType): PDFTemplateConfig {
  return pdfTemplates[type] ?? modernTemplate;
}

/**
 * Get default template
 * @returns Default template configuration
 */
export function getDefaultPDFTemplate(): PDFTemplateConfig {
  return modernTemplate;
}

/**
 * Check if template type is valid
 * @param type - Template type to check
 * @returns Whether the type is valid
 */
export function isValidPDFTemplate(type: string): type is PDFTemplateType {
  return type in pdfTemplates;
}

/**
 * Get all template metadata
 * @returns Array of template metadata
 */
export function getAllPDFTemplateMetadata(): PDFTemplateMetadata[] {
  return pdfTemplateMetadata;
}

/**
 * Get template metadata by type
 * @param type - Template type
 * @returns Template metadata or undefined
 */
export function getPDFTemplateMetadata(type: PDFTemplateType): PDFTemplateMetadata | undefined {
  return pdfTemplateMetadata.find(t => t.id === type);
}

// ============================================================================
// Style Generation Helpers
// ============================================================================

/**
 * Generate RGB color from hex with opacity
 * @param hex - Hex color code
 * @param opacity - Opacity value (0-1)
 * @returns RGBA color string
 */
export function hexToRGBA(hex: string, opacity: number = 1): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Lighten a hex color
 * @param hex - Hex color code
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened hex color
 */
export function lightenColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}

/**
 * Darken a hex color
 * @param hex - Hex color code
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color
 */
export function darkenColor(hex: string, percent: number): string {
  return lightenColor(hex, -percent);
}

// Default export
export default {
  modern: modernTemplate,
  classic: classicTemplate,
  minimal: minimalTemplate,
  professional: professionalTemplate,
  getTemplate: getPDFTemplate,
  getDefaultTemplate: getDefaultPDFTemplate,
  isValidTemplate: isValidPDFTemplate,
  getAllMetadata: getAllPDFTemplateMetadata,
  getMetadata: getPDFTemplateMetadata,
  hexToRGBA,
  lightenColor,
  darkenColor,
};
