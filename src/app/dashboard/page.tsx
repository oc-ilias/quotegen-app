/**
 * Dashboard Page
 * Main dashboard view with stats, recent quotes, and activity feed
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';
import { StatCardsGrid } from '@/components/dashboard/StatCards';
import { RecentQuotes } from '@/components/dashboard/RecentQuotes';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { StatCardSkeleton, QuoteListSkeleton, ActivityFeedSkeleton } from '@/components/ui/Skeleton';
import type { QuoteStats, Quote, Activity } from '@/types/quote';
import { CustomerStatus, QuoteStatus, QuotePriority, ActivityType } from '@/types/quote';

// Mock data for demo
const mockStats: QuoteStats = {
  totalQuotes: 156,
  pendingQuotes: 23,
  acceptedQuotes: 89,
  conversionRate: 57.1,
  totalRevenue: 124500,
  avgQuoteValue: 1596,
  avgResponseTime: 48,
  periodChange: {
    totalQuotes: 12,
    conversionRate: 3.2,
    totalRevenue: 15400,
    avgQuoteValue: -2.1,
  },
};

const mockQuotes: Quote[] = [
  {
    id: 'qt_001',
    quoteNumber: 'QT-2026-001',
    customerId: 'cust_1',
    customer: {
      id: 'cust_1',
      email: 'john@acme.com',
      companyName: 'Acme Corporation',
      contactName: 'John Smith',
      phone: '+1 (555) 123-4567',
      customerSince: new Date('2023-01-15'),
      tags: ['enterprise', 'priority'],
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2026-02-03'),
      status: CustomerStatus.ACTIVE,
    },
    title: 'Industrial Equipment Quote',
    status: QuoteStatus.SENT,
    priority: QuotePriority.HIGH,
    lineItems: [],
    subtotal: 15000,
    discountTotal: 1500,
    taxTotal: 1350,
    shippingTotal: 500,
    total: 15350,
    terms: {
      paymentTerms: 'Net 30',
      deliveryTerms: '2-3 business days',
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
    sentAt: new Date('2026-02-03'),
    createdAt: new Date('2026-02-03'),
    updatedAt: new Date('2026-02-03'),
  },
  {
    id: 'qt_002',
    quoteNumber: 'QT-2026-002',
    customerId: 'cust_2',
    customer: {
      id: 'cust_2',
      email: 'sarah@globex.com',
      companyName: 'Globex Industries',
      contactName: 'Sarah Johnson',
      phone: '+1 (555) 987-6543',
      customerSince: new Date('2023-03-20'),
      tags: ['mid-market'],
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2026-02-02'),
      status: CustomerStatus.ACTIVE,
    },
    title: 'Office Furniture Package',
    status: QuoteStatus.ACCEPTED,
    priority: QuotePriority.MEDIUM,
    lineItems: [],
    subtotal: 8500,
    discountTotal: 0,
    taxTotal: 765,
    shippingTotal: 350,
    total: 9615,
    terms: {
      paymentTerms: 'Net 15',
      deliveryTerms: 'Standard (5-7 days)',
      validityPeriod: 30,
      depositRequired: false,
      currency: 'USD',
    },
    metadata: {
      createdBy: 'user_1',
      createdByName: 'Jane Doe',
      source: 'web',
    },
    sentAt: new Date('2026-02-01'),
    acceptedAt: new Date('2026-02-02'),
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-02'),
  },
  {
    id: 'qt_003',
    quoteNumber: 'QT-2026-003',
    customerId: 'cust_3',
    customer: {
      id: 'cust_3',
      email: 'mike@initech.com',
      companyName: 'Initech LLC',
      contactName: 'Michael Brown',
      phone: '+1 (555) 456-7890',
      customerSince: new Date('2023-06-10'),
      tags: ['startup'],
      createdAt: new Date('2023-06-10'),
      updatedAt: new Date('2026-02-03'),
      status: CustomerStatus.ACTIVE,
    },
    title: 'IT Services Quote',
    status: QuoteStatus.VIEWED,
    priority: QuotePriority.LOW,
    lineItems: [],
    subtotal: 5000,
    discountTotal: 500,
    taxTotal: 450,
    shippingTotal: 0,
    total: 4950,
    terms: {
      paymentTerms: 'Due on Receipt',
      deliveryTerms: 'Custom Delivery Terms',
      validityPeriod: 15,
      depositRequired: false,
      currency: 'USD',
    },
    metadata: {
      createdBy: 'user_1',
      createdByName: 'Jane Doe',
      source: 'web',
    },
    sentAt: new Date('2026-02-02'),
    viewedAt: new Date('2026-02-03'),
    createdAt: new Date('2026-02-02'),
    updatedAt: new Date('2026-02-03'),
  },
];

const mockActivities: Activity[] = [
  {
    id: 'act_1',
    type: ActivityType.QUOTE_SENT,
    quoteId: 'qt_001',
    quoteNumber: 'QT-2026-001',
    customerId: 'cust_1',
    customerName: 'Acme Corporation',
    userId: 'user_1',
    userName: 'Jane Doe',
    description: 'Quote sent to customer',
    createdAt: new Date('2026-02-03T14:30:00'),
  },
  {
    id: 'act_2',
    type: ActivityType.QUOTE_ACCEPTED,
    quoteId: 'qt_002',
    quoteNumber: 'QT-2026-002',
    customerId: 'cust_2',
    customerName: 'Globex Industries',
    userId: 'system',
    userName: 'System',
    description: 'Quote accepted by customer',
    createdAt: new Date('2026-02-02T10:15:00'),
  },
  {
    id: 'act_3',
    type: ActivityType.QUOTE_VIEWED,
    quoteId: 'qt_003',
    quoteNumber: 'QT-2026-003',
    customerId: 'cust_3',
    customerName: 'Initech LLC',
    description: 'Quote viewed by customer',
    createdAt: new Date('2026-02-03T09:45:00'),
  },
  {
    id: 'act_4',
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
  {
    id: 'act_5',
    type: ActivityType.CUSTOMER_ADDED,
    customerId: 'cust_4',
    customerName: 'New Customer Inc',
    userId: 'user_1',
    userName: 'Jane Doe',
    description: 'New customer added',
    createdAt: new Date('2026-02-01T11:30:00'),
  },
];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setStats(mockStats);
      setQuotes(mockQuotes);
      setActivities(mockActivities);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // Navigate to appropriate page or open modal
  };

  const handleViewQuote = (quoteId: string) => {
    console.log('View quote:', quoteId);
    // Navigate to quote detail
  };

  const handleAction = (quoteId: string, action: string) => {
    console.log('Quote action:', quoteId, action);
    // Handle quote actions (send, edit, etc.)
  };

  return (
    <DashboardLayout activeNavItem="dashboard">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your quotes."
      />

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCardSkeleton color="blue" />
          <StatCardSkeleton color="green" />
          <StatCardSkeleton color="purple" />
          <StatCardSkeleton color="indigo" />
        </div>
      ) : stats ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <StatCardsGrid stats={[
            { title: 'Total Quotes', value: stats.totalQuotes, change: stats.periodChange?.totalQuotes, icon: 'quotes', color: 'blue', format: 'number' },
            { title: 'Total Revenue', value: stats.totalRevenue, change: stats.periodChange?.totalRevenue, icon: 'revenue', color: 'green', format: 'currency' },
            { title: 'Conversion Rate', value: stats.conversionRate, change: stats.periodChange?.conversionRate, icon: 'conversion', color: 'purple', format: 'percent' },
            { title: 'Pending Quotes', value: stats.pendingQuotes, icon: 'pending', color: 'indigo', format: 'number' },
          ]} />
        </motion.div>
      ) : null}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <QuickActions onCreateQuote={() => handleQuickAction('create-quote')} onViewAnalytics={() => handleQuickAction('view-analytics')} />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Quotes */}
        <div className="xl:col-span-2">
          {isLoading ? (
            <QuoteListSkeleton />
          ) : (
            <RecentQuotes
              quotes={quotes.map(q => ({
                id: q.id,
                quoteNumber: q.quoteNumber,
                customerName: q.customer?.contactName || q.customer?.companyName || 'Unknown',
                customerEmail: q.customer?.email || '',
                company: q.customer?.companyName,
                title: q.title,
                total: q.total,
                status: q.status,
                createdAt: q.createdAt.toISOString(),
              }))}
              onViewQuote={handleViewQuote}
            />
          )}
        </div>

        {/* Activity Feed */}
        <div>
          {isLoading ? (
            <ActivityFeedSkeleton />
          ) : (
            <ActivityFeed activities={activities.map(a => ({
              id: a.id,
              type: a.type,
              quote_id: a.quoteId || '',
              quote_number: a.quoteNumber || '',
              customer_name: a.customerName || '',
              timestamp: a.createdAt.toISOString(),
              metadata: { description: a.description },
            }))} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
