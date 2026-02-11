/**
 * Dashboard Layout Component
 * Main layout wrapper for dashboard views with sidebar integration
 * @module components/dashboard/DashboardLayout
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { NavItemId } from '@/types/quote';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  SparklesIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

/**
 * Navigation item configuration
 */
export interface NavigationItem {
  id: NavItemId;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  shortcut?: string;
}

/**
 * User profile information
 */
export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

/**
 * Notification item for header
 */
export interface DashboardNotification {
  id: string;
  title: string;
  message?: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
}

/**
 * Props for DashboardLayout component
 */
export interface DashboardLayoutProps {
  /** Child components to render in main content area */
  children: React.ReactNode;
  /** Currently active navigation item */
  activeItem?: NavItemId;
  /** User profile information */
  user?: UserProfile;
  /** Shop/organization name */
  shopName?: string;
  /** Array of notifications */
  notifications?: DashboardNotification[];
  /** Callback when navigation item is clicked */
  onNavigate?: (item: NavItemId) => void;
  /** Callback when search is triggered */
  onSearch?: (query: string) => void;
  /** Callback when notification is clicked */
  onNotificationClick?: (notification: DashboardNotification) => void;
  /** Callback when mark all notifications as read */
  onMarkAllRead?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Page title for header */
  pageTitle?: string;
  /** Page subtitle/description */
  pageSubtitle?: string;
  /** Header actions (buttons, etc.) */
  headerActions?: React.ReactNode;
  /** Whether to show the sidebar (can be used to hide on auth pages) */
  showSidebar?: boolean;
  /** Whether the layout is in loading state */
  isLoading?: boolean;
}

// ============================================================================
// Navigation Configuration
// ============================================================================

const DEFAULT_NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    shortcut: '⌘D',
  },
  {
    id: 'quotes',
    label: 'Quotes',
    href: '/quotes',
    icon: DocumentTextIcon,
    shortcut: '⌘Q',
  },
  {
    id: 'templates',
    label: 'Templates',
    href: '/templates',
    icon: SparklesIcon,
    shortcut: '⌘T',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    shortcut: '⌘A',
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/customers',
    icon: UsersIcon,
    shortcut: '⌘C',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    shortcut: '⌘,',
  },
];

// ============================================================================
// Sidebar Component
// ============================================================================

interface SidebarProps {
  items: NavigationItem[];
  activeItem: NavItemId;
  onNavigate?: (item: NavItemId) => void;
  shopName?: string;
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
}

/**
 * Sidebar navigation component
 */
const Sidebar = ({
  items,
  activeItem,
  onNavigate,
  shopName,
  isOpen,
  onClose,
  user,
}: SidebarProps) => {
  const handleNavigate = useCallback(
    (item: NavigationItem) => {
      onNavigate?.(item.id);
      onClose();
    },
    [onNavigate, onClose]
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72',
          'bg-slate-900 border-r border-slate-800',
          'flex flex-col',
          'lg:translate-x-0 lg:static lg:h-screen'
        )}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100">QuoteGen</h1>
              {shopName && (
                <p className="text-xs text-slate-500 truncate max-w-[140px]">{shopName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close navigation"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Dashboard navigation">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                  'text-left transition-all duration-200',
                  'group relative',
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.shortcut && (
                  <kbd className="hidden xl:block px-1.5 py-0.5 text-xs text-slate-500 bg-slate-800 rounded">
                    {item.shortcut}
                  </kbd>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User Section */}
        {user && (
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-indigo-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-200 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
};

// ============================================================================
// Header Component
// ============================================================================

interface HeaderProps {
  user?: UserProfile;
  notifications: DashboardNotification[];
  onSearch?: (query: string) => void;
  onNotificationClick?: (notification: DashboardNotification) => void;
  onMarkAllRead?: () => void;
  onMenuClick: () => void;
  pageTitle?: string;
  pageSubtitle?: string;
  headerActions?: React.ReactNode;
}

/**
 * Top header component with search and notifications
 */
const Header = ({
  user,
  notifications,
  onSearch,
  onNotificationClick,
  onMarkAllRead,
  onMenuClick,
  pageTitle,
  pageSubtitle,
  headerActions,
}: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(searchQuery);
    },
    [onSearch, searchQuery]
  );

  const getNotificationIcon = (type: DashboardNotification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400';
      case 'error':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-blue-500/10 text-blue-400';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <div className="flex items-center gap-4 px-4 lg:px-8 py-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Open navigation"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Page Title (Mobile) */}
        <div className="lg:hidden">
          <h1 className="font-semibold text-slate-100">{pageTitle || 'Dashboard'}</h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md">
          <div className="relative w-full">
            <MagnifyingGlassIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search quotes, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-xl',
                'bg-slate-900 border border-slate-800',
                'text-slate-200 placeholder-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40',
                'transition-all duration-200'
              )}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs text-slate-500 bg-slate-800 rounded">
              ⌘K
            </kbd>
          </div>
        </form>

        {/* Spacer */}
        <div className="flex-1 lg:flex-none" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                'relative p-2 rounded-lg transition-colors',
                showNotifications
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              aria-expanded={showNotifications}
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50"
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
                      <div className="p-8 text-center">
                        <p className="text-sm text-slate-500">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => {
                            onNotificationClick?.(notification);
                            setShowNotifications(false);
                          }}
                          className={cn(
                            'w-full flex items-start gap-3 p-4 text-left',
                            'hover:bg-slate-800/50 transition-colors',
                            !notification.read && 'bg-slate-800/30'
                          )}
                        >
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full mt-2',
                              getNotificationIcon(notification.type)
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200">
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-slate-600 mt-1">
                              {notification.timestamp}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Custom Header Actions */}
          {headerActions}
        </div>
      </div>

      {/* Page Header (Desktop) */}
      {(pageTitle || pageSubtitle) && (
        <div className="hidden lg:block px-4 lg:px-8 pb-4">
          {pageTitle && <h1 className="text-2xl font-bold text-slate-100">{pageTitle}</h1>}
          {pageSubtitle && <p className="mt-1 text-slate-400">{pageSubtitle}</p>}
        </div>
      )}
    </header>
  );
};

// ============================================================================
// Main Dashboard Layout
// ============================================================================

/**
 * Main dashboard layout component with integrated sidebar, header, and responsive design.
 * Provides a complete dashboard shell with navigation, search, and notifications.
 * 
 * @example
 * ```tsx
 * <DashboardLayout
 *   activeItem="dashboard"
 *   user={{ name: 'John Doe', email: 'john@example.com' }}
 *   pageTitle="Dashboard"
 *   pageSubtitle="Welcome back! Here's what's happening."
 * >
 *   <DashboardContent />
 * </DashboardLayout>
 * ```
 */
export function DashboardLayout({
  children,
  activeItem = 'dashboard',
  user,
  shopName,
  notifications = [],
  onNavigate,
  onSearch,
  onNotificationClick,
  onMarkAllRead,
  className,
  pageTitle,
  pageSubtitle,
  headerActions,
  showSidebar = true,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search input
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn('min-h-screen bg-slate-950', className)}>
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-500 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {showSidebar && (
        <Sidebar
          items={DEFAULT_NAVIGATION}
          activeItem={activeItem}
          onNavigate={onNavigate}
          shopName={shopName}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
        />
      )}

      {/* Main Content Area */}
      <div className={cn('transition-all duration-300', showSidebar && 'lg:ml-72')}>
        <Header
          user={user}
          notifications={notifications}
          onSearch={onSearch}
          onNotificationClick={onNotificationClick}
          onMarkAllRead={onMarkAllRead}
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          headerActions={headerActions}
        />

        <main
          id="main-content"
          className="p-4 lg:p-8 min-h-[calc(100vh-64px)]"
          tabIndex={-1}
        >
          <DashboardErrorBoundary componentName="Dashboard Content">
            {children}
          </DashboardErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
