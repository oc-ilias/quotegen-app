/**
 * Enhanced Sidebar Navigation Component
 * 
 * A feature-rich navigation sidebar with collapsible state, mobile support,
 * comprehensive error handling, and smooth animations.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Sidebar />
 * 
 * // With user info and notifications
 * <Sidebar 
 *   userName="John Doe"
 *   userEmail="john@example.com"
 *   shopName="Acme Corp"
 *   notificationCount={5}
 * />
 * 
 * // Mobile variant
 * <Sidebar 
 *   variant="mobile"
 *   onClose={() => setIsOpen(false)}
 * />
 * 
 * // With error handling
 * <Sidebar 
 *   error={sidebarError}
 *   onRetry={fetchSidebarData}
 * />
 * ```
 * 
 * @module components/navigation/Sidebar
 */

'use client';

import React, { 
  useState, 
  useCallback, 
  useMemo, 
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, type Variants, type Transition } from 'framer-motion';
import {
  HomeIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  CogIcon,
  ChevronLeftIcon,
  XMarkIcon,
  PlusIcon,
  UsersIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  DocumentDuplicateIcon as DocumentDuplicateIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CogIcon as CogIconSolid,
  UsersIcon as UsersIconSolid,
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Valid navigation item IDs for type-safe navigation
 */
export type NavItemId = 'dashboard' | 'quotes' | 'templates' | 'analytics' | 'settings' | 'customers';

/**
 * Badge color variants for notification badges
 */
export type BadgeColor = 'red' | 'orange' | 'green' | 'blue' | 'purple' | 'gray';

/**
 * Sidebar display variant
 */
export type SidebarVariant = 'desktop' | 'mobile' | 'floating';

/**
 * Icon component type - accepts className for styling
 */
export type IconComponent = ComponentType<{ className?: string }>;

/**
 * Navigation item configuration
 */
export interface NavItem {
  /** Unique identifier for the navigation item */
  id: NavItemId;
  /** Display label for the navigation item */
  label: string;
  /** Route href for navigation */
  href: string;
  /** Icon component for inactive state */
  icon: IconComponent;
  /** Icon component for active state */
  activeIcon: IconComponent;
  /** Optional badge count to display */
  badge?: number;
  /** Badge color variant */
  badgeColor?: BadgeColor;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether authentication is required */
  requiresAuth?: boolean;
  /** Optional keyboard shortcut (e.g., '⌘1', 'Ctrl+2') */
  shortcut?: string;
}

/**
 * Create menu item configuration
 */
export interface CreateMenuItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Description text */
  description: string;
  /** Route href */
  href: string;
  /** Icon component */
  icon: IconComponent;
  /** Optional keyboard shortcut */
  shortcut?: string;
}

/**
 * Tooltip configuration
 */
export interface TooltipConfig {
  /** Tooltip position relative to trigger */
  position?: 'right' | 'left' | 'top' | 'bottom';
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Whether to show arrow */
  showArrow?: boolean;
}

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcuts {
  /** Toggle sidebar collapse (default: Cmd/Ctrl+B) */
  toggleCollapse?: string;
  /** Open create menu (default: Cmd/Ctrl+N) */
  openCreateMenu?: string;
  /** Navigate to dashboard (default: Cmd/Ctrl+Shift+D) */
  goToDashboard?: string;
  /** Navigate to quotes (default: Cmd/Ctrl+Shift+Q) */
  goToQuotes?: string;
  /** Close modal/menu (default: Escape) */
  close?: string;
}

/**
 * Sidebar component props
 */
export interface SidebarProps {
  /** Whether sidebar is in collapsed state (controlled) */
  isCollapsed?: boolean;
  /** Callback when sidebar toggle is clicked */
  onToggle?: () => void;
  /** Currently active navigation item (controlled) */
  activeItem?: NavItemId;
  /** Sidebar variant - desktop, mobile, or floating */
  variant?: SidebarVariant;
  /** Callback when navigation occurs */
  onNavigate?: (item: NavItemId) => void;
  /** User display name */
  userName?: string;
  /** User email address */
  userEmail?: string;
  /** User avatar URL */
  userAvatar?: string;
  /** Shop/business name */
  shopName?: string;
  /** Number of unread notifications */
  notificationCount?: number;
  /** Error state for sidebar */
  error?: Error | null;
  /** Loading state */
  isLoading?: boolean;
  /** Callback to retry after error */
  onRetry?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Callback when mobile menu should close */
  onClose?: () => void;
  /** Whether sidebar is initially collapsed */
  defaultCollapsed?: boolean;
  /** Custom navigation items (replaces defaults) */
  customNavItems?: NavItem[];
  /** Custom create menu items (replaces defaults) */
  customCreateItems?: CreateMenuItem[];
  /** Tooltip configuration */
  tooltipConfig?: TooltipConfig;
  /** Keyboard shortcut configuration */
  keyboardShortcuts?: KeyboardShortcuts;
  /** Whether to disable all keyboard shortcuts */
  disableKeyboardShortcuts?: boolean;
  /** Whether to persist collapse state in localStorage */
  persistState?: boolean;
  /** Storage key for persistence (default: 'sidebar-collapsed') */
  storageKey?: string;
  /** Callback when sidebar is fully expanded */
  onExpandComplete?: () => void;
  /** Callback when sidebar is fully collapsed */
  onCollapseComplete?: () => void;
}

/**
 * Sidebar imperative handle for external control
 */
export interface SidebarHandle {
  /** Toggle sidebar collapsed state */
  toggle: () => void;
  /** Expand sidebar */
  expand: () => void;
  /** Collapse sidebar */
  collapse: () => void;
  /** Navigate to specific item */
  navigateTo: (itemId: NavItemId) => void;
  /** Open create menu */
  openCreateMenu: () => void;
  /** Close create menu */
  closeCreateMenu: () => void;
  /** Get current collapsed state */
  isCollapsed: boolean;
}

// ============================================================================
// Animation Variants
// ============================================================================

/**
 * Sidebar container animation variants
 */
const sidebarVariants: Variants = {
  expanded: {
    width: 280,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    } as Transition,
  },
  collapsed: {
    width: 80,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    } as Transition,
  },
  mobileOpen: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 35,
    } as Transition,
  },
  mobileClosed: {
    x: '-100%',
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 35,
    } as Transition,
  },
};

/**
 * Text content animation variants (fade and slide)
 */
const textVariants: Variants = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94],
    } as Transition,
  },
  hidden: {
    opacity: 0,
    x: -12,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    } as Transition,
  },
};

/**
 * Dropdown menu animation variants
 */
const menuVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: {
      duration: 0.12,
    } as Transition,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 450,
      damping: 28,
    } as Transition,
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: {
      duration: 0.1,
    } as Transition,
  },
};

/**
 * Navigation item animation variants with stagger
 */
const navItemVariants: Variants = {
  initial: { 
    opacity: 0, 
    x: -20,
  },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    } as Transition,
  }),
  hover: {
    scale: 1.02,
    transition: { duration: 0.15 },
  },
  tap: {
    scale: 0.98,
  },
};

/**
 * Tooltip animation variants
 */
const tooltipVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -8,
    scale: 0.95,
    transition: {
      duration: 0.1,
    } as Transition,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    } as Transition,
  },
  exit: {
    opacity: 0,
    x: -4,
    scale: 0.98,
    transition: {
      duration: 0.08,
    } as Transition,
  },
};

/**
 * Overlay animation variants
 */
const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.2,
    } as Transition,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25,
    } as Transition,
  },
};

/**
 * Skeleton pulse animation variants
 */
const skeletonVariants: Variants = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    } as Transition,
  },
};

// ============================================================================
// Configuration Constants
// ============================================================================

/**
 * Default navigation items configuration
 */
const DEFAULT_NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
    shortcut: '⌘⇧D',
  },
  {
    id: 'quotes',
    label: 'Quotes',
    href: '/quotes',
    icon: DocumentTextIcon,
    activeIcon: DocumentTextIconSolid,
    badge: 0,
    shortcut: '⌘⇧Q',
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/customers',
    icon: UsersIcon,
    activeIcon: UsersIconSolid,
  },
  {
    id: 'templates',
    label: 'Templates',
    href: '/templates',
    icon: DocumentDuplicateIcon,
    activeIcon: DocumentDuplicateIconSolid,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: CogIcon,
    activeIcon: CogIconSolid,
  },
];

/**
 * Default create menu items configuration
 */
const DEFAULT_CREATE_MENU_ITEMS: CreateMenuItem[] = [
  {
    id: 'new-quote',
    label: 'New Quote',
    description: 'Create a custom quote from scratch',
    href: '/quotes/new',
    icon: DocumentTextIcon,
    shortcut: '⌘N',
  },
  {
    id: 'from-template',
    label: 'From Template',
    description: 'Start with a pre-built template',
    href: '/quotes/new?template=true',
    icon: DocumentDuplicateIcon,
    shortcut: '⌘T',
  },
];

/**
 * Badge color class mapping
 */
const BADGE_COLOR_CLASSES: Record<BadgeColor, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  green: 'bg-emerald-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  gray: 'bg-slate-500',
};

/**
 * Default keyboard shortcuts
 */
const DEFAULT_KEYBOARD_SHORTCUTS: Required<KeyboardShortcuts> = {
  toggleCollapse: 'b',
  openCreateMenu: 'n',
  goToDashboard: 'D',
  goToQuotes: 'Q',
  close: 'Escape',
};

/**
 * Default tooltip configuration
 */
const DEFAULT_TOOLTIP_CONFIG: Required<TooltipConfig> = {
  position: 'right',
  delay: 300,
  showArrow: true,
};

// ============================================================================
// Error Boundary Component
// ============================================================================

/**
 * Props for ErrorBoundary
 */
interface ErrorBoundaryProps {
  /** Child components */
  children: ReactNode;
  /** Fallback UI when error occurs */
  fallback?: ReactNode;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * State for ErrorBoundary
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for catching React errors
 */
class SidebarErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Sidebar Error Boundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <SidebarError 
            error={this.state.error || new Error('Unknown error')} 
            onRetry={() => this.setState({ hasError: false, error: null })}
            variant="desktop"
          />
        )
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Utility Components
// ============================================================================

/**
 * SidebarSkeleton - Loading state component
 * Displays animated skeleton placeholders while sidebar content loads
 */
const SidebarSkeleton: React.FC<{ variant: SidebarVariant }> = ({ variant }) => (
  <motion.div 
    className="h-full flex flex-col"
    variants={skeletonVariants}
    animate="animate"
  >
    {/* Header Skeleton */}
    <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 rounded-xl animate-pulse" />
        {variant !== 'mobile' && <div className="h-6 w-24 bg-slate-800 rounded animate-pulse" />}
      </div>
      {variant === 'mobile' && <div className="w-6 h-6 bg-slate-800 rounded animate-pulse" />}
    </div>

    {/* Create Button Skeleton */}
    <div className="p-4">
      <div className="h-12 bg-slate-800 rounded-xl animate-pulse" />
    </div>

    {/* Nav Items Skeleton */}
    <nav className="flex-1 px-3 py-2 space-y-2" aria-label="Loading navigation">
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="w-6 h-6 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
        </div>
      ))}
    </nav>

    {/* Footer Skeleton */}
    <div className="p-4 border-t border-slate-800/50">
      <div className="flex items-center gap-3 p-3 rounded-xl">
        <div className="w-10 h-10 bg-slate-800 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </motion.div>
);

/**
 * SidebarError - Error state component
 * Displays error message with retry option
 */
const SidebarError: React.FC<{
  error: Error;
  onRetry?: () => void;
  variant: SidebarVariant;
}> = ({ error, onRetry, variant }) => (
  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="mb-4"
    >
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
        <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
      </div>
    </motion.div>
    
    <h3 className="text-lg font-semibold text-slate-200 mb-2">Sidebar Error</h3>
    <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed">
      {error.message || 'Failed to load sidebar content. Please try again.'}
    </p>
    
    {onRetry && (
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-indigo-500/20"
        aria-label="Retry loading sidebar"
      >
        <ArrowPathIcon className="w-4 h-4" />
        Retry
      </motion.button>
    )}
  </div>
);

/**
 * NavBadge - Navigation badge component
 * Displays count badges on navigation items
 */
const NavBadge: React.FC<{ count: number; color?: BadgeColor }> = ({ count, color = 'red' }) => {
  if (count <= 0) return null;

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={cn(
        'absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1',
        BADGE_COLOR_CLASSES[color],
        'text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm'
      )}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
};

/**
 * Tooltip component for collapsed sidebar state
 */
const SidebarTooltip: React.FC<{
  children: ReactNode;
  content: string;
  shortcut?: string;
  isVisible: boolean;
  config?: TooltipConfig;
}> = ({ children, content, shortcut, isVisible, config }) => {
  const mergedConfig = { ...DEFAULT_TOOLTIP_CONFIG, ...config };
  
  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'absolute left-full ml-3 px-3 py-2 bg-slate-800 text-slate-200 text-sm rounded-lg whitespace-nowrap z-50 shadow-xl border border-slate-700',
              'flex items-center gap-2'
            )}
            style={{ top: '50%', transform: 'translateY(-50%)' }}
            role="tooltip"
          >
            <span>{content}</span>
            {shortcut && (
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-slate-700 text-slate-300 rounded">
                {shortcut}
              </kbd>
            )}
            {mergedConfig.showArrow && (
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Mobile overlay component
 */
const MobileOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        aria-hidden="true"
      />
    )}
  </AnimatePresence>
);

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook to handle localStorage persistence
 */
const usePersistentState = (
  key: string,
  defaultValue: boolean,
  persist: boolean
): [boolean, (value: boolean) => void] => {
  const [state, setState] = useState<boolean>(() => {
    if (!persist || typeof window === 'undefined') return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistentState = useCallback((value: boolean) => {
    setState(value);
    if (persist && typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('Failed to persist sidebar state:', e);
      }
    }
  }, [key, persist]);

  return [state, setPersistentState];
};

/**
 * Hook to detect mobile viewport
 */
const useMobileDetect = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// ============================================================================
// Main Sidebar Component
// ============================================================================

/**
 * Sidebar navigation component
 * 
 * Features:
 * - Collapsible desktop sidebar with smooth animations
 * - Mobile slide-out drawer with overlay
 * - Keyboard navigation shortcuts (Cmd/Ctrl+B to toggle, etc.)
 * - Loading skeleton states
 * - Error boundaries with retry functionality
 * - Tooltip system for collapsed state
 * - Accessible with ARIA attributes
 * 
 * @param props - Sidebar configuration props
 * @returns Sidebar component
 */
export const Sidebar = forwardRef<SidebarHandle, SidebarProps>(
  ({
    isCollapsed: controlledCollapsed,
    onToggle,
    activeItem: controlledActiveItem,
    variant = 'desktop',
    onNavigate,
    userName = 'User',
    userEmail,
    userAvatar,
    shopName = 'My Shop',
    notificationCount = 0,
    error,
    isLoading = false,
    onRetry,
    className,
    onClose,
    defaultCollapsed = false,
    customNavItems,
    customCreateItems,
    tooltipConfig,
    keyboardShortcuts = DEFAULT_KEYBOARD_SHORTCUTS,
    disableKeyboardShortcuts = false,
    persistState = true,
    storageKey = 'sidebar-collapsed',
    onExpandComplete,
    onCollapseComplete,
  }, ref) => {
    // Internal state
    const pathname = usePathname();
    const [internalCollapsed, setInternalCollapsed] = usePersistentState(
      storageKey,
      defaultCollapsed,
      persistState
    );
    const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [createMenuHovered, setCreateMenuHovered] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    
    const sidebarRef = useRef<HTMLElement>(null);
    const createButtonRef = useRef<HTMLButtonElement>(null);
    const isMobile = useMobileDetect();

    // Use controlled or internal collapsed state
    const isCollapsed = controlledCollapsed ?? internalCollapsed;

    // Determine active item from pathname if not controlled
    const activeItem = useMemo<NavItemId>(() => {
      if (controlledActiveItem) return controlledActiveItem;
      
      const path = pathname?.split('/')[1];
      const itemMap: Record<string, NavItemId> = {
        dashboard: 'dashboard',
        quotes: 'quotes',
        customers: 'customers',
        templates: 'templates',
        analytics: 'analytics',
        settings: 'settings',
      };
      return itemMap[path] || 'dashboard';
    }, [controlledActiveItem, pathname]);

    // Get navigation items
    const navigationItems = useMemo(() => customNavItems || DEFAULT_NAVIGATION_ITEMS, [customNavItems]);
    const createMenuItems = useMemo(() => customCreateItems || DEFAULT_CREATE_MENU_ITEMS, [customCreateItems]);

    // Get user initials
    const userInitials = useMemo(() => {
      if (!userName || userName === 'User') return 'U';
      return userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }, [userName]);

    // Show text only when not collapsed (desktop) or always (mobile)
    const showText = variant === 'mobile' || !isCollapsed;

    // Handle toggle
    const handleToggle = useCallback(() => {
      if (onToggle) {
        onToggle();
      } else {
        setInternalCollapsed(!isCollapsed);
      }
    }, [onToggle, isCollapsed, setInternalCollapsed]);

    // Expand sidebar
    const expand = useCallback(() => {
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(false);
      }
      onExpandComplete?.();
    }, [controlledCollapsed, setInternalCollapsed, onExpandComplete]);

    // Collapse sidebar
    const collapse = useCallback(() => {
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(true);
      }
      onCollapseComplete?.();
    }, [controlledCollapsed, setInternalCollapsed, onCollapseComplete]);

    // Close create menu
    const closeCreateMenu = useCallback(() => {
      setIsCreateMenuOpen(false);
      setCreateMenuHovered(false);
    }, []);

    // Open create menu
    const openCreateMenu = useCallback(() => {
      setIsCreateMenuOpen(true);
    }, []);

    // Handle navigation
    const handleNavigate = useCallback((itemId: NavItemId, e?: ReactMouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      onNavigate?.(itemId);
      
      if (variant === 'mobile') {
        setIsMobileOpen(false);
        onClose?.();
      }
    }, [onNavigate, onClose, variant]);

    // Navigate to specific item
    const navigateTo = useCallback((itemId: NavItemId) => {
      const item = navigationItems.find(i => i.id === itemId);
      if (item) {
        handleNavigate(itemId);
      }
    }, [navigationItems, handleNavigate]);

    // Check if item is active (only used when no controlled activeItem)
    const isItemActive = useCallback((href: string) => {
      // Skip pathname detection if activeItem is controlled
      if (controlledActiveItem) return false;
      
      if (href === '/dashboard') {
        return pathname === '/dashboard' || pathname === '/';
      }
      return pathname?.startsWith(href);
    }, [pathname, controlledActiveItem]);

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      toggle: handleToggle,
      expand,
      collapse,
      navigateTo,
      openCreateMenu,
      closeCreateMenu,
      isCollapsed,
    }), [handleToggle, expand, collapse, navigateTo, openCreateMenu, closeCreateMenu, isCollapsed]);

    // Keyboard shortcuts
    useEffect(() => {
      if (disableKeyboardShortcuts) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        const isModKey = e.metaKey || e.ctrlKey;
        const isShiftKey = e.shiftKey;
        const mergedShortcuts = { ...DEFAULT_KEYBOARD_SHORTCUTS, ...keyboardShortcuts };

        // Toggle sidebar (Cmd/Ctrl+B)
        if (isModKey && !isShiftKey && e.key.toLowerCase() === mergedShortcuts.toggleCollapse.toLowerCase()) {
          e.preventDefault();
          handleToggle();
        }

        // Open create menu (Cmd/Ctrl+N)
        if (isModKey && !isShiftKey && e.key.toLowerCase() === mergedShortcuts.openCreateMenu.toLowerCase()) {
          e.preventDefault();
          setIsCreateMenuOpen(true);
        }

        // Navigate to dashboard (Cmd/Ctrl+Shift+D)
        if (isModKey && isShiftKey && e.key === mergedShortcuts.goToDashboard) {
          e.preventDefault();
          navigateTo('dashboard');
        }

        // Navigate to quotes (Cmd/Ctrl+Shift+Q)
        if (isModKey && isShiftKey && e.key === mergedShortcuts.goToQuotes) {
          e.preventDefault();
          navigateTo('quotes');
        }

        // Close menu (Escape)
        if (e.key === mergedShortcuts.close) {
          if (isCreateMenuOpen) {
            e.preventDefault();
            closeCreateMenu();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [disableKeyboardShortcuts, keyboardShortcuts, handleToggle, isCreateMenuOpen, closeCreateMenu, navigateTo]);

    // Focus trap for mobile
    useEffect(() => {
      if (variant !== 'mobile' || !isMobileOpen) return;

      const handleFocusTrap = (e: FocusEvent) => {
        if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
          sidebarRef.current.focus();
        }
      };

      document.addEventListener('focusin', handleFocusTrap);
      return () => document.removeEventListener('focusin', handleFocusTrap);
    }, [variant, isMobileOpen]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
      if (variant === 'mobile' && isMobileOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [variant, isMobileOpen]);

    // Handle mobile open state from props
    useEffect(() => {
      if (variant === 'mobile') {
        setIsMobileOpen(true);
      }
    }, [variant]);

    // Close mobile menu
    const handleMobileClose = useCallback(() => {
      setIsMobileOpen(false);
      onClose?.();
    }, [onClose]);

    // Loading state
    if (isLoading) {
      return (
        <aside
          className={cn(
            'h-screen bg-slate-950 border-r border-slate-800',
            'flex flex-col overflow-hidden',
            variant === 'mobile' ? 'w-72' : isCollapsed ? 'w-20' : 'w-72',
            className
          )}
          aria-busy="true"
          aria-label="Loading sidebar"
        >
          <SidebarSkeleton variant={variant} />
        </aside>
      );
    }

    // Error state
    if (error) {
      return (
        <aside
          className={cn(
            'h-screen bg-slate-950 border-r border-slate-800',
            'flex flex-col overflow-hidden',
            variant === 'mobile' ? 'w-72' : isCollapsed ? 'w-20' : 'w-72',
            className
          )}
          role="alert"
          aria-label="Sidebar error"
        >
          <SidebarError error={error} onRetry={onRetry} variant={variant} />
        </aside>
      );
    }

    // Mobile variant with overlay
    if (variant === 'mobile') {
      return (
        <>
          <MobileOverlay isOpen={isMobileOpen} onClose={handleMobileClose} />
          <motion.aside
            ref={sidebarRef}
            variants={sidebarVariants}
            initial="mobileClosed"
            animate={isMobileOpen ? 'mobileOpen' : 'mobileClosed'}
            className={cn(
              'fixed left-0 top-0 h-screen w-72 bg-slate-950',
              'flex flex-col overflow-hidden z-50 shadow-2xl',
              className
            )}
            role="dialog"
            aria-label="Mobile navigation"
            aria-modal="true"
            tabIndex={-1}
          >
            <SidebarContent
              variant="mobile"
              showText={true}
              isCollapsed={false}
              onToggle={handleToggle}
              onClose={handleMobileClose}
              activeItem={activeItem}
              navigationItems={navigationItems}
              createMenuItems={createMenuItems}
              isCreateMenuOpen={isCreateMenuOpen}
              setIsCreateMenuOpen={setIsCreateMenuOpen}
              createMenuHovered={createMenuHovered}
              setCreateMenuHovered={setCreateMenuHovered}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
              handleNavigate={handleNavigate}
              isItemActive={isItemActive}
              userName={userName}
              userEmail={userEmail}
              userAvatar={userAvatar}
              shopName={shopName}
              userInitials={userInitials}
              tooltipConfig={tooltipConfig}
              createButtonRef={createButtonRef}
              closeCreateMenu={closeCreateMenu}
            />
          </motion.aside>
        </>
      );
    }

    // Desktop variant
    return (
      <motion.aside
        ref={sidebarRef}
        variants={sidebarVariants}
        initial={isCollapsed ? 'collapsed' : 'expanded'}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        onAnimationComplete={() => {
          if (isCollapsed) {
            onCollapseComplete?.();
          } else {
            onExpandComplete?.();
          }
        }}
        className={cn(
          'h-screen bg-slate-950 border-r border-slate-800',
          'flex flex-col overflow-hidden fixed left-0 top-0 z-40',
          className
        )}
        aria-label="Main navigation"
        data-collapsed={isCollapsed}
      >
        <SidebarContent
          variant="desktop"
          showText={showText}
          isCollapsed={isCollapsed}
          onToggle={handleToggle}
          onClose={handleMobileClose}
          activeItem={activeItem}
          navigationItems={navigationItems}
          createMenuItems={createMenuItems}
          isCreateMenuOpen={isCreateMenuOpen}
          setIsCreateMenuOpen={setIsCreateMenuOpen}
          createMenuHovered={createMenuHovered}
          setCreateMenuHovered={setCreateMenuHovered}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          handleNavigate={handleNavigate}
          isItemActive={isItemActive}
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          shopName={shopName}
          userInitials={userInitials}
          tooltipConfig={tooltipConfig}
          createButtonRef={createButtonRef}
          closeCreateMenu={closeCreateMenu}
        />
      </motion.aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';

// ============================================================================
// Sidebar Content Component (Internal)
// ============================================================================

/**
 * Props for internal SidebarContent component
 */
interface SidebarContentProps {
  variant: SidebarVariant;
  showText: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onClose: () => void;
  activeItem: NavItemId;
  navigationItems: NavItem[];
  createMenuItems: CreateMenuItem[];
  isCreateMenuOpen: boolean;
  setIsCreateMenuOpen: (open: boolean) => void;
  createMenuHovered: boolean;
  setCreateMenuHovered: (hovered: boolean) => void;
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
  handleNavigate: (itemId: NavItemId, e?: ReactMouseEvent) => void;
  isItemActive: (href: string) => boolean;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  shopName: string;
  userInitials: string;
  tooltipConfig?: TooltipConfig;
  createButtonRef: React.RefObject<HTMLButtonElement | null>;
  closeCreateMenu: () => void;
}

/**
 * Internal content component for Sidebar
 * Separates content from animation wrapper for better organization
 */
const SidebarContent: React.FC<SidebarContentProps> = ({
  variant,
  showText,
  isCollapsed,
  onToggle,
  onClose,
  activeItem,
  navigationItems,
  createMenuItems,
  isCreateMenuOpen,
  setIsCreateMenuOpen,
  hoveredItem,
  setHoveredItem,
  handleNavigate,
  isItemActive,
  userName,
  userEmail,
  userAvatar,
  shopName,
  userInitials,
  tooltipConfig,
  createButtonRef,
  closeCreateMenu,
}) => {
  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-800/50 flex-shrink-0">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-3 overflow-hidden group"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate('dashboard');
          }}
          aria-label="Go to dashboard"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20"
          >
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
              />
            </svg>
          </motion.div>

          <AnimatePresence mode="wait">
            {showText && (
              <motion.span
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="font-bold text-xl text-slate-100 whitespace-nowrap bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text"
              >
                QuoteGen
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {variant === 'mobile' ? (
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Close navigation menu"
          >
            <XMarkIcon className="w-6 h-6" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={`${isCollapsed ? 'Expand' : 'Collapse'} sidebar (⌘B)`}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </motion.div>
          </motion.button>
        )}
      </header>

      {/* Create New Button */}
      <div className="p-4 flex-shrink-0">
        <div className="relative">
          <motion.button
            ref={createButtonRef}
            onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
            onMouseEnter={() => isCollapsed && setHoveredItem('create')}
            onMouseLeave={() => setHoveredItem(null)}
            whileHover={{ 
              scale: 1.02, 
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.35)',
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'w-full flex items-center justify-center gap-2',
              'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500',
              'text-white font-medium py-3 px-4 rounded-xl transition-all',
              'shadow-lg shadow-indigo-500/25'
            )}
            aria-expanded={isCreateMenuOpen}
            aria-haspopup="menu"
            aria-controls="create-menu"
          >
            <PlusIcon className="w-5 h-5" />
            <AnimatePresence mode="wait">
              {showText && (
                <motion.span
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="whitespace-nowrap"
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
                  aria-hidden="true"
                />
                <motion.div
                  id="create-menu"
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden z-50"
                  role="menu"
                  aria-label="Create new"
                >
                  {createMenuItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 transition-colors group focus:outline-none focus:bg-slate-800/80"
                        onClick={(e) => {
                          e.preventDefault();
                          closeCreateMenu();
                          window.location.href = item.href;
                        }}
                        role="menuitem"
                        tabIndex={0}
                      >
                        <item.icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-200 group-hover:text-white transition-colors">
                            {item.label}
                          </div>
                          <div className="text-sm text-slate-500 truncate">{item.description}</div>
                        </div>
                        {item.shortcut && (
                          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
                            {item.shortcut}
                          </kbd>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Tooltip for collapsed create button */}
          {isCollapsed && hoveredItem === 'create' && (
            <motion.div
              variants={tooltipVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 text-slate-200 text-sm rounded-lg whitespace-nowrap z-50 shadow-xl border border-slate-700"
              role="tooltip"
            >
              <div className="flex items-center gap-2">
                <span>Create Quote</span>
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-slate-700 text-slate-300 rounded">⌘N</kbd>
              </div>
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav 
        className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        aria-label="Navigation menu"
      >
        <ul className="space-y-1" role="menubar">
          {navigationItems.map((item, index) => {
            const isActive = item.id === activeItem || isItemActive(item.href);
            const Icon = isActive ? item.activeIcon : item.icon;
            const isItemHovered = hoveredItem === item.id;

            return (
              <motion.li
                key={item.id}
                custom={index}
                variants={navItemVariants}
                initial="initial"
                animate="animate"
                role="none"
              >
                <SidebarTooltip
                  content={item.label}
                  shortcut={item.shortcut}
                  isVisible={isCollapsed && !showText && isItemHovered}
                  config={tooltipConfig}
                >
                  <Link
                    href={item.href}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(e) => handleNavigate(item.id, e)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onFocus={() => setHoveredItem(item.id)}
                    onBlur={() => setHoveredItem(null)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
                      item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    )}
                    tabIndex={item.disabled ? -1 : 0}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}

                    <motion.div
                      whileHover={{ scale: 1.12, rotate: 5 }}
                      whileTap={{ scale: 0.92 }}
                      className="relative"
                    >
                      <Icon className={cn(
                        'w-6 h-6 transition-colors duration-200',
                        isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                      )} />

                      <NavBadge count={item.badge || 0} color={item.badgeColor} />
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {showText && (
                        <motion.span
                          variants={textVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className={cn(
                            'font-medium whitespace-nowrap',
                            isActive ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-200'
                          )}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </SidebarTooltip>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-800/50 flex-shrink-0">
        <motion.div
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer',
            isCollapsed && variant === 'desktop' ? 'justify-center' : ''
          )}
          role="button"
          tabIndex={0}
          aria-label={`${shopName} - ${userEmail || 'B2B Plan'}`}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-700/50 shadow-md"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-lg">
              {userInitials}
            </div>
          )}

          <AnimatePresence mode="wait">
            {showText && (
              <motion.div
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="overflow-hidden min-w-0"
              >
                <div className="font-medium text-slate-200 text-sm truncate">{shopName}</div>
                <div className="text-xs text-slate-500 truncate">{userEmail || 'B2B Plan'}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </footer>
    </>
  );
};

// ============================================================================
// Sidebar with Error Boundary Wrapper
// ============================================================================

/**
 * SidebarWithErrorBoundary
 * Wraps the Sidebar component with error boundary for production safety
 */
interface SidebarWithErrorBoundaryProps {
  /** Child components */
  children?: ReactNode;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Fallback UI when error occurs */
  fallback?: ReactNode;
}

export const SidebarWithErrorBoundary: React.FC<SidebarWithErrorBoundaryProps> = ({ 
  children, 
  onError,
  fallback,
}) => (
  <SidebarErrorBoundary onError={onError} fallback={fallback}>
    {children}
  </SidebarErrorBoundary>
);

// ============================================================================
// Named Exports
// ============================================================================

export { SidebarErrorBoundary, SidebarSkeleton, SidebarError, NavBadge };
export default Sidebar;
