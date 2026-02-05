/**
 * Settings Page
 * Comprehensive settings management for QuoteGen
 * @module app/dashboard/settings/page
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  BellIcon,
  CreditCardIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logo: string | null;
}

interface EmailSettings {
  senderName: string;
  senderEmail: string;
  replyTo: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  useSsl: boolean;
}

interface NotificationSettings {
  newQuoteSubmitted: boolean;
  quoteViewed: boolean;
  quoteAccepted: boolean;
  quoteDeclined: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  browserNotifications: boolean;
}

interface QuoteSettings {
  defaultCurrency: string;
  defaultValidityDays: number;
  defaultPaymentTerms: string;
  defaultDeliveryTerms: string;
  defaultTaxRate: number;
  quotePrefix: string;
  autoNumbering: boolean;
  requireApproval: boolean;
  enableExpirations: boolean;
}

interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  primaryColor: string;
  accentColor: string;
  logoPosition: 'left' | 'center' | 'right';
  fontFamily: 'inter' | 'roboto' | 'opensans';
  compactMode: boolean;
}

interface IntegrationSettings {
  shopifyConnected: boolean;
  stripeConnected: boolean;
  slackWebhook: string;
  zapierEnabled: boolean;
  apiKey: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  passwordPolicy: 'relaxed' | 'standard' | 'strict';
}

// ============================================================================
// Initial Data
// ============================================================================

const initialCompanySettings: CompanySettings = {
  name: 'Acme Corporation',
  address: '123 Business Ave, Suite 100\nSan Francisco, CA 94102',
  phone: '+1 (555) 123-4567',
  email: 'quotes@acme.com',
  website: 'https://acme.com',
  taxId: '12-3456789',
  logo: null,
};

const initialEmailSettings: EmailSettings = {
  senderName: 'Acme Quotes',
  senderEmail: 'quotes@acme.com',
  replyTo: 'support@acme.com',
  smtpHost: 'smtp.acme.com',
  smtpPort: 587,
  smtpUsername: 'quotes@acme.com',
  smtpPassword: '',
  useSsl: true,
};

const initialNotificationSettings: NotificationSettings = {
  newQuoteSubmitted: true,
  quoteViewed: true,
  quoteAccepted: true,
  quoteDeclined: true,
  dailyDigest: false,
  weeklyReport: true,
  browserNotifications: true,
};

const initialQuoteSettings: QuoteSettings = {
  defaultCurrency: 'USD',
  defaultValidityDays: 30,
  defaultPaymentTerms: 'Net 30',
  defaultDeliveryTerms: 'Standard shipping (5-7 business days)',
  defaultTaxRate: 8.5,
  quotePrefix: 'QT',
  autoNumbering: true,
  requireApproval: false,
  enableExpirations: true,
};

const initialAppearanceSettings: AppearanceSettings = {
  theme: 'dark',
  primaryColor: '#6366f1',
  accentColor: '#8b5cf6',
  logoPosition: 'left',
  fontFamily: 'inter',
  compactMode: false,
};

const initialIntegrationSettings: IntegrationSettings = {
  shopifyConnected: true,
  stripeConnected: false,
  slackWebhook: '',
  zapierEnabled: false,
  apiKey: 'qt_live_' + Math.random().toString(36).substring(2, 34),
};

const initialSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: 60,
  ipWhitelist: [],
  passwordPolicy: 'standard',
};

// ============================================================================
// Components
// ============================================================================

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
      active
        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
    {active && <ChevronRightIcon className="w-4 h-4 ml-auto" />}
  </button>
);

const Section: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
  >
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      {description && <p className="text-slate-400 mt-1">{description}</p>}
    </div>
    {children}
  </motion.div>
);

const FormField: React.FC<{
  label: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, description, required, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-300">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
    {description && <p className="text-xs text-slate-500">{description}</p>}
  </div>
);

const Toggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between py-3">
    <div>
      <p className="font-medium text-slate-200">{label}</p>
      {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-indigo-500' : 'bg-slate-700'
      }`}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full"
      />
    </button>
  </div>
);

const ColorPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const presets = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#64748b'];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 rounded-lg cursor-pointer border-0 p-0"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm font-mono uppercase"
          maxLength={7}
        />
        <div className="flex gap-1">
          {presets.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                value === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Settings Sections
// ============================================================================

const CompanySection: React.FC<{
  settings: CompanySettings;
  onChange: (settings: CompanySettings) => void;
  onSave: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}> = ({ settings, onChange, onSave, isSaving, saveSuccess }) => {
  const handleLogoUpload = () => {
    // Mock file upload
    onChange({ ...settings, logo: 'https://via.placeholder.com/200x60/6366f1/ffffff?text=LOGO' });
  };

  return (
    <Section
      title="Company Information"
      description="This information will appear on your quotes and emails."
    >
      <div className="space-y-6">
        {/* Logo Upload */}
        <div className="flex items-center gap-6">
          <div className="w-32 h-20 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 overflow-hidden">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <PhotoIcon className="w-8 h-8 text-slate-600" />
            )}
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleLogoUpload}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              <PhotoIcon className="w-4 h-4" />
              Upload Logo
            </button>
            <p className="text-xs text-slate-500">Recommended: 400x120px, PNG or SVG</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Company Name" required>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => onChange({ ...settings, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </FormField>

          <FormField label="Tax ID / VAT Number">
            <input
              type="text"
              value={settings.taxId}
              onChange={(e) => onChange({ ...settings, taxId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              placeholder="XX-XXXXXXX"
            />
          </FormField>
        </div>

        <FormField label="Business Address" description="Full address including city, state, and ZIP">
          <textarea
            rows={3}
            value={settings.address}
            onChange={(e) => onChange({ ...settings, address: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Phone Number">
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => onChange({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </FormField>

          <FormField label="Email Address">
            <input
              type="email"
              value={settings.email}
              onChange={(e) => onChange({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </FormField>

          <FormField label="Website">
            <input
              type="url"
              value={settings.website}
              onChange={(e) => onChange({ ...settings, website: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              placeholder="https://"
            />
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          {saveSuccess && (
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-emerald-400"
            >
              <CheckIcon className="w-4 h-4" />
              Saved successfully
            </motion.span>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
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
    </Section>
  );
};

const QuoteDefaultsSection: React.FC<{
  settings: QuoteSettings;
  onChange: (settings: QuoteSettings) => void;
  onSave: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}> = ({ settings, onChange, onSave, isSaving, saveSuccess }) => {
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

  return (
    <Section
      title="Quote Defaults"
      description="Configure default values for new quotes."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Default Currency" required>
            <select
              value={settings.defaultCurrency}
              onChange={(e) => onChange({ ...settings, defaultCurrency: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Quote Number Prefix">
            <input
              type="text"
              value={settings.quotePrefix}
              onChange={(e) => onChange({ ...settings, quotePrefix: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              placeholder="QT"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Default Validity Period (days)">
            <input
              type="number"
              min={1}
              max={365}
              value={settings.defaultValidityDays}
              onChange={(e) => onChange({ ...settings, defaultValidityDays: parseInt(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </FormField>

          <FormField label="Default Tax Rate (%)">
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={settings.defaultTaxRate}
              onChange={(e) => onChange({ ...settings, defaultTaxRate: parseFloat(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </FormField>
        </div>

        <FormField label="Default Payment Terms">
          <select
            value={settings.defaultPaymentTerms}
            onChange={(e) => onChange({ ...settings, defaultPaymentTerms: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          >
            <option>Net 15</option>
            <option>Net 30</option>
            <option>Net 60</option>
            <option>Due on Receipt</option>
            <option>50% Deposit</option>
          </select>
        </FormField>

        <FormField label="Default Delivery Terms">
          <textarea
            rows={2}
            value={settings.defaultDeliveryTerms}
            onChange={(e) => onChange({ ...settings, defaultDeliveryTerms: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
          />
        </FormField>

        <div className="border-t border-slate-800 pt-6 space-y-4">
          <Toggle
            checked={settings.autoNumbering}
            onChange={(checked) => onChange({ ...settings, autoNumbering: checked })}
            label="Auto-numbering"
            description="Automatically generate quote numbers in sequence"
          />

          <Toggle
            checked={settings.enableExpirations}
            onChange={(checked) => onChange({ ...settings, enableExpirations: checked })}
            label="Enable Quote Expirations"
            description="Quotes will automatically expire after the validity period"
          />

          <Toggle
            checked={settings.requireApproval}
            onChange={(checked) => onChange({ ...settings, requireApproval: checked })}
            label="Require Approval"
            description="Quotes must be approved before they can be sent to customers"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          {saveSuccess && (
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-emerald-400"
            >
              <CheckIcon className="w-4 h-4" />
              Saved successfully
            </motion.span>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
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
    </Section>
  );
};

const NotificationsSection: React.FC<{
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
  onSave: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}> = ({ settings, onChange, onSave, isSaving, saveSuccess }) => {
  return (
    <Section
      title="Notifications"
      description="Choose which events trigger email notifications."
    >
      <div className="space-y-2">
        <Toggle
          checked={settings.newQuoteSubmitted}
          onChange={(checked) => onChange({ ...settings, newQuoteSubmitted: checked })}
          label="New Quote Submitted"
          description="Receive a notification when a customer submits a new quote request"
        />

        <Toggle
          checked={settings.quoteViewed}
          onChange={(checked) => onChange({ ...settings, quoteViewed: checked })}
          label="Quote Viewed"
          description="Get notified when a customer views a sent quote"
        />

        <Toggle
          checked={settings.quoteAccepted}
          onChange={(checked) => onChange({ ...settings, quoteAccepted: checked })}
          label="Quote Accepted"
          description="Receive an alert when a quote is accepted by a customer"
        />

        <Toggle
          checked={settings.quoteDeclined}
          onChange={(checked) => onChange({ ...settings, quoteDeclined: checked })}
          label="Quote Declined"
          description="Get notified when a quote is declined"
        />

        <div className="border-t border-slate-800 my-4" />

        <Toggle
          checked={settings.dailyDigest}
          onChange={(checked) => onChange({ ...settings, dailyDigest: checked })}
          label="Daily Digest"
          description="Receive a daily summary of quote activity"
        />

        <Toggle
          checked={settings.weeklyReport}
          onChange={(checked) => onChange({ ...settings, weeklyReport: checked })}
          label="Weekly Report"
          description="Get a weekly analytics report every Monday"
        />

        <Toggle
          checked={settings.browserNotifications}
          onChange={(checked) => onChange({ ...settings, browserNotifications: checked })}
          label="Browser Notifications"
          description="Show desktop notifications for important events"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800 mt-6">
        {saveSuccess && (
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-emerald-400"
          >
            <CheckIcon className="w-4 h-4" />
            Saved successfully
          </motion.span>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
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
    </Section>
  );
};

const AppearanceSection: React.FC<{
  settings: AppearanceSettings;
  onChange: (settings: AppearanceSettings) => void;
  onSave: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
}> = ({ settings, onChange, onSave, isSaving, saveSuccess }) => {
  return (
    <Section
      title="Appearance"
      description="Customize the look and feel of your quotes and dashboard."
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {(['dark', 'light', 'system'] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => onChange({ ...settings, theme })}
                className={`px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                  settings.theme === theme
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <ColorPicker
          label="Primary Color"
          value={settings.primaryColor}
          onChange={(color) => onChange({ ...settings, primaryColor: color })}
        />

        <ColorPicker
          label="Accent Color"
          value={settings.accentColor}
          onChange={(color) => onChange({ ...settings, accentColor: color })}
        />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Logo Position</label>
          <div className="grid grid-cols-3 gap-3">
            {(['left', 'center', 'right'] as const).map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => onChange({ ...settings, logoPosition: pos })}
                className={`px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                  settings.logoPosition === pos
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        <FormField label="Font Family">
          <select
            value={settings.fontFamily}
            onChange={(e) => onChange({ ...settings, fontFamily: e.target.value as AppearanceSettings['fontFamily'] })}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          >
            <option value="inter">Inter (Modern)</option>
            <option value="roboto">Roboto (Clean)</option>
            <option value="opensans">Open Sans (Friendly)</option>
          </select>
        </FormField>

        <Toggle
          checked={settings.compactMode}
          onChange={(checked) => onChange({ ...settings, compactMode: checked })}
          label="Compact Mode"
          description="Reduce spacing for a denser UI"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          {saveSuccess && (
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-emerald-400"
            >
              <CheckIcon className="w-4 h-4" />
              Saved successfully
            </motion.span>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
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
    </Section>
  );
};

const IntegrationsSection: React.FC<{
  settings: IntegrationSettings;
  onChange: (settings: IntegrationSettings) => void;
}> = ({ settings, onChange }) => {
  const [showApiKey, setShowApiKey] = useState(false);

  const regenerateApiKey = () => {
    onChange({ ...settings, apiKey: 'qt_live_' + Math.random().toString(36).substring(2, 34) });
  };

  return (
    <div className="space-y-6">
      <Section title="Connected Services">
        <div className="space-y-4">
          {/* Shopify */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#96bf48] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.337 2.666c-.065.053-.134.11-.134.11s-.363.372-.712.75c-.35.378-.647.697-.662.71-.016.013-.029-.27-.033-.63-.004-.36-.013-.666-.02-.68-.007-.014-.14.022-.295.08-.156.058-.3.106-.32.106-.02 0-.026-.125-.014-.278.018-.237.013-.278-.04-.278-.031 0-.25-.057-.488-.127-.395-.117-.434-.12-.455-.043-.028.103-.58.375-.643.34-.028-.015-.066-.12-.086-.232-.02-.113-.043-.205-.05-.205-.007 0-.133.04-.28.088l-.268.088-.044-.188c-.024-.103-.06-.193-.08-.2-.02-.007-.156.022-.302.065-.242.072-.268.07-.31-.03-.039-.09-.057-.093-.304-.058-.264.037-.265.037-.332-.143-.037-.099-.077-.18-.09-.18-.012 0-.137.035-.277.078l-.254.078-.063-.165c-.034-.09-.076-.17-.092-.176-.016-.006-.15.025-.298.07-.234.072-.272.073-.31.01-.04-.064-.058-.064-.306-.013-.252.052-.267.048-.33-.087-.058-.123-.08-.134-.187-.1-.186.058-.287.052-.327-.02-.03-.054-.067-.049-.2.03l-.164.098-.1-.124c-.083-.103-.116-.116-.243-.09-.162.033-.222-.002-.257-.154-.02-.087-.052-.113-.133-.113-.058 0-.193.033-.3.073-.175.066-.198.063-.26-.043-.061-.104-.08-.106-.334-.04-.253.066-.272.064-.33-.05-.058-.113-.08-.12-.26-.07-.16.044-.209.035-.26-.05-.048-.08-.092-.09-.204-.052-.137.046-.15.039-.205-.117-.06-.172-.065-.173-.323-.105-.257.068-.263.066-.333-.08-.07-.147-.076-.148-.246-.078-.156.065-.18.062-.238-.04-.057-.1-.09-.104-.262-.04-.166.063-.208.058-.28-.04-.073-.1-.11-.103-.22-.025-.137.09-.14.09-.217-.04-.072-.12-.093-.124-.244-.06-.15.063-.178.06-.233-.04-.05-.09-.103-.103-.217-.057-.13.053-.168.046-.228-.05-.058-.094-.097-.1-.192-.03-.136.095-.153.092-.2-.04-.038-.098-.08-.114-.17-.075-.108.048-.136.043-.19-.05-.044-.07-.105-.09-.183-.06-.1.038-.143.027-.2-.052-.06-.083-.1-.09-.186-.03-.14.1-.17.098-.217-.02-.037-.09-.08-.105-.17-.065-.108.048-.14.042-.186-.05-.045-.09-.087-.1-.178-.06-.09.04-.13.035-.185-.04-.07-.092-.106-.096-.2-.025-.13.098-.14.096-.186-.02-.039-.098-.08-.114-.17-.075-.107.048-.14.042-.186-.05-.045-.09-.087-.1-.178-.06-.09.04-.13.035-.185-.04-.07-.092-.106-.096-.2-.025-.13.098-.14.096-.186-.02l-.04-.098"></path>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-200">Shopify</p>
                <p className="text-sm text-slate-400">Connected to myshop.myshopify.com</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-emerald-400 text-sm">
              <CheckIcon className="w-4 h-4" />
              Connected
            </span>
          </div>

          {/* Stripe */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#635bff] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-200">Stripe</p>
                <p className="text-sm text-slate-400">Accept payments online</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...settings, stripeConnected: !settings.stripeConnected })}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                settings.stripeConnected
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {settings.stripeConnected ? 'Connected' : 'Connect'}
            </button>
          </div>
        </div>
      </Section>

      <Section title="API Access">
        <div className="space-y-4">
          <FormField label="API Key" description="Use this key to authenticate API requests">
            <div className="flex gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey}
                readOnly
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
              <button
                type="button"
                onClick={regenerateApiKey}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              >
                Regenerate
              </button>
            </div>
          </FormField>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-400">Keep your API key secure</p>
                <p className="text-sm text-amber-400/80 mt-1">
                  Do not share your API key in public repositories or client-side code.
                  Regenerate immediately if compromised.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

type TabId = 'company' | 'quotes' | 'notifications' | 'appearance' | 'integrations';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('company');

  // Settings state
  const [companySettings, setCompanySettings] = useState(initialCompanySettings);
  const [quoteSettings, setQuoteSettings] = useState(initialQuoteSettings);
  const [notificationSettings, setNotificationSettings] = useState(initialNotificationSettings);
  const [appearanceSettings, setAppearanceSettings] = useState(initialAppearanceSettings);
  const [integrationSettings, setIntegrationSettings] = useState(initialIntegrationSettings);

  // Save states
  const [saveStates, setSaveStates] = useState({
    company: { isSaving: false, success: false },
    quotes: { isSaving: false, success: false },
    notifications: { isSaving: false, success: false },
    appearance: { isSaving: false, success: false },
  });

  const handleSave = useCallback(async (section: keyof typeof saveStates) => {
    setSaveStates((prev) => ({
      ...prev,
      [section]: { isSaving: true, success: false },
    }));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setSaveStates((prev) => ({
      ...prev,
      [section]: { isSaving: false, success: true },
    }));

    // Reset success after 3 seconds
    setTimeout(() => {
      setSaveStates((prev) => ({
        ...prev,
        [section]: { isSaving: false, success: false },
      }));
    }, 3000);
  }, []);

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'company', label: 'Company', icon: BuildingOfficeIcon },
    { id: 'quotes', label: 'Quote Defaults', icon: DocumentTextIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
    { id: 'integrations', label: 'Integrations', icon: GlobeAltIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account and application preferences</p>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6"
      >
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 flex-shrink-0"
        >
          <nav className="space-y-1 sticky top-6">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </nav>
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'company' && (
                <CompanySection
                  settings={companySettings}
                  onChange={setCompanySettings}
                  onSave={() => handleSave('company')}
                  isSaving={saveStates.company.isSaving}
                  saveSuccess={saveStates.company.success}
                />
              )}

              {activeTab === 'quotes' && (
                <QuoteDefaultsSection
                  settings={quoteSettings}
                  onChange={setQuoteSettings}
                  onSave={() => handleSave('quotes')}
                  isSaving={saveStates.quotes.isSaving}
                  saveSuccess={saveStates.quotes.success}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsSection
                  settings={notificationSettings}
                  onChange={setNotificationSettings}
                  onSave={() => handleSave('notifications')}
                  isSaving={saveStates.notifications.isSaving}
                  saveSuccess={saveStates.notifications.success}
                />
              )}

              {activeTab === 'appearance' && (
                <AppearanceSection
                  settings={appearanceSettings}
                  onChange={setAppearanceSettings}
                  onSave={() => handleSave('appearance')}
                  isSaving={saveStates.appearance.isSaving}
                  saveSuccess={saveStates.appearance.success}
                />
              )}

              {activeTab === 'integrations' && (
                <IntegrationsSection
                  settings={integrationSettings}
                  onChange={setIntegrationSettings}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
