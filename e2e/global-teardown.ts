/**
 * Global Teardown for Playwright E2E Tests
 * Handles cleanup for Node.js 22+ compatibility
 * 
 * Ensures proper cleanup of:
 * - Browser processes
 * - Web server processes
 * - Temporary files
 */

import { execSync } from 'child_process';

async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting Playwright global teardown...');
  
  // Kill any remaining Node.js processes on test ports
  const cleanupProcesses = async (): Promise<void> => {
    return new Promise((resolve) => {
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
          execSync('pkill -f "webkit" 2>/dev/null || true', { stdio: 'ignore' });
          console.log('✅ Cleaned up browser processes');
        } catch {
          // Ignore errors if no processes found
        }
      } catch (error) {
        console.warn('⚠️  Some cleanup steps failed, but continuing...');
      }
      
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
