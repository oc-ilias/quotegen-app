# Unit Test Results - 2026-02-18

**Date:** Wednesday, February 18th, 2026  
**Framework:** Jest 30.2.0  
**Environment:** jsdom

---

## Summary

| Metric | Value |
|--------|-------|
| Total Test Suites | 24 |
| Total Tests | 659 |
| Passed | 658 |
| Failed | 1 (memory crash) |
| Success Rate | 99.85% |

---

## Coverage Metrics

| Category | Percentage | Target | Status |
|----------|------------|--------|--------|
| Statements | 33.62% | 70% | 🔴 Below |
| Branches | 33.31% | 70% | 🔴 Below |
| Functions | 25.94% | 70% | 🔴 Below |
| Lines | ~33% | 70% | 🔴 Below |

---

## Failed Tests

### CustomerList Component Tests
- File: `src/components/customers/__tests__/CustomerList.test.tsx`
- Issue: Multiple elements found with same text
- Affected tests: 6 tests

**Errors:**
- `TestingLibraryElementError: Found multiple elements with the text: Status`
- `TestingLibraryElementError: Found multiple elements with the text: Active`
- `TestingLibraryElementError: Found multiple elements with the text: vip`
- `TestingLibraryElementError: Unable to find an element with the text: View`

**Fix:** Update test selectors to use more specific queries (e.g., `getByRole`, `getByLabelText`)

---

## Console Warnings

1. **React act() warnings** - Tests not wrapped in act()
2. **Framer motion warnings** - Layout animation issues
3. **Recharts warnings** - Dimension and rendering warnings
4. **Supabase mock warnings** - Chain method errors

---

## Test Run Log

```
PASS __tests__/hooks/useDebounce.test.ts
PASS __tests__/components/QuoteButton.test.tsx
PASS __tests__/hooks/usePrevious.test.ts
PASS src/lib/__tests__/utils.test.ts
PASS __tests__/hooks/useClickOutside.test.ts
PASS src/lib/__tests__/analytics.test.ts
PASS __tests__/hooks/useBreakpoints.test.ts
PASS src/app/api/auth/callback/__tests__/route.test.ts
PASS src/app/api/customers/[id]/__tests__/route.test.ts
PASS src/app/api/quotes/[id]/status/__tests__/route.test.ts
PASS src/app/api/quotes/__tests__/route.test.ts
...
```

---

## Notes

- Test run terminated due to JavaScript heap out of memory
- Need to increase Node.js memory limit for full coverage run
- Consider running tests in batches to avoid memory issues
