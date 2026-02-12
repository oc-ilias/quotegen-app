/**
 * Templates Page
 * Manage quote templates
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  isDefault: boolean;
  lastUsed: string;
  usageCount: number;
  preview: string;
}

const mockTemplates: Template[] = [
  {
    id: 'tmpl_1',
    name: 'Standard B2B Quote',
    description: 'Professional template for B2B quotes with terms and conditions.',
    category: 'Standard',
    isDefault: true,
    lastUsed: '2026-02-03',
    usageCount: 45,
    preview: 'Standard',
  },
  {
    id: 'tmpl_2',
    name: 'Product Catalog',
    description: 'Showcase multiple products with images and descriptions.',
    category: 'Product',
    isDefault: false,
    lastUsed: '2026-02-01',
    usageCount: 23,
    preview: 'Catalog',
  },
  {
    id: 'tmpl_3',
    name: 'Service Quote',
    description: 'Ideal for service-based businesses with hourly rates.',
    category: 'Service',
    isDefault: false,
    lastUsed: '2026-01-28',
    usageCount: 18,
    preview: 'Service',
  },
  {
    id: 'tmpl_4',
    name: 'Subscription Quote',
    description: 'Recurring billing with subscription terms.',
    category: 'Subscription',
    isDefault: false,
    lastUsed: '2026-01-25',
    usageCount: 12,
    preview: 'Subscription',
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Standard', 'Product', 'Service', 'Subscription'];

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleSetDefault = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((t) => ({
        ...t,
        isDefault: t.id === templateId,
      }))
    );
  };

  const handleDelete = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  return (
    <DashboardLayout activeNavItem="templates">
      <PageHeader
        title="Quote Templates"
        subtitle="Create and manage reusable quote templates."
        actions={
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Template
          </Button>
        }
      />

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2 mb-8"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all
              ${selectedCategory === category
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
              }
            `}
          >
            {category === 'all' ? 'All Templates' : category}
          </button>
        ))}
      </motion.div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-200">
                      {template.name}
                    </h3>
                    {template.isDefault && (
                      <StarIconSolid className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <Badge variant="default">{template.category}</Badge>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSetDefault(template.id)}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${template.isDefault
                        ? 'text-amber-400 bg-amber-400/10'
                        : 'text-slate-500 hover:text-amber-400 hover:bg-amber-400/10'
                      }
                    `}
                    title={template.isDefault ? 'Default template' : 'Set as default'}
                  >
                    <StarIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                    title="Edit template"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete template"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <p className="text-slate-400 mb-4">{template.description}</p>

                {/* Preview Box */}
                <div className="flex-1 bg-slate-800 rounded-lg p-4 mb-4 border border-slate-700">
                  <div className="h-32 flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <DocumentDuplicateIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{template.preview} Template Preview</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-800">
                  <span>Used {template.usageCount} times</span>
                  <span>Last used {template.lastUsed}</span>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    Preview
                  </Button>
                  <Button size="sm" className="flex-1">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <DocumentDuplicateIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No templates found</h3>
          <p className="text-slate-500">Create your first template to get started.</p>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
