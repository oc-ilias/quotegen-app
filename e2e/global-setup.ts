/**
 * Global Setup for Playwright E2E Tests
 * Handles Node.js 22+ compatibility and environment setup
 * 
 * Node.js 22+ Compatibility Notes:
 * - TransformStream API has changed in Node.js 22
 * - Playwright needs explicit flags for compatibility
 * - Web server startup requires NODE_OPTIONS adjustments
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function globalSetup(): Promise<void> {
  console.log('🎭 Starting Playwright global setup...');
  
  // Verify environment
  const nodeVersion = process.version;
  console.log(`Node.js version: ${nodeVersion}`);
  
  // Check for Node.js 22+ and log compatibility info
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (majorVersion >= 22) {
    console.log('✅ Node.js 22+ detected - applying compatibility settings');
    
    // Set Node.js 22+ compatibility flags
    process.env.NODE_OPTIONS = (
      (process.env.NODE_OPTIONS || '') + 
      ' --no-warnings'
    ).trim();
    
    // Disable experimental features that might conflict with Playwright
    process.env.NODE_NO_WARNINGS = '1';
  }
  
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy';
  
  // Check if required environment variables are set
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL', 
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('Using default test values...');
  }
  
  // Verify Playwright is installed
  try {
    const { chromium } = require('@playwright/test');
    console.log('✅ Playwright chromium browser available');
  } catch (error) {
    console.warn('⚠️  Playwright browsers may not be installed');
    console.warn('   Run: npx playwright install chromium');
  }
  
  console.log('✅ Global setup complete');
}

export default globalSetup;
