// Main Components Index
// Comprehensive barrel export for all components

// UI Components
export * from './ui';

// Layout Components
export * from './layout';

// Navigation Components
export * from './navigation';

// Dashboard Components
export * from './dashboard';

// Quote Components
export * from './quotes';

// Wizard Components
export * from './wizard';

// Analytics Components
export * from './analytics';

// Settings Components
export * from './settings';

// Template Components
export * from './templates';

// PDF Components
export * from './pdf';

// Email Components
export * from './email';

// Core Components (root level)
export { ErrorBoundary } from './ErrorBoundary';
export { QuoteButton } from './QuoteButton';
export { QuotesDashboard } from './QuotesDashboard';
export { SettingsForm } from './SettingsForm';

// Re-export types from core components
export type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary';
export type { QuoteButtonProps } from './QuoteButton';
export type { QuotesDashboardProps } from './QuotesDashboard';
export type { SettingsFormProps } from './SettingsForm';
