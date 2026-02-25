# UI Components

Reusable UI component library built on top of Radix UI primitives.

## Components

### Button

Multi-variant button component.

**Variants:**
- `primary` - Main action (default)
- `secondary` - Secondary action
- `ghost` - Subtle, icon buttons
- `danger` - Destructive actions
- `outline` - Bordered style

**Sizes:**
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `icon` - Icon only

**Usage:**
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="ghost" size="icon">
  <PlusIcon className="w-4 h-4" />
</Button>
```

### Card

Content container with header, content, and footer sections.

**Parts:**
- `Card` - Container
- `CardHeader` - Header section
- `CardTitle` - Title
- `CardDescription` - Subtitle
- `CardContent` - Main content
- `CardFooter` - Footer section

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Quote Details</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Badge

Status and label badges.

**Variants:**
- `default` - Gray
- `primary` - Blue
- `success` - Green
- `warning` - Yellow
- `danger` - Red
- `outline` - Bordered

**Usage:**
```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success">Accepted</Badge>
```

### Input

Form input with label, error, and helper text.

**Features:**
- Label support
- Error states
- Helper text
- Icons (left/right)
- Loading state

**Usage:**
```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  placeholder="john@example.com"
  error={errors.email}
  helperText="We'll never share your email"
/>
```

### Select

Dropdown select component.

**Features:**
- Searchable
- Multi-select
- Grouped options
- Custom rendering

### Dialog

Modal dialog component.

**Features:**
- Focus trap
- Escape to close
- Click outside to close
- Animated transitions

### Toast

Notification toast system.

**Features:**
- Success, error, warning, info variants
- Auto-dismiss
- Action buttons
- Stacking

### Skeleton

Loading skeleton placeholders.

**Components:**
- `Skeleton` - Base skeleton
- `CardSkeleton` - Card placeholder
- `StatCardSkeleton` - Stat card placeholder
- `TableSkeleton` - Table placeholder
- `DashboardSkeleton` - Full dashboard placeholder

**Usage:**
```tsx
import { TableSkeleton } from '@/components/ui/Skeleton';

{isLoading && <TableSkeleton rows={5} columns={4} />}
```

## File Structure

```
ui/
├── Button.tsx           # Button component
├── Card.tsx             # Card container
├── Badge.tsx            # Badge/label
├── Input.tsx            # Form input
├── Select.tsx           # Dropdown select
├── Dialog.tsx           # Modal dialog
├── Toast.tsx            # Toast notifications
├── Skeleton.tsx         # Loading skeletons
├── Table.tsx            # Data table
├── Tabs.tsx             # Tab navigation
├── Tooltip.tsx          # Hover tooltips
├── Dropdown.tsx         # Dropdown menu
├── Avatar.tsx           # User avatar
├── Progress.tsx         # Progress bar
├── Switch.tsx           # Toggle switch
└── index.ts             # Barrel exports
```

## Design System

### Colors

```css
/* Primary */
--color-primary-50: #eff6ff;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;

/* Status */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-danger: #ef4444;
--color-info: #3b82f6;
```

### Typography

- **Headings:** Inter, 600-700 weight
- **Body:** Inter, 400 weight
- **Mono:** JetBrains Mono (for code/numbers)

### Spacing

- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64

## Related

- Radix UI: https://www.radix-ui.com
- Tailwind CSS: https://tailwindcss.com
- Lucide Icons: https://lucide.dev
