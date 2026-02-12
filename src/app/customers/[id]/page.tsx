/**
 * Customer Detail Page
 * Comprehensive customer profile with stats, quotes, and activity
 * @module app/customers/[id]/page
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  DocumentPlusIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { Customer, CustomerWithStats, CustomerActivity, Quote, CustomerStats } from '@/types/quote';
import { CustomerStatus, CustomerStatusLabels, CustomerStatusColors, QuoteStatus, QuoteStatusLabels, QuoteStatusColors, QuotePriority } from '@/types/quote';

// ============================================================================
// Mock Data (Replace with API calls)
// ============================================================================

const mockCustomer: Customer = {
  id: 'cust_1',
  email: 'john.smith@acmecorp.com',
  companyName: 'Acme Corporation',
  contactName: 'John Smith',
  phone: '+1 (555) 123-4567',
  billingAddress: {
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US',
  },
  shippingAddress: {
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US',
  },
  taxId: '12-3456789',
  customerSince: new Date('2023-01-15'),
  tags: ['enterprise', 'priority', 'manufacturing'],
  notes: 'Key enterprise account. Prefers Net 30 payment terms. Contact for large orders.',
  logoUrl: '',
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2026-02-04'),
  status: CustomerStatus.ACTIVE as CustomerStatus,
};

const mockStats: CustomerStats = {
  totalQuotes: 24,
  totalRevenue: 158000,
  avgQuoteValue: 6583,
  acceptedQuotes: 18,
  declinedQuotes: 4,
  pendingQuotes: 2,
  conversionRate: 75,
  lastQuoteDate: new Date('2026-02-01'),
  firstQuoteDate: new Date('2023-02-10'),
};

const mockActivities: CustomerActivity[] = [
  {
    id: 'act_1',
    customerId: 'cust_1',
    type: 'quote_sent',
    description: 'Quote QT-2026-024 sent',
    quoteId: 'qt_024',
    quoteNumber: 'QT-2026-024',
    amount: 12500,
    createdAt: new Date('2026-02-01T10:30:00'),
    createdBy: 'Jane Doe',
  },
  {
    id: 'act_2',
    customerId: 'cust_1',
    type: 'quote_accepted',
    description: 'Quote QT-2026-023 accepted',
    quoteId: 'qt_023',
    quoteNumber: 'QT-2026-023',
    amount: 8700,
    createdAt: new Date('2026-01-28T14:15:00'),
  },
  {
    id: 'act_3',
    customerId: 'cust_1',
    type: 'customer_updated',
    description: 'Contact information updated',
    createdAt: new Date('2026-01-15T09:00:00'),
    createdBy: 'Jane Doe',
  },
  {
    id: 'act_4',
    customerId: 'cust_1',
    type: 'quote_viewed',
    description: 'Quote QT-2026-023 viewed',
    quoteId: 'qt_023',
    quoteNumber: 'QT-2026-023',
    createdAt: new Date('2026-01-27T16:45:00'),
  },
  {
    id: 'act_5',
    customerId: 'cust_1',
    type: 'quote_created',
    description: 'New quote QT-2026-023 created',
    quoteId: 'qt_023',
    quoteNumber: 'QT-2026-023',
    amount: 8700,
    createdAt: new Date('2026-01-25T11:20:00'),
    createdBy: 'Jane Doe',
  },
];

const mockQuotes: Quote[] = [
  {
    id: 'qt_024',
    quoteNumber: 'QT-2026-024',
    customerId: 'cust_1',
    customer: mockCustomer,
    title: 'Industrial Machinery - Q1 Order',
    status: QuoteStatus.SENT,
    priority: QuotePriority.HIGH,
    lineItems: [],
    subtotal: 11250,
    discountTotal: 0,
    taxTotal: 1125,
    shippingTotal: 125,
    total: 12500,
    terms: {
      paymentTerms: 'Net 30',
      deliveryTerms: '2-3 weeks',
      validityPeriod: 30,
      depositRequired: true,
      depositPercentage: 50,
      currency: 'USD',
    },
    metadata: {
      createdBy: 'user_1',
      createdByName: 'Jane Doe',
      source: 'web',
    },
    sentAt: new Date('2026-02-01'),
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'qt_023',
    quoteNumber: 'QT-2026-023',
    customerId: 'cust_1',
    customer: mockCustomer,
    title: 'Maintenance Services Annual Contract',
    status: QuoteStatus.ACCEPTED,
    priority: QuotePriority.MEDIUM,
    lineItems: [],
    subtotal: 8000,
    discountTotal: 0,
    taxTotal: 700,
    shippingTotal: 0,
    total: 8700,
    terms: {
      paymentTerms: 'Net 15',
      deliveryTerms: 'Immediate',
      validityPeriod: 30,
      depositRequired: false,
      currency: 'USD',
    },
    metadata: {
      createdBy: 'user_1',
      createdByName: 'Jane Doe',
      source: 'web',
    },
    sentAt: new Date('2026-01-25'),
    acceptedAt: new Date('2026-01-28'),
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-01-28'),
  },
];

// ============================================================================
// Components
// ============================================================================

const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'indigo';
  trend?: { value: number; label: string };
}> = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-6 rounded-xl border backdrop-blur-sm',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-sm opacity-70 mt-1">{subtitle}</p>}
          {trend && (
            <p className={cn(
              'text-xs mt-2',
              trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

const ActivityItem: React.FC<{
  activity: CustomerActivity;
  isLast: boolean;
}> = ({ activity, isLast }) => {
  const getActivityIcon = (type: CustomerActivity['type']) => {
    switch (type) {
      case 'quote_created':
        return DocumentPlusIcon;
      case 'quote_sent':
        return EnvelopeIcon;
      case 'quote_viewed':
        return CheckCircleIcon;
      case 'quote_accepted':
        return CheckCircleIcon;
      case 'quote_rejected':
        return XCircleIcon;
      case 'quote_expired':
        return ClockIcon;
      case 'customer_updated':
        return PencilIcon;
      case 'note_added':
        return DocumentTextIcon;
      default:
        return ClockIcon;
    }
  };

  const getActivityColor = (type: CustomerActivity['type']) => {
    switch (type) {
      case 'quote_accepted':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'quote_rejected':
        return 'text-red-400 bg-red-500/10';
      case 'quote_sent':
        return 'text-indigo-400 bg-indigo-500/10';
      case 'quote_viewed':
        return 'text-purple-400 bg-purple-500/10';
      default:
        return 'text-slate-400 bg-slate-500/10';
    }
  };

  const Icon = getActivityIcon(activity.type);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn('p-2 rounded-full', getActivityColor(activity.type))}>
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-700 my-2" />}
      </div>
      <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
        <p className="text-sm text-slate-200">{activity.description}</p>
        {activity.amount && (
          <p className="text-sm font-medium text-emerald-400 mt-1">
            {formatCurrency(activity.amount)}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500">
            {formatDate(activity.createdAt)}
          </span>
          {activity.createdBy && (
            <>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs text-slate-500">by {activity.createdBy}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: QuoteStatus }> = ({ status }) => (
  <Badge
    variant="custom"
    className={cn('capitalize', QuoteStatusColors[status])}
  >
    {QuoteStatusLabels[status]}
  </Badge>
);

// ============================================================================
// Main Page Component
// ============================================================================

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToastHelpers();
  const customerId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'quotes' | 'activity'>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch customer data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls
        // const [customerRes, statsRes, activitiesRes, quotesRes] = await Promise.all([
        //   fetch(`/api/customers/${customerId}`),
        //   fetch(`/api/customers/${customerId}/stats`),
        //   fetch(`/api/customers/${customerId}/activities`),
        //   fetch(`/api/customers/${customerId}/quotes`),
        // ]);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCustomer(mockCustomer);
        setStats(mockStats);
        setActivities(mockActivities);
        setQuotes(mockQuotes);
      } catch (err) {
        showError('Failed to load customer data', err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customerId, showError]);

  const handleEdit = useCallback(() => {
    router.push(`/customers/${customerId}/edit`);
  }, [router, customerId]);

  const handleCreateQuote = useCallback(() => {
    router.push(`/quotes/new?customerId=${customerId}`);
  }, [router, customerId]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/customers/${customerId}`, { method: 'DELETE' });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('Customer deleted successfully');
      router.push('/dashboard');
    } catch (err) {
      showError('Failed to delete customer', err instanceof Error ? err.message : 'Unknown error');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }, [customerId, router, success, showError]);

  const handleViewQuote = useCallback((quoteId: string) => {
    router.push(`/quotes/${quoteId}`);
  }, [router]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer || !stats) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto text-center py-20">
          <ExclamationTriangleIcon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Customer Not Found</h1>
          <p className="text-slate-400 mb-6">The customer you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'quotes', label: `Quotes (${stats.totalQuotes})` },
    { id: 'activity', label: 'Activity' },
  ] as const;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{customer.companyName}</h1>
              <p className="text-slate-400">{customer.contactName}</p>
            </div>
            <Badge
              variant="custom"
              className={CustomerStatusColors[customer.status]}
            >
              {CustomerStatusLabels[customer.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleEdit}>
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button onClick={handleCreateQuote}>
              <DocumentPlusIcon className="w-4 h-4 mr-2" />
              Create Quote
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subtitle={`${stats.acceptedQuotes} accepted quotes`}
            icon={CurrencyDollarIcon}
            color="green"
          />
          <StatCard
            title="Active Quotes"
            value={stats.pendingQuotes.toString()}
            subtitle={`of ${stats.totalQuotes} total`}
            icon={DocumentTextIcon}
            color="blue"
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            subtitle={`${stats.acceptedQuotes} accepted / ${stats.declinedQuotes} declined`}
            icon={CheckCircleIcon}
            color="indigo"
          />
          <StatCard
            title="Customer Since"
            value={formatDate(customer.customerSince)}
            subtitle={`${Math.floor((Date.now() - customer.customerSince.getTime()) / (1000 * 60 * 60 * 24 * 365))} years`}
            icon={CalendarIcon}
            color="amber"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex border-b border-slate-800">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'px-6 py-4 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'text-indigo-400 border-b-2 border-indigo-400'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Contact Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                            <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Email</p>
                              <a href={`mailto:${customer.email}`} className="text-sm text-slate-200 hover:text-indigo-400">
                                {customer.email}
                              </a>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                            <PhoneIcon className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Phone</p>
                              <a href={`tel:${customer.phone}`} className="text-sm text-slate-200 hover:text-indigo-400">
                                {customer.phone || 'N/A'}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Addresses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-3">Billing Address</h4>
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-start gap-3">
                              <MapPinIcon className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                              <div className="text-sm text-slate-300">
                                <p>{customer.billingAddress?.street}</p>
                                <p>{customer.billingAddress?.city}, {customer.billingAddress?.state} {customer.billingAddress?.zipCode}</p>
                                <p>{customer.billingAddress?.country}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-3">Shipping Address</h4>
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-start gap-3">
                              <MapPinIcon className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                              <div className="text-sm text-slate-300">
                                <p>{customer.shippingAddress?.street}</p>
                                <p>{customer.shippingAddress?.city}, {customer.shippingAddress?.state} {customer.shippingAddress?.zipCode}</p>
                                <p>{customer.shippingAddress?.country}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {customer.tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-3">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {customer.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-sm rounded-full"
                              >
                                <TagIcon className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {customer.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-3">Notes</h4>
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-slate-300">{customer.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Tax ID */}
                      {customer.taxId && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-3">Tax ID</h4>
                          <p className="text-sm text-slate-300">{customer.taxId}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'quotes' && (
                    <motion.div
                      key="quotes"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {quotes.length === 0 ? (
                        <div className="text-center py-12">
                          <DocumentTextIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400">No quotes yet</p>
                          <Button className="mt-4" onClick={handleCreateQuote}>
                            Create First Quote
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {quotes.map((quote, index) => (
                            <motion.div
                              key={quote.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => handleViewQuote(quote.id)}
                              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                            >
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-slate-200">{quote.quoteNumber}</span>
                                  <StatusBadge status={quote.status} />
                                </div>
                                <p className="text-sm text-slate-400 mt-1">{quote.title}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  Created {formatDate(quote.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-slate-200">
                                  {formatCurrency(quote.total)}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'activity' && (
                    <motion.div
                      key="activity"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {activities.length === 0 ? (
                        <div className="text-center py-12">
                          <ClockIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400">No activity yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {activities.map((activity, index) => (
                            <ActivityItem
                              key={activity.id}
                              activity={activity}
                              isLast={index === activities.length - 1}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start" onClick={handleCreateQuote}>
                  <DocumentPlusIcon className="w-4 h-4 mr-2" />
                  Create Quote
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={handleEdit}>
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Customer
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => {}}>
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </motion.div>

            {/* Quote Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Quote Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Total Quotes</span>
                  <span className="font-medium text-slate-200">{stats.totalQuotes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Accepted</span>
                  <span className="font-medium text-emerald-400">{stats.acceptedQuotes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Pending</span>
                  <span className="font-medium text-amber-400">{stats.pendingQuotes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Declined</span>
                  <span className="font-medium text-red-400">{stats.declinedQuotes}</span>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Total Revenue</span>
                    <span className="font-semibold text-emerald-400">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Delete Customer */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-red-950/20 border border-red-900/30 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-400/70 mb-4">
                Deleting this customer will also delete all associated quotes. This action cannot be undone.
              </p>
              <Button
                variant="custom"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setShowDeleteModal(true)}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Customer
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Customer"
        description={`Are you sure you want to delete ${customer.companyName}? This will also delete ${stats.totalQuotes} associated quotes. This action cannot be undone.`}
      >
        <div className="flex items-center gap-3 p-4 bg-red-950/30 rounded-lg mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">
            <strong>Warning:</strong> All quote history and data will be permanently removed.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="custom"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Customer
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
