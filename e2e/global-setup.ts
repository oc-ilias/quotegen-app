/**
 * Global Setup for Playwright E2E Tests
 * Handles Node.js 22+ compatibility, TransformStream polyfill, and environment setup
 */

import { execSync } from 'child_process';

// Polyfill TransformStream for Node.js 22+ compatibility
if (typeof globalThis.TransformStream === 'undefined') {
  try {
    const { TransformStream } = await import('stream/web');
    (globalThis as any).TransformStream = TransformStream;
  } catch {
    // Fallback implementation if stream/web not available
    class TransformStreamPolyfill {
      readable: ReadableStream;
      writable: WritableStream;
      
      constructor(transformer?: Transformer<any, any>) {
        const { readable, writable } = new TransformStream(transformer);
        this.readable = readable;
        this.writable = writable;
      }
    }
    (globalThis as any).TransformStream = TransformStreamPolyfill;
  }
}

async function globalSetup(): Promise<void> {
  console.log('🎭 Starting Playwright global setup...');

  // Verify environment
  const nodeVersion = process.version;
  console.log(`Node.js version: ${nodeVersion}`);

  // Check for Node.js 22+ and log compatibility info
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (majorVersion >= 22) {
    console.log('✅ Node.js 22+ detected - compatibility settings applied');
  }

  // Ensure TransformStream is available
  if (typeof globalThis.TransformStream === 'undefined') {
    console.warn('⚠️ TransformStream not available, polyfill may be needed');
  } else {
    console.log('✅ TransformStream available');
  }

  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy';
  
  // Suppress Next.js specific warnings
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  
  console.log('✅ Global setup complete');
}

export default globalSetup;
