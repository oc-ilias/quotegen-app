/**
 * Lighthouse CI Configuration for QuoteGen
 * 
 * This configuration sets up automated performance auditing with:
 * - Target: 90+ score for all categories
 * - Core Web Vitals assertions (LCP < 2.5s, FID < 100ms, CLS < 0.1)
 * - Testing against multiple pages: dashboard, quotes, analytics
 * 
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 */

export default {
  // Core CI configuration
  ci: {
    // Collect phase: Run Lighthouse audits
    collect: {
      // Number of times to run Lighthouse per URL for statistical significance
      numberOfRuns: 3,
      
      // URLs to test
      url: [
        'http://localhost:3000/',              // Homepage
        'http://localhost:3000/dashboard',     // Dashboard page
        'http://localhost:3000/quotes',        // Quotes list page
        'http://localhost:3000/quotes/new',    // New quote page
        'http://localhost:3000/analytics',     // Analytics page
      ],
      
      // Start the server before collecting
      startServerCommand: 'npm run start',
      
      // Wait for the server to be ready
      startServerReadyPattern: 'Ready in',
      
      // Wait for a specific time after server starts (in ms)
      startServerReadyTimeout: 60000,
      
      // Settings for Lighthouse runs
      settings: {
        // Use desktop preset for consistent results
        preset: 'desktop',
        
        // Additional Chrome flags for stability in CI
        chromeFlags: [
          '--headless=new',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-accelerated-jpeg-decoding',
          '--disable-accelerated-mjpeg-decode',
          '--disable-accelerated-video-decode',
          '--disable-extensions',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-renderer-backgrounding',
          '--enable-features=NetworkService,NetworkServiceInProcess',
          '--force-color-profile=srgb',
          '--hide-scrollbars',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-default-browser-check',
          '--no-first-run',
        ],
        
        // Throttling settings (simulated 4G)
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 150,
          throughputKbps: 1.6 * 1024,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        
        // Screen emulation
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        
        // Form factor
        formFactor: 'desktop',
        
        // Only categories we care about
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
        
        // Skip audits that are flaky or not relevant
        skipAudits: [
          'uses-http2',
          'canonical',
          'robots-txt',
          'maskable-icon',
        ],
      },
      
      // Add extra headers if needed (e.g., for auth)
      // headers: {
      //   'X-Test-Header': 'lighthouse-ci',
      // },
    },
    
    // Assert phase: Define pass/fail criteria
    assert: {
      // Assertion preset - can be 'lighthouse:recommended' or custom
      preset: 'lighthouse:recommended',
      
      // Assertions configuration
      assertions: {
        // =====================================
        // Category Score Assertions (90+ target)
        // =====================================
        'categories:performance': [
          'error',
          { minScore: 0.9, aggregationMethod: 'median-run' },
        ],
        'categories:accessibility': [
          'error',
          { minScore: 0.9, aggregationMethod: 'median-run' },
        ],
        'categories:best-practices': [
          'error',
          { minScore: 0.9, aggregationMethod: 'median-run' },
        ],
        'categories:seo': [
          'error',
          { minScore: 0.9, aggregationMethod: 'median-run' },
        ],
        
        // =====================================
        // Core Web Vitals Assertions
        // =====================================
        
        // Largest Contentful Paint (LCP) - Target: < 2.5s
        // Measures loading performance
        'largest-contentful-paint': [
          'error',
          { maxNumericValue: 2500, aggregationMethod: 'median-run' },
        ],
        
        // First Input Delay (FID) - Target: < 100ms (measured via Total Blocking Time)
        // FID is field data; TBT is the lab equivalent
        'total-blocking-time': [
          'error',
          { maxNumericValue: 200, aggregationMethod: 'median-run' },
        ],
        
        // Interaction to Next Paint (INP) - Modern replacement for FID
        'interaction-to-next-paint': [
          'warn',
          { maxNumericValue: 200, aggregationMethod: 'median-run' },
        ],
        
        // Cumulative Layout Shift (CLS) - Target: < 0.1
        // Measures visual stability
        'cumulative-layout-shift': [
          'error',
          { maxNumericValue: 0.1, aggregationMethod: 'median-run' },
        ],
        
        // First Contentful Paint (FCP) - Good to have
        'first-contentful-paint': [
          'warn',
          { maxNumericValue: 1800, aggregationMethod: 'median-run' },
        ],
        
        // Speed Index
        'speed-index': [
          'warn',
          { maxNumericValue: 3400, aggregationMethod: 'median-run' },
        ],
        
        // =====================================
        // Performance Audit Assertions
        // =====================================
        
        // Server response time
        'server-response-time': [
          'error',
          { maxNumericValue: 600, aggregationMethod: 'median-run' },
        ],
        
        // Render blocking resources
        'render-blocking-resources': [
          'warn',
          { maxLength: 0 },
        ],
        
        // Unused JavaScript
        'unused-javascript': [
          'warn',
          { maxLength: 2 },
        ],
        
        // Unused CSS
        'unused-css-rules': [
          'warn',
          { maxLength: 2 },
        ],
        
        // Image optimization
        'modern-image-formats': [
          'warn',
          { maxLength: 3 },
        ],
        
        'unsized-images': [
          'error',
          { maxLength: 0 },
        ],
        
        // =====================================
        // Accessibility Assertions
        // =====================================
        
        'color-contrast': [
          'error',
          { minScore: 1 },
        ],
        
        'image-alt': [
          'error',
          { minScore: 1 },
        ],
        
        'label': [
          'error',
          { minScore: 1 },
        ],
        
        'link-name': [
          'error',
          { minScore: 1 },
        ],
        
        // =====================================
        // Best Practices Assertions
        // =====================================
        
        'errors-in-console': [
          'error',
          { minScore: 1 },
        ],
        
        'inspector-issues': [
          'warn',
          { minScore: 1 },
        ],
        
        // =====================================
        // SEO Assertions
        // =====================================
        
        'document-title': [
          'error',
          { minScore: 1 },
        ],
        
        'meta-description': [
          'error',
          { minScore: 1 },
        ],
        
        'http-status-code': [
          'error',
          { minScore: 1 },
        ],
        
        'link-text': [
          'warn',
          { minScore: 1 },
        ],
        
        // =====================================
        // PWA Assertions (optional)
        // =====================================
        'service-worker': 'off',
        'works-offline': 'off',
        'viewport': [
          'error',
          { minScore: 1 },
        ],
        
        // =====================================
        // Diagnostic Audits (warnings only)
        // =====================================
        'uses-long-cache-ttl': 'off',
        'dom-size': [
          'warn',
          { maxNumericValue: 1400 },
        ],
        'bootup-time': [
          'warn',
          { maxNumericValue: 2000 },
        ],
        'mainthread-work-breakdown': [
          'warn',
          { maxNumericValue: 3500 },
        ],
      },
    },
    
    // Upload phase: Where to store results
    upload: {
      // Upload to temporary public storage
      target: 'temporary-public-storage',
      
      // Or use your own LHCI server:
      // target: 'lhci',
      // serverBaseUrl: 'http://localhost:9001',
      // token: 'your-build-token',
      
      // GitHub integration
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
      githubToken: process.env.LHCI_GITHUB_TOKEN,
      
      // Upload options
      outputDir: './lhci-reports',
      
      // Ignore duplicate build warnings
      ignoreDuplicateBuildFailure: true,
    },
    
    // Wizard phase: Configuration wizard (not used in CI)
    wizard: {
      // No CI-specific settings needed
    },
    
    // Server phase: Run LHCI server (optional, for self-hosted)
    server: {
      // Storage method
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci-server.db',
      },
      
      // Server port
      port: 9001,
      
      // Basic authentication (set in environment)
      basicAuth: {
        username: process.env.LHCI_SERVER_USERNAME || 'admin',
        password: process.env.LHCI_SERVER_PASSWORD || 'changeme',
      },
    },
  },
};
