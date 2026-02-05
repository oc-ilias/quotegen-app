/**
 * Customer Info Step - Enhanced
 * @module components/wizard/steps/CustomerInfoStepEnhanced
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Customer } from '@/types/quote';

interface CustomerInfoStepEnhancedProps {
  data: Customer;
  onUpdate: (customer: Customer) => void;
  customers: Customer[];
  error?: string;
}

export function CustomerInfoStepEnhanced({ 
  data, 
  onUpdate, 
  customers,
  error 
}: CustomerInfoStepEnhancedProps) {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Customer Information</h2>
        <p className="text-slate-400">Select an existing customer or create a new one.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
            <input
              type="text"
              value={data.company || ''}
              onChange={(e) => onUpdate({ ...data, company: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Acme Corporation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Contact Name *</label>
            <input
              type="text"
              value={data.name || ''}
              onChange={(e) => onUpdate({ ...data, name: e.target.value })}
              className={cn(
                'w-full px-4 py-3 bg-slate-800 border rounded-xl text-slate-200 focus:ring-2 transition-all',
                error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
              )}
              placeholder="John Smith"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => onUpdate({ ...data, email: e.target.value })}
              className={cn(
                'w-full px-4 py-3 bg-slate-800 border rounded-xl text-slate-200 focus:ring-2 transition-all',
                error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
              )}
              placeholder="john@acme.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
            <input
              type="tel"
              value={data.phone || ''}
              onChange={(e) => onUpdate({ ...data, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {customers.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Or select existing customer:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customers.slice(0, 4).map((customer) => (
                <motion.button
                  key={customer.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onUpdate(customer)}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-colors',
                    data.id === customer.id
                      ? 'bg-indigo-500/10 border-indigo-500/50'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  )}
                >
                  <div className="font-medium text-slate-200">{customer.company || customer.name}</div>
                  <div className="text-sm text-slate-500">{customer.email}</div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerInfoStepEnhanced;
