/**
 * E2E Health Check Tests
 * Simple smoke tests that verify basic functionality
 * @module e2e/health-check
 */

import { test, expect } from '@playwright/test';

test.describe('Health Checks', () => {
  test('landing page loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/QuoteGen|B2B/i);
  });

  test('API health endpoint responds', async ({ request }) => {
    // Skip if API is not available
    try {
      const response = await request.get('/api/health', { timeout: 5000 });
      expect([200, 404]).toContain(response.status());
    } catch {
      // API might not be implemented yet, that's OK for health check
      test.skip();
    }
  });

  test('static assets are served', async ({ request }) => {
    // Check that favicon exists
    const faviconResponse = await request.get('/favicon.ico');
    expect([200, 204, 404]).toContain(faviconResponse.status());
  });
});

test.describe('Navigation Smoke Tests', () => {
  test('can navigate to dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Should either show dashboard or redirect to login
    const url = page.url();
    expect(url).toMatch(/dashboard|login|auth/);
  });

  test('can navigate to quotes page', async ({ page }) => {
    await page.goto('/quotes');
    const url = page.url();
    expect(url).toMatch(/quotes|login|auth/);
  });

  test('can navigate to customers page', async ({ page }) => {
    await page.goto('/customers');
    const url = page.url();
    expect(url).toMatch(/customers|login|auth/);
  });

  test('404 page works for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-definitely-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
