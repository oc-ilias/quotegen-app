'use client';

import { useState, useEffect } from 'react';
import { ShopSettings, getShopSettings, updateShopSettings } from '@/lib/supabase';

interface SettingsFormProps {
  shopId: string;
}

export function SettingsForm({ shopId }: SettingsFormProps) {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [shopId]);

  async function loadSettings() {
    try {
      const data = await getShopSettings(shopId);
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSaved(false);

    try {
      await updateShopSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  if (!settings) {
    return <div className="p-8 text-center text-red-600">Error loading settings</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Button Settings</h2>
        <p className="text-gray-600">Customize how the quote button appears on your store.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Button Text</label>
          <input
            type="text"
            value={settings.button_text}
            onChange={(e) => setSettings({ ...settings, button_text: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Request Quote"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Button Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.button_color}
              onChange={(e) => setSettings({ ...settings, button_color: e.target.value })}
              className="h-10 w-20"
            />
            <input
              type="text"
              value={settings.button_color}
              onChange={(e) => setSettings({ ...settings, button_color: e.target.value })}
              className="flex-1 px-4 py-2 border rounded-lg"
              placeholder="#008060"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Form Title</label>
          <input
            type="text"
            value={settings.form_title}
            onChange={(e) => setSettings({ ...settings, form_title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Request a Quote"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Success Message</label>
          <textarea
            rows={3}
            value={settings.success_message}
            onChange={(e) => setSettings({ ...settings, success_message: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Thank you! We will get back to you soon."
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Form Fields</h3>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium">Require Quantity</div>
              <div className="text-sm text-gray-500">Make quantity field mandatory</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_quantity}
                onChange={(e) => setSettings({ ...settings, require_quantity: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium">Require Phone Number</div>
              <div className="text-sm text-gray-500">Make phone field mandatory</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_phone}
                onChange={(e) => setSettings({ ...settings, require_phone: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email Notifications</div>
              <div className="text-sm text-gray-500">Get notified when new quotes are submitted</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        {saved && (
          <span className="text-green-600">✅ Settings saved!</span>
        )}
      </div>
    </form>
  );
}