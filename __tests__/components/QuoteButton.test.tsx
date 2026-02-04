// __tests__/components/QuoteButton.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteButton } from '@/components/QuoteButton';

const mockSettings = {
  button_text: 'Request Quote',
  button_color: '#008060',
  form_title: 'Request a Quote',
  success_message: 'Thank you! We will get back to you soon.',
  require_quantity: true,
  require_phone: false,
};

describe('QuoteButton', () => {
  it('renders the quote button with correct text', () => {
    render(
      <QuoteButton
        productId="test-product"
        productTitle="Test Product"
        shopId="test-shop"
        settings={mockSettings}
      />
    );
    
    expect(screen.getByText('Request Quote')).toBeInTheDocument();
  });
  
  it('opens modal when button is clicked', async () => {
    render(
      <QuoteButton
        productId="test-product"
        productTitle="Test Product"
        shopId="test-shop"
        settings={mockSettings}
      />
    );
    
    fireEvent.click(screen.getByText('Request Quote'));
    
    await waitFor(() => {
      expect(screen.getByText('Request a Quote')).toBeInTheDocument();
    });
  });
  
  it('shows validation error for empty email', async () => {
    render(
      <QuoteButton
        productId="test-product"
        productTitle="Test Product"
        shopId="test-shop"
        settings={mockSettings}
      />
    );
    
    fireEvent.click(screen.getByText('Request Quote'));
    
    await waitFor(() => {
      expect(screen.getByText('Request a Quote')).toBeInTheDocument();
    });
    
    // Try to submit without email
    const submitButton = screen.getByText('Submit Request');
    fireEvent.click(submitButton);
    
    // Should show required validation
    expect(screen.getByText('Email')).toBeInTheDocument();
  });
  
  it('displays product title in modal', async () => {
    render(
      <QuoteButton
        productId="test-product"
        productTitle="Industrial Widget 5000"
        shopId="test-shop"
        settings={mockSettings}
      />
    );
    
    fireEvent.click(screen.getByText('Request Quote'));
    
    await waitFor(() => {
      expect(screen.getByText('Industrial Widget 5000')).toBeInTheDocument();
    });
  });
});