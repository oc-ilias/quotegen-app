/**
 * Security Settings Component
 * Security configuration including 2FA, passwords, sessions, and audit log
 * @module components/settings/Security
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  GlobeIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  TrashIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'app' | 'sms' | null;
  passwordLastChanged: string;
  passwordStrength: 'weak' | 'fair' | 'strong';
  sessionTimeout: number;
  ipWhitelist: string[];
  loginNotifications: boolean;
  requirePasswordChange: boolean;
}

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  ip: string;
  timestamp: string;
  details: string;
  status: 'success' | 'failure';
}

interface SecurityProps {
  settings?: SecuritySettings;
  sessions?: Session[];
  auditLog?: AuditLogEntry[];
  onEnable2FA?: (method: 'app' | 'sms') => Promise<void>;
  onDisable2FA?: () => Promise<void>;
  onChangePassword?: (current: string, newPass: string) => Promise<void>;
  onUpdateSettings?: (settings: Partial<SecuritySettings>) => Promise<void>;
  onRevokeSession?: (sessionId: string) => Promise<void>;
  onRevokeAllSessions?: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const defaultSettings: SecuritySettings = {
  twoFactorEnabled: false,
  twoFactorMethod: null,
  passwordLastChanged: '2024-01-15',
  passwordStrength: 'strong',
  sessionTimeout: 60,
  ipWhitelist: [],
  loginNotifications: true,
  requirePasswordChange: false,
};

const defaultSessions: Session[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    browser: 'Chrome 121',
    location: 'San Francisco, CA',
    ip: '192.168.1.1',
    lastActive: 'Now',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'iPhone 15 Pro',
    browser: 'Safari',
    location: 'San Francisco, CA',
    ip: '192.168.1.2',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'Windows PC',
    browser: 'Firefox',
    location: 'New York, NY',
    ip: '10.0.0.5',
    lastActive: '3 days ago',
    isCurrent: false,
  },
];

const defaultAuditLog: AuditLogEntry[] = [
  {
    id: '1',
    action: 'Login',
    user: 'john@example.com',
    ip: '192.168.1.1',
    timestamp: '2024-02-05 09:30:22',
    details: 'Successful login from Chrome on MacBook Pro',
    status: 'success',
  },
  {
    id: '2',
    action: 'Quote Created',
    user: 'john@example.com',
    ip: '192.168.1.1',
    timestamp: '2024-02-05 09:45:10',
    details: 'Created quote #QT-2024-0156',
    status: 'success',
  },
  {
    id: '3',
    action: 'Settings Updated',
    user: 'sarah@example.com',
    ip: '192.168.1.2',
    timestamp: '2024-02-05 10:15:33',
    details: 'Updated company information',
    status: 'success',
  },
  {
    id: '4',
    action: 'Login Attempt',
    user: 'unknown',
    ip: '45.123.45.67',
    timestamp: '2024-02-04 23:12:45',
    details: 'Failed login attempt',
    status: 'failure',
  },
];

// ============================================================================
// Component
// ============================================================================

export const Security: React.FC<SecurityProps> = ({
  settings = defaultSettings,
  sessions = defaultSessions,
  auditLog = defaultAuditLog,
  onEnable2FA,
  onDisable2FA,
  onChangePassword,
  onUpdateSettings,
  onRevokeSession,
  onRevokeAllSessions,
  isLoading,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'sessions' | 'audit'>('general');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) return;
    setIsChangingPassword(true);
    await onChangePassword?.(currentPassword, newPassword);
    setIsChangingPassword(false);
    setShowPasswordChange(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'fair':
        return 'text-amber-400 bg-amber-500/10';
      case 'weak':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-slate-400 bg-slate-500/10';
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3" />
          <div className="h-40 bg-slate-800 rounded-xl" />
          <div className="h-40 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        {[
          { id: 'general', label: 'General', icon: ShieldCheckIcon },
          { id: 'sessions', label: 'Active Sessions', icon: DevicePhoneMobileIcon },
          { id: 'audit', label: 'Audit Log', icon: DocumentTextIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2',
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General Security */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Password Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                  <KeyIcon className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">Password</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        getPasswordStrengthColor(settings.passwordStrength)
                      )}
                    >
                      {settings.passwordStrength.charAt(0).toUpperCase() +
                        settings.passwordStrength.slice(1)}
                    </span>
                    <span className="text-sm text-slate-500">
                      Last changed {settings.passwordLastChanged}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
              >
                Change Password
              </button>
            </div>

            <AnimatePresence>
              {showPasswordChange && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-slate-800 space-y-4"
                >
                  {[
                    { label: 'Current Password', key: 'current', value: currentPassword, setter: setCurrentPassword },
                    { label: 'New Password', key: 'new', value: newPassword, setter: setNewPassword },
                    { label: 'Confirm Password', key: 'confirm', value: confirmPassword, setter: setConfirmPassword },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-300 mb-1">{field.label}</label>
                      <div className="relative">
                        <input
                          type={showPasswords[field.key] ? 'text' : 'password'}
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          className="w-full px-4 py-2.5 pr-10 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        />
                        <button
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              [field.key]: !prev[field.key],
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showPasswords[field.key] ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setShowPasswordChange(false)}
                      className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      disabled={
                        !currentPassword ||
                        !newPassword ||
                        newPassword !== confirmPassword ||
                        isChangingPassword
                      }
                      className="flex items-center gap-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                    >
                      {isChangingPassword ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    settings.twoFactorEnabled ? 'bg-emerald-500/10' : 'bg-slate-800'
                  )}
                >
                  <ShieldCheckIcon
                    className={cn(
                      'w-6 h-6',
                      settings.twoFactorEnabled ? 'text-emerald-400' : 'text-slate-400'
                    )}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {settings.twoFactorEnabled
                      ? `Enabled via ${settings.twoFactorMethod === 'app' ? 'authenticator app' : 'SMS'}`
                      : 'Add an extra layer of security to your account'}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  settings.twoFactorEnabled
                    ? onDisable2FA?.()
                    : onEnable2FA?.('app')
                }
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  settings.twoFactorEnabled
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                )}
              >
                {settings.twoFactorEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>

          {/* Session Timeout */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-200">Session Timeout</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Automatically log out after {settings.sessionTimeout} minutes of inactivity
                </p>
                <input
                  type="range"
                  min="5"
                  max="240"
                  step="5"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    onUpdateSettings?.({ sessionTimeout: parseInt(e.target.value) })
                  }
                  className="w-full mt-4 accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>5 min</span>
                  <span>{settings.sessionTimeout} min</span>
                  <span>4 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between"
          >
            <h3 className="font-semibold text-slate-200">Active Sessions</h3>
            <button
              onClick={() => onRevokeAllSessions?.()}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Sign out all devices
            </button>
          </div>
          <div className="divide-y divide-slate-800">
            {sessions.map((session) => (
              <div key={session.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center"
                  >
                    <DevicePhoneMobileIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-200">{session.device}</p>
                      {session.isCurrent && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      {session.browser} • {session.location} • {session.ip}
                    </p>
                    <p className="text-xs text-slate-500">Last active: {session.lastActive}</p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => onRevokeSession?.(session.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="divide-y divide-slate-800">
            {auditLog.map((entry) => (
              <div key={entry.id} className="p-4 flex items-start gap-4"
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    entry.status === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  )}
                >
                  {entry.status === 'success' ? (
                    <CheckIcon className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XMarkIcon className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0"
                >
                  <div className="flex items-center gap-2"
                  >
                    <p className="font-medium text-slate-200">{entry.action}</p>
                    <span className="text-xs text-slate-500">{entry.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-400">{entry.details}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {entry.user} • {entry.ip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
