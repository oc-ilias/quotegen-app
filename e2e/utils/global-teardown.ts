/**
 * Global Teardown for Playwright E2E Tests
 * Runs once after all test suites complete
 */

import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 Cleaning up E2E Test Suite...');
  
  // Cleanup any test data, sessions, or temporary files
  const testResults = config.reporter?.find(r => r[0] === 'json')?.[1] as { outputFile?: string };
  
  if (testResults?.outputFile) {
    console.log(`📊 Test results saved to: ${testResults.outputFile}`);
  }
  
  // Log test summary
  console.log('✅ Global teardown complete');
  console.log('\n📋 Test Reports:');
  console.log('   - HTML Report: npx playwright show-report');
  console.log('   - JSON Report: e2e/reports/test-results.json');
  console.log('   - JUnit Report: e2e/reports/junit-report.xml');
}

export default globalTeardown;
