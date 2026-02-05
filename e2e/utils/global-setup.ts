/**
 * Global Setup for Playwright E2E Tests
 * Runs once before all test suites
 */

import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E Test Suite...');
  console.log(`📍 Base URL: ${config.projects[0].use?.baseURL}`);
  
  // Set environment variables for tests
  process.env.TEST_ENV = 'e2e';
  process.env.MOCK_AUTH = 'true';
  
  // Verify test environment is ready
  const baseUrl = config.projects[0].use?.baseURL as string;
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      console.warn(`⚠️  Warning: Base URL returned ${response.status}`);
    } else {
      console.log('✅ Application is accessible');
    }
  } catch (error) {
    console.error('❌ Failed to connect to application:', error);
    throw new Error('Application is not running. Please start the dev server first.');
  }
  
  console.log('✅ Global setup complete\n');
}

export default globalSetup;
