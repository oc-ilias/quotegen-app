/**
 * Team Management Component
 * Team members, roles, and permissions management
 * @module components/settings/TeamManagement
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  UsersIcon,
  PlusIcon,
  TrashIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

type UserRole = 'owner' | 'admin' | 'manager' | 'viewer';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
  lastActive: string;
  joinedAt: string;
  twoFactorEnabled: boolean;
}

interface TeamManagementProps {
  members?: TeamMember[];
  currentUserId?: string;
  onInvite?: (email: string, role: UserRole) => Promise<void>;
  onRemove?: (memberId: string) => Promise<void>;
  onUpdateRole?: (memberId: string, role: UserRole) => Promise<void>;
  onResendInvite?: (memberId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const defaultMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'owner',
    status: 'active',
    lastActive: '2 minutes ago',
    joinedAt: '2024-01-15',
    twoFactorEnabled: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'admin',
    status: 'active',
    lastActive: '1 hour ago',
    joinedAt: '2024-02-20',
    twoFactorEnabled: true,
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@example.com',
    role: 'manager',
    status: 'active',
    lastActive: '3 hours ago',
    joinedAt: '2024-03-10',
    twoFactorEnabled: false,
  },
  {
    id: '4',
    name: 'Emily Wilson',
    email: 'emily@example.com',
    role: 'viewer',
    status: 'pending',
    lastActive: 'Never',
    joinedAt: '2024-02-05',
    twoFactorEnabled: false,
  },
];

// ============================================================================
// Helpers
// ============================================================================

const roleConfig: Record<UserRole, { label: string; description: string; color: string; icon: React.ElementType }> = {
  owner: {
    label: 'Owner',
    description: 'Full access to all settings and billing',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    icon: ShieldCheckIcon,
  },
  admin: {
    label: 'Admin',
    description: 'Can manage team members and settings',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    icon: ShieldCheckIcon,
  },
  manager: {
    label: 'Manager',
    description: 'Can create and manage quotes',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    icon: UserIcon,
  },
  viewer: {
    label: 'Viewer',
    description: 'View-only access to quotes and reports',
    color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    icon: UserIcon,
  },
};

const getRoleBadge = (role: UserRole) => {
  const config = roleConfig[role];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', config.color)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

// ============================================================================
// Component
// ============================================================================

export const TeamManagement: React.FC<TeamManagementProps> = ({
  members = defaultMembers,
  currentUserId = '1',
  onInvite,
  onRemove,
  onUpdateRole,
  onResendInvite,
  isLoading,
  className,
}) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('viewer');
  const [isInviting, setIsInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    await onInvite?.(inviteEmail, inviteRole);
    setIsInviting(false);
    setIsInviteModalOpen(false);
    setInviteEmail('');
  };

  if (isLoading) {
    return (
      <div className={cn('bg-slate-900 border border-slate-800 rounded-2xl p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Invite Member
        </button>
      </div>

      {/* Members List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="divide-y divide-slate-800">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {member.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-200">{member.name}</p>
                      {member.id === currentUserId && (
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">You</span>
                      )}
                      {member.status === 'pending' && (
                        <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">Pending</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    {getRoleBadge(member.role)}
                    <p className="text-xs text-slate-500 mt-1">
                      {member.status === 'active' ? `Last active ${member.lastActive}` : 'Invitation pending'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {member.status === 'pending' ? (
                      <button
                        onClick={() => onResendInvite?.(member.id)}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="Resend invite"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingMember(member)}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="Edit member"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}

                    {member.id !== currentUserId && (
                      <button
                        onClick={() => onRemove?.(member.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="p-8 text-center">
            <UsersIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No team members found</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md pointer-events-auto">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Invite Team Member</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                    <div className="space-y-2">
                      {(Object.keys(roleConfig) as UserRole[]).filter(r => r !== 'owner').map((role) => {
                        const config = roleConfig[role];
                        return (
                          <button
                            key={role}
                            onClick={() => setInviteRole(role)}
                            className={cn(
                              'w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left',
                              inviteRole === role
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : 'border-slate-700 hover:border-slate-600'
                            )}
                          >
                            <div className={cn('p-2 rounded-lg', config.color)}>
                              <config.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-200">{config.label}</p>
                              <p className="text-xs text-slate-400">{config.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmail || isInviting}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                  >
                    {isInviting ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="w-4 h-4" />
                        Send Invite
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamManagement;
