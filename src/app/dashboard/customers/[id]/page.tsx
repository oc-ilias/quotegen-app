/**
 * Customer Detail Page
 * View comprehensive customer information, quote history, and activity
 * @module app/dashboard/customers/[id]/page
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClockIcon,
  TagIcon,
  PlusIcon,
  ChevronRightIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockIconOutline,
  EllipsisHorizontalIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { type Customer, type Quote, QuoteStatus, QuoteStatusLabels, QuoteStatusColors } from '@/types/quote';

// ============================================================================
// Mock Data
// ============================================================================

const mockCustomer: Customer = {
  id: 'c1',
  email: 'john.smith@acmecorp.com',
  companyName: 'Acme Corporation',
  contactName: 'John Smith',
  phone: '+1 (555) 123-4567',
  billingAddress: {
    street: '123 Business Ave, Suite 100',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'USA',
  },
  shippingAddress: {
    street: '456 Industrial Blvd',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94607',
    country: 'USA',
  },
  taxId: '12-3456789',
  customerSince: new Date('2023-01-15'),
  tags: ['enterprise', 'manufacturing', 'priority'],
  notes: 'Key enterprise client. Prefers quarterly billing. Always negotiates for bulk discounts.',
};

const mockCustomerQuotes: Quote[] = [
  {
    id: 'qt_001',
    quoteNumber: 'QT-2024-001',
    customerId: 'c1',
    title: 'Industrial Equipment Quote - Q1 2024',
    status: QuoteStatus.ACCEPTED,
    lineItems: [],
    subtotal: 14000,
    discountTotal: 500,
    taxTotal: 1105,
    total: 14605,
    terms: { currency: 'USD' },
    createdAt: new Date('2024-01-15'),
    expiresAt: new Date('2024-02-15'),
    acceptedAt: new Date('2024-01-20'),
  },
  {
    id: 'qt_002',
    quoteNumber: 'QT-2024-015',
    customerId: 'c1',
    title: 'Maintenance Package Renewal',
    status: QuoteStatus.SENT,
    lineItems: [],
    subtotal: 8500,
    discountTotal: 0,
    taxTotal: 722.50,
    total: 9222.50,
    terms: { currency: 'USD' },
    createdAt: new Date('2024-02-01'),
    expiresAt: new Date('2024-03-01'),
    sentAt: new Date('2024-02-01'),
  },
  {
    id: 'qt_003',
    quoteNumber: 'QT-2024-023',
    customerId: 'c1',
    title: 'New Production Line Equipment',
    status: QuoteStatus.DRAFT,
    lineItems: [],
    subtotal: 45000,
    discountTotal: 2250,
    taxTotal: 3633.75,
    total: 46383.75,
    terms: { currency: 'USD' },
    createdAt: new Date('2024-02-05'),
    expiresAt: new Date('2024-03-05'),
  },
  {
    id: 'qt_004',
    quoteNumber: 'QT-2023-089',
    customerId: 'c1',
    title: 'Q4 Equipment Upgrade',
    status: QuoteStatus.EXPIRED,
    lineItems: [],
    subtotal: 22000,
    discountTotal: 1100,
    taxTotal: 1776.50,
    total: 22676.50,
    terms: { currency: 'USD' },
    createdAt: new Date('2023-10-15'),
    expiresAt: new Date('2023-11-15'),
  },
  {
    id: 'qt_005',
    quoteNumber: 'QT-2023-045',
    customerId: 'c1',
    title: 'Initial Setup Package',
    status: QuoteStatus.REJECTED,
    lineItems: [],
    subtotal: 15000,
    discountTotal: 0,
    taxTotal: 1275,
    total: 16275,
    terms: { currency: 'USD' },
    createdAt: new Date('2023-05-20'),
    expiresAt: new Date('2023-06-20'),
    rejectedAt: new Date('2023-06-01'),
  },
];

const mockActivity = [
  { id: 1, type: 'quote_accepted', description: 'Accepted QT-2024-001', date: new Date('2024-01-20'), amount: 14605 },
  { id: 2, type: 'quote_sent', description: 'Sent QT-2024-015', date: new Date('2024-02-01'), amount: 9222.50 },
  { id: 3, type: 'note_added', description: 'Added note: "Called to discuss payment terms"', date: new Date('2024-01-25') },
  { id: 4, type: 'quote_viewed', description: 'Viewed QT-2024-015', date: new Date('2024-02-02') },
  { id: 5, type: 'customer_created', description: 'Customer profile created', date: new Date('2023-01-15') },
];

// ============================================================================
// Components
// ============================================================================

const StatusBadge: React.FC<{ status: QuoteStatus }> = ({ status }) => {
  const colors: Record<QuoteStatus, string> = {
    [QuoteStatus.DRAFT]: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    [QuoteStatus.PENDING]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [QuoteStatus.SENT]: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    [QuoteStatus.VIEWED]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    [QuoteStatus.ACCEPTED]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    [QuoteStatus.REJECTED]: 'bg-red-500/10 text-red-400 border-red-500/20',
    [QuoteStatus.EXPIRED]: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    [QuoteStatus.CONVERTED]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {QuoteStatusLabels[status]}
    </span>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}> = ({ title, value, subtitle, icon: Icon, trend, trendValue }) => {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 ${trendColors[trend]}`}>
              <ArrowTrendingUpIcon className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
              <span className="text-sm">{trendValue}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-slate-800 rounded-xl">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </motion.div>
  );
};

const QuoteRow: React.FC<{
  quote: Quote;
  onClick: () => void;
}> = ({ quote, onClick }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <motion.tr
      whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}
      onClick={onClick}
      className="cursor-pointer transition-colors"
    >
      <td className="py-4 px-4">
        <div>
          <p className="font-medium text-slate-200">{quote.quoteNumber}</p>
          <p className="text-sm text-slate-500">{quote.title}</p>
        </div>
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={quote.status} />
      </td>
      <td className="py-4 px-4 text-right">
        <span className="font-medium text-slate-200">{formatCurrency(quote.total)}</span>
      </td>
      <td className="py-4 px-4 text-right text-slate-400">
        {quote.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td className="py-4 px-4 text-right">
        <ChevronRightIcon className="w-5 h-5 text-slate-500 inline-block" />
      </td>
    </motion.tr>
  );
};

const ActivityItem: React.FC<{
  activity: typeof mockActivity[0];
  isLast: boolean;
}> = ({ activity, isLast }) => {
  const icons: Record<string, React.ElementType> = {
    quote_accepted: CheckCircleIcon,
    quote_sent: EnvelopeIcon,
    quote_viewed: ClockIconOutline,
    note_added: DocumentTextIcon,
    customer_created: BuildingOfficeIcon,
  };

  const colors: Record<string, string> = {
    quote_accepted: 'bg-emerald-500/10 text-emerald-400',
    quote_sent: 'bg-indigo-500/10 text-indigo-400',
    quote_viewed: 'bg-purple-500/10 text-purple-400',
    note_added: 'bg-amber-500/10 text-amber-400',
    customer_created: 'bg-blue-500/10 text-blue-400',
  };

  const Icon = icons[activity.type] || DocumentTextIcon;

  return (
    <div className="relative flex gap-4">
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-800" />
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[activity.type] || 'bg-slate-800 text-slate-400'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 pb-6">
        <p className="text-slate-200">{activity.description}</p>
        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
          <span>
            {activity.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {activity.amount && (
            <>
              <span>•</span>
              <span className="text-emerald-400">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(activity.amount)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>(mockCustomer);
  const [quotes] = useState<Quote[]>(mockCustomerQuotes);
  const [activities] = useState(mockActivity);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'quotes' | 'activity'>('overview');

  // Calculate stats
  const stats = useMemo(() => {
    const totalQuotes = quotes.length;
    const acceptedQuotes = quotes.filter(q => q.status === QuoteStatus.ACCEPTED).length;
    const totalRevenue = quotes
      .filter(q => q.status === QuoteStatus.ACCEPTED)
      .reduce((sum, q) => sum + q.total, 0);
    const activeQuotes = quotes.filter(q => 
      [QuoteStatus.DRAFT, QuoteStatus.SENT, QuoteStatus.VIEWED].includes(q.status)
    ).length;
    const conversionRate = totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;

    return { totalQuotes, acceptedQuotes, totalRevenue, activeQuotes, conversionRate };
  }, [quotes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    router.push('/dashboard/customers');
  };

  const handleCreateQuote = () => {
    router.push(`/dashboard/quotes/new?customerId=${customer.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/customers')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {customer.contactName.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{customer.contactName}</h1>
              <p className="text-slate-400 flex items-center gap-2">
                <BuildingOfficeIcon className="w-4 h-4" />
                {customer.companyName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateQuote}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            Create Quote
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all"
          >
            <PencilIcon className="w-5 h-5" />
            Edit
          </motion.button>

          <div className="relative">
            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showDeleteConfirm && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDeleteConfirm(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50 p-4"
                  >
                    <p className="text-sm text-slate-300 mb-4">
                      Are you sure you want to delete this customer? This will also delete all associated quotes and cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-3 py-2 text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle={`From ${stats.acceptedQuotes} accepted quotes`}
          icon={ChartBarIcon}
          trend="up"
          trendValue="+12% this year"
        />
        <StatCard
          title="Active Quotes"
          value={stats.activeQuotes.toString()}
          subtitle="Currently in progress"
          icon={DocumentTextIcon}
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          subtitle={`${stats.acceptedQuotes} of ${stats.totalQuotes} quotes`}
          icon={ArrowTrendingUpIcon}
          trend={stats.conversionRate >= 50 ? 'up' : 'neutral'}
        />
        <StatCard
          title="Customer Since"
          value={customer.customerSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          subtitle={`${Math.floor((Date.now() - customer.customerSince.getTime()) / (1000 * 60 * 60 * 24 * 30))} months ago`}
          icon={CalendarIcon}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl"
          >
            <div className="border-b border-slate-800">
              <div className="flex">
                {(['overview', 'quotes', 'activity'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium capitalize transition-colors border-b-2 ${
                      activeTab === tab
                        ? 'text-indigo-400 border-indigo-400'
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <a
                        href={`mailto:${customer.email}`}
                        className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl text-slate-300 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                      >
                        <div className="p-2 bg-slate-800 rounded-lg">
                          <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Email</p>
                          <p className="font-medium">{customer.email}</p>
                        </div>
                      </a>

                      {customer.phone && (
                        <a
                          href={`tel:${customer.phone}`}
                          className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl text-slate-300 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        >
                          <div className="p-2 bg-slate-800 rounded-lg">
                            <PhoneIcon className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Phone</p>
                            <p className="font-medium">{customer.phone}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        Billing Address
                      </h4>
                      <div className="p-4 bg-slate-800/50 rounded-xl text-slate-300">
                        <p>{customer.billingAddress?.street}</p>
                        <p>
                          {customer.billingAddress?.city}, {customer.billingAddress?.state} {customer.billingAddress?.zipCode}
                        </p>
                        <p>{customer.billingAddress?.country}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        Shipping Address
                      </h4>
                      <div className="p-4 bg-slate-800/50 rounded-xl text-slate-300">
                        <p>{customer.shippingAddress?.street}</p>
                        <p>
                          {customer.shippingAddress?.city}, {customer.shippingAddress?.state} {customer.shippingAddress?.zipCode}
                        </p>
                        <p>{customer.shippingAddress?.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {customer.tags && customer.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                        <TagIcon className="w-4 h-4" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {customer.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {customer.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4" />
                        Notes
                      </h4>
                      <div className="p-4 bg-slate-800/50 rounded-xl">
                        <p className="text-slate-300 whitespace-pre-wrap">{customer.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Tax ID */}
                  {customer.taxId && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2">Tax ID</h4>
                      <p className="text-slate-300 font-mono">{customer.taxId}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'quotes' && (
                <div className="space-y-4">
                  {quotes.length === 0 ? (
                    <div className="text-center py-12">
                      <DocumentTextIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No quotes yet</p>
                      <button
                        onClick={handleCreateQuote}
                        className="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                      >
                        Create First Quote
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-800">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Quote</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Amount</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Created</th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {quotes.map((quote) => (
                            <QuoteRow
                              key={quote.id}
                              quote={quote}
                              onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      isLast={index === activities.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleCreateQuote}
                className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-colors text-left"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create New Quote</span>
              </button>
              <button
                onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-left"
              >
                <PencilIcon className="w-5 h-5" />
                <span>Edit Customer</span>
              </button>
              <a
                href={`mailto:${customer.email}`}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-left"
              >
                <EnvelopeIcon className="w-5 h-5" />
                <span>Send Email</span>
              </a>
            </div>
          </motion.div>

          {/* Quote Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Quote Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Quotes</span>
                <span className="text-slate-200 font-medium">{stats.totalQuotes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Accepted</span>
                <span className="text-emerald-400 font-medium">{stats.acceptedQuotes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pending</span>
                <span className="text-amber-400 font-medium">
                  {quotes.filter(q => q.status === QuoteStatus.PENDING).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Rejected</span>
                <span className="text-red-400 font-medium">
                  {quotes.filter(q => q.status === QuoteStatus.REJECTED).length}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Revenue</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(stats.totalRevenue)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
