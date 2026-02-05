/**
 * Quote Detail Page
 * View and manage individual quote with full details
 * @module app/dashboard/quotes/[id]/page
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  PrinterIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  ChevronDownIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { QuoteStatus, QuoteStatusLabels, QuoteStatusColors, type Quote, type Customer, type LineItem, type Activity } from '@/types/quote';

// ============================================================================
// Mock Data
// ============================================================================

const mockQuote: Quote = {
  id: 'qt_001',
  quoteNumber: 'QT-2024-001',
  customerId: 'c1',
  customer: {
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
    tags: ['enterprise', 'manufacturing'],
    notes: 'Key enterprise client. Prefers quarterly billing.',
  },
  title: 'Industrial Equipment Quote - Q1 2024',
  status: QuoteStatus.SENT,
  priority: 'high' as const,
  lineItems: [
    {
      id: 'li_001',
      productId: 'p1',
      title: 'Industrial Compressor X2000',
      sku: 'IC-X2000',
      quantity: 2,
      unitPrice: 5000,
      discountAmount: 500,
      discountPercentage: 5,
      taxRate: 8.5,
      taxAmount: 765,
      subtotal: 10000,
      total: 10265,
      notes: 'Includes 2-year warranty',
    },
    {
      id: 'li_002',
      productId: 'p2',
      title: 'Maintenance Package Premium',
      sku: 'MP-PREM',
      quantity: 1,
      unitPrice: 2500,
      discountAmount: 0,
      taxRate: 8.5,
      taxAmount: 212.50,
      subtotal: 2500,
      total: 2712.50,
    },
    {
      id: 'li_003',
      productId: 'p3',
      title: 'Installation Service',
      sku: 'INST-STD',
      quantity: 1,
      unitPrice: 1500,
      discountAmount: 0,
      taxRate: 8.5,
      taxAmount: 127.50,
      subtotal: 1500,
      total: 1627.50,
      notes: 'On-site installation and training',
    },
  ],
  subtotal: 14000,
  discountTotal: 500,
  taxTotal: 1105,
  shippingTotal: 0,
  total: 14605,
  terms: {
    paymentTerms: 'Net 30',
    deliveryTerms: '2-3 weeks after order confirmation',
    validityPeriod: 30,
    depositRequired: true,
    depositPercentage: 50,
    currency: 'USD',
    notes: 'Quote valid for 30 days. Prices subject to change after expiration.',
    internalNotes: 'High priority client. Follow up in 1 week if no response.',
  },
  metadata: {
    createdBy: 'user_001',
    createdByName: 'Jane Wilson',
    updatedBy: 'user_001',
    updatedByName: 'Jane Wilson',
    source: 'web',
  },
  expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
  sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
};

const mockActivities: Activity[] = [
  {
    id: 'act_001',
    type: 'quote_sent' as const,
    quoteId: 'qt_001',
    quoteNumber: 'QT-2024-001',
    customerName: 'John Smith',
    userName: 'Jane Wilson',
    description: 'Quote sent to john.smith@acmecorp.com',
    metadata: { emailOpened: true },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'act_002',
    type: 'quote_viewed' as const,
    quoteId: 'qt_001',
    quoteNumber: 'QT-2024-001',
    customerName: 'John Smith',
    description: 'Quote viewed by customer',
    metadata: { ipAddress: '192.168.1.1', userAgent: 'Chrome/120' },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'act_003',
    type: 'note_added' as const,
    quoteId: 'qt_001',
    quoteNumber: 'QT-2024-001',
    userName: 'Jane Wilson',
    description: 'Added internal note: "Called client, they are reviewing with their team. Expect response by Friday."',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: 'act_004',
    type: 'quote_created' as const,
    quoteId: 'qt_001',
    quoteNumber: 'QT-2024-001',
    customerName: 'John Smith',
    userName: 'Jane Wilson',
    description: 'Quote created from template "Industrial Equipment"',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${colors[status]}`}>
      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
      {QuoteStatusLabels[status]}
    </span>
  );
};

const ActionButton: React.FC<{
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
}> = ({ onClick, icon: Icon, label, variant = 'secondary', disabled, loading }) => {
  const variants = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25',
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 ${variants[variant]}`}
    >
      {loading ? (
        <ArrowPathIcon className="w-5 h-5 animate-spin" />
      ) : (
        <Icon className="w-5 h-5" />
      )}
      {label}
    </motion.button>
  );
};

const TimelineItem: React.FC<{
  activity: Activity;
  isLast: boolean;
}> = ({ activity, isLast }) => {
  const icons: Record<string, React.ElementType> = {
    quote_created: DocumentDuplicateIcon,
    quote_sent: EnvelopeIcon,
    quote_viewed: EyeIcon,
    quote_accepted: CheckCircleIcon,
    quote_rejected: XCircleIcon,
    quote_expired: ClockIcon,
    note_added: ChatBubbleLeftRightIcon,
    status_changed: ArrowPathIcon,
  };

  const colors: Record<string, string> = {
    quote_created: 'bg-blue-500/10 text-blue-400',
    quote_sent: 'bg-indigo-500/10 text-indigo-400',
    quote_viewed: 'bg-purple-500/10 text-purple-400',
    quote_accepted: 'bg-emerald-500/10 text-emerald-400',
    quote_rejected: 'bg-red-500/10 text-red-400',
    quote_expired: 'bg-slate-500/10 text-slate-400',
    note_added: 'bg-amber-500/10 text-amber-400',
    status_changed: 'bg-cyan-500/10 text-cyan-400',
  };

  const Icon = icons[activity.type] || InformationCircleIcon;

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
            {activity.createdAt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {activity.userName && (
            <>
              <span>•</span>
              <span>{activity.userName}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const LineItemsTable: React.FC<{ items: LineItem[] }> = ({ items }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-3 text-sm font-medium text-slate-400">Item</th>
            <th className="text-right py-3 text-sm font-medium text-slate-400">Qty</th>
            <th className="text-right py-3 text-sm font-medium text-slate-400">Unit Price</th>
            <th className="text-right py-3 text-sm font-medium text-slate-400">Discount</th>
            <th className="text-right py-3 text-sm font-medium text-slate-400">Tax</th>
            <th className="text-right py-3 text-sm font-medium text-slate-400">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="py-4">
                <div>
                  <p className="font-medium text-slate-200">{item.title}</p>
                  <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                  {item.notes && (
                    <p className="text-sm text-slate-500 mt-1">{item.notes}</p>
                  )}
                </div>
              </td>
              <td className="text-right text-slate-300">{item.quantity}</td>
              <td className="text-right text-slate-300">{formatCurrency(item.unitPrice)}</td>
              <td className="text-right">
                {item.discountAmount > 0 ? (
                  <span className="text-emerald-400">-{formatCurrency(item.discountAmount)}</span>
                ) : (
                  <span className="text-slate-500">-</span>
                )}
              </td>
              <td className="text-right text-slate-300">{formatCurrency(item.taxAmount)}</td>
              <td className="text-right font-medium text-slate-200">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote>(mockQuote);
  const [activities] = useState<Activity[]>(mockActivities);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'notes'>('overview');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.terms.currency || 'USD',
    }).format(value);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilExpiry = () => {
    if (!quote.expiresAt) return null;
    const days = Math.ceil((quote.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const expiryDays = getDaysUntilExpiry();

  // Handlers
  const handleSend = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setQuote({ ...quote, status: QuoteStatus.SENT, sentAt: new Date() });
    setIsLoading(false);
  };

  const handleAccept = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setQuote({ ...quote, status: QuoteStatus.ACCEPTED, acceptedAt: new Date() });
    setIsLoading(false);
  };

  const handleReject = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setQuote({ ...quote, status: QuoteStatus.REJECTED, rejectedAt: new Date() });
    setIsLoading(false);
  };

  const handleDuplicate = () => {
    router.push(`/dashboard/quotes/new?duplicate=${quote.id}`);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    router.push('/dashboard/quotes');
  };

  const getAvailableActions = () => {
    switch (quote.status) {
      case QuoteStatus.DRAFT:
      case QuoteStatus.PENDING:
        return (
          <>
            <ActionButton
              onClick={handleSend}
              icon={EnvelopeIcon}
              label="Send Quote"
              variant="primary"
              loading={isLoading}
            />
            <ActionButton
              onClick={() => router.push(`/dashboard/quotes/${quote.id}/edit`)}
              icon={PencilIcon}
              label="Edit"
            />
          </>
        );
      case QuoteStatus.SENT:
      case QuoteStatus.VIEWED:
        return (
          <>
            <ActionButton
              onClick={handleAccept}
              icon={CheckIcon}
              label="Mark Accepted"
              variant="success"
              loading={isLoading}
            />
            <ActionButton
              onClick={handleReject}
              icon={XMarkIcon}
              label="Mark Rejected"
              variant="danger"
              loading={isLoading}
            />
            <ActionButton
              onClick={() => {}}
              icon={EnvelopeIcon}
              label="Resend"
            />
          </>
        );
      default:
        return (
          <ActionButton
            onClick={handleDuplicate}
            icon={DocumentDuplicateIcon}
            label="Duplicate"
          />
        );
    }
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
            onClick={() => router.push('/dashboard/quotes')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">{quote.quoteNumber}</h1>
              <StatusBadge status={quote.status} />
            </div>
            <p className="text-slate-400 mt-1">{quote.title}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {getAvailableActions()}

          <ActionButton
            onClick={() => window.print()}
            icon={PrinterIcon}
            label="Print"
          />

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
                    className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50 p-4"
                  >
                    <p className="text-sm text-slate-300 mb-3">Are you sure you want to delete this quote?</p>
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

      {/* Expiry Warning */}
      {expiryDays !== null && expiryDays <= 5 && expiryDays > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3"
        >
          <ClockIcon className="w-5 h-5 text-amber-400" />
          <p className="text-amber-400">
            This quote expires in <strong>{expiryDays} day{expiryDays !== 1 ? 's' : ''}</strong>
          </p>
        </motion.div>
      )}

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
                {(['overview', 'activity', 'notes'] as const).map((tab) => (
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
                  {/* Line Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Line Items</h3>
                    <LineItemsTable items={quote.lineItems} />
                  </div>

                  {/* Totals */}
                  <div className="border-t border-slate-800 pt-6">
                    <div className="space-y-2 max-w-sm ml-auto">
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal</span>
                        <span>{formatCurrency(quote.subtotal)}</span>
                      </div>
                      {quote.discountTotal > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Discount</span>
                          <span>-{formatCurrency(quote.discountTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-400">
                        <span>Tax</span>
                        <span>{formatCurrency(quote.taxTotal)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-slate-100 pt-2 border-t border-slate-800">
                        <span>Total</span>
                        <span>{formatCurrency(quote.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="border-t border-slate-800 pt-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Terms & Conditions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-300">
                          <CalendarIcon className="w-4 h-4 text-slate-500" />
                          <span>Payment Terms: {quote.terms.paymentTerms}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <TruckIcon className="w-4 h-4 text-slate-500" />
                          <span>Delivery: {quote.terms.deliveryTerms}</span>
                        </div>
                        {quote.terms.depositRequired && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <TagIcon className="w-4 h-4 text-slate-500" />
                            <span>Deposit Required: {quote.terms.depositPercentage}%</span>
                          </div>
                        )}
                      </div>
                      {quote.terms.notes && (
                        <div className="p-4 bg-slate-800/50 rounded-xl">
                          <p className="text-sm text-slate-400 mb-1">Notes:</p>
                          <p className="text-slate-300">{quote.terms.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <TimelineItem
                      key={activity.id}
                      activity={activity}
                      isLast={index === activities.length - 1}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <h4 className="font-medium text-slate-200 mb-2">Internal Notes</h4>
                    <p className="text-slate-400">
                      {quote.terms.internalNotes || 'No internal notes added.'}
                    </p>
                  </div>

                  <textarea
                    placeholder="Add a new note..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                  />

                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors">
                      Add Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Customer</h3>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {quote.customer.contactName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-200">{quote.customer.contactName}</p>
                <p className="text-sm text-slate-400">{quote.customer.companyName}</p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`mailto:${quote.customer.email}`}
                className="flex items-center gap-3 text-slate-300 hover:text-indigo-400 transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4 text-slate-500" />
                {quote.customer.email}
              </a>
              {quote.customer.phone && (
                <a
                  href={`tel:${quote.customer.phone}`}
                  className="flex items-center gap-3 text-slate-300 hover:text-indigo-400 transition-colors"
                >
                  <PhoneIcon className="w-4 h-4 text-slate-500" />
                  {quote.customer.phone}
                </a>
              )}
              {quote.customer.billingAddress && (
                <div className="flex items-start gap-3 text-slate-300"
                >
                  <MapPinIcon className="w-4 h-4 text-slate-500 mt-0.5" />
                  <span>
                    {quote.customer.billingAddress.city}, {quote.customer.billingAddress.state}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push(`/dashboard/customers/${quote.customer.id}`)}
              className="w-full mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              View Customer
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Quote Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Quote Details</h3>

            <div className="space-y-3 text-sm"
            >
              <div className="flex justify-between"
              >
                <span className="text-slate-400">Created</span>
                <span className="text-slate-200">{formatDate(quote.createdAt)}</span>
              </div>
              <div className="flex justify-between"
              >
                <span className="text-slate-400">Created By</span>
                <span className="text-slate-200">{quote.metadata.createdByName}</span>
              </div>
              <div className="flex justify-between"
              >
                <span className="text-slate-400">Last Updated</span>
                <span className="text-slate-200">{formatDate(quote.updatedAt)}</span>
              </div>
              {quote.sentAt && (
                <div className="flex justify-between"
                >
                  <span className="text-slate-400">Sent</span>
                  <span className="text-slate-200">{formatDate(quote.sentAt)}</span>
                </div>
              )}
              <div className="flex justify-between"
              >
                <span className="text-slate-400">Expires</span>
                <span className={`${expiryDays !== null && expiryDays <= 3 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {formatDate(quote.expiresAt)}
                </span>
              </div>
              <div className="flex justify-between"
              >
                <span className="text-slate-400">Currency</span>
                <span className="text-slate-200">{quote.terms.currency}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Quick Links</h3>

            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                Copy Quote Link
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
                Create Similar Quote
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              >
                <PaperClipIcon className="w-4 h-4" />
                Attach Files
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Missing icon import
function TruckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
      />
    </svg>
  );
}
