import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Variable,
  ChevronDown,
  Search,
  Copy,
  Check,
  Sparkles,
  User,
  ShoppingCart,
  Building2,
  DollarSign,
  Calendar,
  Mail,
  Hash,
  Globe,
  Tag,
  FileText,
  Star,
  Zap,
  Plus,
  X,
} from 'lucide-react';

// ==================== TYPES ====================
export type VariableCategory = 
  | 'customer' 
  | 'quote' 
  | 'product' 
  | 'order' 
  | 'store' 
  | 'custom';

export interface TemplateVariable {
  name: string;
  key: string;
  category: VariableCategory;
  description: string;
  example: string;
  icon?: React.ElementType;
}

interface VariableInsertMenuProps {
  onInsert: (variable: string) => void;
  trigger?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
  disabled?: boolean;
  recentVariables?: string[];
  customVariables?: TemplateVariable[];
  onCustomVariableAdd?: (variable: TemplateVariable) => void;
}

interface VariableCategoryData {
  id: VariableCategory;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

// ==================== DEFAULT VARIABLES ====================
const DEFAULT_VARIABLES: TemplateVariable[] = [
  // Customer Variables
  { name: 'Customer Name', key: 'customerName', category: 'customer', description: 'Full name of the customer', example: 'John Doe', icon: User },
  { name: 'First Name', key: 'customerFirstName', category: 'customer', description: 'Customer first name only', example: 'John', icon: User },
  { name: 'Last Name', key: 'customerLastName', category: 'customer', description: 'Customer last name only', example: 'Doe', icon: User },
  { name: 'Customer Email', key: 'customerEmail', category: 'customer', description: 'Customer email address', example: 'john@example.com', icon: Mail },
  { name: 'Customer Phone', key: 'customerPhone', category: 'customer', description: 'Customer phone number', example: '+1 (555) 123-4567', icon: Hash },
  { name: 'Customer Company', key: 'customerCompany', category: 'customer', description: 'Customer company name', example: 'Acme Inc.', icon: Building2 },
  { name: 'Customer Address', key: 'customerAddress', category: 'customer', description: 'Full customer address', example: '123 Main St, City, State 12345', icon: Globe },
  { name: 'Customer ID', key: 'customerId', category: 'customer', description: 'Unique customer identifier', example: 'CUST-12345', icon: Hash },
  { name: 'Customer Since', key: 'customerSince', category: 'customer', description: 'Date customer joined', example: 'January 15, 2024', icon: Calendar },
  { name: 'Customer Tier', key: 'customerTier', category: 'customer', description: 'Customer loyalty tier', example: 'Gold', icon: Star },

  // Quote Variables
  { name: 'Quote Number', key: 'quoteNumber', category: 'quote', description: 'Unique quote identifier', example: 'QT-2024-001', icon: FileText },
  { name: 'Quote Date', key: 'quoteDate', category: 'quote', description: 'Date quote was created', example: 'February 5, 2024', icon: Calendar },
  { name: 'Quote Expiry Date', key: 'quoteExpiryDate', category: 'quote', description: 'Date quote expires', example: 'March 5, 2024', icon: Calendar },
  { name: 'Quote Status', key: 'quoteStatus', category: 'quote', description: 'Current quote status', example: 'Pending Approval', icon: Tag },
  { name: 'Quote Subtotal', key: 'quoteSubtotal', category: 'quote', description: 'Quote subtotal before tax', example: '$1,000.00', icon: DollarSign },
  { name: 'Quote Tax', key: 'quoteTax', category: 'quote', description: 'Tax amount', example: '$100.00', icon: DollarSign },
  { name: 'Quote Total', key: 'quoteTotal', category: 'quote', description: 'Final quote total', example: '$1,100.00', icon: DollarSign },
  { name: 'Quote Currency', key: 'quoteCurrency', category: 'quote', description: 'Quote currency code', example: 'USD', icon: DollarSign },
  { name: 'Quote Items Count', key: 'quoteItemsCount', category: 'quote', description: 'Number of items in quote', example: '5', icon: Hash },
  { name: 'Quote URL', key: 'quoteUrl', category: 'quote', description: 'Link to view quote online', example: 'https://store.com/quote/abc123', icon: Globe },

  // Product Variables
  { name: 'Product Name', key: 'productName', category: 'product', description: 'Product name', example: 'Premium Widget', icon: Tag },
  { name: 'Product SKU', key: 'productSku', category: 'product', description: 'Product SKU code', example: 'PW-001-BLK', icon: Hash },
  { name: 'Product Price', key: 'productPrice', category: 'product', description: 'Product unit price', example: '$99.99', icon: DollarSign },
  { name: 'Product Quantity', key: 'productQuantity', category: 'product', description: 'Quantity ordered', example: '10', icon: Hash },
  { name: 'Product Total', key: 'productTotal', category: 'product', description: 'Line item total', example: '$999.90', icon: DollarSign },
  { name: 'Product Description', key: 'productDescription', category: 'product', description: 'Product description', example: 'High-quality premium widget...', icon: FileText },
  { name: 'Product Image', key: 'productImage', category: 'product', description: 'Product image URL', example: 'https://cdn.store.com/image.jpg', icon: Globe },
  { name: 'Product Category', key: 'productCategory', category: 'product', description: 'Product category name', example: 'Widgets', icon: Tag },

  // Order Variables
  { name: 'Order Number', key: 'orderNumber', category: 'order', description: 'Order identifier', example: 'ORD-2024-001', icon: ShoppingCart },
  { name: 'Order Date', key: 'orderDate', category: 'order', description: 'Order creation date', example: 'February 5, 2024', icon: Calendar },
  { name: 'Order Status', key: 'orderStatus', category: 'order', description: 'Current order status', example: 'Processing', icon: Tag },
  { name: 'Order Subtotal', key: 'orderSubtotal', category: 'order', description: 'Order subtotal', example: '$500.00', icon: DollarSign },
  { name: 'Order Shipping', key: 'orderShipping', category: 'order', description: 'Shipping cost', example: '$25.00', icon: DollarSign },
  { name: 'Order Discount', key: 'orderDiscount', category: 'order', description: 'Discount applied', example: '-$50.00', icon: DollarSign },
  { name: 'Order Tax', key: 'orderTax', category: 'order', description: 'Tax amount', example: '$45.00', icon: DollarSign },
  { name: 'Order Total', key: 'orderTotal', category: 'order', description: 'Order grand total', example: '$520.00', icon: DollarSign },
  { name: 'Tracking Number', key: 'trackingNumber', category: 'order', description: 'Shipping tracking number', example: '1Z999AA10123456784', icon: Hash },
  { name: 'Shipping Carrier', key: 'shippingCarrier', category: 'order', description: 'Shipping company', example: 'UPS', icon: Globe },
  { name: 'Estimated Delivery', key: 'estimatedDelivery', category: 'order', description: 'Expected delivery date', example: 'February 10, 2024', icon: Calendar },

  // Store Variables
  { name: 'Store Name', key: 'storeName', category: 'store', description: 'Your store name', example: 'My Awesome Store', icon: Building2 },
  { name: 'Store URL', key: 'storeUrl', category: 'store', description: 'Store website URL', example: 'https://mystore.com', icon: Globe },
  { name: 'Store Email', key: 'storeEmail', category: 'store', description: 'Store contact email', example: 'support@mystore.com', icon: Mail },
  { name: 'Store Phone', key: 'storePhone', category: 'store', description: 'Store phone number', example: '+1 (800) 555-0123', icon: Hash },
  { name: 'Store Address', key: 'storeAddress', category: 'store', description: 'Store physical address', example: '123 Commerce St...', icon: Globe },
  { name: 'Support Email', key: 'supportEmail', category: 'store', description: 'Customer support email', example: 'help@mystore.com', icon: Mail },
  { name: 'Current Year', key: 'currentYear', category: 'store', description: 'Current year', example: '2024', icon: Calendar },
  { name: 'Current Date', key: 'currentDate', category: 'store', description: 'Current date', example: 'February 5, 2024', icon: Calendar },
];

const CATEGORIES: VariableCategoryData[] = [
  { id: 'customer', label: 'Customer', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'quote', label: 'Quote', icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'product', label: 'Product', icon: Tag, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'order', label: 'Order', icon: ShoppingCart, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  { id: 'store', label: 'Store', icon: Building2, color: 'text-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-700/30' },
  { id: 'custom', label: 'Custom', icon: Sparkles, color: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-900/20' },
];

// ==================== COMPONENT ====================
export const VariableInsertMenu: React.FC<VariableInsertMenuProps> = ({
  onInsert,
  trigger,
  position = 'bottom',
  align = 'start',
  className = '',
  disabled = false,
  recentVariables = [],
  customVariables = [],
  onCustomVariableAdd,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VariableCategory | 'all'>('all');
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFormData, setCustomFormData] = useState<Partial<TemplateVariable>>({
    name: '',
    key: '',
    description: '',
    example: '',
    category: 'custom',
  });

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Merge default and custom variables
  const allVariables = useMemo(() => {
    return [...DEFAULT_VARIABLES, ...customVariables];
  }, [customVariables]);

  // Filter variables based on search and category
  const filteredVariables = useMemo(() => {
    let filtered = allVariables;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((v) => v.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.key.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allVariables, selectedCategory, searchQuery]);

  // Get recent variables
  const recentVars = useMemo(() => {
    return allVariables.filter((v) => recentVariables.includes(v.key)).slice(0, 5);
  }, [allVariables, recentVariables]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== HANDLERS ====================
  const handleInsert = (variable: TemplateVariable) => {
    const variableSyntax = `{{${variable.key}}}`;
    onInsert(variableSyntax);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCopy = async (variable: TemplateVariable, e: React.MouseEvent) => {
    e.stopPropagation();
    const variableSyntax = `{{${variable.key}}}`;
    try {
      await navigator.clipboard.writeText(variableSyntax);
      setCopiedVariable(variable.key);
      setTimeout(() => setCopiedVariable(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAddCustomVariable = () => {
    if (customFormData.name && customFormData.key) {
      const newVariable: TemplateVariable = {
        name: customFormData.name,
        key: customFormData.key,
        category: 'custom',
        description: customFormData.description || '',
        example: customFormData.example || '',
        icon: Sparkles,
      };
      onCustomVariableAdd?.(newVariable);
      setCustomFormData({ name: '', key: '', description: '', example: '', category: 'custom' });
      setShowCustomForm(false);
    }
  };

  // ==================== RENDER ====================
  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50';
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full mb-2`;
      case 'bottom':
        return `${baseClasses} top-full mt-2`;
      case 'left':
        return `${baseClasses} right-full mr-2`;
      case 'right':
        return `${baseClasses} left-full ml-2`;
      default:
        return `${baseClasses} top-full mt-2`;
    }
  };

  const getAlignClasses = () => {
    switch (align) {
      case 'start':
        return 'left-0';
      case 'end':
        return 'right-0';
      case 'center':
        return 'left-1/2 -translate-x-1/2';
      default:
        return 'left-0';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      {trigger ? (
        <button
          ref={triggerRef}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full"
        >
          {trigger}
        </button>
      ) : (
        <motion.button
          ref={triggerRef}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            disabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Variable className="w-4 h-4" />
          <span>Insert Variable</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === 'top' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`${getPositionClasses()} ${getAlignClasses()}`}
          >
            <div className="w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Variable className="w-4 h-4 text-blue-600" />
                    Insert Variable
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search variables..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const count = allVariables.filter((v) => v.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? `${cat.bgColor} ${cat.color}`
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {cat.label}
                      <span className="text-[10px] opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Recent Variables */}
              {!searchQuery && selectedCategory === 'all' && recentVars.length > 0 && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Recent
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recentVars.map((variable) => (
                      <motion.button
                        key={variable.key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleInsert(variable)}
                        className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 transition-colors"
                      >
                        {variable.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variables List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredVariables.length === 0 ? (
                  <div className="p-8 text-center">
                    <Variable className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {searchQuery
                        ? `No variables found for "${searchQuery}"`
                        : 'No variables in this category'}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredVariables.map((variable, index) => {
                      const category = CATEGORIES.find((c) => c.id === variable.category);
                      const Icon = variable.icon || category?.icon || Variable;

                      return (
                        <motion.button
                          key={variable.key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => handleInsert(variable)}
                          className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left group transition-colors"
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              category?.bgColor || 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${category?.color || 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm text-gray-900 dark:text-white">
                                {variable.name}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => handleCopy(variable, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-opacity"
                              >
                                {copiedVariable === variable.key ? (
                                  <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </motion.button>
                            </div>
                            <code className="text-xs text-blue-600 dark:text-blue-400">
                              {'{{'}{variable.key}{'}}'}
                            </code>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {variable.description}
                            </p>
                            {variable.example && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                Example: {variable.example}
                              </p>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Custom Variable */}
              {onCustomVariableAdd && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                  {!showCustomForm ? (
                    <button
                      onClick={() => setShowCustomForm(true)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Custom Variable
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Variable name"
                        value={customFormData.name}
                        onChange={(e) =>
                          setCustomFormData({ ...customFormData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Variable key (e.g., customField)"
                        value={customFormData.key}
                        onChange={(e) =>
                          setCustomFormData({ ...customFormData, key: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={customFormData.description}
                        onChange={(e) =>
                          setCustomFormData({ ...customFormData, description: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddCustomVariable}
                          disabled={!customFormData.name || !customFormData.key}
                          className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowCustomForm(false)}
                          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== UTILITY EXPORTS ====================
export { DEFAULT_VARIABLES };
export const getVariableByKey = (key: string, customVars: TemplateVariable[] = []): TemplateVariable | undefined => {
  return [...DEFAULT_VARIABLES, ...customVars].find((v) => v.key === key);
};
export const getVariablesByCategory = (category: VariableCategory, customVars: TemplateVariable[] = []): TemplateVariable[] => {
  return [...DEFAULT_VARIABLES, ...customVars].filter((v) => v.category === category);
};
export const validateVariable = (key: string, customVars: TemplateVariable[] = []): boolean => {
  return [...DEFAULT_VARIABLES, ...customVars].some((v) => v.key === key);
};
export const extractVariablesFromContent = (content: string): string[] => {
  const matches = content.match(/\{\{(\w+)\}\}/g);
  return matches ? matches.map((m) => m.slice(2, -2)) : [];
};

export default VariableInsertMenu;
