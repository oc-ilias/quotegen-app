/**
 * Webhooks Component
 * Webhook configuration and management for integrations
 * @module components/settings/Webhooks
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  CodeBracketIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClipboardIcon,
  EyeIcon,
  EyeSlashIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

type WebhookEvent = 
  | 'quote.created'
  | 'quote.updated'
  | 'quote.sent'
  | 'quote.viewed'
  | 'quote.accepted'
  | 'quote.declined'
  | 'quote.expired'
  | 'customer.created'
  | 'customer.updated'
  | 'payment.received';

type HttpMethod = 'POST' | 'PUT' | 'PATCH';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  method: HttpMethod;
  headers?: Record<string, string>;
  isActive: boolean;
  secret?: string;
  createdAt: string;
  lastTriggeredAt?: string;
  lastStatus?: 'success' | 'failed' | 'pending';
  failureCount: number;
}

interface WebhooksProps {
  webhooks?: Webhook[];
  onCreate?: (webhook: Omit<Webhook, 'id' | 'createdAt' | 'failureCount'>) => Promise<void>;
  onUpdate?: (id: string, webhook: Partial<Webhook>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onTest?: (id: string) => Promise<void>;
  onRegenerateSecret?: (id: string) => Promise<string>;
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// Event Options
// ============================================================================

const eventOptions: { value: WebhookEvent; label: string; category: string }[] = [
  { value: 'quote.created', label: 'Quote Created', category: 'Quotes' },
  { value: 'quote.updated', label: 'Quote Updated', category: 'Quotes' },
  { value: 'quote.sent', label: 'Quote Sent', category: 'Quotes' },
  { value: 'quote.viewed', label: 'Quote Viewed', category: 'Quotes' },
  { value: 'quote.accepted', label: 'Quote Accepted', category: 'Quotes' },
  { value: 'quote.declined', label: 'Quote Declined', category: 'Quotes' },
  { value: 'quote.expired', label: 'Quote Expired', category: 'Quotes' },
  { value: 'customer.created', label: 'Customer Created', category: 'Customers' },
  { value: 'customer.updated', label: 'Customer Updated', category: 'Customers' },
  { value: 'payment.received', label: 'Payment Received', category: 'Payments' },
];

// ============================================================================
// Mock Data
// ============================================================================

const defaultWebhooks: Webhook[] = [
  {
    id: '1',
    name: 'CRM Integration',
    url: 'https://api.company.com/webhooks/quotegen',
    events: ['quote.created', 'quote.accepted', 'quote.declined'],
    method: 'POST',
    isActive: true,
    secret: 'whsec_xxxxxxxxxxxxxxxx',
    createdAt: '2024-01-15',
    lastTriggeredAt: '2 minutes ago',
    lastStatus: 'success',
    failureCount: 0,
  },
  {
    id: '2',
    name: 'Slack Notifications',
    url: 'https://hooks.slack.com/services/T00/B00/EXAMPLE00FAKE00URL00NOT00REAL',
    events: ['quote.accepted'],
    method: 'POST',
    isActive: true,
    createdAt: '2024-02-01',
    lastTriggeredAt: '1 hour ago',
    lastStatus: 'success',
    failureCount: 0,
  },
  {
    id: '3',
    name: 'Zapier Integration',
    url: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/',
    events: ['quote.created', 'quote.sent', 'quote.accepted', 'quote.declined'],
    method: 'POST',
    isActive: false,
    createdAt: '2024-01-20',
    lastTriggeredAt: '3 days ago',
    lastStatus: 'failed',
    failureCount: 5,
  },
];

// ============================================================================
// Component
// ============================================================================

export const Webhooks: React.FC<WebhooksProps> = ({
  webhooks = defaultWebhooks,
  onCreate,
  onUpdate,
  onDelete,
  onTest,
  onRegenerateSecret,
  isLoading,
  className,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  // Form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<WebhookEvent[]>([]);
  const [formMethod, setFormMethod] = useState<HttpMethod>('POST');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!formName || !formUrl || formEvents.length === 0) return;
    
    setIsSubmitting(true);
    await onCreate?.({
      name: formName,
      url: formUrl,
      events: formEvents,
      method: formMethod,
      isActive: true,
      secret: 'whsec_' + Math.random().toString(36).substring(2, 34),
    });
    setIsSubmitting(false);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormName('');
    setFormUrl('');
    setFormEvents([]);
    setFormMethod('POST');
  };

  const toggleEvent = (event: WebhookEvent) => {
    setFormEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-400" />;
      case 'failed':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <ArrowPathIcon className="w-5 h-5 text-amber-400 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-slate-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Webhook
        </button>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook, index) => (
          <motion.div
            key={webhook.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'bg-slate-900 border rounded-2xl p-6 transition-all',
              webhook.isActive ? 'border-slate-800' : 'border-slate-800/50 opacity-75'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    webhook.isActive ? 'bg-indigo-500/10' : 'bg-slate-800'
                  )}
                >
                  <CodeBracketIcon
                    className={cn('w-6 h-6', webhook.isActive ? 'text-indigo-400' : 'text-slate-500')}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-200">{webhook.name}</h3>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        webhook.isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-700 text-slate-400'
                      )}
                    >
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {webhook.failureCount > 0 && (
                      <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                        {webhook.failureCount} failures
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-400 font-mono">{webhook.url}</p>

                  <div className="flex items-center gap-2 mt-2">
                    {webhook.events.slice(0, 3).map((event) => (
                      <span
                        key={event}
                        className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                        {event}
                      </span>
                    ))}
                    {webhook.events.length > 3 && (
                      <span className="text-xs text-slate-500">+{webhook.events.length - 3} more</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(webhook.lastStatus)}
                      <span>
                        {webhook.lastTriggeredAt
                          ? `Last triggered ${webhook.lastTriggeredAt}`
                          : 'Never triggered'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onTest?.(webhook.id)}
                  className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  title="Test webhook"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setEditingWebhook(webhook)}
                  className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  title="Edit webhook"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete?.(webhook.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete webhook"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Secret Key (if present) */}
            {webhook.secret && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Webhook Secret:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono">
                      {showSecret[webhook.id]
                        ? webhook.secret
                        : webhook.secret.substring(0, 8) + '••••••••••••••••'}
                    </code>
                    <button
                      onClick={() =>
                        setShowSecret((prev) => ({ ...prev, [webhook.id]: !prev[webhook.id] }))
                      }
                      className="p-1 text-slate-400 hover:text-slate-200"
                    >
                      {showSecret[webhook.id] ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(webhook.secret || '');
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-400"
                      title="Copy to clipboard"
                    >
                      <ClipboardIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {webhooks.length === 0 && (
        <div className="text-center py-12">
          <CodeBracketIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No webhooks configured</p>
          <p className="text-sm text-slate-500 mt-1">Add a webhook to integrate with external services</p>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto">
                <h3 className="text-lg font-semibold text-slate-100 mb-6">Add Webhook</h3>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Webhook Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g., CRM Integration"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Endpoint URL</label>
                    <input
                      type="url"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      placeholder="https://api.example.com/webhooks"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Method */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">HTTP Method</label>
                    <div className="flex gap-2">
                      {(['POST', 'PUT', 'PATCH'] as HttpMethod[]).map((method) => (
                        <button
                          key={method}
                          onClick={() => setFormMethod(method)}
                          className={cn(
                            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                            formMethod === method
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          )}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Events */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Events to Subscribe</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {eventOptions.map((event) => (
                        <label
                          key={event.value}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formEvents.includes(event.value)}
                            onChange={() => toggleEvent(event.value)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="text-sm text-slate-200">{event.label}</p>
                            <p className="text-xs text-slate-500">{event.category}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!formName || !formUrl || formEvents.length === 0 || isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4" />
                        Create Webhook
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

export default Webhooks;
