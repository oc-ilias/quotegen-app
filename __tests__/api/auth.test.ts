/**
 * API Integration Tests - Auth Routes
 * @module __tests__/api/auth
 */

// Mock next/server before importing the route
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: any, init?: ResponseInit) => ({
      status: init?.status || 200,
      headers: new Headers(init?.headers),
      json: async () => body,
      text: async () => JSON.stringify(body),
    })),
    redirect: jest.fn((url: string) => ({
      status: 302,
      headers: new Headers({ Location: url }),
    })),
  },
  NextRequest: class MockNextRequest {
    url: string;
    method: string;
    headers: Headers;
    nextUrl: URL;

    constructor(input: string | Request) {
      if (typeof input === 'string') {
        this.url = input;
        this.nextUrl = new URL(input);
      } else {
        this.url = input.url;
        this.nextUrl = new URL(input.url);
      }
      this.method = 'GET';
      this.headers = new Headers();
    }
  },
}));

import { GET } from '@/app/api/auth/callback/route';
import { NextResponse } from 'next/server';

describe('Auth Callback API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/callback', () => {
    it('should redirect to dashboard with valid params', async () => {
      const request = new Request('http://localhost/api/auth/callback?shop=test-shop.myshopify.com&code=auth-code-123');
      const response = await GET(request as any);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('/dashboard');
    });

    it('should handle missing code parameter', async () => {
      const request = new Request('http://localhost/api/auth/callback?shop=test-shop.myshopify.com');
      const response = await GET(request as any);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) }),
        { status: 400 }
      );
    });

    it('should handle missing shop parameter', async () => {
      const request = new Request('http://localhost/api/auth/callback?code=auth-code-123');
      const response = await GET(request as any);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) }),
        { status: 400 }
      );
    });

    it('should handle errors gracefully', async () => {
      // Create a request that will cause an error
      const request = new Request('invalid-url');
      
      try {
        await GET(request as any);
      } catch (error) {
        // Expected to potentially throw
      }
      
      // The catch block should call NextResponse.json with error
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) }),
        { status: 500 }
      );
    });
  });
});
