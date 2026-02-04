/**
 * Product Selection Step Component
 * Step 2: Select products for the quote
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  SearchIcon,
  PlusIcon,
  CheckIcon,
  ChevronDownIcon,
  XMarkIcon,
  ShoppingBagIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import type { ProductSelectionData, Product } from '@/types/quote';

interface ProductSelectionStepProps {
  data: ProductSelectionData;
  onUpdate: (data: Partial<ProductSelectionData>) => void;
  error?: string;
}

// Mock products for demo
const mockProducts: Product[] = [
  {
    id: 'prod_1',
    title: 'Industrial Widget Pro',
    description: 'High-performance widget for industrial applications',
    handle: 'industrial-widget-pro',
    images: ['/products/widget-pro.jpg'],
    variants: [
      { id: 'var_1', title: 'Standard', sku: 'IWP-001', price: 299.99, inventoryQuantity: 100, options: {} },
      { id: 'var_2', title: 'Heavy Duty', sku: 'IWP-002', price: 399.99, inventoryQuantity: 50, options: {} },
    ],
    tags: ['industrial', 'widget'],
    productType: 'Widgets',
    vendor: 'Acme Manufacturing',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod_2',
    title: 'Premium Connector Set',
    description: 'Professional grade connectors for all applications',
    handle: 'premium-connector-set',
    images: ['/products/connector-set.jpg'],
    variants: [
      { id: 'var_3', title: 'Small Set (10pc)', sku: 'PCS-010', price: 49.99, inventoryQuantity: 200, options: {} },
      { id: 'var_4', title: 'Large Set (50pc)', sku: 'PCS-050', price: 199.99, inventoryQuantity: 100, options: {} },
    ],
    tags: ['connectors', 'hardware'],
    productType: 'Connectors',
    vendor: 'ConnectorCorp',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod_3',
    title: 'Control Module X200',
    description: 'Advanced control module with IoT capabilities',
    handle: 'control-module-x200',
    images: ['/products/control-module.jpg'],
    variants: [
      { id: 'var_5', title: 'Basic', sku: 'CMX-200-B', price: 599.99, inventoryQuantity: 25, options: {} },
      { id: 'var_6', title: 'Pro', sku: 'CMX-200-P', price: 899.99, inventoryQuantity: 15, options: {} },
    ],
    tags: ['electronics', 'control'],
    productType: 'Modules',
    vendor: 'TechControl',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function ProductSelectionStep({ data, onUpdate, error }: ProductSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // Search products
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      const timeout = setTimeout(() => {
        const results = mockProducts.filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timeout);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleToggleProduct = useCallback((product: Product) => {
    const isSelected = data.selectedProducts.some((p) => p.id === product.id);
    
    if (isSelected) {
      onUpdate({
        selectedProducts: data.selectedProducts.filter((p) => p.id !== product.id),
        selectedVariants: Object.fromEntries(
          Object.entries(data.selectedVariants).filter(([key]) => key !== product.id)
        ),
      });
    } else {
      onUpdate({
        selectedProducts: [...data.selectedProducts, product],
        selectedVariants: {
          ...data.selectedVariants,
          [product.id]: product.variants[0]?.id,
        },
      });
    }
  }, [data, onUpdate]);

  const handleSelectVariant = useCallback((productId: string, variantId: string) => {
    onUpdate({
      selectedVariants: {
        ...data.selectedVariants,
        [productId]: variantId,
      },
    });
  }, [data, onUpdate]);

  const handleRemoveProduct = useCallback((productId: string) => {
    onUpdate({
      selectedProducts: data.selectedProducts.filter((p) => p.id !== productId),
      selectedVariants: Object.fromEntries(
        Object.entries(data.selectedVariants).filter(([key]) => key !== productId)
      ),
    });
  }, [data, onUpdate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Select Products</h2>
        <p className="text-slate-400">Search and select products to include in your quote.</p>
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
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by name, SKU, or tags..."
          className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
          >
            <div className="p-3 bg-slate-800/50 border-b border-slate-800">
              <p className="text-sm text-slate-400">Search Results</p>
            </div>
            {searchResults.map((product) => {
              const isSelected = data.selectedProducts.some((p) => p.id === product.id);
              const selectedVariantId = data.selectedVariants[product.id];
              const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 border-b border-slate-800 last:border-b-0 ${isSelected ? 'bg-indigo-500/5' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image Placeholder */}
                    <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingBagIcon className="w-8 h-8 text-slate-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-slate-200">{product.title}</h3>
                          <p className="text-sm text-slate-500 mt-1">{product.vendor}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {product.tags.map((tag) => (
                              <span key={tag} className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggleProduct(product)}
                          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              : 'bg-indigo-500 text-white hover:bg-indigo-600'
                          }`}
                        >
                          {isSelected ? 'Remove' : 'Add'}
                        </motion.button>
                      </div>

                      {/* Variant Selection */}
                      {isSelected && product.variants.length > 1 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4"
                        >
                          <label className="text-sm text-slate-400 mb-2 block">Select Variant</label>
                          <div className="flex flex-wrap gap-2">
                            {product.variants.map((variant) => (
                              <button
                                key={variant.id}
                                onClick={() => handleSelectVariant(product.id, variant.id)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                  selectedVariantId === variant.id
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                              >
                                {variant.title} - {formatCurrency(variant.price)}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {isSelected && selectedVariant && (
                        <p className="mt-2 text-sm text-indigo-400">
                          Selected: {selectedVariant.title} - {formatCurrency(selectedVariant.price)}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Products */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-200">
          Selected Products ({data.selectedProducts.length})
        </h3>

        {data.selectedProducts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl">
            <ShoppingBagIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No products selected yet</p>
            <p className="text-sm text-slate-500 mt-1">Search and add products above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.selectedProducts.map((product) => {
              const selectedVariantId = data.selectedVariants[product.id];
              const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl"
                >
                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                    <CheckIcon className="w-6 h-6 text-indigo-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-200 truncate">{product.title}</h4>
                    <p className="text-sm text-slate-500">
                      {selectedVariant?.title} - {formatCurrency(selectedVariant?.price || 0)}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveProduct(product.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductSelectionStep;
