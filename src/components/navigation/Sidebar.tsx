/**
 * Sidebar Component
 * Navigation sidebar with collapsible state and mobile support
 * @module components/navigation/Sidebar
 */

'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  XMarkIcon,
  PlusIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

export type NavItemId = 'dashboard' | 'quotes' | 'new-quote' | 'templates' | 'analytics' | 'customers' | 'emails' | 'settings';

export interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface SidebarProps {
  activeItem?: NavItemId;
  onNavigate?: (item: NavItemId) => void;
  userName?: string;
  userEmail?: string;
  shopName?: string;
  notificationCount?: number;
  isCollapsed?: boolean;
  onToggle?: () => void;
  variant?: 'desktop' | 'mobile';
  className?: string;
}

// ============================================================================
// Navigation Items
// ============================================================================

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    id: 'quotes',
    label: 'Quotes',
    href: '/dashboard/quotes',
    icon: DocumentTextIcon,
  },
  {
    id: 'new-quote',
    label: 'New Quote',
    href: '/dashboard/quotes/new',
    icon: PlusIcon,
  },
  {
    id: 'templates',
    label: 'Templates',
    href: '/dashboard/templates',
    icon: DocumentDuplicateIcon,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: ChartBarIcon,
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/dashboard/customers',
    icon: UsersIcon,
  },
  {
    id: 'emails',
    label: 'Emails',
    href: '/dashboard/emails',
    icon: EnvelopeIcon,
    badge: 0,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Cog6ToothIcon,
  },
];

// ============================================================================
// Sidebar Component
// ============================================================================

export function Sidebar({
  activeItem = 'dashboard',
  onNavigate,
  userName = 'User',
  userEmail = 'user@example.com',
  shopName = 'My Shop',
  notificationCount = 0,
  isCollapsed = false,
  onToggle,
  variant = 'desktop',
  className,
}: SidebarProps) {
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  const toggleCreateMenu = useCallback(() => {
    setIsCreateMenuOpen((prev) => !prev);
  }, []);

  const closeCreateMenu = useCallback(() => {
    setIsCreateMenuOpen(false);
  }, []);

  const handleNavClick = useCallback(
    (item: NavItem) => {
      onNavigate?.(item.id);
      if (variant === 'mobile') {
        onToggle?.();
      }
    },
    [onNavigate, onToggle, variant]
  );

  const isActive = useCallback(
    (item: NavItem) => {
      return activeItem === item.id;
    },
    [activeItem]
  );

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col',
        'bg-slate-900 border-r border-slate-800',
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-xl text-white whitespace-nowrap overflow-hidden"
              >
                QuoteGen
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {variant === 'mobile' && (
          <button
            onClick={onToggle}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}

        {variant === 'desktop' && onToggle && (
          <button
            onClick={onToggle}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden xl:block"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </motion.div>
          </button>
        )}
      </div>

      {/* Create New Button */}
      <div className="p-4">
        <div className="relative">
          <motion.button
            onClick={toggleCreateMenu}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'w-full flex items-center justify-center gap-2',
              'bg-indigo-600 hover:bg-indigo-700 text-white font-medium',
              'py-3 px-4 rounded-xl transition-colors'
            )}
            aria-expanded={isCreateMenuOpen}
            aria-haspopup="menu"
          >
            <PlusIcon className="w-5 h-5" />

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Create Quote
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Create Menu Dropdown */}
          <AnimatePresence>
            {isCreateMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={closeCreateMenu}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute top-full left-0 right-0 mt-2',
                    'bg-slate-800 rounded-xl shadow-lg border border-slate-700',
                    'overflow-hidden z-50'
                  )}
                  role="menu"
                >
                  <Link
                    href="/dashboard/quotes/new"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors"
                    onClick={closeCreateMenu}
                    role="menuitem"
                  >
                    <DocumentTextIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-medium text-white">New Quote</div>
                      <div className="text-sm text-slate-400">
                        Create a custom quote
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/quotes/new?template=true"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors"
                    onClick={closeCreateMenu}
                    role="menuitem"
                  >
                    <DocumentDuplicateIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-medium text-white">From Template</div>
                      <div className="text-sm text-slate-400">
                        Start with a template
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 px-3 py-2 overflow-y-auto"
        aria-label="Main navigation"
      >
        <ul className="space-y-1" role="menubar">
          {navigationItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;

            return (
              <li key={item.id} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  onClick={() => handleNavClick(item)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                    'transition-all duration-200 group',
                    active
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Icon
                      className={cn(
                        'w-6 h-6 transition-colors',
                        active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                      )}
                    />

                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl bg-slate-800/50',
            isCollapsed ? 'justify-center' : ''
          )}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <div className="font-medium text-white text-sm truncate">
                  {shopName}
                </div>
                <div className="text-xs text-slate-400 truncate">{userEmail}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
