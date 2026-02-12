/**
 * Navigation Components Index
 * Exports all navigation-related components
 * @module components/navigation
 */

// Main Sidebar Component
export {
  Sidebar,
  SidebarWithErrorBoundary,
  SidebarSkeleton,
  SidebarError,
  NavBadge,
  SidebarErrorBoundary,
} from './Sidebar';

// Types
export type {
  NavItemId,
  BadgeColor,
  SidebarVariant,
  IconComponent,
  NavItem,
  CreateMenuItem,
  TooltipConfig,
  KeyboardShortcuts,
  SidebarProps,
  SidebarHandle,
} from './Sidebar';
