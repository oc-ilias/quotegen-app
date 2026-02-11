/**
 * Dashboard Page
 * Main dashboard with overview stats, recent quotes, and activity feed
 * @module app/dashboard/page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StatCardsGrid, useDashboardStats } from '@/components/dashboard/StatCards';
import { RecentQuotes } from '@/components/dashboard/RecentQuotes';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { QuoteStatus, ActivityType, type ActivityItem, type Quote } from '@/types/quote';
import type { RecentQuoteItem } from '@/components/dashboard/RecentQuotes';

// ============================================================================
// Types
// ============================================================================

interface DashboardData {
  stats: {
    totalQuotes: number;
    pendingQuotes: number;
    sentQuotes: number;
    acceptedQuotes: number;
    totalRevenue: number;
    conversionRate: number;
    averageQuoteValue: number;
    quoteChange: number;
    revenueChange: number;
    conversionChange: number;
  };
  recentQuotes: RecentQuoteItem[];
  activities: ActivityItem[];
}

// ============================================================================
// Mock Data (for demo)
// ============================================================================

const mockQuotes: RecentQuoteItem[] = [
  {
    id: '1',
    quoteNumber: 'QT-2024-001',
    customerName: 'John Smith',
    customerEmail: 'john@acme.com',
    company: 'Acme Corp',
    title: 'Industrial Equipment Quote',
    total: 15000,
    status: QuoteStatus.ACCEPTED,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    quoteNumber: 'QT-2024-002',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@techflow.io',
    company: 'TechFlow Solutions',
    title: 'Software Licensing Quote',
    total: 8500,
    status: QuoteStatus.SENT,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '3',
    quoteNumber: 'QT-2024-003',
    customerName: 'Mike Chen',
    customerEmail: 'mike@buildcraft.com',
    company: 'BuildCraft Inc',
    title: 'Construction Materials',
    total: 23000,
    status: QuoteStatus.PENDING,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '4',
    quoteNumber: 'QT-2024-004',
    customerName: 'Emily Davis',
    customerEmail: 'emily@stellar.design',
    company: 'Stellar Design',
    title: 'Design Services Package',
    total: 5200,
    status: QuoteStatus.VIEWED,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

const mockActivities: ActivityItem[] = [
  {
    id: 'a1',
    type: ActivityType.QUOTE_ACCEPTED,
    quote_id: '1',
    quote_number: 'QT-2024-001',
    customer_name: 'John Smith',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'a2',
    type: ActivityType.QUOTE_SENT,
    quote_id: '2',
    quote_number: 'QT-2024-002',
    customer_name: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'a3',
    type: ActivityType.QUOTE_CREATED,
    quote_id: '3',
    quote_number: 'QT-2024-003',
    customer_name: 'Mike Chen',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'a4',
    type: ActivityType.QUOTE_VIEWED,
    quote_id: '2',
    quote_number: 'QT-2024-002',
    customer_name: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'a5',
    type: ActivityType.QUOTE_REMINDER_SENT,
    quote_id: '4',
    quote_number: 'QT-2024-004',
    customer_name: 'Emily Davis',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
  },
];

const mockStats = {
  totalQuotes: 156,
  pendingQuotes: 23,
  sentQuotes: 45,
  acceptedQuotes: 88,
  totalRevenue: 485000,
  conversionRate: 56.4,
  averageQuoteValue: 3100,
  quoteChange: 12.5,
  revenueChange: 18.2,
  conversionChange: 3.1,
};

// ============================================================================
// Main Component
// ============================================================================

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    stats: mockStats,
    recentQuotes: mockQuotes,
    activities: mockActivities,
  });

  const stats = useDashboardStats(data.stats);

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCreateQuote = () => {
    router.push('/dashboard/quotes/new');
  };

  const handleViewQuote = (id: string) => {
    router.push(`/dashboard/quotes/${id}`);
  };

  const handleViewAllQuotes = () => {
    router.push('/dashboard/quotes');
  };

  const handleViewAnalytics = () => {
    router.push('/dashboard/analytics');
  };

  const handleCreateTemplate = () => {
    router.push('/dashboard/templates/new');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your quotes.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateQuote}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Quote
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <section>
        <StatCardsGrid stats={stats} isLoading={isLoading} />
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Quotes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <RecentQuotes
            quotes={data.recentQuotes}
            isLoading={isLoading}
            onViewQuote={handleViewQuote}
            onViewAll={handleViewAllQuotes}
          />
        </motion.section>

        {/* Activity Feed */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ActivityFeed
            activities={data.activities}
            isLoading={isLoading}
            maxItems={5}
          />
        </motion.section>
      </div>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <QuickActions
          onCreateQuote={handleCreateQuote}
          onCreateTemplate={handleCreateTemplate}
          onViewAnalytics={handleViewAnalytics}
        />
      </motion.section>
    </div>
  );
}
