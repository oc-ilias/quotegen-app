/**
 * Accessibility Components Barrel Export
 * 
 * This file provides convenient access to all accessibility components.
 * Import components from this file for cleaner imports.
 * 
 * @example
 * ```tsx
 * import { 
 *   SkipNavigation, 
 *   FocusTrap, 
 *   LiveAnnouncer, 
 *   VisuallyHidden,
 *   useAnnouncer 
 * } from '@/components/accessibility';
 * ```
 */

// SkipNavigation component for bypass blocks
export { SkipNavigation, type SkipNavigationProps } from './SkipNavigation';

// FocusTrap component for modal/dialog focus management
export { FocusTrap, type FocusTrapProps } from './FocusTrap';

// LiveAnnouncer component for screen reader announcements
export { 
  LiveAnnouncer, 
  useAnnouncer,
  type LiveAnnouncerProps,
  type UseAnnouncerReturn,
  type AnnouncePriority,
} from './LiveAnnouncer';

// VisuallyHidden component for screen-reader-only content
export { VisuallyHidden, type VisuallyHiddenProps } from './VisuallyHidden';
