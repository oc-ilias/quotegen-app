/**
 * Quote Edit Page
 * Full-page quote editing with 4-step wizard
 * @module app/quotes/[id]/edit/page
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  UserIcon,
  ListBulletIcon,
  DocumentTextIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  BookmarkSquareIcon as SaveIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { cn, formatCurrency } from '@/lib/utils';
import type { Quote, Customer, LineItem, QuoteTerms } from '@/types/quote';
import { QuoteStatus, QuotePriority, CustomerStatus } from '@/types/quote';

// ============================================================================
// Mock Data
// ============================================================================

const mockCustomers: Customer[] = [
  {
    id: 'cust_1',
    email: 'john.smith@acmecorp.com',
    companyName: 'Acme Corporation',
    contactName: 'John Smith',
    phone: '+1 (555) 123-4567',
    billingAddress: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    customerSince: new Date('2023-01-15'),
    tags: ['enterprise'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2026-02-04'),
    status: CustomerStatus.ACTIVE,
  },
  {
    id: 'cust_2',
    email: 'sarah@globex.com',
    companyName: 'Globex Industries',
    contactName: 'Sarah Johnson',
    phone: '+1 (555) 987-6543',
    billingAddress: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'US',
    },
    customerSince: new Date('2023-03-20'),
    tags: ['mid-market'],
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2026-02-03'),
    status: CustomerStatus.ACTIVE,
  },
];

const mockQuote: Quote = {
  id: 'qt_001',
  quoteNumber: 'QT-2026-001',
  customerId: 'cust_1',
  customer: mockCustomers[0],
  title: 'Industrial Equipment Package - Q1 2026',
  status: QuoteStatus.DRAFT,
  priority: QuotePriority.HIGH,
  lineItems: [
    {
      id: 'li_1',
      productId: 'prod_1',
      title: 'Industrial Conveyor Belt System',
      sku: 'ICB-2000',
      quantity: 2,
      unitPrice: 5000,
      discountAmount: 500,
      discountPercentage: 5,
      taxRate: 10,
      taxAmount: 950,
      subtotal: 10000,
      total: 10450,
      notes: 'Installation included',
    },
    {
      id: 'li_2',
      productId: 'prod_2',
      title: 'Motor Control Unit',
      sku: 'MCU-500',
      quantity: 4,
      unitPrice: 750,
      discountAmount: 0,
      taxRate: 10,
      taxAmount: 300,
      subtotal: 3000,
      total: 3300,
    },
  ],
  subtotal: 13000,
  discountTotal: 500,
  taxTotal: 1250,
  shippingTotal: 500,
  total: 14250,
  terms: {
    paymentTerms: 'Net 30',
    deliveryTerms: '2-3 weeks after order confirmation',
    validityPeriod: 30,
    depositRequired: true,
    depositPercentage: 50,
    currency: 'USD',
    notes: 'Price valid for 30 days. Subject to availability.',
    internalNotes: 'VIP customer - prioritize delivery',
  },
  metadata: {
    createdBy: 'user_1',
    createdByName: 'Jane Doe',
    source: 'web',
  },
  expiresAt: new Date('2026-03-05'),
  createdAt: new Date('2026-02-03'),
  updatedAt: new Date('2026-02-03'),
};

// ============================================================================
// Types
// ============================================================================

type WizardStep = 'customer' | 'items' | 'terms' | 'review';

interface LineItemForm {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  notes: string;
}

// ============================================================================
// Step Indicator Component
// ============================================================================

const StepIndicator: React.FC<{
  steps: { id: WizardStep; label: string; icon: React.ElementType }[];
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
  completedSteps: WizardStep[];
}> = ({ steps, currentStep, onStepClick, completedSteps }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.includes(step.id);
        const canClick = isCompleted || step.id === currentStep;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => canClick && onStepClick(step.id)}
              disabled={!canClick}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                isActive && 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
                isCompleted && !isActive && 'text-emerald-400 hover:bg-emerald-500/10',
                !isActive && !isCompleted && 'text-slate-500 cursor-not-allowed'
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium',
                isActive && 'bg-indigo-500 text-white',
                isCompleted && 'bg-emerald-500 text-white',
                !isActive && !isCompleted && 'bg-slate-700 text-slate-400'
              )}>
                {isCompleted ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="hidden sm:inline font-medium">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <div className={cn(
                'w-8 h-0.5',
                isCompleted ? 'bg-emerald-500' : 'bg-slate-700'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function QuoteEditPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToastHelpers();
  const quoteId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [currentStep, setCurrentStep] = useState<WizardStep>('customer');
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form data
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [lineItems, setLineItems] = useState<LineItemForm[]>([]);
  const [terms, setTerms] = useState<QuoteTerms>({
    paymentTerms: 'Net 30',
    deliveryTerms: '',
    validityPeriod: 30,
    depositRequired: false,
    depositPercentage: 0,
    currency: 'USD',
    notes: '',
    internalNotes: '',
  });

  // Fetch quote data
  useEffect(() => {
    const fetchQuote = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setQuote(mockQuote);
        setSelectedCustomerId(mockQuote.customerId);
        setLineItems(mockQuote.lineItems.map(item => ({
          id: item.id,
          name: item.title,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercentage || 0,
          taxRate: item.taxRate,
          notes: item.notes || '',
        })));
        setTerms(mockQuote.terms);
      } catch (err) {
        showError('Failed to load quote', err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId, showError]);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    return lineItems.reduce((acc, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const discount = subtotal * (item.discountPercent / 100);
      const taxable = subtotal - discount;
      const tax = taxable * (item.taxRate / 100);
      const total = taxable + tax;

      return {
        subtotal: acc.subtotal + subtotal,
        discount: acc.discount + discount,
        tax: acc.tax + tax,
        total: acc.total + total,
      };
    }, { subtotal: 0, discount: 0, tax: 0, total: 0 });
  }, [lineItems]);

  // Track changes
  useEffect(() => {
    if (quote) {
      setHasChanges(true);
    }
  }, [selectedCustomerId, lineItems, terms, quote]);

  const steps = [
    { id: 'customer' as WizardStep, label: 'Customer', icon: UserIcon },
    { id: 'items' as WizardStep, label: 'Line Items', icon: ListBulletIcon },
    { id: 'terms' as WizardStep, label: 'Terms', icon: DocumentTextIcon },
    { id: 'review' as WizardStep, label: 'Review', icon: EyeIcon },
  ];

  const handleNext = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const handleStepClick = (step: WizardStep) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  const handleAddItem = () => {
    setLineItems(prev => [...prev, {
      id: `new_${Date.now()}`,
      name: '',
      sku: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxRate: 0,
      notes: '',
    }]);
  };

  const handleRemoveItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItemForm, value: string | number) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async (sendAfterSave = false) => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success(sendAfterSave ? 'Quote saved and sent!' : 'Quote saved successfully');
      setHasChanges(false);
      router.push(`/quotes/${quoteId}`);
    } catch (err) {
      showError('Failed to save quote', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowDiscardModal(true);
    } else {
      router.push(`/quotes/${quoteId}`);
    }
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-12" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (!quote) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <ExclamationTriangleIcon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Quote Not Found</h1>
          <p className="text-slate-400 mb-6">The quote you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/quotes')}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Quotes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Edit Quote</h1>
              <p className="text-slate-400">{quote.quoteNumber}</p>
            </div>
          </div>
        </motion.div>

        {/* Unsaved Changes Banner */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg"
            >
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-sm text-amber-300">
                You have unsaved changes. Don't forget to save before leaving.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Indicator */}
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
        />

        {/* Step Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <AnimatePresence mode="wait">
            {/* Customer Step */}
            {currentStep === 'customer' && (
              <motion.div
                key="customer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-semibold text-slate-200">Select Customer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={cn(
                        'p-4 rounded-xl border text-left transition-all',
                        selectedCustomerId === customer.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      )}
                    >
                      <p className="font-medium text-slate-200">{customer.companyName}</p>
                      <p className="text-sm text-slate-400">{customer.contactName}</p>
                      <p className="text-sm text-slate-500 mt-1">{customer.email}</p>
                      {selectedCustomerId === customer.id && (
                        <div className="mt-2 flex items-center gap-1 text-indigo-400 text-sm">
                          <CheckCircleIcon className="w-4 h-4" />
                          Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <Button variant="secondary" onClick={() => {}}>
                  + Create New Customer
                </Button>
              </motion.div>
            )}

            {/* Items Step */}
            {currentStep === 'items' && (
              <motion.div
                key="items"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-200">Line Items</h2>
                  <Button variant="secondary" size="sm" onClick={handleAddItem}>
                    + Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {lineItems.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/50 rounded-xl">
                      <p className="text-slate-400">No items added yet</p>
                      <Button variant="secondary" className="mt-4" onClick={handleAddItem}>
                        Add First Item
                      </Button>
                    </div>
                  ) : (
                    lineItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-slate-800/50 rounded-xl space-y-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Item name"
                              value={item.name}
                              onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                            <input
                              type="text"
                              placeholder="SKU"
                              value={item.sku}
                              onChange={(e) => handleItemChange(item.id, 'sku', e.target.value)}
                              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Unit Price</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Discount %</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={(e) => handleItemChange(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Tax %</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.taxRate}
                              onChange={(e) => handleItemChange(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Total</label>
                            <p className="py-2 text-emerald-400 font-medium">
                              {formatCurrency(
                                (item.quantity * item.unitPrice * (1 - item.discountPercent / 100)) * 
                                (1 + item.taxRate / 100)
                              )}
                            </p>
                          </div>
                        </div>

                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={item.notes}
                          onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                        />
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Totals */}
                <div className="mt-6 p-4 bg-slate-800/30 rounded-xl">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-slate-200">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Discount</span>
                    <span className="text-emerald-400">-{formatCurrency(totals.discount)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Tax</span>
                    <span className="text-slate-200">{formatCurrency(totals.tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-slate-700">
                    <span className="text-slate-200">Total</span>
                    <span className="text-emerald-400">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Terms Step */}
            {currentStep === 'terms' && (
              <motion.div
                key="terms"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-semibold text-slate-200">Terms & Conditions</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Currency</label>
                    <select
                      value={terms.currency}
                      onChange={(e) => setTerms(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Payment Terms</label>
                    <select
                      value={terms.paymentTerms}
                      onChange={(e) => setTerms(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 45">Net 45</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Validity Period (days)</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={terms.validityPeriod}
                      onChange={(e) => setTerms(prev => ({ ...prev, validityPeriod: parseInt(e.target.value) || 30 }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Deposit Required</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={terms.depositRequired}
                          onChange={(e) => setTerms(prev => ({ ...prev, depositRequired: e.target.checked }))}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500"
                        />
                        <span className="text-slate-300">Require deposit</span>
                      </label>
                      {terms.depositRequired && (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={terms.depositPercentage}
                          onChange={(e) => setTerms(prev => ({ ...prev, depositPercentage: parseInt(e.target.value) || 0 }))}
                          className="w-20 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      )}
                      {terms.depositRequired && <span className="text-slate-400">%</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Delivery Terms</label>
                  <input
                    type="text"
                    value={terms.deliveryTerms}
                    onChange={(e) => setTerms(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                    placeholder="e.g., 2-3 weeks after order confirmation"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Customer Notes (visible to customer)</label>
                  <textarea
                    rows={3}
                    value={terms.notes}
                    onChange={(e) => setTerms(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for the customer..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Internal Notes (team only)</label>
                  <textarea
                    rows={3}
                    value={terms.internalNotes}
                    onChange={(e) => setTerms(prev => ({ ...prev, internalNotes: e.target.value }))}
                    placeholder="Internal notes..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-semibold text-slate-200">Review Quote</h2>
                
                <div className="p-4 bg-slate-800/30 rounded-xl space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">Customer</p>
                    <p className="font-medium text-slate-200">
                      {mockCustomers.find(c => c.id === selectedCustomerId)?.companyName || 'Not selected'}
                    </p>
                  </div>
                  
                  <div className="border-t border-slate-700 pt-4">
                    <p className="text-sm text-slate-500 mb-2">Line Items ({lineItems.length})</p>
                    <div className="space-y-2">
                      {lineItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-300">{item.name} × {item.quantity}</span>
                          <span className="text-slate-300">
                            {formatCurrency((item.quantity * item.unitPrice * (1 - item.discountPercent / 100)) * (1 + item.taxRate / 100))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="text-slate-200">{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Discount</span>
                      <span className="text-emerald-400">-{formatCurrency(totals.discount)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Tax</span>
                      <span className="text-slate-200">{formatCurrency(totals.tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-slate-700">
                      <span className="text-slate-200">Total</span>
                      <span className="text-emerald-400">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Payment Terms</p>
                        <p className="text-slate-200">{terms.paymentTerms}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Validity</p>
                        <p className="text-slate-200">{terms.validityPeriod} days</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleSave(false)}
                    isLoading={isSaving}
                  >
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleSave(true)}
                    isLoading={isSaving}
                  >
                    Save & Send Quote
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <Button
            variant="ghost"
            onClick={currentStep === 'customer' ? handleBack : handlePrevious}
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            {currentStep === 'customer' ? 'Cancel' : 'Previous'}
          </Button>
          
          {currentStep !== 'review' && (
            <Button onClick={handleNext}>
              Continue
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Discard Modal */}
        <Modal
          isOpen={showDiscardModal}
          onClose={() => setShowDiscardModal(false)}
          title="Discard Changes?"
          description="You have unsaved changes. Are you sure you want to leave without saving?"
        >
          <div className="flex items-center gap-3 p-4 bg-amber-950/30 rounded-lg mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">
              Your changes will be lost if you leave this page.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDiscardModal(false)}>
              Keep Editing
            </Button>
            <Button
              variant="custom"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => router.push(`/quotes/${quoteId}`)}
            >
              Discard Changes
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
