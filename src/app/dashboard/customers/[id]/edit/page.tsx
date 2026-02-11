/**
 * Customer Edit Page
 * Full customer editing interface with validation and real-time updates
 * @module app/dashboard/customers/[id]/edit/page
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  DocumentTextIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  XCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  CalendarIcon,
  GlobeAltIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { type Customer, type CustomerAddress } from '@/types/quote';

// ============================================================================
// Types
// ============================================================================

interface FormErrors {
  email?: string;
  companyName?: string;
  contactName?: string;
  phone?: string;
  taxId?: string;
  billingAddress?: Partial<Record<keyof CustomerAddress, string>>;
  shippingAddress?: Partial<Record<keyof CustomerAddress, string>>;
}

interface FormTouched {
  email?: boolean;
  companyName?: boolean;
  contactName?: boolean;
  phone?: boolean;
  taxId?: boolean;
  billingAddress?: Partial<Record<keyof CustomerAddress, boolean>>;
  shippingAddress?: Partial<Record<keyof CustomerAddress, boolean>>;
}

interface CustomerFormData {
  email: string;
  companyName: string;
  contactName: string;
  phone: string;
  taxId: string;
  notes: string;
  tags: string[];
  billingAddress: CustomerAddress;
  shippingAddress: CustomerAddress;
  sameAsBilling: boolean;
}

// ============================================================================
// Mock Data - Replace with Supabase fetch
// ============================================================================

const fetchCustomer = async (id: string): Promise<Customer> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    id,
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
    tags: ['enterprise', 'manufacturing', 'priority'],
    notes: 'Key enterprise client. Prefers quarterly billing. Always negotiates for bulk discounts.',
  };
};

const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return { ...data, id, customerSince: new Date('2023-01-15'), tags: data.tags || [] } as Customer;
};

// ============================================================================
// Validation Functions
// ============================================================================

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email format';
  return undefined;
};

const validateRequired = (value: string, fieldName: string): string | undefined => {
  if (!value.trim()) return `${fieldName} is required`;
  return undefined;
};

const validatePhone = (phone: string): string | undefined => {
  if (!phone.trim()) return undefined; // Optional
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) return 'Invalid phone number format';
  return undefined;
};

const validateTaxId = (taxId: string): string | undefined => {
  if (!taxId.trim()) return undefined; // Optional
  const taxIdRegex = /^\d{2}-?\d{7}$/;
  if (!taxIdRegex.test(taxId)) return 'Invalid Tax ID format (XX-XXXXXXX)';
  return undefined;
};

const validateAddress = (address: CustomerAddress, prefix: string): Partial<Record<keyof CustomerAddress, string>> => {
  const errors: Partial<Record<keyof CustomerAddress, string>> = {};
  
  if (!address.street.trim()) errors.street = 'Street address is required';
  if (!address.city.trim()) errors.city = 'City is required';
  if (!address.state.trim()) errors.state = 'State is required';
  if (!address.zipCode.trim()) errors.zipCode = 'ZIP code is required';
  if (!address.country.trim()) errors.country = 'Country is required';
  
  return errors;
};

// ============================================================================
// Components
// ============================================================================

const FormSection: React.FC<{
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}> = ({ title, description, icon: Icon, children, isCollapsible = false, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
    >
      <div
        className={`flex items-center gap-3 px-6 py-4 border-b border-slate-800 ${isCollapsible ? 'cursor-pointer hover:bg-slate-800/50 transition-colors' : ''}`}
        onClick={isCollapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
        {isCollapsible && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeftIcon className="w-5 h-5 text-slate-400 rotate-[-90deg]" />
          </motion.div>
        )}
      </div>
      
      <AnimatePresence>
        {(!isCollapsible || isExpanded) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 space-y-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const InputField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ElementType;
  hint?: string;
  disabled?: boolean;
}> = ({ label, name, value, onChange, onBlur, error, touched, type = 'text', placeholder, required, icon: Icon, hint, disabled }) => {
  const showError = touched && error;
  
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="flex items-center gap-1 text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-5 h-5 text-slate-500" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-slate-100 placeholder:text-slate-500
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
            ${Icon ? 'pl-11' : ''}
            ${showError 
              ? 'border-red-500/50 focus:border-red-500' 
              : 'border-slate-700 focus:border-indigo-500 hover:border-slate-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        {showError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
          </div>
        )}
      </div>
      {showError ? (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <XMarkIcon className="w-3 h-3" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
};

const TextAreaField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}> = ({ label, name, value, onChange, onBlur, error, touched, placeholder, rows = 4, maxLength }) => {
  const showError = touched && error;
  const charCount = value.length;
  
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 bg-slate-800 border rounded-lg text-slate-100 placeholder:text-slate-500
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none
          ${showError 
            ? 'border-red-500/50 focus:border-red-500' 
            : 'border-slate-700 focus:border-indigo-500 hover:border-slate-600'
          }
        `}
      />
      <div className="flex items-center justify-between">
        {showError ? (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <XMarkIcon className="w-3 h-3" />
            {error}
          </p>
        ) : (
          <div />
        )}
        {maxLength && (
          <p className={`text-xs ${charCount > maxLength * 0.9 ? 'text-amber-400' : 'text-slate-500'}`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

const AddressForm: React.FC<{
  title: string;
  address: CustomerAddress;
  errors: Partial<Record<keyof CustomerAddress, string>>;
  touched: Partial<Record<keyof CustomerAddress, boolean>>;
  onChange: (field: keyof CustomerAddress, value: string) => void;
  onBlur: (field: keyof CustomerAddress) => void;
  disabled?: boolean;
}> = ({ title, address, errors, touched, onChange, onBlur, disabled }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide">{title}</h4>
      <div className="space-y-4">
        <InputField
          label="Street Address"
          name={`${title}-street`}
          value={address.street}
          onChange={(v) => onChange('street', v)}
          onBlur={() => onBlur('street')}
          error={errors.street}
          touched={touched.street}
          placeholder="123 Business St, Suite 100"
          required
          icon={MapPinIcon}
          disabled={disabled}
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="City"
            name={`${title}-city`}
            value={address.city}
            onChange={(v) => onChange('city', v)}
            onBlur={() => onBlur('city')}
            error={errors.city}
            touched={touched.city}
            placeholder="San Francisco"
            required
            disabled={disabled}
          />
          <InputField
            label="State/Province"
            name={`${title}-state`}
            value={address.state}
            onChange={(v) => onChange('state', v)}
            onBlur={() => onBlur('state')}
            error={errors.state}
            touched={touched.state}
            placeholder="CA"
            required
            disabled={disabled}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="ZIP/Postal Code"
            name={`${title}-zipCode`}
            value={address.zipCode}
            onChange={(v) => onChange('zipCode', v)}
            onBlur={() => onBlur('zipCode')}
            error={errors.zipCode}
            touched={touched.zipCode}
            placeholder="94102"
            required
            disabled={disabled}
          />
          <InputField
            label="Country"
            name={`${title}-country`}
            value={address.country}
            onChange={(v) => onChange('country', v)}
            onBlur={() => onBlur('country')}
            error={errors.country}
            touched={touched.country}
            placeholder="USA"
            required
            icon={GlobeAltIcon}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

const TagInput: React.FC<{
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}> = ({ tags, onChange, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return suggestions.filter(s => !tags.includes(s));
    return suggestions
      .filter(s => !tags.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase()));
  }, [inputValue, tags, suggestions]);

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [tags, onChange]);

  const removeTag = useCallback((tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  }, [tags, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }, [inputValue, tags, addTag, removeTag]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">Tags</label>
      <div
        className="flex flex-wrap gap-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence mode="popLayout">
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm"
            >
              <TagIcon className="w-3 h-3" />
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="p-0.5 hover:bg-indigo-500/30 rounded-full transition-colors"
              >
                <XCircleIcon className="w-3.5 h-3.5" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? 'Add tags...' : ''}
          className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 text-sm py-1"
        />
      </div>
      
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-2"
          >
            <span className="text-xs text-slate-500">Suggestions:</span>
            {filteredSuggestions.map(suggestion => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full hover:bg-slate-700 hover:text-slate-300 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <p className="text-xs text-slate-500">
        Press Enter to add a tag. Common: enterprise, smb, manufacturing, retail, priority, vip
      </p>
    </div>
  );
};

const UnsavedChangesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSave: () => void;
}> = ({ isOpen, onClose, onDiscard, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100">Unsaved Changes</h3>
            <p className="text-slate-400 mt-1">
              You have unsaved changes. Would you like to save them before leaving?
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onDiscard}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Keep Editing
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-2"
          >
            <CheckIcon className="w-4 h-4" />
            Save & Leave
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SaveStatusIndicator: React.FC<{
  status: 'idle' | 'saving' | 'saved' | 'error';
  errorMessage?: string;
}> = ({ status, errorMessage }) => {
  return (
    <AnimatePresence mode="wait">
      {status === 'saving' && (
        <motion.div
          key="saving"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex items-center gap-2 text-amber-400"
        >
          <ArrowPathIcon className="w-4 h-4 animate-spin" />
          <span className="text-sm">Saving...</span>
        </motion.div>
      )}
      {status === 'saved' && (
        <motion.div
          key="saved"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex items-center gap-2 text-emerald-400"
        >
          <CheckIcon className="w-4 h-4" />
          <span className="text-sm">Saved successfully</span>
        </motion.div>
      )}
      {status === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex items-center gap-2 text-red-400"
          title={errorMessage}
        >
          <XMarkIcon className="w-4 h-4" />
          <span className="text-sm">Save failed</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function CustomerEditPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  // Form state
  const [formData, setFormData] = useState<CustomerFormData>({
    email: '',
    companyName: '',
    contactName: '',
    phone: '',
    taxId: '',
    notes: '',
    tags: [],
    billingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
    shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
    sameAsBilling: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Fetch customer data
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const customer = await fetchCustomer(customerId);
        setFormData({
          email: customer.email,
          companyName: customer.companyName,
          contactName: customer.contactName,
          phone: customer.phone || '',
          taxId: customer.taxId || '',
          notes: customer.notes || '',
          tags: customer.tags,
          billingAddress: customer.billingAddress || { street: '', city: '', state: '', zipCode: '', country: '' },
          shippingAddress: customer.shippingAddress || { street: '', city: '', state: '', zipCode: '', country: '' },
          sameAsBilling: false,
        });
      } catch (error) {
        console.error('Failed to load customer:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomer();
  }, [customerId]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  }, [formData]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    newErrors.email = validateEmail(formData.email);
    newErrors.companyName = validateRequired(formData.companyName, 'Company name');
    newErrors.contactName = validateRequired(formData.contactName, 'Contact name');
    newErrors.phone = validatePhone(formData.phone);
    newErrors.taxId = validateTaxId(formData.taxId);

    newErrors.billingAddress = validateAddress(formData.billingAddress, 'Billing');
    
    if (!formData.sameAsBilling) {
      newErrors.shippingAddress = validateAddress(formData.shippingAddress, 'Shipping');
    }

    // Remove undefined errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key as keyof FormErrors]) {
        delete newErrors[key as keyof FormErrors];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle save
  const handleSave = useCallback(async (shouldNavigate?: string) => {
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      setTouched({
        email: true,
        companyName: true,
        contactName: true,
        phone: true,
        taxId: true,
        billingAddress: { street: true, city: true, state: true, zipCode: true, country: true },
        shippingAddress: formData.sameAsBilling ? {} : { street: true, city: true, state: true, zipCode: true, country: true },
      });
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const updateData: Partial<Customer> = {
        email: formData.email,
        companyName: formData.companyName,
        contactName: formData.contactName,
        phone: formData.phone || undefined,
        taxId: formData.taxId || undefined,
        notes: formData.notes || undefined,
        tags: formData.tags,
        billingAddress: formData.billingAddress,
        shippingAddress: formData.sameAsBilling ? formData.billingAddress : formData.shippingAddress,
      };

      await updateCustomer(customerId, updateData);
      
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      
      if (shouldNavigate) {
        router.push(shouldNavigate as any);
      }

      // Reset save status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Failed to save customer');
    } finally {
      setIsSaving(false);
    }
  }, [formData, customerId, router, validateForm]);

  // Handle navigation with unsaved changes check
  const handleNavigation = useCallback((path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedModal(true);
    } else {
      router.push(path as any);
    }
  }, [hasUnsavedChanges, router]);

  // Form field handlers
  const updateField = useCallback(<K extends keyof CustomerFormData>(
    field: K,
    value: CustomerFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateBillingAddress = useCallback((field: keyof CustomerAddress, value: string) => {
    setFormData(prev => {
      const newBilling = { ...prev.billingAddress, [field]: value };
      return {
        ...prev,
        billingAddress: newBilling,
        shippingAddress: prev.sameAsBilling ? newBilling : prev.shippingAddress,
      };
    });
  }, []);

  const updateShippingAddress = useCallback((field: keyof CustomerAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, [field]: value },
    }));
  }, []);

  const toggleSameAsBilling = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      sameAsBilling: !prev.sameAsBilling,
      shippingAddress: !prev.sameAsBilling ? prev.billingAddress : prev.shippingAddress,
    }));
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-slate-400"
        >
          <ArrowPathIcon className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading customer...</span>
        </motion.div>
      </div>
    );
  }

  const tagSuggestions = ['enterprise', 'smb', 'manufacturing', 'retail', 'priority', 'vip', 'wholesale', 'distributor'];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => {
          setShowUnsavedModal(false);
          setPendingNavigation(null);
        }}
        onDiscard={() => {
          setShowUnsavedModal(false);
          if (pendingNavigation) {
            router.push(pendingNavigation as any);
          }
        }}
        onSave={() => handleSave(pendingNavigation || undefined)}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleNavigation(`/dashboard/customers/${customerId}`)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-100">Edit Customer</h1>
                <p className="text-sm text-slate-400">Update customer information</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <SaveStatusIndicator status={saveStatus} errorMessage={saveError} />
              
              <button
                onClick={() => handleNavigation(`/dashboard/customers/${customerId}`)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave()}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <FormSection
            title="Basic Information"
            description="Primary contact details for this customer"
            icon={UserIcon}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Contact Name"
                name="contactName"
                value={formData.contactName}
                onChange={(v) => updateField('contactName', v)}
                onBlur={() => setTouched(prev => ({ ...prev, contactName: true }))}
                error={errors.contactName}
                touched={touched.contactName}
                placeholder="John Smith"
                required
                icon={UserIcon}
              />
              <InputField
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={(v) => updateField('companyName', v)}
                onBlur={() => setTouched(prev => ({ ...prev, companyName: true }))}
                error={errors.companyName}
                touched={touched.companyName}
                placeholder="Acme Corporation"
                required
                icon={BuildingOfficeIcon}
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={(v) => updateField('email', v)}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                error={errors.email}
                touched={touched.email}
                placeholder="john@acmecorp.com"
                required
                icon={EnvelopeIcon}
              />
              <InputField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={(v) => updateField('phone', v)}
                onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                error={errors.phone}
                touched={touched.phone}
                placeholder="+1 (555) 123-4567"
                icon={PhoneIcon}
                hint="Optional but recommended for urgent communications"
              />
              <InputField
                label="Tax ID / EIN"
                name="taxId"
                value={formData.taxId}
                onChange={(v) => updateField('taxId', v)}
                onBlur={() => setTouched(prev => ({ ...prev, taxId: true }))}
                error={errors.taxId}
                touched={touched.taxId}
                placeholder="12-3456789"
                icon={IdentificationIcon}
                hint="Format: XX-XXXXXXX (optional)"
              />
            </div>
          </FormSection>

          {/* Billing Address */}
          <FormSection
            title="Billing Address"
            description="Primary billing address for invoices"
            icon={BriefcaseIcon}
          >
            <AddressForm
              title="Billing Address"
              address={formData.billingAddress}
              errors={errors.billingAddress || {}}
              touched={touched.billingAddress || {}}
              onChange={updateBillingAddress}
              onBlur={(field) => setTouched(prev => ({
                ...prev,
                billingAddress: { ...prev.billingAddress, [field]: true },
              }))}
            />
          </FormSection>

          {/* Shipping Address */}
          <FormSection
            title="Shipping Address"
            description="Delivery address for products"
            icon={MapPinIcon}
            isCollapsible
            defaultExpanded={!formData.sameAsBilling}
          >
            <div className="mb-4">
              <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.sameAsBilling}
                  onChange={toggleSameAsBilling}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <div>
                  <span className="text-slate-200 font-medium">Same as billing address</span>
                  <p className="text-sm text-slate-500">Use the billing address for shipping</p>
                </div>
              </label>
            </div>

            <AnimatePresence>
              {!formData.sameAsBilling && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AddressForm
                    title="Shipping Address"
                    address={formData.shippingAddress}
                    errors={errors.shippingAddress || {}}
                    touched={touched.shippingAddress || {}}
                    onChange={updateShippingAddress}
                    onBlur={(field) => setTouched(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, [field]: true },
                    }))}
                    disabled={formData.sameAsBilling}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </FormSection>

          {/* Tags & Notes */}
          <FormSection
            title="Tags & Notes"
            description="Categorize and add internal notes"
            icon={TagIcon}
            isCollapsible
          >
            <div className="space-y-6">
              <TagInput
                tags={formData.tags}
                onChange={(tags) => updateField('tags', tags)}
                suggestions={tagSuggestions}
              />
              
              <TextAreaField
                label="Internal Notes"
                name="notes"
                value={formData.notes}
                onChange={(v) => updateField('notes', v)}
                placeholder="Add any internal notes about this customer..."
                rows={4}
                maxLength={1000}
              />
            </div>
          </FormSection>

          {/* Footer Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between pt-6 border-t border-slate-800"
          >
            <button
              onClick={() => handleNavigation(`/dashboard/customers/${customerId}`)}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Back to Customer
            </button>
            
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-400 flex items-center gap-1">
                  <InformationCircleIcon className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}
              <button
                onClick={() => handleSave(`/dashboard/customers/${customerId}`)}
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
              >
                {isSaving ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Save & Exit
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
