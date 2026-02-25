# Layout Components

Page layout components for consistent dashboard structure.

## Components

### DashboardLayout

Main dashboard layout with sidebar, header, and content area.

**Features:**
- Responsive sidebar
- Top navigation bar
- Breadcrumb navigation
- Page transitions
- Error boundaries
- Loading states

**Usage:**
```tsx
import { DashboardLayout } from '@/components/layout';

<DashboardLayout>
  <YourPageContent />
</DashboardLayout>
```

### Header

Top navigation bar with search, notifications, and user menu.

**Features:**
- Global search
- Notification bell with badge
- User avatar dropdown
- Quick actions
- Mobile menu toggle

### Breadcrumbs

Navigation breadcrumbs showing current location.

**Features:**
- Automatic path generation
- Custom label mapping
- Click to navigate
- Home link

**Usage:**
```tsx
import { Breadcrumbs } from '@/components/layout';

<Breadcrumbs 
  items={[
    { label: 'Home', href: '/' },
    { label: 'Quotes', href: '/quotes' },
    { label: 'Quote #123' },
  ]}
/>
```

### PageHeader

Consistent page header with title, description, and actions.

**Features:**
- Page title
- Description/subtitle
- Action buttons
- Back button option

**Usage:**
```tsx
import { PageHeader } from '@/components/layout';

<PageHeader
  title="Quotes"
  description="Manage your quotes and proposals"
  actions={
    <Button onClick={handleCreate}>Create Quote</Button>
  }
/>
```

### ContentWrapper

Responsive content container with consistent padding.

**Features:**
- Max width constraints
- Responsive padding
- Scroll handling

## File Structure

```
layout/
├── DashboardLayout.tsx    # Main layout wrapper
├── Header.tsx             # Top navigation
├── Breadcrumbs.tsx        # Breadcrumb navigation
├── PageHeader.tsx         # Page title component
└── index.ts               # Barrel exports
```

## Types

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  backButton?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}
```

## Related

- Sidebar: `../navigation/Sidebar.tsx`
- Navigation Types: `@/types/navigation`
- Error Boundary: `../ErrorBoundary.tsx`
