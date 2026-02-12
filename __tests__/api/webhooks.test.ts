/**
 * API Integration Tests - Webhooks Route
 * @module __tests__/api/webhooks
 */

import { POST } from '@/app/api/webhooks/shopify/route';
import { supabase } from '@/lib/supabase';
import { verifyShopifyWebhook } from '@/lib/shopify';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock Shopify module
jest.mock('@/lib/shopify', () => ({
  verifyShopifyWebhook: jest.fn(),
  generateInstallUrl: jest.fn(),
}));

describe('Shopify Webhooks API', () => {
  const mockWebhookPayload = {
    id: 12345,
    email: 'customer@example.com',
    line_items: [
      {
        product_id: 67890,
        title: 'Test Product',
        quantity: 2,
        price: '99.99',
      },
    ],
    total_price: '199.98',
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SHOPIFY_API_SECRET = 'test-secret';
  });

  describe('POST /api/webhooks/shopify', () => {
    it('should process order created webhook', async () => {
      (verifyShopifyWebhook as jest.Mock).mockReturnValue(true);

      const request = new Request('http://localhost/api/webhooks/shopify', {
        method: 'POST',
        headers: {
          'X-Shopify-Topic': 'orders/create',
          'X-Shopify-Hmac-Sha256': 'valid-signature',
        },
        body: JSON.stringify(mockWebhookPayload),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should reject invalid signature', async () => {
      (verifyShopifyWebhook as jest.Mock).mockReturnValue(false);

      const request = new Request('http://localhost/api/webhooks/shopify', {
        method: 'POST',
        headers: {
          'X-Shopify-Topic': 'orders/create',
          'X-Shopify-Hmac-SHA256': 'invalid-signature',
        },
        body: JSON.stringify(mockWebhookPayload),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toContain('Invalid signature');
    });

    it('should handle missing webhook secret', async () => {
      delete process.env.SHOPIFY_API_SECRET;
      (verifyShopifyWebhook as jest.Mock).mockReturnValue(false);

      const request = new Request('http://localhost/api/webhooks/shopify', {
        method: 'POST',
        headers: {
          'X-Shopify-Topic': 'orders/create',
          'X-Shopify-Hmac-SHA256': 'some-signature',
        },
        body: JSON.stringify(mockWebhookPayload),
      });

      const response = await POST(request);

      // When secret is missing, verifyShopifyWebhook returns false, causing 401
      expect(response.status).toBe(401);
    });

    it('should process order updated webhook', async () => {
      (verifyShopifyWebhook as jest.Mock).mockReturnValue(true);

      const request = new Request('http://localhost/api/webhooks/shopify', {
        method: 'POST',
        headers: {
          'X-Shopify-Topic': 'orders/updated',
          'X-Shopify-Hmac-Sha256': 'valid-signature',
        },
        body: JSON.stringify({ ...mockWebhookPayload, id: 12345 }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle unsupported webhook topics', async () => {
      (verifyShopifyWebhook as jest.Mock).mockReturnValue(true);

      const request = new Request('http://localhost/api/webhooks/shopify', {
        method: 'POST',
        headers: {
          'X-Shopify-Topic': 'products/create',
          'X-Shopify-Hmac-Sha256': 'valid-signature',
        },
        body: JSON.stringify(mockWebhookPayload),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });
});
