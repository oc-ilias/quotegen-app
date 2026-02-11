/**
 * Test Fixtures and Mock Data for QuoteGen E2E Tests
 */

import { test as base, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ============================================================================
// Mock Data
// ============================================================================

export const mockCustomer = {
  id: 'c-test-001',
  contactName: 'Test Customer',
  email: 'test@example.com',
  companyName: 'Test Corp',
  phone: '+1 (555) 123-4567',
  billingAddress: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'CA',
    zipCode: '12345',
    country: 'USA',
  },
  tags: ['test', 'enterprise'],
  notes: 'Test customer for E2E testing',
};

export const mockQuote = {
  id: 'q-test-001',
  quoteNumber: 'QT-TEST-001',
  title: 'Test Quote',
  customer: mockCustomer,
  lineItems: [
    {
      name: 'Test Product',
      description: 'A test product for E2E',
      quantity: 5,
      unit_price: 100,
      discount_percent: 10,
      tax_rate: 8.5,
    },
  ],
  notes: 'Test quote notes',
  terms: 'Net 30',
  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  discount_total: 50,
  tax_rate: 8.5,
};

export const mockTemplate = {
  id: 't-test-001',
  name: 'Test Template',
  description: 'Test email template',
  category: 'quote',
  subject: 'Your Quote {{quoteNumber}} from {{shopName}}',
  isDefault: false,
};

export const mockSettings = {
  company: {
    name: 'Test Company',
    address: '123 Test Ave\nTest City, TC 12345',
    phone: '+1 (555) 987-6543',
    email: 'test@testcompany.com',
    website: 'https://testcompany.com',
    taxId: '12-3456789',
  },
  quote: {
    defaultCurrency: 'USD',
    defaultValidityDays: 30,
    defaultPaymentTerms: 'Net 30',
    defaultDeliveryTerms: 'Standard shipping (5-7 business days)',
    defaultTaxRate: 8.5,
    quotePrefix: 'QT',
    autoNumbering: true,
    requireApproval: false,
    enableExpirations: true,
  },
  notifications: {
    newQuoteSubmitted: true,
    quoteViewed: true,
    quoteAccepted: true,
    quoteDeclined: true,
    dailyDigest: false,
    weeklyReport: true,
    browserNotifications: true,
  },
  appearance: {
    theme: 'dark' as const,
    primaryColor: '#6366f1',
    accentColor: '#8b5cf6',
    logoPosition: 'left' as const,
    fontFamily: 'inter' as const,
    compactMode: false,
  },
};

export const mockUser = {
  name: 'Test User',
  email: 'user@testcompany.com',
  avatar: null,
};

export const mockShop = {
  name: 'Test Shop',
  domain: 'test-shop.myshopify.com',
};

// ============================================================================
// Test Fixtures
// ============================================================================

type TestFixtures = {
  // Page objects
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  quotesPage: QuotesPage;
  quoteWizardPage: QuoteWizardPage;
  customersPage: CustomersPage;
  templatesPage: TemplatesPage;
  settingsPage: SettingsPage;
  
  // Utilities
  accessibilityCheck: (page: Page) => Promise<void>;
  mockAuthenticatedUser: (page: Page) => Promise<void>;
  waitForLoadingState: (page: Page, selector?: string) => Promise<void>;
};

// ============================================================================
// Page Object Classes
// ============================================================================

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async expectToBeOnLoginPage() {
    await expect(this.page).toHaveURL(/\/$/);
    await expect(this.page.getByRole('heading', { name: /QuoteGen/i })).toBeVisible();
  }

  async clickLoginButton() {
    await this.page.getByRole('button', { name: /login|sign in/i }).click();
  }

  async loginWithShopify(shopDomain: string = mockShop.domain) {
    // Mock Shopify OAuth flow
    await this.page.goto(`/api/auth?shop=${shopDomain}`);
    await this.page.waitForURL(/\/dashboard/);
  }
}

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await expect(this.page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
    await expect(this.page.getByText(/Welcome back/i)).toBeVisible();
  }

  async expectStatCardsToBeVisible() {
    const statTitles = ['Total Quotes', 'Pending Quotes', 'Accepted Quotes', 'Conversion Rate'];
    for (const title of statTitles) {
      await expect(this.page.getByText(title)).toBeVisible();
    }
  }

  async expectRecentQuotesSection() {
    await expect(this.page.getByRole('heading', { name: /Recent Quotes/i })).toBeVisible();
  }

  async expectActivityFeedSection() {
    await expect(this.page.getByRole('heading', { name: /Activity/i })).toBeVisible();
  }

  async clickCreateQuote() {
    await this.page.getByRole('button', { name: /Create Quote/i }).click();
    await this.page.waitForURL(/\/dashboard\/quotes\/new/);
  }

  async navigateToQuotes() {
    await this.page.getByRole('link', { name: /Quotes/i }).first().click();
    await this.page.waitForURL(/\/dashboard\/quotes/);
  }

  async navigateToCustomers() {
    await this.page.getByRole('link', { name: /Customers/i }).first().click();
    await this.page.waitForURL(/\/dashboard\/customers/);
  }

  async navigateToTemplates() {
    await this.page.getByRole('link', { name: /Templates/i }).first().click();
    await this.page.waitForURL(/\/dashboard\/templates/);
  }

  async navigateToSettings() {
    await this.page.getByRole('link', { name: /Settings/i }).first().click();
    await this.page.waitForURL(/\/dashboard\/settings/);
  }

  async navigateToAnalytics() {
    await this.page.getByRole('link', { name: /Analytics/i }).first().click();
    await this.page.waitForURL(/\/dashboard\/analytics/);
  }
}

export class QuotesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard/quotes');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await expect(this.page.getByRole('heading', { name: /Quotes/i })).toBeVisible();
  }

  async searchQuotes(query: string) {
    const searchInput = this.page.getByPlaceholder(/Search/i);
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await this.page.waitForTimeout(500); // Debounce wait
  }

  async filterByStatus(status: string) {
    await this.page.getByRole('combobox', { name: /Status/i }).click();
    await this.page.getByRole('option', { name: status }).click();
  }

  async clickNewQuote() {
    await this.page.getByRole('button', { name: /New Quote/i }).click();
    await this.page.waitForURL(/\/dashboard\/quotes\/new/);
  }

  async expectQuoteListVisible() {
    await expect(this.page.getByRole('table').or(this.page.locator('[data-testid="quotes-list"]'))).toBeVisible();
  }

  async clickQuoteByNumber(quoteNumber: string) {
    await this.page.getByText(quoteNumber).click();
    await this.page.waitForURL(/\/dashboard\/quotes\/.+/);
  }
}

export class QuoteWizardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard/quotes/new');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await expect(this.page.getByRole('heading', { name: /Create New Quote/i })).toBeVisible();
    await expect(this.page.getByText(/Customer/i)).toBeVisible();
  }

  async expectStepIndicator(stepName: string) {
    await expect(this.page.getByText(stepName, { exact: false })).toBeVisible();
  }

  // Step 1: Customer Info
  async fillCustomerInfo(customer: typeof mockCustomer) {
    await this.page.getByLabel(/Contact Name/i).fill(customer.contactName);
    await this.page.getByLabel(/Email/i).fill(customer.email);
    await this.page.getByLabel(/Company Name/i).fill(customer.companyName);
    if (customer.phone) {
      await this.page.getByLabel(/Phone/i).fill(customer.phone);
    }
  }

  // Step 2: Product Selection
  async searchAndSelectProduct(productName: string) {
    await this.page.getByPlaceholder(/Search products/i).fill(productName);
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: /Add/i }).first().click();
  }

  // Step 3: Line Items
  async addLineItem(item: { name: string; quantity: number; unitPrice: number }) {
    await this.page.getByRole('button', { name: /Add Item/i }).click();
    const rows = this.page.locator('[data-testid="line-item-row"]');
    const count = await rows.count();
    await this.page.getByLabel(/Item Name/i).nth(count - 1).fill(item.name);
    await this.page.getByLabel(/Quantity/i).nth(count - 1).fill(item.quantity.toString());
    await this.page.getByLabel(/Unit Price/i).nth(count - 1).fill(item.unitPrice.toString());
  }

  // Step 4: Terms & Notes
  async fillTerms(terms: { notes: string; validDays: number }) {
    await this.page.getByLabel(/Notes/i).fill(terms.notes);
    await this.page.getByLabel(/Validity Period/i).fill(terms.validDays.toString());
  }

  async clickContinue() {
    await this.page.getByRole('button', { name: /Continue/i }).click();
  }

  async clickPrevious() {
    await this.page.getByRole('button', { name: /Previous/i }).click();
  }

  async clickCreateQuote() {
    await this.page.getByRole('button', { name: /Create Quote/i }).click();
  }

  async clickCancel() {
    await this.page.getByRole('button', { name: /Cancel/i }).click();
  }

  async expectValidationError(fieldName: string) {
    await expect(this.page.getByText(/required|invalid/i).first()).toBeVisible();
  }

  async expectProgressStep(stepNumber: number) {
    await expect(this.page.getByText(`Step ${stepNumber} of 5`)).toBeVisible();
  }
}

export class CustomersPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard/customers');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await expect(this.page.getByRole('heading', { name: /Customers/i })).toBeVisible();
  }

  async clickAddCustomer() {
    await this.page.getByRole('button', { name: /Add Customer/i }).click();
    await expect(this.page.getByRole('dialog').or(this.page.getByRole('heading', { name: /New Customer/i }))).toBeVisible();
  }

  async fillCustomerForm(customer: Partial<typeof mockCustomer>) {
    if (customer.contactName) {
      await this.page.getByLabel(/Contact Name/i).fill(customer.contactName);
    }
    if (customer.email) {
      await this.page.getByLabel(/Email/i).fill(customer.email);
    }
    if (customer.companyName) {
      await this.page.getByLabel(/Company Name/i).fill(customer.companyName);
    }
    if (customer.phone) {
      await this.page.getByLabel(/Phone/i).fill(customer.phone);
    }
  }

  async saveCustomer() {
    await this.page.getByRole('button', { name: /Create Customer|Save Changes/i }).click();
  }

  async searchCustomers(query: string) {
    await this.page.getByPlaceholder(/Search customers/i).fill(query);
    await this.page.waitForTimeout(500);
  }

  async clickCustomerCard(customerName: string) {
    await this.page.getByText(customerName).first().click();
  }

  async deleteCustomer(customerName: string) {
    await this.page.getByText(customerName).first().hover();
    await this.page.getByRole('button', { name: /Delete/i }).first().click();
    await this.page.getByRole('button', { name: /Confirm|Yes/i }).click();
  }
}

export class TemplatesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard/templates');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await expect(this.page.getByRole('heading', { name: /Email Templates/i })).toBeVisible();
  }

  async clickNewTemplate() {
    await this.page.getByRole('button', { name: /New Template/i }).click();
    await this.page.waitForURL(/\/dashboard\/templates\/new/);
  }

  async fillTemplateForm(template: Partial<typeof mockTemplate>) {
    if (template.name) {
      await this.page.getByLabel(/Template Name/i).fill(template.name);
    }
    if (template.description) {
      await this.page.getByLabel(/Description/i).fill(template.description);
    }
    if (template.subject) {
      await this.page.getByLabel(/Subject/i).fill(template.subject);
    }
  }

  async selectCategory(category: string) {
    await this.page.getByLabel(/Category/i).selectOption(category);
  }

  async saveTemplate() {
    await this.page.getByRole('button', { name: /Save|Create Template/i }).click();
  }

  async searchTemplates(query: string) {
    await this.page.getByPlaceholder(/Search templates/i).fill(query);
    await this.page.waitForTimeout(500);
  }

  async clickTemplate(name: string) {
    await this.page.getByText(name).click();
  }
}

export class SettingsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard/settings');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await expect(this.page.getByRole('heading', { name: /Settings/i })).toBeVisible();
  }

  async navigateToTab(tabName: string) {
    await this.page.getByRole('button', { name: tabName }).click();
    await expect(this.page.getByRole('heading', { name: tabName })).toBeVisible();
  }

  async fillCompanySettings(company: typeof mockSettings.company) {
    await this.navigateToTab('Company');
    await this.page.getByLabel(/Company Name/i).fill(company.name);
    await this.page.getByLabel(/Business Address/i).fill(company.address);
    await this.page.getByLabel(/Phone Number/i).fill(company.phone);
    await this.page.getByLabel(/Email Address/i).fill(company.email);
    await this.page.getByLabel(/Website/i).fill(company.website);
  }

  async saveCompanySettings() {
    await this.page.getByRole('button', { name: /Save Changes/i }).click();
    await expect(this.page.getByText(/Saved successfully/i)).toBeVisible();
  }

  async toggleNotification(notificationName: string) {
    await this.navigateToTab('Notifications');
    await this.page.getByLabel(notificationName).click();
  }

  async changeTheme(theme: 'dark' | 'light' | 'system') {
    await this.navigateToTab('Appearance');
    await this.page.getByRole('button', { name: theme, exact: true }).click();
  }

  async changePrimaryColor(color: string) {
    await this.navigateToTab('Appearance');
    await this.page.getByLabel(/Primary Color/i).fill(color);
  }
}

// ============================================================================
// Custom Test Function with Fixtures
// ============================================================================

export const test = base.extend<TestFixtures>(
{
  // Page objects
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  
  quotesPage: async ({ page }, use) => {
    await use(new QuotesPage(page));
  },
  
  quoteWizardPage: async ({ page }, use) => {
    await use(new QuoteWizardPage(page));
  },
  
  customersPage: async ({ page }, use) => {
    await use(new CustomersPage(page));
  },
  
  templatesPage: async ({ page }, use) => {
    await use(new TemplatesPage(page));
  },
  
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  
  // Utilities
  accessibilityCheck: async ({ page }, use) => {
    await use(async (testPage: Page) => {
      const accessibilityScanResults = await new AxeBuilder({ page: testPage })
        .include('body')
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  },
  
  mockAuthenticatedUser: async ({ page }, use) => {
    await use(async (testPage: Page) => {
      // Set up mock authentication state
      await testPage.addInitScript(() => {
        window.localStorage.setItem('mockAuth', 'true');
        window.localStorage.setItem('mockUser', JSON.stringify(mockUser));
      });
    });
  },
  
  waitForLoadingState: async ({ page }, use) => {
    await use(async (testPage: Page, selector?: string) => {
      const loadingSelector = selector || '[data-testid="loading"], .loading, [aria-busy="true"]';
      await testPage.waitForSelector(loadingSelector, { state: 'hidden', timeout: 10000 });
    });
  },
});

export { expect } from '@playwright/test';
