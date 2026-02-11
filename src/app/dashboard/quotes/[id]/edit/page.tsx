/**
 * Quote Edit Page
 * Edit existing quote with full wizard interface
 * @module app/dashboard/quotes/[id]/edit/page
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { type Quote, QuoteStatus, QuotePriority, type Customer, type LineItem, type QuoteTerms } from '@/types/quote';

// ============================================================================
// Mock Data
// ============================================================================

const mockQuote: Quote = {
  id: 'qt_001',
  quoteNumber: 'QT-2024-001',
  customerId: 'c1',
  customer: {
    id: 'c1',
    email: 'john.smith@acmecorp.com',
    companyName: 'Acme Corporation',
    contactName: 'John Smith',
    phone: '+1 (555) 123-4567',
    billingAddress: {
      street: '123 Business Ave, Suite 100',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
    },
    shippingAddress: {
      street: '456 Industrial Blvd',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94607',
      country: 'USA',
    },
    taxId: '12-3456789',
    customerSince: new Date('2023-01-15'),
    tags: ['enterprise', 'manufacturing'],
    notes: 'Key enterprise client. Prefers quarterly billing.',
  },
  title: 'Industrial Equipment Quote - Q1 2024',
  status: QuoteStatus.DRAFT,
  priority: QuotePriority.HIGH,
  lineItems: [
    {
      id: 'li_001',
      productId: 'p1',
      title: 'Industrial Compressor X2000',
      sku: 'IC-X2000',
      quantity: 2,
      unitPrice: 5000,
      discountAmount: 500,
      discountPercentage: 5,
      taxRate: 8.5,
      taxAmount: 765,
      subtotal: 10000,
      total: 10265,
      notes: 'Includes 2-year warranty',
    },
    {
      id: 'li_002',
      productId: 'p2',
      title: 'Maintenance Package Premium',
      sku: 'MP-PREM',
      quantity: 1,
      unitPrice: 2500,
      discountAmount: 0,
      taxRate: 8.5,
      taxAmount: 212.50,
      subtotal: 2500,
      total: 2712.50,
    },
  ],
  subtotal: 12500,
  discountTotal: 500,
  taxTotal: 977.50,
  shippingTotal: 0,
  total: 12977.50,
  terms: {
    paymentTerms: 'Net 30',
    deliveryTerms: '2-3 weeks after order confirmation',
    validityPeriod: 30,
    depositRequired: true,
    depositPercentage: 50,
    currency: 'USD',
    notes: 'Quote valid for 30 days. Prices subject to change after expiration.',
    internalNotes: 'High priority client. Follow up in 1 week if no response.',
  },
  metadata: {
    createdBy: 'user_001',
    createdByName: 'Jane Wilson',
    updatedBy: 'user_001',
    updatedByName: 'Jane Wilson',
    source: 'web',
  },
  expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
};

const mockCustomers: Customer[] = [
  mockQuote.customer!,
  {
    id: 'c2',
    email: 'sarah@techflow.io',
    companyName: 'TechFlow Solutions',
    contactName: 'Sarah Johnson',
    phone: '+1 (555) 987-6543',
    customerSince: new Date('2023-03-22'),
    tags: ['tech', 'startup'],
  },
  {
    id: 'c3',
    email: 'mike@buildcraft.com',
    companyName: 'BuildCraft Inc',
    contactName: 'Mike Chen',
    customerSince: new Date('2023-06-10'),
    tags: ['construction', 'wholesale'],
  },
];

// ============================================================================
// Components
// ============================================================================

const StepIndicator: React.FC<{
  steps: { id: string; label: string; icon: React.ElementType }[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}> = ({ steps, currentStep, onStepClick }) => (
  <div className="flex items-center justify-center mb-8">
    {steps.map((step, index) => {
      const Icon = step.icon;
      const isActive = index === currentStep;
      const isCompleted = index < currentStep;
      const isClickable = onStepClick && (isCompleted || index === currentStep + 1);

      return (
        <React.Fragment key={step.id}>
          <button
            onClick={() => isClickable && onStepClick(index)}
            disabled={!isClickable}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              isActive
                ? 'bg-indigo-500 text-white'
                : isCompleted
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-slate-800 text-slate-400'
            } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              isActive
                ? 'bg-white/20'
                : isCompleted
                ? 'bg-emerald-500/20'
                : 'bg-slate-700'
            }`}>
              {isCompleted ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className="hidden sm:inline">{step.label}</span>
          </button>

          {index < steps.length - 1 && (
            <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
              isCompleted ? 'bg-emerald-500/30' : 'bg-slate-800'
            }`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const FormField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, required, error, children, hint }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-300">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
    {error && <p className="text-sm text-red-400">{error}</p>}
  </div>
);

const CustomerStep: React.FC<{
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  onCreateNew: () => void;
}> = ({ customers, selectedCustomer, onSelectCustomer, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c =>
    c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">Select Customer</h3>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
        >
          + New Customer
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.map((customer) => (
          <motion.button
            key={customer.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelectCustomer(customer)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedCustomer?.id === customer.id
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                {customer.contactName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-200">{customer.contactName}</p>
                <p className="text-sm text-slate-400">{customer.companyName}</p>
                <p className="text-sm text-slate-500">{customer.email}</p>
              </div>
              {selectedCustomer?.id === customer.id && (
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const LineItemsStep: React.FC<{
  lineItems: LineItem[];
  onChange: (items: LineItem[]) => void;
  currency: string;
}> = ({ lineItems, onChange, currency }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: `li_${Date.now()}`,
      productId: '',
      title: '',
      sku: '',
      quantity: 1,
      unitPrice: 0,
      discountAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      subtotal: 0,
      total: 0,
    };
    onChange([...lineItems, newItem]);
  };

  const updateItem = (index: number, updates: Partial<LineItem>) => {
    const updated = [...lineItems];
    const item = { ...updated[index], ...updates };
    
    // Recalculate
    item.subtotal = item.quantity * item.unitPrice;
    item.discountAmount = item.subtotal * (item.discountPercentage || 0) / 100;
    item.taxAmount = (item.subtotal - item.discountAmount) * (item.taxRate / 100);
    item.total = item.subtotal - item.discountAmount + item.taxAmount;
    
    updated[index] = item;
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(lineItems.filter((_, i) => i !== index));
  };

  const totals = useMemo(() => {
    return lineItems.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.subtotal,
        discount: acc.discount + item.discountAmount,
        tax: acc.tax + item.taxAmount,
        total: acc.total + item.total,
      }),
      { subtotal: 0, discount: 0, tax: 0, total: 0 }
    );
  }, [lineItems]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">Line Items</h3>
        <button
          onClick={addItem}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
        >
          + Add Item
        </button>
      </div>

      <div className="space-y-4">
        {lineItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.title}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="SKU"
                  value={item.sku}
                  onChange={(e) => updateItem(index, { sku: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeItem(index)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Unit Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={item.discountPercentage || 0}
                  onChange={(e) => updateItem(index, { discountPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Tax %</label>
                <input
                  type="number"
                  min="0"
                  value={item.taxRate}
                  onChange={(e) => updateItem(index, { taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <input
                type="text"
                placeholder="Notes (optional)"
                value={item.notes || ''}
                onChange={(e) => updateItem(index, { notes: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <div className="ml-4 text-right">
                <p className="text-sm text-slate-400">Total</p>
                <p className="text-lg font-semibold text-emerald-400">{formatCurrency(item.total)}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {lineItems.length === 0 && (
          <div className="text-center py-12 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
            <ShoppingCartIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No items added yet</p>
            <button
              onClick={addItem}
              className="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
            >
              Add First Item
            </button>
          </div>
        )}
      </div>

      {lineItems.length > 0 && (
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Discount</span>
              <span>-{formatCurrency(totals.discount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax</span>
              <span>{formatCurrency(totals.tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-100 pt-2 border-t border-slate-700">
              <span>Total</span>
              <span className="text-emerald-400">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TermsStep: React.FC<{
  terms: QuoteTerms;
  onChange: (terms: QuoteTerms) => void;
}> = ({ terms, onChange }) => {
  const updateTerms = (updates: Partial<QuoteTerms>) => {
    onChange({ ...terms, ...updates });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-200">Terms & Conditions</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Currency">
          <select
            value={terms.currency}
            onChange={(e) => updateTerms({ currency: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
          </select>
        </FormField>

        <FormField label="Payment Terms">
          <select
            value={terms.paymentTerms}
            onChange={(e) => updateTerms({ paymentTerms: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          >
            <option value="Net 15">Net 15</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 45">Net 45</option>
            <option value="Net 60">Net 60</option>
            <option value="Due on receipt">Due on receipt</option>
          </select>
        </FormField>

        <FormField label="Validity Period (days)">
          <input
            type="number"
            min="1"
            max="365"
            value={terms.validityPeriod}
            onChange={(e) => updateTerms({ validityPeriod: parseInt(e.target.value) || 30 })}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </FormField>

        <FormField label="Delivery Terms">
          <input
            type="text"
            value={terms.deliveryTerms}
            onChange={(e) => updateTerms({ deliveryTerms: e.target.value })}
            placeholder="e.g., 2-3 weeks after order confirmation"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </FormField>
      </div>

      <div className="p-4 bg-slate-800/50 rounded-xl">
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={terms.depositRequired}
            onChange={(e) => updateTerms({ depositRequired: e.target.checked })}
            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
          />
          <span className="text-slate-300">Require deposit</span>
        </label>

        {terms.depositRequired && (
          <div className="ml-8">
            <label className="block text-sm text-slate-400 mb-2">Deposit Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              value={terms.depositPercentage}
              onChange={(e) => updateTerms({ depositPercentage: parseInt(e.target.value) || 50 })}
              className="w-32 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            <span className="ml-2 text-slate-400">%</span>
          </div>
        )}
      </div>

      <FormField label="Customer Notes" hint="Visible to customer on the quote">
        <textarea
          value={terms.notes || ''}
          onChange={(e) => updateTerms({ notes: e.target.value })}
          rows={4}
          placeholder="Any additional notes for the customer..."
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
        />
      </FormField>

      <FormField label="Internal Notes" hint="Only visible to your team">
        <textarea
          value={terms.internalNotes || ''}
          onChange={(e) => updateTerms({ internalNotes: e.target.value })}
          rows={3}
          placeholder="Internal notes about this quote..."
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
        />
      </FormField>
    </div>
  );
};

const ReviewStep: React.FC<{
  quote: Quote;
  onSave: () => void;
  onSend: () => void;
  isLoading: boolean;
}> = ({ quote, onSave, onSend, isLoading }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.terms.currency || 'USD',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-200">Review Quote</h3>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-6">
        {/* Customer Info */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-700">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {quote.customer?.contactName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-200">{quote.customer?.contactName}</p>
            <p className="text-slate-400">{quote.customer?.companyName}</p>
            <p className="text-slate-500 text-sm">{quote.customer?.email}</p>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-3">Line Items</h4>
          <div className="space-y-2">
            {quote.lineItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-slate-200">{item.title}</p>
                  <p className="text-sm text-slate-500">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <span className="font-medium text-slate-200">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-slate-700">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span>-{formatCurrency(quote.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Tax</span>
              <span>{formatCurrency(quote.taxTotal)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-100 pt-2 border-t border-slate-700">
              <span>Total</span>
              <span className="text-emerald-400">{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="pt-4 border-t border-slate-700">
          <h4 className="text-sm font-medium text-slate-400 mb-3">Terms</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Payment: </span>
              <span className="text-slate-300">{quote.terms.paymentTerms}</span>
            </div>
            <div>
              <span className="text-slate-500">Valid for: </span>
              <span className="text-slate-300">{quote.terms.validityPeriod} days</span>
            </div>
            {quote.terms.depositRequired && (
              <div>
                <span className="text-slate-500">Deposit: </span>
                <span className="text-slate-300">{quote.terms.depositPercentage}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save as Draft'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSend}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Save & Send Quote'}
        </motion.button>
      </div>
    </div>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function QuoteEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote>(mockQuote);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const steps = [
    { id: 'customer', label: 'Customer', icon: UserIcon },
    { id: 'items', label: 'Line Items', icon: ShoppingCartIcon },
    { id: 'terms', label: 'Terms', icon: DocumentTextIcon },
    { id: 'review', label: 'Review', icon: EyeIcon },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setHasChanges(false);
    router.push(`/dashboard/quotes/${quote.id}`);
  };

  const handleSend = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setHasChanges(false);
    router.push(`/dashboard/quotes/${quote.id}`);
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowUnsavedWarning(true);
    } else {
      router.push(`/dashboard/quotes/${quote.id}`);
    }
  };

  const updateQuote = (updates: Partial<Quote>) => {
    setQuote({ ...quote, ...updates });
    setHasChanges(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-4"
        >
          <button
            onClick={handleCancel}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Edit Quote</h1>
            <p className="text-slate-400">{quote.quoteNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
      </motion.div>

      {/* Step Indicator */}
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={(step) => step < currentStep && setCurrentStep(step)}
      />

      {/* Unsaved Changes Warning */}
      <AnimatePresence>
        {showUnsavedWarning && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowUnsavedWarning(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 text-amber-400 mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8" />
                  <h3 className="text-xl font-semibold text-slate-100">Unsaved Changes</h3>
                </div>
                <p className="text-slate-300 mb-6">
                  You have unsaved changes. Are you sure you want to leave?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUnsavedWarning(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-colors"
                  >
                    Stay
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
      >
        {currentStep === 0 && (
          <CustomerStep
            customers={mockCustomers}
            selectedCustomer={quote.customer}
            onSelectCustomer={(customer) => updateQuote({ customer, customerId: customer.id })}
            onCreateNew={() => router.push('/dashboard/customers/new')}
          />
        )}

        {currentStep === 1 && (
          <LineItemsStep
            lineItems={quote.lineItems}
            onChange={(items) => updateQuote({ lineItems: items })}
            currency={quote.terms.currency || 'USD'}
          />
        )}

        {currentStep === 2 && (
          <TermsStep
            terms={quote.terms}
            onChange={(terms) => updateQuote({ terms })}
          />
        )}

        {currentStep === 3 && (
          <ReviewStep
            quote={quote}
            onSave={handleSave}
            onSend={handleSend}
            isLoading={isLoading}
          />
        )}
      </motion.div>

      {/* Navigation Buttons */}
      {currentStep < 3 && (
        <div className="flex justify-between"
        >
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all"
          >
            Next
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
