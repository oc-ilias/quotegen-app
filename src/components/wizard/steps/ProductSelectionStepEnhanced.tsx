/**
 * Product Selection Step - Enhanced
 * @module components/wizard/steps/ProductSelectionStepEnhanced
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/types/quote';

interface ProductSelectionStepEnhancedProps {
  selectedProducts: string[];
  onUpdate: (productIds: string[]) => void;
  products: Product[];
  error?: string;
}

export function ProductSelectionStepEnhanced({
  selectedProducts,
  onUpdate,
  products,
  error,
}: ProductSelectionStepEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      onUpdate(selectedProducts.filter((id) => id !== productId));
    } else {
      onUpdate([...selectedProducts, productId]);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Select Products</h2>
        <p className="text-slate-400">Choose products to include in your quote.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredProducts.map((product) => {
            const isSelected = selectedProducts.includes(product.id);
            return (
              <motion.button
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleProduct(product.id)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all relative',
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5',
                      isSelected
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-slate-600'
                    )}
                  >
                    {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-200">{product.title}</div>
                    {product.description && (
                      <div className="text-sm text-slate-500 mt-1 line-clamp-2">{product.description}</div>
                    )}
                    <div className="text-sm text-indigo-400 mt-2">
                      From ${product.variants?.[0]?.price || 0}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No products found</p>
        </div>
      )}

      {selectedProducts.length > 0 && (
        <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-indigo-400">
              {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => onUpdate([])}
              className="text-sm text-slate-400 hover:text-slate-300"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductSelectionStepEnhanced;
