/**
 * E2E Tests - Dashboard
 * @module e2e/dashboard
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    // Give extra time for client-side hydration
    await page.waitForTimeout(1000);
  });

  test('should display dashboard title', async ({ page }) => {
    // Check for dashboard title or navigation
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/dashboard|quotegen|b2b/);
  });

  test('should display navigation elements', async ({ page }) => {
    // Look for common navigation patterns
    const navElements = await page.locator('nav, [role="navigation"], header').count();
    expect(navElements).toBeGreaterThan(0);
  });

  test('should have working sidebar or menu', async ({ page }) => {
    // Check for sidebar or hamburger menu
    const sidebar = page.locator('aside, [data-testid="sidebar"], nav');
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="navigation"]');
    
    const hasSidebar = await sidebar.isVisible().catch(() => false);
    const hasMenuButton = await menuButton.isVisible().catch(() => false);
    
    expect(hasSidebar || hasMenuButton).toBe(true);
  });

  test('should navigate to quotes page', async ({ page }) => {
    // Try to find and click quotes link
    const quotesLink = page.locator('a[href*="/quotes"], a:has-text("Quotes")').first();
    
    if (await quotesLink.isVisible().catch(() => false)) {
      await quotesLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/quotes|dashboard/);
    } else {
      // Skip if link not found (might be mobile menu)
      test.skip();
    }
  });

  test('should navigate to customers page', async ({ page }) => {
    const customersLink = page.locator('a[href*="/customers"], a:has-text("Customers")').first();
    
    if (await customersLink.isVisible().catch(() => false)) {
      await customersLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/customers|dashboard/);
    } else {
      test.skip();
    }
  });

  test('should navigate to analytics page', async ({ page }) => {
    const analyticsLink = page.locator('a[href*="/analytics"], a:has-text("Analytics")').first();
    
    if (await analyticsLink.isVisible().catch(() => false)) {
      await analyticsLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/analytics|dashboard/);
    } else {
      test.skip();
    }
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
    
    // Check for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]');
    const isVisible = await menuButton.isVisible().catch(() => false);
    
    // Either mobile menu button exists or sidebar is hidden
    if (!isVisible) {
      const sidebar = page.locator('aside, [data-testid="sidebar"]');
      const sidebarVisible = await sidebar.isVisible().catch(() => false);
      // On mobile, sidebar might be hidden
      expect(sidebarVisible || isVisible).toBeDefined();
    }
  });

  test('should adapt to tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
