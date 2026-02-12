/**
 * Settings Page
 * Configure app settings and preferences
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  BellIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

type SettingsTab = 'company' | 'email' | 'quotes' | 'notifications' | 'appearance';

interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
}

interface EmailSettings {
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  emailFooter: string;
}

interface QuoteSettings {
  defaultCurrency: string;
  defaultValidityPeriod: number;
  defaultPaymentTerms: string;
  taxRate: number;
  enableAutoReminders: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'Acme Corporation',
    address: '123 Business Ave, Suite 100\nNew York, NY 10001',
    phone: '+1 (555) 123-4567',
    email: 'quotes@acme.com',
    website: 'https://acme.com',
    taxId: '12-3456789',
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    senderName: 'Acme Quotes',
    senderEmail: 'quotes@acme.com',
    replyToEmail: 'support@acme.com',
    emailFooter: 'Thank you for your business!\n\nAcme Corporation',
  });

  const [quoteSettings, setQuoteSettings] = useState<QuoteSettings>({
    defaultCurrency: 'USD',
    defaultValidityPeriod: 30,
    defaultPaymentTerms: 'Net 30',
    taxRate: 10,
    enableAutoReminders: true,
  });

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'company', label: 'Company', icon: BuildingOfficeIcon },
    { id: 'email', label: 'Email', icon: EnvelopeIcon },
    { id: 'quotes', label: 'Quotes', icon: DocumentTextIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={companySettings.name}
            onChange={(e) =>
              setCompanySettings({ ...companySettings, name: e.target.value })
            }
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Address
          </label>
          <textarea
            value={companySettings.address}
            onChange={(e) =>
              setCompanySettings({ ...companySettings, address: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={companySettings.phone}
            onChange={(e) =>
              setCompanySettings({ ...companySettings, phone: e.target.value })
            }
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={companySettings.email}
            onChange={(e) =>
              setCompanySettings({ ...companySettings, email: e.target.value })
            }
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={companySettings.website}
            onChange={(e) =>
              setCompanySettings({ ...companySettings, website: e.target.value })
            }
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tax ID / VAT Number
          </label>
          <input
            type="text"
            value={companySettings.taxId}
            onChange={(e) =>
              setCompanySettings({ ...companySettings, taxId: e.target.value })
            }
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Sender Name
          </label>
          <input
            type="text"
            value={emailSettings.senderName}
            onChange={(e) =>
              setEmailSettings({ ...emailSettings, senderName: e.target.value })
            }
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Sender Email
          </label>
          <input
            type="email"
            value={emailSettings.senderEmail}
            onChange={(e) =>
              setEmailSettings({ ...emailSettings, senderEmail: e.target.value })
            }
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Reply-To Email
          </label>
          <input
            type="email"
            value={emailSettings.replyToEmail}
            onChange={(e) =>
              setEmailSettings({ ...emailSettings, replyToEmail: e.target.value })
            }
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email Footer
          </label>
          <textarea
            value={emailSettings.emailFooter}
            onChange={(e) =>
              setEmailSettings({ ...emailSettings, emailFooter: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );

  const renderQuoteSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Default Currency
          </label>
          <select
            value={quoteSettings.defaultCurrency}
            onChange={(e) =>
              setQuoteSettings({ ...quoteSettings, defaultCurrency: e.target.value })
            }
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Default Validity Period (days)
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={quoteSettings.defaultValidityPeriod}
            onChange={(e) =>
              setQuoteSettings({
                ...quoteSettings,
                defaultValidityPeriod: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Default Payment Terms
          </label>
          <select
            value={quoteSettings.defaultPaymentTerms}
            onChange={(e) =>
              setQuoteSettings({
                ...quoteSettings,
                defaultPaymentTerms: e.target.value,
              })
            }
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Net 15">Net 15</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 60">Net 60</option>
            <option value="Due on Receipt">Due on Receipt</option>
            <option value="50% Deposit">50% Deposit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Default Tax Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={quoteSettings.taxRate}
            onChange={(e) =>
              setQuoteSettings({
                ...quoteSettings,
                taxRate: parseFloat(e.target.value),
              })
            }
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={quoteSettings.enableAutoReminders}
              onChange={(e) =>
                setQuoteSettings({
                  ...quoteSettings,
                  enableAutoReminders: e.target.checked,
                })
              }
              className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-slate-300">Enable automatic quote reminders</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout activeNavItem="settings">
      <PageHeader
        title="Settings"
        subtitle="Configure your quote preferences and company information."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                    ${activeTab === tab.id
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-200">
                {tabs.find((t) => t.id === activeTab)?.label} Settings
              </h2>
            </CardHeader>
            <CardContent>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'company' && renderCompanySettings()}
                {activeTab === 'email' && renderEmailSettings()}
                {activeTab === 'quotes' && renderQuoteSettings()}
                {activeTab === 'notifications' && (
                  <p className="text-slate-500">Notification settings coming soon.</p>
                )}
                {activeTab === 'appearance' && (
                  <p className="text-slate-500">Appearance settings coming soon.</p>
                )}
              </motion.div>

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                {showSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-emerald-400"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Settings saved successfully!</span>
                  </motion.div>
                ) : (
                  <div />
                )}
                <Button onClick={handleSave} isLoading={isSaving}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
