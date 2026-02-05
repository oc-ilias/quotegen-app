/**
 * New Template Page
 * Create a new email template using the template builder
 * @module app/dashboard/templates/new/page
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EmailTemplateBuilder } from '@/components/templates/EmailTemplateBuilder';
import { EmailTemplate, TemplateCategory } from '@/types/template';

export default function NewTemplatePage() {
  const router = useRouter();

  const handleSave = (template: EmailTemplate) => {
    // In production, this would save the template to the database
    console.log('Template saved:', template);
    router.push('/dashboard/templates');
  };

  const handleCancel = () => {
    router.push('/dashboard/templates');
  };

  return (
    <div className="-mx-6 -my-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <EmailTemplateBuilder
          onSave={handleSave}
          onCancel={handleCancel}
          defaultCategory={TemplateCategory.QUOTE}
          showPresets={true}
        />
      </motion.div>
    </div>
  );
}
