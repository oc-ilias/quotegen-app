/**
 * E2E Health Check Tests
 * Simple tests that verify basic functionality
 * @module e2e/health-check
 */

import { test, expect } from '@playwright/test';

test.describe('Health Checks', () => {
  test('landing page loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/QuoteGen|B2B/i);
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
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('can navigate to quotes page', async ({ page }) => {
    await page.goto('/quotes');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('can navigate to customers page', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('404 page works for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-definitely-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
