import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from "@next/bundle-analyzer";

const baseConfig: NextConfig = {
  // Enable strict mode for better error catching
  reactStrictMode: true,
  
  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    // Enable styled-components optimization if needed
    styledComponents: false,
  },

  // Experimental optimizations
  experimental: {
    // Enable optimistic client cache
    optimisticClientCache: true,
    // Enable partial prerendering
    ppr: true,
    // Enable typed routes
    typedRoutes: true,
    // Enable webpack build worker
    webpackBuildWorker: true,
    // Enable parallel server builds
    parallelServerBuildTraces: true,
    // Optimize package imports for common heavy packages
    optimizePackageImports: [
      'recharts',
      'framer-motion',
      '@heroicons/react',
      'date-fns',
    ],
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
    // Modern image formats
    formats: ['image/webp', 'image/avif'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different layouts
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL (1 day)
    minimumCacheTTL: 86400,
  },
  
  // Enable compression
  compress: true,
  
  // Performance budgets
  performance: {
    // Bundle size budgets
    bundles: {
      // Maximum size for initial JS bundle (in KB)
      maxInitialSize: 250,
      // Maximum size for async chunks (in KB)
      maxAsyncSize: 500,
    },
  },
  
  // Security headers with performance optimizations
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://browser.sentry-cdn.com https://js.sentry-cdn.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co https://api.resend.com https://*.sentry.io https://sentry.io; worker-src 'self' blob:;"
          },
          // Performance: Long-term caching for static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      // Cache static assets for 1 year
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images for 1 day with stale-while-revalidate
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },
  
  // Webpack configuration for additional optimizations
  webpack: (config, { dev, isServer }) => {
    // Tree shaking optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        // Enable module concatenation
        concatenateModules: true,
        // Enable side effects optimization
        sideEffects: false,
        // Split chunks configuration
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // React and React DOM
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              priority: 40,
              enforce: true,
            },
            // Next.js core
            next: {
              test: /[\\/]node_modules[\\/](next)[\\/]/,
              name: 'next',
              priority: 30,
              enforce: true,
            },
            // UI libraries
            ui: {
              test: /[\\/]node_modules[\\/](@headlessui|@heroicons|framer-motion)[\\/]/,
              name: 'ui',
              priority: 20,
              enforce: true,
            },
            // Charts and visualization
            charts: {
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              name: 'charts',
              priority: 15,
              enforce: true,
            },
            // PDF generation (heavy, load on demand)
            pdf: {
              test: /[\\/]node_modules[\\/](@react-pdf|jspdf|html2canvas)[\\/]/,
              name: 'pdf',
              priority: 10,
              enforce: true,
              reuseExistingChunk: true,
            },
            // Supabase client
            supabase: {
              test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
              name: 'supabase',
              priority: 25,
              enforce: true,
            },
            // Vendor commons
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 5,
              enforce: true,
            },
          },
        },
      };
    }

    // Add support for web workers if needed
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: { loader: 'worker-loader' },
    });

    return config;
  },
  
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_APP_NAME: 'QuoteGen',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NODE_ENV === 'production' ? 'true' : 'false',
  },

  // Trailing slash configuration for SEO
  trailingSlash: false,

  // Powered by header
  poweredByHeader: false,

  // Generate ETags for caching
  generateEtags: true,
};

// Sentry configuration options
const sentryConfig = {
  // Sentry organization and project (set via environment variables)
  org: process.env.SENTRY_ORG || 'quotegen',
  project: process.env.SENTRY_PROJECT || 'quotegen-app',
  
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  
  // Upload additional client files (increases upload size)
  widenClientFileUpload: true,
  
  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },
  
  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: '/monitoring',
  
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  
  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
};

// Wrap with Sentry
const configWithSentry = withSentryConfig(baseConfig, sentryConfig);

// Wrap with bundle analyzer (only enabled when ANALYZE=true)
const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

export default withAnalyzer(configWithSentry);
