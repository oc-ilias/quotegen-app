/**
 * Lighthouse CI Configuration
 * Performance auditing for QuoteGen application
 */

module.exports = {
  ci: {
    collect: {
      // Number of runs to average
      numberOfRuns: 3,
      
      // URL to test
      url: [
        'https://quotegen-quazdheta-oc-ilias-projects.vercel.app/dashboard',
        'https://quotegen-quazdheta-oc-ilias-projects.vercel.app/quotes',
        'https://quotegen-quazdheta-oc-ilias-projects.vercel.app/customers',
        'https://quotegen-quazdheta-oc-ilias-projects.vercel.app/analytics',
      ],
      
      // Start server for local testing
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 60000,
      
      // Settings
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless',
        emulatedFormFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    
    assert: {
      // Performance assertions
      assertions: {
        // Core Web Vitals
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Specific metrics
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        
        // Resource budgets
        'resource-summary:document:size': ['error', { maxNumericValue: 50000 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }],
        'resource-summary:image:size': ['error', { maxNumericValue: 1000000 }],
        
        // Network requests
        'resource-summary:request:count': ['error', { maxNumericValue: 50 }],
      },
    },
    
    upload: {
      // Upload to Lighthouse CI server or temporary storage
      target: 'temporary-public-storage',
      
      // GitHub status check
      githubApp: {
        token: process.env.LHCI_GITHUB_APP_TOKEN,
      },
    },
  },
};
