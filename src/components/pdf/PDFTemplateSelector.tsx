/**
 * PDF Template Selector Component
 * Allows users to select from available PDF templates
 * @module components/pdf/PDFTemplateSelector
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import {
  pdfTemplateMetadata,
  type PDFTemplateType,
  type PDFTemplateMetadata as TemplateMetadataType,
} from './PDFTemplates';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for PDFTemplateSelector
 */
export interface PDFTemplateSelectorProps {
  /** Currently selected template */
  selectedTemplate: PDFTemplateType;
  /** Callback when template changes */
  onTemplateChange: (template: PDFTemplateType) => void;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Layout direction */
  layout?: 'horizontal' | 'vertical' | 'grid';
  /** Whether to show descriptions */
  showDescriptions?: boolean;
  /** Whether to show preview images (if available) */
  showPreviews?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Label for the selector */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
}

/**
 * Props for individual template card
 */
interface TemplateCardProps {
  template: TemplateMetadataType;
  isSelected: boolean;
  onSelect: () => void;
  size: 'sm' | 'md' | 'lg';
  showDescription: boolean;
  showPreview: boolean;
  disabled: boolean;
}

// ============================================================================
// Template Card Component
// ============================================================================

/**
 * Individual template card component
 */
const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  size,
  showDescription,
  showPreview,
  disabled,
}) => {
  const sizeClasses = {
    sm: {
      container: 'p-2',
      icon: 'w-6 h-6',
      title: 'text-xs',
      description: 'text-[10px]',
    },
    md: {
      container: 'p-3',
      icon: 'w-8 h-8',
      title: 'text-sm',
      description: 'text-xs',
    },
    lg: {
      container: 'p-4',
      icon: 'w-10 h-10',
      title: 'text-base',
      description: 'text-sm',
    },
  };

  const colors = {
    modern: 'from-indigo-500 to-purple-500',
    classic: 'from-blue-800 to-blue-600',
    minimal: 'from-neutral-700 to-neutral-500',
    professional: 'from-slate-800 to-slate-600',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'relative flex flex-col items-start text-left rounded-xl border-2 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900',
        sizeClasses[size].container,
        isSelected
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-pressed={isSelected}
      aria-label={`Select ${template.name} template`}
    >
      {/* Selection indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
          >
            <CheckIcon className="w-4 h-4 text-white" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Image / Icon */}
      {showPreview && template.previewImage ? (
        <div className="w-full aspect-video rounded-lg overflow-hidden mb-3 bg-slate-700">
          <img
            src={template.previewImage}
            alt={`${template.name} template preview`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className={cn(
            'rounded-lg bg-gradient-to-br p-3 mb-2',
            colors[template.id],
            size === 'sm' ? 'p-2' : size === 'lg' ? 'p-4' : 'p-3'
          )}
        >
          <DocumentTextIcon className={cn('text-white', sizeClasses[size].icon)} aria-hidden="true" />
        </div>
      )}

      {/* Template Name */}
      <span
        className={cn(
          'font-semibold text-slate-200',
          sizeClasses[size].title
        )}
      >
        {template.name}
      </span>

      {/* Description */}
      {showDescription && (
        <p
          className={cn(
            'text-slate-400 mt-1 line-clamp-2',
            sizeClasses[size].description
          )}
        >
          {template.description}
        </p>
      )}

      {/* Default badge */}
      {template.isDefault && (
        <span className="mt-2 px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
          Default
        </span>
      )}
    </motion.button>
  );
};

// ============================================================================
// Main Component
// ============================================================================

/**
 * PDF Template Selector Component
 * Provides a UI for selecting PDF templates with previews
 */
export const PDFTemplateSelector: React.FC<PDFTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
  className,
  size = 'md',
  layout = 'grid',
  showDescriptions = true,
  showPreviews = false,
  disabled = false,
  label = 'Select Template',
  helperText,
  error,
}) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<PDFTemplateType | null>(null);

  const handleSelect = useCallback(
    (templateId: PDFTemplateType) => {
      if (!disabled && templateId !== selectedTemplate) {
        onTemplateChange(templateId);
      }
    },
    [disabled, selectedTemplate, onTemplateChange]
  );

  const layoutClasses = {
    horizontal: 'flex flex-row gap-3 overflow-x-auto pb-2',
    vertical: 'flex flex-col gap-3',
    grid: 'grid grid-cols-2 sm:grid-cols-4 gap-3',
  };

  return (
    <div className={cn('space-y-2', className)} role="group" aria-label="PDF Template Selection">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}

      {/* Template Cards */}
      <div
        className={layoutClasses[layout]}
        role="radiogroup"
        aria-label="Available PDF templates"
      >
        {pdfTemplateMetadata.map((template) => (
          <div
            key={template.id}
            className={cn(
              layout === 'horizontal' && 'flex-shrink-0 w-40',
              layout === 'vertical' && 'w-full'
            )}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            <TemplateCard
              template={template}
              isSelected={selectedTemplate === template.id}
              onSelect={() => handleSelect(template.id)}
              size={size}
              showDescription={showDescriptions}
              showPreview={showPreviews}
              disabled={disabled}
            />
          </div>
        ))}
      </div>

      {/* Helper text or error */}
      {(helperText || error) && (
        <p
          className={cn(
            'text-sm',
            error ? 'text-red-400' : 'text-slate-500'
          )}
          id={error ? 'template-error' : 'template-helper'}
          role={error ? 'alert' : undefined}
        >
          {error || helperText}
        </p>
      )}

      {/* Live region for selection announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {hoveredTemplate && `${pdfTemplateMetadata.find(t => t.id === hoveredTemplate)?.name} template`}
      </div>
    </div>
  );
};

/**
 * Compact PDF Template Selector
 * Dropdown-style selector for space-constrained UIs
 */
export interface CompactTemplateSelectorProps {
  selectedTemplate: PDFTemplateType;
  onTemplateChange: (template: PDFTemplateType) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export const CompactTemplateSelector: React.FC<CompactTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
  className,
  disabled = false,
  label = 'Template',
}) => {
  const selectedMetadata = pdfTemplateMetadata.find(t => t.id === selectedTemplate);

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor="template-select" className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id="template-select"
          value={selectedTemplate}
          onChange={(e) => onTemplateChange(e.target.value as PDFTemplateType)}
          disabled={disabled}
          className={cn(
            'w-full appearance-none rounded-lg border bg-slate-800 px-4 py-2 pr-10 text-sm text-slate-200',
            'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
            disabled
              ? 'border-slate-700 opacity-50 cursor-not-allowed'
              : 'border-slate-700 hover:border-slate-600'
          )}
        >
          {pdfTemplateMetadata.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}{template.isDefault ? ' (Default)' : ''}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
          <svg
            className="h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {selectedMetadata && (
        <p className="text-xs text-slate-500">
          {selectedMetadata.description}
        </p>
      )}
    </div>
  );
};

/**
 * Template Preview Modal
 * Shows a larger preview of the selected template
 */
export interface TemplatePreviewModalProps {
  template: PDFTemplateType;
  isOpen: boolean;
  onClose: () => void;
  quote?: {
    quoteNumber: string;
    customerName: string;
  };
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  quote,
}) => {
  const templateMeta = pdfTemplateMetadata.find(t => t.id === template);

  if (!isOpen || !templateMeta) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-preview-title"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div>
              <h2 id="template-preview-title" className="text-lg font-semibold text-slate-200">
                {templateMeta.name} Template
              </h2>
              <p className="text-sm text-slate-500">{templateMeta.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close preview"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Preview Content */}
          <div className="p-6">
            {/* Sample document preview */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 pb-4 mb-6">
                  <div>
                    <div className="w-24 h-8 bg-gray-200 rounded" />
                  </div>
                  <div className="text-right text-xs text-gray-500 space-y-1">
                    <div className="w-32 h-3 bg-gray-200 rounded ml-auto" />
                    <div className="w-24 h-3 bg-gray-200 rounded ml-auto" />
                    <div className="w-28 h-3 bg-gray-200 rounded ml-auto" />
                  </div>
                </div>

                {/* Title */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">Quote</h1>
                  <p className="text-sm text-gray-500">
                    Quote #{quote?.quoteNumber || 'QT-001'} • Valid until Dec 31, 2026
                  </p>
                </div>

                {/* Customer */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Bill To</p>
                  <p className="text-sm text-gray-700">{quote?.customerName || 'Acme Corporation'}</p>
                  <p className="text-sm text-gray-500">John Doe</p>
                  <p className="text-sm text-gray-500">john@example.com</p>
                </div>

                {/* Table */}
                <table className="w-full mb-6">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-xs font-semibold text-gray-600">Item</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-600">Qty</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-600">Price</th>
                      <th className="text-right py-2 text-xs font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3">
                          <div className="w-24 h-3 bg-gray-200 rounded" />
                        </td>
                        <td className="py-3 text-right">
                          <div className="w-8 h-3 bg-gray-200 rounded ml-auto" />
                        </td>
                        <td className="py-3 text-right">
                          <div className="w-16 h-3 bg-gray-200 rounded ml-auto" />
                        </td>
                        <td className="py-3 text-right">
                          <div className="w-16 h-3 bg-gray-200 rounded ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-48 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-700">$1,000.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax</span>
                      <span className="text-gray-700">$100.00</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t pt-2">
                      <span>Total</span>
                      <span>$1,100.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// Exports
// ============================================================================

export default PDFTemplateSelector;
