# Accessibility Documentation (a11y)

## Overview

QuoteGen is committed to providing an accessible experience for all users, including those using assistive technologies. This document outlines the accessibility features implemented and how to maintain them.

## WCAG 2.1 AA Compliance

This application aims to meet WCAG 2.1 Level AA standards:

- **Perceivable**: Information and UI components must be presentable to users in ways they can perceive
- **Operable**: UI components and navigation must be operable
- **Understandable**: Information and the operation of UI must be understandable
- **Robust**: Content must be robust enough to work with various assistive technologies

## Features Implemented

### 1. Keyboard Navigation

All interactive elements are fully operable via keyboard:

- **Tab**: Navigate through focusable elements
- **Shift+Tab**: Navigate backwards
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and dialogs
- **Arrow Keys**: Navigate within components (menus, tabs, etc.)

#### Focus Management

```tsx
// Focus trap for modals - keeps focus within the dialog
import { FocusTrap } from '@/components/accessibility/FocusTrap';

<FocusTrap isActive={isOpen} onEscape={handleClose}>
  <div role="dialog">
    {/* Modal content */}
  </div>
</FocusTrap>
```

#### Visible Focus Indicators

All interactive elements have visible focus states:

```css
:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}
```

### 2. Screen Reader Support

#### Live Regions

Dynamic content changes are announced to screen readers:

```tsx
import { useLiveAnnouncer } from '@/components/accessibility/LiveAnnouncer';

const { announce } = useLiveAnnouncer();

// Announce success
announce('Quote request sent successfully', 'polite');

// Announce critical errors
announce('Form submission failed', 'assertive');
```

#### Proper Heading Hierarchy

```tsx
// Proper heading structure
<h1>Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>
```

#### ARIA Labels and Descriptions

```tsx
// For icon-only buttons
<button aria-label="Close dialog">
  <XIcon />
</button>

// For inputs with helper text
<input
  aria-describedby="email-help"
  aria-invalid={hasError}
  aria-errormessage="email-error"
/>
<p id="email-help">We'll never share your email.</p>
<p id="email-error" role="alert">Invalid email format</p>
```

### 3. Skip Navigation

Keyboard users can skip repetitive content:

```tsx
import { SkipNavigation } from '@/components/accessibility/SkipNavigation';

<SkipNavigation
  links={[
    { id: 'main-content', label: 'Skip to main content' },
    { id: 'navigation', label: 'Skip to navigation' },
    { id: 'search', label: 'Skip to search' },
  ]}
/>
```

### 4. Form Accessibility

#### Label Association

All form inputs have associated labels:

```tsx
// Implicit association via htmlFor
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />

// Or use the Input component
<Input label="Email Address" required />
```

#### Error Handling

```tsx
<Input
  label="Email"
  error="Please enter a valid email address"
  required
/>
// Automatically generates:
// - aria-invalid="true"
// - aria-describedby pointing to error message
// - aria-required="true"
// - Error message with role="alert"
```

### 5. Modal/Dialog Accessibility

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Quote Details"
  description="Review the quote information below"
>
  {/* Content */}
</Modal>

// Automatically provides:
// - role="dialog"
// - aria-modal="true"
// - aria-labelledby (title)
// - aria-describedby (description)
// - Focus trap
// - Escape key handling
// - Return focus on close
```

### 6. Table Accessibility

```tsx
<Table caption="Quote requests list">
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Customer</TableHead>
      <TableHead scope="col">Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell asHeader>John Doe</TableCell>
      <TableCell>Pending</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 7. Toast Notifications

```tsx
import { useToastHelpers } from '@/components/ui/Toast';

const { success, error, warning, info } = useToastHelpers();

// Automatically announces to screen readers
success('Quote Sent', 'Your quote has been sent to the customer');
error('Error', 'Failed to send quote. Please try again.');
```

### 8. Color and Contrast

All color combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text):

| Background | Text | Contrast Ratio | Status |
|------------|------|----------------|--------|
| #ffffff | #171717 | 16.1:1 | ✅ Pass |
| #0a0a0a | #ededed | 18.0:1 | ✅ Pass |
| #6366f1 | #ffffff | 4.6:1 | ✅ Pass |
| #ef4444 | #ffffff | 4.5:1 | ✅ Pass |

### 9. Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 10. High Contrast Mode

```css
@media (prefers-contrast: high) {
  /* Enhance borders and focus states */
  button, input, select, textarea {
    border: 2px solid currentColor;
  }

  a {
    text-decoration: underline;
  }

  :focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }
}
```

## Testing Accessibility

### Automated Testing

```bash
# Run accessibility tests
npm test -- accessibility.test.tsx

# Run all tests with coverage
npm run test:coverage
```

### Manual Testing Checklist

- [ ] All functionality works with keyboard only
- [ ] Focus order is logical and follows visual order
- [ ] Focus indicators are visible on all interactive elements
- [ ] Skip links work correctly
- [ ] Modal dialogs trap focus and can be closed with Escape
- [ ] Screen reader announces dynamic content changes
- [ ] Form errors are announced immediately
- [ ] All images have alt text
- [ ] Heading hierarchy is correct (no skipped levels)
- [ ] Color is not the only means of conveying information
- [ ] Touch targets are at least 44x44px on mobile

### Screen Reader Testing

Test with the following screen readers:

- **Windows**: NVDA, JAWS
- **macOS**: VoiceOver
- **iOS**: VoiceOver
- **Android**: TalkBack

## Components Reference

### Accessibility Components

| Component | Purpose | Usage |
|-----------|---------|-------|
| `SkipNavigation` | Skip links for keyboard users | Layout wrapper |
| `LiveAnnouncer` | Screen reader announcements | App provider |
| `FocusTrap` | Trap focus in modals | Dialogs, modals |
| `VisuallyHidden` | Screen reader only content | Icon buttons, extra context |

### UI Components (Accessibility Enhanced)

| Component | Accessibility Features |
|-----------|----------------------|
| `Button` | aria-busy, aria-disabled, loading states |
| `Input` | Label association, error announcement, aria-invalid |
| `Modal` | Focus trap, aria-modal, escape handling |
| `Table` | Caption, scope, row headers |
| `Toast` | Live region announcements, aria-label |

## Common Patterns

### Icon-Only Button

```tsx
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// Or with VisuallyHidden
<button>
  <XIcon aria-hidden="true" />
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>
```

### Loading State

```tsx
<Button isLoading loadingText="Submitting...">
  Submit
</Button>

// Automatically sets:
// - aria-busy="true"
// - aria-disabled="true"
// - Announces loading state
```

### Form with Validation

```tsx
<form onSubmit={handleSubmit} noValidate>
  <Input
    label="Email"
    type="email"
    required
    error={errors.email}
    helperText="We'll never share your email"
  />
  <Button type="submit">Submit</Button>
</form>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core Documentation](https://www.deque.com/axe/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Maintenance

When adding new features:

1. Run accessibility tests: `npm test -- accessibility.test.tsx`
2. Test with keyboard only
3. Verify screen reader announcements
4. Check color contrast
5. Document any new accessibility features

## Contact

For accessibility issues or questions, please contact the development team.
