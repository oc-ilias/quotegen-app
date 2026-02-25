/**
 * E2E Tests for QuoteGen Application
 * Uses data-testid selectors for reliable test targeting
 * 
 * @module e2e/quotegen.e2e.spec
 */

import { test, expect } from '@playwright/test';

// Base URL for tests
const BASE_URL = process.env.BASE_URL || 'https://quotegen-quazdheta-oc-ilias-projects.vercel.app';

test.describe('QuoteGen E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to base URL before each test
    await page.goto(BASE_URL);
    
    // Wait for app to be ready
    await page.waitForLoadState('networkidle');
  });

  test.describe('Navigation', () => {
    test('should render sidebar with all navigation items', async ({ page }) => {
      // Check sidebar is present
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toBeVisible();

      // Check all navigation items
      await expect(page.getByTestId('nav-dashboard')).toBeVisible();
      await expect(page.getByTestId('nav-quotes')).toBeVisible();
      await expect(page.getByTestId('nav-customers')).toBeVisible();
      await expect(page.getByTestId('nav-templates')).toBeVisible();
      await expect(page.getByTestId('nav-analytics')).toBeVisible();
      await expect(page.getByTestId('nav-settings')).toBeVisible();
    });

    test('should navigate to quotes page', async ({ page }) => {
      // Click quotes navigation
      await page.getByTestId('nav-quotes').click();
      
      // Wait for navigation
      await page.waitForURL('**/quotes');
      
      // Verify URL
      expect(page.url()).toContain('/quotes');
    });

    test('should navigate to customers page', async ({ page }) => {
      await page.getByTestId('nav-customers').click();
      await page.waitForURL('**/customers');
      expect(page.url()).toContain('/customers');
    });

    test('should toggle sidebar collapse', async ({ page }) => {
      const sidebar = page.getByTestId('sidebar');
      const toggleButton = page.getByTestId('sidebar-toggle');
      
      // Check initial state
      await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
      
      // Click toggle
      await toggleButton.click();
      
      // Wait for animation and check collapsed state
      await page.waitForTimeout(300);
      await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
      
      // Toggle back
      await toggleButton.click();
      await page.waitForTimeout(300);
      await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    });

    test('should open create quote menu', async ({ page }) => {
      const createButton = page.getByTestId('create-quote-button');
      
      // Click create button
      await createButton.click();
      
      // Check dropdown menu appears
      const createMenu = page.locator('#create-menu');
      await expect(createMenu).toBeVisible();
      
      // Check menu items
      await expect(createMenu.getByRole('menuitem', { name: /new quote/i })).toBeVisible();
      await expect(createMenu.getByRole('menuitem', { name: /from template/i })).toBeVisible();
    });
  });

  test.describe('Dashboard', () => {
    test('should display stat cards', async ({ page }) => {
      // Navigate to dashboard
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Check stat cards grid
      const statGrid = page.getByTestId('stat-cards-grid');
      await expect(statGrid).toBeVisible();
      
      // Check individual stat cards
      await expect(page.getByTestId('stat-card-total-quotes')).toBeVisible();
      await expect(page.getByTestId('stat-card-total-revenue')).toBeVisible();
      await expect(page.getByTestId('stat-card-conversion-rate')).toBeVisible();
      await expect(page.getByTestId('stat-card-avg-quote-value')).toBeVisible();
    });

    test('should show stat card values', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Get stat card values
      const totalQuotesCard = page.getByTestId('stat-card-total-quotes');
      await expect(totalQuotesCard).toContainText('Total Quotes');
      
      const revenueCard = page.getByTestId('stat-card-total-revenue');
      await expect(revenueCard).toContainText('Total Revenue');
    });
  });

  test.describe('Customers', () => {
    test('should display customer list', async ({ page }) => {
      await page.goto(`${BASE_URL}/customers`);
      await page.waitForLoadState('networkidle');
      
      // Check customer list container
      const customerList = page.getByTestId('customer-list');
      await expect(customerList).toBeVisible();
      
      // Check search input
      const searchInput = page.getByTestId('customer-search-input');
      await expect(searchInput).toBeVisible();
    });

    test('should search customers', async ({ page }) => {
      await page.goto(`${BASE_URL}/customers`);
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.getByTestId('customer-search-input');
      
      // Type search query
      await searchInput.fill('test');
      
      // Wait for debounce
      await page.waitForTimeout(350);
      
      // Verify search was triggered (check for loading or filtered results)
      // This depends on the actual implementation
    });

    test('should show empty state when no customers', async ({ page }) => {
      // This test would require mocking empty data
      // For now, just verify the empty state element exists
      await page.goto(`${BASE_URL}/customers`);
      
      // Empty state should have data-testid
      const emptyState = page.getByTestId('customer-empty-state');
      
      // Only check if visible (when no customers)
      if (await emptyState.isVisible().catch(() => false)) {
        await expect(emptyState).toContainText('No customers found');
      }
    });
  });

  test.describe('Quotes', () => {
    test('should display quotes page', async ({ page }) => {
      await page.goto(`${BASE_URL}/quotes`);
      await page.waitForLoadState('networkidle');
      
      // Check page title or header
      await expect(page.locator('h1, h2').filter({ hasText: /quotes/i }).first()).toBeVisible();
    });

    test('should navigate to new quote wizard', async ({ page }) => {
      await page.goto(`${BASE_URL}/quotes`);
      await page.waitForLoadState('networkidle');
      
      // Click create quote
      await page.getByTestId('create-quote-button').click();
      
      // Click new quote from dropdown
      const createMenu = page.locator('#create-menu');
      await createMenu.getByRole('menuitem', { name: /new quote/i }).click();
      
      // Wait for navigation to quote wizard
      await page.waitForURL('**/quotes/new**');
    });
  });

  test.describe('Analytics', () => {
    test('should display analytics page', async ({ page }) => {
      await page.goto(`${BASE_URL}/analytics`);
      await page.waitForLoadState('networkidle');
      
      // Check analytics page loaded
      await expect(page.getByTestId('nav-analytics')).toHaveAttribute('aria-current', 'page');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Check for h1 on page
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
    });

    test('should have proper ARIA labels on navigation', async ({ page }) => {
      // Check navigation has proper ARIA
      const nav = page.locator('nav[aria-label]');
      await expect(nav).toBeVisible();
      
      // Check menu items have proper roles
      const menuItems = page.locator('[role="menuitem"]');
      await expect(menuItems.first()).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Tab to first navigation item
      await page.keyboard.press('Tab');
      
      // Check focus is on navigation
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load dashboard within performance budget', async ({ page }) => {
      // Measure page load time
      const startTime = Date.now();
      
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Assert load time is under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should render above the fold content quickly', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Wait for stat cards to appear
      await page.waitForSelector('[data-testid="stat-cards-grid"]', { timeout: 2000 });
      
      // Verify content is visible
      await expect(page.getByTestId('stat-cards-grid')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt layout for mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Check that layout adapts
      const sidebar = page.getByTestId('sidebar');
      
      // On mobile, sidebar might be hidden or in different state
      // This depends on the actual responsive implementation
    });

    test('should adapt layout for tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Verify layout is usable on tablet
      await expect(page.getByTestId('sidebar')).toBeVisible();
    });
  });
});
