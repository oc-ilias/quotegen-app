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
  reporter: [['list'], ['html', { open: 'never' }]],

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
    // Launch options for Node.js 22+ compatibility
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
    },
  },

  // Global setup/teardown for Node.js 22+ compatibility
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),
});
