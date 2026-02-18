/**
 * Global Setup for Playwright E2E Tests
 * Handles Node.js 22+ compatibility and environment setup
 */

async function globalSetup(): Promise<void> {
  console.log('🎭 Starting Playwright global setup...');

  // Verify environment
  const nodeVersion = process.version;
  console.log(`Node.js version: ${nodeVersion}`);

  // Check for Node.js 22+ and log compatibility info
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (majorVersion >= 22) {
    console.log('✅ Node.js 22+ detected - applying compatibility settings');
  }

  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy';

  console.log('✅ Global setup complete');
}

export default globalSetup;
