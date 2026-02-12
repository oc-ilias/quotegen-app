/**
 * Dashboard Components Index
 * Exports all dashboard-related components
 * @module components/dashboard
 */

export { ActivityFeed, type ActivityFeedProps } from './ActivityFeed';
export { QuickActions, type QuickActionsProps, type QuickAction } from './QuickActions';
export { RecentQuotes, type RecentQuotesProps, type RecentQuoteItem } from './RecentQuotes';
export {
  StatCard,
  StatCardsGrid,
  useDashboardStats,
  type DashboardStatsData,
} from './StatCards';
