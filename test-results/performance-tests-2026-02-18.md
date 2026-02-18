# Performance Test Results (Lighthouse) - 2026-02-18

**Date:** Wednesday, February 18th, 2026  
**Tool:** Lighthouse CI 0.15.1  
**Lighthouse Version:** 13.0.3

---

## Summary

| Category | Score | Status |
|----------|-------|--------|
| Performance | N/A* | ⚠️ Auth required |
| Accessibility | 91/100 | ✅ Good |
| Best Practices | 96/100 | ✅ Excellent |
| SEO | 91/100 | ✅ Good |

*Note: Performance testing was redirected to login page due to authentication requirements

---

## Core Web Vitals (Previous Run)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint (FCP) | 3.1s | <1.8s | 🔴 Poor |
| Largest Contentful Paint (LCP) | 8.3s | <2.5s | 🔴 Poor |
| Speed Index | 6.7s | <3.4s | 🔴 Poor |
| Time to Interactive (TTI) | ~8s | <3.8s | 🔴 Poor |
| Total Blocking Time (TBT) | ~200ms | <200ms | 🟡 Needs Improvement |
| Cumulative Layout Shift (CLS) | ~0.05 | <0.1 | ✅ Good |

---

## Build Analysis

```
Build Size: 618MB (extremely large)
Output Directory: dist/
Build Time: ~1.5s for static generation
Routes: 20+ pages
```

---

## Performance Issues

### Critical Issues

1. **Bundle Size (618MB)**
   - Far exceeds recommended 200KB initial bundle
   - Causes slow load times
   - Affects mobile users significantly

2. **Large Dependencies**
   - `@react-pdf/renderer` - 4.3.2
   - `jspdf` - 4.1.0
   - `html2canvas` - 1.4.1
   - `recharts` - 3.7.0

3. **Render Blocking Resources**
   - Heavy JavaScript bundles
   - No code splitting detected

---

## Recommendations

1. Implement code splitting
2. Lazy load heavy components
3. Optimize images
4. Enable compression
5. Tree shake unused dependencies
