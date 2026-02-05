/**
 * Recent Quotes Component
 * Shows recent quote requests with status indicators
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowRightIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import type { Quote, QuoteStatus } from '@/types/quote';
import { QuoteStatusLabels, QuoteStatusColors } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

export interface RecentQuoteItem {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  company?: string;
  title: string;
  total: number;
  status: QuoteStatus;
  createdAt: string;
}

export interface RecentQuotesProps {
  quotes: RecentQuoteItem[];
  isLoading?: boolean;
  onViewQuote?: (quoteId: string) => void;
  onViewAll?: () => void;
  maxItems?: number;
}

// ============================================================================
// Status Badge Component
// ============================================================================

interface StatusBadgeProps {
  status: QuoteStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusIcon = (s: QuoteStatus) => {
    switch (s) {
      case 'draft':
        return DocumentTextIcon;
      case 'sent':
        return ArrowRightIcon;
      case 'viewed':
        return EyeIcon;
      case 'accepted':
        return CheckCircleIcon;
      case 'rejected':
        return XCircleIcon;
      case 'expired':
        return ClockIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const Icon = getStatusIcon(status);

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      QuoteStatusColors[status]
    )}>
      <Icon className="w-3.5 h-3.5" />
      {QuoteStatusLabels[status]}
    </span>
  );
};

// ============================================================================
// Quote Row Component
// ============================================================================

interface QuoteRowProps {
  quote: RecentQuoteItem;
  index: number;
  onViewQuote?: (quoteId: string) => void;
}

const QuoteRow = ({ quote, index, onViewQuote }: QuoteRowProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: 'easeOut'
      }}
      whileHover={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        transition: { duration: 0.15 }
      }}
      onClick={() => onViewQuote?.(quote.id)}
      className={cn(
        'group flex items-center gap-4 p-4 rounded-xl cursor-pointer',
        'border border-transparent hover:border-slate-800',
        'transition-all duration-200'
      )}
    >
      {/* Quote Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
        <DocumentTextIcon className="w-5 h-5 text-slate-400" />
      </div>

      {/* Quote Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            {quote.quoteNumber}
          </span>
          <StatusBadge status={quote.status} />
        </div>
        
        <p className="mt-1 font-medium text-slate-200 truncate">
          {quote.title}
        </p>
        
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
          <UserCircleIcon className="w-3.5 h-3.5" />
          <span className="truncate">{quote.customerName}</span>
          {quote.company && (
            <>
              <span className="text-slate-700">•</span>
              <BuildingOfficeIcon className="w-3.5 h-3.5" />
              <span className="truncate">{quote.company}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount & Date */}
      <div className="text-right">
        <p className="font-semibold text-slate-200">
          {formatCurrency(quote.total)}
        </p>
        <p className="text-sm text-slate-500">
          {formatDate(quote.createdAt)}
        </p>
      </div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="flex-shrink-0">
        <ArrowRightIcon className="w-5 h-5 text-indigo-400" />
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Empty State Component
// ============================================================================

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-12 text-center"
  >
    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
      <DocumentTextIcon className="w-8 h-8 text-slate-600" />
    </div>
    
    <h3 className="text-lg font-medium text-slate-300">No quotes yet</h3>
    <p className="mt-1 text-sm text-slate-500 max-w-xs">
      Quotes will appear here when customers submit quote requests through your store.
    </p>
  </motion.div>
);

// ============================================================================
// Skeleton Loader
// ============================================================================

const RecentQuotesSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <div 
        key={i}
        className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/30"
      >
        <div className="w-10 h-10 rounded-xl bg-slate-800 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-4 w-16 bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="h-5 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="text-right space-y-2">
          <div className="h-5 w-20 bg-slate-800 rounded animate-pulse ml-auto" />
          <div className="h-4 w-16 bg-slate-800 rounded animate-pulse ml-auto" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// Main Recent Quotes Component
// ============================================================================

export function RecentQuotes({
  quotes,
  isLoading = false,
  onViewQuote,
  onViewAll,
  maxItems = 5,
}: RecentQuotesProps) {
  const displayQuotes = quotes.slice(0, maxItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <h3 className="font-semibold text-slate-200">Recent Quotes</h3>
        
        {quotes.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewAll}
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRightIcon className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        {isLoading ? (
          <RecentQuotesSkeleton />
        ) : quotes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-1">
            {displayQuotes.map((quote, index) => (
              <QuoteRow
                key={quote.id}
                quote={quote}
                index={index}
                onViewQuote={onViewQuote}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default RecentQuotes;
