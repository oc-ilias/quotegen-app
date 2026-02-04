/**
 * Dashboard Layout
 * Main layout wrapper with sidebar, header, and content area
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sidebar, type NavItemId } from '@/components/navigation/Sidebar';
import { Header, type Notification } from '@/components/layout/Header';

// ============================================================================
// Types
// ============================================================================

export interface DashboardLayoutProps {
  children: React.ReactNode;
  activeNavItem?: NavItemId;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  shopName?: string;
  notifications?: Notification[];
  onNavigate?: (item: NavItemId) => void;
  onSearch?: (query: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

// ============================================================================
// Breadcrumb Component
// ============================================================================

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
    {items.map((item, index) => (
      <React.Fragment key={item.label}>
        {index > 0 && (
          <span className="text-slate-700">/</span>
        )}
        {item.href ? (
          <a
            href={item.href}
            className="hover:text-slate-300 transition-colors"
          >
            {item.label}
          </a>
        ) : (
          <span className="text-slate-300">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// ============================================================================
// Page Header Component
// ============================================================================

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export const PageHeader = ({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) => (
  <div className="mb-8">
    {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
    
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-slate-400">{subtitle}</p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-3">{actions}</div>
      )}
    </div>
  </div>
);

// ============================================================================
// Main Dashboard Layout
// ============================================================================

export function DashboardLayout({
  children,
  activeNavItem = 'dashboard',
  userName,
  userEmail,
  userAvatar,
  shopName,
  notifications = [],
  onNavigate,
  onSearch,
  onNotificationClick,
  className,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <Sidebar
        activeItem={activeNavItem}
        onNavigate={onNavigate}
        userName={userName}
        userEmail={userEmail}
        shopName={shopName}
        notificationCount={unreadCount}
      />

      {/* Main Content Area */}
      <div 
        className={cn(
          'transition-all duration-300 ease-in-out',
          'lg:ml-20', // Collapsed sidebar width
          'xl:ml-64', // Expanded sidebar width on larger screens
        )}
      >
        {/* Header */}
        <Header
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          notificationCount={unreadCount}
          notifications={notifications}
          onSearch={onSearch}
          onNotificationClick={onNotificationClick}
          onMarkAllRead={() => {
            // Handle mark all as read
            console.log('Mark all notifications as read');
          }}
          onSettings={() => {
            onNavigate?.('settings');
          }}
        />

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'p-6 lg:p-8 min-h-[calc(100vh-80px)]',
            className
          )}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

// ============================================================================
// Content Container Components
// ============================================================================

export const ContentGrid = ({ 
  children, 
  className,
  cols = 3 
}: { 
  children: React.ReactNode; 
  className?: string;
  cols?: 1 | 2 | 3 | 4;
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', colClasses[cols], className)}>
      {children}
    </div>
  );
};

export const ContentSection = ({ 
  children, 
  className,
  title,
  action
}: { 
  children: React.ReactNode; 
  className?: string;
  title?: string;
  action?: React.ReactNode;
}) => (
  <section className={cn('space-y-4', className)}>
    {(title || action) && (
      <div className="flex items-center justify-between">
        {title && <h2 className="text-lg font-semibold text-slate-200">{title}</h2>}
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </section>
);

export default DashboardLayout;
