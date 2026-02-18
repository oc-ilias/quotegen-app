/**
 * Shopify Webhook API Route Tests
 * Comprehensive test coverage for /api/webhooks/shopify
 */

import { GET, POST } from '@/app/api/webhooks/shopify/route';
import { NextRequest } from 'next/server';

// Mock the shopify lib
jest.mock('@/lib/shopify', () => ({
  verifyShopifyWebhook: jest.fn(),
  generateInstallUrl: jest.fn(),
}));

import { verifyShopifyWebhook, generateInstallUrl } from '@/lib/shopify';

const mockedVerifyWebhook = verifyShopifyWebhook as jest.MockedFunction<typeof verifyShopifyWebhook>;
const mockedGenerateInstallUrl = generateInstallUrl as jest.MockedFunction<typeof generateInstallUrl>;

describe('POST /api/webhooks/shopify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle app/uninstalled webhook', async () => {
    mockedVerifyWebhook.mockReturnValueOnce(true);

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
      method: 'POST',
      body: JSON.stringify({ id: 'shop-123' }),
      headers: {
        'X-Shopify-Hmac-Sha256': 'valid-hmac',
        'X-Shopify-Topic': 'app/uninstalled',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(mockedVerifyWebhook).toHaveBeenCalled();
    expect(body.success).toBe(true);
  });

  it('should handle products/create webhook', async () => {
    mockedVerifyWebhook.mockReturnValueOnce(true);

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
      method: 'POST',
      body: JSON.stringify({ id: 'product-123', title: 'Test Product' }),
      headers: {
        'X-Shopify-Hmac-Sha256': 'valid-hmac',
        'X-Shopify-Topic': 'products/create',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should handle products/update webhook', async () => {
    mockedVerifyWebhook.mockReturnValueOnce(true);

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
      method: 'POST',
      body: JSON.stringify({ id: 'product-123', title: 'Updated Product' }),
      headers: {
        'X-Shopify-Hmac-Sha256': 'valid-hmac',
        'X-Shopify-Topic': 'products/update',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should handle orders/create webhook', async () => {
    mockedVerifyWebhook.mockReturnValueOnce(true);

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
      method: 'POST',
      body: JSON.stringify({ id: 'order-123', total: 100 }),
      headers: {
        'X-Shopify-Hmac-Sha256': 'valid-hmac',
        'X-Shopify-Topic': 'orders/create',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should handle unhandled webhook topics gracefully', async () => {
    mockedVerifyWebhook.mockReturnValueOnce(true);

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
      method: 'POST',
      body: JSON.stringify({ id: 'unknown-123' }),
      headers: {
        'X-Shopify-Hmac-Sha256': 'valid-hmac',
        'X-Shopify-Topic': 'unknown/topic',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should reject requests with invalid signature', async () => {
    mockedVerifyWebhook.mockReturnValueOnce(false);

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
      method: 'POST',
      body: JSON.stringify({ id: 'shop-123' }),
      headers: {
        'X-Shopify-Hmac-Sha256': 'invalid-hmac',
        'X-Shopify-Topic': 'app/uninstalled',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Invalid signature');
  });

  it('should handle missing HMAC header', async () => {
    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
      method: 'POST',
      body: JSON.stringify({ id: 'shop-123' }),
      headers: {
        'X-Shopify-Topic': 'app/uninstalled',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should handle missing topic header', async () => {
    mockedVerifyWebhook.mockReturnValueOnce(true);

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
      method: 'POST',
      body: JSON.stringify({ id: 'shop-123' }),
      headers: {
        'X-Shopify-Hmac-Sha256': 'valid-hmac',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should handle missing shop domain header', async () => {
    mockedVerifyWebhook.mockReturnValueOnce(true);

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
      method: 'POST',
      body: JSON.stringify({ id: 'shop-123' }),
      headers: {
        'X-Shopify-Hmac-Sha256': 'valid-hmac',
        'X-Shopify-Topic': 'app/uninstalled',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });

  it('should handle invalid JSON body', async () => {
    mockedVerifyWebhook.mockReturnValueOnce(true);

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
      method: 'POST',
      body: 'invalid-json',
      headers: {
        'X-Shopify-Hmac-Sha256': 'valid-hmac',
        'X-Shopify-Topic': 'app/uninstalled',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Webhook processing failed');
  });

  it('should handle webhook processing errors', async () => {
    mockedVerifyWebhook.mockImplementationOnce(() => {
      throw new Error('Verification error');
    });

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
      method: 'POST',
      body: JSON.stringify({ id: 'shop-123' }),
      headers: {
        'X-Shopify-Hmac-Sha256': 'valid-hmac',
        'X-Shopify-Topic': 'app/uninstalled',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Webhook processing failed');
  });

  it('should handle empty webhook body', async () => {
    mockedVerifyWebhook.mockReturnValueOnce(true);

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify', {
      method: 'POST',
      body: '',
      headers: {
        'X-Shopify-Hmac-Sha256': 'valid-hmac',
        'X-Shopify-Topic': 'app/uninstalled',
        'X-Shopify-Shop-Domain': 'test-shop.myshopify.com',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
  });
});

describe('GET /api/webhooks/shopify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to install URL for valid shop', async () => {
    const installUrl = 'https://test-shop.myshopify.com/admin/oauth/authorize?client_id=test&scope=read_products';
    mockedGenerateInstallUrl.mockReturnValueOnce(installUrl);

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify?shop=test-shop.myshopify.com');
    const response = await GET(request);

    expect(mockedGenerateInstallUrl).toHaveBeenCalledWith('test-shop.myshopify.com');
    expect(response.status).toBe(307);
  });

  it('should return 400 when shop parameter is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Shop parameter required');
  });

  it('should return 400 for invalid shop domain format', async () => {
    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify?shop=invalid-shop.com');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid shop domain');
  });

  it('should reject shop without .myshopify.com suffix', async () => {
    const invalidDomains = [
      'test-shop.com',
      'test-shop.shopify.com',
      'test-shop',
      'localhost',
      '',
    ];

    for (const domain of invalidDomains) {
      jest.clearAllMocks();
      const request = new NextRequest(`http://localhost:3000/api/webhooks/shopify?shop=${domain}`);
      const response = await GET(request);

      expect(response.status).toBe(400);
    }
  });

  it('should accept valid myshopify.com domains', async () => {
    const validDomains = [
      'test-shop.myshopify.com',
      'my-store.myshopify.com',
      'shop-123.myshopify.com',
    ];

    for (const domain of validDomains) {
      jest.clearAllMocks();
      const installUrl = `https://${domain}/admin/oauth/authorize`;
      mockedGenerateInstallUrl.mockReturnValueOnce(installUrl);

      const request = new NextRequest(`http://localhost:3000/api/webhooks/shopify?shop=${domain}`);
      const response = await GET(request);

      expect(response.status).toBe(307);
    }
  });

  it('should handle generateInstallUrl errors', async () => {
    mockedGenerateInstallUrl.mockImplementationOnce(() => {
      throw new Error('URL generation failed');
    });

    const request = new NextRequest('http://localhost:3000/api/webhooks/shopify?shop=test-shop.myshopify.com');
    
    await expect(GET(request)).rejects.toThrow('URL generation failed');
  });
});
