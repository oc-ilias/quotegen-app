/**
 * Skip Navigation Component
 * Allows keyboard users to skip to main content
 * @module components/accessibility/SkipNavigation
 */

'use client';

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { handleSkipLink } from '@/lib/accessibility';

export interface SkipLink {
  id: string;
  label: string;
}

interface SkipNavigationProps {
  links?: SkipLink[];
  className?: string;
}

const defaultLinks: SkipLink[] = [
  { id: 'main-content', label: 'Skip to main content' },
  { id: 'navigation', label: 'Skip to navigation' },
];

export function SkipNavigation({ links = defaultLinks, className }: SkipNavigationProps) {
  const handleClick = useCallback((id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleSkipLink(id);
  }, []);

  return (
    <nav
      aria-label="Skip links"
      className={cn(
        // Hidden by default, visible on focus
        'fixed top-0 left-0 z-[100] w-full',
        'bg-indigo-600 text-white',
        'transform -translate-y-full transition-transform duration-200',
        'focus-within:translate-y-0',
        className
      )}
    >
      <ul className="flex items-center gap-6 px-6 py-3">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              onClick={handleClick(link.id)}
              className={cn(
                'font-medium text-white',
                'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600',
                'rounded px-2 py-1'
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SkipNavigation;