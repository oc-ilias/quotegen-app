/**
 * Quote Button Component (Accessibility Enhanced)
 * Accessible quote request button with modal form
 * @module components/QuoteButton
 */

'use client';

import React, { useState, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { createQuote } from '@/lib/supabase';
import { useLiveAnnouncer } from '@/components/accessibility/LiveAnnouncer';
import { FocusTrap } from '@/components/accessibility/FocusTrap';
import { VisuallyHidden } from '@/components/accessibility/VisuallyHidden';
import { cn } from '@/lib/utils';

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

interface FormErrors {
  customer_email?: string;
  customer_phone?: string;
  quantity?: string;
}

export function QuoteButton({ productId, productTitle, shopId, settings }: QuoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { announce } = useLiveAnnouncer();
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    customer_email: '',
    customer_name: '',
    customer_phone: '',
    quantity: '',
    message: '',
  });

  // Generate unique IDs for form fields
  const emailId = useId();
  const nameId = useId();
  const phoneId = useId();
  const quantityId = useId();
  const messageId = useId();
  const errorId = useId();

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.customer_email) {
      newErrors.customer_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Please enter a valid email address';
    }

    // Phone validation
    if (settings.require_phone && !formData.customer_phone) {
      newErrors.customer_phone = 'Phone number is required';
    }

    // Quantity validation
    if (settings.require_quantity && !formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (formData.quantity && parseInt(formData.quantity) < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    setErrors(newErrors);

    // Announce errors to screen readers
    const errorMessages = Object.values(newErrors);
    if (errorMessages.length > 0) {
      announce(`Form has ${errorMessages.length} error${errorMessages.length > 1 ? 's' : ''}: ${errorMessages.join(', ')}`, 'assertive');
    }

    return errorMessages.length === 0;
  }, [formData, settings, announce]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus first error field
      const firstErrorField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
      firstErrorField?.focus();
      return;
    }

    setIsSubmitting(true);
    announce('Submitting quote request...', 'polite');

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
      announce(`Quote request sent successfully. ${settings.success_message}`, 'polite');

      // Auto-close after showing success
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
        setErrors({});
      }, 3000);
    } catch (error) {
      console.error('Error submitting quote:', error);
      announce('Error submitting quote request. Please try again.', 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsSuccess(false);
    setErrors({});
    announce('Quote form closed', 'polite');
  }, [announce]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    announce(`${settings.form_title} form opened for ${productTitle}`, 'polite');
  }, [announce, settings.form_title, productTitle]);

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <FocusTrap isActive={isOpen} onEscape={handleClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-form-title"
          className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {isSuccess ? (
            <div className="p-8 text-center" role="alert" aria-live="polite">
              <div className="text-5xl mb-4" aria-hidden="true">✅</div>
              <h3 id="quote-form-title" className="text-xl font-semibold mb-2">
                Quote Request Sent!
              </h3>
              <p className="text-gray-600">{settings.success_message}</p>
              <VisuallyHidden>You can close this dialog now.</VisuallyHidden>
            </div>
          ) : (
            <>
              <header className="p-6 border-b flex justify-between items-center">
                <div>
                  <h3 id="quote-form-title" className="text-xl font-semibold">
                    {settings.form_title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{productTitle}</p>
                </div>
                <button
                  onClick={handleClose}
                  className={cn(
                    'text-gray-400 hover:text-gray-600 p-2 rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  )}
                  aria-label="Close quote form"
                  type="button"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </header>

              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="p-6 space-y-4"
                noValidate
              >
                {/* Email Field */}
                <div>
                  <label htmlFor={emailId} className="block text-sm font-medium mb-1">
                    Email
                    <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                    <VisuallyHidden> (required)</VisuallyHidden>
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_email: e.target.value })
                    }
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      errors.customer_email && 'border-red-500 focus:ring-red-500'
                    )}
                    placeholder="your@email.com"
                    aria-required="true"
                    aria-invalid={errors.customer_email ? 'true' : 'false'}
                    aria-describedby={errors.customer_email ? `${errorId}-email` : undefined}
                  />
                  {errors.customer_email && (
                    <p id={`${errorId}-email`} className="mt-1 text-sm text-red-600" role="alert">
                      {errors.customer_email}
                    </p>
                  )}
                </div>

                {/* Name Field */}
                <div>
                  <label htmlFor={nameId} className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    id={nameId}
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>

                {/* Phone Field */}
                {settings.require_phone && (
                  <div>
                    <label htmlFor={phoneId} className="block text-sm font-medium mb-1">
                      Phone
                      <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                      <VisuallyHidden> (required)</VisuallyHidden>
                    </label>
                    <input
                      id={phoneId}
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_phone: e.target.value })
                      }
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                        errors.customer_phone && 'border-red-500 focus:ring-red-500'
                      )}
                      placeholder="+1 (555) 123-4567"
                      aria-required="true"
                      aria-invalid={errors.customer_phone ? 'true' : 'false'}
                      aria-describedby={errors.customer_phone ? `${errorId}-phone` : undefined}
                    />
                    {errors.customer_phone && (
                      <p id={`${errorId}-phone`} className="mt-1 text-sm text-red-600" role="alert">
                        {errors.customer_phone}
                      </p>
                    )}
                  </div>
                )}

                {/* Quantity Field */}
                {settings.require_quantity && (
                  <div>
                    <label htmlFor={quantityId} className="block text-sm font-medium mb-1">
                      Quantity
                      <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                      <VisuallyHidden> (required)</VisuallyHidden>
                    </label>
                    <input
                      id={quantityId}
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                        errors.quantity && 'border-red-500 focus:ring-red-500'
                      )}
                      placeholder="How many units?"
                      aria-required="true"
                      aria-invalid={errors.quantity ? 'true' : 'false'}
                      aria-describedby={errors.quantity ? `${errorId}-qty` : undefined}
                    />
                    {errors.quantity && (
                      <p id={`${errorId}-qty`} className="mt-1 text-sm text-red-600" role="alert">
                        {errors.quantity}
                      </p>
                    )}
                  </div>
                )}

                {/* Message Field */}
                <div>
                  <label htmlFor={messageId} className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <textarea
                    id={messageId}
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about your requirements..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: settings.button_color }}
                  className={cn(
                    'w-full py-3 text-white font-semibold rounded-lg hover:opacity-90',
                    'transition disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  )}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="sr-only">Submitting... Please wait.</span>
                      <span aria-hidden="true">Sending...</span>
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </FocusTrap>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={handleOpen}
        style={{ backgroundColor: settings.button_color }}
        className={cn(
          'px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90',
          'transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        type="button"
      >
        {settings.button_text}
      </button>

      {/* Render modal using portal */}
      {typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : modalContent}
    </>
  );
}

export default QuoteButton;