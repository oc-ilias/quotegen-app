'use client';

import { useState } from 'react';
import { createQuote } from '@/lib/supabase';

interface QuoteButtonProps {
  productId: string;
  productTitle: string;
  shopId: string;
  settings: {
    button_text: string;
    button_color: string;
    form_title: string;
    success_message: string;
    require_quantity: boolean;
    require_phone: boolean;
  };
}

export function QuoteButton({ productId, productTitle, shopId, settings }: QuoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customer_email: '',
    customer_name: '',
    customer_phone: '',
    quantity: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createQuote({
        shop_id: shopId,
        product_id: productId,
        product_title: productTitle,
        customer_email: formData.customer_email,
        customer_name: formData.customer_name || null,
        customer_phone: formData.customer_phone || null,
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        message: formData.message || null,
        status: 'pending',
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({
          customer_email: '',
          customer_name: '',
          customer_phone: '',
          quantity: '',
          message: '',
        });
      }, 3000);
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{ backgroundColor: settings.button_color }}
        className="px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition"
      >
        {settings.button_text}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {isSuccess ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-2">Quote Request Sent!</h3>
                <p className="text-gray-600">{settings.success_message}</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{settings.form_title}</h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{productTitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Your name"
                    />
                  </div>

                  {settings.require_phone && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required={settings.require_phone}
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  )}

                  {settings.require_quantity && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        required={settings.require_quantity}
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="How many units?"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Message
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about your requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: settings.button_color }}
                    className="w-full py-3 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}