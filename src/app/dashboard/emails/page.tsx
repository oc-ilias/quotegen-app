/**
 * Emails Page
 * Email history and tracking
 * @module app/dashboard/emails/page
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EmailHistory } from '@/components/email/EmailHistory';

// Mock data
const mockEmails = [
  {
    id: '1',
    quote_id: '1',
    quote_number: 'QT-2024-001',
    customer_email: 'john@acme.com',
    customer_name: 'John Smith',
    template_id: '1',
    template_name: 'Standard Quote Email',
    type: 'quote_sent' as const,
    status: 'opened' as const,
    subject: 'Your Quote QT-2024-001 from QuoteGen',
    sent_at: new Date(Date.now() - 86400000).toISOString(),
    opened_at: new Date(Date.now() - 85000000).toISOString(),
  },
  {
    id: '2',
    quote_id: '2',
    quote_number: 'QT-2024-002',
    customer_email: 'sarah@techflow.io',
    customer_name: 'Sarah Johnson',
    template_id: '1',
    template_name: 'Standard Quote Email',
    type: 'quote_sent' as const,
    status: 'delivered' as const,
    subject: 'Your Quote QT-2024-002 from QuoteGen',
    sent_at: new Date(Date.now() - 172800000).toISOString(),
    opened_at: null,
  },
  {
    id: '3',
    quote_id: '1',
    quote_number: 'QT-2024-001',
    customer_email: 'john@acme.com',
    customer_name: 'John Smith',
    template_id: '2',
    template_name: 'Quote Reminder',
    type: 'quote_reminder' as const,
    status: 'sent' as const,
    subject: 'Reminder: Quote QT-2024-001 Expires Soon',
    sent_at: new Date(Date.now() - 43200000).toISOString(),
    opened_at: null,
  },
  {
    id: '4',
    quote_id: '3',
    quote_number: 'QT-2024-003',
    customer_email: 'mike@buildcraft.com',
    customer_name: 'Mike Chen',
    template_id: '1',
    template_name: 'Standard Quote Email',
    type: 'quote_sent' as const,
    status: 'bounced' as const,
    subject: 'Your Quote QT-2024-003 from QuoteGen',
    sent_at: new Date(Date.now() - 259200000).toISOString(),
    opened_at: null,
  },
  {
    id: '5',
    quote_id: '2',
    quote_number: 'QT-2024-002',
    customer_email: 'sarah@techflow.io',
    customer_name: 'Sarah Johnson',
    template_id: '3',
    template_name: 'Quote Accepted',
    type: 'quote_accepted' as const,
    status: 'delivered' as const,
    subject: 'Quote Accepted - QT-2024-002',
    sent_at: new Date(Date.now() - 90000000).toISOString(),
    opened_at: new Date(Date.now() - 88000000).toISOString(),
  },
];

export default function EmailsPage() {
  const [emails, setEmails] = useState(mockEmails);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In production, this would fetch fresh data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleRetry = async (emailId: string) => {
    // In production, this would retry sending the email
    console.log('Retrying email:', emailId);
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
          <h1 className="text-2xl font-bold text-slate-100">Email History</h1>
          <p className="text-slate-400 mt-1">Track email delivery and engagement</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </motion.button>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Sent', value: emails.length, color: 'text-indigo-400' },
          {
            label: 'Delivered',
            value: emails.filter((e) => ['delivered', 'opened'].includes(e.status)).length,
            color: 'text-emerald-400',
          },
          {
            label: 'Opened',
            value: emails.filter((e) => e.status === 'opened').length,
            color: 'text-blue-400',
          },
          {
            label: 'Failed',
            value: emails.filter((e) => ['bounced', 'failed'].includes(e.status)).length,
            color: 'text-red-400',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Email History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <EmailHistory
          emails={emails}
          onRetry={handleRetry}
          isLoading={isRefreshing}
        />
      </motion.div>
    </div>
  );
}
