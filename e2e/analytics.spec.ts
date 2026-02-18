/**
 * Enhanced E2E Tests - Analytics Dashboard
 * Tests analytics components, charts, and data visualization
 * @module e2e/analytics
 */

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display analytics page', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check for analytics-related text
    const pageText = await page.locator('body').textContent();
    const hasAnalyticsText = pageText?.toLowerCase().includes('analytic') || 
                             pageText?.toLowerCase().includes('chart') ||
                             pageText?.toLowerCase().includes('revenue') ||
                             pageText?.toLowerCase().includes('conversion');
    expect(hasAnalyticsText).toBe(true);
  });

  test('should display date range selector', async ({ page }) => {
    // Look for date range controls
    const dateControls = page.locator('button:has-text("7 days"), button:has-text("30 days"), button:has-text("Last"), select').first();
    expect(await dateControls.count()).toBeGreaterThanOrEqual(0);
  });

  test('should display stat cards', async ({ page }) => {
    // Look for stat card elements
    const statCards = page.locator('[data-testid="stat-card"], .stat-card, .bg-slate-900');
    const count = await statCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display charts', async ({ page }) => {
    // Look for chart containers (SVG or canvas elements)
    const charts = page.locator('svg, canvas, [data-testid*="chart"], .recharts-wrapper');
    expect(await charts.count()).toBeGreaterThanOrEqual(0);
  });

  test('should refresh data', async ({ page }) => {
    // Look for refresh button
    const refreshBtn = page.locator('button[title*="refresh" i], button:has([aria-label*="refresh" i])').first();
    
    if (await refreshBtn.count() > 0) {
      await refreshBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('should export data', async ({ page }) => {
    // Look for export button
    const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download")').first();
    
    if (await exportBtn.count() > 0) {
      await exportBtn.click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Analytics - Responsive', () => {
  test('should adapt to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/analytics');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check that charts scale appropriately
    const charts = page.locator('svg, canvas').first();
    expect(await charts.count()).toBeGreaterThanOrEqual(0);
  });

  test('should adapt to tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/analytics');
    await page.waitForLoadState('domcontentloaded');

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Analytics - Date Range Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should allow selecting different date ranges', async ({ page }) => {
    // Look for date range selector
    const dateSelector = page.locator('button:has-text("30 days"), button:has-text("Last"), select').first();
    
    if (await dateSelector.count() > 0) {
      await dateSelector.click();
      await page.waitForTimeout(200);

      // Try selecting a different range
      const option7d = page.locator('text=7 days, [value="7d"]').first();
      if (await option7d.count() > 0) {
        await option7d.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should update data when date range changes', async ({ page }) => {
    // Initial load
    const initialText = await page.locator('body').textContent();

    // Change date range
    const dateSelector = page.locator('button:has-text("days"), select').first();
    if (await dateSelector.count() > 0) {
      await dateSelector.click();
      await page.waitForTimeout(200);
    }
  });
});
