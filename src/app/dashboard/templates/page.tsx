/**
 * Templates Page
 * Email template management
 * @module app/dashboard/templates/page
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { TemplateCategory, TemplateCategoryLabels } from '@/types/template';

// Mock data
interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  subject: string;
  isDefault: boolean;
  updatedAt: string;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Standard Quote Email',
    description: 'Default template for sending quotes to customers',
    category: TemplateCategory.QUOTE,
    subject: 'Your Quote {{quoteNumber}} from {{shopName}}',
    isDefault: true,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    name: 'Quote Reminder',
    description: 'Friendly reminder for expiring quotes',
    category: TemplateCategory.REMINDER,
    subject: 'Reminder: Quote {{quoteNumber}} Expires Soon',
    isDefault: true,
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '3',
    name: 'Quote Accepted',
    description: 'Confirmation email when a quote is accepted',
    category: TemplateCategory.ACCEPTED,
    subject: 'Quote Accepted - {{quoteNumber}}',
    isDefault: true,
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '4',
    name: 'Custom Branded Quote',
    description: 'Custom template with full branding options',
    category: TemplateCategory.QUOTE,
    subject: 'Your Personalized Quote from {{shopName}}',
    isDefault: false,
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');

  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || template.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = () => {
    router.push('/dashboard/templates/new');
  };

  const handleEditTemplate = (id: string) => {
    router.push(`/dashboard/templates/${id}`);
  };

  const handleDuplicateTemplate = (template: Template) => {
    // In production, this would duplicate the template
    alert(`Duplicating template: ${template.name}`);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      // In production, this would delete the template
      alert(`Deleted template: ${id}`);
    }
  };

  const handleSetDefault = (id: string) => {
    // In production, this would set the template as default
    alert(`Set template ${id} as default`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Email Templates</h1>
          <p className="text-slate-400 mt-1">Customize the emails sent to your customers</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateTemplate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25"
        >
          <PlusIcon className="w-5 h-5" />
          New Template
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as TemplateCategory | 'all')}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
        >
          <option value="all">All Categories</option>
          {Object.values(TemplateCategory).map((cat) => (
            <option key={cat} value={cat}>{TemplateCategoryLabels[cat]}</option>
          ))}
        </select>
      </motion.div>

      {/* Templates Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">{template.name}</h3>
                  <p className="text-sm text-slate-500">{TemplateCategoryLabels[template.category]}</p>
                </div>
              </div>

              {template.isDefault && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
                  <CheckIcon className="w-3 h-3" />
                  Default
                </span>
              )}
            </div>

            <p className="text-slate-400 text-sm mb-4">{template.description}</p>

            <div className="bg-slate-950 rounded-lg p-3 mb-4">
              <p className="text-xs text-slate-500 mb-1">Subject:</p>
              <p className="text-sm text-slate-300 truncate">{template.subject}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Updated {new Date(template.updatedAt).toLocaleDateString()}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditTemplate(template.id)}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDuplicateTemplate(template)}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Duplicate"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>

                {!template.isDefault && (
                  <>
                    <button
                      onClick={() => handleSetDefault(template.id)}
                      className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Set as Default"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
