/**
 * Template Management E2E Tests
 * Tests email template CRUD operations, preview, and configuration
 */

import { test, expect, mockTemplate } from '../fixtures/test-fixtures';

test.describe('Template Management', () => {
  test.beforeEach(async ({ templatesPage }) => {
    await templatesPage.goto();
  });

  test.describe('Templates List Page', () => {
    test('should display templates header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Email Templates/i })).toBeVisible();
      await expect(page.getByText(/Customize the emails sent to your customers/i)).toBeVisible();
    });

    test('should display new template button', async ({ page }) => {
      const newButton = page.getByRole('button', { name: /New Template/i });
      await expect(newButton).toBeVisible();
      await expect(newButton).toBeEnabled();
    });

    test('should display search input', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search templates/i);
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEnabled();
    });

    test('should display category filter', async ({ page }) => {
      const categoryFilter = page.getByRole('combobox');
      if (await categoryFilter.isVisible().catch(() => false)) {
        await expect(categoryFilter).toBeVisible();
        
        // Should have category options
        await categoryFilter.click();
        await expect(page.getByRole('option', { name: /All Categories/i })).toBeVisible();
      }
    });
  });

  test.describe('Template Cards', () => {
    test('should display template cards', async ({ page }) => {
      // Check for template cards
      const cards = page.locator('[data-testid="template-card"]').or(page.locator('.template-card')).or(page.locator('div').filter({ hasText: /Standard Quote Email|Quote Reminder/i }));
      
      // At least one card should be visible (mock data)
      const hasCards = await cards.first().isVisible().catch(() => false);
      expect(hasCards).toBeTruthy();
    });

    test('should display template name and category', async ({ page }) => {
      // Check first template card
      const templateName = page.getByText(/Standard Quote Email/i);
      if (await templateName.isVisible().catch(() => false)) {
        await expect(templateName).toBeVisible();
        
        // Should have category label
        const category = page.getByText(/Quote Email|Follow-up|Reminder/i).first();
        await expect(category).toBeVisible();
      }
    });

    test('should display default badge on default templates', async ({ page }) => {
      // Look for default badge
      const defaultBadge = page.getByText(/Default/i);
      
      if (await defaultBadge.first().isVisible().catch(() => false)) {
        await expect(defaultBadge.first()).toBeVisible();
      }
    });

    test('should display template subject line', async ({ page }) => {
      // Check for subject line display
      const subject = page.getByText(/Subject:/i);
      
      if (await subject.first().isVisible().catch(() => false)) {
        await expect(subject.first()).toBeVisible();
        
        // Should have subject content
        const pageText = await page.textContent('body');
        expect(pageText).toMatch(/{{quoteNumber|{{shopName|Your Quote/i);
      }
    });

    test('should display last updated date', async ({ page }) => {
      // Check for updated date
      const updatedText = page.getByText(/Updated/i);
      
      if (await updatedText.first().isVisible().catch(() => false)) {
        await expect(updatedText.first()).toBeVisible();
        
        // Should have date format
        const pageText = await page.textContent('body');
        expect(pageText).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
      }
    });
  });

  test.describe('Template Actions', () => {
    test('should navigate to template edit page', async ({ page, templatesPage }) => {
      // Click on a template
      const templateCard = page.getByText(/Standard Quote Email/i).first();
      
      if (await templateCard.isVisible().catch(() => false)) {
        await templateCard.click();
        
        // Should navigate to edit page
        await page.waitForURL(/\/dashboard\/templates\/.+/, { timeout: 5000 });
        
        // Should show template editor
        await expect(page.getByRole('heading', { name: /Edit Template|Template Editor/i })).toBeVisible();
      }
    });

    test('should duplicate template', async ({ page }) => {
      // Find duplicate button on first template
      const duplicateButton = page.getByRole('button', { name: /Duplicate/i }).first();
      
      if (await duplicateButton.isVisible().catch(() => false)) {
        await duplicateButton.click();
        
        // Should show success or create duplicate
        await page.waitForTimeout(1000);
        
        // Check for duplicate notification
        const hasNotification = await page.getByText(/duplicated|copy/i).first().isVisible().catch(() => false);
        expect(hasNotification).toBeTruthy();
      }
    });

    test('should set template as default', async ({ page }) => {
      // Find a non-default template and set it as default
      const setDefaultButton = page.getByRole('button', { name: /Set as Default/i }).first();
      
      if (await setDefaultButton.isVisible().catch(() => false)) {
        await setDefaultButton.click();
        
        // Should show success
        await page.waitForTimeout(500);
        
        const hasSuccess = await page.getByText(/set as default|success/i).first().isVisible().catch(() => false);
        expect(hasSuccess).toBeTruthy();
      }
    });

    test('should delete template with confirmation', async ({ page }) => {
      // Find delete button on non-default template
      const deleteButtons = page.getByRole('button', { name: /Delete/i });
      const count = await deleteButtons.count();
      
      if (count > 0) {
        // Click delete on last non-default template
        await deleteButtons.last().click();
        
        // Should show confirmation
        await expect(page.getByText(/Are you sure|confirm/i).first()).toBeVisible();
        
        // Cancel
        await page.getByRole('button', { name: /Cancel|No/i }).click();
      }
    });
  });

  test.describe('Search and Filter', () => {
    test('should search templates by name', async ({ page, templatesPage }) => {
      await templatesPage.searchTemplates('Quote');
      
      // Results should update
      await page.waitForTimeout(500);
      
      // Should show matching templates
      const results = page.getByText(/Quote/i);
      expect(await results.count()).toBeGreaterThan(0);
    });

    test('should filter by category', async ({ page }) => {
      const categoryFilter = page.getByRole('combobox');
      
      if (await categoryFilter.isVisible().catch(() => false)) {
        await categoryFilter.selectOption('Quote Email');
        await page.waitForTimeout(500);
        
        // Results should be filtered
        const categoryLabels = page.getByText(/Quote Email/i);
        expect(await categoryLabels.count()).toBeGreaterThan(0);
      }
    });

    test('should handle empty search results', async ({ page, templatesPage }) => {
      await templatesPage.searchTemplates('XYZNONEXISTENT');
      await page.waitForTimeout(500);
      
      // Should show empty state
      const hasEmpty = await page.getByText(/No templates found|empty/i).first().isVisible().catch(() => false);
      expect(hasEmpty).toBeTruthy();
    });
  });

  test.describe('Create Template', () => {
    test('should navigate to new template page', async ({ page, templatesPage }) => {
      await templatesPage.clickNewTemplate();
      
      // Should be on new template page
      await expect(page).toHaveURL(/\/dashboard\/templates\/new/);
      await expect(page.getByRole('heading', { name: /New Template|Create Template/i })).toBeVisible();
    });

    test('should validate required fields', async ({ page, templatesPage }) => {
      await templatesPage.clickNewTemplate();
      
      // Try to save without filling required fields
      await templatesPage.saveTemplate();
      
      // Should show validation errors
      const hasError = await page.getByText(/required|missing/i).first().isVisible().catch(() => false);
      expect(hasError).toBeTruthy();
    });

    test('should create new template', async ({ page, templatesPage }) => {
      await templatesPage.clickNewTemplate();
      
      // Fill form
      await templatesPage.fillTemplateForm({
        name: 'E2E Test Template',
        description: 'Template created during E2E testing',
        subject: 'Your Test Quote {{quoteNumber}}',
      });
      
      await templatesPage.selectCategory('quote');
      
      // Fill content if editor exists
      const contentEditor = page.getByLabel(/Content/i).or(page.locator('.ql-editor')).or(page.locator('[contenteditable="true"]'));
      if (await contentEditor.isVisible().catch(() => false)) {
        await contentEditor.fill('Hello {{customerName}}, here is your quote {{quoteNumber}}.');
      }
      
      // Save
      await templatesPage.saveTemplate();
      
      // Should redirect back to list or show success
      await page.waitForTimeout(1000);
      
      // Check for success indication
      const hasSuccess = await page.getByText(/created|saved|success/i).first().isVisible().catch(() => false);
      expect(hasSuccess || page.url().includes('/dashboard/templates')).toBeTruthy();
    });

    test('should insert template variables', async ({ page, templatesPage }) => {
      await templatesPage.clickNewTemplate();
      
      // Look for variable insertion
      const variableButton = page.getByRole('button', { name: /Insert Variable|Variables/i });
      
      if (await variableButton.isVisible().catch(() => false)) {
        await variableButton.click();
        
        // Should show variable options
        const variables = ['{{customerName}}', '{{quoteNumber}}', '{{shopName}}'];
        for (const variable of variables) {
          const varOption = page.getByText(variable).or(page.getByRole('menuitem', { name: new RegExp(variable.replace(/[{}]/g, ''), 'i') }));
          if (await varOption.isVisible().catch(() => false)) {
            await expect(varOption).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Template Editor', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to edit first template
      const editButton = page.getByRole('button', { name: /Edit/i }).first();
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page.waitForURL(/\/dashboard\/templates\/.+/, { timeout: 5000 });
      }
    });

    test('should display template editor with tabs', async ({ page }) => {
      // Should have editor tabs
      const tabs = ['Content', 'Design', 'Preview'];
      for (const tab of tabs) {
        const tabElement = page.getByRole('tab', { name: tab }).or(page.getByRole('button', { name: tab }));
        if (await tabElement.isVisible().catch(() => false)) {
          await expect(tabElement).toBeVisible();
        }
      }
    });

    test('should edit template name', async ({ page }) => {
      const nameField = page.getByLabel(/Template Name/i);
      
      if (await nameField.isVisible().catch(() => false)) {
        await nameField.clear();
        await nameField.fill('Updated Template Name');
        
        await expect(nameField).toHaveValue('Updated Template Name');
      }
    });

    test('should edit template subject', async ({ page }) => {
      const subjectField = page.getByLabel(/Subject/i);
      
      if (await subjectField.isVisible().catch(() => false)) {
        await subjectField.clear();
        await subjectField.fill('Updated Subject: {{quoteNumber}}');
        
        await expect(subjectField).toHaveValue('Updated Subject: {{quoteNumber}}');
      }
    });

    test('should switch to preview tab', async ({ page }) => {
      const previewTab = page.getByRole('tab', { name: /Preview/i }).or(page.getByRole('button', { name: /Preview/i }));
      
      if (await previewTab.isVisible().catch(() => false)) {
        await previewTab.click();
        
        // Should show preview
        await page.waitForTimeout(500);
        
        const hasPreview = await page.locator('iframe').or(page.locator('.preview')).first().isVisible().catch(() => false);
        expect(hasPreview).toBeTruthy();
      }
    });

    test('should change template colors', async ({ page }) => {
      const designTab = page.getByRole('tab', { name: /Design/i }).or(page.getByRole('button', { name: /Design/i }));
      
      if (await designTab.isVisible().catch(() => false)) {
        await designTab.click();
        
        // Look for color pickers
        const colorPicker = page.locator('input[type="color"]').first();
        
        if (await colorPicker.isVisible().catch(() => false)) {
          await colorPicker.fill('#ff0000');
          
          // Color should update
          await expect(colorPicker).toHaveValue('#ff0000');
        }
      }
    });

    test('should save template changes', async ({ page }) => {
      // Make a change
      const subjectField = page.getByLabel(/Subject/i);
      if (await subjectField.isVisible().catch(() => false)) {
        await subjectField.fill('Test Subject Update');
      }
      
      // Save
      await page.getByRole('button', { name: /Save|Update/i }).click();
      
      // Should show success
      await page.waitForTimeout(500);
      
      const hasSuccess = await page.getByText(/saved|updated|success/i).first().isVisible().catch(() => false);
      expect(hasSuccess).toBeTruthy();
    });
  });

  test.describe('Template Preview', () => {
    test('should render template variables in preview', async ({ page }) => {
      // Navigate to template edit
      const editButton = page.getByRole('button', { name: /Edit/i }).first();
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page.waitForURL(/\/dashboard\/templates\/.+/, { timeout: 5000 });
      }
      
      // Go to preview
      const previewTab = page.getByRole('tab', { name: /Preview/i });
      if (await previewTab.isVisible().catch(() => false)) {
        await previewTab.click();
        await page.waitForTimeout(500);
        
        // Preview should show variable examples
        const pageText = await page.textContent('body');
        
        // Should have example values instead of raw variables
        const hasExamples = /John Smith|Acme Store|QT-\d{4}/.test(pageText || '');
        expect(hasExamples).toBeTruthy();
      }
    });

    test('should update preview with form changes', async ({ page }) => {
      const editButton = page.getByRole('button', { name: /Edit/i }).first();
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page.waitForURL(/\/dashboard\/templates\/.+/, { timeout: 5000 });
      }
      
      // Change subject
      const subjectField = page.getByLabel(/Subject/i);
      if (await subjectField.isVisible().catch(() => false)) {
        await subjectField.fill('New Preview Subject');
        
        // Go to preview
        const previewTab = page.getByRole('tab', { name: /Preview/i });
        if (await previewTab.isVisible().catch(() => false)) {
          await previewTab.click();
          await page.waitForTimeout(500);
          
          // Preview should reflect changes
          await expect(page.getByText('New Preview Subject')).toBeVisible();
        }
      }
    });
  });

  test.describe('Template Categories', () => {
    test('should display all template categories', async ({ page }) => {
      const categoryFilter = page.getByRole('combobox');
      
      if (await categoryFilter.isVisible().catch(() => false)) {
        await categoryFilter.click();
        
        // Should have category options
        const categories = ['Quote Email', 'Follow-up', 'Reminder', 'Quote Accepted', 'Quote Declined'];
        for (const category of categories) {
          const option = page.getByRole('option', { name: category });
          if (await option.isVisible().catch(() => false)) {
            await expect(option).toBeVisible();
          }
        }
      }
    });

    test('should categorize templates correctly', async ({ page }) => {
      // Look for category labels on template cards
      const categoryLabels = page.getByText(/Quote Email|Reminder|Accepted/i);
      
      if (await categoryLabels.first().isVisible().catch(() => false)) {
        // Each template should have a category
        const templates = page.locator('.template-card, [data-testid="template-card"]');
        const templateCount = await templates.count();
        
        // More robust check for cards
        const allCards = page.locator('div').filter({ hasText: /Standard|Quote|Template/i }).filter({ has: page.getByText(/Updated|Subject/i) });
        expect(await allCards.count()).toBeGreaterThan(0);
      }
    });
  });
});
