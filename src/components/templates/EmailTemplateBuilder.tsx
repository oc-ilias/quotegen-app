/**
 * Email Template Builder Component
 * Visual template editor with live preview, theme customization, and variable support
 * @module components/templates/EmailTemplateBuilder
 */

'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  useEmailTemplates,
  builtInPresets,
} from '@/hooks/useEmailTemplates';
import {
  EmailTemplate,
  EmailTemplateBuilderProps,
  EditorTab,
  TemplateCategory,
  TemplateCategoryLabels,
  TemplateEditorState,
  TemplatePreviewData,
  TemplatePreset,
  TemplateTheme,
  TemplateValidationResult,
  TemplateVariable,
  TemplateVariableDescriptions,
  TemplateVariableLabels,
  defaultPreviewData,
  defaultDarkTheme,
} from '@/types/template';
import {
  PencilIcon,
  EyeIcon,
  SwatchIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  PlusIcon,
  CodeBracketIcon,
  VariableIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.3 },
  }),
};

const fadeVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// ============================================================================
// Color Picker Component
// ============================================================================

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  id?: string;
}

function ColorPicker({ label, color, onChange, id }: ColorPickerProps) {
  const inputId = id || `color-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={inputId} className="text-sm text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
          maxLength={7}
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Variable Picker Component
// ============================================================================

interface VariablePickerProps {
  onSelect: (variable: TemplateVariable) => void;
  disabled?: boolean;
}

function VariablePicker({ onSelect, disabled }: VariablePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const variables = Object.values(TemplateVariable);

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          disabled
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Insert variable"
      >
        <VariableIcon className="w-4 h-4" />
        Insert Variable
        <ChevronDownIcon className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full left-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-xl border border-slate-700 z-50 overflow-hidden"
              role="listbox"
              aria-label="Template variables"
            >
              <div className="p-3 border-b border-slate-700">
                <h4 className="text-sm font-medium text-white">Template Variables</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Click to insert into your template
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto p-2">
                {variables.map((variable) => (
                  <motion.button
                    key={variable}
                    onClick={() => {
                      onSelect(variable);
                      setIsOpen(false);
                    }}
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                    className="w-full text-left p-3 rounded-lg transition-colors group"
                    role="option"
                  >
                    <div className="flex items-center justify-between">
                      <code className="text-xs bg-slate-900 px-2 py-1 rounded text-indigo-400 font-mono">
                        {{{variable}}}
                      </code>
                      <PlusIcon className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-slate-300 mt-1">
                      {TemplateVariableLabels[variable]}
                    </p>
                    <p className="text-xs text-slate-500">
                      {TemplateVariableDescriptions[variable]}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Preset Selector Component
// ============================================================================

interface PresetSelectorProps {
  onSelect: (preset: TemplatePreset) => void;
  currentCategory?: TemplateCategory;
}

function PresetSelector({ onSelect, currentCategory }: PresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredPresets = useMemo(() => {
    if (!currentCategory) return builtInPresets;
    return builtInPresets.filter(p => p.category === currentCategory);
  }, [currentCategory]);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <BookmarkIcon className="w-4 h-4" />
        Load Preset
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full left-0 mt-2 w-96 bg-slate-800 rounded-xl shadow-xl border border-slate-700 z-50 overflow-hidden"
              role="listbox"
            >
              <div className="p-4 border-b border-slate-700">
                <h4 className="text-sm font-medium text-white">Template Presets</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Start with a pre-designed template
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {filteredPresets.map((preset) => (
                  <motion.button
                    key={preset.id}
                    onClick={() => {
                      onSelect(preset);
                      setIsOpen(false);
                    }}
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                    className="w-full text-left p-3 rounded-lg transition-colors"
                    role="option"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200">
                        {preset.name}
                      </span>
                      <span className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-400">
                        {TemplateCategoryLabels[preset.category]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{preset.description}</p>
                  </motion.button>
                ))}

                {filteredPresets.length === 0 && (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    No presets available for this category
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Validation Panel Component
// ============================================================================

interface ValidationPanelProps {
  validation: TemplateValidationResult;
  isVisible: boolean;
  onClose: () => void;
}

function ValidationPanel({ validation, isVisible, onClose }: ValidationPanelProps) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="border-t border-slate-700"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <>
                  <CheckIcon className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Valid</span>
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-medium text-red-400">Errors Found</span>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              aria-label="Close validation panel"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {validation.errors.length > 0 && (
            <div className="space-y-2 mb-3">
              {validation.errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <XMarkIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-400">{error.message}</p>
                    <p className="text-xs text-red-400/70">Field: {error.field}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-amber-400 uppercase tracking-wide">Warnings</p>
              {validation.warnings.map((warning, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                >
                  <InformationCircleIcon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-400">{warning.message}</p>
                    {warning.suggestion && (
                      <p className="text-xs text-amber-400/70">{warning.suggestion}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function EmailTemplateBuilder({
  initialTemplate,
  onSave,
  onCancel,
  onDelete,
  showPresets = true,
  defaultCategory = TemplateCategory.QUOTE,
}: EmailTemplateBuilderProps) {
  // Template operations
  const {
    createTemplate,
    updateTemplate,
    validateTemplate,
    generatePreview,
    templates,
    setDefaultTemplate,
  } = useEmailTemplates();

  // Local state
  const [template, setTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    description: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    theme: { ...defaultDarkTheme },
    footerText: '',
    isDefault: false,
    category: defaultCategory,
    logoUrl: '',
    headerText: '',
  });

  const [editorState, setEditorState] = useState<TemplateEditorState>({
    activeTab: 'content',
    isDirty: false,
    isSaving: false,
    showVariableMenu: false,
    selectedTextRange: null,
    previewData: { ...defaultPreviewData },
  });

  const [validation, setValidation] = useState<TemplateValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });

  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with initial template if provided
  useEffect(() => {
    if (initialTemplate) {
      setTemplate({ ...initialTemplate });
      setLogoPreview(initialTemplate.logoUrl || '');
    }
  }, [initialTemplate]);

  // Update preview when template changes
  useEffect(() => {
    const fullTemplate = template as EmailTemplate;
    if (fullTemplate.htmlContent && fullTemplate.theme) {
      const html = generatePreview(fullTemplate, editorState.previewData);
      setPreviewHtml(html);
    }
  }, [template, editorState.previewData, generatePreview]);

  // Validate on changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = validateTemplate(template);
      setValidation(result);
    }, 500);

    return () => clearTimeout(timer);
  }, [template, validateTemplate]);

  // Handle field changes
  const handleChange = useCallback(
    (field: keyof EmailTemplate, value: unknown) => {
      setTemplate((prev) => ({ ...prev, [field]: value }));
      setEditorState((prev) => ({ ...prev, isDirty: true }));
    },
    []
  );

  // Handle theme changes
  const handleThemeChange = useCallback(
    (field: keyof TemplateTheme, value: string) => {
      setTemplate((prev) => ({
        ...prev,
        theme: { ...prev.theme, [field]: value } as TemplateTheme,
      }));
      setEditorState((prev) => ({ ...prev, isDirty: true }));
    },
    []
  );

  // Insert variable at cursor position
  const handleInsertVariable = useCallback(
    (variable: TemplateVariable) => {
      const textarea = contentRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = template.htmlContent || '';
      const before = content.substring(0, start);
      const after = content.substring(end);
      const insertText = `{{${variable}}}`;

      const newContent = before + insertText + after;
      handleChange('htmlContent', newContent);

      // Restore cursor position after React updates
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + insertText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [template.htmlContent, handleChange]
  );

  // Load preset
  const handleLoadPreset = useCallback(
    (preset: TemplatePreset) => {
      setTemplate((prev) => ({
        ...prev,
        subject: preset.subject,
        htmlContent: preset.htmlContent,
        footerText: preset.footerText,
        theme: { ...prev.theme, ...preset.theme },
        category: preset.category,
      }));
      setEditorState((prev) => ({ ...prev, isDirty: true }));
    },
    []
  );

  // Handle logo upload
  const handleLogoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('Logo must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        handleChange('logoUrl', result);
      };
      reader.readAsDataURL(file);
    },
    [handleChange]
  );

  // Remove logo
  const handleRemoveLogo = useCallback(() => {
    setLogoPreview('');
    handleChange('logoUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleChange]);

  // Save template
  const handleSave = useCallback(async () => {
    if (!validation.isValid) {
      setShowValidationPanel(true);
      return;
    }

    setEditorState((prev) => ({ ...prev, isSaving: true }));

    try {
      let savedTemplate: EmailTemplate;

      if (initialTemplate?.id) {
        savedTemplate = await updateTemplate(initialTemplate.id, template);
      } else {
        savedTemplate = await createTemplate(template as Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>);
      }

      setEditorState((prev) => ({ ...prev, isDirty: false, isSaving: false }));
      onSave?.(savedTemplate);
    } catch (error) {
      setEditorState((prev) => ({ ...prev, isSaving: false }));
      console.error('Failed to save template:', error);
    }
  }, [validation.isValid, initialTemplate, template, updateTemplate, createTemplate, onSave]);

  // Delete template
  const handleDelete = useCallback(async () => {
    if (!initialTemplate?.id || !onDelete) return;

    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      try {
        await onDelete(initialTemplate.id);
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  }, [initialTemplate, onDelete]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset? All unsaved changes will be lost.')) {
      if (initialTemplate) {
        setTemplate({ ...initialTemplate });
        setLogoPreview(initialTemplate.logoUrl || '');
      } else {
        setTemplate({
          name: '',
          description: '',
          subject: '',
          htmlContent: '',
          textContent: '',
          theme: { ...defaultDarkTheme },
          footerText: '',
          isDefault: false,
          category: defaultCategory,
          logoUrl: '',
          headerText: '',
        });
        setLogoPreview('');
      }
      setEditorState((prev) => ({ ...prev, isDirty: false }));
    }
  }, [initialTemplate, defaultCategory]);

  // Tab navigation
  const tabs: { id: EditorTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'content', label: 'Content', icon: PencilIcon },
    { id: 'design', label: 'Design', icon: SwatchIcon },
    { id: 'preview', label: 'Preview', icon: EyeIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-white">
                {initialTemplate ? 'Edit Template' : 'New Template'}
              </h1>
              {editorState.isDirty && (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <PencilIcon className="w-3 h-3" />
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {showPresets && (
                <PresetSelector
                  onSelect={handleLoadPreset}
                  currentCategory={template.category}
                />
              )}

              <button
                onClick={() => setShowValidationPanel(!showValidationPanel)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  validation.isValid
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                )}
              >
                {validation.isValid ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Valid
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {validation.errors.length} Error
                    {validation.errors.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Reset
              </button>

              {initialTemplate && onDelete && (
                <motion.button
                  onClick={handleDelete}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </motion.button>
              )}

              <button
                onClick={onCancel}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>

              <motion.button
                onClick={handleSave}
                disabled={!validation.isValid || editorState.isSaving}
                whileHover={validation.isValid ? { scale: 1.02 } : {}}
                whileTap={validation.isValid ? { scale: 0.98 } : {}}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  validation.isValid
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                )}
              >
                {editorState.isSaving ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    {initialTemplate ? 'Update' : 'Create'}
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Validation Panel */}
          <ValidationPanel
            validation={validation}
            isVisible={showValidationPanel}
            onClose={() => setShowValidationPanel(false)}
          />
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = editorState.activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setEditorState((prev) => ({ ...prev, activeTab: tab.id }))
                  }
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
                    isActive
                      ? 'text-indigo-400'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={editorState.activeTab}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={editorState.activeTab === 'content' ? -1 : 1}
          >
            {editorState.activeTab === 'content' && (
              <ContentTab
                template={template}
                onChange={handleChange}
                onInsertVariable={handleInsertVariable}
                contentRef={contentRef}
              />
            )}

            {editorState.activeTab === 'design' && (
              <DesignTab
                template={template}
                onChange={handleChange}
                onThemeChange={handleThemeChange}
                logoPreview={logoPreview}
                onLogoUpload={handleLogoUpload}
                onRemoveLogo={handleRemoveLogo}
                fileInputRef={fileInputRef}
              />
            )}

            {editorState.activeTab === 'preview' && (
              <PreviewTab
                previewHtml={previewHtml}
                previewData={editorState.previewData}
                onPreviewDataChange={(data) =>
                  setEditorState((prev) => ({ ...prev, previewData: { ...prev.previewData, ...data } }))
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ============================================================================
// Content Tab Component
// ============================================================================

interface ContentTabProps {
  template: Partial<EmailTemplate>;
  onChange: (field: keyof EmailTemplate, value: unknown) => void;
  onInsertVariable: (variable: TemplateVariable) => void;
  contentRef: React.RefObject<HTMLTextAreaElement>;
}

function ContentTab({ template, onChange, onInsertVariable, contentRef }: ContentTabProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl space-y-6"
    >
      {/* Template Name */}
      <motion.div variants={itemVariants}>
        <label htmlFor="template-name" className="block text-sm font-medium text-slate-300 mb-2">
          Template Name *
        </label>
        <input
          id="template-name"
          type="text"
          value={template.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g., Standard Quote Email"
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          maxLength={100}
        />
      </motion.div>

      {/* Description */}
      <motion.div variants={itemVariants}>
        <label htmlFor="template-description" className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <input
          id="template-description"
          type="text"
          value={template.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Brief description of this template's purpose"
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          maxLength={200}
        />
      </motion.div>

      {/* Category */}
      <motion.div variants={itemVariants}>
        <label htmlFor="template-category" className="block text-sm font-medium text-slate-300 mb-2">
          Category
        </label>
        <select
          id="template-category"
          value={template.category || TemplateCategory.QUOTE}
          onChange={(e) => onChange('category', e.target.value as TemplateCategory)}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {Object.values(TemplateCategory).map((cat) => (
            <option key={cat} value={cat}>
              {TemplateCategoryLabels[cat]}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Subject Line */}
      <motion.div variants={itemVariants}>
        <label htmlFor="template-subject" className="block text-sm font-medium text-slate-300 mb-2">
          Subject Line *
        </label>
        <div className="relative">
          <input
            id="template-subject"
            type="text"
            value={template.subject || ''}
            onChange={(e) => onChange('subject', e.target.value)}
            placeholder="e.g., Your Quote {{quoteNumber}} from {{shopName}}"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-24"
            maxLength={200}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <VariablePicker onSelect={(v) => onChange('subject', (template.subject || '') + `{{${v}}}`)} />
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Tip: Use variables like {'{{quoteNumber}}'} to personalize the subject
        </p>
      </motion.div>

      {/* HTML Content */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="template-content" className="text-sm font-medium text-slate-300">
            Email Content *
          </label>
          <VariablePicker onSelect={onInsertVariable} />
        </div>
        <textarea
          ref={contentRef}
          id="template-content"
          value={template.htmlContent || ''}
          onChange={(e) => onChange('htmlContent', e.target.value)}
          placeholder="Enter your email HTML content here..."
          rows={20}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm resize-y"
          spellCheck={false}
        />
        <p className="mt-2 text-xs text-slate-500">
          Supports HTML formatting. Use the variable picker to insert dynamic content.
        </p>
      </motion.div>

      {/* Footer Text */}
      <motion.div variants={itemVariants}>
        <label htmlFor="template-footer" className="block text-sm font-medium text-slate-300 mb-2">
          Footer Text
        </label>
        <div className="relative">
          <textarea
            id="template-footer"
            value={template.footerText || ''}
            onChange={(e) => onChange('footerText', e.target.value)}
            placeholder="Footer text shown at the bottom of the email"
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-24"
          />
          <div className="absolute right-2 top-2">
            <VariablePicker onSelect={(v) => onChange('footerText', (template.footerText || '') + `{{${v}}}`)} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Design Tab Component
// ============================================================================

interface DesignTabProps {
  template: Partial<EmailTemplate>;
  onChange: (field: keyof EmailTemplate, value: unknown) => void;
  onThemeChange: (field: keyof TemplateTheme, value: string) => void;
  logoPreview: string;
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

function DesignTab({
  template,
  onChange,
  onThemeChange,
  logoPreview,
  onLogoUpload,
  onRemoveLogo,
  fileInputRef,
}: DesignTabProps) {
  const theme = template.theme || defaultDarkTheme;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {/* Logo Upload */}
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <h3 className="text-lg font-medium text-white mb-4">Header Logo</h3>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          {logoPreview ? (
            <div className="flex items-start gap-4">
              <div className="w-40 h-20 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Replace
                </button>
                
                <button
                  onClick={onRemoveLogo}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-slate-700/50 transition-colors"
            >
              <PhotoIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Click to upload logo</p>
              <p className="text-sm text-slate-500 mt-1">PNG, JPG or SVG (max 2MB)</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onLogoUpload}
            className="hidden"
            aria-label="Upload logo"
          />

          {/* Header Text (shown if no logo) */}
          {!logoPreview && (
            <div className="mt-4">
              <label htmlFor="header-text" className="block text-sm text-slate-400 mb-2">
                Or use text header
              </label>
              <input
                id="header-text"
                type="text"
                value={template.headerText || ''}
                onChange={(e) => onChange('headerText', e.target.value)}
                placeholder="Your Company Name"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Colors */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-medium text-white mb-4">Colors</h3>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
          <ColorPicker
            label="Primary Color"
            color={theme.primaryColor}
            onChange={(v) => onThemeChange('primaryColor', v)}
            id="primary-color"
          />
          
          <ColorPicker
            label="Secondary Color"
            color={theme.secondaryColor}
            onChange={(v) => onThemeChange('secondaryColor', v)}
            id="secondary-color"
          />
          
          <ColorPicker
            label="Background"
            color={theme.backgroundColor}
            onChange={(v) => onThemeChange('backgroundColor', v)}
            id="background-color"
          />
          
          <ColorPicker
            label="Content Background"
            color={theme.contentBackground}
            onChange={(v) => onThemeChange('contentBackground', v)}
            id="content-background"
          />
          
          <ColorPicker
            label="Text Color"
            color={theme.textColor}
            onChange={(v) => onThemeChange('textColor', v)}
            id="text-color"
          />
          
          <ColorPicker
            label="Muted Text"
            color={theme.mutedTextColor}
            onChange={(v) => onThemeChange('mutedTextColor', v)}
            id="muted-text-color"
          />
          
          <ColorPicker
            label="Link Color"
            color={theme.linkColor}
            onChange={(v) => onThemeChange('linkColor', v)}
            id="link-color"
          />
          
          <ColorPicker
            label="Border Color"
            color={theme.borderColor}
            onChange={(v) => onThemeChange('borderColor', v)}
            id="border-color"
          />
        </div>
      </motion.div>

      {/* Preview */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-medium text-white mb-4">Color Preview</h3>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div
            className="rounded-lg p-6 space-y-4"
            style={{ backgroundColor: theme.backgroundColor }}
          >
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: theme.headerBackground }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="h-10 object-contain"
                />
              ) : (
                <span style={{ color: theme.textColor }}>
                  {template.headerText || 'Header Text'}
                </span>
              )}
            </div>

            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: theme.contentBackground }}
            >
              <p style={{ color: theme.textColor }}>
                This is how your content will look
              </p>
              <p style={{ color: theme.mutedTextColor }}>
                Secondary text color
              </p>
              <a
                href="#"
                style={{ color: theme.linkColor }}
                className="inline-block mt-2"
              >
                Link example
              </a>
              <button
                className="block mt-3 px-4 py-2 rounded"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: theme.buttonTextColor,
                }}
              >
                Button
              </button>
            </div>

            <div
              className="rounded-lg p-4 text-center"
              style={{
                backgroundColor: theme.footerBackground,
                color: theme.mutedTextColor,
              }}
            >
              Footer text preview
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Preview Tab Component
// ============================================================================

interface PreviewTabProps {
  previewHtml: string;
  previewData: TemplatePreviewData;
  onPreviewDataChange: (data: Partial<TemplatePreviewData>) => void;
}

function PreviewTab({ previewHtml, previewData, onPreviewDataChange }: PreviewTabProps) {
  const [showDataPanel, setShowDataPanel] = useState(true);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Preview Data Panel */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'lg:col-span-1 space-y-4',
          !showDataPanel && 'hidden'
        )}
      >
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Preview Data</h3>
            <button
              onClick={() => setShowDataPanel(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(TemplateVariableLabels).map(([key, label]) => (
              <div key={key}>
                <label
                  htmlFor={`preview-${key}`}
                  className="block text-xs text-slate-400 mb-1"
                >
                  {label}
                </label>
                <input
                  id={`preview-${key}`}
                  type="text"
                  value={previewData[key as keyof TemplatePreviewData]}
                  onChange={(e) =>
                    onPreviewDataChange({ [key]: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => onPreviewDataChange(defaultPreviewData)}
            className="w-full mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </motion.div>

      {/* Preview Frame */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'bg-slate-800 rounded-xl border border-slate-700 overflow-hidden',
          showDataPanel ? 'lg:col-span-2' : 'lg:col-span-3'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h3 className="text-sm font-medium text-white">Email Preview</h3>
          
          <div className="flex items-center gap-2">
            {!showDataPanel && (
              <button
                onClick={() => setShowDataPanel(true)}
                className="hidden lg:flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm transition-colors"
              >
                <PencilIcon className="w-3 h-3" />
                Edit Data
              </button>
            )}
            <button
              onClick={() => {
                const blob = new Blob([previewHtml], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition-colors"
            >
              <EyeIcon className="w-3 h-3" />
              Open
            </button>
          </div>
        </div>

        <div className="h-[calc(100vh-300px)] min-h-[500px]">
          <iframe
            srcDoc={previewHtml}
            className="w-full h-full border-0"
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default EmailTemplateBuilder;
