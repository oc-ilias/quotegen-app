/**
 * Quote Detail Page
 * Comprehensive quote view with actions, activity, and status history
 * @module app/quotes/[id]/page
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { cn, formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import type { Quote, Activity, Customer, LineItem } from '@/types/quote';
import { QuoteStatus, QuoteStatusLabels, QuotePriority, QuoteStatusColors, CustomerStatus, ActivityType } from '@/types/quote';

// ============================================================================
// Mock Data
// ============================================================================

const mockQuote: Quote = {
  id: 'qt_001',
  quoteNumber: 'QT-2026-001',
  customerId: 'cust_1',
  customer: {
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
    customerSince: new Date('2023-01-15'),
    tags: ['enterprise'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2026-02-04'),
    status: CustomerStatus.ACTIVE,
  } as Customer,
  title: 'Industrial Equipment Package - Q1 2026',
  status: QuoteStatus.SENT,
  priority: QuotePriority.HIGH,
  lineItems: [
    {
      id: 'li_1',
      productId: 'prod_1',
      title: 'Industrial Conveyor Belt System',
      sku: 'ICB-2000',
      quantity: 2,
      unitPrice: 5000,
      discountAmount: 500,
      discountPercentage: 5,
      taxRate: 10,
      taxAmount: 950,
      subtotal: 10000,
      total: 10450,
      notes: 'Installation included',
    },
    {
      id: 'li_2',
      productId: 'prod_2',
      title: 'Motor Control Unit',
      sku: 'MCU-500',
      quantity: 4,
      unitPrice: 750,
      discountAmount: 0,
      taxRate: 10,
      taxAmount: 300,
      subtotal: 3000,
      total: 3300,
    },
    {
      id: 'li_3',
      productId: 'prod_3',
      title: 'Safety Sensors Kit',
      sku: 'SSK-100',
      quantity: 10,
      unitPrice: 125,
      discountAmount: 125,
      discountPercentage: 10,
      taxRate: 10,
      taxAmount: 112.50,
      subtotal: 1250,
      total: 1237.50,
    },
  ],
  subtotal: 14250,
  discountTotal: 625,
  taxTotal: 1362.50,
  shippingTotal: 500,
  total: 15487.50,
  terms: {
    paymentTerms: 'Net 30',
    deliveryTerms: '2-3 weeks after order confirmation',
    validityPeriod: 30,
    depositRequired: true,
    depositPercentage: 50,
    currency: 'USD',
    notes: 'Price valid for 30 days. Subject to availability.',
    internalNotes: 'VIP customer - prioritize delivery',
  },
  metadata: {
    createdBy: 'user_1',
    createdByName: 'Jane Doe',
    source: 'web',
    ipAddress: '192.168.1.100',
  },
  expiresAt: new Date('2026-03-05'),
  sentAt: new Date('2026-02-03T14:30:00'),
  viewedAt: new Date('2026-02-03T16:45:00'),
  createdAt: new Date('2026-02-03T14:00:00'),
  updatedAt: new Date('2026-02-03T16:45:00'),
};

const mockActivities: Activity[] = [
  {
    id: 'act_1',
    type: ActivityType.QUOTE_VIEWED,
    quoteId: 'qt_001',
    quoteNumber: 'QT-2026-001',
    customerId: 'cust_1',
    customerName: 'Acme Corporation',
    description: 'Quote viewed by customer',
    createdAt: new Date('2026-02-03T16:45:00'),
  },
  {
    id: 'act_2',
    type: ActivityType.QUOTE_SENT,
    quoteId: 'qt_001',
    quoteNumber: 'QT-2026-001',
    customerId: 'cust_1',
    customerName: 'Acme Corporation',
    userId: 'user_1',
    userName: 'Jane Doe',
    description: 'Quote sent to john.smith@acmecorp.com',
    createdAt: new Date('2026-02-03T14:30:00'),
  },
  {
    id: 'act_3',
    type: ActivityType.QUOTE_CREATED,
    quoteId: 'qt_001',
    quoteNumber: 'QT-2026-001',
    customerId: 'cust_1',
    customerName: 'Acme Corporation',
    userId: 'user_1',
    userName: 'Jane Doe',
    description: 'Quote created',
    createdAt: new Date('2026-02-03T14:00:00'),
  },
];

const mockStatusHistory = [
  { status: 'created', timestamp: new Date('2026-02-03T14:00:00'), user: 'Jane Doe' },
  { status: 'sent', timestamp: new Date('2026-02-03T14:30:00'), user: 'Jane Doe' },
  { status: 'viewed', timestamp: new Date('2026-02-03T16:45:00'), user: 'Customer' },
];

// ============================================================================
// Components
// ============================================================================

const TimelineItem: React.FC<{
  status: string;
  timestamp: Date;
  user?: string;
  isLast: boolean;
}> = ({ status, timestamp, user, isLast }) => {
  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'created':
        return DocumentDuplicateIcon;
      case 'sent':
        return PaperAirplaneIcon;
      case 'viewed':
        return EyeIcon;
      case 'accepted':
        return CheckCircleIcon;
      case 'rejected':
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'accepted':
        return 'bg-emerald-500';
      case 'rejected':
        return 'bg-red-500';
      case 'sent':
        return 'bg-indigo-500';
      case 'viewed':
        return 'bg-purple-500';
      default:
        return 'bg-slate-500';
    }
  };

  const Icon = getStatusIcon(status);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn('w-3 h-3 rounded-full', getStatusColor(status))} />
        {!isLast && <div className="w-px flex-1 bg-slate-700 my-2" />}
      </div>
      <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
        <p className="text-sm font-medium text-slate-200 capitalize">{status}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500">{formatDateTime(timestamp)}</span>
          {user && (
            <>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs text-slate-500">by {user}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{
  activity: Activity;
  isLast: boolean;
}> = ({ activity, isLast }) => {
  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'quote_accepted':
        return 'text-emerald-400';
      case 'quote_rejected':
        return 'text-red-400';
      case 'quote_sent':
        return 'text-indigo-400';
      case 'quote_viewed':
        return 'text-purple-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className={cn('pb-4', !isLast && 'border-b border-slate-800 mb-4')}>
      <p className={cn('text-sm', getActivityColor(activity.type))}>
        {activity.description}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-slate-500">{formatDateTime(activity.createdAt)}</span>
        {activity.userName && (
          <>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs text-slate-500">by {activity.userName}</span>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToastHelpers();
  const quoteId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [statusHistory, setStatusHistory] = useState(mockStatusHistory);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Fetch quote data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setQuote(mockQuote);
        setActivities(mockActivities);
      } catch (err) {
        showError('Failed to load quote', err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [quoteId, showError]);

  const handleEdit = useCallback(() => {
    router.push(`/quotes/${quoteId}/edit`);
  }, [router, quoteId]);

  const handleSend = useCallback(async () => {
    setIsSending(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('Quote sent successfully');
      setShowSendModal(false);
      // Refresh quote data
      setQuote((prev) => prev ? { ...prev, status: QuoteStatus.SENT, sentAt: new Date() } : null);
    } catch (err) {
      showError('Failed to send quote', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSending(false);
    }
  }, [success, showError]);

  const handleDuplicate = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      success('Quote duplicated successfully');
      // Navigate to new quote
      // router.push(`/quotes/${newQuoteId}`);
    } catch (err) {
      showError('Failed to duplicate quote', err instanceof Error ? err.message : 'Unknown error');
    }
  }, [success, showError]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success('Quote deleted successfully');
      router.push('/quotes');
    } catch (err) {
      showError('Failed to delete quote', err instanceof Error ? err.message : 'Unknown error');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }, [quoteId, router, success, showError]);

  const handleDownloadPDF = useCallback(() => {
    // TODO: Implement PDF download
    success('PDF download started');
  }, [success]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-96" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!quote) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto text-center py-20">
          <ExclamationTriangleIcon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Quote Not Found</h1>
          <p className="text-slate-400 mb-6">The quote you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push('/quotes')}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Quotes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const daysUntilExpiry = quote.expiresAt 
    ? Math.ceil((quote.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/quotes')}
              className="shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-100">{quote.quoteNumber}</h1>
                <StatusBadge status={quote.status} />
                <Badge variant="custom" className={cn(
                  quote.priority === 'urgent' && 'bg-red-500/10 text-red-400',
                  quote.priority === 'high' && 'bg-amber-500/10 text-amber-400',
                  quote.priority === 'medium' && 'bg-blue-500/10 text-blue-400',
                  quote.priority === 'low' && 'bg-slate-500/10 text-slate-400',
                )}>
                  {quote.priority.charAt(0).toUpperCase() + quote.priority.slice(1)} Priority
                </Badge>
              </div>
              <p className="text-slate-400 mt-1">{quote.title}</p>
              {daysUntilExpiry !== null && (
                <p className={cn(
                  'text-sm mt-1',
                  daysUntilExpiry < 0 ? 'text-red-400' : daysUntilExpiry < 3 ? 'text-amber-400' : 'text-slate-500'
                )}>
                  {daysUntilExpiry < 0 
                    ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                    : `Expires in ${daysUntilExpiry} days`}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleEdit}>
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowSendModal(true)}
              disabled={quote.status === QuoteStatus.ACCEPTED}
            >
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              Send
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDuplicate}>
              <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-slate-200 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Company</p>
                      <p className="text-sm text-slate-200">{quote.customer.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Contact</p>
                      <p className="text-sm text-slate-200">{quote.customer.contactName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <a href={`mailto:${quote.customer.email}`} className="text-sm text-indigo-400 hover:text-indigo-300">
                        {quote.customer.email}
                      </a>
                    </div>
                  </div>
                  {quote.customer.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <a href={`tel:${quote.customer.phone}`} className="text-sm text-indigo-400 hover:text-indigo-300">
                          {quote.customer.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Billing Address</p>
                      <div className="text-sm text-slate-300">
                        <p>{quote.customer.billingAddress?.street}</p>
                        <p>{quote.customer.billingAddress?.city}, {quote.customer.billingAddress?.state} {quote.customer.billingAddress?.zipCode}</p>
                        <p>{quote.customer.billingAddress?.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Line Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-slate-200">Line Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Item</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Qty</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Discount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Tax</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {quote.lineItems.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-800/30"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-200">{item.title}</p>
                            <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                            {item.notes && (
                              <p className="text-xs text-slate-600 mt-1">{item.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-300">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-slate-300">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-6 py-4 text-right">
                          {item.discountAmount > 0 ? (
                            <span className="text-emerald-400">
                              -{formatCurrency(item.discountAmount)}
                              {item.discountPercentage && ` (${item.discountPercentage}%)`}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-300">{formatCurrency(item.taxAmount)}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-200">{formatCurrency(item.total)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Terms & Conditions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-slate-200 mb-4">Terms & Conditions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Terms</span>
                    <span className="text-slate-200">{quote.terms.paymentTerms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery Terms</span>
                    <span className="text-slate-200">{quote.terms.deliveryTerms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Validity Period</span>
                    <span className="text-slate-200">{quote.terms.validityPeriod} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deposit Required</span>
                    <span className="text-slate-200">
                      {quote.terms.depositRequired ? `${quote.terms.depositPercentage}%` : 'No'}
                    </span>
                  </div>
                </div>
                {quote.terms.notes && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Notes</p>
                    <p className="text-sm text-slate-300">{quote.terms.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-slate-200 mb-4">Activity</h2>
              <div>
                {activities.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No activity yet</p>
                ) : (
                  activities.map((activity, index) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      isLast={index === activities.length - 1}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Totals Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Quote Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-slate-200">{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Discount</span>
                  <span className="text-emerald-400">-{formatCurrency(quote.discountTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tax</span>
                  <span className="text-slate-200">{formatCurrency(quote.taxTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Shipping</span>
                  <span className="text-slate-200">{formatCurrency(quote.shippingTotal)}</span>
                </div>
                <div className="pt-3 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-200">Total</span>
                    <span className="text-2xl font-bold text-emerald-400">{formatCurrency(quote.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Actions</h3>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start" onClick={handleEdit}>
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Quote
                </Button>
                <Button 
                  className="w-full justify-start" 
                  onClick={() => setShowSendModal(true)}
                  disabled={quote.status === QuoteStatus.ACCEPTED}
                >
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  Send to Customer
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={handleDownloadPDF}>
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={handlePrint}>
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print Quote
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={handleDuplicate}>
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
              </div>
            </motion.div>

            {/* Status History */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Status History</h3>
              <div>
                {statusHistory.map((item, index) => (
                  <TimelineItem
                    key={index}
                    status={item.status}
                    timestamp={item.timestamp}
                    user={item.user}
                    isLast={index === statusHistory.length - 1}
                  />
                ))}
              </div>
            </motion.div>

            {/* Delete */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-red-950/20 border border-red-900/30 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-400/70 mb-4">
                This action cannot be undone.
              </p>
              <Button
                variant="custom"
                className="w-full bg-red-600 hover:bg-red-700 text-white justify-center"
                onClick={() => setShowDeleteModal(true)}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Quote
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Send Quote Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Send Quote"
        description={`Send ${quote.quoteNumber} to ${quote.customer.contactName} at ${quote.customer.email}?`}
      >
        <div className="flex items-center gap-3 p-4 bg-indigo-950/30 rounded-lg mb-4">
          <EnvelopeIcon className="w-6 h-6 text-indigo-400 shrink-0" />
          <div>
            <p className="text-sm text-indigo-300">
              <strong>To:</strong> {quote.customer.email}
            </p>
            <p className="text-sm text-indigo-300">
              <strong>Subject:</strong> Quote {quote.quoteNumber} from Your Company
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowSendModal(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} isLoading={isSending}>
            <PaperAirplaneIcon className="w-4 h-4 mr-2" />
            Send Quote
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Quote"
        description={`Are you sure you want to delete ${quote.quoteNumber}? This action cannot be undone.`}
      >
        <div className="flex items-center gap-3 p-4 bg-red-950/30 rounded-lg mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">
            All quote data, including line items and history, will be permanently removed.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="custom"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Quote
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
