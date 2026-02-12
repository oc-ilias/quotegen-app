/**
 * Customer Card Component
 * Compact customer display for grid layouts
 * @module components/customers/CustomerCard
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { CustomerWithStats } from '@/types/quote';
import { CustomerStatusLabels, CustomerStatusColors } from '@/types/quote';

interface CustomerCardProps {
  customer: CustomerWithStats;
  onClick?: () => void;
  className?: string;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onClick,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'bg-slate-800 border border-slate-700 rounded-xl p-5 cursor-pointer',
        'transition-all duration-200',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            alt={customer.contactName}
            src={customer.logoUrl}
            size="lg"
          />
          <div>
            <h3 className="font-semibold text-slate-100">{customer.contactName}</h3>
            <p className="text-sm text-slate-500">{customer.companyName}</p>
          </div>
        </div>

        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border',
            CustomerStatusColors[customer.status]
          )}
        >
          {CustomerStatusLabels[customer.status]}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <EnvelopeIcon className="w-4 h-4 text-slate-500" />
          <span className="text-slate-300 truncate">{customer.email}</span>
        </div>

        {customer.phone && (
          <div className="flex items-center gap-2 text-sm">
            <PhoneIcon className="w-4 h-4 text-slate-500" />
            <span className="text-slate-300">{customer.phone}</span>
          </div>
        )}

        {customer.billingAddress && (
          <div className="flex items-start gap-2 text-sm">
            <MapPinIcon className="w-4 h-4 text-slate-500 mt-0.5" />
            <span className="text-slate-400 text-xs">
              {customer.billingAddress.city}, {customer.billingAddress.country}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-100">{customer.stats.totalQuotes}</p>
          <p className="text-xs text-slate-500">Quotes</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-emerald-400">
            {customer.stats.conversionRate.toFixed(0)}%
          </p>
          <p className="text-xs text-slate-500">Conversion</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-100">
            ${(customer.stats.totalRevenue / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-slate-500">Revenue</p>
        </div>
      </div>

      {/* Tags */}
      {customer.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {customer.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {customer.tags.length > 3 && (
            <span className="text-xs text-slate-500">
              +{customer.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-slate-500 mt-4">
        Added {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
      </p>
    </motion.div>
  );
};

export default CustomerCard;
