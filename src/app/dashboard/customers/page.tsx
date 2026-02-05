/**
 * Customers Page
 * Manage and view all customers with search, filtering, and CRUD
 * @module app/dashboard/customers/page
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { type Customer } from '@/types/quote';

// ============================================================================
// Mock Data
// ============================================================================

const mockCustomers: Customer[] = [
  {
    id: 'c1',
    email: 'john@acme.com',
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
  {
    id: 'c2',
    email: 'sarah@techflow.io',
    companyName: 'TechFlow Solutions',
    contactName: 'Sarah Johnson',
    phone: '+1 (555) 987-6543',
    billingAddress: {
      street: '789 Innovation Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA',
    },
    taxId: '98-7654321',
    customerSince: new Date('2023-03-22'),
    tags: ['tech', 'startup'],
    notes: 'Fast-growing tech startup. High volume of quotes.',
  },
  {
    id: 'c3',
    email: 'mike@buildcraft.com',
    companyName: 'BuildCraft Inc',
    contactName: 'Mike Chen',
    phone: '+1 (555) 456-7890',
    billingAddress: {
      street: '321 Construction Way',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'USA',
    },
    customerSince: new Date('2023-06-10'),
    tags: ['construction', 'wholesale'],
  },
  {
    id: 'c4',
    email: 'emily@stellar.design',
    companyName: 'Stellar Design Studio',
    contactName: 'Emily Davis',
    phone: '+1 (555) 234-5678',
    billingAddress: {
      street: '555 Creative Lane',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'USA',
    },
    taxId: '45-6789012',
    customerSince: new Date('2023-08-05'),
    tags: ['design', 'creative'],
    notes: 'Design agency. Often needs custom quotes.',
  },
  {
    id: 'c5',
    email: 'david@manufacture.co',
    companyName: 'ManufactureCo',
    contactName: 'David Wilson',
    phone: '+1 (555) 876-5432',
    billingAddress: {
      street: '888 Factory Road',
      city: 'Detroit',
      state: 'MI',
      zipCode: '48201',
      country: 'USA',
    },
    shippingAddress: {
      street: '888 Factory Road',
      city: 'Detroit',
      state: 'MI',
      zipCode: '48201',
      country: 'USA',
    },
    taxId: '67-8901234',
    customerSince: new Date('2023-09-18'),
    tags: ['manufacturing', 'enterprise'],
  },
  {
    id: 'c6',
    email: 'lisa@greenearth.org',
    companyName: 'Green Earth Sustainability',
    contactName: 'Lisa Anderson',
    phone: '+1 (555) 345-6789',
    billingAddress: {
      street: '999 Eco Street',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA',
    },
    customerSince: new Date('2024-01-10'),
    tags: ['nonprofit', 'sustainability'],
  },
];

// ============================================================================
// Types
// ============================================================================

interface CustomerStats {
  total: number;
  newThisMonth: number;
  activeQuotes: number;
  totalRevenue: number;
}

interface FilterState {
  search: string;
  tags: string[];
  sortBy: 'name' | 'company' | 'date' | 'revenue';
  sortOrder: 'asc' | 'desc';
}

// ============================================================================
// Components
// ============================================================================

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'amber';
  delay?: number;
}> = ({ title, value, subtitle, icon: Icon, color, delay = 0 }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-6 rounded-2xl border ${colorClasses[color]} bg-slate-900/50`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

const CustomerCard: React.FC<{
  customer: Customer;
  onView: (id: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onCreateQuote: (customerId: string) => void;
  index: number;
}> = ({ customer, onView, onEdit, onDelete, onCreateQuote, index }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all cursor-pointer"
      onClick={() => onView(customer.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
            {customer.contactName.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{customer.contactName}</h3>
            <p className="text-slate-400 text-sm">{customer.companyName}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(customer);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit Customer
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateQuote(customer.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    Create Quote
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(customer.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <EnvelopeIcon className="w-4 h-4" />
          {customer.email}
        </div>
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <PhoneIcon className="w-4 h-4" />
            {customer.phone}
          </div>
        )}
        {customer.billingAddress && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPinIcon className="w-4 h-4" />
            {customer.billingAddress.city}, {customer.billingAddress.state}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {customer.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-lg"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-sm">
        <span className="text-slate-500">
          Customer since {customer.customerSince.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onView(customer.id);
          }}
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
        >
          View Details
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const CustomerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSave: (customer: Partial<Customer>) => void;
}> = ({ isOpen, onClose, customer, onSave }) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    taxId: '',
    tags: [],
    notes: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  React.useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        contactName: '',
        companyName: '',
        email: '',
        phone: '',
        taxId: '',
        tags: [],
        notes: '',
        billingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
        },
      });
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSave(formData);
    setIsSubmitting(false);
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100">
              {customer ? 'Edit Customer' : 'New Customer'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Address */}
            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Billing Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.billingAddress?.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billingAddress: { ...formData.billingAddress!, street: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    placeholder="123 Business Ave"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.billingAddress?.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress!, city: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      placeholder="San Francisco"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">State</label>
                    <input
                      type="text"
                      value={formData.billingAddress?.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress!, state: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">ZIP</label>
                    <input
                      type="text"
                      value={formData.billingAddress?.zipCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress!, zipCode: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      placeholder="94102"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.billingAddress?.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: { ...formData.billingAddress!, country: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      placeholder="USA"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="border-t border-slate-800 pt-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-white"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                placeholder="Add any additional notes about this customer..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    {customer ? 'Save Changes' : 'Create Customer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tags: [],
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Stats
  const stats: CustomerStats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      total: customers.length,
      newThisMonth: customers.filter((c) => c.customerSince >= thisMonth).length,
      activeQuotes: 12, // Mock data
      totalRevenue: 125000, // Mock data
    };
  }, [customers]);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.contactName.toLowerCase().includes(query) ||
          c.companyName.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = a.contactName.localeCompare(b.contactName);
          break;
        case 'company':
          comparison = a.companyName.localeCompare(b.companyName);
          break;
        case 'date':
          comparison = b.customerSince.getTime() - a.customerSince.getTime();
          break;
        case 'revenue':
          comparison = 0; // Mock - would use actual revenue data
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [customers, filters]);

  // Handlers
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const handleCreateCustomer = useCallback(() => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  }, []);

  const handleEditCustomer = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  }, []);

  const handleSaveCustomer = useCallback(
    (customerData: Partial<Customer>) => {
      if (editingCustomer) {
        // Update existing
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === editingCustomer.id ? { ...c, ...customerData } as Customer : c
          )
        );
      } else {
        // Create new
        const newCustomer: Customer = {
          ...customerData,
          id: `c${Date.now()}`,
          customerSince: new Date(),
          tags: customerData.tags || [],
        } as Customer;
        setCustomers((prev) => [newCustomer, ...prev]);
      }
    },
    [editingCustomer]
  );

  const handleDeleteCustomer = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    }
  }, []);

  const handleViewCustomer = useCallback(
    (id: string) => {
      router.push(`/dashboard/customers/${id}`);
    },
    [router]
  );

  const handleCreateQuote = useCallback(
    (customerId: string) => {
      router.push(`/dashboard/quotes/new?customer=${customerId}`);
    },
    [router]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Customers</h1>
          <p className="text-slate-400 mt-1">Manage your B2B customer relationships</p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateCustomer}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25"
          >
            <PlusIcon className="w-5 h-5" />
            Add Customer
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={stats.total}
          subtitle="All time"
          icon={BuildingOfficeIcon}
          color="blue"
          delay={0}
        />
        <StatCard
          title="New This Month"
          value={stats.newThisMonth}
          subtitle="Growing steadily"
          icon={PlusIcon}
          color="green"
          delay={0.1}
        />
        <StatCard
          title="Active Quotes"
          value={stats.activeQuotes}
          subtitle="Pending responses"
          icon={DocumentTextIcon}
          color="purple"
          delay={0.2}
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats.totalRevenue / 1000).toFixed(0)}k`}
          subtitle="From all customers"
          icon={ArrowTopRightOnSquareIcon}
          color="amber"
          delay={0.3}
        />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search customers by name, company, or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
            }
            className="appearance-none w-44 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="name">Sort by Name</option>
            <option value="company">Sort by Company</option>
            <option value="date">Sort by Date</option>
            <option value="revenue">Sort by Revenue</option>
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
        </div>

        {/* Sort Order */}
        <button
          onClick={() =>
            setFilters({
              ...filters,
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
            })
          }
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
        >
          {filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      </motion.div>

      {/* Customer Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {filteredCustomers.map((customer, index) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onView={handleViewCustomer}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            onCreateQuote={handleCreateQuote}
            index={index}
          />
        ))}
      </motion.div>

      {filteredCustomers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center"
        >
          <BuildingOfficeIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No customers found</p>
          <p className="text-slate-600 mt-2">Try adjusting your search criteria</p>
        </motion.div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}
