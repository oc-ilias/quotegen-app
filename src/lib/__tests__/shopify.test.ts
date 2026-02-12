/**
 * Unit Tests for Shopify Integration
 * @module lib/__tests__/shopify.test
 */

import {
  verifyShopifyWebhook,
  verifyShopifyAuth,
  generateInstallUrl,
  isValidShopDomain,
  getShopifyGraphqlUrl,
  getShopifyRestUrl,
} from '@/lib/shopify';

// Mock crypto module
jest.mock('crypto', () => ({
  createHmac: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => 'mocked-hash'),
    })),
  })),
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mocked-nonce'),
  })),
  timingSafeEqual: jest.fn((a: Buffer, b: Buffer) => {
    return a.toString() === b.toString();
  }),
}));

describe('Shopify Integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('verifyShopifyWebhook', () => {
    it('should return false when SHOPIFY_API_SECRET is not set', () => {
      delete process.env.SHOPIFY_API_SECRET;

      const result = verifyShopifyWebhook('raw-body', 'hmac-header');

      expect(result).toBe(false);
    });

    it('should return false when SHOPIFY_API_SECRET is empty', () => {
      process.env.SHOPIFY_API_SECRET = '';

      const result = verifyShopifyWebhook('raw-body', 'hmac-header');

      expect(result).toBe(false);
    });

    it('should verify webhook with valid signature', () => {
      process.env.SHOPIFY_API_SECRET = 'test-secret';
      
      const crypto = require('crypto');
      crypto.timingSafeEqual.mockReturnValue(true);

      const result = verifyShopifyWebhook('raw-body', 'valid-hmac');

      expect(crypto.createHmac).toHaveBeenCalledWith('sha256', 'test-secret');
      expect(result).toBe(true);
    });

    it('should reject webhook with invalid signature', () => {
      process.env.SHOPIFY_API_SECRET = 'test-secret';
      
      const crypto = require('crypto');
      crypto.timingSafeEqual.mockReturnValue(false);

      const result = verifyShopifyWebhook('raw-body', 'invalid-hmac');

      expect(result).toBe(false);
    });

    it('should handle empty raw body', () => {
      process.env.SHOPIFY_API_SECRET = 'test-secret';

      const result = verifyShopifyWebhook('', 'hmac');

      expect(result).toBeDefined();
    });

    it('should handle empty HMAC header', () => {
      process.env.SHOPIFY_API_SECRET = 'test-secret';

      const result = verifyShopifyWebhook('body', '');

      expect(result).toBeDefined();
    });
  });

  describe('verifyShopifyAuth', () => {
    it('should exchange code for access token successfully', async () => {
      process.env.SHOPIFY_API_KEY = 'test-api-key';
      process.env.SHOPIFY_API_SECRET = 'test-api-secret';

      const mockResponse = {
        access_token: 'test-access-token',
        scope: 'read_products,write_products',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await verifyShopifyAuth('test-shop.myshopify.com', 'auth-code-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-shop.myshopify.com/admin/oauth/access_token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: 'test-api-key',
            client_secret: 'test-api-secret',
            code: 'auth-code-123',
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when API request fails', async () => {
      process.env.SHOPIFY_API_KEY = 'test-api-key';
      process.env.SHOPIFY_API_SECRET = 'test-api-secret';

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(
        verifyShopifyAuth('test-shop.myshopify.com', 'invalid-code')
      ).rejects.toThrow('Failed to get access token');
    });

    it('should throw error when network fails', async () => {
      process.env.SHOPIFY_API_KEY = 'test-api-key';
      process.env.SHOPIFY_API_SECRET = 'test-api-secret';

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        verifyShopifyAuth('test-shop.myshopify.com', 'auth-code')
      ).rejects.toThrow('Network error');
    });

    it('should handle missing environment variables', async () => {
      delete process.env.SHOPIFY_API_KEY;
      delete process.env.SHOPIFY_API_SECRET;

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ access_token: 'token', scope: 'read' }),
      });

      await expect(
        verifyShopifyAuth('test-shop.myshopify.com', 'auth-code')
      ).resolves.toBeDefined();
    });
  });

  describe('generateInstallUrl', () => {
    it('should generate correct install URL', () => {
      process.env.SHOPIFY_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_APP_URL = 'https://app.quotegen.app';

      const result = generateInstallUrl('test-shop.myshopify.com');

      expect(result).toContain('https://test-shop.myshopify.com/admin/oauth/authorize');
      expect(result).toContain('client_id=test-api-key');
      expect(result).toContain('scope=read_products,write_products,read_orders,read_customers');
      expect(result).toContain('redirect_uri=https://app.quotegen.app/api/auth/callback');
      expect(result).toContain('state=mocked-nonce');
    });

    it('should include required OAuth scopes', () => {
      process.env.SHOPIFY_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_APP_URL = 'https://app.quotegen.app';

      const result = generateInstallUrl('test-shop.myshopify.com');

      expect(result).toContain('read_products');
      expect(result).toContain('write_products');
      expect(result).toContain('read_orders');
      expect(result).toContain('read_customers');
    });

    it('should generate unique nonce for each call', () => {
      process.env.SHOPIFY_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_APP_URL = 'https://app.quotegen.app';

      const crypto = require('crypto');
      crypto.randomBytes.mockReturnValueOnce({ toString: () => 'nonce-1' });
      const result1 = generateInstallUrl('test-shop.myshopify.com');

      crypto.randomBytes.mockReturnValueOnce({ toString: () => 'nonce-2' });
      const result2 = generateInstallUrl('test-shop.myshopify.com');

      expect(result1).not.toBe(result2);
      expect(result1).toContain('nonce-1');
      expect(result2).toContain('nonce-2');
    });

    it('should handle shop domain without .myshopify.com', () => {
      process.env.SHOPIFY_API_KEY = 'test-api-key';
      process.env.NEXT_PUBLIC_APP_URL = 'https://app.quotegen.app';

      const result = generateInstallUrl('test-shop');

      expect(result).toContain('https://test-shop/admin/oauth/authorize');
    });
  });

  describe('isValidShopDomain', () => {
    it('should return true for valid shop domain', () => {
      expect(isValidShopDomain('test-shop.myshopify.com')).toBe(true);
      expect(isValidShopDomain('my-store.myshopify.com')).toBe(true);
      expect(isValidShopDomain('shop123.myshopify.com')).toBe(true);
    });

    it('should return true for domain with hyphens', () => {
      expect(isValidShopDomain('my-awesome-shop.myshopify.com')).toBe(true);
      expect(isValidShopDomain('test-shop-name.myshopify.com')).toBe(true);
    });

    it('should return false for domain without .myshopify.com', () => {
      expect(isValidShopDomain('test-shop.com')).toBe(false);
      expect(isValidShopDomain('test-shop')).toBe(false);
      expect(isValidShopDomain('example.com')).toBe(false);
    });

    it('should return false for domain starting with hyphen', () => {
      expect(isValidShopDomain('-testshop.myshopify.com')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidShopDomain('')).toBe(false);
    });

    it('should return false for domain with special characters', () => {
      expect(isValidShopDomain('test@shop.myshopify.com')).toBe(false);
      expect(isValidShopDomain('test_shop.myshopify.com')).toBe(false);
      expect(isValidShopDomain('test.shop.myshopify.com')).toBe(false);
    });

    it('should return false for subdomain of myshopify.com', () => {
      expect(isValidShopDomain('sub.test.myshopify.com')).toBe(false);
    });

    it('should return true for single character subdomain', () => {
      expect(isValidShopDomain('a.myshopify.com')).toBe(true);
    });

    it('should return true for alphanumeric domain', () => {
      expect(isValidShopDomain('shop123abc.myshopify.com')).toBe(true);
      expect(isValidShopDomain('123shop.myshopify.com')).toBe(true);
    });
  });

  describe('getShopifyGraphqlUrl', () => {
    it('should return correct GraphQL URL', () => {
      const result = getShopifyGraphqlUrl('test-shop.myshopify.com');

      expect(result).toBe('https://test-shop.myshopify.com/admin/api/2024-01/graphql.json');
    });

    it('should handle shop domain without .myshopify.com', () => {
      const result = getShopifyGraphqlUrl('test-shop');

      expect(result).toBe('https://test-shop/admin/api/2024-01/graphql.json');
    });

    it('should include correct API version', () => {
      const result = getShopifyGraphqlUrl('test-shop.myshopify.com');

      expect(result).toContain('2024-01');
    });
  });

  describe('getShopifyRestUrl', () => {
    it('should return correct REST URL with leading slash', () => {
      const result = getShopifyRestUrl('test-shop.myshopify.com', '/products.json');

      expect(result).toBe('https://test-shop.myshopify.com/admin/api/2024-01/products.json');
    });

    it('should return correct REST URL without leading slash', () => {
      const result = getShopifyRestUrl('test-shop.myshopify.com', 'products.json');

      expect(result).toBe('https://test-shop.myshopify.com/admin/api/2024-01/products.json');
    });

    it('should handle nested endpoint paths', () => {
      const result = getShopifyRestUrl('test-shop.myshopify.com', 'products/123/variants.json');

      expect(result).toBe('https://test-shop.myshopify.com/admin/api/2024-01/products/123/variants.json');
    });

    it('should handle shop domain without .myshopify.com', () => {
      const result = getShopifyRestUrl('test-shop', 'orders.json');

      expect(result).toBe('https://test-shop/admin/api/2024-01/orders.json');
    });

    it('should include correct API version', () => {
      const result = getShopifyRestUrl('test-shop.myshopify.com', 'shop.json');

      expect(result).toContain('2024-01');
    });

    it('should handle empty endpoint', () => {
      const result = getShopifyRestUrl('test-shop.myshopify.com', '');

      expect(result).toBe('https://test-shop.myshopify.com/admin/api/2024-01/');
    });

    it('should handle endpoint with query parameters', () => {
      const result = getShopifyRestUrl('test-shop.myshopify.com', 'products.json?limit=50');

      expect(result).toBe('https://test-shop.myshopify.com/admin/api/2024-01/products.json?limit=50');
    });
  });
});
