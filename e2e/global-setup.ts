/**
 * Global Setup for Playwright E2E Tests
 * Handles Node.js 22+ compatibility and environment setup
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
  
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';
  
  // Check if required environment variables are set
  const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('Using default test values...');
  }
  
  console.log('✅ Global setup complete');
}

export default globalSetup;
