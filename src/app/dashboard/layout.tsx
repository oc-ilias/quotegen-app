/**
 * Dashboard Layout
 * Main layout with sidebar navigation for the QuoteGen app
 * @module app/dashboard/layout
 */

import React from 'react';
import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const metadata: Metadata = {
  title: 'Dashboard - QuoteGen',
  description: 'Manage your B2B quotes and analytics',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
