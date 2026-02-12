/**
 * E2E Tests - Quote Creation Critical Path
 * @module e2e/quote-creation
 */

import { test, expect } from '@playwright/test';

test.describe('Quote Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the quotes page
    await page.goto('/quotes');
    
    // Wait for the page to be ready
    await page.waitForLoadState('networkidle');
  });

  test('should create a new quote with all required fields', async ({ page }) => {
    // Click the "New Quote" button
    const newQuoteButton = page.getByRole('button', { name: /new quote/i });
    await expect(newQuoteButton).toBeVisible();
    await newQuoteButton.click();

    // Fill in customer information
    await page.getByLabel(/customer name/i).fill('Test Customer');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/company/i).fill('Test Company');

    // Move to next step
    await page.getByRole('button', { name: /next/i }).click();

    // Add line items
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel(/item name/i).fill('Test Product');
    await page.getByLabel(/quantity/i).fill('2');
    await page.getByLabel(/unit price/i).fill('100');

    // Move to review step
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /next/i }).click();

    // Verify quote summary
    await expect(page.getByText('Test Product')).toBeVisible();
    await expect(page.getByText('$200.00')).toBeVisible();

    // Save the quote
    await page.getByRole('button', { name: /save quote/i }).click();

    // Verify success message
    await expect(page.getByText(/quote created successfully/i)).toBeVisible();

    // Verify we're redirected to the quotes list
    await expect(page.url()).toContain('/quotes');
  });

  test('should validate required fields', async ({ page }) => {
    // Click the "New Quote" button
    await page.getByRole('button', { name: /new quote/i }).click();

    // Try to proceed without filling required fields
    await page.getByRole('button', { name: /next/i }).click();

    // Verify validation errors
    await expect(page.getByText(/customer name is required/i)).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test('should calculate totals correctly', async ({ page }) => {
    // Navigate to new quote
    await page.getByRole('button', { name: /new quote/i }).click();

    // Fill customer info
    await page.getByLabel(/customer name/i).fill('Calc Test');
    await page.getByLabel(/email/i).fill('calc@example.com');
    await page.getByRole('button', { name: /next/i }).click();

    // Add multiple items
    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel(/item name/i).fill('Item 1');
    await page.getByLabel(/quantity/i).fill('3');
    await page.getByLabel(/unit price/i).fill('50');

    await page.getByRole('button', { name: /add item/i }).click();
    await page.getByLabel(/item name/i).nth(1).fill('Item 2');
    await page.getByLabel(/quantity/i).nth(1).fill('2');
    await page.getByLabel(/unit price/i).nth(1).fill('75');

    // Verify subtotal (3*50 + 2*75 = 150 + 150 = 300)
    await expect(page.getByText('$300.00')).toBeVisible();
  });
});
