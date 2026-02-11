/**
 * Visually Hidden Component
 * Content that is visually hidden but accessible to screen readers
 * @module components/accessibility/VisuallyHidden
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * VisuallyHidden component - hides content visually but keeps it accessible to screen readers
 * Use this for:
 * - Adding context to icon-only buttons
 * - Providing additional information for screen reader users
 * - Hiding decorative elements from visual users but not screen readers
 */
export function VisuallyHidden({ 
  children, 
  className, 
  as: Component = 'span' 
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        'clip-[rect(0,0,0,0)]',
        className
      )}
      style={{
        clipPath: 'inset(50%)',
      }}
    >
      {children}
    </Component>
  );
}

/**
 * ScreenReaderOnly - Alias for VisuallyHidden with clearer intent
 */
export const ScreenReaderOnly = VisuallyHidden;

export default VisuallyHidden;