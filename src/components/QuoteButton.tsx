'use client';

import { useState, useCallback, useMemo, memo } from 'react';
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

// Memoized form input component
const FormInput = memo(function FormInput({
  label,
  name,
  type = 'text',
  required,
  value,
  onChange,
  placeholder,
  ...props
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange]
  );

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        {...props}
      />
    </div>
  );
});

// Memoized textarea component
const FormTextarea = memo(function FormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
    [onChange]
  );

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
      />
    </div>
  );
});

// Memoized success view
const SuccessView = memo(function SuccessView({ message }: { message: string }) {
  return (
    <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="text-5xl mb-4 animate-bounce">✅</div>
      <h3 className="text-xl font-semibold mb-2">Quote Request Sent!</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
});

export const QuoteButton = memo(function QuoteButton({
  productId,
  productTitle,
  shopId,
  settings,
}: QuoteButtonProps) {
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

  // Memoized field updaters
  const updateField = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateEmail = useCallback((value: string) => updateField('customer_email', value), [updateField]);
  const updateName = useCallback((value: string) => updateField('customer_name', value), [updateField]);
  const updatePhone = useCallback((value: string) => updateField('customer_phone', value), [updateField]);
  const updateQuantity = useCallback((value: string) => updateField('quantity', value), [updateField]);
  const updateMessage = useCallback((value: string) => updateField('message', value), [updateField]);

  // Memoized submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      setIsSubmitting(true);

      try {
        await createQuote({
          shop_id: shopId,
          product_id: productId,
          product_title: productTitle,
          customer_email: formData.customer_email,
          customer_name: formData.customer_name || null,
          customer_phone: formData.customer_phone || null,
          quantity: formData.quantity ? parseInt(formData.quantity, 10) : null,
          message: formData.message || null,
          status: 'pending',
        });

        setIsSuccess(true);
        
        // Reset form after delay
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
    },
    [isSubmitting, shopId, productId, productTitle, formData]
  );

  // Memoized modal handlers
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  }, [isSubmitting]);

  // Memoized button style
  const buttonStyle = useMemo(
    () => ({ backgroundColor: settings.button_color }),
    [settings.button_color]
  );

  return (
    <>
      <button
        onClick={openModal}
        style={buttonStyle}
        className="px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {settings.button_text}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {isSuccess ? (
              <SuccessView message={settings.success_message} />
            ) : (
              <>
                <div className="p-6 border-b sticky top-0 bg-white rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold">{settings.form_title}</h3>
                      <p className="text-sm text-gray-500 mt-1 truncate">{productTitle}</p>
                    </div>
                    <button
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <FormInput
                    label="Email"
                    name="customer_email"
                    type="email"
                    required
                    value={formData.customer_email}
                    onChange={updateEmail}
                    placeholder="your@email.com"
                    autoComplete="email"
                  />

                  <FormInput
                    label="Name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={updateName}
                    placeholder="Your name"
                    autoComplete="name"
                  />

                  {settings.require_phone && (
                    <FormInput
                      label="Phone"
                      name="customer_phone"
                      type="tel"
                      required
                      value={formData.customer_phone}
                      onChange={updatePhone}
                      placeholder="+1 (555) 123-4567"
                      autoComplete="tel"
                    />
                  )}

                  {settings.require_quantity && (
                    <FormInput
                      label="Quantity"
                      name="quantity"
                      type="number"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={updateQuantity}
                      placeholder="How many units?"
                    />
                  )}

                  <FormTextarea
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={updateMessage}
                    placeholder="Tell us about your requirements..."
                    rows={3}
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={buttonStyle}
                    className="w-full py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export default QuoteButton;
