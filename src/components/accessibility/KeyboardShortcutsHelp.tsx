/**
 * Keyboard Shortcuts Help Component
 * Display and manage keyboard shortcuts for the application
 * @module components/accessibility/KeyboardShortcutsHelp
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

export interface KeyboardShortcutItem {
  key: string;
  modifier?: string;
  description: string;
  category?: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts?: KeyboardShortcutItem[];
  isOpen: boolean;
  onClose: () => void;
}

const defaultShortcuts: KeyboardShortcutItem[] = [
  {
    category: 'Navigation',
    key: 'Tab',
    description: 'Move to next interactive element',
  },
  {
    category: 'Navigation',
    key: 'Tab',
    modifier: 'Shift',
    description: 'Move to previous interactive element',
  },
  {
    category: 'Navigation',
    key: 'Enter',
    description: 'Activate button or link',
  },
  {
    category: 'Navigation',
    key: 'Space',
    description: 'Activate button or toggle checkbox',
  },
  {
    category: 'Navigation',
    key: 'Escape',
    description: 'Close modal or dropdown',
  },
  {
    category: 'Application',
    key: '?',
    description: 'Show this help dialog',
  },
  {
    category: 'Application',
    key: '/',
    description: 'Focus search input',
  },
  {
    category: 'Application',
    key: 'n',
    modifier: 'Ctrl',
    description: 'Create new quote',
  },
];

export function KeyboardShortcutsHelp({
  shortcuts = defaultShortcuts,
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcutItem[]>);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      description="Use these keyboard shortcuts to navigate the application more efficiently."
      size="md"
    >
      <div className="space-y-6">
        {Object.entries(groupedShortcuts).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              {category}
            </h3>
            <dl className="space-y-2">
              {items.map((shortcut, index) => (
                <div
                  key={`${shortcut.key}-${index}`}
                  className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg"
                >
                  <dt className="text-slate-300">{shortcut.description}</dt>
                  <dd className="flex items-center gap-1">
                    {shortcut.modifier && (
                      <>
                        <kbd className="px-2 py-1 text-xs font-mono bg-slate-700 rounded text-slate-200">
                          {shortcut.modifier}
                        </kbd>
                        <span className="text-slate-500 mx-1">+</span>
                      </>
                    )}
                    <kbd className="px-2 py-1 text-xs font-mono bg-slate-700 rounded text-slate-200 min-w-[1.5rem] text-center">
                      {shortcut.key}
                    </kbd>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700">
        <p className="text-sm text-slate-400">
          Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-slate-700 rounded">?</kbd> at any time to show this help.
        </p>
      </div>
    </Modal>
  );
}

/**
 * Hook to manage keyboard shortcuts help visibility
 */
export function useKeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}

export default KeyboardShortcutsHelp;