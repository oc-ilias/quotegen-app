/**
 * E2E Tests - Dashboard
 * @module e2e/dashboard
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display dashboard stats', async ({ page }) => {
    // Verify stats cards are visible
    await expect(page.getByText(/total quotes/i)).toBeVisible();
    await expect(page.getByText(/pending quotes/i)).toBeVisible();
    await expect(page.getByText(/accepted quotes/i)).toBeVisible();
    await expect(page.getByText(/conversion rate/i)).toBeVisible();
  });

  test('should display recent quotes', async ({ page }) => {
    // Verify recent quotes section
    await expect(page.getByText(/recent quotes/i)).toBeVisible();
    
    // Check that quote rows are visible
    const quoteRows = page.locator('[data-testid="quote-row"]');
    await expect(quoteRows.first()).toBeVisible();
  });

  test('should navigate to quotes page', async ({ page }) => {
    // Click on quotes link
    await page.getByRole('link', { name: /quotes/i }).click();

    // Verify navigation
    await expect(page).toHaveURL(/\/quotes/);
    await expect(page.getByText(/all quotes/i)).toBeVisible();
  });

  test('should display activity feed', async ({ page }) => {
    // Verify activity feed section
    await expect(page.getByText(/recent activity/i)).toBeVisible();
    
    // Check for activity items
    const activityItems = page.locator('[data-testid="activity-item"]');
    if (await activityItems.count() > 0) {
      await expect(activityItems.first()).toBeVisible();
    }
  });

  test('should refresh data', async ({ page }) => {
    // Click refresh button
    await page.getByRole('button', { name: /refresh/i }).click();

    // Verify loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // Wait for data to reload
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();

    // Verify stats are still displayed
    await expect(page.getByText(/total quotes/i)).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    // Start at dashboard
    await page.goto('/dashboard');
    await expect(page.getByText(/dashboard/i)).toBeVisible();

    // Navigate to Quotes
    await page.getByRole('link', { name: /quotes/i }).click();
    await expect(page).toHaveURL(/\/quotes/);

    // Navigate to Customers
    await page.getByRole('link', { name: /customers/i }).click();
    await expect(page).toHaveURL(/\/customers/);

    // Navigate to Analytics
    await page.getByRole('link', { name: /analytics/i }).click();
    await expect(page).toHaveURL(/\/analytics/);

    // Navigate back to Dashboard
    await page.getByRole('link', { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
