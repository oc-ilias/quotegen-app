# Navigation Components

Navigation components for the QuoteGen dashboard including sidebar navigation, breadcrumbs, and mobile navigation.

## Components

### Sidebar

Main navigation sidebar with collapsible state, mobile support, and keyboard shortcuts.

**Features:**
- Collapsible/expandable state with Cmd/Ctrl+B shortcut
- Mobile responsive with slide-out drawer
- Notification badges on nav items
- Active state highlighting based on current route
- Smooth animations with Framer Motion
- Error boundaries and retry functionality

**Usage:**
```tsx
import { Sidebar } from '@/components/navigation';

// Basic usage
<Sidebar />

// With user info
<Sidebar 
  userName="John Doe"
  userEmail="john@example.com"
  shopName="Acme Corp"
  notificationCount={5}
/>

// Mobile variant
<Sidebar 
  variant="mobile"
  onClose={() => setIsOpen(false)}
/>
```

**Keyboard Shortcuts:**
- `Cmd/Ctrl + B` - Toggle sidebar collapse
- `Esc` - Close mobile sidebar

## File Structure

```
navigation/
├── Sidebar.tsx          # Main sidebar component
├── index.ts             # Barrel exports
└── Sidebar.stories.md   # Storybook documentation
```

## Types

```typescript
interface SidebarProps {
  variant?: 'desktop' | 'mobile' | 'floating';
  userName?: string;
  userEmail?: string;
  shopName?: string;
  notificationCount?: number;
  error?: Error | null;
  onRetry?: () => void;
  onClose?: () => void;
}
```

## Related

- Dashboard Layout: `../layout/DashboardLayout.tsx`
- Navigation Types: `@/types/navigation`
