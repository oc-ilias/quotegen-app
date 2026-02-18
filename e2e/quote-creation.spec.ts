/**
 * E2E Tests - Quote Creation
 * Tests the quote creation page loads
 * @module e2e/quote-creation
 */

import { test, expect } from '@playwright/test';

test.describe('Quote Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotes/new');
    await page.waitForLoadState('domcontentloaded');
  });

  test('quote creation page loads', async ({ page }) => {
    const url = page.url();
    expect(url).toMatch(/quotes/);

    // Check that body is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('page has content', async ({ page }) => {
    // Wait for potential loading
    await page.waitForTimeout(1000);

    // Check body has content
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check main content area
    const main = page.locator('main').first();
    await expect(main).toBeVisible();
  });
});

test.describe('Quotes List', () => {
  test('quotes list page loads', async ({ page }) => {
    await page.goto('/quotes');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
