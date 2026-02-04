/**
 * CustomerInfoStep Component
 * Step 1: Customer information selection/creation
 * @module components/wizard/steps/CustomerInfoStep
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SearchIcon,
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { CustomerInfoData, Customer } from '@/types/quote';

interface CustomerInfoStepProps {
  data: CustomerInfoData;
  onUpdate: (data: Partial<CustomerInfoData>) => void;
  error?: string;
}

// Mock customers for demo
const mockCustomers: Customer[] = [
  {
    id: 'cust_1',
    email: 'john@acme.com',
    companyName: 'Acme Corporation',
    contactName: 'John Smith',
    phone: '+1 (555) 123-4567',
    customerSince: new Date('2023-01-15'),
    tags: ['enterprise', 'priority'],
  },
  {
    id: 'cust_2',
    email: 'sarah@globex.com',
    companyName: 'Globex Industries',
    contactName: 'Sarah Johnson',
    phone: '+1 (555) 987-6543',
    customerSince: new Date('2023-03-20'),
    tags: ['mid-market'],
  },
  {
    id: 'cust_3',
    email: 'mike@initech.com',
    companyName: 'Initech LLC',
    contactName: 'Michael Brown',
    phone: '+1 (555) 456-7890',
    customerSince: new Date('2023-06-10'),
    tags: ['startup'],
  },
];

const CustomerInfoStep: React.FC<CustomerInfoStepProps> = ({
  data,
  onUpdate,
  error,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(!data.isExistingCustomer);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Validate form fields
  useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (touched.email || data.email) {
      if (!data.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (touched.companyName || data.companyName) {
      if (!data.companyName?.trim()) {
        errors.companyName = 'Company name is required';
      }
    }
    
    if (touched.contactName || data.contactName) {
      if (!data.contactName?.trim()) {
        errors.contactName = 'Contact name is required';
      }
    }
    
    setFormErrors(errors);
  }, [data, touched]);
  
  // Search customers
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      const timeout = setTimeout(() => {
        const results = mockCustomers.filter(
          (c) =>
            c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
      
      return () => clearTimeout(timeout);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);
  
  const handleSelectCustomer = useCallback((customer: Customer) => {
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
  }, [onUpdate]);
  
  const handleInputChange = useCallback((field: keyof CustomerInfoData, value: string) => {
    onUpdate({ [field]: value });
    setTouched(prev => ({ ...prev, [field]: true }));
  }, [onUpdate]);
  
  const hasSelection = data.isExistingCustomer && data.customer;
  
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Information</h2>
        <p className="text-gray-600">Select an existing customer or create a new one.</p>
      </div>
      
      {/* Toggle between search and create */}
      <div className="flex gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => !hasSelection && handleCreateNew()}
          disabled={hasSelection}
          className={`
            flex-1 p-4 rounded-xl border-2 transition-all
            ${isCreatingNew
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
            }
            ${hasSelection ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex items-center justify-center gap-3">
            <PlusIcon className="w-5 h-5 text-indigo-600" />
            <span className="font-medium">Create New Customer</span>
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setIsCreatingNew(false);
            setSearchQuery('');
          }}
          disabled={hasSelection}
          className={`
            flex-1 p-4 rounded-xl border-2 transition-all
            ${!isCreatingNew
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
            }
            ${hasSelection ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex items-center justify-center gap-3">
            <SearchIcon className="w-5 h-5 text-indigo-600" />
            <span className="font-medium">Select Existing</span>
          </div>
        </motion.button>
      </div>
      
      {/* Customer Search */}
      <AnimatePresence mode="wait">
        {!isCreatingNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
003e
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Customers
            </label>
            
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, email, or name..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                >
                  {searchResults.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <BuildingOfficeIcon className="w-5 h-5 text-indigo-600" />
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{customer.companyName}</p>
                        <p className="text-sm text-gray-500">{customer.contactName} • {customer.email}</p>
                      </div>
                    </button>
                  ))}
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
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
003e
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{data.customer?.companyName}</p>
                  <p className="text-sm text-green-700">{data.customer?.contactName} • {data.customer?.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleCreateNew}
                className="text-sm text-green-700 hover:text-green-900 font-medium"
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                    placeholder="customer@company.com"
                    className={`
                      w-full pl-12 pr-4 py-3 border rounded-xl transition-all
                      ${formErrors.email && touched.email
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }
                    `}
                  />
                </div>
                {formErrors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {formErrors.email}
                  </p>
                )}
              </div>
              
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <BuildingOfficeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={data.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, companyName: true }))}
                    placeholder="Acme Corporation"
                    className={`
                      w-full pl-12 pr-4 py-3 border rounded-xl transition-all
                      ${formErrors.companyName && touched.companyName
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }
                    `}
                  />
                </div>
                {formErrors.companyName && touched.companyName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {formErrors.companyName}
                  </p>
                )}
              </div>
              
              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={data.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, contactName: true }))}
                    placeholder="John Smith"
                    className={`
                      w-full pl-12 pr-4 py-3 border rounded-xl transition-all
                      ${formErrors.contactName && touched.contactName
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }
                    `}
                  />
                </div>
                {formErrors.contactName && touched.contactName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {formErrors.contactName}
                  </p>
                )}
              </div>
              
              {/* Phone */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={data.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerInfoStep;
