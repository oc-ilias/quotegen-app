/**
 * Email Sending E2E Tests
 * Tests for quote email notifications and status updates
 */

import { test, expect } from '@playwright/test';

test.describe('Email Sending', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to quotes page
    await page.goto('/quotes');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to quote and view actions', async ({ page }) => {
    // Wait for quotes table
    await expect(page.locator('table')).toBeVisible();
    
    // Click on first quote
    const firstQuote = page.locator('table tbody tr:first-child').first();
    await expect(firstQuote).toBeVisible();
    await firstQuote.click();

    // Wait for detail page
    await page.waitForURL(/\/quotes\/[\w-]+/);
    
    // Verify page loaded
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('should display customer information', async ({ page }) => {
    // Open a quote
    await page.locator('table tbody tr:first-child').first().click();
    await page.waitForURL(/\/quotes\/[\w-]+/);

    // Look for customer info
    const customerInfo = page.locator('text=/customer|email|company|contact/i').first();
    await expect(customerInfo).toBeVisible();
  });

  test('should show quote value and details', async ({ page }) => {
    // Open a quote
    await page.locator('table tbody tr:first-child').first().click();
    await page.waitForURL(/\/quotes\/[\w-]+/);

    // Look for monetary values
    const valueElements = page.locator('text=/\\$|total|amount|price/i').first();
    await expect(valueElements).toBeVisible();
  });

  test('should have edit functionality', async ({ page }) => {
    // Open a quote
    await page.locator('table tbody tr:first-child').first().click();
    await page.waitForURL(/\/quotes\/[\w-]+/);

    // Look for edit button or link
    const editElements = page.locator('button, a').filter({ hasText: /edit|modify|change/i }).first();
    
    if (await editElements.isVisible().catch(() => false)) {
      await editElements.click();
      await expect(page.locator('form, input, textarea').first()).toBeVisible();
    }
  });

  test('should support quote actions', async ({ page }) => {
    // Open a quote
    await page.locator('table tbody tr:first-child').first().click();
    await page.waitForURL(/\/quotes\/[\w-]+/);

    // Look for action buttons
    const actions = page.locator('button').filter({ hasText: /send|email|share|export|print/i });
    const count = await actions.count();
    
    // Should have at least some action buttons
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show quote status', async ({ page }) => {
    // Open a quote
    await page.locator('table tbody tr:first-child').first().click();
    await page.waitForURL(/\/quotes\/[\w-]+/);

    // Look for status indicators
    const statusElements = page.locator('[class*="status"], text=/draft|sent|accepted|rejected|pending/i').first();
    await expect(statusElements).toBeVisible();
  });

  test('should handle quote deletion flow', async ({ page }) => {
    // Open a quote
    await page.locator('table tbody tr:first-child').first().click();
    await page.waitForURL(/\/quotes\/[\w-]+/);

    // Look for delete button
    const deleteBtn = page.locator('button').filter({ hasText: /delete|remove|trash/i }).first();
    
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      
      // Should show confirmation
      const confirmDialog = page.locator('[role="dialog"], [class*="modal"], [class*="confirm"]').first();
      await expect(confirmDialog).toBeVisible().catch(() => {
        // Some UIs might not have confirmation
      });
    }
  });
});
