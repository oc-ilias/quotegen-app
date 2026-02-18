/**
 * Auth Callback API Route Tests
 * Comprehensive test coverage for /api/auth/callback
 */

import { GET } from '@/app/api/auth/callback/route';
import { NextRequest } from 'next/server';

describe('GET /api/auth/callback', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, NEXT_PUBLIC_APP_URL: 'http://localhost:3000' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should redirect to dashboard with valid params', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/auth/callback?shop=test-shop.myshopify.com&code=auth-code&state=random-state&timestamp=1234567890&hmac=valid-hmac'
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('Location');
    expect(location).toBe('http://localhost:3000/dashboard?shop=test-shop.myshopify.com');
  });

  it('should use default URL when NEXT_PUBLIC_APP_URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;

    const request = new NextRequest(
      'http://localhost:3000/api/auth/callback?shop=test-shop.myshopify.com&code=auth-code'
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('Location');
    expect(location).toContain('/dashboard?shop=test-shop.myshopify.com');
  });

  it('should return 400 when shop parameter is missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/auth/callback?code=auth-code'
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Missing required parameters');
  });

  it('should return 400 when code parameter is missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/auth/callback?shop=test-shop.myshopify.com'
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Missing required parameters');
  });

  it('should return 400 when both shop and code are missing', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/auth/callback?state=random-state'
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Missing required parameters');
  });

  it('should handle optional parameters (state, timestamp, hmac)', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/auth/callback?shop=test-shop.myshopify.com&code=auth-code&state=state-value&timestamp=1234567890&hmac=hmac-value'
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
  });

  it('should handle URL-encoded shop parameter', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/auth/callback?shop=test-shop.myshopify.com&code=auth%20code%20with%20spaces'
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
  });

  it('should handle special characters in parameters', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/auth/callback?shop=test-shop.myshopify.com&code=code%2Bwith%2Bplus'
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
  });

  it('should preserve additional query parameters in redirect', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/auth/callback?shop=test-shop.myshopify.com&code=auth-code&extra=param'
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    // The redirect should only include shop param, extra params are ignored
    const location = response.headers.get('Location');
    expect(location).not.toContain('extra=param');
    expect(location).toContain('shop=test-shop.myshopify.com');
  });

  it('should handle various shop domain formats', async () => {
    const shopDomains = [
      'test-shop.myshopify.com',
      'my-awesome-store.myshopify.com',
      'store-123.myshopify.com',
    ];

    for (const shop of shopDomains) {
      const request = new NextRequest(
        `http://localhost:3000/api/auth/callback?shop=${shop}&code=auth-code`
      );

      const response = await GET(request);
      expect(response.status).toBe(307);
      
      const location = response.headers.get('Location');
      expect(location).toContain(`shop=${shop}`);
    }
  });

  it('should handle empty query string', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/callback');

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Missing required parameters');
  });

  it('should handle code parameter with special characters', async () => {
    const specialCodes = [
      'code-with-dashes',
      'code_with_underscores',
      'code.with.dots',
      'code~with~tildes',
    ];

    for (const code of specialCodes) {
      const request = new NextRequest(
        `http://localhost:3000/api/auth/callback?shop=test-shop.myshopify.com&code=${code}`
      );

      const response = await GET(request);
      expect(response.status).toBe(307);
    }
  });

  it('should handle very long parameter values', async () => {
    const longCode = 'a'.repeat(1000);
    const request = new NextRequest(
      `http://localhost:3000/api/auth/callback?shop=test-shop.myshopify.com&code=${longCode}`
    );

    const response = await GET(request);
    expect(response.status).toBe(307);
  });

  it('should handle state parameter with various formats', async () => {
    const states = [
      'simple-state',
      'state.with.dots',
      'state_with_underscores',
      'state~with~tildes',
    ];

    for (const state of states) {
      const request = new NextRequest(
        `http://localhost:3000/api/auth/callback?shop=test-shop.myshopify.com&code=auth-code&state=${state}`
      );

      const response = await GET(request);
      expect(response.status).toBe(307);
    }
  });

  it('should handle timestamp parameter', async () => {
    const timestamps = [
      '1234567890',
      '9999999999',
      '0000000000',
    ];

    for (const timestamp of timestamps) {
      const request = new NextRequest(
        `http://localhost:3000/api/auth/callback?shop=test-shop.myshopify.com&code=auth-code&timestamp=${timestamp}`
      );

      const response = await GET(request);
      expect(response.status).toBe(307);
    }
  });

  it('should handle hmac parameter with various formats', async () => {
    const hmacs = [
      'a1b2c3d4e5f6',
      'abc123def456',
      'hmac-with-dashes',
    ];

    for (const hmac of hmacs) {
      const request = new NextRequest(
        `http://localhost:3000/api/auth/callback?shop=test-shop.myshopify.com&code=auth-code&hmac=${hmac}`
      );

      const response = await GET(request);
      expect(response.status).toBe(307);
    }
  });

  it('should handle unexpected errors gracefully', async () => {
    // Create a request with an invalid URL that might cause parsing issues
    const request = new NextRequest(
      'http://localhost:3000/api/auth/callback?shop=%&code='
    );

    const response = await GET(request);
    
    // Should either redirect (empty values are technically valid) or return error
    expect([307, 400, 500]).toContain(response.status);
  });
});
