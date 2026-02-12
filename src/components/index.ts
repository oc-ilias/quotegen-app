/**
 * Components Index
 * Main barrel export for all components
 * @module components
 */

// Core Components
export { ErrorBoundary, useAsyncError, LoadingSpinner } from './ErrorBoundary';
export { QuoteButton } from './QuoteButton';
export { QuotesDashboard } from './QuotesDashboard';
export { SettingsForm } from './SettingsForm';

// Analytics Components
export * from './analytics';

// Customer Components
export * from './customers';

// Dashboard Components (excluding conflicting exports)
export { ActivityFeed, type ActivityFeedProps } from './dashboard';
export { QuickActions, type QuickActionsProps, type QuickAction } from './dashboard';
export { RecentQuotes, type RecentQuotesProps, type RecentQuoteItem } from './dashboard';
export { useDashboardStats, type DashboardStatsData } from './dashboard';

// Email Components
export * from './email';

// Export Components
export * from './export';

// Layout Components
export * from './layout';

// Navigation Components
export { Sidebar, type SidebarProps, type NavItem, type NavItemId } from './navigation';

// PDF Components
export * from './pdf';

// Quote Components
export * from './quotes';

// UI Components
export { Avatar, AvatarGroup } from './ui';
export { Badge, StatusBadge, PriorityBadge } from './ui';
export { Button } from './ui';
export { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui';
export { Input } from './ui';
export { Modal } from './ui';
export { Skeleton, CardSkeleton, StatCardSkeleton, TableSkeleton, QuoteListSkeleton, WizardStepSkeleton, ChartSkeleton, ActivityFeedSkeleton, DashboardSkeleton } from './ui';
export { StatCard } from './ui';
export { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from './ui';
export { ToastProvider, useToast, useToastHelpers } from './ui';
export { Sidebar as UISidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarItem, SidebarSection } from './ui';

// Wizard Components
export * from './wizard';

// Accessibility Components
export * from './accessibility';
