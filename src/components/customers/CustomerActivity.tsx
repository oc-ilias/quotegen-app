/**
 * Customer Activity Component
 * Display customer activity feed
 * @module components/customers/CustomerActivity
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  DocumentPlusIcon,
  PaperAirplaneIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ActivityFeedSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { CustomerActivity as CustomerActivityType } from '@/types/quote';

interface CustomerActivityProps {
  activities: CustomerActivityType[];
  isLoading?: boolean;
  maxItems?: number;
}

const activityConfig: Record<
  CustomerActivityType['type'],
  { icon: React.ElementType; color: string; label: string }
> = {
  quote_created: {
    icon: DocumentPlusIcon,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    label: 'Quote created',
  },
  quote_sent: {
    icon: PaperAirplaneIcon,
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    label: 'Quote sent',
  },
  quote_viewed: {
    icon: EyeIcon,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    label: 'Quote viewed',
  },
  quote_accepted: {
    icon: CheckCircleIcon,
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    label: 'Quote accepted',
  },
  quote_rejected: {
    icon: XCircleIcon,
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    label: 'Quote rejected',
  },
  quote_expired: {
    icon: ClockIcon,
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    label: 'Quote expired',
  },
  note_added: {
    icon: ChatBubbleLeftIcon,
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    label: 'Note added',
  },
  customer_updated: {
    icon: PencilIcon,
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    label: 'Customer updated',
  },
};

export const CustomerActivity: React.FC<CustomerActivityProps> = ({
  activities,
  isLoading = false,
  maxItems = 10,
}) => {
  const displayActivities = activities.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeedSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ArrowPathIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity, index) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <div
                  className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border',
                    config.color
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200">
                    {activity.description}
                  </p>

                  {activity.quoteNumber && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Quote: {activity.quoteNumber}
                    </p>
                  )}

                  {activity.amount !== undefined && activity.amount > 0 && (
                    <p className="text-xs text-emerald-400 mt-0.5">
                      Amount: ${activity.amount.toLocaleString()}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    {activity.createdBy && ` • by ${activity.createdBy}`}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {activities.length > maxItems && (
          <button className="w-full mt-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors">
            View all {activities.length} activities
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerActivity;
