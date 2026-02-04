/**
 * Header Component
 * Top navigation bar with search, notifications, and user menu
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  SunIcon,
  MoonIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface HeaderProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  notifications?: Notification[];
  onSearch?: (query: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  onHelp?: () => void;
  onProfile?: () => void;
  className?: string;
}

// ============================================================================
// Notification Icon Helper
// ============================================================================

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return CheckCircleIcon;
    case 'warning':
      return ExclamationCircleIcon;
    case 'error':
      return ExclamationCircleIcon;
    default:
      return InformationCircleIcon;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'text-emerald-500 bg-emerald-500/10';
    case 'warning':
      return 'text-amber-500 bg-amber-500/10';
    case 'error':
      return 'text-red-500 bg-red-500/10';
    default:
      return 'text-blue-500 bg-blue-500/10';
  }
};

// ============================================================================
// Search Bar Component
// ============================================================================

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = 'Search quotes, customers...' }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <motion.div
        animate={{
          width: isFocused ? 320 : 280,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative"
      >
        <MagnifyingGlassIcon 
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors',
            isFocused ? 'text-indigo-500' : 'text-slate-400'
          )} 
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-4 py-2 rounded-xl text-sm transition-all duration-200',
            'bg-slate-900/50 border border-slate-800',
            'text-slate-200 placeholder-slate-500',
            'focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20',
            'hover:border-slate-700'
          )}
        />
        
        {/* Keyboard shortcut hint */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-xs rounded bg-slate-800 text-slate-500 border border-slate-700">
            ⌘K
          </kbd>
        </div>
      </motion.div>
    </form>
  );
};

// ============================================================================
// Notifications Dropdown
// ============================================================================

interface NotificationsDropdownProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead: () => void;
}

const NotificationsDropdown = ({ 
  notifications, 
  onNotificationClick,
  onMarkAllRead 
}: NotificationsDropdownProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h3 className="font-semibold text-slate-200">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-500">
            <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <motion.button
                key={notification.id}
                onClick={() => onNotificationClick(notification)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-800/50',
                  !notification.read && 'bg-slate-800/30'
                )}
              >
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  getNotificationColor(notification.type)
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm truncate',
                    !notification.read ? 'font-medium text-slate-200' : 'text-slate-400'
                  )}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {notification.timestamp}
                  </p>
                </div>

                {!notification.read && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// User Menu Dropdown
// ============================================================================

interface UserMenuDropdownProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onSettings: () => void;
  onHelp: () => void;
  onLogout: () => void;
  onProfile: () => void;
}

const UserMenuDropdown = ({
  userName,
  userEmail,
  userAvatar,
  onSettings,
  onHelp,
  onLogout,
  onProfile,
}: UserMenuDropdownProps) => {
  const menuItems = [
    { label: 'Profile', icon: UserCircleIcon, onClick: onProfile },
    { label: 'Settings', icon: Cog6ToothIcon, onClick: onSettings },
    { label: 'Help & Support', icon: QuestionMarkCircleIcon, onClick: onHelp },
    { label: 'Logout', icon: ArrowRightOnRectangleIcon, onClick: onLogout, danger: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50"
    >
      {/* User Info */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-200 truncate">{userName || 'User'}</p>
            <p className="text-sm text-slate-500 truncate">{userEmail || ''}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
              item.danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// Main Header Component
// ============================================================================

export function Header({
  userName,
  userEmail,
  userAvatar,
  notificationCount = 0,
  notifications = [],
  onSearch,
  onNotificationClick,
  onMarkAllRead,
  onSettings,
  onLogout,
  onHelp,
  onProfile,
  className,
}: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search input
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
    setIsNotificationsOpen(false);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 px-6 py-4',
        'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          {onSearch && <SearchBar onSearch={onSearch} />}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div ref={notificationsRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsUserMenuOpen(false);
              }}
              className={cn(
                'relative p-2.5 rounded-xl transition-colors',
                isNotificationsOpen
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5" />
              
              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <NotificationsDropdown
                  notifications={notifications}
                  onNotificationClick={handleNotificationClick}
                  onMarkAllRead={onMarkAllRead || (() => {})}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-800 mx-2" />

          {/* User Menu */}
          <div ref={userMenuRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsNotificationsOpen(false);
              }}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors',
                isUserMenuOpen
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName || 'User'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <UserCircleIcon className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-200">{userName || 'User'}</p>
              </div>
              <ChevronDownIcon className={cn(
                'w-4 h-4 transition-transform',
                isUserMenuOpen && 'rotate-180'
              )} />
            </motion.button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <UserMenuDropdown
                  userName={userName}
                  userEmail={userEmail}
                  userAvatar={userAvatar}
                  onSettings={() => { onSettings?.(); setIsUserMenuOpen(false); }}
                  onHelp={() => { onHelp?.(); setIsUserMenuOpen(false); }}
                  onLogout={() => { onLogout?.(); setIsUserMenuOpen(false); }}
                  onProfile={() => { onProfile?.(); setIsUserMenuOpen(false); }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
