/**
 * Quotes API Route Tests
 * Comprehensive test coverage for /api/quotes
 */

import { GET, POST, PATCH } from '@/app/api/quotes/route';
import { NextRequest } from 'next/server';

// Mock the supabase lib
jest.mock('@/lib/supabase', () => ({
  createQuote: jest.fn(),
  getQuotes: jest.fn(),
  updateQuoteStatus: jest.fn(),
  getShopSettings: jest.fn(),
}));

// Mock email lib
jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn(),
  newQuoteEmailTemplate: jest.fn(),
  quoteStatusUpdateEmailTemplate: jest.fn(),
}));

import { createQuote, getQuotes, updateQuoteStatus, getShopSettings } from '@/lib/supabase';
import { newQuoteEmailTemplate, quoteStatusUpdateEmailTemplate } from '@//lib/email';

const mockedCreateQuote = createQuote as jest.MockedFunction<typeof createQuote>;
const mockedGetQuotes = getQuotes as jest.MockedFunction<typeof getQuotes>;
const mockedUpdateQuoteStatus = updateQuoteStatus as jest.MockedFunction<typeof updateQuoteStatus>;
const mockedGetShopSettings = getShopSettings as jest.MockedFunction<typeof getShopSettings>;

describe('GET /api/quotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return quotes for a valid shop_id', async () => {
    const mockQuotes = [
      { id: '1', product_title: 'Test Product', status: 'pending' },
      { id: '2', product_title: 'Another Product', status: 'accepted' },
    ];

    mockedGetQuotes.mockResolvedValueOnce(mockQuotes);

    const request = new NextRequest('http://localhost:3000/api/quotes?shop_id=test-shop.myshopify.com');
    const response = await GET(request);
    const body = await response.json();

    expect(mockedGetQuotes).toHaveBeenCalledWith('test-shop.myshopify.com');
    expect(body).toEqual(mockQuotes);
  });

  it('should return 400 error when shop_id is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/quotes');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Shop ID required');
  });

  it('should handle database errors gracefully', async () => {
    mockedGetQuotes.mockRejectedValueOnce(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/quotes?shop_id=test-shop.myshopify.com');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to fetch quotes');
  });

  it('should handle empty quotes array', async () => {
    mockedGetQuotes.mockResolvedValueOnce([]);

    const request = new NextRequest('http://localhost:3000/api/quotes?shop_id=test-shop.myshopify.com');
    const response = await GET(request);
    const body = await response.json();

    expect(body).toEqual([]);
  });
});

describe('POST /api/quotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validQuoteData = {
    shop_id: 'test-shop.myshopify.com',
    product_id: '12345',
    product_title: 'Test Product',
    customer_email: 'customer@example.com',
    customer_name: 'John Doe',
    customer_phone: '+1234567890',
    quantity: 5,
    message: 'Please provide a quote',
  };

  it('should create a quote successfully', async () => {
    const mockQuote = { id: 'new-quote-id', ...validQuoteData, status: 'pending' };
    mockedCreateQuote.mockResolvedValueOnce(mockQuote);
    mockedGetShopSettings.mockResolvedValueOnce({ email_notifications: false });

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify(validQuoteData),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(mockQuote);
    expect(mockedCreateQuote).toHaveBeenCalledWith({
      shop_id: validQuoteData.shop_id,
      product_id: validQuoteData.product_id,
      product_title: validQuoteData.product_title,
      customer_email: validQuoteData.customer_email,
      customer_name: validQuoteData.customer_name,
      customer_phone: validQuoteData.customer_phone,
      quantity: validQuoteData.quantity,
      message: validQuoteData.message,
      status: 'pending',
    });
  });

  it('should return 400 when required fields are missing', async () => {
    const invalidData = { shop_id: 'test-shop.myshopify.com' };

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Missing required fields');
  });

  it('should return 400 for invalid email format', async () => {
    const invalidData = {
      ...validQuoteData,
      customer_email: 'invalid-email',
    };

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid email format');
  });

  it('should handle optional fields being null', async () => {
    const minimalData = {
      shop_id: 'test-shop.myshopify.com',
      product_id: '12345',
      product_title: 'Test Product',
      customer_email: 'customer@example.com',
    };

    const mockQuote = { id: 'new-quote-id', ...minimalData, status: 'pending' };
    mockedCreateQuote.mockResolvedValueOnce(mockQuote);
    mockedGetShopSettings.mockResolvedValueOnce({ email_notifications: false });

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify(minimalData),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(mockQuote);
    expect(mockedCreateQuote).toHaveBeenCalledWith({
      shop_id: minimalData.shop_id,
      product_id: minimalData.product_id,
      product_title: minimalData.product_title,
      customer_email: minimalData.customer_email,
      customer_name: null,
      customer_phone: null,
      quantity: null,
      message: null,
      status: 'pending',
    });
  });

  it('should send email notification when enabled', async () => {
    const mockQuote = { id: 'new-quote-id', ...validQuoteData, status: 'pending' };
    mockedCreateQuote.mockResolvedValueOnce(mockQuote);
    mockedGetShopSettings.mockResolvedValueOnce({ email_notifications: true });
    (newQuoteEmailTemplate as jest.Mock).mockReturnValue({
      subject: 'New Quote Request',
      html: '<html>...',
    });

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify(validQuoteData),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(newQuoteEmailTemplate).toHaveBeenCalled();
  });

  it('should not fail if email notification fails', async () => {
    const mockQuote = { id: 'new-quote-id', ...validQuoteData, status: 'pending' };
    mockedCreateQuote.mockResolvedValueOnce(mockQuote);
    mockedGetShopSettings.mockResolvedValueOnce({ email_notifications: true });
    (newQuoteEmailTemplate as jest.Mock).mockImplementation(() => {
      throw new Error('Email service error');
    });

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify(validQuoteData),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(mockQuote);
  });

  it('should handle database errors', async () => {
    mockedCreateQuote.mockRejectedValueOnce(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'POST',
      body: JSON.stringify(validQuoteData),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to create quote');
  });

  it('should handle edge case email formats', async () => {
    const edgeCaseEmails = [
      'test+tag@example.com',
      'test.name@example.co.uk',
      '123@example.com',
      'test@sub.example.com',
    ];

    for (const email of edgeCaseEmails) {
      jest.clearAllMocks();
      const data = { ...validQuoteData, customer_email: email };
      const mockQuote = { id: 'new-quote-id', ...data, status: 'pending' };
      
      mockedCreateQuote.mockResolvedValueOnce(mockQuote);
      mockedGetShopSettings.mockResolvedValueOnce({ email_notifications: false });

      const request = new NextRequest('http://localhost:3000/api/quotes', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    }
  });
});

describe('PATCH /api/quotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update quote status successfully', async () => {
    const mockQuote = {
      id: 'quote-1',
      status: 'quoted',
      product_title: 'Test Product',
      customer_email: 'customer@example.com',
    };

    mockedUpdateQuoteStatus.mockResolvedValueOnce(mockQuote);

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'PATCH',
      body: JSON.stringify({
        id: 'quote-1',
        status: 'quoted',
        admin_notes: 'Quote sent',
        quote_amount: 1000,
      }),
    });

    const response = await PATCH(request);
    const body = await response.json();

    expect(mockedUpdateQuoteStatus).toHaveBeenCalledWith('quote-1', 'quoted', 'Quote sent', 1000);
    expect(body).toEqual(mockQuote);
  });

  it('should return 400 when id is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'quoted' }),
    });

    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Quote ID and status required');
  });

  it('should return 400 when status is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'quote-1' }),
    });

    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Quote ID and status required');
  });

  it('should return 400 for invalid status', async () => {
    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'quote-1', status: 'invalid-status' }),
    });

    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid status');
  });

  it('should accept all valid statuses', async () => {
    const validStatuses = ['pending', 'quoted', 'accepted', 'declined'];

    for (const status of validStatuses) {
      jest.clearAllMocks();
      const mockQuote = {
        id: 'quote-1',
        status,
        product_title: 'Test Product',
        customer_email: 'customer@example.com',
      };

      mockedUpdateQuoteStatus.mockResolvedValueOnce(mockQuote);

      const request = new NextRequest('http://localhost:3000/api/quotes', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'quote-1', status }),
      });

      const response = await PATCH(request);
      expect(response.status).toBe(200);
    }
  });

  it('should send status update email for quoted status', async () => {
    const mockQuote = {
      id: 'quote-1',
      status: 'quoted',
      product_title: 'Test Product',
      customer_email: 'customer@example.com',
    };

    mockedUpdateQuoteStatus.mockResolvedValueOnce(mockQuote);
    (quoteStatusUpdateEmailTemplate as jest.Mock).mockReturnValue({
      subject: 'Quote Updated',
      html: '<html>...',
    });

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'quote-1', status: 'quoted', quote_amount: 500 }),
    });

    await PATCH(request);
    expect(quoteStatusUpdateEmailTemplate).toHaveBeenCalled();
  });

  it('should send status update email for accepted status', async () => {
    const mockQuote = {
      id: 'quote-1',
      status: 'accepted',
      product_title: 'Test Product',
      customer_email: 'customer@example.com',
    };

    mockedUpdateQuoteStatus.mockResolvedValueOnce(mockQuote);
    (quoteStatusUpdateEmailTemplate as jest.Mock).mockReturnValue({
      subject: 'Quote Accepted',
      html: '<html>...',
    });

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'quote-1', status: 'accepted' }),
    });

    await PATCH(request);
    expect(quoteStatusUpdateEmailTemplate).toHaveBeenCalled();
  });

  it('should send status update email for declined status', async () => {
    const mockQuote = {
      id: 'quote-1',
      status: 'declined',
      product_title: 'Test Product',
      customer_email: 'customer@example.com',
    };

    mockedUpdateQuoteStatus.mockResolvedValueOnce(mockQuote);
    (quoteStatusUpdateEmailTemplate as jest.Mock).mockReturnValue({
      subject: 'Quote Declined',
      html: '<html>...',
    });

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'quote-1', status: 'declined' }),
    });

    await PATCH(request);
    expect(quoteStatusUpdateEmailTemplate).toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    mockedUpdateQuoteStatus.mockRejectedValueOnce(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'quote-1', status: 'quoted' }),
    });

    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to update quote');
  });

  it('should handle optional admin_notes and quote_amount', async () => {
    const mockQuote = {
      id: 'quote-1',
      status: 'quoted',
      product_title: 'Test Product',
      customer_email: 'customer@example.com',
    };

    mockedUpdateQuoteStatus.mockResolvedValueOnce(mockQuote);

    const request = new NextRequest('http://localhost:3000/api/quotes', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'quote-1', status: 'quoted' }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(200);
    expect(mockedUpdateQuoteStatus).toHaveBeenCalledWith('quote-1', 'quoted', undefined, undefined);
  });
});
