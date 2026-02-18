/**
 * Global Teardown for Playwright E2E Tests
 * Handles cleanup for Node.js 22+ compatibility
 */

import { execSync } from 'child_process';

async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting Playwright global teardown...');

  try {
    // Kill processes on port 3000 (Next.js dev server)
    try {
      execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', { stdio: 'ignore' });
      console.log('✅ Killed processes on port 3000');
    } catch {
      // Ignore errors if no processes found
    }

    // Kill any remaining Playwright browser processes
    try {
      execSync('pkill -f "chromium" 2>/dev/null || true', { stdio: 'ignore' });
      console.log('✅ Cleaned up browser processes');
    } catch {
      // Ignore errors if no processes found
    }
  } catch (error) {
    console.warn('⚠️  Some cleanup steps failed, but continuing...');
  }

  // Give processes time to shutdown gracefully
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('✅ Global teardown complete');
}

export default globalTeardown;
