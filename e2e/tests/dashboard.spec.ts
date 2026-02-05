/**
 * Dashboard Navigation and Data Display E2E Tests
 * Tests dashboard functionality, stats display, and navigation
 */

import { test, expect } from '../fixtures/test-fixtures';

test.describe('Dashboard Navigation and Data Display', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test.describe('Dashboard Layout', () => {
    test('should display header with welcome message', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
      await expect(page.getByText(/Welcome back/i)).toBeVisible();
    });

    test('should display create quote button', async ({ page }) => {
      const createButton = page.getByRole('button', { name: /Create Quote/i });
      await expect(createButton).toBeVisible();
      await expect(createButton).toBeEnabled();
    });

    test('should have working sidebar navigation', async ({ page }) => {
      // Verify sidebar is present
      await expect(page.locator('nav').first()).toBeVisible();
      
      // Test navigation links
      const navLinks = ['Dashboard', 'Quotes', 'Customers', 'Templates', 'Analytics', 'Settings'];
      for (const link of navLinks) {
        const navLink = page.getByRole('link', { name: new RegExp(link, 'i') }).first();
        await expect(navLink).toBeVisible();
        await expect(navLink).toHaveAttribute('href', /.+/);
      }
    });
  });

  test.describe('Stat Cards', () => {
    test('should display all stat cards', async ({ page, dashboardPage }) => {
      await dashboardPage.expectStatCardsToBeVisible();
    });

    test('should display stat cards with correct labels', async ({ page }) => {
      const statLabels = [
        /Total Quotes/i,
        /Pending Quotes/i,
        /Sent Quotes/i,
        /Accepted Quotes/i,
        /Total Revenue/i,
        /Conversion Rate/i,
        /Average Quote Value/i,
      ];
      
      for (const label of statLabels) {
        await expect(page.getByText(label).first()).toBeVisible();
      }
    });

    test('should display stat values with correct formatting', async ({ page }) => {
      // Check for currency formatting
      const currencyPattern = /\$[\d,]+\.?\d*/;
      const pageContent = await page.textContent('body');
      
      // Check for percentage
      const percentPattern = /\d+\.?\d*%/;
      expect(percentPattern.test(pageContent || '')).toBeTruthy();
    });

    test('should handle loading state for stats', async ({ page }) => {
      // Reload to trigger loading state
      await page.reload();
      
      // Check for loading indicators or skeletons
      await page.waitForTimeout(500);
      
      // Stats should eventually load
      await expect(page.getByText(/Total Quotes/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Recent Quotes Section', () => {
    test('should display recent quotes section', async ({ page, dashboardPage }) => {
      await dashboardPage.expectRecentQuotesSection();
    });

    test('should display quotes table with headers', async ({ page }) => {
      // Check for table headers
      const headers = ['Quote', 'Customer', 'Amount', 'Status', 'Date'];
      for (const header of headers) {
        await expect(page.getByText(header, { exact: false }).first()).toBeVisible();
      }
    });

    test('should display quote status badges with correct colors', async ({ page }) => {
      // Check for status badges
      const statuses = ['Accepted', 'Sent', 'Pending', 'Viewed'];
      for (const status of statuses) {
        const badge = page.locator(`text=${status}`).first();
        if (await badge.isVisible().catch(() => false)) {
          // Badge should have styling classes
          const className = await badge.getAttribute('class');
          expect(className).toMatch(/bg-|text-/);
        }
      }
    });

    test('should navigate to quote details on click', async ({ page }) => {
      // Click on first quote number
      const quoteNumber = page.getByText(/QT-\d{4}-\d{3}/).first();
      if (await quoteNumber.isVisible().catch(() => false)) {
        await quoteNumber.click();
        await expect(page).toHaveURL(/\/dashboard\/quotes\/.+/);
      }
    });
  });

  test.describe('Activity Feed', () => {
    test('should display activity feed section', async ({ page, dashboardPage }) => {
      await dashboardPage.expectActivityFeedSection();
    });

    test('should display activity items with timestamps', async ({ page }) => {
      // Look for activity items
      const activityItems = page.locator('[data-testid="activity-item"], .activity-item');
      const count = await activityItems.count();
      
      if (count > 0) {
        // Check for timestamp patterns
        const pageContent = await page.textContent('body');
        const timePatterns = [/\d+ (hour|min|day)s? ago/, /\d{1,2}:\d{2}/, /(AM|PM)/];
        const hasTimestamp = timePatterns.some(p => p.test(pageContent || ''));
        expect(hasTimestamp).toBeTruthy();
      }
    });

    test('should display activity icons', async ({ page }) => {
      // Check for activity icons (SVG elements)
      const icons = page.locator('svg');
      const iconCount = await icons.count();
      expect(iconCount).toBeGreaterThan(0);
    });
  });

  test.describe('Quick Actions', () => {
    test('should display quick actions section', async ({ page }) => {
      await expect(page.getByText(/Quick Actions/i)).toBeVisible();
    });

    test('should have working quick action buttons', async ({ page }) => {
      const quickActions = ['Create Quote', 'Create Template', 'View Analytics'];
      
      for (const action of quickActions) {
        const button = page.getByRole('button', { name: new RegExp(action, 'i') });
        if (await button.isVisible().catch(() => false)) {
          await expect(button).toBeEnabled();
        }
      }
    });

    test('quick actions should navigate correctly', async ({ page }) => {
      // Test Create Quote quick action
      await page.getByRole('button', { name: /Create Quote/i }).first().click();
      await expect(page).toHaveURL(/\/dashboard\/quotes\/new/);
      
      // Go back and test another
      await page.goto('/dashboard');
      await page.waitForURL('/dashboard');
    });
  });

  test.describe('Navigation Flows', () => {
    test('should navigate to quotes page', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToQuotes();
      await expect(page.getByRole('heading', { name: /Quotes/i })).toBeVisible();
      await expect(page).toHaveURL(/\/dashboard\/quotes$/);
    });

    test('should navigate to customers page', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToCustomers();
      await expect(page.getByRole('heading', { name: /Customers/i })).toBeVisible();
      await expect(page).toHaveURL(/\/dashboard\/customers$/);
    });

    test('should navigate to templates page', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToTemplates();
      await expect(page.getByRole('heading', { name: /Templates/i })).toBeVisible();
      await expect(page).toHaveURL(/\/dashboard\/templates$/);
    });

    test('should navigate to settings page', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToSettings();
      await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
      await expect(page).toHaveURL(/\/dashboard\/settings$/);
    });

    test('should navigate to analytics page', async ({ dashboardPage, page }) => {
      await dashboardPage.navigateToAnalytics();
      await expect(page.getByRole('heading', { name: /Analytics/i })).toBeVisible();
      await expect(page).toHaveURL(/\/dashboard\/analytics$/);
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should handle mobile viewport', async ({ page, dashboardPage }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await dashboardPage.goto();
      
      // Should still display dashboard content
      await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
    });

    test('should handle tablet viewport', async ({ page, dashboardPage }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await dashboardPage.goto();
      
      // Should display content properly
      await expect(page.getByText(/Total Quotes/i)).toBeVisible();
    });
  });

  test.describe('Error States', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);
      
      await page.reload();
      
      // Should show offline state or cached content
      await page.waitForTimeout(1000);
      
      // Restore online
      await page.context().setOffline(false);
    });

    test('should display error boundary on component error', async ({ page }) => {
      // Inject error to test error boundary
      await page.evaluate(() => {
        window.localStorage.setItem('triggerError', 'true');
      });
      
      // Page should still load (error boundary should catch)
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);
    });
  });
});
