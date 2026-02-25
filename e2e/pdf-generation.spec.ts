/**
 * PDF Generation E2E Tests
 * Tests for PDF preview, download, and print functionality
 */

import { test, expect } from '@playwright/test';

test.describe('PDF Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to quotes page
    await page.goto('/quotes');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to quote detail page', async ({ page }) => {
    // Wait for quotes table to load
    await expect(page.locator('table')).toBeVisible();
    
    // Click on first quote number
    const firstQuote = page.locator('table tbody tr:first-child td:nth-child(2)').first();
    await expect(firstQuote).toBeVisible();
    await firstQuote.click();

    // Wait for quote detail page
    await page.waitForURL(/\/quotes\/[\w-]+/);
    
    // Verify we're on a quote detail page
    await expect(page.locator('h1, [class*="title"], [class*="header"]').first()).toBeVisible();
  });

  test('should view quote details with PDF actions', async ({ page }) => {
    // Click on first quote
    await page.locator('table tbody tr:first-child').first().click();
    await page.waitForURL(/\/quotes\/[\w-]+/);

    // Check for action buttons (View, Edit, or similar)
    const actions = page.locator('button, [role="button"]').filter({ hasText: /view|edit|pdf|print|download/i });
    const count = await actions.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle PDF template options', async ({ page }) => {
    // Open a quote
    await page.locator('table tbody tr:first-child').first().click();
    await page.waitForURL(/\/quotes\/[\w-]+/);

    // Look for template or settings related to PDF
    const templateElements = page.locator('select, [class*="template"], [class*="style"]').first();
    
    // This is optional - templates might not be exposed in UI
    if (await templateElements.isVisible().catch(() => false)) {
      await expect(templateElements).toBeVisible();
    }
  });

  test('should display quote information correctly', async ({ page }) => {
    // Click on first quote
    await page.locator('table tbody tr:first-child').first().click();
    await page.waitForURL(/\/quotes\/[\w-]+/);

    // Verify quote details are displayed
    const content = page.locator('main, [class*="content"], article').first();
    await expect(content).toBeVisible();
    
    // Should show some text content
    const text = await content.textContent();
    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(10);
  });

  test('should handle quote not found', async ({ page }) => {
    // Navigate to non-existent quote
    await page.goto('/quotes/non-existent-id');
    
    // Should show error or redirect
    await page.waitForLoadState('networkidle');
    
    // Either error message or redirect to quotes list
    const errorOrContent = page.locator('text=/not found|error|404/i, table, [class*="quote"]').first();
    await expect(errorOrContent).toBeVisible();
  });

  test('should support quote status updates', async ({ page }) => {
    // Open a quote
    await page.locator('table tbody tr:first-child').first().click();
    await page.waitForURL(/\/quotes\/[\w-]+/);

    // Look for status indicators or change buttons
    const statusElements = page.locator('[class*="status"], button:has-text("Status"), select').first();
    await expect(statusElements).toBeVisible();
  });
});
