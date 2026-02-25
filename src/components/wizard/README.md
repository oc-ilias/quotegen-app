# Wizard Components

Multi-step quote creation wizard with validation, autosave, and preview.

## Components

### QuoteWizard

Main wizard container managing the 5-step quote creation process.

**Features:**
- 5-step guided process
- Autosave every 30 seconds
- Form validation with Zod
- Progress indicator
- Step navigation (next/previous)
- Draft persistence
- Error recovery

**Steps:**
1. **Customer Selection** - Choose existing or create new customer
2. **Line Items** - Add products/services with quantities and prices
3. **Settings** - Quote details, expiry, terms
4. **Preview** - Visual preview of the quote
5. **Send** - Delivery options and final send

**Usage:**
```tsx
import { QuoteWizard } from '@/components/wizard';

// Create new quote
<QuoteWizard mode="create" />

// Edit existing quote
<QuoteWizard 
  mode="edit" 
  quoteId="quote-123"
  initialData={quoteData}
/>
```

### Wizard Steps

Located in `wizard/steps/`:

- **CustomerStep.tsx** - Customer selection/creation
- **LineItemsStep.tsx** - Product/service line items
- **SettingsStep.tsx** - Quote configuration
- **PreviewStep.tsx** - Quote preview
- **SendStep.tsx** - Delivery options

## File Structure

```
wizard/
├── QuoteWizard.tsx      # Main wizard component
├── QuoteWizard.test.tsx # Component tests
├── index.ts             # Barrel exports
└── steps/
    ├── CustomerStep.tsx
    ├── LineItemsStep.tsx
    ├── SettingsStep.tsx
    ├── PreviewStep.tsx
    ├── SendStep.tsx
    └── __tests__/
```

## Types

```typescript
interface QuoteWizardProps {
  mode: 'create' | 'edit';
  quoteId?: string;
  initialData?: Partial<QuoteData>;
  onComplete?: (quoteId: string) => void;
  onCancel?: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<StepProps>;
  validate: (data: QuoteData) => boolean | Promise<boolean>;
}

interface QuoteData {
  customerId?: string;
  customer?: Customer;
  lineItems: LineItem[];
  title: string;
  description?: string;
  expiresAt?: string;
  terms?: string;
  notes?: string;
  templateId?: string;
}
```

## Autosave

The wizard automatically saves drafts every 30 seconds:

```typescript
// Draft saved to localStorage
const draftKey = `quote-wizard-draft-${quoteId || 'new'}`;
```

## Validation

Each step has built-in validation:

```typescript
// Example: Customer step validation
const validateCustomer = (data: QuoteData) => {
  return !!data.customerId && !!data.customer?.email;
};
```

## Related

- Quote Types: `@/types/quote`
- Customer Components: `../customers/`
- PDF Generation: `../pdf/QuotePDF.tsx`
- E2E Tests: `../../e2e/wizard.spec.ts`
