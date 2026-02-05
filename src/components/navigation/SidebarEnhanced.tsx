/**
 * Enhanced Sidebar Navigation
 * Full-featured sidebar with mobile overlay, animations, and accessibility
 * @module components/navigation/SidebarEnhanced
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
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
  BellIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  Bars3Icon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/hooks/useToast';

// ============================================================================
// Types
// ============================================================================

export type NavItemId = 
  | 'dashboard' 
  | 'quotes' 
  | 'new-quote' 
  | 'templates' 
  | 'analytics' 
  | 'customers' 
  | 'emails' 
  | 'settings'
  | 'help';

export interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: 'red' | 'amber' | 'green' | 'blue';
  shortcut?: string;
  description?: string;
  children?: Omit<NavItem, 'children'>[];
  isNew?: boolean;
  isBeta?: boolean;
}

export interface SidebarProps {
  activeItem?: NavItemId;
  onNavigate?: (item: NavItemId) => void;
  userName?: string;
  userEmail?: string;
  shopName?: string;
  shopLogo?: string;
  notificationCount?: number;
  isCollapsed?: boolean;
  onToggle?: () => void;
  variant?: 'desktop' | 'mobile' | 'floating';
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  activeItem: NavItemId;
  setActiveItem: (item: NavItemId) => void;
}

// ============================================================================
// Navigation Configuration
// ============================================================================

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    shortcut: 'D',
    description: 'Overview and quick stats',
  },
  {
    id: 'quotes',
    label: 'Quotes',
    href: '/dashboard/quotes',
    icon: DocumentTextIcon,
    shortcut: 'Q',
    description: 'Manage all quotes',
    children: [
      { id: 'new-quote', label: 'Create New', href: '/dashboard/quotes/new', icon: PlusIcon },
      { id: 'quotes', label: 'View All', href: '/dashboard/quotes', icon: DocumentTextIcon },
    ],
  },
  {
    id: 'templates',
    label: 'Templates',
    href: '/dashboard/templates',
    icon: DocumentDuplicateIcon,
    shortcut: 'T',
    description: 'Quote templates library',
    isNew: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: ChartBarIcon,
    shortcut: 'A',
    description: 'Insights and reports',
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/dashboard/customers',
    icon: UsersIcon,
    shortcut: 'C',
    description: 'Customer management',
  },
  {
    id: 'emails',
    label: 'Emails',
    href: '/dashboard/emails',
    icon: EnvelopeIcon,
    shortcut: 'E',
    description: 'Email history and templates',
    badge: 0,
    badgeColor: 'blue',
  },
];

const bottomItems: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Cog6ToothIcon,
    shortcut: ',',
    description: 'App configuration',
  },
  {
    id: 'help',
    label: 'Help & Support',
    href: '/dashboard/help',
    icon: QuestionMarkCircleIcon,
    description: 'Documentation and support',
  },
];

// ============================================================================
// Animation Variants
// ============================================================================

const sidebarVariants = {
  expanded: {
    width: 280,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  collapsed: {
    width: 80,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: { duration: 0.15 }
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 500,
      damping: 30,
    }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: { duration: 0.15 }
  },
};

const mobileMenuVariants = {
  hidden: { 
    x: '-100%',
    transition: {
      type: 'tween',
      duration: 0.3,
    }
  },
  visible: { 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    }
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// ============================================================================
// Badge Component
// ============================================================================

interface BadgeProps {
  count: number;
  color?: 'red' | 'amber' | 'green' | 'blue';
  max?: number;
}

const Badge = ({ count, color = 'red', max = 99 }: BadgeProps) => {
  if (count <= 0) return null;
  
  const colorClasses = {
    red: 'bg-red-500 text-white',
    amber: 'bg-amber-500 text-white',
    green: 'bg-emerald-500 text-white',
    blue: 'bg-blue-500 text-white',
  };

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className={cn(
        'absolute -top-1 -right-1 min-w-[18px] h-[18px]',
        'flex items-center justify-center',
        'text-[10px] font-bold rounded-full',
        'shadow-lg shadow-black/20',
        colorClasses[color]
      )}
    >
      {count > max ? `${max}+` : count}
    </motion.span>
  );
};

// ============================================================================
// Nav Item Component
// ============================================================================

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  index: number;
  onClick: () => void;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const NavItemComponent = ({
  item,
  isActive,
  isCollapsed,
  index,
  onClick,
  hasChildren,
  isExpanded,
  onToggleExpand,
}: NavItemComponentProps) => {
  const Icon = item.icon;
  const hasBadge = item.badge && item.badge > 0;

  return (
    <motion.li
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      <Link
        href={item.href}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            onToggleExpand?.();
          } else {
            onClick();
          }
        }}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl',
          'transition-all duration-200 group relative',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
          isActive
            ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
        )}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex-shrink-0"
        >
          <Icon
            className={cn(
              'w-5 h-5 transition-colors duration-200',
              isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
            )}
          />
          {hasBadge && <Badge count={item.badge!} color={item.badgeColor} />}
        </motion.div>

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex items-center justify-between overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm whitespace-nowrap">
                  {item.label}
                </span>
                {item.isNew && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded-full">
                    NEW
                  </span>
                )}
                {item.isBeta && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-400 rounded-full">
                    BETA
                  </span>
                )}
              </div>
              
              {hasChildren && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeftIcon className="w-4 h-4 text-slate-500" />
                </motion.div>
              )}
              
              {item.shortcut && (
                <span className="text-xs text-slate-600 font-mono hidden group-hover:inline-block">
                  ⌘{item.shortcut}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div
            className={cn(
              'absolute left-full ml-3 px-3 py-2',
              'bg-slate-800 text-white text-sm rounded-lg',
              'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
              'transition-all duration-200 whitespace-nowrap z-50',
              'shadow-lg shadow-black/20 border border-slate-700'
            )}
          >
            {item.label}
            {item.shortcut && (
              <span className="ml-2 text-slate-400 font-mono text-xs">
                ⌘{item.shortcut}
              </span>
            )}
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-slate-700 rotate-45" />
          </div>
        )}
      </Link>

      {/* Children Dropdown */}
      <AnimatePresence>
        {!isCollapsed && hasChildren && isExpanded && item.children && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-4 mt-1 space-y-1 border-l border-slate-800 pl-4"
          >
            {item.children.map((child, childIndex) => (
              <motion.li
                key={child.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: childIndex * 0.05 }}
              >
                <Link
                  href={child.href}
                  onClick={onClick}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg',
                    'text-sm transition-colors',
                    'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <child.icon className="w-4 h-4" />
                  {child.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.li>
  );
};

// ============================================================================
// Create Menu Component
// ============================================================================

interface CreateMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

const CreateMenu = ({ isOpen, onClose, isCollapsed }: CreateMenuProps) => {
  const createOptions = [
    {
      label: 'New Quote',
      description: 'Create a custom quote',
      href: '/dashboard/quotes/new',
      icon: DocumentTextIcon,
      color: 'indigo',
    },
    {
      label: 'From Template',
      description: 'Start with a template',
      href: '/dashboard/quotes/new?template=true',
      icon: DocumentDuplicateIcon,
      color: 'purple',
    },
    {
      label: 'Quick Quote',
      description: 'Minimal details required',
      href: '/dashboard/quotes/new?quick=true',
      icon: SparklesIcon,
      color: 'amber',
    },
  ];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => isCollapsed ? window.location.href = '/dashboard/quotes/new' : undefined}
        className={cn(
          'w-full flex items-center justify-center gap-2',
          'bg-indigo-600 hover:bg-indigo-700 text-white font-medium',
          'py-3 px-4 rounded-xl transition-all duration-200',
          'shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
          isCollapsed && 'aspect-square p-0'
        )}
        aria-expanded={isOpen}
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

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && !isCollapsed && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={onClose}
            />
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                'absolute top-full left-0 right-0 mt-2',
                'bg-slate-800 rounded-xl shadow-xl border border-slate-700',
                'overflow-hidden z-50'
              )}
              role="menu"
            >
              {createOptions.map((option, index) => (
                <motion.div
                  key={option.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={option.href}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3',
                      'hover:bg-slate-700 transition-colors group',
                      index !== createOptions.length - 1 && 'border-b border-slate-700/50'
                    )}
                    onClick={onClose}
                    role="menuitem"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      'bg-slate-700 group-hover:bg-slate-600 transition-colors',
                      option.color === 'indigo' && 'text-indigo-400',
                      option.color === 'purple' && 'text-purple-400',
                      option.color === 'amber' && 'text-amber-400',
                    )}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{option.label}</div>
                      <div className="text-sm text-slate-400">{option.description}</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// User Profile Component
// ============================================================================

interface UserProfileProps {
  userName: string;
  userEmail: string;
  shopName: string;
  isCollapsed: boolean;
}

const UserProfile = ({ userName, userEmail, shopName, isCollapsed }: UserProfileProps) => {
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl',
        'bg-slate-800/50 hover:bg-slate-800 transition-colors',
        'cursor-pointer group',
        isCollapsed && 'justify-center'
      )}
    >
      <div className="relative">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0',
          'bg-gradient-to-br from-indigo-500 to-purple-600',
          'shadow-lg shadow-indigo-500/20'
        )}>
          {initials}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
      </div>

      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden flex-1 min-w-0"
          >
            <div className="font-medium text-white text-sm truncate">
              {shopName}
            </div>
            <div className="text-xs text-slate-400 truncate">{userEmail}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Main Sidebar Component
// ============================================================================

export function SidebarEnhanced({
  activeItem = 'dashboard',
  onNavigate,
  userName = 'User',
  userEmail = 'user@example.com',
  shopName = 'My Shop',
  notificationCount = 0,
  isCollapsed: controlledCollapsed,
  onToggle,
  variant = 'desktop',
  className,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const { showToast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Cmd/Ctrl + B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        handleToggle();
      }

      // Navigation shortcuts
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        const item = [...navigationItems, ...bottomItems].find(i => i.shortcut?.toLowerCase() === e.key.toLowerCase());
        if (item) {
          e.preventDefault();
          window.location.href = item.href;
        }
      }

      // Focus search with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggle = useCallback(() => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(prev => !prev);
    }
    
    showToast({
      title: isCollapsed ? 'Sidebar expanded' : 'Sidebar collapsed',
      duration: 2000,
    });
  }, [isCollapsed, onToggle, showToast]);

  const handleNavClick = useCallback((item: NavItem) => {
    onNavigate?.(item.id);
    if (variant === 'mobile') {
      onClose?.();
    }
  }, [onNavigate, variant, onClose]);

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const isActive = useCallback((item: NavItem) => {
    if (item.id === activeItem) return true;
    if (item.children?.some(child => child.id === activeItem)) return true;
    if (pathname === item.href) return true;
    if (item.children?.some(child => pathname === child.href)) return true;
    return false;
  }, [activeItem, pathname]);

  // Mobile Sidebar
  if (variant === 'mobile') {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={onClose}
            />

            {/* Sidebar */}
            <motion.aside
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={cn(
                'fixed inset-y-0 left-0 z-50 w-[280px]',
                'bg-slate-900 border-r border-slate-800',
                'flex flex-col',
                className
              )}
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-bold text-xl text-white">QuoteGen</span>
                </Link>

                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <CreateMenu 
                  isOpen={isCreateMenuOpen} 
                  onClose={() => setIsCreateMenuOpen(false)} 
                  isCollapsed={false}
                />

                <nav>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                    Main Menu
                  </p>
                  <ul className="space-y-1">
                    {navigationItems.map((item, index) => (
                      <NavItemComponent
                        key={item.id}
                        item={item}
                        isActive={isActive(item)}
                        isCollapsed={false}
                        index={index}
                        onClick={() => handleNavClick(item)}
                        hasChildren={!!item.children}
                        isExpanded={expandedItems.has(item.id)}
                        onToggleExpand={() => toggleExpanded(item.id)}
                      />
                    ))}
                  </ul>
                </nav>

                <nav>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                    Other
                  </p>
                  <ul className="space-y-1">
                    {bottomItems.map((item, index) => (
                      <NavItemComponent
                        key={item.id}
                        item={item}
                        isActive={isActive(item)}
                        isCollapsed={false}
                        index={index + navigationItems.length}
                        onClick={() => handleNavClick(item)}
                      />
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-slate-800">
                <UserProfile
                  userName={userName}
                  userEmail={userEmail}
                  shopName={shopName}
                  isCollapsed={false}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Sidebar
  return (
    <motion.aside
      variants={sidebarVariants}
      initial={isCollapsed ? 'collapsed' : 'expanded'}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col',
        'bg-slate-900 border-r border-slate-800',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-xl text-white whitespace-nowrap"
              >
                QuoteGen
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {onToggle && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggle}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden xl:block"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={`${isCollapsed ? 'Expand' : 'Collapse'} (⌘B)`}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </motion.div>
          </motion.button>
        )}
      </div>

      {/* Create Button */}
      <div className="p-4">
        <CreateMenu 
          isOpen={isCreateMenuOpen} 
          onClose={() => setIsCreateMenuOpen(false)} 
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Search */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4"
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search (⌘K)"
                className={cn(
                  'w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700',
                  'rounded-lg text-sm text-slate-200 placeholder-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
                  'transition-all'
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600">
                ⌘K
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3"
            >
              Main Menu
            </motion.p>
          )}
        </AnimatePresence>

        <ul className="space-y-1" role="menubar">
          {navigationItems.map((item, index) => (
            <NavItemComponent
              key={item.id}
              item={item}
              isActive={isActive(item)}
              isCollapsed={isCollapsed}
              index={index}
              onClick={() => handleNavClick(item)}
              hasChildren={!!item.children}
              isExpanded={expandedItems.has(item.id)}
              onToggleExpand={() => toggleExpanded(item.id)}
            />
          ))}
        </ul>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-3"
            >
              Other
            </motion.p>
          )}
        </AnimatePresence>

        <ul className="space-y-1" role="menubar">
          {bottomItems.map((item, index) => (
            <NavItemComponent
              key={item.id}
              item={item}
              isActive={isActive(item)}
              isCollapsed={isCollapsed}
              index={index + navigationItems.length}
              onClick={() => handleNavClick(item)}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <UserProfile
          userName={userName}
          userEmail={userEmail}
          shopName={shopName}
          isCollapsed={isCollapsed}
        />
      </div>
    </motion.aside>
  );
}

// ============================================================================
// Mobile Menu Toggle Button
// ============================================================================

export interface MobileMenuToggleProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function MobileMenuToggle({ isOpen, onClick, className }: MobileMenuToggleProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors',
        className
      )}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <XMarkIcon className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Bars3Icon className="w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ============================================================================
// Sidebar Provider
// ============================================================================

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState<NavItemId>('dashboard');

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapsed, activeItem, setActiveItem }}>
      {children}
    </SidebarContext.Provider>
  );
}

export default SidebarEnhanced;
