/**
 * Accessibility Components
 * @module components/accessibility
 */

export { SkipNavigation } from './SkipNavigation';
export type { SkipLink } from './SkipNavigation';

export { LiveAnnouncerProvider, useLiveAnnouncer } from './LiveAnnouncer';
export type { AnnouncerMessage } from './LiveAnnouncer';

export { VisuallyHidden, ScreenReaderOnly } from './VisuallyHidden';

export { FocusTrap } from './FocusTrap';

export {
  KeyboardShortcutsHelp,
  useKeyboardShortcutsHelp,
} from './KeyboardShortcutsHelp';
export type { KeyboardShortcutItem } from './KeyboardShortcutsHelp';

export {
  useKeyboardShortcuts,
  useFocusManager,
} from '@/hooks/useKeyboardShortcuts';
export type { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';
