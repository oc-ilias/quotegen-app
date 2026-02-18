/**
 * E2E Tests - Quote Sending
 * @module e2e/quote-sending
 */

import { test, expect } from '@playwright/test';

test.describe('Quote Management', () => {
  test('can access quote pages', async ({ page }) => {
    // Test accessing quotes
    await page.goto('/quotes');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('can access new quote page', async ({ page }) => {
    await page.goto('/quotes/new');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
