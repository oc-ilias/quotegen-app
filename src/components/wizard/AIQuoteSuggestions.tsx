/**
 * AI Quote Suggestions Component
 * AI-powered suggestions for pricing, terms, and similar quotes
 * @module components/wizard/AIQuoteSuggestions
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  SparklesIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowRightIcon,
  XMarkIcon,
  CheckIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import type { QuoteFormData, LineItemInput } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface AISuggestion {
  id: string;
  type: 'pricing' | 'terms' | 'similar' | 'discount' | 'product';
  title: string;
  description: string;
  confidence: number; // 0-100
  action: string;
  data?: Record<string, unknown>;
}

interface SimilarQuote {
  id: string;
  quoteNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  matchScore: number;
}

interface PricingInsight {
  productId?: string;
  productName: string;
  suggestedPrice: number;
  currentPrice: number;
  marketAverage: number;
  reason: string;
}

interface AIQuoteSuggestionsProps {
  formData: QuoteFormData;
  onApplySuggestion: (suggestion: AISuggestion) => void;
  onViewSimilarQuote: (quoteId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface SuggestionCardProps {
  suggestion: AISuggestion;
  onApply: (suggestion: AISuggestion) => void;
  isApplying: boolean;
}

// ============================================================================
// Mock AI Service (replace with real API calls)
// ============================================================================

const generateMockSuggestions = (formData: QuoteFormData): AISuggestion[] => {
  const suggestions: AISuggestion[] = [];

  // Pricing suggestions based on line items
  if (formData.line_items?.length > 0) {
    const avgPrice = formData.line_items.reduce((sum, item) => sum + item.unit_price, 0) / formData.line_items.length;
    
    if (avgPrice < 50) {
      suggestions.push({
        id: 'pricing-1',
        type: 'pricing',
        title: 'Consider Volume Discount',
        description: 'Your average unit price is below $50. Consider offering a volume discount for orders over 10 units to increase order value.',
        confidence: 85,
        action: 'Apply 10% volume discount suggestion',
        data: { discountPercent: 10, minQuantity: 10 },
      });
    }

    // Check for high-value items
    const highValueItems = formData.line_items.filter(item => item.unit_price > 500);
    if (highValueItems.length > 0) {
      suggestions.push({
        id: 'pricing-2',
        type: 'pricing',
        title: 'Premium Item Pricing Strategy',
        description: `You have ${highValueItems.length} premium items (>$500). Consider adding extended warranty or support options.`,
        confidence: 78,
        action: 'View premium add-ons',
        data: { items: highValueItems },
      });
    }
  }

  // Terms suggestions
  if (!formData.terms || formData.terms.length < 50) {
    suggestions.push({
      id: 'terms-1',
      type: 'terms',
      title: 'Add Payment Terms',
      description: 'Quotes with clear payment terms (Net 30, Due on Receipt) have 40% higher acceptance rates.',
      confidence: 92,
      action: 'Add standard Net 30 terms',
      data: { terms: 'Payment due within 30 days of invoice date. Late payments subject to 1.5% monthly service charge.' },
    });
  }

  // Valid until suggestion
  const validUntil = formData.valid_until ? new Date(formData.valid_until) : null;
  const daysUntilExpiry = validUntil ? Math.ceil((validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  
  if (!validUntil || daysUntilExpiry > 45) {
    suggestions.push({
      id: 'terms-2',
      type: 'terms',
      title: 'Optimize Quote Validity',
      description: 'Quotes valid for 14-30 days have the highest conversion rates. Longer validity periods may lead to price erosion.',
      confidence: 88,
      action: 'Set 30-day validity',
      data: { validDays: 30 },
    });
  }

  // Similar quotes
  suggestions.push({
    id: 'similar-1',
    type: 'similar',
    title: 'Similar Quotes Found',
    description: '3 similar quotes were sent to customers in the same industry with an average value of $4,250.',
    confidence: 75,
    action: 'View similar quotes',
    data: { 
      similarQuotes: [
        { id: 'qt-001', quoteNumber: 'QT-2024-001', customerName: 'Acme Corp', total: 4200, status: 'accepted', createdAt: '2024-01-15', matchScore: 95 },
        { id: 'qt-002', quoteNumber: 'QT-2024-045', customerName: 'TechStart Inc', total: 3800, status: 'sent', createdAt: '2024-01-20', matchScore: 87 },
        { id: 'qt-003', quoteNumber: 'QT-2024-089', customerName: 'Global Solutions', total: 4750, status: 'accepted', createdAt: '2024-01-22', matchScore: 82 },
      ] as SimilarQuote[]
    },
  });

  // Discount optimization
  const subtotal = formData.line_items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;
  if (subtotal > 5000 && !formData.line_items?.some(item => item.discount_percent && item.discount_percent > 0)) {
    suggestions.push({
      id: 'discount-1',
      type: 'discount',
      title: 'High-Value Order Discount',
      description: 'Orders over $5,000 typically receive a 5-8% discount. Adding a discount may increase close probability by 35%.',
      confidence: 81,
      action: 'Apply 5% order discount',
      data: { discountPercent: 5, minOrderValue: 5000 },
    });
  }

  return suggestions;
};

// ============================================================================
// Sub-Components
// ============================================================================

const SuggestionTypeIcon = ({ type }: { type: AISuggestion['type'] }) => {
  const icons = {
    pricing: CurrencyDollarIcon,
    terms: DocumentTextIcon,
    similar: ChartBarIcon,
    discount: SparklesIcon,
    product: LightBulbIcon,
  };

  const colors = {
    pricing: 'text-emerald-400 bg-emerald-500/10',
    terms: 'text-blue-400 bg-blue-500/10',
    similar: 'text-purple-400 bg-purple-500/10',
    discount: 'text-amber-400 bg-amber-500/10',
    product: 'text-indigo-400 bg-indigo-500/10',
  };

  const Icon = icons[type];
  
  return (
    <div className={cn('p-2 rounded-lg', colors[type])}>
      <Icon className="w-5 h-5" />
    </div>
  );
};

const ConfidenceBadge = ({ confidence }: { confidence: number }) => {
  const getColor = () => {
    if (confidence >= 85) return 'bg-emerald-500/20 text-emerald-400';
    if (confidence >= 70) return 'bg-amber-500/20 text-amber-400';
    return 'bg-slate-500/20 text-slate-400';
  };

  return (
    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getColor())}>
      {confidence}% confidence
    </span>
  );
};

const SuggestionCard = ({ suggestion, onApply, isApplying }: SuggestionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-slate-800/50 border rounded-xl overflow-hidden transition-colors',
        isExpanded ? 'border-indigo-500/30' : 'border-slate-700/50 hover:border-slate-600'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <SuggestionTypeIcon type={suggestion.type} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-slate-200">{suggestion.title}</h4>
              <ConfidenceBadge confidence={suggestion.confidence} />
            </div>
            
            <p className="text-sm text-slate-400 line-clamp-2">{suggestion.description}</p>
            
            {suggestion.type === 'similar' && suggestion.data?.similarQuotes && (
              <div className="mt-3 space-y-2">
                {(suggestion.data.similarQuotes as SimilarQuote[]).slice(0, isExpanded ? undefined : 2).map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-300">{quote.quoteNumber}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{quote.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-300">${quote.total.toLocaleString()}</span>
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        quote.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                        quote.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-500/20 text-slate-400'
                      )}>
                        {quote.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onApply(suggestion)}
            disabled={isApplying}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Applying...
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                {suggestion.action}
              </>
            )}
          </motion.button>

          {suggestion.type === 'similar' && (suggestion.data?.similarQuotes as SimilarQuote[])?.length > 2 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-300 text-sm transition-colors"
            >
              {isExpanded ? 'Show less' : `View ${(suggestion.data?.similarQuotes as SimilarQuote[]).length - 2} more`}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export function AIQuoteSuggestions({
  formData,
  onApplySuggestion,
  onViewSimilarQuote,
  isOpen,
  onClose,
  className,
}: AIQuoteSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AISuggestion['type'] | 'all'>('all');

  // Generate suggestions when form data changes
  useEffect(() => {
    if (!isOpen) return;

    const loadSuggestions = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      const newSuggestions = generateMockSuggestions(formData);
      setSuggestions(newSuggestions);
      setIsLoading(false);
    };

    loadSuggestions();
  }, [formData, isOpen]);

  const handleApply = useCallback(async (suggestion: AISuggestion) => {
    setApplyingId(suggestion.id);
    
    try {
      await onApplySuggestion(suggestion);
      // Remove applied suggestion
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } finally {
      setApplyingId(null);
    }
  }, [onApplySuggestion]);

  const filteredSuggestions = activeTab === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.type === activeTab);

  const tabs: { id: typeof activeTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: suggestions.length },
    { id: 'pricing', label: 'Pricing', count: suggestions.filter(s => s.type === 'pricing').length },
    { id: 'terms', label: 'Terms', count: suggestions.filter(s => s.type === 'terms').length },
    { id: 'similar', label: 'Similar', count: suggestions.filter(s => s.type === 'similar').length },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 z-50 shadow-2xl',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">AI Suggestions</h3>
                  <p className="text-xs text-slate-400">Smart recommendations for your quote</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-2 border-b border-slate-800 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={cn(
                      'ml-1.5 px-1.5 py-0.5 text-xs rounded-full',
                      activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700 text-slate-300'
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(100vh - 140px)' }}>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full"
                  />
                  <p className="mt-4 text-sm text-slate-400">Analyzing your quote...</p>
                </div>
              ) : filteredSuggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LightBulbIcon className="w-12 h-12 text-slate-600 mb-4" />
                  <h4 className="text-slate-300 font-medium mb-1">No suggestions available</h4>
                  <p className="text-sm text-slate-500 max-w-xs">
                    {activeTab === 'all' 
                      ? "We don't have any suggestions for this quote yet. Keep adding items and we'll provide insights."
                      : `No ${activeTab} suggestions available for the current quote.`}
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredSuggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onApply={handleApply}
                      isApplying={applyingId === suggestion.id}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <div className="flex items-start gap-2 text-xs text-slate-500">
                <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  AI suggestions are based on your quote history, market data, and best practices. 
                  Always review before applying.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AIQuoteSuggestions;
export type { AISuggestion, SimilarQuote, PricingInsight };
