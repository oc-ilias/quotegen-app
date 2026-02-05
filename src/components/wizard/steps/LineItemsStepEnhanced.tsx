/**
 * Line Items Step - Enhanced
 * @module components/wizard/steps/LineItemsStepEnhanced
 */

'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrashIcon, PlusIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import type { LineItem } from '@/types/quote';

interface LineItemsStepEnhancedProps {
  items: LineItem[];
  onUpdate: (items: LineItem[]) => void;
  currency?: string;
  error?: string;
}

export function LineItemsStepEnhanced({
  items,
  onUpdate,
  currency = 'USD',
  error,
}: LineItemsStepEnhancedProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const discount = itemTotal * (item.discount_percent || 0) / 100;
      return sum + itemTotal - discount;
    }, 0);

    const taxTotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const discount = itemTotal * (item.discount_percent || 0) / 100;
      return sum + ((itemTotal - discount) * (item.tax_rate || 0) / 100);
    }, 0);

    return { subtotal, taxTotal, total: subtotal + taxTotal };
  }, [items]);

  const updateItem = (index: number, updates: Partial<LineItem>) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onUpdate(newItems);
  };

  const removeItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onUpdate([
      ...items,
      {
        id: `temp-${Date.now()}`,
        name: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        tax_rate: 0,
        discount_percent: 0,
      },
    ]);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Line Items</h2>
        <p className="text-slate-400">Configure quantities, pricing, discounts, and taxes.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item.id || index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4"
              >
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Item Name *</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, { name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Product name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Qty *</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Price *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, { unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount_percent || 0}
                    onChange={(e) => updateItem(index, { discount_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2 flex items-end justify-between">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Total</label>
                    <div className="text-sm font-medium text-slate-200">
                      {formatCurrency(
                        item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100)
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeItem(index)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  value={item.description || ''}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Description (optional)"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addItem}
          className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Line Item
        </motion.button>
      </div>

      {/* Totals Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <CalculatorIcon className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-200">Quote Summary</h3>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span className="text-slate-300">{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Tax</span>
            <span className="text-slate-300">{formatCurrency(totals.taxTotal)}</span>
          </div>
          <div className="border-t border-slate-800 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-200">Total</span>
              <span className="text-xl font-bold text-indigo-400">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LineItemsStepEnhanced;
