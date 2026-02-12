import React, { type ElementType, type ComponentPropsWithoutRef } from 'react';
import './VisuallyHidden.css';

/**
 * Props for the VisuallyHidden component
 */
export interface VisuallyHiddenProps {
  /** Child content to be visually hidden but accessible */
  children: React.ReactNode;
  /** The HTML element to render as */
  as?: ElementType;
  /** Additional CSS class names */
  className?: string;
  /** Whether to show the content when focused (for skip links) */
  focusable?: boolean;
}

/**
 * VisuallyHidden Component
 * 
 * Hides content visually while keeping it accessible to screen readers.
 * Useful for providing additional context to screen reader users without
 * cluttering the visual design.
 * 
 * Use cases:
 * - Icon buttons need text labels for screen readers
 * - Form inputs need descriptive labels
 * - Tables need captions
 * - Charts need text alternatives
 * 
 * WCAG 2.1 AA Compliance:
 * - 1.1.1 Non-text Content (Level A)
 * - 2.4.4 Link Purpose (In Context) (Level A)
 * - 3.3.2 Labels or Instructions (Level A)
 * 
 * @example
 * ```tsx
 * // Icon button with hidden label
 * <button>
 *   <Icon name="search" />
 *   <VisuallyHidden>Search</VisuallyHidden>
 * </button>
 * 
 * // Table caption
 * <table>
 *   <VisuallyHidden as="caption">Sales data for Q4 2024</VisuallyHidden>
 *   ...
 * </table>
 * 
 * // Focusable hidden content (becomes visible on focus)
 * <VisuallyHidden focusable>
 *   <a href="#main">Skip to main content</a>
 * </VisuallyHidden>
 * ```
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as: Component = 'span',
  className = '',
  focusable = false,
}) => {
  const classes = [
    'visually-hidden',
    focusable && 'visually-hidden--focusable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return React.createElement(
    Component,
    {
      className: classes,
      'data-testid': 'visually-hidden',
    },
    children
  );
};

/**
 * Default export for convenient importing
 */
export default VisuallyHidden;
