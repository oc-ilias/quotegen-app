# Dashboard Components

Dashboard-specific components for displaying statistics, activity feeds, and quick actions.

## Components

### StatCards

Animated statistic cards with trends and loading states.

**Features:**
- Animated number counting
- Trend indicators (up/down/neutral)
- Multiple color themes
- Loading skeleton state
- Currency, percentage, and number formatting

**Usage:**
```tsx
import { StatCard, StatCardsGrid, useDashboardStats } from '@/components/dashboard';

// Individual card
<StatCard
  title="Total Revenue"
  value={125000}
  change={12.5}
  changeLabel="vs last month"
  icon="revenue"
  color="green"
  format="currency"
/>

// Grid with hook
const stats = useDashboardStats(data);
<StatCardsGrid stats={stats} isLoading={loading} />
```

### ActivityFeed

Real-time activity feed showing recent quote events.

**Features:**
- Auto-refresh every 30 seconds
- Grouped by date
- Click to view details
- Empty state with CTA

**Usage:**
```tsx
import { ActivityFeed } from '@/components/dashboard';

<ActivityFeed 
  activities={activities} 
  isLoading={loading}
  onViewQuote={(id) => router.push(`/quotes/${id}`)}
/>
```

### RecentQuotes

List of recently created/modified quotes with status indicators.

**Features:**
- Status badges with colors
- Relative timestamps
- Quick view actions
- Pagination support

**Usage:**
```tsx
import { RecentQuotes } from '@/components/dashboard';

<RecentQuotes 
  quotes={recentQuotes}
  onViewAll={() => router.push('/quotes')}
/>
```

### QuickActions

Shortcut buttons for common actions.

**Features:**
- Keyboard shortcuts (1-4)
- Tooltip descriptions
- Loading states
- Permission-based visibility

**Usage:**
```tsx
import { QuickActions } from '@/components/dashboard';

<QuickActions 
  onCreateQuote={() => router.push('/quotes/new')}
  onCreateTemplate={() => router.push('/templates/new')}
  onAddCustomer={() => router.push('/customers/new')}
  onViewReports={() => router.push('/analytics')}
/>
```

## File Structure

```
dashboard/
├── StatCards.tsx       # Stat cards with animations
├── ActivityFeed.tsx    # Activity feed component
├── RecentQuotes.tsx    # Recent quotes list
├── QuickActions.tsx    # Quick action buttons
└── index.ts            # Barrel exports
```

## Types

```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  format?: 'number' | 'currency' | 'percent';
  isLoading?: boolean;
}

interface ActivityItem {
  id: string;
  type: 'quote_created' | 'quote_sent' | 'quote_accepted' | 'quote_declined' | 'customer_added';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
```

## Related

- Dashboard Page: `../../app/(dashboard)/page.tsx`
- Analytics: `../analytics/AnalyticsDashboard.tsx`
- UI Components: `../ui/Card.tsx`
