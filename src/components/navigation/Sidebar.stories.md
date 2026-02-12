# Sidebar Navigation Component

A comprehensive, accessible, and animated navigation sidebar component for the QuoteGen application.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Props](#props)
- [Variants](#variants)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Accessibility](#accessibility)
- [Customization](#customization)
- [Examples](#examples)
- [Error Handling](#error-handling)
- [Performance](#performance)

## Overview

The `Sidebar` component provides the main navigation interface for the QuoteGen application. It features:

- **Collapsible sidebar** with smooth Framer Motion animations
- **Mobile-responsive** drawer with overlay
- **Keyboard navigation** with customizable shortcuts
- **Loading and error states** with skeletons and retry functionality
- **Accessibility** compliance with ARIA attributes and keyboard support
- **Tooltip system** for collapsed state
- **Persistent state** with localStorage
- **Error boundary** integration for production safety

## Installation

```tsx
import { Sidebar, SidebarWithErrorBoundary } from '@/components/navigation/Sidebar';
```

## Basic Usage

### Default Usage

```tsx
function App() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-72">
        {/* Main content */}
      </main>
    </div>
  );
}
```

### With User Information

```tsx
function App() {
  return (
    <Sidebar
      userName="John Doe"
      userEmail="john@example.com"
      shopName="Acme Corporation"
      userAvatar="https://example.com/avatar.jpg"
    />
  );
}
```

### Controlled State

```tsx
function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState<NavItemId>('dashboard');

  return (
    <Sidebar
      isCollapsed={isCollapsed}
      onToggle={() => setIsCollapsed(!isCollapsed)}
      activeItem={activeItem}
      onNavigate={(itemId) => setActiveItem(itemId)}
    />
  );
}
```

### With Imperative Handle

```tsx
function App() {
  const sidebarRef = useRef<SidebarHandle>(null);

  const handleShortcut = () => {
    // Toggle sidebar programmatically
    sidebarRef.current?.toggle();
    
    // Navigate to specific item
    sidebarRef.current?.navigateTo('quotes');
    
    // Check current state
    console.log(sidebarRef.current?.isCollapsed);
  };

  return <Sidebar ref={sidebarRef} />;
}
```

## Props

### SidebarProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isCollapsed` | `boolean` | `undefined` | Controlled collapsed state |
| `onToggle` | `() => void` | `undefined` | Callback when toggle button clicked |
| `activeItem` | `NavItemId` | `undefined` | Controlled active navigation item |
| `variant` | `'desktop' \| 'mobile' \| 'floating'` | `'desktop'` | Sidebar display variant |
| `onNavigate` | `(item: NavItemId) => void` | `undefined` | Callback when navigation occurs |
| `userName` | `string` | `'User'` | User display name |
| `userEmail` | `string` | `undefined` | User email address |
| `userAvatar` | `string` | `undefined` | User avatar URL |
| `shopName` | `string` | `'My Shop'` | Shop/business name |
| `notificationCount` | `number` | `0` | Number of unread notifications |
| `error` | `Error \| null` | `undefined` | Error state for sidebar |
| `isLoading` | `boolean` | `false` | Loading state |
| `onRetry` | `() => void` | `undefined` | Callback to retry after error |
| `className` | `string` | `undefined` | Additional CSS classes |
| `onClose` | `() => void` | `undefined` | Callback when mobile menu should close |
| `defaultCollapsed` | `boolean` | `false` | Initial collapsed state |
| `customNavItems` | `NavItem[]` | `undefined` | Custom navigation items |
| `customCreateItems` | `CreateMenuItem[]` | `undefined` | Custom create menu items |
| `tooltipConfig` | `TooltipConfig` | `undefined` | Tooltip configuration |
| `keyboardShortcuts` | `KeyboardShortcuts` | `undefined` | Custom keyboard shortcuts |
| `disableKeyboardShortcuts` | `boolean` | `false` | Disable all keyboard shortcuts |
| `persistState` | `boolean` | `true` | Persist collapse state in localStorage |
| `storageKey` | `string` | `'sidebar-collapsed'` | Storage key for persistence |
| `onExpandComplete` | `() => void` | `undefined` | Callback when expand animation completes |
| `onCollapseComplete` | `() => void` | `undefined` | Callback when collapse animation completes |

### Types

```typescript
type NavItemId = 'dashboard' | 'quotes' | 'templates' | 'analytics' | 'settings' | 'customers';

interface NavItem {
  id: NavItemId;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  activeIcon: ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: 'red' | 'orange' | 'green' | 'blue' | 'purple' | 'gray';
  disabled?: boolean;
  requiresAuth?: boolean;
  shortcut?: string;
}

interface CreateMenuItem {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  shortcut?: string;
}

interface TooltipConfig {
  position?: 'right' | 'left' | 'top' | 'bottom';
  delay?: number;
  showArrow?: boolean;
}

interface KeyboardShortcuts {
  toggleCollapse?: string;
  openCreateMenu?: string;
  goToDashboard?: string;
  goToQuotes?: string;
  close?: string;
}

interface SidebarHandle {
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  navigateTo: (itemId: NavItemId) => void;
  openCreateMenu: () => void;
  closeCreateMenu: () => void;
  isCollapsed: boolean;
}
```

## Variants

### Desktop (Default)

Fixed sidebar with collapsible state.

```tsx
<Sidebar variant="desktop" />
```

**Features:**
- Fixed position on the left
- Collapsible to 80px width
- Tooltips when collapsed
- Smooth spring animations

### Mobile

Slide-out drawer with overlay.

```tsx
<Sidebar 
  variant="mobile" 
  onClose={() => setIsOpen(false)}
/>
```

**Features:**
- Slides in from the left
- Backdrop overlay with blur
- Always expanded
- Close button in header
- Body scroll locked when open

### Floating

Floating panel variant (for future use).

```tsx
<Sidebar variant="floating" />
```

## Keyboard Shortcuts

Default keyboard shortcuts can be customized or disabled:

| Shortcut | Action | Customizable |
|----------|--------|--------------|
| `Cmd/Ctrl + B` | Toggle sidebar collapse | ✅ |
| `Cmd/Ctrl + N` | Open create menu | ✅ |
| `Cmd/Ctrl + Shift + D` | Navigate to Dashboard | ✅ |
| `Cmd/Ctrl + Shift + Q` | Navigate to Quotes | ✅ |
| `Escape` | Close create menu | ✅ |

### Custom Shortcuts

```tsx
<Sidebar
  keyboardShortcuts={{
    toggleCollapse: 's',
    openCreateMenu: 'c',
    goToDashboard: 'D',
    goToQuotes: 'Q',
    close: 'Escape',
  }}
/>
```

### Disable Shortcuts

```tsx
<Sidebar disableKeyboardShortcuts />
```

## Accessibility

### ARIA Attributes

The sidebar implements comprehensive ARIA attributes:

- `role="navigation"` - Main navigation landmark
- `role="menubar"` - Navigation menu container
- `role="menuitem"` - Individual navigation items
- `aria-current="page"` - Current page indicator
- `aria-expanded` - Create menu state
- `aria-haspopup="menu"` - Create menu button
- `aria-busy="true"` - Loading state
- `role="alert"` - Error state
- `aria-modal="true"` - Mobile dialog

### Keyboard Navigation

- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close menus
- **Arrow keys**: Navigate within menus

### Screen Reader Support

All interactive elements have descriptive labels:

```tsx
// Toggle button
aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}

// Close button (mobile)
aria-label="Close navigation menu"

// Navigation items
aria-current={isActive ? 'page' : undefined}
```

## Customization

### Custom Navigation Items

```tsx
const customNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    href: '/dashboard',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
    badge: 3,
    badgeColor: 'green',
  },
  // ... more items
];

<Sidebar customNavItems={customNavItems} />
```

### Custom Create Menu

```tsx
const customCreateItems: CreateMenuItem[] = [
  {
    id: 'new-quote',
    label: 'New Quote',
    description: 'Create from scratch',
    href: '/quotes/new',
    icon: DocumentTextIcon,
    shortcut: '⌘N',
  },
  {
    id: 'from-template',
    label: 'From Template',
    description: 'Use existing template',
    href: '/quotes/new?template=true',
    icon: DocumentDuplicateIcon,
    shortcut: '⌘T',
  },
];

<Sidebar customCreateItems={customCreateItems} />
```

### Tooltip Configuration

```tsx
<Sidebar
  tooltipConfig={{
    position: 'right',
    delay: 500,
    showArrow: true,
  }}
/>
```

### Styling

Use Tailwind classes for custom styling:

```tsx
<Sidebar className="border-r-2 border-indigo-500 shadow-2xl" />
```

## Examples

### Loading State

```tsx
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  return (
    <Sidebar
      isLoading={isLoading}
      userName="John Doe"
    />
  );
}
```

### Error State with Retry

```tsx
function App() {
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      await fetchSidebarData();
    } catch (err) {
      setError(err as Error);
    }
  };

  return (
    <Sidebar
      error={error}
      onRetry={loadData}
    />
  );
}
```

### With Error Boundary

```tsx
function App() {
  return (
    <SidebarWithErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error tracking service
        console.error('Sidebar error:', error, errorInfo);
      }}
    >
      <Sidebar userName="John Doe" />
    </SidebarWithErrorBoundary>
  );
}
```

### Mobile Drawer

```tsx
function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden"
      >
        <MenuIcon />
      </button>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <Sidebar
          variant="mobile"
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar variant="desktop" />
      </div>
    </>
  );
}
```

### Persistent State

```tsx
// Automatically persists to localStorage
<Sidebar
  persistState={true}
  storageKey="my-app-sidebar"
  defaultCollapsed={false}
/>
```

## Error Handling

The sidebar includes multiple layers of error handling:

### Component Level

Use the `error` prop to display error state:

```tsx
<Sidebar
  error={new Error('Failed to load user data')}
  onRetry={() => refetchData()}
/>
```

### Error Boundary

Wrap with `SidebarWithErrorBoundary` for production safety:

```tsx
<SidebarWithErrorBoundary>
  <Sidebar />
</SidebarWithErrorBoundary>
```

### Custom Fallback

```tsx
<SidebarWithErrorBoundary
  fallback={
    <div className="p-4 text-red-500">
      Custom error message
    </div>
  }
>
  <Sidebar />
</SidebarWithErrorBoundary>
```

## Performance

### Optimization Features

1. **Memoization**: Navigation items and user initials are memoized
2. **Lazy Loading**: Avatar images use lazy loading
3. **Animation**: Framer Motion uses GPU-accelerated transforms
4. **Code Splitting**: Component supports dynamic imports

### Best Practices

```tsx
// ✅ Good: Memoize custom items
const navItems = useMemo(() => [
  { id: 'dashboard', label: 'Dashboard', /* ... */ },
], []);

<Sidebar customNavItems={navItems} />

// ❌ Bad: Creating new array on each render
<Sidebar customNavItems={[
  { id: 'dashboard', label: 'Dashboard', /* ... */ },
]} />
```

## Theme Integration

The sidebar follows the application's dark theme:

- **Background**: `slate-950`
- **Borders**: `slate-800`
- **Text**: `slate-100` (primary), `slate-400` (secondary)
- **Accent**: Indigo/Purple gradient
- **Hover**: `slate-800/60` with opacity

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Dependencies

- `react` ^18.0.0
- `framer-motion` ^12.0.0
- `@heroicons/react` ^2.0.0
- `next` ^14.0.0 (for routing)

## Contributing

When contributing to the Sidebar component:

1. Maintain TypeScript strict mode compliance
2. Add JSDoc comments for all public APIs
3. Include tests for new features
4. Follow existing animation patterns
5. Ensure accessibility compliance
6. Update this documentation

## Changelog

### v2.0.0
- Added imperative handle for external control
- Enhanced keyboard shortcuts with customization
- Added error boundary wrapper
- Improved mobile responsiveness
- Added persistence with localStorage

### v1.0.0
- Initial release
- Collapsible sidebar
- Mobile variant
- Loading and error states
- Basic keyboard navigation
