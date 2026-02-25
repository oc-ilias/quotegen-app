# Analytics Components

Data visualization and analytics dashboard components.

## Components

### AnalyticsDashboard

Main analytics dashboard with charts, metrics, and filtering.

**Features:**
- Date range picker
- Multiple chart types
- Export to CSV/JSON
- Auto-refresh
- Responsive layout

**Usage:**
```tsx
import { AnalyticsDashboard } from '@/components/analytics';

<AnalyticsDashboard 
  dateRange={{ start: '2024-01-01', end: '2024-12-31' }}
  onDateChange={(range) => setDateRange(range)}
/>
```

### RevenueChart

Line chart showing revenue trends over time.

**Features:**
- Interactive tooltips
- Multiple time ranges (day/week/month)
- Comparison with previous period
- Exportable data

### ConversionChart

Bar chart showing conversion rates by status.

**Features:**
- Status breakdown visualization
- Trend indicators
- Click to filter quotes

### StatusBreakdown

Pie/donut chart of quote status distribution.

**Features:**
- Color-coded segments
- Percentage labels
- Legend with counts
- Click to drill down

### TopProducts

Table of top performing products/services.

**Features:**
- Sortable columns
- Revenue and quantity metrics
- Trend indicators
- Export functionality

### DateRangePicker

Flexible date range selector.

**Features:**
- Preset ranges (Today, Week, Month, Year)
- Custom date range
- Quick navigation

### ExportButton

Export analytics data in multiple formats.

**Supported Formats:**
- CSV
- JSON
- PDF Report

### RefreshButton

Manual refresh with auto-refresh toggle.

**Features:**
- Auto-refresh intervals (30s, 1m, 5m)
- Loading state indicator
- Last updated timestamp

## File Structure

```
analytics/
├── AnalyticsDashboard.tsx    # Main dashboard
├── RevenueChart.tsx          # Revenue trend chart
├── ConversionChart.tsx       # Conversion rate chart
├── ConversionChart.test.tsx  # Chart tests
├── StatusBreakdown.tsx       # Status pie chart
├── StatusBreakdown.test.tsx  # Tests
├── TopProducts.tsx           # Top products table
├── TopProducts.test.tsx      # Tests
├── DateRangePicker.tsx       # Date range selector
├── ExportButton.tsx          # Export functionality
├── RefreshButton.tsx         # Refresh controls
├── EmptyState.tsx            # Empty state component
├── ChartTooltip.tsx          # Custom tooltip
└── index.ts                  # Barrel exports
```

## Types

```typescript
interface AnalyticsData {
  revenue: RevenueData[];
  conversions: ConversionData[];
  statusBreakdown: StatusBreakdownData[];
  topProducts: ProductData[];
  summary: {
    totalRevenue: number;
    totalQuotes: number;
    conversionRate: number;
    averageValue: number;
  };
}

interface DateRange {
  start: Date;
  end: Date;
}

type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
```

## API Integration

```typescript
// Fetch analytics data
const fetchAnalytics = async (range: DateRange) => {
  const response = await fetch(
    `/api/analytics?start=${range.start.toISOString()}&end=${range.end.toISOString()}`
  );
  return response.json();
};
```

## Related

- API Routes: `../../app/api/analytics/route.ts`
- Chart Library: Recharts
- Date Utils: date-fns
- E2E Tests: `../../e2e/analytics.spec.ts`
