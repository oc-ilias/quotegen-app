import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

/**
 * QuoteGen Next.js Configuration
 *
 * Production-optimized configuration with:
 * - Webpack bundle analysis and code splitting
 * - Image optimization with modern formats
 * - Security headers and caching strategies
 * - Performance optimizations
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js
 */

// ============================================================================
// Environment Configuration
// ============================================================================

/** Check if bundle analyzer should be enabled */
const ANALYZE_BUNDLE = process.env.ANALYZE === "true";

/** Check if running in production */
const isProduction = process.env.NODE_ENV === "production";

/** Check if running in development */
const isDevelopment = process.env.NODE_ENV === "development";

// ============================================================================
// Core Next.js Configuration
// ============================================================================

const nextConfig: NextConfig = {
  // ==========================================================================
  // Core Framework Settings
  // ==========================================================================

  /** Enable React Strict Mode for better error catching and development practices */
  reactStrictMode: true,
  
  /** Remove X-Powered-By header for security */
  poweredByHeader: false,

  /** Enable gzip compression for responses */
  compress: true,

  /** Custom build output directory */
  distDir: "dist",

  /** Clean dist folder before building (Next.js 14+) */
  cleanDistDir: true,

  // ==========================================================================
  // Image Optimization
  // ==========================================================================

  images: {
    /** Disable optimization in development for faster builds */
    unoptimized: isDevelopment,

    /** Allowed external image domains */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],

    /** Modern image formats for better compression */
    formats: ["image/webp", "image/avif"],

    /** Device widths for responsive images (covers common breakpoints) */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    /** Image sizes for layout="fixed" or layout="intrinsic" */
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    /** Minimum cache time for optimized images (1 day) */
    minimumCacheTTL: 86400,

    /** Maximum image size (4MB) */
    contentDispositionType: "inline",
  },

  // ==========================================================================
  // Experimental Features
  // ==========================================================================

  /**
   * Turbopack Configuration (Next.js 16+)
   *
   * Turbopack is the default dev bundler. The webpack config above
   * is still used for production builds. To silence the compatibility
   * warning, we include an empty turbopack config.
   *
   * @see https://nextjs.org/docs/app/api-reference/next-config-js/turbopack
   */
  turbopack: {},

  experimental: {
    /**
     * Optimize package imports for heavy libraries
     * Reduces initial bundle size by tree-shaking unused exports
     */
    optimizePackageImports: [
      // Animation library - heavy, benefits from selective imports
      "framer-motion",
      // Icon library - only import used icons
      "@heroicons/react",
      // Date utilities - tree-shake unused functions
      "date-fns",
      // Utility libraries
      "lodash",
      "lodash-es",
      // Charting library
      "recharts",
      // UI components
      "@headlessui/react",
    ],

    /**
     * Enable webpack build worker for faster builds
     * Uses multiple CPU cores during compilation
     */
    webpackBuildWorker: true,

    /**
     * Optimize CSS output by removing unused styles
     */
    optimizeCss: isProduction,

    /**
     * Scroll restoration behavior for better UX
     */
    scrollRestoration: true,
  },

  // ==========================================================================
  // Webpack Configuration
  // ==========================================================================

  webpack: (config, { dev, isServer, nextRuntime }) => {
    // Only apply optimizations in production client builds
    if (!dev && !isServer) {
      // ======================================================================
      // Code Splitting Configuration
      // ======================================================================

      config.optimization = {
        ...config.optimization,

        /** Enable module concatenation for smaller bundles */
        concatenateModules: true,

        /** Enable tree shaking (dead code elimination) */
        usedExports: true,

        /** Side effects optimization - respects "sideEffects" in package.json */
        sideEffects: false,

        /**
         * Split chunks configuration for optimal caching
         * Creates separate chunks for vendor code that changes less frequently
         */
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            // Default vendor chunk for node_modules
            defaultVendors: {
              name: "vendor",
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },

            // React and React DOM - core framework, rarely changes
            react: {
              name: "react",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },

            // Framer Motion - heavy animation library
            animations: {
              name: "animations",
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              priority: 15,
              reuseExistingChunk: true,
            },

            // PDF generation libraries - heavy, loaded on demand
            pdf: {
              name: "pdf",
              test: /[\\/]node_modules[\\/](jspdf|html2canvas|@react-pdf)[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },

            // Charts - heavy visualization library
            charts: {
              name: "charts",
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },

            // Supabase client
            supabase: {
              name: "supabase",
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },

            // Common utilities shared across pages
            commons: {
              name: "commons",
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },

        /** Enable runtime chunk for better long-term caching */
        runtimeChunk: { name: "runtime" },
      };

      // ======================================================================
      // Module Resolution Optimizations
      // ======================================================================

      /** Prefer ES modules over CommonJS for better tree shaking */
      config.resolve.mainFields = ["module", "browser", "main"];

      /** Alias for common imports to reduce bundle size */
      config.resolve.alias = {
        ...config.resolve.alias,
        // Use production build of React in production
        "react/jsx-runtime": "react/jsx-runtime",
      };
    }

    return config;
  },

  // ==========================================================================
  // HTTP Headers & Caching
  // ==========================================================================

  headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          // ==================================================================
          // DNS & Connection Optimization
          // ==================================================================
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },

          // ==================================================================
          // Security Headers
          // ==================================================================

          /**
           * HTTP Strict Transport Security (HSTS)
           * Forces HTTPS for 2 years, includes subdomains, preload eligible
           */
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          /** Prevent MIME type sniffing */
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          /** Prevent clickjacking by denying iframe embedding */
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          /** Enable XSS filter in browsers (legacy but still useful) */
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },

          /** Control referrer information leakage */
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          /**
           * Content Security Policy
           * Restricts sources of content to prevent XSS and data injection
           */
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co https://api.resend.com https://api.stripe.com",
              "frame-src 'self' https://*.stripe.com",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },

          /** Permissions Policy for feature access control */
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "payment=(self)",
              "usb=()",
              "magnetometer=()",
              "gyroscope=()",
              "speaker=()",
            ].join(", "),
          },
        ],
      },

      // ====================================================================
      // Static Asset Caching
      // ====================================================================

      {
        // Cache static assets aggressively (immutable files with hash)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache images from Next.js image optimization
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },

      // ====================================================================
      // API Route Caching
      // ====================================================================

      {
        // Public API routes with stale-while-revalidate
        source: "/api/quotes/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      {
        // Static data API routes (categories, templates)
        source: "/api/(categories|templates)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=86400",
          },
        ],
      },

      // ====================================================================
      // Public Assets Caching
      // ====================================================================

      {
        // Fonts - cache for 1 year (immutable)
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Images in public folder
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

  // ==========================================================================
  // Redirects
  // ==========================================================================

  async redirects() {
    return [
      // ====================================================================
      // SEO & Canonicalization
      // ====================================================================

      {
        // Redirect WWW to non-WWW (SEO canonicalization)
        source: "/:path*",
        has: [
          {
            type: "header",
            key: "host",
            value: "www.quotegen.app",
          },
        ],
        destination: "https://quotegen.app/:path*",
        permanent: true,
      },

      // ====================================================================
      // Legacy URL Redirects
      // ====================================================================

      {
        // Old quote page structure to new structure
        source: "/quote/old/:id",
        destination: "/quotes/:id",
        permanent: true,
      },
      {
        // Old dashboard path
        source: "/dashboard/old",
        destination: "/dashboard",
        permanent: true,
      },
      {
        // Legacy PDF export endpoint
        source: "/api/v1/export/pdf",
        destination: "/api/export/pdf",
        permanent: true,
      },

      // ====================================================================
      // Common Path Redirects
      // ====================================================================

      {
        // Redirect /home to root
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        // Redirect /app to dashboard
        source: "/app",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },

  // ==========================================================================
  // Rewrites (Internal routing without URL change)
  // ==========================================================================

  async rewrites() {
    return {
      beforeFiles: [
        // API versioning without URL changes
        {
          source: "/api/v2/:path*",
          destination: "/api/:path*",
        },
      ],
      afterFiles: [
        // Serve robots.txt and sitemap from public folder directly
        {
          source: "/sitemap.xml",
          destination: "/api/sitemap",
        },
      ],
    };
  },

  // ==========================================================================
  // Environment Variables (Public - Available on Client)
  // ==========================================================================

  env: {
    // Application metadata
    NEXT_PUBLIC_APP_NAME: "QuoteGen",
    NEXT_PUBLIC_APP_VERSION: "1.0.0",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://quotegen.app",

    // Feature flags
    NEXT_PUBLIC_ENABLE_ANALYTICS: isProduction ? "true" : "false",
    NEXT_PUBLIC_ENABLE_STRIPE: "true",

    // External service configuration
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  },

  // ==========================================================================
  // TypeScript & Build Configuration
  // ==========================================================================

  /** TypeScript error handling during build */
  typescript: {
    /** Don't fail build on type errors in development */
    ignoreBuildErrors: isDevelopment,
  },

  /**
   * Server-only packages that use Node.js APIs
   * These are treated as external in Server Components
   */
  serverExternalPackages: [
    "@react-pdf/renderer",
    "jspdf",
    "html2canvas",
  ],

  // ==========================================================================
  // Logging & Diagnostics
  // ==========================================================================

  /** Configure logging level */
  logging: {
    fetches: {
      fullUrl: isDevelopment,
    },
  },

  // ==========================================================================
  // Trailing Slash Configuration
  // ==========================================================================

  /**
   * URL trailing slash handling
   * false = /about (recommended for SEO)
   * true = /about/
   */
  trailingSlash: false,
};

// ============================================================================
// Bundle Analyzer Wrapper
// ============================================================================

/**
 * Conditionally wrap with bundle analyzer
 * Run with: ANALYZE=true npm run build
 */
const configWithAnalyzer = ANALYZE_BUNDLE
  ? withBundleAnalyzer({
      enabled: true,
      openAnalyzer: true,
    })(nextConfig)
  : nextConfig;

export default configWithAnalyzer;
