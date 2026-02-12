# QuoteGen Next.js Production Configuration

## Overview
The `next.config.ts` has been fully optimized for production performance. This document summarizes all the optimizations applied.

## 📦 Installation Requirements

The following packages were added as dev dependencies:

```bash
npm install -D @next/bundle-analyzer cross-env
```

## 🔧 Configuration Sections

### 1. Webpack Optimizations

#### Bundle Analyzer
- Run with: `npm run analyze` or `ANALYZE=true npm run build`
- Visualizes bundle size to identify optimization opportunities

#### Code Splitting
Vendor chunks are split into separate bundles for optimal caching:
- **react** - React framework (changes rarely)
- **animations** - Framer Motion (heavy library)
- **pdf** - PDF generation libraries (heavy, loaded on demand)
- **charts** - Recharts visualization
- **supabase** - Database client
- **commons** - Shared utilities

#### Tree Shaking
- `usedExports: true` - Eliminates dead code
- `sideEffects: false` - Respects package.json sideEffects
- `concatenateModules: true` - Module concatenation for smaller bundles

### 2. Image Optimization

```typescript
images: {
  formats: ["image/webp", "image/avif"],  // Modern formats
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 86400,  // 1 day cache
}
```

**Allowed Domains:**
- Supabase storage (`**.supabase.co`)
- Unsplash (`images.unsplash.com`)
- Cloudinary (`res.cloudinary.com`)

### 3. Experimental Features

#### optimizePackageImports
Packages configured for automatic tree-shaking:
- `framer-motion`
- `@heroicons/react`
- `date-fns`
- `lodash` / `lodash-es`
- `recharts`
- `@headlessui/react`

#### serverComponentsExternalPackages
Packages kept external (use Node.js APIs):
- `@react-pdf/renderer`
- `jspdf`
- `html2canvas`

#### Other Experimental
- `webpackBuildWorker: true` - Multi-core builds
- `optimizeCss: true` - Remove unused CSS (production)
- `scrollRestoration: true` - Better UX on navigation

### 4. Headers & Caching

#### Security Headers
- `Strict-Transport-Security` - HSTS (2 years)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy` - Comprehensive CSP
- `Permissions-Policy` - Feature access control

#### Static Asset Caching
| Path | Cache Strategy |
|------|----------------|
| `/_next/static/*` | `public, max-age=31536000, immutable` |
| `/_next/image/*` | `public, max-age=86400, stale-while-revalidate=604800` |
| `/fonts/*` | `public, max-age=31536000, immutable` |
| `/images/*` | `public, max-age=86400, stale-while-revalidate=604800` |

#### API Route Caching
| Route | Cache Strategy |
|-------|----------------|
| `/api/quotes/*` | `public, s-maxage=60, stale-while-revalidate=300` |
| `/api/categories/*` | `public, s-maxage=300, stale-while-revalidate=86400` |
| `/api/templates/*` | `public, s-maxage=300, stale-while-revalidate=86400` |

### 5. Redirects & Rewrites

#### Canonicalization
- `www.quotegen.app/*` → `https://quotegen.app/*` (permanent)

#### Legacy Redirects
- `/quote/old/:id` → `/quotes/:id`
- `/dashboard/old` → `/dashboard`
- `/api/v1/export/pdf` → `/api/export/pdf`

#### Utility Redirects
- `/home` → `/`
- `/app` → `/dashboard`

### 6. Environment Variables

**Public (Client-side):**
```env
NEXT_PUBLIC_APP_NAME=QuoteGen
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=https://quotegen.app
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_STRIPE=true
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

**Server-only:**
Configure in your deployment environment (not in config):
```env
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
RESEND_API_KEY=
```

### 7. Build Output

- `distDir: "dist"` - Custom build directory
- `cleanDistDir: true` - Clean before build

### 8. Performance Optimizations

| Setting | Value | Description |
|---------|-------|-------------|
| `swcMinify` | `true` | Faster minification |
| `poweredByHeader` | `false` | Hide X-Powered-By |
| `compress` | `true` | Gzip compression |
| `trailingSlash` | `false` | SEO-friendly URLs |

## 🚀 Usage

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Bundle Analysis
```bash
npm run analyze
```

### Type Checking
```bash
npm run type-check
```

## 📊 Performance Checklist

- [x] Bundle analyzer configured
- [x] Code splitting for vendor chunks
- [x] Tree shaking enabled
- [x] Modern image formats (WebP, AVIF)
- [x] Image optimization domains configured
- [x] Static asset caching headers
- [x] API route stale-while-revalidate
- [x] Security headers (CSP, HSTS, etc.)
- [x] WWW to non-WWW redirect
- [x] Legacy URL redirects
- [x] Environment variables documented
- [x] SWC minification enabled
- [x] Gzip compression enabled
- [x] Powered-by header disabled

## 🔒 Security Summary

The configuration includes comprehensive security headers:
- **HSTS**: Forces HTTPS for 2 years
- **CSP**: Prevents XSS and data injection
- **Frame Options**: Prevents clickjacking
- **Content-Type Options**: Prevents MIME sniffing
- **Referrer Policy**: Controls referrer leakage
- **Permissions Policy**: Restricts feature access

## 📝 Notes

1. **Turbopack vs Webpack**: Next.js 16 uses Turbopack by default in development. The webpack configuration is still used for production builds.

2. **Bundle Analyzer**: The analyzer only runs when `ANALYZE=true` is set, so it doesn't affect normal builds.

3. **Image Domains**: Update the `images.remotePatterns` array if you need to add more external image sources.

4. **API Caching**: Adjust `s-maxage` values based on how frequently your data changes.

5. **CSP Policy**: The Content Security Policy is configured for the current app features. Update if you add new external services.
