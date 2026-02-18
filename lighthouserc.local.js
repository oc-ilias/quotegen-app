/**
 * Lighthouse CI Configuration for Local Development
 * 
 * This is a relaxed configuration for local testing without strict assertions.
 * Use `npm run lighthouse:local` to run with this config.
 */

export default {
  ci: {
    collect: {
      numberOfRuns: 1,
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/quotes',
        'http://localhost:3000/analytics',
      ],
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 60000,
      settings: {
        preset: 'desktop',
        chromeFlags: [
          '--headless=new',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    
    // Relaxed assertions for local development
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Only warn, don't error on local runs
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Relaxed Core Web Vitals
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.25 }],
      },
    },
    
    upload: {
      target: 'temporary-public-storage',
      outputDir: './lhci-reports',
    },
  },
};
