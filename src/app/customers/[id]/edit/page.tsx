/**
 * Customer Edit Page
 * Full-page customer editing with tabbed sections
 * @module app/customers/[id]/edit/page
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon,
  BuildingStorefrontIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BookmarkSquareIcon as SaveIcon,
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import type { Customer, CustomerAddress } from '@/types/quote';
import { CustomerStatus, CustomerStatusLabels, CustomerStatusColors } from '@/types/quote';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface FormData {
  email: string;
  companyName: string;
  contactName: string;
  phone: string;
  billingAddress: CustomerAddress;
  shippingAddress: CustomerAddress;
  useSameAddress: boolean;
  taxId: string;
  tags: string[];
  notes: string;
  logoUrl: string;
  status: CustomerStatus;
}

interface FormErrors {
  email?: string;
  companyName?: string;
  contactName?: string;
  phone?: string;
  billingAddress?: Partial<Record<keyof CustomerAddress, string>>;
  shippingAddress?: Partial<Record<keyof CustomerAddress, string>>;
  taxId?: string;
}

// ============================================================================
// Constants
// ============================================================================

const emptyAddress: CustomerAddress = {
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
};

// ============================================================================
// Mock Data
// ============================================================================

const mockCustomer: Customer = {
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
  shippingAddress: {
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US',
  },
  taxId: '12-3456789',
  customerSince: new Date('2023-01-15'),
  tags: ['enterprise', 'priority', 'manufacturing'],
  notes: 'Key enterprise account. Prefers Net 30 payment terms.',
  logoUrl: '',
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2026-02-04'),
  status: CustomerStatus.ACTIVE as CustomerStatus,
};

// ============================================================================
// Validation Functions
// ============================================================================

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return true;
  const phoneRegex = /^[\d\s\-\(\)\.+]+$/;
  return phoneRegex.test(phone);
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function CustomerEditPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToastHelpers();
  const customerId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'address' | 'details'>('general');
  const [tagInput, setTagInput] = useState('');
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    companyName: '',
    contactName: '',
    phone: '',
    billingAddress: { ...emptyAddress },
    shippingAddress: { ...emptyAddress },
    useSameAddress: true,
    taxId: '',
    tags: [],
    notes: '',
    logoUrl: '',
    status: CustomerStatus.ACTIVE as CustomerStatus,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/customers/${customerId}`);
        // const data = await response.json();
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (mockCustomer) {
          setCustomer(mockCustomer);
          setFormData({
            email: mockCustomer.email || '',
            companyName: mockCustomer.companyName || '',
            contactName: mockCustomer.contactName || '',
            phone: mockCustomer.phone || '',
            billingAddress: mockCustomer.billingAddress || { ...emptyAddress },
            shippingAddress: mockCustomer.shippingAddress || { ...emptyAddress },
            useSameAddress: !mockCustomer.shippingAddress || 
              JSON.stringify(mockCustomer.billingAddress) === JSON.stringify(mockCustomer.shippingAddress),
            taxId: mockCustomer.taxId || '',
            tags: mockCustomer.tags || [],
            notes: mockCustomer.notes || '',
            logoUrl: mockCustomer.logoUrl || '',
            status: mockCustomer.status,
          });
        }
      } catch (err) {
        showError('Failed to load customer', err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, showError]);

  // Track changes
  useEffect(() => {
    if (customer) {
      const hasFormChanges = 
        formData.email !== customer.email ||
        formData.companyName !== customer.companyName ||
        formData.contactName !== customer.contactName ||
        formData.phone !== (customer.phone || '') ||
        formData.taxId !== (customer.taxId || '') ||
        formData.notes !== (customer.notes || '') ||
        formData.status !== customer.status ||
        JSON.stringify(formData.tags) !== JSON.stringify(customer.tags) ||
        JSON.stringify(formData.billingAddress) !== JSON.stringify(customer.billingAddress) ||
        JSON.stringify(formData.shippingAddress) !== JSON.stringify(customer.shippingAddress);
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, customer]);

  // Update shipping address when billing changes and useSameAddress is true
  useEffect(() => {
    if (formData.useSameAddress) {
      setFormData((prev) => ({
        ...prev,
        shippingAddress: { ...prev.billingAddress },
      }));
    }
  }, [formData.useSameAddress, formData.billingAddress]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/customers/${customerId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      success('Customer updated successfully');
      setHasChanges(false);
      router.push(`/customers/${customerId}`);
    } catch (err) {
      showError('Failed to update customer', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean | string[] | CustomerStatus) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleAddressChange = (
    type: 'billingAddress' | 'shippingAddress',
    field: keyof CustomerAddress,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
    if (errors[type]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [field]: undefined,
        },
      }));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowDiscardModal(true);
    } else {
      router.push(`/customers/${customerId}`);
    }
  };

  const tabs = [
    { id: 'general', label: 'General Info', icon: UserIcon },
    { id: 'address', label: 'Address', icon: MapPinIcon },
    { id: 'details', label: 'Details', icon: TagIcon },
  ] as const;

  const statusOptions: CustomerStatus[] = [CustomerStatus.ACTIVE, CustomerStatus.INACTIVE, CustomerStatus.ARCHIVED];

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

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <ExclamationTriangleIcon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Customer Not Found</h1>
          <p className="text-slate-400 mb-6">The customer you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Edit Customer</h1>
              <p className="text-slate-400">{customer.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSaving}
              disabled={!hasChanges}
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </motion.div>

        {/* Status Banner */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">
              You have unsaved changes. Don't forget to save before leaving.
            </p>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                activeTab === tab.id
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <AnimatePresence mode="wait">
            {/* General Tab */}
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Status Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Customer Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleChange('status', status)}
                        className={cn(
                          'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                          formData.status === status
                            ? CustomerStatusColors[status]
                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                        )}
                      >
                        {CustomerStatusLabels[status]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Company logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BuildingStorefrontIcon className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Company Logo
                    </label>
                    <p className="text-sm text-slate-500 mb-2">
                      Logo upload will be available in a future update
                    </p>
                    <Input
                      placeholder="Logo URL (optional)"
                      value={formData.logoUrl}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                </div>

                {/* Company & Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company Name *"
                    placeholder="Acme Corporation"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    error={errors.companyName}
                    leftIcon={<BuildingOfficeIcon className="w-5 h-5 text-slate-500" />}
                  />

                  <Input
                    label="Contact Name *"
                    placeholder="John Doe"
                    value={formData.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                    error={errors.contactName}
                    leftIcon={<UserIcon className="w-5 h-5 text-slate-500" />}
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="john@acme.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    leftIcon={<EnvelopeIcon className="w-5 h-5 text-slate-500" />}
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    error={errors.phone}
                    leftIcon={<PhoneIcon className="w-5 h-5 text-slate-500" />}
                  />
                </div>

                {/* Tax ID */}
                <Input
                  label="Tax ID / VAT Number"
                  placeholder="XX-XXXXXXX"
                  value={formData.taxId}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                  error={errors.taxId}
                />
              </motion.div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <motion.div
                key="address"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Billing Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5" />
                    Billing Address
                  </h3>

                  <Input
                    label="Street Address"
                    placeholder="123 Main Street"
                    value={formData.billingAddress.street}
                    onChange={(e) => handleAddressChange('billingAddress', 'street', e.target.value)}
                    error={errors.billingAddress?.street}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      placeholder="New York"
                      value={formData.billingAddress.city}
                      onChange={(e) => handleAddressChange('billingAddress', 'city', e.target.value)}
                      error={errors.billingAddress?.city}
                    />

                    <Input
                      label="State/Province"
                      placeholder="NY"
                      value={formData.billingAddress.state}
                      onChange={(e) => handleAddressChange('billingAddress', 'state', e.target.value)}
                      error={errors.billingAddress?.state}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="ZIP/Postal Code"
                      placeholder="10001"
                      value={formData.billingAddress.zipCode}
                      onChange={(e) => handleAddressChange('billingAddress', 'zipCode', e.target.value)}
                      error={errors.billingAddress?.zipCode}
                    />

                    <Input
                      label="Country"
                      placeholder="United States"
                      value={formData.billingAddress.country}
                      onChange={(e) => handleAddressChange('billingAddress', 'country', e.target.value)}
                      error={errors.billingAddress?.country}
                    />
                  </div>
                </div>

                {/* Same Address Toggle */}
                <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.useSameAddress}
                    onChange={(e) => handleChange('useSameAddress', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500/50"
                  />
                  <span className="text-sm text-slate-300">
                    Shipping address is the same as billing address
                  </span>
                </label>

                {/* Shipping Address */}
                <AnimatePresence>
                  {!formData.useSameAddress && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5" />
                        Shipping Address
                      </h3>

                      <Input
                        label="Street Address"
                        placeholder="123 Main Street"
                        value={formData.shippingAddress.street}
                        onChange={(e) => handleAddressChange('shippingAddress', 'street', e.target.value)}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="City"
                          placeholder="New York"
                          value={formData.shippingAddress.city}
                          onChange={(e) => handleAddressChange('shippingAddress', 'city', e.target.value)}
                        />

                        <Input
                          label="State/Province"
                          placeholder="NY"
                          value={formData.shippingAddress.state}
                          onChange={(e) => handleAddressChange('shippingAddress', 'state', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="ZIP/Postal Code"
                          placeholder="10001"
                          value={formData.shippingAddress.zipCode}
                          onChange={(e) => handleAddressChange('shippingAddress', 'zipCode', e.target.value)}
                        />

                        <Input
                          label="Country"
                          placeholder="United States"
                          value={formData.shippingAddress.country}
                          onChange={(e) => handleAddressChange('shippingAddress', 'country', e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Tags */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Tags
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      leftIcon={<TagIcon className="w-5 h-5 text-slate-500" />}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddTag}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <AnimatePresence>
                      {formData.tags.map((tag) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-sm font-medium rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-indigo-300"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    {formData.tags.length === 0 && (
                      <p className="text-sm text-slate-500 italic">No tags added</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Notes
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-150 resize-none"
                    placeholder="Add any additional notes about this customer..."
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                  <p className="text-xs text-slate-500">
                    These notes are internal and will not be visible to the customer.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-sm text-amber-400">
                Unsaved changes
              </span>
            )}
            <Button
              type="submit"
              isLoading={isSaving}
              disabled={!hasChanges}
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      {/* Discard Changes Modal */}
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
          <Button
            variant="ghost"
            onClick={() => setShowDiscardModal(false)}
          >
            Keep Editing
          </Button>
          <Button
            variant="custom"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => router.push(`/customers/${customerId}`)}
          >
            Discard Changes
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
