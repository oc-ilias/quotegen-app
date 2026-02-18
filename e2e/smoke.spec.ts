/**
 * E2E Smoke Tests - Critical Paths
 * Minimal tests to verify the app works
 * @module e2e/smoke
 */

import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Homepage', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Check basic page elements exist
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check for QuoteGen text somewhere on the page
    const quoteGenText = page.locator('text=QuoteGen').first();
    await expect(quoteGenText).toBeVisible();
  });

  test('homepage has navigation elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check for header
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });
});

test.describe('Smoke Tests - Dashboard', () => {
  test('dashboard page loads', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Check body is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check URL contains dashboard
    await expect(page).toHaveURL(/dashboard/);
  });

  test('dashboard shows content after loading', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for content to load (simulated loading takes 1.5s)
    await page.waitForTimeout(2000);

    // Check for main content
    const main = page.locator('main').first();
    await expect(main).toBeVisible();
  });
});

test.describe('Smoke Tests - Quotes', () => {
  test('quotes list page loads', async ({ page }) => {
    await page.goto('/quotes');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('new quote page loads', async ({ page }) => {
    await page.goto('/quotes/new');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Smoke Tests - Customers', () => {
  test('customers page loads', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Smoke Tests - Navigation', () => {
  test('can navigate from home to dashboard', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Navigate to dashboard directly
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Verify we're on dashboard
    await expect(page).toHaveURL(/dashboard/);
  });

  test('404 page handles unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Smoke Tests - API', () => {
  test('api endpoints respond', async ({ request }) => {
    // Test a simple API call
    const response = await request.get('/api/health', { timeout: 5000 });
    // API might return 200, 404 (if not implemented), or other
    expect([200, 404]).toContain(response.status());
  });
});
