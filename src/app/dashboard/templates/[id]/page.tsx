/**
 * Template Edit Page
 * Edit existing email template with visual builder
 * @module app/dashboard/templates/[id]/page
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  VariableIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { type EmailTemplate, TemplateVariable, TemplateCategory, TemplateVariableLabels, TemplateVariableDescriptions } from '@/types/template';

// ============================================================================
// Mock Data
// ============================================================================

const mockTemplate: EmailTemplate = {
  id: 'tpl_001',
  name: 'Quote Sent Notification',
  subject: 'Your Quote {{quoteNumber}} from {{companyName}}',
  htmlContent: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 30px; text-align: center; }
    .content { background: white; padding: 40px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
    .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .quote-details { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Quote from {{companyName}}</h1>
    </div>
    <div class="content">
      <p>Hi {{customerName}},</p>
      <p>Thank you for your interest. Please find your quote details below:</p>
      
      <div class="quote-details">
        <h3>Quote #{{quoteNumber}}</h3>
        <p><strong>Amount:</strong> {{quoteTotal}}</p>
        <p><strong>Valid until:</strong> {{quoteExpiryDate}}</p>
      </div>
      
      <a href="{{quoteUrl}}" class="button">View Full Quote</a>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>{{senderName}}</p>
    </div>
    <div class="footer">
      <p>{{companyName}} | {{companyPhone}} | {{companyEmail}}</p>
    </div>
  </div>
</body>
</html>`,
  category: TemplateCategory.QUOTE,
  isDefault: true,
  description: 'Sent to customers when a new quote is created and sent',
  theme: {
    primaryColor: '#4f46e5',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#f8fafc',
    contentBackground: '#ffffff',
    textColor: '#0f172a',
    mutedTextColor: '#64748b',
    borderColor: '#e2e8f0',
    headerBackground: '#4f46e5',
    footerBackground: '#f1f5f9',
    linkColor: '#4f46e5',
    buttonTextColor: '#ffffff',
  },
  footerText: '{{companyName}} | {{companyPhone}} | {{companyEmail}}',
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-02-01T00:00:00.000Z',
  version: 1,
};

// Available template categories
const categories = [
  { id: TemplateCategory.QUOTE, name: 'Quotes', description: 'Quote-related emails' },
  { id: TemplateCategory.FOLLOW_UP, name: 'Follow-ups', description: 'Reminder and follow-up emails' },
  { id: TemplateCategory.REMINDER, name: 'Reminders', description: 'System notifications' },
  { id: TemplateCategory.GENERAL, name: 'General', description: 'General purpose emails' },
];

// ============================================================================
// Components
// ============================================================================

const VariablePill: React.FC<{
  variable: TemplateVariable;
  onInsert: (key: string) => void;
}> = ({ variable, onInsert }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onInsert(variable)}
    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm transition-colors"
    title={TemplateVariableDescriptions[variable]}
  >
    <VariableIcon className="w-3 h-3" />
    {variable}
  </motion.button>
);

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-indigo-500 text-white'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const FormField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-300">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-sm text-red-400">{error}</p>}
  </div>
);

// ============================================================================
// Main Page Component
// ============================================================================

export default function TemplateEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [template, setTemplate] = useState<EmailTemplate>(mockTemplate);
  const [activeTab, setActiveTab] = useState<'editor' | 'html' | 'preview'>('editor');
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: mockTemplate.name,
    subject: mockTemplate.subject,
    htmlContent: mockTemplate.htmlContent,
    category: mockTemplate.category,
    description: mockTemplate.description || '',
    isDefault: mockTemplate.isDefault,
  });

  // Preview data
  const [previewData, setPreviewData] = useState<Record<string, string>>({
    customerName: 'John Smith',
    quoteNumber: 'QT-2024-001',
    quoteTotal: '$14,605.00',
    quoteExpiryDate: 'March 15, 2024',
    quoteUrl: 'https://example.com/quote/QT-2024-001',
    companyName: 'QuoteGen Inc.',
    senderName: 'Jane Wilson',
    companyPhone: '+1 (555) 123-4567',
    companyEmail: 'quotes@quotegen.com',
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.htmlContent.trim()) {
      newErrors.htmlContent = 'Body content is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    router.push('/dashboard/templates');
  };

  const handleDuplicate = () => {
    router.push(`/dashboard/templates/new?duplicate=${params.id}`);
  };

  const insertVariable = (key: string) => {
    const variable = `{{${key}}}`;
    
    if (activeTab === 'html' || activeTab === 'editor') {
      const textarea = document.getElementById('template-body') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newBody = formData.htmlContent.substring(0, start) + variable + formData.htmlContent.substring(end);
        setFormData({ ...formData, htmlContent: newBody });
        
        // Restore cursor position after variable
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + variable.length, start + variable.length);
        }, 0);
      }
    }
  };

  const getProcessedHtml = (): string => {
    let html = formData.htmlContent;
    
    // Replace variables with preview data
    Object.values(TemplateVariable).forEach(variable => {
      const value = previewData[variable] || `[${variable}]`;
      html = html.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });
    
    return html;
  };

  const handleTestSend = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert('Test email sent successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-4"
        >
          <button
            onClick={() => router.push('/dashboard/templates')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Edit Template</h1>
            <p className="text-slate-400">{template.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTestSend}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all disabled:opacity-50"
          >
            <BeakerIcon className="w-5 h-5" />
            Test
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDuplicate}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all"
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
            Duplicate
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="w-5 h-5" />
                Save Changes
              </>
            )}
          </motion.button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg"
          >
            <CheckIcon className="w-5 h-5" />
            Template saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 text-amber-400 mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8" />
                  <h3 className="text-xl font-semibold text-slate-100">Delete Template?</h3>
                </div>
                <p className="text-slate-300 mb-6">
                  Are you sure you want to delete "{template.name}"? This action cannot be undone.
                  {template.isDefault && (
                    <span className="block mt-2 text-amber-400">
                      <strong>Warning:</strong> This is the default template for {template.category} emails.
                    </span>
                  )}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="xl:col-span-3 space-y-6"
        >
          {/* Template Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <FormField label="Template Name" required error={errors.name}>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="e.g., Quote Sent Notification"
                />
              </FormField>

              <FormField label="Category" required error={errors.category}>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TemplateCategory })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Subject Line" required error={errors.subject}>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="e.g., Your Quote {{quoteNumber}} from {{companyName}}"
                />
              </FormField>

              <FormField label="Description">
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="Brief description of when this template is used"
                />
              </FormField>
            </div>

            <div className="mt-4"
            >
              <label className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-slate-300">Set as default template for this category</span>
              </label>
            </div>
          </motion.div>

          {/* Editor Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="border-b border-slate-800 px-4 py-3"
            >
              <div className="flex items-center gap-2"
              >
                <TabButton
                  active={activeTab === 'editor'}
                  onClick={() => setActiveTab('editor')}
                  icon={DocumentTextIcon}
                  label="Visual Editor"
                />
                <TabButton
                  active={activeTab === 'html'}
                  onClick={() => setActiveTab('html')}
                  icon={CodeBracketIcon}
                  label="HTML"
                />
                <TabButton
                  active={activeTab === 'preview'}
                  onClick={() => setActiveTab('preview')}
                  icon={EyeIcon}
                  label="Preview"
                />
              </div>
            </div>

            <div className="p-6"
            >
              {activeTab === 'editor' && (
                <div className="space-y-4"
                >
                  <label className="block text-sm font-medium text-slate-300"
                  >
                    Email Body
                    {errors.htmlContent && <span className="text-red-400 ml-2">{errors.htmlContent}</span>}
                  </label>
                  <textarea
                    id="template-body"
                    value={formData.htmlContent}
                    onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                    rows={20}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                    placeholder="Enter HTML template content..."
                    spellCheck={false}
                  />
                </div>
              )}

              {activeTab === 'html' && (
                <div className="space-y-4"
                >
                  <label className="block text-sm font-medium text-slate-300"
                  >HTML Source</label>
                  <textarea
                    id="template-body-html"
                    value={formData.htmlContent}
                    onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                    rows={20}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                    spellCheck={false}
                  />
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="space-y-4"
                >
                  <div className="bg-white rounded-xl overflow-hidden"
                  >
                    <iframe
                      srcDoc={getProcessedHtml()}
                      className="w-full h-[500px]"
                      title="Email Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6"
        >
          {/* Variables */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4"
            >
              <VariableIcon className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-slate-200">Available Variables</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Click to insert into template</p>
            
            <div className="flex flex-wrap gap-2"
            >
              {Object.values(TemplateVariable).map((variable) => (
                <VariablePill
                  key={variable}
                  variable={variable}
                  onInsert={insertVariable}
                />
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800"
            >
              <p className="text-xs text-slate-500">
                <span className="text-amber-400">*</span> = Required variable
              </p>
            </div>
          </motion.div>

          {/* Preview Data */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4"
            >
              <h3 className="text-lg font-semibold text-slate-200">Preview Data</h3>
              <button
                onClick={() => setPreviewData({
                  customerName: 'John Smith',
                  quoteNumber: 'QT-2024-001',
                  quoteTotal: '$14,605.00',
                  quoteExpiryDate: 'March 15, 2024',
                  quoteUrl: 'https://example.com/quote/QT-2024-001',
                  companyName: 'QuoteGen Inc.',
                  senderName: 'Jane Wilson',
                  companyPhone: '+1 (555) 123-4567',
                  companyEmail: 'quotes@quotegen.com',
                })}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Reset
              </button>
            </div>

            <div className="space-y-3"
            >
              {Object.values(TemplateVariable).slice(0, 5).map((variable) => (
                <div key={variable}>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {TemplateVariableLabels[variable]}
                  </label>
                  <input
                    type="text"
                    value={previewData[variable] || ''}
                    onChange={(e) => setPreviewData({ ...previewData, [variable]: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Last Updated */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Template Info</h3>
            <div className="space-y-3 text-sm"
            >
              <div className="flex justify-between"
            >
                <span className="text-slate-400">Created</span>
                <span className="text-slate-200">{new Date(template.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between"
            >
                <span className="text-slate-400">Last Updated</span>
                <span className="text-slate-200">{new Date(template.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between"
            >
                <span className="text-slate-400">Template ID</span>
                <span className="text-slate-500 font-mono text-xs">{template.id}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
