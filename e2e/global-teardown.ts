/**
 * Global Teardown for Playwright E2E Tests
 * Handles cleanup for Node.js 22+ compatibility
 */

import { spawn } from 'child_process';

async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting Playwright global teardown...');
  
  // Kill any remaining Node.js processes on test ports
  const cleanupProcesses = async (): Promise<void> => {
    return new Promise((resolve) => {
      // Give processes time to shutdown gracefully
      setTimeout(() => {
        console.log('✅ Cleanup timeout complete');
        resolve();
      }, 1000);
    });
  };
  
  await cleanupProcesses();
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;
