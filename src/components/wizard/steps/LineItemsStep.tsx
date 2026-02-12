/**
 * Line Items Step Component
 * Step 3: Configure line items with quantities, discounts, and pricing
 * @module components/wizard/steps/LineItemsStep
 */

'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrashIcon,
  PlusIcon,
  CalculatorIcon,
  TagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { LineItemsData, LineItem, Product } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface LineItemsStepProps {
  /** Current step data */
  data: LineItemsData;
  /** Selected products from previous step */
  products: Product[];
  /** Selected variants mapping */
  variants: Record<string, string>;
  /** Update handler */
  onUpdate: (data: Partial<LineItemsData>) => void;
  /** Error message to display */
  error?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

interface LineItemErrors {
  [index: number]: {
    title?: string;
    quantity?: string;
    unitPrice?: string;
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

const calculateItemTotal = (item: LineItem): number => {
  const subtotal = item.quantity * item.unitPrice;
  const discount = subtotal * (item.discountPercentage || 0) / 100;
  const tax = (subtotal - discount) * (item.taxRate || 0) / 100;
  return subtotal - discount + tax;
};

// ============================================================================
// Main Component
// ============================================================================

export function LineItemsStep({
  data,
  products,
  variants,
  onUpdate,
  error,
  'data-testid': testId,
}: LineItemsStepProps) {
  // ============================================================================
  // State
  // ============================================================================
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<LineItemErrors>({});

  // ============================================================================
  // Initialize Line Items from Products
  // ============================================================================
  useEffect(() => {
    if (data.items.length === 0 && products.length > 0) {
      const initialItems: LineItem[] = products.map((product) => {
        const variantId = variants[product.id];
        const variant = product.variants.find((v) => v.id === variantId) || product.variants[0];

        return {
          id: `item_${product.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId: product.id,
          title: product.title,
          variantTitle: variant?.title,
          quantity: 1,
          unitPrice: variant?.price || 0,
          sku: variant?.sku || '',
          discountAmount: 0,
          discountPercentage: 0,
          taxRate: 0,
          taxAmount: 0,
          subtotal: variant?.price || 0,
          total: variant?.price || 0,
          imageUrl: product.images?.[0],
        };
      });

      onUpdate({ items: initialItems });
    }
  }, [products, variants, data.items.length, onUpdate]);

  // ============================================================================
  // Validation
  // ============================================================================
  useEffect(() => {
    const errors: LineItemErrors = {};

    data.items.forEach((item, index) => {
      const itemErrors: LineItemErrors[number] = {};

      if (!item.title?.trim()) {
        itemErrors.title = 'Item name is required';
      }

      if (item.quantity <= 0) {
        itemErrors.quantity = 'Quantity must be greater than 0';
      }

      if (item.unitPrice < 0) {
        itemErrors.unitPrice = 'Price cannot be negative';
      }

      if (Object.keys(itemErrors).length > 0) {
        errors[index] = itemErrors;
      }
    });

    setValidationErrors(errors);
  }, [data.items]);

  // ============================================================================
  // Calculations
  // ============================================================================
  const totals = useMemo(() => {
    const subtotal = data.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const discount = itemTotal * (item.discountPercentage || 0) / 100;
      return sum + itemTotal - discount;
    }, 0);

    const discountTotal = data.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + itemTotal * (item.discountPercentage || 0) / 100;
    }, 0);

    const taxTotal = data.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const discount = itemTotal * (item.discountPercentage || 0) / 100;
      const taxableAmount = itemTotal - discount;
      return sum + (taxableAmount * (item.taxRate || 0) / 100);
    }, 0);

    const total = subtotal + taxTotal;

    return { subtotal, discountTotal, taxTotal, total };
  }, [data.items]);

  // ============================================================================
  // Handlers
  // ============================================================================
  const handleAddItem = useCallback(() => {
    const newItem: LineItem = {
      id: `item_custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: '',
      title: '',
      quantity: 1,
      unitPrice: 0,
      sku: '',
      discountAmount: 0,
      discountPercentage: 0,
      taxRate: 0,
      taxAmount: 0,
      subtotal: 0,
      total: 0,
    };
    onUpdate({ items: [...data.items, newItem] });
  }, [data.items, onUpdate]);

  const handleRemoveItem = useCallback((index: number) => {
    onUpdate({ items: data.items.filter((_, i) => i !== index) });
  }, [data.items, onUpdate]);

  const handleUpdateItem = useCallback((
    index: number,
    updates: Partial<LineItem>
  ) => {
    const newItems = data.items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onUpdate({ items: newItems });
    setTouched(prev => ({ ...prev, [`${index}-${Object.keys(updates)[0]}`]: true }));
  }, [data.items, onUpdate]);

  const handleBlur = useCallback((index: number, field: string) => {
    setTouched(prev => ({ ...prev, [`${index}-${field}`]: true }));
  }, []);

  const hasErrors = Object.keys(validationErrors).length > 0;
  const hasItems = data.items.length > 0;

  // ============================================================================
  // Render Helpers
  // ============================================================================
  const renderFieldError = (index: number, field: keyof LineItemErrors[number]) => {
    const error = validationErrors[index]?.[field];
    const isTouched = touched[`${index}-${field}`];

    if (!error || !isTouched) return null;

    return (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1 text-xs text-red-400 flex items-center gap-1"
      >
        <ExclamationCircleIcon className="w-3 h-3 flex-shrink-0" />
        {error}
      </motion.p>
    );
  };

  return (
    <div className="p-6 lg:p-8" data-testid={testId}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Line Items</h2>
        <p className="text-slate-400">Configure quantities, pricing, discounts, and taxes for each item.</p>
      </motion.div>

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

      {/* Validation Summary */}
      <AnimatePresence>
        {hasErrors && hasItems && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
          >
            <p className="text-amber-400 text-sm flex items-center gap-2">
              <ExclamationCircleIcon className="w-5 h-5" />
              Please fix validation errors before continuing
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Line Items Table */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {data.items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 lg:p-6"
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
                      value={item.title}
                      onChange={(e) => handleUpdateItem(index, { title: e.target.value })}
                      onBlur={() => handleBlur(index, 'title')}
                      placeholder="Product name"
                      className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                        validationErrors[index]?.title && touched[`${index}-title`]
                          ? 'border-red-500'
                          : 'border-slate-600'
                      }`}
                      data-testid={`line-item-${index}-title`}
                    />
                    {renderFieldError(index, 'title')}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={item.variantTitle || ''}
                      onChange={(e) => handleUpdateItem(index, { variantTitle: e.target.value })}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
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
                      onBlur={() => handleBlur(index, 'quantity')}
                      className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                        validationErrors[index]?.quantity && touched[`${index}-quantity`]
                          ? 'border-red-500'
                          : 'border-slate-600'
                      }`}
                      data-testid={`line-item-${index}-quantity`}
                    />
                    {renderFieldError(index, 'quantity')}
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
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                        onBlur={() => handleBlur(index, 'unitPrice')}
                        className={`w-full pl-7 pr-3 py-2 bg-slate-900 border rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                          validationErrors[index]?.unitPrice && touched[`${index}-unitPrice`]
                            ? 'border-red-500'
                            : 'border-slate-600'
                        }`}
                        data-testid={`line-item-${index}-price`}
                      />
                    </div>
                    {renderFieldError(index, 'unitPrice')}
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
                        step="0.01"
                        value={item.discountPercentage || 0}
                        onChange={(e) => handleUpdateItem(index, { discountPercentage: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 pr-8 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        data-testid={`line-item-${index}-discount`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
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
                        step="0.01"
                        value={item.taxRate || 0}
                        onChange={(e) => handleUpdateItem(index, { taxRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 pr-8 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        data-testid={`line-item-${index}-tax`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
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
                    data-testid={`line-item-${index}-remove`}
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
          whileHover={{ scale: 1.02, borderColor: 'rgba(99, 102, 241, 0.5)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddItem}
          className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-2"
          data-testid="add-line-item-button"
        >
          <PlusIcon className="w-5 h-5" />
          Add Custom Line Item
        </motion.button>
      </div>

      {/* Totals Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-slate-800 border border-slate-700 rounded-xl p-6"
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

          {totals.discountTotal > 0 && (
            <div className="flex justify-between text-emerald-400"
            >
              <span>Discount</span>
              <span>-{formatCurrency(totals.discountTotal)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-400">
            <span>Tax</span>
            <span>{formatCurrency(totals.taxTotal)}</span>
          </div>

          <div className="border-t border-slate-700 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">Total</span>
              <span className="text-2xl font-bold text-indigo-400">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Validation Status */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          {hasErrors ? (
            <div className="flex items-center gap-2 text-amber-400">
              <ExclamationCircleIcon className="w-5 h-5" />
              <span className="text-sm">Please fix validation errors</span>
            </div>
          ) : hasItems ? (
            <div className="flex items-center gap-2 text-emerald-400"
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-sm">Ready to continue</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <PlusIcon className="w-5 h-5" />
              <span className="text-sm">Add at least one line item</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default LineItemsStep;
