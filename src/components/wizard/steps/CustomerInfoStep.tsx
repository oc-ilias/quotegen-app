/**
 * CustomerInfoStep Component
 * Step 1: Customer information selection/creation
 * @module components/wizard/steps/CustomerInfoStep
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { CustomerInfoData, Customer } from '@/types/quote';
import { CustomerStatus } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface CustomerInfoStepProps {
  /** Current step data */
  data: CustomerInfoData;
  /** Update handler */
  onUpdate: (data: Partial<CustomerInfoData>) => void;
  /** Error message to display */
  error?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

interface FormErrors {
  email?: string;
  companyName?: string;
  contactName?: string;
  phone?: string;
}

interface LoadingState {
  type: 'search' | 'save';
  message: string;
}

// ============================================================================
// Mock Customers (Replace with API call in production)
// ============================================================================

const mockCustomers: Customer[] = [
  {
    id: 'cust_1',
    email: 'john@acme.com',
    companyName: 'Acme Corporation',
    contactName: 'John Smith',
    phone: '+1 (555) 123-4567',
    customerSince: new Date('2023-01-15'),
    tags: ['enterprise', 'priority'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    status: CustomerStatus.ACTIVE,
  },
  {
    id: 'cust_2',
    email: 'sarah@globex.com',
    companyName: 'Globex Industries',
    contactName: 'Sarah Johnson',
    phone: '+1 (555) 987-6543',
    customerSince: new Date('2023-03-20'),
    tags: ['mid-market'],
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2023-03-20'),
    status: CustomerStatus.ACTIVE,
  },
  {
    id: 'cust_3',
    email: 'mike@initech.com',
    companyName: 'Initech LLC',
    contactName: 'Michael Brown',
    phone: '+1 (555) 456-7890',
    customerSince: new Date('2023-06-10'),
    tags: ['startup'],
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-10'),
    status: CustomerStatus.ACTIVE,
  },
];

// ============================================================================
// Validation Functions
// ============================================================================

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
  return undefined;
};

const validateCompanyName = (name: string): string | undefined => {
  if (!name.trim()) return 'Company name is required';
  if (name.length < 2) return 'Company name must be at least 2 characters';
  return undefined;
};

const validateContactName = (name: string): string | undefined => {
  if (!name.trim()) return 'Contact name is required';
  if (name.length < 2) return 'Contact name must be at least 2 characters';
  return undefined;
};

const validatePhone = (phone: string | undefined): string | undefined => {
  if (!phone) return undefined;
  if (!/^[\d\s\-\+\(\)\.]+$/.test(phone)) return 'Please enter a valid phone number';
  return undefined;
};

// ============================================================================
// Main Component
// ============================================================================

const CustomerInfoStep: React.FC<CustomerInfoStepProps> = ({
  data,
  onUpdate,
  error,
  'data-testid': testId,
}) => {
  // ============================================================================
  // State
  // ============================================================================
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(!data.isExistingCustomer);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Validation Effect
  // ============================================================================
  useEffect(() => {
    const errors: FormErrors = {};

    if (isCreatingNew) {
      if (touched.email || data.email) {
        const emailError = validateEmail(data.email);
        if (emailError) errors.email = emailError;
      }

      if (touched.companyName || data.companyName) {
        const companyError = validateCompanyName(data.companyName);
        if (companyError) errors.companyName = companyError;
      }

      if (touched.contactName || data.contactName) {
        const contactError = validateContactName(data.contactName);
        if (contactError) errors.contactName = contactError;
      }

      if (touched.phone || data.phone) {
        const phoneError = validatePhone(data.phone);
        if (phoneError) errors.phone = phoneError;
      }
    }

    setFormErrors(errors);
  }, [data, touched, isCreatingNew]);

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
          const results = mockCustomers.filter(
            (c) =>
              c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
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
  const handleSelectCustomer = useCallback(async (customer: Customer) => {
    setLoadingState({ type: 'save', message: 'Selecting customer...' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onUpdate({
        customer,
        customerId: customer.id,
        email: customer.email,
        companyName: customer.companyName,
        contactName: customer.contactName,
        phone: customer.phone || '',
        billingAddress: customer.billingAddress,
        shippingAddress: customer.shippingAddress,
        isExistingCustomer: true,
      });
      setSearchQuery('');
      setSearchResults([]);
      setIsCreatingNew(false);
      setTouched({});
      setFormErrors({});
    } finally {
      setLoadingState(null);
    }
  }, [onUpdate]);

  const handleCreateNew = useCallback(() => {
    onUpdate({
      customer: undefined,
      customerId: undefined,
      email: '',
      companyName: '',
      contactName: '',
      phone: '',
      isExistingCustomer: false,
    });
    setIsCreatingNew(true);
    setSearchQuery('');
    setSearchResults([]);
    setTouched({});
    setFormErrors({});
  }, [onUpdate]);

  const handleInputChange = useCallback((
    field: keyof CustomerInfoData,
    value: string
  ) => {
    onUpdate({ [field]: value });
    setTouched(prev => ({ ...prev, [field]: true }));
  }, [onUpdate]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setSearchQuery(searchQuery); // Trigger re-search
  }, [searchQuery]);

  // ============================================================================
  // Computed Values
  // ============================================================================
  const hasSelection = !!(data.isExistingCustomer && data.customer);
  const hasErrors = Object.keys(formErrors).length > 0;
  const isValid = !hasErrors && (
    data.isExistingCustomer 
      ? !!data.customerId 
      : (data.email && data.companyName && data.contactName && !formErrors.email && !formErrors.companyName && !formErrors.contactName)
  );

  // ============================================================================
  // Render Helpers
  // ============================================================================
  const renderInputError = (fieldName: string) => {
    const error = formErrors[fieldName as keyof FormErrors];
    if (!error || !touched[fieldName]) return null;

    return (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1 text-sm text-red-400 flex items-center gap-1"
      >
        <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
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
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Customer Information</h2>
        <p className="text-slate-400">Select an existing customer or create a new one.</p>
      </motion.div>

      {/* Global Error Alert */}
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

      {/* Toggle between search and create */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4 mb-6"
      >
        <motion.button
          whileHover={!hasSelection ? { scale: 1.02 } : {}}
          whileTap={!hasSelection ? { scale: 0.98 } : {}}
          onClick={() => !hasSelection && handleCreateNew()}
          disabled={hasSelection}
          className={`
            flex-1 p-4 rounded-xl border-2 transition-all
            ${isCreatingNew
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-700 hover:border-slate-600'
            }
            ${hasSelection ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex items-center justify-center gap-3">
            <PlusIcon className="w-5 h-5 text-indigo-400" />
            <span className="font-medium text-slate-200">Create New Customer</span>
          </div>
        </motion.button>

        <motion.button
          whileHover={!hasSelection ? { scale: 1.02 } : {}}
          whileTap={!hasSelection ? { scale: 0.98 } : {}}
          onClick={() => {
            setIsCreatingNew(false);
            setSearchQuery('');
          }}
          disabled={hasSelection}
          className={`
            flex-1 p-4 rounded-xl border-2 transition-all
            ${!isCreatingNew
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-700 hover:border-slate-600'
            }
            ${hasSelection ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex items-center justify-center gap-3">
            <MagnifyingGlassIcon className="w-5 h-5 text-indigo-400" />
            <span className="font-medium text-slate-200">Select Existing</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Customer Search */}
      <AnimatePresence mode="wait">
        {!isCreatingNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search Customers
            </label>

            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, email, or name..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                data-testid="customer-search-input"
              />

              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              )}
            </div>

            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden"
                  data-testid="customer-search-results"
                >
                  {searchResults.map((customer) => (
                    <motion.button
                      key={customer.id}
                      whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full px-4 py-3 text-left transition-colors flex items-center gap-3"
                      data-testid={`customer-option-${customer.id}`}
                    >
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center">
                        <BuildingOfficeIcon className="w-5 h-5 text-indigo-400" />
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-slate-200">{customer.companyName}</p>
                        <p className="text-sm text-slate-400">{customer.contactName} • {customer.email}</p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 p-4 bg-slate-800 border border-slate-700 rounded-xl text-center"
                >
                  <p className="text-slate-400">No customers found</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 mx-auto"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Retry search
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Customer Display */}
      <AnimatePresence>
        {hasSelection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-200">{data.customer?.companyName}</p>
                  <p className="text-sm text-emerald-300/70">{data.customer?.contactName} • {data.customer?.email}</p>
                </div>
              </div>

              <button
                onClick={handleCreateNew}
                className="text-sm text-emerald-300 hover:text-emerald-200 font-medium transition-colors"
              >
                Change
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Customer Form */}
      <AnimatePresence>
        {isCreatingNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2"
              >
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={data.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                    placeholder="customer@company.com"
                    className={`
                      w-full pl-12 pr-4 py-3 bg-slate-800 border rounded-xl transition-all text-slate-200 placeholder-slate-500
                      ${formErrors.email && touched.email
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
                      }
                    `}
                    data-testid="customer-email-input"
                  />
                </div>
                {renderInputError('email')}
              </motion.div>

              {/* Company Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <BuildingOfficeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={data.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, companyName: true }))}
                    placeholder="Acme Corporation"
                    className={`
                      w-full pl-12 pr-4 py-3 bg-slate-800 border rounded-xl transition-all text-slate-200 placeholder-slate-500
                      ${formErrors.companyName && touched.companyName
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
                      }
                    `}
                    data-testid="customer-company-input"
                  />
                </div>
                {renderInputError('companyName')}
              </motion.div>

              {/* Contact Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contact Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={data.contactName || ''}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, contactName: true }))}
                    placeholder="John Smith"
                    className={`
                      w-full pl-12 pr-4 py-3 bg-slate-800 border rounded-xl transition-all text-slate-200 placeholder-slate-500
                      ${formErrors.contactName && touched.contactName
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
                      }
                    `}
                    data-testid="customer-name-input"
                  />
                </div>
                {renderInputError('contactName')}
              </motion.div>

              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="md:col-span-2"
              >
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="tel"
                    value={data.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                    placeholder="+1 (555) 123-4567"
                    className={`
                      w-full pl-12 pr-4 py-3 bg-slate-800 border rounded-xl transition-all text-slate-200 placeholder-slate-500
                      ${formErrors.phone && touched.phone
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'
                      }
                    `}
                    data-testid="customer-phone-input"
                  />
                </div>
                {renderInputError('phone')}
              </motion.div>
            </div>

            {/* Validation Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex items-center gap-2"
            >
              {isValid ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Ready to continue</span>
                </>
              ) : (
                <>
                  <ExclamationCircleIcon className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-amber-400">Please fill in all required fields</span>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loadingState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <ArrowPathIcon className="w-8 h-8 text-indigo-400" />
              </motion.div>
              <p className="text-sm text-slate-300">{loadingState.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerInfoStep;
