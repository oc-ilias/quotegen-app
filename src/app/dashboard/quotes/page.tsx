/**
 * Quotes Page
 * List and manage all quotes
 * @module app/dashboard/quotes/page
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { QuoteStatus, QuotePriority, type Quote } from '@/types/quote';

// Mock data
const mockQuotes: Quote[] = [
  {
    id: '1',
    quoteNumber: 'QT-2024-001',
    customerId: 'c1',
    customer: {
      id: 'c1',
      contactName: 'John Smith',
      email: 'john@acme.com',
      companyName: 'Acme Corp',
      customerSince: new Date('2023-01-01'),
      tags: [],
    },
    title: 'Industrial Equipment Quote',
    total: 15000,
    status: QuoteStatus.ACCEPTED,
    priority: QuotePriority.MEDIUM,
    lineItems: [],
    subtotal: 14000,
    discountTotal: 500,
    taxTotal: 500,
    shippingTotal: 0,
    terms: {
      currency: 'USD',
      paymentTerms: 'net30',
      deliveryTerms: 'standard',
      validityPeriod: 30,
      depositRequired: false,
    },
    metadata: {
      createdBy: 'user1',
      createdByName: 'Admin',
      source: 'web',
    },
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    expiresAt: new Date(Date.now() + 7 * 86400000),
  },
  {
    id: '2',
    quoteNumber: 'QT-2024-002',
    customerId: 'c2',
    customer: {
      id: 'c2',
      contactName: 'Sarah Johnson',
      email: 'sarah@techflow.io',
      companyName: 'TechFlow Solutions',
      customerSince: new Date('2023-01-01'),
      tags: [],
    },
    title: 'Software Licensing Quote',
    total: 8500,
    status: QuoteStatus.SENT,
    priority: QuotePriority.MEDIUM,
    lineItems: [],
    subtotal: 8000,
    discountTotal: 0,
    taxTotal: 500,
    shippingTotal: 0,
    terms: {
      currency: 'USD',
      paymentTerms: 'net30',
      deliveryTerms: 'standard',
      validityPeriod: 30,
      depositRequired: false,
    },
    metadata: {
      createdBy: 'user1',
      createdByName: 'Admin',
      source: 'web',
    },
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
    expiresAt: new Date(Date.now() + 5 * 86400000),
  },
  {
    id: '3',
    quoteNumber: 'QT-2024-003',
    customerId: 'c3',
    customer: {
      id: 'c3',
      contactName: 'Mike Chen',
      email: 'mike@buildcraft.com',
      companyName: 'BuildCraft Inc',
      customerSince: new Date('2023-01-01'),
      tags: [],
    },
    title: 'Construction Materials',
    total: 23000,
    status: QuoteStatus.PENDING,
    priority: QuotePriority.HIGH,
    lineItems: [],
    subtotal: 21000,
    discountTotal: 500,
    taxTotal: 1500,
    shippingTotal: 0,
    terms: {
      currency: 'USD',
      paymentTerms: 'net30',
      deliveryTerms: 'standard',
      validityPeriod: 30,
      depositRequired: false,
    },
    metadata: {
      createdBy: 'user1',
      createdByName: 'Admin',
      source: 'web',
    },
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 259200000),
    expiresAt: new Date(Date.now() + 10 * 86400000),
  },
  {
    id: '4',
    quoteNumber: 'QT-2024-004',
    customerId: 'c4',
    customer: {
      id: 'c4',
      contactName: 'Emily Davis',
      email: 'emily@stellar.design',
      companyName: 'Stellar Design',
      customerSince: new Date('2023-01-01'),
      tags: [],
    },
    title: 'Design Services Package',
    total: 5200,
    status: QuoteStatus.VIEWED,
    priority: QuotePriority.LOW,
    lineItems: [],
    subtotal: 4800,
    discountTotal: 0,
    taxTotal: 400,
    shippingTotal: 0,
    terms: {
      currency: 'USD',
      paymentTerms: 'net30',
      deliveryTerms: 'standard',
      validityPeriod: 30,
      depositRequired: false,
    },
    metadata: {
      createdBy: 'user1',
      createdByName: 'Admin',
      source: 'web',
    },
    createdAt: new Date(Date.now() - 345600000),
    updatedAt: new Date(Date.now() - 345600000),
    expiresAt: new Date(Date.now() + 3 * 86400000),
  },
  {
    id: '5',
    quoteNumber: 'QT-2024-005',
    customerId: 'c5',
    customer: {
      id: 'c5',
      contactName: 'David Wilson',
      email: 'david@manufacture.co',
      companyName: 'ManufactureCo',
      customerSince: new Date('2023-01-01'),
      tags: [],
    },
    title: 'Raw Materials Order',
    total: 45000,
    status: QuoteStatus.EXPIRED,
    priority: QuotePriority.MEDIUM,
    lineItems: [],
    subtotal: 42000,
    discountTotal: 0,
    taxTotal: 3000,
    shippingTotal: 0,
    terms: {
      currency: 'USD',
      paymentTerms: 'net30',
      deliveryTerms: 'standard',
      validityPeriod: 30,
      depositRequired: false,
    },
    metadata: {
      createdBy: 'user1',
      createdByName: 'Admin',
      source: 'web',
    },
    createdAt: new Date(Date.now() - 432000000),
    updatedAt: new Date(Date.now() - 432000000),
    expiresAt: new Date(Date.now() - 86400000),
  },
];

const statusColors: Record<QuoteStatus, string> = {
  [QuoteStatus.DRAFT]: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  [QuoteStatus.PENDING]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  [QuoteStatus.SENT]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [QuoteStatus.VIEWED]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  [QuoteStatus.ACCEPTED]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  [QuoteStatus.REJECTED]: 'bg-red-500/10 text-red-400 border-red-500/20',
  [QuoteStatus.EXPIRED]: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  [QuoteStatus.CONVERTED]: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

export default function QuotesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredQuotes = useMemo(() => {
    return mockQuotes.filter((quote) => {
      const matchesSearch =
        searchQuery === '' ||
        quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.customer.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.customer.companyName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || quote.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleCreateQuote = () => {
    router.push('/dashboard/quotes/new');
  };

  const handleViewQuote = (id: string) => {
    router.push(`/dashboard/quotes/${id}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
          <h1 className="text-2xl font-bold text-slate-100">Quotes</h1>
          <p className="text-slate-400 mt-1">Manage and track all your B2B quotes</p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateQuote}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25"
          >
            <PlusIcon className="w-5 h-5" />
            New Quote
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search quotes, customers, or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | 'all')}
            className="appearance-none w-40 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            {Object.values(QuoteStatus).map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
        </div>
      </motion.div>

      {/* Quotes Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Quote #</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Title</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">Total</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Created</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Valid Until</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredQuotes.map((quote, index) => (
                <motion.tr
                  key={quote.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleViewQuote(quote.id)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className="font-mono text-sm text-indigo-400">{quote.quoteNumber}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-slate-200 font-medium">{quote.customer.contactName}</p>
                      {quote.customer.companyName && (
                        <p className="text-sm text-slate-500">{quote.customer.companyName}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-300">{quote.title}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-slate-200 font-medium">{formatCurrency(quote.total)}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[quote.status]}`}
                    >
                      {quote.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-400 text-sm">{quote.createdAt.toLocaleDateString()}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-400 text-sm">{quote.expiresAt?.toLocaleDateString()}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuotes.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-500">No quotes found matching your criteria</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
