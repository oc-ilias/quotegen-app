/**
 * Customer Quotes Component
 * Display customer's quote history
 * @module components/customers/CustomerQuotes
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { QuoteStatusLabels, QuoteStatusColors } from '@/types/quote';
import type { QuoteStatus } from '@/types/quote';

interface CustomerQuote {
  id: string;
  quoteNumber: string;
  title: string;
  status: QuoteStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface CustomerQuotesProps {
  quotes: CustomerQuote[];
  isLoading?: boolean;
  onViewQuote?: (quoteId: string) => void;
  onViewAll?: () => void;
}

export const CustomerQuotes: React.FC<CustomerQuotesProps> = ({
  quotes,
  isLoading = false,
  onViewQuote,
  onViewAll,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote History</CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={5} columns={4} />
        </CardContent>
      </Card>
    );
  }

  if (quotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote History</CardTitle>
          <CardDescription>No quotes have been created for this customer yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">Create your first quote for this customer</p>
            <Button variant="secondary">Create Quote</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Quote History</CardTitle>
          <CardDescription>{quotes.length} quotes created</CardDescription>
        </div>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {quotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onViewQuote?.(quote.id)}
              className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 cursor-pointer transition-colors group"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-slate-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-100">{quote.quoteNumber}</span>
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border',
                      QuoteStatusColors[quote.status]
                    )}
                  >
                    {QuoteStatusLabels[quote.status]}
                  </span>
                </div>
                <p className="text-sm text-slate-400 truncate">{quote.title}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true })}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-slate-100">
                  ${quote.total.toLocaleString()}
                </p>
              </div>

              <ArrowTopRightOnSquareIcon className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerQuotes;
