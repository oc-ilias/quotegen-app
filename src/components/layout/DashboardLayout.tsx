/**
 * Enhanced Dashboard Layout
 * Main layout wrapper with sidebar, header, content area, and comprehensive error handling
 * @module components/layout/DashboardLayout
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence, type Variants, type Transition } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar, type NavItemId } from '@/components/navigation/Sidebar';
import { Header, type Notification } from '@/components/layout/Header';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  Bars3Icon,
  HomeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

// Define HeroIcon type locally since it's not exported from @heroicons/react
type HeroIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;
import Link from 'next/link';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Props for the DashboardLayout component
 * @interface DashboardLayoutProps
 */
export interface DashboardLayoutProps {
  /** Child content to render in the layout */
  children: React.ReactNode;
  /** Currently active navigation item ID */
  activeNavItem?: NavItemId;
  /** User's display name */
  userName?: string;
  /** User's email address */
  userEmail?: string;
  /** URL to user's avatar image */
  userAvatar?: string;
  /** Shop/business name */
  shopName?: string;
  /** Array of notifications to display */
  notifications?: Notification[];
  /** Callback when navigation item is clicked */
  onNavigate?: (item: NavItemId) => void;
  /** Callback when search is performed */
  onSearch?: (query: string) => void;
  /** Callback when notification is clicked */
  onNotificationClick?: (notification: Notification) => void;
  /** Additional CSS class names */
  className?: string;
  /** Custom error boundary fallback content */
  errorFallback?: React.ReactNode;
  /** Whether the layout is in loading state */
  isLoading?: boolean;
  /** Whether mobile sidebar is open by default */
  defaultMobileSidebarOpen?: boolean;
  /** Callback when all notifications are marked as read */
  onMarkAllNotificationsRead?: () => void;
  /** Callback when settings is clicked */
  onSettings?: () => void;
  /** Callback when logout is clicked */
  onLogout?: () => void;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Page transition mode */
  transitionMode?: 'fade' | 'slide' | 'scale';
}

/**
 * Breadcrumb item configuration
 * @interface BreadcrumbItem
 */
export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** URL for the breadcrumb link (undefined for current page) */
  href?: string;
  /** Icon component to display before label */
  icon?: HeroIcon;
  /** Whether this is the active/current page */
  isActive?: boolean;
}

/**
 * Props for the PageHeader component
 * @interface PageHeaderProps
 */
export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Action buttons or elements */
  actions?: React.ReactNode;
  /** Breadcrumb navigation items */
  breadcrumbs?: BreadcrumbItem[];
  /** Additional CSS class names */
  className?: string;
  /** Back button URL (if provided, shows back button) */
  backHref?: string;
  /** Callback when back button is clicked */
  onBack?: () => void;
}

/**
 * Props for ContentGrid component
 * @interface ContentGridProps
 */
export interface ContentGridProps {
  /** Grid content */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Number of columns (1-4) */
  cols?: 1 | 2 | 3 | 4;
  /** Gap size between items */
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to use equal height items */
  equalHeight?: boolean;
  /** Responsive column configuration */
  responsive?: {
    sm?: 1 | 2 | 3 | 4;
    md?: 1 | 2 | 3 | 4;
    lg?: 1 | 2 | 3 | 4;
    xl?: 1 | 2 | 3 | 4;
  };
}

/**
 * Props for ContentSection component
 * @interface ContentSectionProps
 */
export interface ContentSectionProps {
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Section title */
  title?: string;
  /** Action element for the section header */
  action?: React.ReactNode;
  /** Section description */
  description?: string;
  /** Whether to add spacing at the bottom */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Animation delay for staggered effects */
  animationDelay?: number;
}

/**
 * Props for ContentCard component
 * @interface ContentCardProps
 */
export interface ContentCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to add hover effects */
  hover?: boolean;
  /** Whether the card is clickable */
  clickable?: boolean;
  /** Callback when card is clicked */
  onClick?: () => void;
  /** Card title (renders in header) */
  title?: string;
  /** Card header action */
  headerAction?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Props for NestedLayout component
 * @interface NestedLayoutProps
 */
export interface NestedLayoutProps {
  /** Child content */
  children: React.ReactNode;
  /** Nested sidebar content */
  sidebar?: React.ReactNode;
  /** Sidebar width in pixels */
  sidebarWidth?: number;
  /** Whether sidebar is collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// Error Boundary Component
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Callback when retry is clicked */
  onRetry?: () => void;
}

/**
 * Error boundary for catching and handling errors in the dashboard layout
 * @class DashboardErrorBoundary
 */
class DashboardErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <div data-testid="error-fallback">{this.props.fallback}</div>;
      }

      return (
        <div data-testid="error-fallback" className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-md w-full bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center shadow-2xl shadow-red-900/10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </motion.div>
            <h2 className="text-xl font-semibold text-slate-100 mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <pre className="text-xs text-slate-500 bg-slate-950 p-3 rounded-lg mb-4 overflow-auto max-h-32 text-left">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              {this.props.showRetry && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Try Again
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
              >
                Reload Page
              </motion.button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Animation Variants
// ============================================================================

const pageTransitionVariants: Record<string, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  },
  slide: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } 
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } 
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  },
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const breadcrumbVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

// ============================================================================
// Breadcrumb Component
// ============================================================================

/**
 * Enhanced breadcrumb navigation component
 * @param {Object} props - Component props
 * @param {BreadcrumbItem[]} props.items - Array of breadcrumb items
 * @returns {JSX.Element} Breadcrumbs component
 */
const Breadcrumbs: React.FC<{ items: BreadcrumbItem[]; className?: string }> = ({ 
  items,
  className 
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 text-sm text-slate-500 mb-4 overflow-x-auto scrollbar-hide', className)}
    >
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRightIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
              <motion.div
                custom={index}
                variants={breadcrumbVariants}
                initial="hidden"
                animate="visible"
              >
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {index === 0 && !Icon && <HomeIcon className="w-4 h-4" />}
                    {item.label}
                  </Link>
                ) : (
                  <span 
                    className={cn(
                      'flex items-center gap-1.5 whitespace-nowrap',
                      isLast ? 'text-slate-300 font-medium' : ''
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {item.label}
                  </span>
                )}
              </motion.div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// ============================================================================
// Page Header Component
// ============================================================================

/**
 * Page header component with title, subtitle, actions, and breadcrumbs
 * @param {PageHeaderProps} props - Component props
 * @returns {JSX.Element} PageHeader component
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  actions, 
  breadcrumbs,
  className,
  backHref,
  onBack,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={cn('mb-8', className)}
  >
    {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        {(backHref || onBack) && (
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronRightIcon className="w-5 h-5 rotate-180" />
          </motion.button>
        )}
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-2xl sm:text-3xl font-bold text-slate-100"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-1 text-slate-400"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>

      {actions && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-3 flex-wrap"
        >
          {actions}
        </motion.div>
      )}
    </div>
  </motion.div>
);

// ============================================================================
// Loading State Components
// ============================================================================

/**
 * Skeleton loader for stat cards
 */
const StatCardSkeleton: React.FC = () => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 w-24 bg-slate-800 rounded" />
      <div className="w-10 h-10 bg-slate-800 rounded-xl" />
    </div>
    <div className="h-8 w-16 bg-slate-800 rounded mb-2" />
    <div className="h-4 w-32 bg-slate-800 rounded" />
  </div>
);

/**
 * Comprehensive page loading skeleton
 */
const PageLoadingSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse" data-testid="page-loading-skeleton">
    {/* Header Skeleton */}
    <div className="space-y-2">
      <div className="h-4 w-48 bg-slate-800 rounded" />
      <div className="h-8 w-64 bg-slate-800 rounded" />
      <div className="h-4 w-96 bg-slate-800 rounded" />
    </div>

    {/* Stats Grid Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Content Area Skeleton */}
    <div className="h-96 bg-slate-900/50 border border-slate-800 rounded-2xl" />
  </div>
);

/**
 * Compact loading spinner for inline loading states
 */
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-indigo-500 border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

// ============================================================================
// Content Container Components
// ============================================================================

/**
 * Responsive grid container for content items
 * @param {ContentGridProps} props - Component props
 * @returns {JSX.Element} ContentGrid component
 */
export const ContentGrid: React.FC<ContentGridProps> = ({ 
  children, 
  className, 
  cols = 3, 
  gap = 'md',
  equalHeight = true,
  responsive,
}) => {
  const getColClasses = (columns: number) => {
    const colMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };
    return colMap[columns] || colMap[3];
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10',
  };

  // Build responsive classes if provided
  const responsiveClasses = responsive ? [
    responsive.sm && `sm:grid-cols-${responsive.sm}`,
    responsive.md && `md:grid-cols-${responsive.md}`,
    responsive.lg && `lg:grid-cols-${responsive.lg}`,
    responsive.xl && `xl:grid-cols-${responsive.xl}`,
  ].filter(Boolean).join(' ') : '';

  return (
    <div 
      className={cn(
        'grid',
        responsiveClasses || getColClasses(cols),
        gapClasses[gap],
        equalHeight && 'items-stretch',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Section container with optional title, description, and action
 * @param {ContentSectionProps} props - Component props
 * @returns {JSX.Element} ContentSection component
 */
export const ContentSection: React.FC<ContentSectionProps> = ({ 
  children, 
  className, 
  title, 
  action, 
  description,
  spacing = 'md',
  animationDelay = 0,
}) => {
  const spacingClasses = {
    none: '',
    sm: 'mb-4',
    md: 'mb-6',
    lg: 'mb-8',
  };

  return (
    <motion.section
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: animationDelay }}
      className={cn(spacingClasses[spacing], className)}
    >
      {(title || action || description) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-slate-200">{title}</h2>}
            {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </motion.section>
  );
};

/**
 * Card container with various styling options
 * @param {ContentCardProps} props - Component props
 * @returns {JSX.Element} ContentCard component
 */
export const ContentCard: React.FC<ContentCardProps> = ({ 
  children, 
  className, 
  padding = 'md', 
  hover = false,
  clickable = false,
  onClick,
  title,
  headerAction,
  footer,
  isLoading = false,
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const Component = clickable || onClick ? motion.button : motion.div;
  const componentProps = clickable || onClick ? {
    onClick,
    whileHover: hover ? { y: -4, transition: { duration: 0.2 } } : { scale: 1.01 },
    whileTap: { scale: 0.99 },
    type: 'button' as const,
  } : {
    whileHover: hover ? { y: -2, transition: { duration: 0.2 } } : undefined,
  };

  if (isLoading) {
    return (
      <div 
        role="status"
        aria-label="Loading"
        className={cn(
          'bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse',
          paddingClasses[padding],
          className
        )}
      >
        <div className="h-48 bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  return (
    <Component
      {...componentProps}
      className={cn(
        'bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden',
        'transition-all duration-300',
        hover && 'hover:border-slate-700 hover:shadow-lg hover:shadow-slate-900/50',
        clickable && 'cursor-pointer text-left',
        className
      )}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          {title && <h3 className="font-semibold text-slate-200">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={cn(paddingClasses[padding], (!title && !headerAction) && 'pt-6')}>{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-800/50 bg-slate-900/30">
          {footer}
        </div>
      )}
    </Component>
  );
};

// ============================================================================
// Nested Layout Component
// ============================================================================

/**
 * Nested layout component for sub-pages with their own sidebar
 * @param {NestedLayoutProps} props - Component props
 * @returns {JSX.Element} NestedLayout component
 */
export const NestedLayout: React.FC<NestedLayoutProps> = ({
  children,
  sidebar,
  sidebarWidth = 240,
  collapsible = true,
  defaultCollapsed = false,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={cn('flex min-h-[calc(100vh-80px)]', className)}>
      {sidebar && (
        <motion.aside
          initial={false}
          animate={{ width: isCollapsed ? 64 : sidebarWidth }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="border-r border-slate-800 bg-slate-950/50 flex-shrink-0"
        >
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-4 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200"
            >
              <ChevronRightIcon className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')} />
            </button>
          )}
          {sidebar}
        </motion.aside>
      )}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

// ============================================================================
// Mobile Layout Components
// ============================================================================

/**
 * Mobile header component
 */
const MobileHeader: React.FC<{
  onMenuClick: () => void;
  notificationCount?: number;
}> = ({ onMenuClick, notificationCount }) => (
  <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 lg:hidden">
    <div className="flex items-center justify-between px-4 py-3">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onMenuClick}
        className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Bars3Icon className="w-6 h-6" />
      </motion.button>

      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="font-semibold text-slate-100">QuoteGen</span>
      </Link>

      <div className="w-10 flex justify-end">
        {(notificationCount ?? 0) > 0 && (
          <span className="w-5 h-5 bg-indigo-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {(notificationCount ?? 0) > 9 ? '9+' : notificationCount}
          </span>
        )}
      </div>
    </div>
  </header>
);

// ============================================================================
// Main Dashboard Layout
// ============================================================================

/**
 * Main dashboard layout component with sidebar, header, and content area
 * @param {DashboardLayoutProps} props - Component props
 * @returns {JSX.Element} DashboardLayout component
 */
export function DashboardLayout({
  children,
  activeNavItem,
  userName,
  userEmail,
  userAvatar,
  shopName,
  notifications = [],
  onNavigate,
  onSearch,
  onNotificationClick,
  onMarkAllNotificationsRead,
  onSettings,
  onLogout,
  className,
  errorFallback,
  isLoading = false,
  defaultMobileSidebarOpen = false,
  loadingComponent,
  transitionMode = 'slide',
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(defaultMobileSidebarOpen);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [pageError, setPageError] = useState<Error | null>(null);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length,
    [notifications]
  );

  // Generate breadcrumbs from pathname
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const segments = pathname?.split('/').filter(Boolean) || [];
    const items: BreadcrumbItem[] = [{ label: 'Dashboard', href: '/dashboard', icon: HomeIcon }];

    const segmentLabels: Record<string, string> = {
      quotes: 'Quotes',
      'new': 'New Quote',
      templates: 'Templates',
      analytics: 'Analytics',
      settings: 'Settings',
      customers: 'Customers',
      profile: 'Profile',
      billing: 'Billing',
    };

    segments.forEach((segment, index) => {
      if (segment !== 'dashboard') {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        items.push({
          label: segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          href: isLast ? undefined : href,
          isActive: isLast,
        });
      }
    });

    return items;
  }, [pathname]);

  // Handle mobile sidebar close
  const handleMobileSidebarClose = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // Handle desktop sidebar toggle
  const handleDesktopSidebarToggle = useCallback(() => {
    setIsDesktopSidebarCollapsed(prev => !prev);
  }, []);

  // Handle navigation with page transition
  const handleNavigate = useCallback((item: NavItemId) => {
    setIsPageTransitioning(true);
    onNavigate?.(item);
    handleMobileSidebarClose();
    
    // Reset transition state after animation
    setTimeout(() => setIsPageTransitioning(false), 300);
  }, [onNavigate, handleMobileSidebarClose]);

  // Handle errors
  const handleError = useCallback((error: Error) => {
    setPageError(error);
    console.error('Dashboard layout error:', error);
  }, []);

  // Clear error when pathname changes
  useEffect(() => {
    setPageError(null);
  }, [pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileSidebarOpen(false);
      }
      // Toggle sidebar with Cmd/Ctrl + B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        if (window.innerWidth >= 1024) {
          handleDesktopSidebarToggle();
        } else {
          setIsMobileSidebarOpen(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDesktopSidebarToggle]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const transitionVariants = pageTransitionVariants[transitionMode];

  return (
    <DashboardErrorBoundary 
      onError={handleError}
      showRetry
      onRetry={() => setPageError(null)}
      fallback={errorFallback}
    >
      <div className="min-h-screen bg-slate-950">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={handleMobileSidebarClose}
                aria-hidden="true"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 h-full z-50 lg:hidden"
              >
                <Sidebar
                  variant="mobile"
                  activeItem={activeNavItem}
                  onNavigate={handleNavigate}
                  onClose={handleMobileSidebarClose}
                  userName={userName}
                  userEmail={userEmail}
                  userAvatar={userAvatar}
                  shopName={shopName}
                  notificationCount={unreadCount}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            isCollapsed={isDesktopSidebarCollapsed}
            onToggle={handleDesktopSidebarToggle}
            activeItem={activeNavItem}
            onNavigate={handleNavigate}
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            shopName={shopName}
            notificationCount={unreadCount}
          />
        </div>

        {/* Desktop Main Content Area */}
        <motion.div
          data-testid="dashboard-layout-desktop"
          initial={false}
          animate={{
            marginLeft: isDesktopSidebarCollapsed ? 80 : 280,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="hidden lg:block min-h-screen"
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
            onMarkAllRead={onMarkAllNotificationsRead}
            onSettings={onSettings}
            onLogout={onLogout}
          />

          {/* Page Content */}
          <motion.main
            data-testid="main-content-desktop"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
              'p-6 lg:p-8 min-h-[calc(100vh-80px)]',
              className
            )}
          >
            <Suspense fallback={loadingComponent || <PageLoadingSkeleton />}>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    data-testid="page-loading-skeleton-desktop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {loadingComponent || <PageLoadingSkeleton />}
                  </motion.div>
                ) : (
                  <motion.div
                    key={pathname || 'content'}
                    data-testid="page-content-desktop"
                    variants={transitionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {children}
                  </motion.div>
                )}
              </AnimatePresence>
            </Suspense>
          </motion.main>
        </motion.div>

        {/* Mobile Layout */}
        <div data-testid="dashboard-layout-mobile" className="lg:hidden min-h-screen flex flex-col">
          <MobileHeader 
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            notificationCount={unreadCount}
          />

          {/* Mobile Content */}
          <main data-testid="main-content-mobile" className={cn('flex-1 p-4', className)}>
            <Suspense fallback={loadingComponent || <PageLoadingSkeleton />}>
              <AnimatePresence mode="wait">
                {isLoading || isPageTransitioning ? (
                  <motion.div
                    key="loading"
                    data-testid="page-loading-skeleton-mobile"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {loadingComponent || <PageLoadingSkeleton />}
                  </motion.div>
                ) : (
                  <motion.div
                    key={pathname || 'content-mobile'}
                    data-testid="page-content-mobile"
                    variants={transitionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {children}
                  </motion.div>
                )}
              </AnimatePresence>
            </Suspense>
          </main>
        </div>
      </div>
    </DashboardErrorBoundary>
  );
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Hook for generating breadcrumbs from pathname
 * @param customItems - Optional custom breadcrumb items to override auto-generated ones
 * @returns Array of breadcrumb items
 */
export function useBreadcrumbs(customItems?: BreadcrumbItem[]): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    if (customItems) return customItems;

    const segments = pathname?.split('/').filter(Boolean) || [];
    const items: BreadcrumbItem[] = [{ label: 'Dashboard', href: '/dashboard' }];

    const segmentLabels: Record<string, string> = {
      quotes: 'Quotes',
      'new': 'New Quote',
      templates: 'Templates',
      analytics: 'Analytics',
      settings: 'Settings',
      customers: 'Customers',
    };

    segments.forEach((segment, index) => {
      if (segment !== 'dashboard') {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        items.push({
          label: segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          href: isLast ? undefined : href,
        });
      }
    });

    return items;
  }, [pathname, customItems]);
}

// Default export
export default DashboardLayout;
