/**
 * E2E Tests - Dashboard
 * @module e2e/dashboard
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display dashboard title', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000);

    // Check for dashboard text in the page
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.toLowerCase()).toContain('dashboard');
  });

  test('should display navigation elements', async ({ page }) => {
    // Look for common navigation patterns
    const navElements = await page.locator('nav, [role="navigation"], header').count();
    expect(navElements).toBeGreaterThan(0);
  });

  test('should have visible content', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000);

    // Check that body is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check for main content area
    const main = page.locator('main').first();
    await expect(main).toBeVisible();
  });
});

test.describe('Dashboard Responsiveness', () => {
  test('should adapt to mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Check that content is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should adapt to tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
