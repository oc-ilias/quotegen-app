/**
 * Email Preview Modal Component
 * Full-featured email preview with device toggle, template selection, and test sending
 * @module components/wizard/EmailPreviewModal
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  EyeIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import { useEmailPreview, EMAIL_TEMPLATES, type EmailTemplate } from '@/hooks/useEmailPreview';
import type { QuoteFormData } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteData: QuoteFormData;
  shopName?: string;
  shopEmail?: string;
  onSendTest?: (email: string) => void;
}

// ============================================================================
// Animation Variants
// ============================================================================

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: [0.16, 1, 0.3, 1], // Custom easing for smooth entry
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' }
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { delay: 0.1, duration: 0.2 } 
  },
};

const deviceVariants = {
  desktop: { width: '100%', transition: { duration: 0.3, ease: 'easeInOut' } },
  mobile: { width: '375px', transition: { duration: 0.3, ease: 'easeInOut' } },
};

// ============================================================================
// Components
// ============================================================================

export function EmailPreviewModal({
  isOpen,
  onClose,
  quoteData,
  shopName = 'Your Shop',
  shopEmail = 'quotes@example.com',
}: EmailPreviewModalProps) {
  const {
    device,
    selectedTemplate,
    html,
    subject,
    senderName,
    senderEmail,
    isLoading,
    error,
    testEmailAddress,
    isSendingTest,
    sendTestError,
    sendTestSuccess,
    setDevice,
    setTemplate,
    setTestEmailAddress,
    refreshPreview,
    sendTestEmail,
    clearErrors,
  } = useEmailPreview(quoteData, { shopName, shopEmail });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = React.useState(false);

  // Update iframe content when HTML changes
  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Clear errors when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearErrors();
      setShowTemplateDropdown(false);
    }
  }, [isOpen, clearErrors]);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setTemplate(template);
    setShowTemplateDropdown(false);
  };

  const selectedTemplateInfo = EMAIL_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-6xl h-[90vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <EnvelopeIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">Email Preview</h2>
                    <p className="text-sm text-slate-500">Preview how your quote email will look</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Device Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
                  <button
                    onClick={() => setDevice('desktop')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      device === 'desktop'
                        ? 'bg-indigo-500 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ComputerDesktopIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    onClick={() => setDevice('mobile')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      device === 'mobile'
                        ? 'bg-indigo-500 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <DevicePhoneMobileIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Close preview"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-slate-800 bg-slate-900/30">
              {/* Template Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors"
                >
                  <SwatchIcon className="w-4 h-4" />
                  <span>{selectedTemplateInfo?.name || 'Template'}</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${showTemplateDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showTemplateDropdown && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-50 overflow-hidden"
                      >
                        {EMAIL_TEMPLATES.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template.id)}
                            className={`w-full text-left px-4 py-3 transition-colors ${
                              selectedTemplate === template.id
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-slate-500">{template.description}</div>
                          </button>
                        ))}
                      </motion.div>
                      {/* Click outside to close */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowTemplateDropdown(false)}
                      />
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Refresh Button */}
              <button
                onClick={refreshPreview}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Error Indicator */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Preview error</span>
                </div>
              )}
            </div>

            {/* Content Area */}
            <motion.div 
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 overflow-hidden flex"
            >
              {/* Preview Pane */}
              <div className="flex-1 bg-slate-950 overflow-auto p-8">
                <div className="flex justify-center min-h-full">
                  <motion.div
                    animate={device}
                    variants={deviceVariants}
                    className="bg-white rounded-lg shadow-2xl overflow-hidden"
                    style={{ maxWidth: '100%' }}
                  >
                    {isLoading ? (
                      <div className="w-full h-96 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-slate-500 text-sm">Generating preview...</p>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="w-full h-96 flex items-center justify-center p-8">
                        <div className="text-center">
                          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                          <p className="text-red-400 font-medium mb-2">Failed to generate preview</p>
                          <p className="text-slate-500 text-sm mb-4">{error}</p>
                          <button
                            onClick={refreshPreview}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    ) : html ? (
                      <iframe
                        ref={iframeRef}
                        title="Email Preview"
                        className="w-full h-full min-h-[600px] border-0"
                        sandbox="allow-same-origin"
                      />
                    ) : null}
                  </motion.div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-80 border-l border-slate-800 bg-slate-900/50 overflow-y-auto hidden lg:block">
                <div className="p-6 space-y-6">
                  {/* Email Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <EyeIcon className="w-4 h-4" />
                      Email Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-500 mb-1">From</label>
                        <div className="text-slate-200 text-sm">
                          <div className="font-medium">{senderName}</div>
                          <div className="text-slate-500">{senderEmail}</div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-500 mb-1">To</label>
                        <div className="text-slate-200 text-sm font-medium">
                          {quoteData.customer.name || quoteData.customer.email}
                        </div>
                        <div className="text-slate-500 text-sm">{quoteData.customer.email}</div>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-500 mb-1">Subject</label>
                        <div className="text-slate-200 text-sm font-medium truncate" title={subject}>
                          {subject}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800" />

                  {/* Send Test Email */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <PaperAirplaneIcon className="w-4 h-4" />
                      Send Test Email
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-slate-500 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          placeholder="test@example.com"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        />
                      </div>

                      {sendTestError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{sendTestError}</span>
                        </motion.div>
                      )}

                      {sendTestSuccess && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="flex items-start gap-2 text-emerald-400 text-sm bg-emerald-500/10 p-3 rounded-lg"
                        >
                          <CheckCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>Test email sent successfully!</span>
                        </motion.div>
                      )}

                      <button
                        onClick={sendTestEmail}
                        disabled={isSendingTest || !testEmailAddress}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
                      >
                        {isSendingTest ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <PaperAirplaneIcon className="w-4 h-4" />
                            Send Test Email
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-800" />

                  {/* Quote Summary */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
                      Quote Summary
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Items</span>
                        <span className="text-slate-300">{quoteData.line_items.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Customer</span>
                        <span className="text-slate-300 truncate max-w-[150px]">
                          {quoteData.customer.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Valid Until</span>
                        <span className="text-slate-300">
                          {quoteData.valid_until 
                            ? new Date(quoteData.valid_until).toLocaleDateString()
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mobile Sidebar (visible only on small screens) */}
            <div className="lg:hidden border-t border-slate-800 bg-slate-900/50 p-4">
              <div className="space-y-4">
                {/* Collapsible Email Details */}
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-slate-300">
                    <span className="flex items-center gap-2">
                      <EyeIcon className="w-4 h-4" />
                      Email Details
                    </span>
                    <ChevronDownIcon className="w-4 h-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subject:</span>
                      <span className="text-slate-300 truncate max-w-[200px]" title={subject}>{subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">To:</span>
                      <span className="text-slate-300 truncate max-w-[200px]">{quoteData.customer.email}</span>
                    </div>
                  </div>
                </details>

                {/* Test Email Input */}
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="Test email address"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button
                    onClick={sendTestEmail}
                    disabled={isSendingTest || !testEmailAddress}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {isSendingTest ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <PaperAirplaneIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {sendTestSuccess && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-emerald-400 text-sm text-center"
                  >
                    Test email sent!
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default EmailPreviewModal;
