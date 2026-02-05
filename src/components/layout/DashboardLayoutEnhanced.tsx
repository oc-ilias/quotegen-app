/**
 * Enhanced Dashboard Layout
 * Full-featured layout with page transitions, breadcrumbs, and loading states
 * @module components/layout/DashboardLayoutEnhanced
 */

'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SidebarEnhanced, MobileMenuToggle, type NavItemId } from '@/components/navigation/SidebarEnhanced';
import { useToast } from '@/hooks/useToast';
import {
  HomeIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChevronRightIcon,
  CommandLineIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

export interface DashboardLayoutEnhancedProps {
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
  hideSidebar?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// ============================================================================
// Breadcrumb Component
// ============================================================================

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  return (
    <nav 
      className={cn('flex items-center gap-2 text-sm', className)}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;

        return (
          <React.Fragment key={item.label}>
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />
            )}
            
            {item.href && !isLast ? (
              <motion.a
                href={item.href}
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded'
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="truncate max-w-[150px]">{item.label}</span>
              </motion.a>
            ) : (
              <span
                className={cn(
                  'flex items-center gap-1.5 truncate max-w-[200px]',
                  isLast ? 'text-slate-200 font-medium' : 'text-slate-400'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// ============================================================================
// Page Header Component
// ============================================================================

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  };
}

const badgeVariants = {
  default: 'bg-slate-700 text-slate-300',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export const PageHeader = ({ 
  title, 
  subtitle, 
  actions, 
  breadcrumbs,
  className,
  badge,
}: PageHeaderProps) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={cn('mb-8', className)}
  >
    {breadcrumbs && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <Breadcrumbs items={breadcrumbs} />
      </motion.div>
    )}
    
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{title}</h1>
          {badge && (
            <span className={cn(
              'px-2.5 py-0.5 text-xs font-medium rounded-full border',
              badgeVariants[badge.variant || 'default']
            )}>
              {badge.label}
            </span>
          )}
        </div>
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-1.5 text-slate-400"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      
      {actions && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 flex-shrink-0"
        >
          {actions}
        </motion.div>
      )}
    </div>
  </motion.div>
);

// ============================================================================
// Header Component
// ============================================================================

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  notifications?: Notification[];
  onSearch?: (query: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onSettings?: () => void;
  onMobileMenuClick?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header = ({
  userName,
  userEmail,
  userAvatar,
  notificationCount = 0,
  notifications = [],
  onSearch,
  onNotificationClick,
  onMarkAllRead,
  onSettings,
  onMobileMenuClick,
  isMobileMenuOpen,
}: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, onSearch]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-4">
          <MobileMenuToggle 
            isOpen={isMobileMenuOpen || false} 
            onClick={onMobileMenuClick || (() => {})}
            className="lg:hidden"
          />

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quotes, customers..."
                className={cn(
                  'w-64 pl-9 pr-10 py-2 bg-slate-900 border border-slate-800',
                  'rounded-lg text-sm text-slate-200 placeholder-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
                  'transition-all'
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600">
                ⌘K
              </span>
            </div>
          </form>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={cn(
                'relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors',
                isNotificationsOpen && 'bg-slate-800 text-white'
              )}
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </motion.button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={cn(
                      'absolute right-0 top-full mt-2 w-80',
                      'bg-slate-900 border border-slate-800 rounded-xl shadow-xl',
                      'z-50 overflow-hidden'
                    )}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-slate-800">
                      <h3 className="font-semibold text-slate-200">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={onMarkAllRead}
                          className="text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => {
                              onNotificationClick?.(notification);
                              setIsNotificationsOpen(false);
                            }}
                            className={cn(
                              'w-full p-4 text-left border-b border-slate-800/50 last:border-b-0',
                              'hover:bg-slate-800/50 transition-colors',
                              !notification.read && 'bg-slate-800/30'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                                notification.type === 'success' && 'bg-emerald-500',
                                notification.type === 'warning' && 'bg-amber-500',
                                notification.type === 'error' && 'bg-red-500',
                                notification.type === 'info' && 'bg-blue-500',
                              )} />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-200 text-sm">{notification.title}</p>
                                <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{notification.message}</p>
                                <p className="text-slate-500 text-xs mt-1">
                                  {new Date(notification.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSettings}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm text-slate-300 hidden sm:block">{userName}</span>
          </motion.button>
        </div>
      </div>

      {/* Progress Bar */}
      <PageLoadProgress />
    </header>
  );
};

// ============================================================================
// Page Load Progress Component
// ============================================================================

const PageLoadProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 origin-left"
      style={{ scaleX }}
    />
  );
};

// ============================================================================
// Page Transition Wrapper
// ============================================================================

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// Content Container Components
// ============================================================================

export const ContentGrid = ({ 
  children, 
  className,
  cols = 3,
  gap = 6,
}: { 
  children: React.ReactNode; 
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 4 | 6 | 8;
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div className={cn('grid', colClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
};

export const ContentSection = ({ 
  children, 
  className,
  title,
  action,
  description,
}: { 
  children: React.ReactNode; 
  className?: string;
  title?: string;
  action?: React.ReactNode;
  description?: string;
}) => (
  <motion.section 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={cn('space-y-4', className)}
  >
    {(title || action || description) && (
      <div className="flex items-start justify-between gap-4">
        <div>
          {title && <h2 className="text-lg font-semibold text-slate-200">{title}</h2>}
          {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </motion.section>
);

// ============================================================================
// Loading States
// ============================================================================

export const PageSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-8 w-48 bg-slate-800 rounded" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 bg-slate-900/50 border border-slate-800 rounded-2xl" />
      ))}
    </div>
    <div className="h-96 bg-slate-900/50 border border-slate-800 rounded-2xl" />
  </div>
);

export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-pulse', className)}>
    <div className="h-4 w-24 bg-slate-800 rounded mb-4" />
    <div className="h-8 w-32 bg-slate-800 rounded mb-2" />
    <div className="h-4 w-16 bg-slate-800 rounded" />
  </div>
);

// ============================================================================
// Main Dashboard Layout
// ============================================================================

export function DashboardLayoutEnhanced({
  children,
  activeNavItem = 'dashboard',
  userName = 'User',
  userEmail = 'user@example.com',
  userAvatar,
  shopName = 'My Shop',
  notifications = [],
  onNavigate,
  onSearch,
  onNotificationClick,
  className,
  hideSidebar = false,
}: DashboardLayoutEnhancedProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar - Desktop */}
      {!hideSidebar && (
        <>
          <SidebarEnhanced
            activeItem={activeNavItem}
            onNavigate={onNavigate}
            userName={userName}
            userEmail={userEmail}
            shopName={shopName}
            notificationCount={unreadCount}
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            variant="desktop"
          />

          {/* Sidebar - Mobile */}
          <SidebarEnhanced
            activeItem={activeNavItem}
            onNavigate={onNavigate}
            userName={userName}
            userEmail={userEmail}
            shopName={shopName}
            notificationCount={unreadCount}
            variant="mobile"
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </>
      )}

      {/* Main Content Area */}
      <div 
        className={cn(
          'transition-all duration-300 ease-in-out min-h-screen flex flex-col',
          !hideSidebar && 'lg:ml-20 xl:ml-[280px]',
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
            console.log('Mark all notifications as read');
          }}
          onSettings={() => {
            onNavigate?.('settings');
            router.push('/dashboard/settings');
          }}
          onMobileMenuClick={() => setIsMobileMenuOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Page Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'flex-1 p-6 lg:p-8',
              className
            )}
          >
            <Suspense fallback={<PageSkeleton />}>
              {children}
            </Suspense>
          </motion.main>
        </AnimatePresence>

        {/* Footer */}
        <footer className="py-6 px-6 lg:px-8 border-t border-slate-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© 2024 QuoteGen. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default DashboardLayoutEnhanced;
