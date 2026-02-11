/**
 * Export Menu Component
 * Simple export functionality for analytics data
 * @module components/analytics/ExportMenu
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  PhotoIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

export type ExportFormat = 'csv' | 'png' | 'pdf';

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void;
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExport,
  isLoading = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = useCallback((format: ExportFormat) => {
    onExport(format);
    setIsOpen(false);
  }, [onExport]);

  const exportOptions: { format: ExportFormat; label: string; icon: React.ElementType }[] = [
    { format: 'csv', label: 'Export as CSV', icon: TableCellsIcon },
    { format: 'png', label: 'Export as PNG', icon: PhotoIcon },
    { format: 'pdf', label: 'Export as PDF', icon: DocumentTextIcon },
  ];

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        isLoading={isLoading}
        leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
      >
        Export
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="py-1">
                {exportOptions.map(({ format, label, icon: Icon }) => (
                  <button
                    key={format}
                    onClick={() => handleExport(format)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportMenu;
