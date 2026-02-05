/**
 * Line Items Step Component
 * Step 3: Configure line items with quantities, discounts, and pricing
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrashIcon,
  PlusIcon,
  CalculatorIcon,
  TagIcon,
  CurrencyDollarIcon,
  // PercentIcon removed - use alternative
  DocumentTextIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { LineItemsData, LineItemInput, Product } from '@/types/quote';

interface LineItemsStepProps {
  data: LineItemsData;
  products: Product[];
  variants: Record<string, string>;
  onUpdate: (data: Partial<LineItemsData>) => void;
  error?: string;
}

export function LineItemsStep({ data, products, variants, onUpdate, error }: LineItemsStepProps) {
  
  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = data.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const discount = itemTotal * (item.discount_percent || 0) / 100;
      return sum + itemTotal - discount;
    }, 0);

    const taxTotal = data.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const discount = itemTotal * (item.discount_percent || 0) / 100;
      const taxableAmount = itemTotal - discount;
      return sum + (taxableAmount * (item.tax_rate || 0) / 100);
    }, 0);

    const total = subtotal + taxTotal;

    return { subtotal, taxTotal, total };
  }, [data.items]);

  // Initialize line items from products if empty
  React.useEffect(() => {
    if (data.items.length === 0 && products.length > 0) {
      const initialItems: LineItemInput[] = products.map((product) => {
        const variantId = variants[product.id];
        const variant = product.variants.find((v) => v.id === variantId) || product.variants[0];
        
        return {
          product_id: product.id,
          name: product.title,
          description: variant?.title,
          quantity: 1,
          unit_price: variant?.price || 0,
          sku: variant?.sku,
          discount_percent: 0,
          tax_rate: 0,
        };
      });

      onUpdate({ items: initialItems });
    }
  }, [products, variants, data.items.length, onUpdate]);

  const handleAddItem = useCallback(() => {
    const newItem: LineItemInput = {
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      tax_rate: 0,
    };
    onUpdate({ items: [...data.items, newItem] });
  }, [data.items, onUpdate]);

  const handleRemoveItem = useCallback((index: number) => {
    onUpdate({ items: data.items.filter((_, i) => i !== index) });
  }, [data.items, onUpdate]);

  const handleUpdateItem = useCallback((index: number, updates: Partial<LineItemInput>) => {
    const newItems = data.items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onUpdate({ items: newItems });
  }, [data.items, onUpdate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const calculateItemTotal = (item: LineItemInput) => {
    const subtotal = item.quantity * item.unit_price;
    const discount = subtotal * (item.discount_percent || 0) / 100;
    const tax = (subtotal - discount) * (item.tax_rate || 0) / 100;
    return subtotal - discount + tax;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Line Items</h2>
        <p className="text-slate-400">Configure quantities, pricing, discounts, and taxes for each item.</p>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4"
          >
            <p className="text-red-400 text-sm flex items-center gap-2">
              <ExclamationCircleIcon className="w-5 h-5" />
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Line Items Table */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {data.items.map((item, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Item Name & Description */}
                <div className="lg:col-span-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(index, { name: e.target.value })}
                      placeholder="Product name"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => handleUpdateItem(index, { description: e.target.value })}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                  
                  {item.sku && (
                    <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                  )}
                </div>

                {/* Quantity & Unit Price */}
                <div className="lg:col-span-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Qty *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(index, { quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Unit Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleUpdateItem(index, { unit_price: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Discount & Tax */}
                <div className="lg:col-span-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Discount %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount_percent || 0}
                        onChange={(e) => handleUpdateItem(index, { discount_percent: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                      <PercentIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Tax %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.tax_rate || 0}
                        onChange={(e) => handleUpdateItem(index, { tax_rate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                      <PercentIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* Total & Remove */}
                <div className="lg:col-span-2 flex items-end justify-between lg:justify-end gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="text-lg font-semibold text-slate-200">
                      {formatCurrency(calculateItemTotal(item))}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    aria-label="Remove item"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Item Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddItem}
          className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Custom Line Item
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

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-slate-400">
            <span>Tax</span>
            <span>{formatCurrency(totals.taxTotal)}</span>
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

export default LineItemsStep;
