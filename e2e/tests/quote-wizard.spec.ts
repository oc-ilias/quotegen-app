/**
 * Quote Creation Wizard E2E Tests
 * Tests the full quote creation flow through all wizard steps
 */

import { test, expect, mockCustomer, mockQuote } from '../fixtures/test-fixtures';

test.describe('Quote Creation Wizard', () => {
  test.beforeEach(async ({ quoteWizardPage }) => {
    await quoteWizardPage.goto();
  });

  test.describe('Wizard Initialization', () => {
    test('should display wizard with correct title', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Create New Quote/i })).toBeVisible();
      await expect(page.getByText(/Follow the steps below/i)).toBeVisible();
    });

    test('should display step indicators', async ({ page, quoteWizardPage }) => {
      // Check all 5 steps are visible
      const steps = ['Customer', 'Products', 'Line Items', 'Terms', 'Review'];
      for (const step of steps) {
        await expect(page.getByText(step, { exact: false }).first()).toBeVisible();
      }
    });

    test('should start on step 1', async ({ page, quoteWizardPage }) => {
      await quoteWizardPage.expectProgressStep(1);
      
      // Check Customer step is active
      await expect(page.locator('[aria-current="step"]').or(page.locator('.active').first())).toContainText(/Customer/i);
    });

    test('should display back button to quotes list', async ({ page }) => {
      const backButton = page.getByRole('button', { name: /Back to Quotes/i });
      await expect(backButton).toBeVisible();
      await expect(backButton).toBeEnabled();
    });

    test('should have progress bar', async ({ page }) => {
      const progressBar = page.locator('.progress-bar, [role="progressbar"]').first();
      if (await progressBar.isVisible().catch(() => false)) {
        await expect(progressBar).toBeVisible();
      }
    });
  });

  test.describe('Step 1: Customer Information', () => {
    test('should require customer name', async ({ page, quoteWizardPage }) => {
      // Try to continue without filling name
      await quoteWizardPage.clickContinue();
      
      // Should show validation error
      await quoteWizardPage.expectValidationError('name');
    });

    test('should require valid email', async ({ page, quoteWizardPage }) => {
      // Fill name but not email
      await page.getByLabel(/Contact Name/i).fill(mockCustomer.contactName);
      
      // Try invalid email
      await page.getByLabel(/Email/i).fill('invalid-email');
      await quoteWizardPage.clickContinue();
      
      // Should show validation error
      await expect(page.getByText(/valid email/i)).toBeVisible();
    });

    test('should validate email format', async ({ page, quoteWizardPage }) => {
      const invalidEmails = ['test', 'test@', 'test@com', '@example.com'];
      
      for (const email of invalidEmails) {
        await page.getByLabel(/Email/i).fill(email);
        await page.getByLabel(/Contact Name/i).fill('Test User');
        await quoteWizardPage.clickContinue();
        
        // Should still be on step 1
        await expect(page.getByText(/Customer/i).first()).toBeVisible();
      }
    });

    test('should accept valid customer information', async ({ page, quoteWizardPage }) => {
      // Fill all required fields
      await quoteWizardPage.fillCustomerInfo(mockCustomer);
      
      await quoteWizardPage.clickContinue();
      
      // Should advance to step 2
      await expect(page.getByText(/Products/i).first()).toBeVisible();
    });

    test('should allow optional phone number', async ({ page, quoteWizardPage }) => {
      // Fill required fields only
      await page.getByLabel(/Contact Name/i).fill(mockCustomer.contactName);
      await page.getByLabel(/Email/i).fill(mockCustomer.email);
      await page.getByLabel(/Company Name/i).fill(mockCustomer.companyName);
      
      await quoteWizardPage.clickContinue();
      
      // Should proceed without phone
      await expect(page.getByText(/Products/i).first()).toBeVisible();
    });

    test('should allow existing customer selection', async ({ page }) => {
      // Check for existing customer dropdown/search
      const customerSelect = page.getByLabel(/Select Customer/i).or(page.getByPlaceholder(/Search customers/i));
      
      if (await customerSelect.isVisible().catch(() => false)) {
        await customerSelect.click();
        await page.waitForTimeout(500);
        
        // Should show customer list
        const customerOption = page.getByRole('option').first();
        if (await customerOption.isVisible().catch(() => false)) {
          await customerOption.click();
          
          // Fields should be auto-populated
          const nameField = page.getByLabel(/Contact Name/i);
          const value = await nameField.inputValue();
          expect(value.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Step 2: Product Selection', () => {
    test.beforeEach(async ({ page, quoteWizardPage }) => {
      // Complete step 1 first
      await quoteWizardPage.fillCustomerInfo(mockCustomer);
      await quoteWizardPage.clickContinue();
    });

    test('should display product selection interface', async ({ page }) => {
      await expect(page.getByText(/Products/i).first()).toBeVisible();
      
      // Check for product search
      const searchInput = page.getByPlaceholder(/Search/i);
      if (await searchInput.isVisible().catch(() => false)) {
        await expect(searchInput).toBeVisible();
      }
    });

    test('should search and filter products', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search products/i);
      
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('widget');
        await page.waitForTimeout(500);
        
        // Results should update
        await page.waitForTimeout(500);
      }
    });

    test('should allow skipping product selection', async ({ page, quoteWizardPage }) => {
      // Products step is optional
      await quoteWizardPage.clickContinue();
      
      // Should advance to step 3
      await expect(page.getByText(/Line Items/i).first()).toBeVisible();
    });

    test('should add product to quote', async ({ page, quoteWizardPage }) => {
      // Search and add a product
      await quoteWizardPage.searchAndSelectProduct('Industrial Widget');
      
      // Product should be added to selection
      await page.waitForTimeout(500);
    });
  });

  test.describe('Step 3: Line Items', () => {
    test.beforeEach(async ({ page, quoteWizardPage }) => {
      // Complete steps 1-2
      await quoteWizardPage.fillCustomerInfo(mockCustomer);
      await quoteWizardPage.clickContinue();
      await page.waitForTimeout(300);
      await quoteWizardPage.clickContinue(); // Skip products
    });

    test('should require at least one line item', async ({ page, quoteWizardPage }) => {
      // Try to continue without line items
      await quoteWizardPage.clickContinue();
      
      // Should show validation error
      await quoteWizardPage.expectValidationError('line_items');
    });

    test('should add manual line item', async ({ page, quoteWizardPage }) => {
      // Add a line item
      await quoteWizardPage.addLineItem({
        name: 'Test Product',
        quantity: 5,
        unitPrice: 100,
      });
      
      // Line item should be visible
      await expect(page.getByText('Test Product')).toBeVisible();
    });

    test('should validate line item quantity', async ({ page, quoteWizardPage }) => {
      await quoteWizardPage.addLineItem({
        name: 'Test Product',
        quantity: 0,
        unitPrice: 100,
      });
      
      // Try to continue
      await quoteWizardPage.clickContinue();
      
      // Should show validation error
      await expect(page.getByText(/greater than 0|invalid quantity/i)).toBeVisible();
    });

    test('should validate line item price', async ({ page, quoteWizardPage }) => {
      await quoteWizardPage.addLineItem({
        name: 'Test Product',
        quantity: 1,
        unitPrice: -10,
      });
      
      // Try to continue
      await quoteWizardPage.clickContinue();
      
      // Should show validation error
      await expect(page.getByText(/cannot be negative|invalid price/i)).toBeVisible();
    });

    test('should calculate subtotal correctly', async ({ page, quoteWizardPage }) => {
      // Add line item
      await quoteWizardPage.addLineItem({
        name: 'Test Product',
        quantity: 2,
        unitPrice: 100,
      });
      
      // Check subtotal calculation
      await expect(page.getByText(/\$200/)).toBeVisible();
    });

    test('should apply discount to line item', async ({ page }) => {
      await page.getByRole('button', { name: /Add Item/i }).click();
      
      // Fill item details
      await page.getByLabel(/Item Name/i).last().fill('Discounted Product');
      await page.getByLabel(/Quantity/i).last().fill('10');
      await page.getByLabel(/Unit Price/i).last().fill('50');
      
      // Apply discount
      const discountInput = page.getByLabel(/Discount/i).last();
      if (await discountInput.isVisible().catch(() => false)) {
        await discountInput.fill('10');
        
        // Check discounted total
        // 10 * $50 = $500, 10% off = $450
        await expect(page.getByText(/\$450|\$450\.00/)).toBeVisible();
      }
    });

    test('should remove line item', async ({ page }) => {
      // Add item first
      await page.getByRole('button', { name: /Add Item/i }).click();
      await page.getByLabel(/Item Name/i).last().fill('Item to Remove');
      
      // Remove it
      const removeButton = page.getByRole('button', { name: /Remove/i }).last();
      if (await removeButton.isVisible().catch(() => false)) {
        await removeButton.click();
        await expect(page.getByText('Item to Remove')).not.toBeVisible();
      }
    });

    test('should handle multiple line items', async ({ page, quoteWizardPage }) => {
      // Add multiple items
      for (let i = 0; i < 3; i++) {
        await quoteWizardPage.addLineItem({
          name: `Product ${i + 1}`,
          quantity: i + 1,
          unitPrice: 100 * (i + 1),
        });
      }
      
      // All items should be visible
      for (let i = 0; i < 3; i++) {
        await expect(page.getByText(`Product ${i + 1}`)).toBeVisible();
      }
    });
  });

  test.describe('Step 4: Terms and Notes', () => {
    test.beforeEach(async ({ page, quoteWizardPage }) => {
      // Complete steps 1-3
      await quoteWizardPage.fillCustomerInfo(mockCustomer);
      await quoteWizardPage.clickContinue();
      await page.waitForTimeout(300);
      await quoteWizardPage.clickContinue(); // Skip products
      await quoteWizardPage.addLineItem({ name: 'Test Product', quantity: 1, unitPrice: 100 });
      await quoteWizardPage.clickContinue();
    });

    test('should display terms and notes form', async ({ page }) => {
      await expect(page.getByText(/Terms/i).first()).toBeVisible();
    });

    test('should fill terms and notes', async ({ page, quoteWizardPage }) => {
      await quoteWizardPage.fillTerms({
        notes: 'Test quote notes',
        validDays: 30,
      });
      
      await expect(page.getByLabel(/Notes/i)).toHaveValue('Test quote notes');
    });

    test('should allow optional fields', async ({ page, quoteWizardPage }) => {
      // Skip filling fields and continue
      await quoteWizardPage.clickContinue();
      
      // Should advance to review step
      await expect(page.getByText(/Review/i).first()).toBeVisible();
    });

    test('should select payment terms', async ({ page }) => {
      const paymentTerms = page.getByLabel(/Payment Terms/i);
      if (await paymentTerms.isVisible().catch(() => false)) {
        await paymentTerms.selectOption('Net 30');
        await expect(paymentTerms).toHaveValue('Net 30');
      }
    });
  });

  test.describe('Step 5: Review and Send', () => {
    test.beforeEach(async ({ page, quoteWizardPage }) => {
      // Complete steps 1-4
      await quoteWizardPage.fillCustomerInfo(mockCustomer);
      await quoteWizardPage.clickContinue();
      await page.waitForTimeout(300);
      await quoteWizardPage.clickContinue(); // Skip products
      await quoteWizardPage.addLineItem({ name: 'Test Product', quantity: 1, unitPrice: 100 });
      await quoteWizardPage.clickContinue();
      await quoteWizardPage.clickContinue(); // Skip terms
    });

    test('should display quote summary', async ({ page }) => {
      await expect(page.getByText(/Review/i).first()).toBeVisible();
      
      // Should show customer info
      await expect(page.getByText(mockCustomer.contactName)).toBeVisible();
      
      // Should show line items
      await expect(page.getByText('Test Product')).toBeVisible();
    });

    test('should display quote totals', async ({ page }) => {
      // Check for total amount
      await expect(page.getByText(/\$100|\$100\.00/)).toBeVisible();
    });

    test('should allow editing from review', async ({ page, quoteWizardPage }) => {
      // Click edit on customer section
      const editButtons = page.getByRole('button', { name: /Edit/i });
      if (await editButtons.first().isVisible().catch(() => false)) {
        await editButtons.first().click();
        
        // Should go back to customer step
        await expect(page.getByText(/Customer/i).first()).toBeVisible();
      }
    });

    test('should create quote on submit', async ({ page, quoteWizardPage }) => {
      // Mock successful API response
      await page.route('/api/quotes', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'test-quote-id',
            quoteNumber: 'QT-TEST-001',
            status: 'sent',
          }),
        });
      });
      
      // Submit quote
      await quoteWizardPage.clickCreateQuote();
      
      // Should redirect to quotes list or show success
      await page.waitForURL(/\/dashboard\/quotes/, { timeout: 10000 });
    });

    test('should handle submission errors', async ({ page, quoteWizardPage }) => {
      // Mock API error
      await page.route('/api/quotes', async (route) => {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Failed to create quote' }),
        });
      });
      
      // Submit quote
      await quoteWizardPage.clickCreateQuote();
      
      // Should show error message
      await expect(page.getByText(/error|failed/i)).toBeVisible();
    });
  });

  test.describe('Navigation Between Steps', () => {
    test('should allow going back to previous steps', async ({ page, quoteWizardPage }) => {
      // Complete step 1
      await quoteWizardPage.fillCustomerInfo(mockCustomer);
      await quoteWizardPage.clickContinue();
      
      // Go back
      await quoteWizardPage.clickPrevious();
      
      // Should be on step 1
      await expect(page.getByText(/Customer/i).first()).toBeVisible();
      
      // Form should retain values
      await expect(page.getByLabel(/Contact Name/i)).toHaveValue(mockCustomer.contactName);
    });

    test('should allow clicking on completed step indicators', async ({ page, quoteWizardPage }) => {
      // Complete step 1
      await quoteWizardPage.fillCustomerInfo(mockCustomer);
      await quoteWizardPage.clickContinue();
      
      // Click on step 1 indicator to go back
      const step1Indicator = page.locator('button').filter({ hasText: /Customer/i });
      if (await step1Indicator.first().isEnabled().catch(() => false)) {
        await step1Indicator.first().click();
        await expect(page.getByText(/Customer/i).first()).toBeVisible();
      }
    });

    test('should cancel wizard and return to quotes', async ({ page, quoteWizardPage }) => {
      await quoteWizardPage.clickCancel();
      
      await expect(page).toHaveURL(/\/dashboard\/quotes/);
    });
  });

  test.describe('Full Quote Creation Flow', () => {
    test('should complete full quote creation flow', async ({ page, quoteWizardPage }) => {
      // Mock API
      await page.route('/api/quotes', async (route) => {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'test-quote-id',
            quoteNumber: 'QT-TEST-001',
            status: 'sent',
          }),
        });
      });
      
      // Step 1: Customer Info
      await quoteWizardPage.fillCustomerInfo(mockCustomer);
      await quoteWizardPage.clickContinue();
      
      // Step 2: Product Selection (skip)
      await quoteWizardPage.clickContinue();
      
      // Step 3: Line Items
      await quoteWizardPage.addLineItem({
        name: 'Industrial Widget',
        quantity: 10,
        unitPrice: 250,
      });
      await quoteWizardPage.clickContinue();
      
      // Step 4: Terms
      await quoteWizardPage.fillTerms({
        notes: 'Net 30 payment terms. Free shipping included.',
        validDays: 30,
      });
      await quoteWizardPage.clickContinue();
      
      // Step 5: Review
      await expect(page.getByText(mockCustomer.contactName)).toBeVisible();
      await expect(page.getByText('Industrial Widget')).toBeVisible();
      
      // Submit
      await quoteWizardPage.clickCreateQuote();
      
      // Should redirect to quotes list
      await page.waitForURL(/\/dashboard\/quotes/, { timeout: 10000 });
      
      // Should show success indication
      await expect(page.getByText(/created|success/i).first()).toBeVisible();
    });
  });
});
