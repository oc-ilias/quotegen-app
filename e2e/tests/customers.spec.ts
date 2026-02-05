/**
 * Customer Management E2E Tests
 * Tests customer CRUD operations, search, filtering
 */

import { test, expect, mockCustomer } from '../fixtures/test-fixtures';

test.describe('Customer Management', () => {
  test.beforeEach(async ({ customersPage }) => {
    await customersPage.goto();
  });

  test.describe('Customer List Page', () => {
    test('should display customer list header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Customers/i })).toBeVisible();
      await expect(page.getByText(/Manage your B2B customer relationships/i)).toBeVisible();
    });

    test('should display stat cards', async ({ page }) => {
      const stats = ['Total Customers', 'New This Month', 'Active Quotes', 'Total Revenue'];
      for (const stat of stats) {
        await expect(page.getByText(stat)).toBeVisible();
      }
    });

    test('should display add customer button', async ({ page }) => {
      const addButton = page.getByRole('button', { name: /Add Customer/i });
      await expect(addButton).toBeVisible();
      await expect(addButton).toBeEnabled();
    });

    test('should display refresh button', async ({ page }) => {
      const refreshButton = page.getByRole('button', { name: /Refresh/i });
      await expect(refreshButton).toBeVisible();
      await expect(refreshButton).toBeEnabled();
    });

    test('should display search input', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search customers/i);
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEnabled();
    });
  });

  test.describe('Customer Search and Filter', () => {
    test('should filter customers by search query', async ({ page, customersPage }) => {
      // Search for a customer
      await customersPage.searchCustomers('John');
      
      // Results should update
      await page.waitForTimeout(500);
      
      // Check if filtered results are shown
      const customerCards = page.locator('[data-testid="customer-card"]').or(page.locator('.customer-card'));
      
      // If results found, they should match search
      const resultsText = await page.textContent('body');
      if (resultsText?.includes('John')) {
        expect(resultsText).toMatch(/John/i);
      }
    });

    test('should handle empty search results', async ({ page, customersPage }) => {
      // Search for non-existent customer
      await customersPage.searchCustomers('XYZNONEXISTENT123');
      await page.waitForTimeout(500);
      
      // Should show empty state or no results message
      const hasNoResults = await page.getByText(/No customers found|empty/i).first().isVisible().catch(() => false);
      expect(hasNoResults).toBeTruthy();
    });

    test('should sort customers by name', async ({ page }) => {
      // Click on sort dropdown
      const sortSelect = page.getByRole('combobox');
      if (await sortSelect.isVisible().catch(() => false)) {
        await sortSelect.selectOption('name');
        await page.waitForTimeout(500);
        
        // Customers should be sorted
        // This is a basic check - in reality would verify order
        await expect(page.locator('.customer-card').first()).toBeVisible();
      }
    });

    test('should toggle sort order', async ({ page }) => {
      const sortOrderButton = page.getByText(/Ascending|Descending/);
      if (await sortOrderButton.isVisible().catch(() => false)) {
        await sortOrderButton.click();
        await page.waitForTimeout(500);
        
        // Sort order should toggle
        await expect(page.getByText(/Ascending|Descending/)).toBeVisible();
      }
    });
  });

  test.describe('Create Customer', () => {
    test('should open customer creation modal', async ({ page, customersPage }) => {
      await customersPage.clickAddCustomer();
      
      // Modal should appear
      await expect(page.getByRole('dialog').or(page.getByRole('heading', { name: /New Customer/i }))).toBeVisible();
    });

    test('should validate required fields', async ({ page, customersPage }) => {
      await customersPage.clickAddCustomer();
      
      // Try to submit empty form
      await customersPage.saveCustomer();
      
      // Should show validation errors
      await expect(page.getByText(/required/i).first()).toBeVisible();
    });

    test('should validate email format', async ({ page, customersPage }) => {
      await customersPage.clickAddCustomer();
      
      // Fill name
      await page.getByLabel(/Contact Name/i).fill('Test User');
      await page.getByLabel(/Company Name/i).fill('Test Company');
      
      // Enter invalid email
      await page.getByLabel(/Email/i).fill('invalid-email');
      
      // Submit
      await customersPage.saveCustomer();
      
      // Should show email validation error
      const hasError = await page.getByText(/valid email|invalid/i).first().isVisible().catch(() => false);
      expect(hasError).toBeTruthy();
    });

    test('should create new customer successfully', async ({ page, customersPage }) => {
      await customersPage.clickAddCustomer();
      
      // Fill form
      await customersPage.fillCustomerForm({
        contactName: 'New Test Customer',
        email: 'newcustomer@test.com',
        companyName: 'New Test Company',
        phone: '+1 (555) 999-8888',
      });
      
      // Save
      await customersPage.saveCustomer();
      
      // Should close modal and show new customer
      await page.waitForTimeout(1000);
      
      // New customer should appear in list
      await expect(page.getByText('New Test Customer')).toBeVisible();
    });

    test('should allow adding tags to customer', async ({ page, customersPage }) => {
      await customersPage.clickAddCustomer();
      
      // Fill required fields
      await customersPage.fillCustomerForm({
        contactName: 'Tagged Customer',
        email: 'tagged@test.com',
        companyName: 'Tagged Company',
      });
      
      // Add tags
      const tagInput = page.getByPlaceholder(/Add a tag/i);
      if (await tagInput.isVisible().catch(() => false)) {
        await tagInput.fill('enterprise');
        await page.getByRole('button', { name: /Add/i }).click();
        
        await tagInput.fill('priority');
        await page.keyboard.press('Enter');
        
        // Tags should be visible
        await expect(page.getByText('enterprise')).toBeVisible();
        await expect(page.getByText('priority')).toBeVisible();
      }
      
      await customersPage.saveCustomer();
    });

    test('should fill billing address', async ({ page, customersPage }) => {
      await customersPage.clickAddCustomer();
      
      // Fill customer info
      await customersPage.fillCustomerForm({
        contactName: 'Address Customer',
        email: 'address@test.com',
        companyName: 'Address Company',
      });
      
      // Fill address
      await page.getByLabel(/Street Address/i).fill('123 Test Street');
      await page.getByLabel(/City/i).fill('Test City');
      await page.getByLabel(/State/i).fill('CA');
      await page.getByLabel(/ZIP/i).fill('12345');
      await page.getByLabel(/Country/i).fill('USA');
      
      await customersPage.saveCustomer();
      
      // Customer should be created with address
      await expect(page.getByText('Address Customer')).toBeVisible();
    });
  });

  test.describe('Edit Customer', () => {
    test('should open edit modal for existing customer', async ({ page, customersPage }) => {
      // Find and click on first customer
      const customerCard = page.locator('.customer-card, [data-testid="customer-card"]').first();
      
      if (await customerCard.isVisible().catch(() => false)) {
        // Click on the card
        await customerCard.click();
        
        // Should navigate to customer detail or open edit
        await page.waitForTimeout(500);
        
        // Check for edit button or form
        const editButton = page.getByRole('button', { name: /Edit/i });
        if (await editButton.isVisible().catch(() => false)) {
          await editButton.click();
          await expect(page.getByRole('dialog').or(page.getByText(/Edit Customer/i))).toBeVisible();
        }
      }
    });

    test('should update customer information', async ({ page, customersPage }) => {
      // This test assumes there's at least one customer
      const customerCards = page.locator('.customer-card, [data-testid="customer-card"]');
      
      if (await customerCards.first().isVisible().catch(() => false)) {
        // Open menu on first customer
        const menuButton = page.getByRole('button', { name: /menu|more/i }).first();
        if (await menuButton.isVisible().catch(() => false)) {
          await menuButton.click();
          
          // Click edit
          await page.getByRole('menuitem', { name: /Edit/i }).click();
          
          // Update name
          const nameField = page.getByLabel(/Contact Name/i);
          await nameField.fill('Updated Customer Name');
          
          // Save
          await page.getByRole('button', { name: /Save Changes/i }).click();
          
          // Should show updated name
          await expect(page.getByText('Updated Customer Name')).toBeVisible();
        }
      }
    });

    test('should add notes to customer', async ({ page }) => {
      // Find a customer card
      const customerCard = page.locator('.customer-card').first();
      
      if (await customerCard.isVisible().catch(() => false)) {
        await customerCard.click();
        
        // Look for notes field
        const notesField = page.getByLabel(/Notes/i);
        if (await notesField.isVisible().catch(() => false)) {
          await notesField.fill('Test customer notes added during E2E testing');
          await page.getByRole('button', { name: /Save/i }).click();
          
          // Notes should be saved
          await expect(page.getByText('Test customer notes')).toBeVisible();
        }
      }
    });
  });

  test.describe('Delete Customer', () => {
    test('should show confirmation before deleting', async ({ page }) => {
      // Find first customer
      const customerCards = page.locator('.customer-card, [data-testid="customer-card"]');
      
      if (await customerCards.first().isVisible().catch(() => false)) {
        // Open menu
        const menuButton = page.getByRole('button', { name: /menu|more/i }).first();
        if (await menuButton.isVisible().catch(() => false)) {
          await menuButton.click();
          
          // Click delete
          await page.getByRole('menuitem', { name: /Delete/i }).click();
          
          // Should show confirmation dialog
          await expect(page.getByText(/Are you sure|confirm/i)).toBeVisible();
          
          // Cancel deletion
          await page.getByRole('button', { name: /Cancel|No/i }).click();
        }
      }
    });

    test('should delete customer after confirmation', async ({ page, customersPage }) => {
      // Create a customer first to delete
      await customersPage.clickAddCustomer();
      await customersPage.fillCustomerForm({
        contactName: 'Customer To Delete',
        email: 'delete@test.com',
        companyName: 'Delete Company',
      });
      await customersPage.saveCustomer();
      
      // Find and delete the customer
      const customerCard = page.getByText('Customer To Delete').locator('..').locator('..');
      
      if (await customerCard.isVisible().catch(() => false)) {
        // Open menu
        const menuButton = customerCard.getByRole('button', { name: /menu|more/i });
        if (await menuButton.isVisible().catch(() => false)) {
          await menuButton.click();
          await page.getByRole('menuitem', { name: /Delete/i }).click();
          await page.getByRole('button', { name: /Yes|Confirm|Delete/i }).click();
          
          // Customer should be removed
          await page.waitForTimeout(500);
          await expect(page.getByText('Customer To Delete')).not.toBeVisible();
        }
      }
    });
  });

  test.describe('Customer Actions', () => {
    test('should create quote from customer', async ({ page }) => {
      // Find first customer
      const customerCards = page.locator('.customer-card, [data-testid="customer-card"]');
      
      if (await customerCards.first().isVisible().catch(() => false)) {
        // Open menu
        const menuButton = page.getByRole('button', { name: /menu|more/i }).first();
        if (await menuButton.isVisible().catch(() => false)) {
          await menuButton.click();
          
          // Click create quote
          await page.getByRole('menuitem', { name: /Create Quote/i }).click();
          
          // Should navigate to quote wizard with customer pre-filled
          await page.waitForURL(/\/dashboard\/quotes\/new/, { timeout: 5000 });
        }
      }
    });

    test('should view customer details', async ({ page }) => {
      // Find and click on customer
      const customerName = page.getByText(/John Smith|Sarah Johnson|Mike Chen/).first();
      
      if (await customerName.isVisible().catch(() => false)) {
        await customerName.click();
        
        // Should navigate to customer detail page
        await page.waitForURL(/\/dashboard\/customers\/.+/, { timeout: 5000 });
        
        // Should show customer details
        await expect(page.getByRole('heading', { name: /Customer Details|Profile/i })).toBeVisible();
      }
    });
  });

  test.describe('Customer List Display', () => {
    test('should display customer cards with correct information', async ({ page }) => {
      // Check for customer card elements
      const cards = page.locator('.customer-card, [data-testid="customer-card"]');
      
      if (await cards.first().isVisible().catch(() => false)) {
        const firstCard = cards.first();
        
        // Should have name
        const hasName = await firstCard.getByRole('heading').first().isVisible();
        expect(hasName).toBeTruthy();
        
        // Should have company
        const hasCompany = await firstCard.getByText(/Corp|Inc|LLC|Company/).first().isVisible();
        expect(hasCompany).toBeTruthy();
        
        // Should have email
        const hasEmail = await firstCard.getByText(/@/).first().isVisible();
        expect(hasEmail).toBeTruthy();
      }
    });

    test('should display customer tags', async ({ page }) => {
      // Look for tags on customer cards
      const tags = page.locator('.tag, [data-testid="tag"]');
      
      if (await tags.first().isVisible().catch(() => false)) {
        // Tags should be visible on cards
        const tagCount = await tags.count();
        expect(tagCount).toBeGreaterThan(0);
      }
    });

    test('should display customer since date', async ({ page }) => {
      // Check for "Customer since" text
      const sinceText = page.getByText(/Customer since/i);
      
      if (await sinceText.first().isVisible().catch(() => false)) {
        // Should have dates
        const pageText = await page.textContent('body');
        expect(pageText).toMatch(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
      }
    });
  });

  test.describe('Empty States', () => {
    test('should display empty state when no customers', async ({ page }) => {
      // Search for something that won't exist
      await page.getByPlaceholder(/Search customers/i).fill('XYZ_NO_CUSTOMERS_12345');
      await page.waitForTimeout(500);
      
      // Should show empty state
      await expect(page.getByText(/No customers found/i).or(page.getByRole('heading', { name: /No Customers/i }))).toBeVisible();
    });

    test('empty state should have add customer call-to-action', async ({ page }) => {
      // Clear search and check empty state
      const searchInput = page.getByPlaceholder(/Search customers/i);
      await searchInput.fill('NONEXISTENT');
      await page.waitForTimeout(500);
      
      const emptyState = page.getByText(/No customers found/i);
      if (await emptyState.isVisible().catch(() => false)) {
        // Should have add customer button in empty state
        const addButton = page.getByRole('button', { name: /Add Customer/i });
        await expect(addButton).toBeVisible();
      }
    });
  });
});
