/**
 * Billing Component
 * Subscription management, payment methods, and invoices
 * @module components/settings/Billing
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  CreditCardIcon,
  DocumentTextIcon,
  CheckIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

type PlanType = 'free' | 'starter' | 'professional' | 'enterprise';
type BillingPeriod = 'monthly' | 'annual';

interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: number;
  annualPrice: number;
  features: string[];
  limits: {
    quotes: number;
    users: number;
    templates: number;
    storage: string;
  };
  popular?: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

interface BillingProps {
  currentPlan?: PlanType;
  billingPeriod?: BillingPeriod;
  paymentMethods?: PaymentMethod[];
  invoices?: Invoice[];
  nextBillingDate?: string;
  onChangePlan?: (plan: PlanType, period: BillingPeriod) => Promise<void>;
  onAddPaymentMethod?: () => void;
  onRemovePaymentMethod?: (id: string) => Promise<void>;
  onDownloadInvoice?: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// Plans Data
// ============================================================================

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'For individuals just getting started',
    price: 0,
    annualPrice: 0,
    features: ['5 quotes/month', '1 user', '3 templates', 'Basic analytics'],
    limits: { quotes: 5, users: 1, templates: 3, storage: '100MB' },
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small businesses',
    price: 29,
    annualPrice: 24,
    features: ['Unlimited quotes', '3 users', '10 templates', 'Advanced analytics', 'Email support'],
    limits: { quotes: -1, users: 3, templates: 10, storage: '1GB' },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing teams',
    price: 79,
    annualPrice: 66,
    features: [
      'Unlimited quotes',
      '10 users',
      'Unlimited templates',
      'Priority support',
      'Custom branding',
      'API access',
    ],
    limits: { quotes: -1, users: 10, templates: -1, storage: '10GB' },
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 199,
    annualPrice: 166,
    features: [
      'Everything in Pro',
      'Unlimited users',
      'SSO & SAML',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    limits: { quotes: -1, users: -1, templates: -1, storage: '100GB' },
  },
];

const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
];

const defaultInvoices: Invoice[] = [
  { id: '1', number: 'INV-2024-001', date: '2024-01-15', amount: 79, status: 'paid', downloadUrl: '#' },
  { id: '2', number: 'INV-2024-002', date: '2024-02-15', amount: 79, status: 'paid', downloadUrl: '#' },
  { id: '3', number: 'INV-2024-003', date: '2024-03-15', amount: 79, status: 'paid', downloadUrl: '#' },
];

// ============================================================================
// Component
// ============================================================================

export const Billing: React.FC<BillingProps> = ({
  currentPlan = 'professional',
  billingPeriod = 'monthly',
  paymentMethods = defaultPaymentMethods,
  invoices = defaultInvoices,
  nextBillingDate = 'April 15, 2024',
  onChangePlan,
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onDownloadInvoice,
  isLoading,
  className,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>(billingPeriod);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  const currentPlanData = plans.find((p) => p.id === currentPlan);

  const handlePlanChange = async (plan: PlanType) => {
    if (plan === currentPlan) return;
    setSelectedPlan(plan);
    setIsChangingPlan(true);
    await onChangePlan?.(plan, selectedPeriod);
    setIsChangingPlan(false);
    setSelectedPlan(null);
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-slate-800 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-slate-800 rounded-xl" />
            <div className="h-40 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Current Plan Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{currentPlanData?.name} Plan</h3>
              <p className="text-indigo-100">
                ${billingPeriod === 'monthly' ? currentPlanData?.price : currentPlanData?.annualPrice}/month, billed{' '}
                {billingPeriod}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-indigo-100">Next billing date</p>
              <p className="font-semibold">{nextBillingDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center gap-4">
        <div className="bg-slate-800 p-1 rounded-xl inline-flex">
          {(['monthly', 'annual'] as BillingPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedPeriod === period
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
              {period === 'annual' && (
                <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Save 20%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const price = selectedPeriod === 'annual' ? plan.annualPrice : plan.price;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className={cn(
                'relative rounded-2xl border p-6 transition-all',
                isCurrent
                  ? 'bg-indigo-500/10 border-indigo-500/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-100">{plan.name}</h3>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-slate-100">${price}</span>
                <span className="text-slate-400">/month</span>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanChange(plan.id)}
                disabled={isCurrent || (isChangingPlan && selectedPlan === plan.id)}
                className={cn(
                  'w-full py-2.5 rounded-xl font-medium transition-all',
                  isCurrent
                    ? 'bg-slate-700 text-slate-400 cursor-default'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                )}
              >
                {isCurrent ? (
                  'Current Plan'
                ) : isChangingPlan && selectedPlan === plan.id ? (
                  'Updating...'
                ) : (
                  <>
                    Upgrade
                    <ArrowRightIcon className="w-4 h-4 inline ml-1" />
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Payment Methods */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-100">Payment Methods</h3>
          <button
            onClick={onAddPaymentMethod}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Card
          </button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 bg-slate-800 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-slate-700 rounded flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                  </p>
                  <p className="text-sm text-slate-400">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
                {method.isDefault && (
                  <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-1 rounded-full border border-indigo-500/20">
                    Default
                  </span>
                )}
              </div>
              <button
                onClick={() => onRemovePaymentMethod?.(method.id)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-6">Invoice History</h3>

        <div className="divide-y divide-slate-800">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">{invoice.number}</p>
                  <p className="text-sm text-slate-400">{invoice.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    'text-sm font-medium',
                    invoice.status === 'paid'
                      ? 'text-emerald-400'
                      : invoice.status === 'pending'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  )}
                >
                  ${invoice.amount}
                </span>
                <button
                  onClick={() => onDownloadInvoice?.(invoice.id)}
                  className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                >
                  <DownloadIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Billing;
