/**
 * Email History Component
 * Displays sent emails with status tracking
 * @module components/email/EmailHistory
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

export interface EmailHistoryItem {
  id: string;
  quoteId: string;
  quoteNumber: string;
  type: 'quote_sent' | 'quote_reminder' | 'quote_accepted' | 'quote_declined' | 'follow_up';
  to: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'opened' | 'bounced' | 'failed';
  openedAt?: string;
  error?: string;
}

interface EmailHistoryProps {
  emails: EmailHistoryItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onRetry?: (emailId: string) => void;
  className?: string;
}

type StatusFilter = 'all' | 'sent' | 'delivered' | 'opened' | 'failed';
type TypeFilter = 'all' | 'quote_sent' | 'quote_reminder' | 'quote_accepted' | 'quote_declined';

// ============================================================================
// Status Configurations
// ============================================================================

const statusConfig = {
  sent: {
    label: 'Sent',
    icon: EnvelopeIcon,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircleIcon,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  opened: {
    label: 'Opened',
    icon: EyeIcon,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  bounced: {
    label: 'Bounced',
    icon: XCircleIcon,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  failed: {
    label: 'Failed',
    icon: XCircleIcon,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
};

const typeLabels: Record<string, string> = {
  quote_sent: 'Quote Sent',
  quote_reminder: 'Reminder',
  quote_accepted: 'Accepted Notification',
  quote_declined: 'Declined Notification',
  follow_up: 'Follow-up',
};

// ============================================================================
// Components
// ============================================================================

function EmailStatusBadge({ status }: { status: EmailHistoryItem['status'] }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.bgColor,
        config.color,
        config.borderColor
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

function EmailRow({
  email,
  onRetry,
  isExpanded,
  onToggle,
}: {
  email: EmailHistoryItem;
  onRetry?: (emailId: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <>
      <motion.tr
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer',
          isExpanded && 'bg-slate-800/30'
        )}
        onClick={onToggle}
      >
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              statusConfig[email.status].bgColor
            )}>
              <EnvelopeIcon className={cn('w-5 h-5', statusConfig[email.status].color)} />
            </div>
            <div>
              <p className="font-medium text-slate-200">{typeLabels[email.type] || email.type}</p>
              <p className="text-sm text-slate-500">Quote #{email.quoteNumber}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <p className="text-slate-300 truncate max-w-xs">{email.to}</p>
        </td>
        <td className="px-4 py-4">
          <EmailStatusBadge status={email.status} />
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ClockIcon className="w-4 h-4" />
            <span className="text-sm">{formatDate(email.sentAt)}</span>
          </div>
        </td>
        <td className="px-4 py-4">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-5 h-5 text-slate-400" />
          </motion.div>
        </td>
      </motion.tr>

      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/50"
          >
            <td colSpan={5} className="px-4 py-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Subject</p>
                  <p className="text-slate-300">{email.subject}</p>
                </div>

                {email.openedAt && (
                  <div className="flex items-center gap-2 text-emerald-400"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-sm">
                      Opened on {formatDate(email.openedAt)}
                    </span>
                  </div>
                )}

                {email.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{email.error}</p>
                  </div>
                )}

                {email.status === 'failed' && onRetry && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetry(email.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Retry Send
                  </button>
                )}
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function EmailHistory({
  emails,
  isLoading = false,
  onRefresh,
  onRetry,
  className,
}: EmailHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter emails
  const filteredEmails = emails.filter((email) => {
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    const matchesType = typeFilter === 'all' || email.type === typeFilter;
    const matchesSearch =
      searchQuery === '' ||
      email.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: emails.length,
    sent: emails.filter((e) => e.status === 'sent').length,
    delivered: emails.filter((e) => e.status === 'delivered').length,
    opened: emails.filter((e) => e.status === 'opened').length,
    failed: emails.filter((e) => e.status === 'failed').length,
    openRate: emails.length > 0
      ? Math.round((emails.filter((e) => e.status === 'opened').length / emails.length) * 100)
      : 0,
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-20 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent', value: stats.total, color: 'blue' },
          { label: 'Delivered', value: stats.delivered, color: 'emerald' },
          { label: 'Opened', value: stats.opened, color: 'purple' },
          { label: 'Open Rate', value: `${stats.openRate}%`, color: 'indigo' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'p-4 rounded-xl border bg-slate-900/50',
              stat.color === 'blue' && 'border-blue-500/20',
              stat.color === 'emerald' && 'border-emerald-500/20',
              stat.color === 'purple' && 'border-purple-500/20',
              stat.color === 'indigo' && 'border-indigo-500/20'
            )}
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p
              className={cn(
                'text-2xl font-bold mt-1',
                stat.color === 'blue' && 'text-blue-400',
                stat.color === 'emerald' && 'text-emerald-400',
                stat.color === 'purple' && 'text-purple-400',
                stat.color === 'indigo' && 'text-indigo-400'
              )}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">All Types</option>
            <option value="quote_sent">Quote Sent</option>
            <option value="quote_reminder">Reminder</option>
            <option value="quote_accepted">Accepted</option>
            <option value="quote_declined">Declined</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="opened">Opened</option>
            <option value="failed">Failed</option>
          </select>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Recipient</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Sent</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredEmails.length > 0 ? (
                filteredEmails.map((email) => (
                  <EmailRow
                    key={email.id}
                    email={email}
                    onRetry={onRetry}
                    isExpanded={expandedId === email.id}
                    onToggle={() =>
                      setExpandedId(expandedId === email.id ? null : email.id)
                    }
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <EnvelopeIcon className="w-6 h-6 text-slate-500" />
                      </div>
                      <p className="text-slate-500">No emails found</p>
                      <p className="text-sm text-slate-600">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmailHistory;
