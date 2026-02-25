# PDF Components

PDF generation and template management components.

## Components

### QuotePDF

Main PDF generation component using @react-pdf/renderer.

**Features:**
- 4 built-in templates
- Custom branding support
- Dynamic data binding
- Logo upload support
- Terms & conditions
- Multi-page support

**Templates:**
1. **Modern** - Clean, contemporary design with accent colors
2. **Classic** - Traditional business format
3. **Minimal** - Simple, whitespace-focused
4. **Professional** - Full-featured with detailed sections

**Usage:**
```tsx
import { QuotePDF } from '@/components/pdf';
import { PDFDownloadLink } from '@react-pdf/renderer';

// Generate PDF
<PDFDownloadLink
  document={<QuotePDF quote={quote} template="modern" />}
  fileName={`quote-${quote.quoteNumber}.pdf`}
>
  {({ loading }) => loading ? 'Generating...' : 'Download PDF'}
</PDFDownloadLink>

// Preview
<PDFViewer>
  <QuotePDF quote={quote} template="professional" />
</PDFViewer>
```

### PDFTemplateSelector

Template selection UI with previews.

**Features:**
- Visual template previews
- Template description
- Default template setting
- Real-time preview

**Usage:**
```tsx
import { PDFTemplateSelector } from '@/components/pdf';

<PDFTemplateSelector
  selected={selectedTemplate}
  onSelect={(template) => setTemplate(template)}
  showPreview={true}
/>
```

### PDFTemplates

Template definitions and styles.

**Template Structure:**
```typescript
interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  styles: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    layout: {
      margins: number;
      spacing: number;
    };
  };
}
```

## File Structure

```
pdf/
├── QuotePDF.tsx              # Main PDF component
├── PDFTemplateSelector.tsx   # Template selector UI
├── PDFTemplates.ts           # Template definitions
└── index.ts                  # Barrel exports
```

## Custom Templates

To create a custom template:

```typescript
import { TemplateDefinition } from './PDFTemplates';

const customTemplate: TemplateDefinition = {
  id: 'custom',
  name: 'Custom Template',
  description: 'My custom PDF template',
  render: (quote) => (
    <Page>
      {/* Custom layout */}
    </Page>
  ),
};
```

## PDF Sections

Each template includes:

- **Header** - Company logo, quote number, date
- **From** - Your company information
- **To** - Customer information
- **Quote Details** - Title, description, valid until
- **Line Items** - Products/services table
- **Totals** - Subtotal, tax, total
- **Terms** - Payment terms, notes
- **Footer** - Company details, page numbers

## Branding Options

```typescript
interface PDFBranding {
  logo?: string;           // Base64 encoded image
  primaryColor?: string;   // Hex color
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}
```

## API Integration

```typescript
// Server-side PDF generation
const generatePDF = async (quoteId: string, template: string) => {
  const response = await fetch(`/api/quotes/${quoteId}/pdf?template=${template}`);
  const blob = await response.blob();
  return blob;
};
```

## Related

- PDF Library: @react-pdf/renderer
- Quote Types: `@/types/quote`
- Settings: `../settings/`
- E2E Tests: `../../e2e/pdf.spec.ts`
