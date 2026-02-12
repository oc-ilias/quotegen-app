/**
 * Customer Form Component
 * Create/edit customer modal with validation
 * @module components/customers/CustomerForm
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BuildingOfficeIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  MapPinIcon,
  TagIcon,
  PhotoIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToastHelpers } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import type { Customer, CustomerAddress } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface CustomerFormProps {
  customer?: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface CustomerFormData {
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
}

interface FormErrors {
  email?: string;
  companyName?: string;
  contactName?: string;
  phone?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  taxId?: string;
}

// ============================================================================
// Initial Form State
// ============================================================================

const emptyAddress: CustomerAddress = {
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
};

const initialFormData: CustomerFormData = {
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
};

// ============================================================================
// Validation
// ============================================================================

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional
  const phoneRegex = /^[\d\s\-\(\)\.+]+$/;
  return phoneRegex.test(phone);
};

// ============================================================================
// Component
// ============================================================================

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { success, error: showError } = useToastHelpers();
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeTab, setActiveTab] = useState<'general' | 'address' | 'details'>('general');
  const [tagInput, setTagInput] = useState('');
  const isEditMode = !!customer;

  // Reset form when modal opens/closes or customer changes
  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setFormData({
          email: customer.email || '',
          companyName: customer.companyName || '',
          contactName: customer.contactName || '',
          phone: customer.phone || '',
          billingAddress: customer.billingAddress || { ...emptyAddress },
          shippingAddress: customer.shippingAddress || { ...emptyAddress },
          useSameAddress: !customer.shippingAddress || 
            JSON.stringify(customer.billingAddress) === JSON.stringify(customer.shippingAddress),
          taxId: customer.taxId || '',
          tags: customer.tags || [],
          notes: customer.notes || '',
          logoUrl: customer.logoUrl || '',
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
      setActiveTab('general');
    }
  }, [isOpen, customer]);

  // Update shipping address when billing address changes and useSameAddress is true
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

    // Required fields
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

    // Address validation
    const validateAddress = (address: CustomerAddress, prefix: 'billingAddress' | 'shippingAddress') => {
      const addrErrors: Partial<Record<keyof CustomerAddress, string>> = {};
      
      if (address.street && !address.city) addrErrors.city = 'City is required with street';
      if (address.street && !address.state) addrErrors.state = 'State is required with street';
      if (address.street && !address.zipCode) addrErrors.zipCode = 'ZIP code is required with street';
      
      if (Object.keys(addrErrors).length > 0) {
        newErrors[prefix] = addrErrors;
      }
    };

    validateAddress(formData.billingAddress, 'billingAddress');
    if (!formData.useSameAddress) {
      validateAddress(formData.shippingAddress, 'shippingAddress');
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

    try {
      await onSubmit(formData);
      success(isEditMode ? 'Customer updated successfully' : 'Customer created successfully');
      onClose();
    } catch (err) {
      showError('Failed to save customer', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleChange = (field: keyof CustomerFormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
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
    // Clear address errors
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

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: UserIcon },
    { id: 'address', label: 'Address', icon: MapPinIcon },
    { id: 'details', label: 'Details', icon: TagIcon },
  ] as const;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Customer' : 'Create Customer'}
      description={isEditMode ? 'Update customer information' : 'Add a new customer to your database'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-700 pb-4">
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

        <AnimatePresence mode="wait">
          {/* General Tab */}
          {activeTab === 'general' && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Logo Upload Placeholder */}
              <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Company logo"
                      className="w-full h-full object-cover rounded-xl"
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
                <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  Billing Address
                </h4>

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
              <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer">
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
                    <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4" />
                      Shipping Address
                    </h4>

                    <Input
                      label="Street Address"
                      placeholder="123 Main Street"
                      value={formData.shippingAddress.street}
                      onChange={(e) => handleAddressChange('shippingAddress', 'street', e.target.value)}
                      error={errors.shippingAddress?.street}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        placeholder="New York"
                        value={formData.shippingAddress.city}
                        onChange={(e) => handleAddressChange('shippingAddress', 'city', e.target.value)}
                        error={errors.shippingAddress?.city}
                      />

                      <Input
                        label="State/Province"
                        placeholder="NY"
                        value={formData.shippingAddress.state}
                        onChange={(e) => handleAddressChange('shippingAddress', 'state', e.target.value)}
                        error={errors.shippingAddress?.state}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="ZIP/Postal Code"
                        placeholder="10001"
                        value={formData.shippingAddress.zipCode}
                        onChange={(e) => handleAddressChange('shippingAddress', 'zipCode', e.target.value)}
                        error={errors.shippingAddress?.zipCode}
                      />

                      <Input
                        label="Country"
                        placeholder="United States"
                        value={formData.shippingAddress.country}
                        onChange={(e) => handleAddressChange('shippingAddress', 'country', e.target.value)}
                        error={errors.shippingAddress?.country}
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
              className="space-y-4"
            >
              {/* Tax ID */}
              <Input
                label="Tax ID / VAT Number"
                placeholder="XX-XXXXXXX"
                value={formData.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                error={errors.taxId}
              />

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
                    onKeyDown={handleTagKeyDown}
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

                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {formData.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-medium rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-indigo-300"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Notes
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-150 resize-none"
                  placeholder="Add any additional notes about this customer..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            {isEditMode ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerForm;
