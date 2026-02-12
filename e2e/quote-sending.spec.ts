/**
 * E2E Tests - Quote Sending and Status Updates
 * @module e2e/quote-sending
 */

import { test, expect } from '@playwright/test';

test.describe('Quote Sending', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotes');
    await page.waitForLoadState('networkidle');
  });

  test('should send a quote via email', async ({ page }) => {
    // Find and click on a draft quote
    const draftQuote = page.locator('[data-testid="quote-row"]').filter({ hasText: 'Draft' }).first();
    await draftQuote.click();

    // Click send button
    await page.getByRole('button', { name: /send quote/i }).click();

    // Fill email details
    await page.getByLabel(/to/i).fill('customer@example.com');
    await page.getByLabel(/subject/i).fill('Your Quote from QuoteGen');
    await page.getByLabel(/message/i).fill('Please find your quote attached.');

    // Send the quote
    await page.getByRole('button', { name: /send/i }).click();

    // Verify success
    await expect(page.getByText(/quote sent successfully/i)).toBeVisible();

    // Verify status changed to "Sent"
    await expect(page.getByText('Sent')).toBeVisible();
  });

  test('should preview quote before sending', async ({ page }) => {
    // Open a quote
    const quoteRow = page.locator('[data-testid="quote-row"]').first();
    await quoteRow.click();

    // Click preview
    await page.getByRole('button', { name: /preview/i }).click();

    // Verify preview modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/quote preview/i)).toBeVisible();

    // Close preview
    await page.getByRole('button', { name: /close/i }).click();
  });
});

test.describe('Quote Status Updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotes');
    await page.waitForLoadState('networkidle');
  });

  test('should update quote status from draft to sent', async ({ page }) => {
    // Find a draft quote
    const draftRow = page.locator('[data-testid="quote-row"]').filter({ hasText: 'Draft' }).first();
    await draftRow.click();

    // Open status dropdown
    await page.getByLabel(/status/i).click();

    // Select "Sent"
    await page.getByRole('option', { name: /sent/i }).click();

    // Confirm status change
    await page.getByRole('button', { name: /confirm/i }).click();

    // Verify status updated
    await expect(page.getByText('Sent')).toBeVisible();
  });

  test('should show status history', async ({ page }) => {
    // Open a quote
    await page.locator('[data-testid="quote-row"]').first().click();

    // Click on status history
    await page.getByRole('button', { name: /status history/i }).click();

    // Verify history modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/status history/i)).toBeVisible();

    // Verify history entries
    await expect(page.locator('[data-testid="status-history-item"]').first()).toBeVisible();
  });

  test('should accept a quote', async ({ page }) => {
    // Open a sent quote
    const sentRow = page.locator('[data-testid="quote-row"]').filter({ hasText: 'Sent' }).first();
    await sentRow.click();

    // Click accept
    await page.getByRole('button', { name: /accept/i }).click();

    // Confirm acceptance
    await page.getByRole('button', { name: /confirm/i }).click();

    // Verify status updated to "Accepted"
    await expect(page.getByText('Accepted')).toBeVisible();
    await expect(page.getByText(/quote accepted/i)).toBeVisible();
  });

  test('should reject a quote with reason', async ({ page }) => {
    // Open a sent quote
    const sentRow = page.locator('[data-testid="quote-row"]').filter({ hasText: 'Sent' }).first();
    await sentRow.click();

    // Click reject
    await page.getByRole('button', { name: /reject/i }).click();

    // Enter rejection reason
    await page.getByLabel(/reason/i).fill('Price too high');

    // Confirm rejection
    await page.getByRole('button', { name: /confirm rejection/i }).click();

    // Verify status updated to "Rejected"
    await expect(page.getByText('Rejected')).toBeVisible();
  });
});
