# Customers Components

Customer management components for listing, viewing, and managing customers.

## Components

### CustomerList

Paginated customer list with search and filtering.

**Features:**
- Real-time search
- Status filtering
- Tag filtering
- Sortable columns
- Bulk actions
- Quick actions menu

**Usage:**
```tsx
import { CustomerList } from '@/components/customers';

<CustomerList 
  onCustomerClick={(customer) => router.push(`/customers/${customer.id}`)}
  onCreateCustomer={() => setShowCreateModal(true)}
/>
```

### CustomerDetail

Detailed customer view with tabs for information, quotes, and activity.

**Features:**
- Customer information display
- Edit mode
- Quote history
- Activity timeline
- Notes section
- Address management

**Usage:**
```tsx
import { CustomerDetail } from '@/components/customers';

<CustomerDetail 
  customerId={customerId}
  onEdit={() => setEditMode(true)}
  onDelete={() => handleDelete()}
/>
```

### CustomerForm

Create/edit customer form with validation.

**Fields:**
- Company name (required)
- Contact name (required)
- Email (required, unique)
- Phone
- Billing address
- Shipping address
- Tags
- Notes

**Usage:**
```tsx
import { CustomerForm } from '@/components/customers';

// Create
<CustomerForm 
  mode="create"
  onSubmit={handleCreate}
  onCancel={() => router.back()}
/>

// Edit
<CustomerForm 
  mode="edit"
  customer={existingCustomer}
  onSubmit={handleUpdate}
  onCancel={() => setEditMode(false)}
/>
```

### CustomerQuotes

List of quotes associated with a customer.

**Features:**
- Quote history
- Status badges
- Quick view
- Revenue summary

**Usage:**
```tsx
import { CustomerQuotes } from '@/components/customers';

<CustomerQuotes 
  quotes={customerQuotes}
  onViewQuote={(id) => router.push(`/quotes/${id}`)}
  onViewAll={() => router.push(`/quotes?customer=${customerId}`)}
/>
```

### CustomerStats

Customer statistics cards showing key metrics.

**Metrics:**
- Total quotes
- Total revenue
- Conversion rate
- Average quote value
- Last activity

### CustomerTags

Tag management for customer categorization.

**Features:**
- Add/remove tags
- Color-coded tags
- Suggested tags
- Tag filtering

## File Structure

```
customers/
├── CustomerList.tsx          # Customer list view
├── CustomerDetail.tsx        # Customer detail view
├── CustomerForm.tsx          # Create/edit form
├── CustomerQuotes.tsx        # Customer's quotes
├── CustomerStats.tsx         # Statistics cards
├── CustomerTags.tsx          # Tag management
├── __tests__/
│   ├── CustomerForm.test.tsx
│   ├── CustomerList.test.tsx
│   ├── CustomerDetail.test.tsx
│   └── CustomerQuotes.test.tsx
└── index.ts                  # Barrel exports
```

## Types

```typescript
interface Customer {
  id: string;
  email: string;
  companyName: string;
  contactName: string;
  phone?: string;
  status: 'active' | 'inactive' | 'prospect';
  billingAddress?: Address;
  shippingAddress?: Address;
  tags: string[];
  notes?: string;
  customerSince: string;
  createdAt: string;
  updatedAt: string;
  stats?: CustomerStats;
}

interface CustomerStats {
  totalQuotes: number;
  totalRevenue: number;
  acceptedQuotes: number;
  declinedQuotes: number;
  pendingQuotes: number;
  conversionRate: number;
  avgQuoteValue: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
```

## Filtering

```typescript
interface CustomerFilters {
  search?: string;
  status?: CustomerStatus[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  minRevenue?: number;
  maxRevenue?: number;
  minQuotes?: number;
  maxQuotes?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## Related

- API Routes: `../../app/api/customers/route.ts`
- Quote Components: `../quotes/`
- E2E Tests: `../../e2e/customers.spec.ts`
