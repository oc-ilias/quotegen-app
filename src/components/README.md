# QuoteGen Component Library

A comprehensive, production-ready React component library built for the QuoteGen application. This library provides a complete set of UI components, layout primitives, and feature-specific components designed with accessibility, performance, and developer experience in mind.

---

## Table of Contents

1. [Overview](#overview)
2. [Component Categories](#component-categories)
3. [Usage Examples](#usage-examples)
4. [Props Documentation](#props-documentation)
5. [Styling](#styling)
6. [Accessibility](#accessibility)
7. [Testing](#testing)
8. [Adding New Components](#adding-new-components)

---

## Overview

### Component Architecture

The QuoteGen component library follows a **layered architecture** designed for scalability and maintainability:

```
┌─────────────────────────────────────────────────────────────┐
│                    Feature Components                        │
│  (QuoteWizard, CustomerCard, QuoteActions, Analytics...)    │
├─────────────────────────────────────────────────────────────┤
│                    Layout Components                         │
│  (DashboardLayout, Header, Sidebar, PageHeader...)          │
├─────────────────────────────────────────────────────────────┤
│                      UI Components                           │
│  (Button, Input, Card, Badge, Modal, Table...)              │
├─────────────────────────────────────────────────────────────┤
│                   Utility Layer                              │
│  (cn utility, animations, hooks, types...)                  │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Composition Over Configuration**: Components are built to be composed together rather than configured through endless props
2. **Accessibility First**: All components meet WCAG 2.1 AA standards with proper ARIA attributes and keyboard navigation
3. **Type Safety**: Full TypeScript support with strict typing and comprehensive interfaces
4. **Performance**: Optimized with React.memo, proper memoization, and minimal re-renders
5. **Consistency**: Unified design tokens, spacing, and interaction patterns throughout
6. **Developer Experience**: Clear prop interfaces, comprehensive JSDoc comments, and extensive examples

### Usage Guidelines

```tsx
// ✅ Good: Composing components together
<Card hover>
  <CardHeader>
    <CardTitle>Quote Summary</CardTitle>
    <Badge variant="success">Active</Badge>
  </CardHeader>
  <CardContent>
    <p className="text-slate-400">Content here...</p>
  </CardContent>
</Card>

// ❌ Avoid: Excessive prop drilling
<Card 
  title="Quote Summary" 
  badge="Active" 
  badgeVariant="success"
  content="Content here..."
/>
```

---

## Component Categories

### UI Components

Found in `src/components/ui/`, these are the foundational building blocks of the application.

| Component | Description | File |
|-----------|-------------|------|
| `Button` | Multi-variant button with loading states | `Button.tsx` |
| `Input` | Form input with label, error, and helper text | `Input.tsx` |
| `Card` | Container component with header, title, description | `Card.tsx` |
| `Badge` | Status indicators with variants and animations | `Badge.tsx` |
| `Modal` | Dialog overlay with focus trapping | `Modal.tsx` |
| `Table` | Data table with header, body, row components | `Table.tsx` |
| `Avatar` | User avatars with fallback initials | `Avatar.tsx` |
| `StatCard` | Metric display cards for dashboards | `StatCard.tsx` |
| `Skeleton` | Loading skeletons for various content types | `Skeleton.tsx` |
| `Toast` | Notification system with provider | `Toast.tsx` |

### Layout Components

Found in `src/components/layout/`, these provide page structure and navigation.

| Component | Description | File |
|-----------|-------------|------|
| `DashboardLayout` | Main application layout with sidebar, header | `DashboardLayout.tsx` |
| `Header` | Top navigation with search, notifications, user menu | `Header.tsx` |
| `PageHeader` | Page title with breadcrumbs and actions | `DashboardLayout.tsx` |
| `ContentGrid` | Responsive grid layout for content | `DashboardLayout.tsx` |
| `ContentSection` | Section wrapper with title and actions | `DashboardLayout.tsx` |
| `ContentCard` | Styled container for content blocks | `DashboardLayout.tsx` |

### Navigation Components

Found in `src/components/navigation/`, these handle application navigation.

| Component | Description | File |
|-----------|-------------|------|
| `Sidebar` | Collapsible navigation sidebar | `Sidebar.tsx` |
| `SidebarItem` | Individual navigation items | `Sidebar.tsx` |
| `SidebarSection` | Grouped navigation sections | `Sidebar.tsx` |

### Feature Components

#### Quotes (`src/components/quotes/`)

| Component | Description |
|-----------|-------------|
| `QuoteActions` | Context-aware action buttons based on quote status |
| `QuoteFilters` | Filter controls for quote lists |
| `StatusHistory` | Timeline of quote status changes |
| `BulkActions` | Multi-select actions for quote management |

#### Customers (`src/components/customers/`)

| Component | Description |
|-----------|-------------|
| `CustomerCard` | Compact customer display for grids |
| `CustomerList` | List view for customer management |
| `CustomerForm` | Create/edit customer forms |
| `CustomerStats` | Customer analytics display |
| `CustomerFilters` | Filter controls for customer lists |

#### Wizard (`src/components/wizard/`)

| Component | Description |
|-----------|-------------|
| `QuoteWizard` | Multi-step quote creation wizard |
| `CustomerInfoStep` | Step 1: Customer selection/creation |
| `ProductSelectionStep` | Step 2: Product selection |
| `LineItemsStep` | Step 3: Line item configuration |
| `TermsNotesStep` | Step 4: Terms and notes |
| `ReviewSendStep` | Step 5: Review and send |

#### Dashboard (`src/components/dashboard/`)

| Component | Description |
|-----------|-------------|
| `StatCards` | Key metrics display |
| `RecentQuotes` | Recent quotes list |
| `ActivityFeed` | Activity timeline |
| `QuickActions` | Quick action buttons |

#### Analytics (`src/components/analytics/`)

| Component | Description |
|-----------|-------------|
| `AnalyticsDashboard` | Main analytics view |
| `RevenueChart` | Revenue visualization |
| `ConversionChart` | Conversion rate charts |
| `StatusBreakdown` | Quote status distribution |
| `TopProducts` | Top performing products |

#### PDF (`src/components/pdf/`)

| Component | Description |
|-----------|-------------|
| `QuotePDF` | PDF generation for quotes |

#### Email (`src/components/email/`)

| Component | Description |
|-----------|-------------|
| `EmailTemplateSelector` | Email template selection |

#### Export (`src/components/export/`)

| Component | Description |
|-----------|-------------|
| `CSVExportButton` | CSV export functionality |

### Accessibility Components

| Component | Description | File |
|-----------|-------------|------|
| `ErrorBoundary` | React error boundary with fallback UI | `ErrorBoundary.tsx` |
| `LoadingSpinner` | Accessible loading indicator | `ErrorBoundary.tsx` |

---

## Usage Examples

### Button Component

```tsx
import { Button } from '@/components/ui/Button';

// Primary button
<Button onClick={handleClick}>Create Quote</Button>

// With variants
<Button variant="secondary">Cancel</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Close</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Loading state
<Button isLoading onClick={handleSubmit}>
  Saving...
</Button>

// Disabled state
<Button disabled>Cannot Click</Button>

// With custom className
<Button className="w-full">Full Width</Button>
```

### Input Component

```tsx
import { Input } from '@/components/ui/Input';

// Basic usage
<Input 
  placeholder="Enter customer name" 
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// With label and error
<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
  helperText="We'll never share your email"
/>

// With icon
<Input
  label="Search"
  leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
  placeholder="Search quotes..."
/>
```

### Card Component

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/Card';

// Basic card
<Card>
  <CardHeader>
    <CardTitle>Quote Details</CardTitle>
    <CardDescription>View and manage quote information</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here...</p>
  </CardContent>
</Card>

// With hover effect
<Card hover padding="lg">
  <CardContent>
    <h3>Interactive Card</h3>
    <p>This card lifts on hover</p>
  </CardContent>
</Card>
```

### Badge Component

```tsx
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';

// Basic badges
<Badge variant="success">Completed</Badge>
<Badge variant="warning" dot>Pending</Badge>
<Badge variant="error">Failed</Badge>

// Status badge with animation
<StatusBadge 
  status={QuoteStatus.ACCEPTED} 
  animateOnChange 
  pulse 
/>

// Priority badge
<PriorityBadge priority="high" size="md" />
```

### Dashboard Layout

```tsx
import { DashboardLayout, PageHeader, ContentGrid, ContentCard } from '@/components/layout';

<DashboardLayout
  activeNavItem="quotes"
  userName="John Doe"
  userEmail="john@example.com"
  notifications={notifications}
  onNavigate={handleNavigate}
  onSearch={handleSearch}
>
  <PageHeader
    title="Quotes"
    subtitle="Manage your quotes and proposals"
    breadcrumbs={[
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Quotes' }
    ]}
    actions={
      <Button onClick={handleCreateQuote}>New Quote</Button>
    }
  />
  
  <ContentGrid cols={3}>
    <ContentCard>
      <StatCard title="Total Quotes" value="24" />
    </ContentCard>
    <ContentCard>
      <StatCard title="Pending" value="8" />
    </ContentCard>
    <ContentCard>
      <StatCard title="Accepted" value="12" />
    </ContentCard>
  </ContentGrid>
</DashboardLayout>
```

### Quote Actions

```tsx
import { QuoteActions } from '@/components/quotes/QuoteActions';
import { QuoteStatus } from '@/types/quote';

<QuoteActions
  quoteId="quote-123"
  currentStatus={QuoteStatus.SENT}
  quoteNumber="QT-001"
  onStatusChange={handleStatusChange}
  onEdit={handleEdit}
  onView={handleView}
  onDownload={handleDownload}
  size="md"
/>
```

### Quote Wizard

```tsx
import { QuoteWizard } from '@/components/wizard';
import type { WizardData } from '@/types/quote';

<QuoteWizard
  onComplete={async (data: WizardData) => {
    await createQuote(data);
    router.push('/quotes');
  }}
  onCancel={() => router.back()}
  allowSaveDraft={true}
/>
```

### Customer Card

```tsx
import { CustomerCard } from '@/components/customers/CustomerCard';
import type { CustomerWithStats } from '@/types/quote';

<CustomerCard
  customer={customer}
  onClick={() => router.push(`/customers/${customer.id}`)}
/>
```

### Skeleton Loading States

```tsx
import { 
  DashboardSkeleton, 
  CardSkeleton, 
  TableSkeleton,
  QuoteListSkeleton 
} from '@/components/ui/Skeleton';

// Full dashboard skeleton
{isLoading && <DashboardSkeleton />}

// Individual skeletons
<CardSkeleton header contentLines={3} actions />
<TableSkeleton rows={5} columns={4} />
<QuoteListSkeleton />
```

---

## Props Documentation

### Common Props Patterns

Most components in the library follow these common prop patterns:

```tsx
// Standard component props interface
interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  // Custom className for styling overrides
  className?: string;
  
  // Children content
  children?: React.ReactNode;
  
  // Ref forwarding
  ref?: React.Ref<HTMLElement>;
}

// Variant-based components
interface VariantProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

// State-based components
interface StateProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  isActive?: boolean;
  error?: string;
}

// Event handler components
interface EventProps {
  onClick?: (event: React.MouseEvent) => void;
  onChange?: (value: string) => void;
  onSubmit?: (data: FormData) => Promise<void>;
}
```

### Button Props

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Shows loading spinner |
| `className` | `string` | - | Additional CSS classes |

### Input Props

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Input label text |
| `error` | `string` | - | Error message (shows error styling) |
| `helperText` | `string` | - | Helper text below input |
| `leftIcon` | `React.ReactNode` | - | Icon to display inside input |

### Card Props

```tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hover` | `boolean` | `true` | Enable hover lift effect |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |

### Badge Props

```tsx
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  animate?: boolean;
}
```

### Event Handler Props

Components use standard React event handler types:

```tsx
// Mouse events
onClick?: (event: React.MouseEvent<HTMLElement>) => void;
onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;

// Form events
onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;

// Custom callbacks
onNavigate?: (item: NavItemId) => void;
onStatusChange?: (newStatus: QuoteStatus, comment?: string) => Promise<void>;
onComplete?: (data: WizardData) => void | Promise<void>;
```

---

## Styling

### Tailwind CSS Conventions

The component library uses **Tailwind CSS** for all styling with these conventions:

```tsx
// Use cn() utility for conditional class merging
import { cn } from '@/lib/utils';

// Pattern: Base styles + conditional variants + custom className
const buttonClasses = cn(
  // Base styles
  'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg',
  
  // Focus states
  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
  
  // Disabled states
  'disabled:opacity-50 disabled:cursor-not-allowed',
  
  // Interactive states
  'active:scale-[0.98]',
  
  // Variant styles (conditional)
  {
    'bg-indigo-500 text-white hover:bg-indigo-400': variant === 'primary',
    'bg-slate-800 text-slate-100': variant === 'secondary',
  },
  
  // Size styles (conditional)
  {
    'px-3 py-1.5 text-sm': size === 'sm',
    'px-4 py-2 text-base': size === 'md',
  },
  
  // Custom className override
  className
);
```

### Color Palette

The application uses a consistent color scheme based on Tailwind's slate and indigo scales:

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary | `indigo-500` | `#6366f1` |
| Primary Hover | `indigo-400` | `#818cf8` |
| Success | `emerald-500` | `#10b981` |
| Warning | `amber-500` | `#f59e0b` |
| Error | `red-500` | `#ef4444` |
| Background | `slate-950` | `#020617` |
| Card Background | `slate-900` | `#0f172a` |
| Border | `slate-800` | `#1e293b` |
| Text Primary | `slate-100` | `#f1f5f9` |
| Text Secondary | `slate-400` | `#94a3b8` |
| Text Muted | `slate-500` | `#64748b` |

### Custom className Handling

All components accept a `className` prop that is merged with base styles:

```tsx
// Custom styling while maintaining base functionality
<Button 
  variant="primary" 
  className="w-full md:w-auto shadow-lg"
>
  Submit
</Button>

// Override specific styles
<Card className="border-2 border-indigo-500/50">
  Highlighted Content
</Card>
```

### Theme Customization

To customize the theme, modify the Tailwind config or use CSS variables:

```css
/* globals.css */
:root {
  --color-primary: 99 102 241;
  --color-success: 16 185 129;
  --color-warning: 245 158 11;
  --color-error: 239 68 68;
}
```

Or extend Tailwind's theme:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
        },
      },
    },
  },
};
```

---

## Accessibility

### ARIA Requirements

All components implement proper ARIA attributes:

```tsx
// Button with proper ARIA
<button
  aria-label="Close dialog"
  aria-pressed={isActive}
  aria-describedby="button-description"
>
  <XMarkIcon />
</button>

// Modal with ARIA
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-description">Are you sure you want to proceed?</p>
</div>

// Navigation with ARIA
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" aria-current="page" href="/dashboard">
        Dashboard
      </a>
    </li>
  </ul>
</nav>
```

### Keyboard Navigation

Components support full keyboard navigation:

| Key | Action |
|-----|--------|
| `Tab` | Navigate to next focusable element |
| `Shift + Tab` | Navigate to previous focusable element |
| `Enter` / `Space` | Activate button or link |
| `Escape` | Close modals, dropdowns, menus |
| `Arrow Keys` | Navigate within lists, dropdowns |
| `Home` | Go to first item in list |
| `End` | Go to last item in list |

```tsx
// Keyboard shortcut support in Sidebar
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'b') {
        e.preventDefault();
        handleToggle();
      }
      if (e.key === 'n') {
        e.preventDefault();
        setIsCreateMenuOpen(true);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleToggle]);
```

### Screen Reader Support

```tsx
// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {notification && <p>{notification.message}</p>}
</div>

// Status announcements
<div role="status" aria-live="polite">
  <p>Quote saved successfully</p>
</div>

// Error announcements
<div role="alert" aria-live="assertive">
  <p>Error: Failed to save quote</p>
</div>

// Hidden decorative elements
<svg aria-hidden="true">
  {/* Icon content */}
</svg>

// Descriptive labels
<button aria-label="Delete customer John Doe">
  <TrashIcon />
</button>
```

### Focus Management

```tsx
// Focus trap in modals
useEffect(() => {
  if (isOpen) {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];
    
    firstElement?.focus();
  }
}, [isOpen]);

// Visible focus indicators
<button className="focus:outline-none focus:ring-2 focus:ring-indigo-500">
  Focusable Button
</button>

// Skip to content link
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
>
  Skip to main content
</a>
```

### Accessibility Testing

Use these tools to verify accessibility:

```bash
# Install axe-core
npm install --save-dev @axe-core/react

# Run accessibility tests
npm run test:a11y
```

```tsx
// Component test with accessibility checks
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should have no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Testing

### How to Test Components

Components should be tested using **React Testing Library** with a focus on user behavior:

```tsx
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies correct variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'primary');
    
    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'danger');
  });
});
```

### Test Utilities

```tsx
// test-utils.tsx
import { render as rtlRender } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render with providers
function render(ui: ReactElement, options = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    ),
    ...options,
  });
}

// Re-export everything
export * from '@testing-library/react';
export { render };
```

### Mocking Strategies

```tsx
// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    pathname: '/dashboard',
  }),
  usePathname: () => '/dashboard',
}));

// Mock framer-motion for simpler tests
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
  },
}));

// Mock API calls
jest.mock('@/lib/api', () => ({
  fetchQuotes: jest.fn().mockResolvedValue([]),
  createQuote: jest.fn().mockResolvedValue({ id: 'quote-1' }),
}));
```

### Test File Structure

```
src/components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── index.ts
└── quotes/
    ├── QuoteActions.tsx
    └── __tests__/
        ├── QuoteActions.test.tsx
        └── StatusHistory.test.tsx
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="renders correctly"
```

### Coverage Requirements

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

---

## Adding New Components

### File Structure

When adding a new component, follow this structure:

```
src/components/[category]/
├── ComponentName/
│   ├── ComponentName.tsx       # Main component
│   ├── ComponentName.test.tsx  # Tests
│   └── index.ts                # Barrel export
└── index.ts                    # Category export
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component files | PascalCase | `QuoteActions.tsx` |
| Test files | `*.test.tsx` | `QuoteActions.test.tsx` |
| Style files | kebab-case | `quote-actions.module.css` |
| Utility files | camelCase | `quoteWorkflow.ts` |
| Type interfaces | PascalCase | `QuoteActionsProps` |
| Constants | UPPER_SNAKE_CASE | `QUOTE_STATUSES` |

### Component Template

```tsx
/**
 * [ComponentName] Component
 * [Brief description of what the component does]
 * @module components/[category]/[ComponentName]
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export interface ComponentNameProps extends React.HTMLAttributes<HTMLElement> {
  /** Primary variant for the component */
  variant?: 'default' | 'primary' | 'secondary';
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  isLoading?: boolean;
  /** Callback when component is clicked */
  onAction?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const ComponentName = React.forwardRef<
  HTMLElement,
  ComponentNameProps
>(
  (
    { 
      className, 
      variant = 'default', 
      size = 'md', 
      isLoading = false,
      onAction,
      children,
      ...props 
    },
    ref
  ) => {
    const variantClasses = {
      default: 'bg-slate-800 text-slate-100',
      primary: 'bg-indigo-500 text-white',
      secondary: 'bg-slate-700 text-slate-200',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-150',
          variantClasses[variant],
          sizeClasses[size],
          isLoading && 'opacity-50 cursor-not-allowed',
          className
        )}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        onClick={isLoading ? undefined : onAction}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          children
        )}
      </motion.div>
    );
  }
);

ComponentName.displayName = 'ComponentName';

export default ComponentName;
```

### Export Patterns

```tsx
// Component file: ComponentName.tsx
export interface ComponentNameProps { ... }
export const ComponentName = ...
export default ComponentName;

// Component index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';

// Category index.ts (e.g., src/components/ui/index.ts)
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';

// Main components index.ts (src/components/index.ts)
export * from './ui';
export * from './layout';
export * from './navigation';
// etc.
```

### Component Checklist

Before submitting a new component, ensure:

- [ ] TypeScript interfaces are defined and exported
- [ ] JSDoc comments added for props and component
- [ ] `displayName` is set for debugging
- [ ] `forwardRef` used for ref forwarding
- [ ] `cn()` utility used for className merging
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Disabled state handled
- [ ] Accessibility attributes added (aria-*, role)
- [ ] Keyboard navigation supported
- [ ] Focus management implemented
- [ ] Unit tests written
- [ ] Storybook story created (optional)
- [ ] Export added to index.ts

### Example: Adding a New Component

```bash
# 1. Create component file
touch src/components/ui/Tooltip/Tooltip.tsx

# 2. Create test file
touch src/components/ui/Tooltip/Tooltip.test.tsx

# 3. Create barrel export
touch src/components/ui/Tooltip/index.ts

# 4. Update category export
# Edit src/components/ui/index.ts to add export

# 5. Run tests
npm test -- Tooltip.test.tsx
```

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Framer Motion](https://www.framer.com/motion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Contributing

When contributing to the component library:

1. Follow the established patterns and conventions
2. Write comprehensive tests for new components
3. Update this README with documentation for new components
4. Ensure accessibility requirements are met
5. Request code review before merging

---

*This documentation was generated for the QuoteGen application component library.*
