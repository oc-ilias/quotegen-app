import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * Optimized for Node.js 22+ compatibility
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',

  // Node.js 22+ compatibility settings
  timeout: 60 * 1000, // 60 second timeout per test
  expect: {
    timeout: 10 * 1000, // 10 second timeout for expect assertions
  },

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Node.js 22+ action timeout settings
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // Global setup/teardown for Node.js 22+ compatibility
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
});
