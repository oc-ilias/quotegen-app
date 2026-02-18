/**
 * Lighthouse CI Configuration for Static Build Testing
 * Tests against the statically exported build
 */

export default {
  ci: {
    collect: {
      // Test against static build - pointing to server pages
      staticDistDir: './dist/server/app',
      url: [
        'http://localhost/',
        'http://localhost/dashboard',
        'http://localhost/quotes/new',
        'http://localhost/analytics',
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        chromeFlags: [
          '--headless=new',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-reports',
    },
  },
};
