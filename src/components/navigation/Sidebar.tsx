/**
 * Sidebar Component
 * Navigation sidebar with collapsible state and mobile support
 * @module components/navigation/Sidebar
 */

'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  DocumentTextIcon,
  TemplateIcon,
  ChartBarIcon,
  CogIcon,
  ChevronLeftIcon,
  XIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  TemplateIcon as TemplateIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CogIcon as CogIconSolid,
} from '@heroicons/react/24/solid';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeRoute: string;
  variant: 'desktop' | 'mobile';
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    id: 'quotes',
    label: 'Quotes',
    href: '/quotes',
    icon: DocumentTextIcon,
    activeIcon: DocumentTextIconSolid,
    badge: 0,
  },
  {
    id: 'templates',
    label: 'Templates',
    href: '/templates',
    icon: TemplateIcon,
    activeIcon: TemplateIconSolid,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: CogIcon,
    activeIcon: CogIconSolid,
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  activeRoute,
  variant,
}) => {
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  
  const toggleCreateMenu = useCallback(() => {
    setIsCreateMenuOpen(prev => !prev);
  }, []);
  
  const closeCreateMenu = useCallback(() => {
    setIsCreateMenuOpen(false);
  }, []);
  
  const isActive = useCallback((href: string) => {
    return activeRoute === href || activeRoute.startsWith(`${href}/`);
  }, [activeRoute]);
  
  const showText = variant === 'mobile' || !isCollapsed;
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          
          <AnimatePresence mode="wait">
            {showText && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-xl text-gray-900 whitespace-nowrap overflow-hidden"
              >
                QuoteGen
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        
        {variant === 'mobile' && (
          <button
            onClick={onToggle}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <XIcon className="w-6 h-6" />
          </button>
        )}
        
        {variant === 'desktop' && (
          <button
            onClick={onToggle}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </motion.div>
          </button>
        )}
      </div>
      
      {/* Create New Button */}
      <div className="p-4">
        <div className="relative">
          <motion.button
            onClick={toggleCreateMenu}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            aria-expanded={isCreateMenuOpen}
            aria-haspopup="menu"
          >
            <PlusIcon className="w-5 h-5" />
            
            <AnimatePresence mode="wait">
              {showText && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Create Quote
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* Create Menu Dropdown */}
          <AnimatePresence>
            {isCreateMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={closeCreateMenu}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                  role="menu"
                >
                  <Link
                    href="/quotes/new"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    onClick={closeCreateMenu}
                    role="menuitem"
                  >
                    <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">New Quote</div>
                      <div className="text-sm text-gray-500">Create a custom quote</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/quotes/new?template=true"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    onClick={closeCreateMenu}
                    role="menuitem"
                  >
                    <TemplateIcon className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">From Template</div>
                      <div className="text-sm text-gray-500">Start with a template</div>
                    </div>
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto" aria-label="Main navigation">
        <ul className="space-y-1" role="menubar">
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            const Icon = active ? item.activeIcon : item.icon;
            
            return (
              <li key={item.id} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  aria-current={active ? 'page' : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                    ${active
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Icon className={`
                      w-6 h-6 transition-colors
                      ${active ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'}
                    `} />
                    
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </motion.div>
                  
                  <AnimatePresence mode="wait">
                    {showText && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className={`
          flex items-center gap-3 p-3 rounded-xl bg-gray-50
          ${isCollapsed && variant === 'desktop' ? 'justify-center' : ''}
        `}>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            S
          </div>
          
          <AnimatePresence mode="wait">
            {showText && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <div className="font-medium text-gray-900 text-sm">Shop Name</div>
                <div className="text-xs text-gray-500">B2B Plan</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
