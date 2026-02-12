/**
 * Product Selection Step Component
 * Step 2: Select products for the quote
 * @module components/wizard/steps/ProductSelectionStep
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ShoppingBagIcon,
  TagIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { ProductSelectionData, Product } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface ProductSelectionStepProps {
  /** Current step data */
  data: ProductSelectionData;
  /** Update handler */
  onUpdate: (data: Partial<ProductSelectionData>) => void;
  /** Error message to display */
  error?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

interface LoadingState {
  type: 'search' | 'add' | 'remove';
  message: string;
  productId?: string;
}

// ============================================================================
// Mock Products (Replace with API call in production)
// ============================================================================

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

// ============================================================================
// Utility Functions
// ============================================================================

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// ============================================================================
// Main Component
// ============================================================================

export function ProductSelectionStep({
  data,
  onUpdate,
  error,
  'data-testid': testId,
}: ProductSelectionStepProps) {
  // ============================================================================
  // State
  // ============================================================================
  const [searchQuery, setSearchQuery] = useState(data.searchQuery || '');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Search Effect with Debounce
  // ============================================================================
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      setIsSearching(true);

      searchTimeoutRef.current = setTimeout(() => {
        try {
          const results = mockProducts.filter(
            (p) =>
              p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          setSearchResults(results);
        } catch (err) {
          console.error('Search error:', err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // ============================================================================
  // Handlers
  // ============================================================================
  const handleToggleProduct = useCallback(async (product: Product) => {
    const isSelected = data.selectedProducts.some((p) => p.id === product.id);

    if (isSelected) {
      setLoadingState({ type: 'remove', message: 'Removing product...', productId: product.id });
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      onUpdate({
        selectedProducts: data.selectedProducts.filter((p) => p.id !== product.id),
        selectedVariants: Object.fromEntries(
          Object.entries(data.selectedVariants).filter(([key]) => key !== product.id)
        ),
      });
    } else {
      setLoadingState({ type: 'add', message: 'Adding product...', productId: product.id });
      
      await new Promise(resolve => setTimeout(resolve, 200));

      onUpdate({
        selectedProducts: [...data.selectedProducts, product],
        selectedVariants: {
          ...data.selectedVariants,
          [product.id]: product.variants[0]?.id,
        },
      });
    }
    
    setLoadingState(null);
  }, [data, onUpdate]);

  const handleSelectVariant = useCallback((productId: string, variantId: string) => {
    onUpdate({
      selectedVariants: {
        ...data.selectedVariants,
        [productId]: variantId,
      },
    });
  }, [data, onUpdate]);

  const handleRemoveProduct = useCallback(async (productId: string) => {
    setLoadingState({ type: 'remove', message: 'Removing product...', productId });
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    onUpdate({
      selectedProducts: data.selectedProducts.filter((p) => p.id !== productId),
      selectedVariants: Object.fromEntries(
        Object.entries(data.selectedVariants).filter(([key]) => key !== productId)
      ),
    });
    
    setLoadingState(null);
  }, [data, onUpdate]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setSearchQuery(searchQuery); // Trigger re-search
  }, [searchQuery]);

  // ============================================================================
  // Render Helpers
  // ============================================================================
  const isProductLoading = (productId: string) => 
    loadingState?.productId === productId;

  return (
    <div className="p-6 lg:p-8" data-testid={testId}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Select Products</h2>
        <p className="text-slate-400">Search and select products to include in your quote.</p>
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

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-6"
      >
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by name, SKU, or tags..."
          className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          data-testid="product-search-input"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}
      </motion.div>

      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
            data-testid="product-search-results"
          >
            <div className="p-3 bg-slate-700/50 border-b border-slate-700">
              <p className="text-sm text-slate-400">Search Results</p>
            </div>
            {searchResults.map((product, index) => {
              const isSelected = data.selectedProducts.some((p) => p.id === product.id);
              const selectedVariantId = data.selectedVariants[product.id];
              const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
              const isLoading = isProductLoading(product.id);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 border-b border-slate-700 last:border-b-0 ${isSelected ? 'bg-indigo-500/5' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image Placeholder */}
                    <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingBagIcon className="w-8 h-8 text-slate-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-slate-200">{product.title}</h3>
                          <p className="text-sm text-slate-500 mt-1">{product.vendor}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {product.tags.map((tag) => (
                              <span key={tag} className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded">
                                <TagIcon className="w-3 h-3 inline mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggleProduct(product)}
                          disabled={isLoading}
                          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              : 'bg-indigo-500 text-white hover:bg-indigo-600'
                          } disabled:opacity-50`}
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                            </motion.div>
                          ) : isSelected ? (
                            'Remove'
                          ) : (
                            'Add'
                          )}
                        </motion.button>
                      </div>

                      {/* Variant Selection */}
                      <AnimatePresence>
                        {isSelected && product.variants.length > 1 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
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
                                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                  }`}
                                >
                                  {variant.title} - {formatCurrency(variant.price)}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

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

        {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-6 bg-slate-800 border border-slate-700 rounded-xl text-center"
          >
            <ShoppingBagIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No products found matching "{searchQuery}"</p>
            <button
              onClick={handleRetry}
              className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Retry search
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-medium text-slate-200">
          Selected Products ({data.selectedProducts.length})
        </h3>

        <AnimatePresence mode="popLayout">
          {data.selectedProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12 bg-slate-800/50 border border-slate-700 border-dashed rounded-xl"
            >
              <ShoppingBagIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No products selected yet</p>
              <p className="text-sm text-slate-500 mt-1">Search and add products above</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {data.selectedProducts.map((product, index) => {
                const selectedVariantId = data.selectedVariants[product.id];
                const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
                const isLoading = isProductLoading(product.id);

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                      <CheckIcon className="w-6 h-6 text-indigo-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-200 truncate">{product.title}</h4>
                      <p className="text-sm text-slate-400">
                        {selectedVariant?.title} - {formatCurrency(selectedVariant?.price || 0)}
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveProduct(product.id)}
                      disabled={isLoading}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Remove item"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <ArrowPathIcon className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <XMarkIcon className="w-5 h-5" />
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default ProductSelectionStep;
