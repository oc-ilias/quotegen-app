import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * Optimized for Node.js 22+ compatibility and minimal memory usage
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid memory issues
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Single worker to prevent memory issues
  reporter: [['list'], ['html', { open: 'never' }]],

  // Node.js 22+ compatibility settings - reduced timeouts for faster feedback
  timeout: 45 * 1000, // 45 second timeout per test
  expect: {
    timeout: 8 * 1000, // 8 second timeout for expect assertions
  },

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Optimized action timeout for Node.js 22+
    actionTimeout: 10 * 1000,
    navigationTimeout: 20 * 1000,
    // Launch options for Node.js 22+ compatibility - reduced memory footprint
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--js-flags=--max-old-space-size=512',
      ],
    },
    // Browser context options
    contextOptions: {
      viewport: { width: 1280, height: 720 },
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--js-flags=--max-old-space-size=512',
          ],
        },
      },
    },
  ],

  // Web server configuration with Node.js 22+ compatibility
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      // Ensure Node.js 22+ compatibility
      NODE_OPTIONS: '--no-warnings',
      NODE_ENV: 'test',
    },
  },

  // Global setup/teardown for Node.js 22+ compatibility
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
});
