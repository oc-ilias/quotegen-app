# Lighthouse CI Configuration

This document describes the Lighthouse CI setup for QuoteGen performance auditing.

## Overview

Lighthouse CI is configured to automatically audit the application's performance, accessibility, best practices, and SEO on every push and pull request.

## Configuration Files

| File | Purpose |
|------|---------|
| `lighthouserc.js` | Main CI configuration with strict assertions (90+ scores) |
| `lighthouserc.local.js` | Relaxed configuration for local development |
| `lighthouserc-server.js` | Self-hosted LHCI server configuration |
| `.github/workflows/lighthouse.yml` | GitHub Actions workflow |

## Quick Start

### Local Development

```bash
# Build and run Lighthouse CI with relaxed assertions
npm run lighthouse:local
```

### Manual Run with Full Assertions

```bash
# Run with strict CI assertions (requires 90+ scores)
npm run lighthouse:assert
```

### Start Self-Hosted Server

```bash
# Start the LHCI server for historical data
npm run lighthouse:server
```

## Target URLs

The following pages are audited:

1. `/` - Homepage
2. `/dashboard` - Dashboard page
3. `/quotes` - Quotes list page
4. `/quotes/new` - New quote page
5. `/analytics` - Analytics page

## Assertions

### Category Scores

| Category | Target | Assertion |
|----------|--------|-----------|
| Performance | 90+ | Error if below 90 |
| Accessibility | 90+ | Error if below 90 |
| Best Practices | 90+ | Error if below 90 |
| SEO | 90+ | Error if below 90 |

### Core Web Vitals

| Metric | Target | Lab Equivalent |
|--------|--------|----------------|
| LCP (Largest Contentful Paint) | < 2.5s | `largest-contentful-paint` |
| FID (First Input Delay) | < 100ms | `total-blocking-time` |
| CLS (Cumulative Layout Shift) | < 0.1 | `cumulative-layout-shift` |
| INP (Interaction to Next Paint) | < 200ms | `interaction-to-next-paint` |

## GitHub Actions Integration

The workflow runs on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual trigger via `workflow_dispatch`

### Secrets Required

| Secret | Purpose |
|--------|---------|
| `LHCI_GITHUB_APP_TOKEN` | GitHub App token for PR comments (optional) |
| `LHCI_GITHUB_TOKEN` | GitHub token (auto-provided) |
| `NEXT_PUBLIC_SUPABASE_URL` | Build-time env var |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build-time env var |

## CI Workflow

1. **Build**: Compiles the Next.js application
2. **Lighthouse**: Runs audits against localhost:3000
3. **Summary**: Generates GitHub job summary
4. **Notify**: Alerts on failure (main branch only)

## PR Comments

When a PR is opened, the workflow automatically comments with:
- Performance scores for each URL
- Accessibility scores
- Best practices scores
- SEO scores
- Core Web Vitals metrics

## Artifacts

Lighthouse reports are saved as artifacts for 30 days:
- HTML reports
- JSON results
- Manifest files

## Troubleshooting

### Chrome Not Found

```bash
# On Ubuntu/Debian
sudo apt-get install chromium-browser

# Set CHROME_PATH environment variable
export CHROME_PATH=$(which chromium-browser)
```

### Assertion Failures

To temporarily relax assertions for debugging:

```bash
# Use local config
npx @lhci/cli autorun --config=lighthouserc.local.js
```

### Server Start Issues

If the server doesn't start properly, verify:
1. Port 3000 is available
2. `npm run build` completed successfully
3. Environment variables are set

## Resources

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Lighthouse Scoring Guide](https://web.dev/performance-scoring/)
- [Core Web Vitals](https://web.dev/vitals/)
