# Quotes Components

Quote management components for listing, editing, and managing quotes.

## Components

### QuotesDashboard

Main quotes list with filtering, sorting, and bulk actions.

**Features:**
- Advanced filtering (status, date, customer)
- Sortable columns
- Bulk actions (delete, export, status change)
- Pagination
- Quick search
- URL sync for filters

**Usage:**
```tsx
import { QuotesDashboard } from '@/components/quotes';

<QuotesDashboard 
  initialFilters={{ status: 'pending' }}
  onQuoteClick={(quote) => router.push(`/quotes/${quote.id}`)}
/>
```

### QuoteForm

Quote creation/editing form with validation.

**Features:**
- Customer selection
- Line item management
- Quote settings
- Real-time validation
- Autosave

### QuoteStatusBadge

Visual status indicator with appropriate colors.

**Statuses:**
- Draft (gray)
- Sent (blue)
- Viewed (purple)
- Accepted (green)
- Declined (red)
- Expired (orange)
- Converted (emerald)

**Usage:**
```tsx
import { QuoteStatusBadge } from '@/components/quotes';

<QuoteStatusBadge status="accepted" />
```

### QuoteActions

Action buttons for quote operations.

**Actions:**
- View
- Edit
- Duplicate
- Send
- Download PDF
- Delete

## File Structure

```
quotes/
├── QuotesDashboard.tsx      # Main quotes list
├── QuoteForm.tsx            # Quote form component
├── QuoteStatusBadge.tsx     # Status badge
├── QuoteActions.tsx         # Action buttons
├── __tests__/
│   ├── QuoteForm.test.tsx
│   └── QuoteStatusBadge.test.tsx
└── index.ts                 # Barrel exports
```

## Types

```typescript
interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  status: QuoteStatus;
  customerId: string;
  customer: Customer;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
}

type QuoteStatus = 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'accepted' 
  | 'declined' 
  | 'expired' 
  | 'converted';

interface LineItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  total: number;
}
```

## Filtering

```typescript
interface QuoteFilters {
  status?: QuoteStatus[];
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## Bulk Actions

```typescript
type BulkAction = 
  | 'delete' 
  | 'export' 
  | 'change-status' 
  | 'send' 
  | 'duplicate';

// Execute bulk action
await executeBulkAction(selectedQuoteIds, action, params);
```

## Related

- Wizard: `../wizard/QuoteWizard.tsx`
- PDF: `../pdf/QuotePDF.tsx`
- API: `../../app/api/quotes/route.ts`
- E2E: `../../e2e/quotes.spec.ts`
