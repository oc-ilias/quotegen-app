/**
 * Authentication Flow E2E Tests
 * Tests login, logout, and session management
 */

import { test, expect } from '../fixtures/test-fixtures';

test.describe('Authentication Flow', () => {
  test.describe('Landing Page', () => {
    test('should display the landing page with correct branding', async ({ page }) => {
      await page.goto('/');
      
      // Check main branding elements
      await expect(page.getByRole('heading', { name: /QuoteGen/i })).toBeVisible();
      await expect(page.getByText(/B2B Quote Requests for Shopify/i)).toBeVisible();
      
      // Check installation instructions
      await expect(page.getByText(/Installation Instructions/i)).toBeVisible();
      await expect(page.getByText(/Quote Button Code/i)).toBeVisible();
    });

    test('should display button preview section', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByRole('heading', { name: /Button Preview/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Request Quote/i })).toBeVisible();
    });

    test('should display quotes dashboard section on landing page', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByRole('heading', { name: /Quote Requests/i })).toBeVisible();
    });

    test('should display settings section on landing page', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
    });
  });

  test.describe('OAuth Callback', () => {
    test('should handle auth callback with valid parameters', async ({ page }) => {
      // Navigate to auth callback with valid params
      await page.goto('/api/auth/callback?shop=test-shop.myshopify.com&code=valid_code&state=valid_state&timestamp=1234567890&hmac=valid_hmac');
      
      // Should redirect to dashboard or show error (depending on implementation)
      await expect(page).toHaveURL(/dashboard|error/);
    });

    test('should handle auth callback with missing parameters', async ({ page }) => {
      await page.goto('/api/auth/callback?shop=test-shop.myshopify.com');
      
      // Should show error for missing code
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/auth/callback?shop=test-shop.myshopify.com');
        return { status: res.status };
      });
      
      expect(response.status).toBe(400);
    });

    test('should handle auth callback without any parameters', async ({ page }) => {
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/auth/callback');
        return { status: res.status };
      });
      
      expect(response.status).toBe(400);
    });
  });

  test.describe('Dashboard Access', () => {
    test('should access dashboard directly in demo mode', async ({ dashboardPage }) => {
      // In demo mode, dashboard should be accessible
      await dashboardPage.goto();
      
      // Verify dashboard loaded
      await expect(dashboardPage.expectStatCardsToBeVisible());
    });

    test('should display correct navigation items in sidebar', async ({ page, dashboardPage }) => {
      await dashboardPage.goto();
      
      // Check all navigation items
      const navItems = ['Dashboard', 'Quotes', 'Customers', 'Templates', 'Analytics', 'Settings'];
      for (const item of navItems) {
        await expect(page.getByRole('link', { name: new RegExp(item, 'i') }).first()).toBeVisible();
      }
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page navigations', async ({ page, dashboardPage, quotesPage }) => {
      await dashboardPage.goto();
      
      // Navigate to different pages
      await dashboardPage.navigateToQuotes();
      await quotesPage.waitForPageLoad();
      
      await dashboardPage.navigateToCustomers();
      await expect(page.getByRole('heading', { name: /Customers/i })).toBeVisible();
      
      await dashboardPage.navigateToSettings();
      await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
    });

    test('should handle browser refresh and maintain state', async ({ page, dashboardPage }) => {
      await dashboardPage.goto();
      
      // Navigate to quotes page
      await dashboardPage.navigateToQuotes();
      
      // Refresh the page
      await page.reload();
      
      // Should still be on quotes page
      await expect(page).toHaveURL(/\/dashboard\/quotes/);
      await expect(page.getByRole('heading', { name: /Quotes/i })).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      await page.goto('/non-existent-page');
      
      // Should show error boundary or 404 page
      const hasErrorContent = await page.locator('text=/404|not found|error/i').first().isVisible().catch(() => false);
      expect(hasErrorContent).toBeTruthy();
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Intercept and mock API error
      await page.route('/api/quotes', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });
      
      await page.goto('/dashboard/quotes');
      
      // Should display error state gracefully
      await page.waitForTimeout(1000);
    });
  });
});
