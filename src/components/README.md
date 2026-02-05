# QuoteGen Component Library

A comprehensive React component library for the QuoteGen B2B quote management application.

## 📁 Component Structure

```
src/components/
├── ui/                 # Core UI components (buttons, inputs, cards)
├── layout/             # Layout components (dashboard layout, headers)
├── navigation/         # Navigation components (sidebar, menus)
├── dashboard/          # Dashboard-specific components
├── quotes/             # Quote management components
├── wizard/             # Quote creation wizard components
├── analytics/          # Analytics and charting components
├── settings/           # Settings page components
├── templates/          # Template management components
├── pdf/                # PDF generation components
├── email/              # Email-related components
└── lazy/               # Lazy-loaded heavy components
```

## 🚀 Usage

### Importing Components

```tsx
// Import all from specific category
import { Button, Card, Input } from '@/components/ui';

// Import from specific component
import { QuoteWizardEnhanced } from '@/components/wizard';

// Import analytics components
import { AnalyticsDashboard, FunnelChart } from '@/components/analytics';
```

## 🎨 Design System

All components follow the QuoteGen design system:

- **Colors**: Dark theme with accent colors
- **Typography**: Inter font family
- **Spacing**: 4px base unit
- **Border Radius**: Consistent rounded corners
- **Shadows**: Subtle elevation system

## 🧪 Testing

All components include:
- Unit tests with Jest + React Testing Library
- Accessibility tests with jest-axe
- Visual regression tests with Playwright

Run tests:
```bash
npm test -- ComponentName.test.tsx
```

## 📦 Component Categories

### UI Components
Basic building blocks for the application.

- `Button` - Primary, secondary, and icon buttons
- `Card` - Content containers with headers
- `Input` - Form inputs with validation
- `Badge` - Status indicators
- `Modal` - Dialog overlays
- `Table` - Data tables with sorting
- `Skeleton` - Loading state placeholders

### Dashboard Components
Components for the main dashboard view.

- `ActivityFeed` - Recent activity timeline
- `QuickActions` - Shortcut buttons
- `RecentQuotes` - Latest quote previews
- `StatCards` - KPI metric cards

### Wizard Components
Quote creation wizard components.

- `QuoteWizardEnhanced` - Multi-step quote creation
- `AIQuoteSuggestions` - AI-powered recommendations
- `AutoSaveIndicator` - Auto-save status

### Analytics Components
Data visualization components.

- `AnalyticsDashboardEnhanced` - Main analytics view
- `FunnelChart` - Conversion funnel
- `GeographicMap` - Regional distribution
- `RevenueChart` - Revenue trends

## 🔄 Lazy Loading

Heavy components are lazy-loaded for performance:

```tsx
import { lazy } from 'react';

const QuotePDFEnhanced = lazy(() => import('@/components/pdf').then(m => ({ default: m.QuotePDFEnhanced })));
const AnalyticsDashboard = lazy(() => import('@/components/analytics').then(m => ({ default: m.AnalyticsDashboardEnhanced })));
```

## 🌐 TypeScript

All components are fully typed:

```tsx
export interface ComponentProps {
  title: string;
  children?: React.ReactNode;
  onAction?: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, children, onAction }) => {
  // Implementation
};
```

## 📝 Contributing

When adding new components:

1. Create component in appropriate folder
2. Add to index.ts export
3. Write tests
4. Add documentation
5. Update this README

## 📄 License

Private - QuoteGen Internal Use
