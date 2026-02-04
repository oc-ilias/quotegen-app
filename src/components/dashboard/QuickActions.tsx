/**
 * Quick Actions Component
 * Action buttons for common tasks
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  PlusIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'indigo';
  shortcut?: string;
}

export interface QuickActionsProps {
  actions?: QuickAction[];
  onCreateQuote?: () => void;
  onCreateTemplate?: () => void;
  onImportCustomers?: () => void;
  onExportData?: () => void;
  onViewAnalytics?: () => void;
  className?: string;
}

// ============================================================================
// Color Configurations
// ============================================================================

const colorConfig = {
  blue: {
    bg: 'bg-blue-500/10 hover:bg-blue-500/20',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    text: 'text-blue-400',
    icon: 'text-blue-500',
  },
  green: {
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    text: 'text-emerald-400',
    icon: 'text-emerald-500',
  },
  purple: {
    bg: 'bg-purple-500/10 hover:bg-purple-500/20',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    text: 'text-purple-400',
    icon: 'text-purple-500',
  },
  amber: {
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    text: 'text-amber-400',
    icon: 'text-amber-500',
  },
  indigo: {
    bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
    border: 'border-indigo-500/20 hover:border-indigo-500/40',
    text: 'text-indigo-400',
    icon: 'text-indigo-500',
  },
};

// ============================================================================
// Quick Action Card
// ============================================================================

interface QuickActionCardProps {
  action: QuickAction;
  index: number;
}

const QuickActionCard = ({ action, index }: QuickActionCardProps) => {
  const colors = colorConfig[action.color || 'indigo'];
  const Icon = action.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: 'easeOut'
      }}
      whileHover={{ 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.15 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={action.onClick}
      className={cn(
        'group relative flex flex-col items-start gap-3 p-5 rounded-xl',
        'border transition-all duration-200',
        'text-left w-full',
        colors.bg,
        colors.border
      )}
    >
      {/* Icon */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center',
        'bg-slate-950/50 transition-transform duration-200',
        'group-hover:scale-110',
        colors.icon
      )}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h4 className={cn('font-semibold text-sm', colors.text)}>
          {action.label}
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          {action.description}
        </p>
      </div>

      {/* Shortcut Badge */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <kbd className="px-1.5 py-0.5 text-xs rounded bg-slate-800 text-slate-500 border border-slate-700">
          {action.shortcut}
        </kbd>
      </div>

      {/* Hover Glow */}
      <div className={cn(
        'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity',
        'bg-gradient-to-br',
        action.color === 'blue' && 'from-blue-500/5 to-transparent',
        action.color === 'green' && 'from-emerald-500/5 to-transparent',
        action.color === 'purple' && 'from-purple-500/5 to-transparent',
        action.color === 'amber' && 'from-amber-500/5 to-transparent',
        action.color === 'indigo' && 'from-indigo-500/5 to-transparent',
      )} />
    </motion.button>
  );
};

// ============================================================================
// Default Actions Generator
// ============================================================================

const createDefaultActions = (props: QuickActionsProps): QuickAction[] = {
  const actions: QuickAction[] = [];

  if (props.onCreateQuote) {
    actions.push({
      id: 'create-quote',
      label: 'Create Quote',
      description: 'Create a new quote for a customer',
      icon: PlusIcon,
      onClick: props.onCreateQuote,
      color: 'blue',
      shortcut: '⌘N',
    });
  }

  if (props.onCreateTemplate) {
    actions.push({
      id: 'create-template',
      label: 'New Template',
      description: 'Design a quote template',
      icon: SparklesIcon,
      onClick: props.onCreateTemplate,
      color: 'purple',
      shortcut: '⌘T',
    });
  }

  if (props.onImportCustomers) {
    actions.push({
      id: 'import-customers',
      label: 'Import Customers',
      description: 'Import customers from CSV',
      icon: UserPlusIcon,
      onClick: props.onImportCustomers,
      color: 'green',
      shortcut: '⌘I',
    });
  }

  if (props.onExportData) {
    actions.push({
      id: 'export-data',
      label: 'Export Data',
      description: 'Export quotes and analytics',
      icon: ArrowDownTrayIcon,
      onClick: props.onExportData,
      color: 'amber',
      shortcut: '⌘E',
    });
  }

  if (props.onViewAnalytics) {
    actions.push({
      id: 'view-analytics',
      label: 'View Analytics',
      description: 'See detailed reports',
      icon: ChartBarIcon,
      onClick: props.onViewAnalytics,
      color: 'indigo',
      shortcut: '⌘A',
    });
  }

  return actions;
};

// ============================================================================
// Main Quick Actions Component
// ============================================================================

export function QuickActions(props: QuickActionsProps) {
  const { actions: customActions, className } = props;
  const actions = customActions || createDefaultActions(props);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('space-y-4', className)}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-200">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <QuickActionCard
            key={action.id}
            action={action}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default QuickActions;
