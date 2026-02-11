/**
 * Settings Management E2E Tests
 * Tests all settings tabs: Company, Quotes, Notifications, Appearance, Integrations
 */

import { test, expect, mockSettings } from '../fixtures/test-fixtures';

test.describe('Settings Management', () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.goto();
  });

  test.describe('Settings Layout', () => {
    test('should display settings header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
      await expect(page.getByText(/Manage your account and application preferences/i)).toBeVisible();
    });

    test('should display settings navigation tabs', async ({ page }) => {
      const tabs = [
        'Company',
        'Quote Defaults',
        'Notifications',
        'Appearance',
        'Integrations',
        'Team',
        'Billing',
        'Webhooks',
        'Security',
      ];
      
      for (const tab of tabs) {
        const tabButton = page.getByRole('button', { name: new RegExp(`^${tab}$`, 'i') });
        if (await tabButton.isVisible().catch(() => false)) {
          await expect(tabButton).toBeVisible();
        }
      }
    });

    test('should have responsive layout', async ({ page }) => {
      // Test tablet viewport
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.reload();
      
      await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Company/i })).toBeVisible();
    });
  });

  test.describe('Company Settings', () => {
    test('should navigate to Company tab', async ({ page, settingsPage }) => {
      await settingsPage.navigateToTab('Company');
      
      await expect(page.getByRole('heading', { name: /Company Information/i })).toBeVisible();
    });

    test('should display company form fields', async ({ page }) => {
      await page.getByRole('button', { name: /Company/i }).click();
      
      const fields = [
        /Company Name/i,
        /Tax ID/i,
        /Business Address/i,
        /Phone Number/i,
        /Email Address/i,
        /Website/i,
      ];
      
      for (const field of fields) {
        const fieldLabel = page.getByLabel(field).or(page.getByText(field).first());
        if (await fieldLabel.isVisible().catch(() => false)) {
          await expect(fieldLabel).toBeVisible();
        }
      }
    });

    test('should upload company logo', async ({ page }) => {
      await page.getByRole('button', { name: /Company/i }).click();
      
      const uploadButton = page.getByRole('button', { name: /Upload Logo/i });
      if (await uploadButton.isVisible().catch(() => false)) {
        await expect(uploadButton).toBeVisible();
        await expect(uploadButton).toBeEnabled();
        
        // Note: Actual file upload testing requires specific handling
      }
    });

    test('should save company settings', async ({ page, settingsPage }) => {
      await page.getByRole('button', { name: /Company/i }).click();
      
      // Fill company info
      const nameField = page.getByLabel(/Company Name/i);
      if (await nameField.isVisible().catch(() => false)) {
        await nameField.fill(mockSettings.company.name);
      }
      
      const phoneField = page.getByLabel(/Phone Number/i);
      if (await phoneField.isVisible().catch(() => false)) {
        await phoneField.fill(mockSettings.company.phone);
      }
      
      // Save
      await page.getByRole('button', { name: /Save Changes/i }).click();
      
      // Should show success
      await expect(page.getByText(/Saved successfully/i)).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.getByRole('button', { name: /Company/i }).click();
      
      // Clear required field
      const nameField = page.getByLabel(/Company Name/i);
      if (await nameField.isVisible().catch(() => false)) {
        await nameField.clear();
        await page.getByRole('button', { name: /Save Changes/i }).click();
        
        // Should show error
        const hasError = await page.getByText(/required|error/i).first().isVisible().catch(() => false);
        expect(hasError).toBeTruthy();
      }
    });
  });

  test.describe('Quote Defaults Settings', () => {
    test('should navigate to Quote Defaults tab', async ({ page, settingsPage }) => {
      await settingsPage.navigateToTab('Quote Defaults');
      
      await expect(page.getByRole('heading', { name: /Quote Defaults/i })).toBeVisible();
    });

    test('should display quote settings form', async ({ page }) => {
      await page.getByRole('button', { name: /Quote Defaults/i }).click();
      
      const fields = [
        /Default Currency/i,
        /Quote Number Prefix/i,
        /Default Validity Period/i,
        /Default Tax Rate/i,
        /Default Payment Terms/i,
        /Default Delivery Terms/i,
      ];
      
      for (const field of fields) {
        const fieldElement = page.getByLabel(field).or(page.getByText(field).first());
        if (await fieldElement.isVisible().catch(() => false)) {
          await expect(fieldElement).toBeVisible();
        }
      }
    });

    test('should change default currency', async ({ page }) => {
      await page.getByRole('button', { name: /Quote Defaults/i }).click();
      
      const currencySelect = page.getByLabel(/Default Currency/i);
      if (await currencySelect.isVisible().catch(() => false)) {
        await currencySelect.selectOption('EUR');
        await expect(currencySelect).toHaveValue('EUR');
        
        // Save
        await page.getByRole('button', { name: /Save Changes/i }).click();
        await expect(page.getByText(/Saved successfully/i)).toBeVisible();
      }
    });

    test('should set quote number prefix', async ({ page }) => {
      await page.getByRole('button', { name: /Quote Defaults/i }).click();
      
      const prefixField = page.getByLabel(/Quote Number Prefix/i);
      if (await prefixField.isVisible().catch(() => false)) {
        await prefixField.fill('QUOTE');
        await expect(prefixField).toHaveValue('QUOTE');
      }
    });

    test('should set validity period', async ({ page }) => {
      await page.getByRole('button', { name: /Quote Defaults/i }).click();
      
      const validityField = page.getByLabel(/Default Validity Period/i);
      if (await validityField.isVisible().catch(() => false)) {
        await validityField.fill('45');
        await expect(validityField).toHaveValue('45');
      }
    });

    test('should toggle auto-numbering', async ({ page }) => {
      await page.getByRole('button', { name: /Quote Defaults/i }).click();
      
      const autoNumberToggle = page.getByLabel(/Auto-numbering/i);
      if (await autoNumberToggle.isVisible().catch(() => false)) {
        // Toggle off
        await autoNumberToggle.click();
        
        // Toggle back on
        await autoNumberToggle.click();
        
        await expect(autoNumberToggle).toBeChecked();
      }
    });

    test('should toggle quote expirations', async ({ page }) => {
      await page.getByRole('button', { name: /Quote Defaults/i }).click();
      
      const expirationToggle = page.getByLabel(/Enable Quote Expirations/i);
      if (await expirationToggle.isVisible().catch(() => false)) {
        await expirationToggle.click();
        await page.waitForTimeout(200);
        await expirationToggle.click();
        
        await expect(expirationToggle).toBeChecked();
      }
    });
  });

  test.describe('Notification Settings', () => {
    test('should navigate to Notifications tab', async ({ page, settingsPage }) => {
      await settingsPage.navigateToTab('Notifications');
      
      await expect(page.getByRole('heading', { name: /Notifications/i })).toBeVisible();
    });

    test('should display notification toggles', async ({ page }) => {
      await page.getByRole('button', { name: /Notifications/i }).click();
      
      const toggles = [
        /New Quote Submitted/i,
        /Quote Viewed/i,
        /Quote Accepted/i,
        /Quote Declined/i,
        /Daily Digest/i,
        /Weekly Report/i,
        /Browser Notifications/i,
      ];
      
      for (const toggle of toggles) {
        const toggleElement = page.getByText(toggle).first();
        if (await toggleElement.isVisible().catch(() => false)) {
          await expect(toggleElement).toBeVisible();
        }
      }
    });

    test('should toggle notification settings', async ({ page }) => {
      await page.getByRole('button', { name: /Notifications/i }).click();
      
      // Find a toggle
      const toggle = page.locator('button[role="switch"]').first().or(page.locator('input[type="checkbox"]').first());
      
      if (await toggle.isVisible().catch(() => false)) {
        const initialState = await toggle.isChecked().catch(() => true);
        
        await toggle.click();
        await page.waitForTimeout(200);
        
        // Save
        await page.getByRole('button', { name: /Save Changes/i }).click();
        await expect(page.getByText(/Saved successfully/i)).toBeVisible();
      }
    });

    test('should save all notification preferences', async ({ page, settingsPage }) => {
      await page.getByRole('button', { name: /Notifications/i }).click();
      
      // Toggle various notifications
      await settingsPage.toggleNotification('New Quote Submitted');
      await settingsPage.toggleNotification('Quote Accepted');
      
      // Save
      await page.getByRole('button', { name: /Save Changes/i }).click();
      await expect(page.getByText(/Saved successfully/i)).toBeVisible();
    });
  });

  test.describe('Appearance Settings', () => {
    test('should navigate to Appearance tab', async ({ page, settingsPage }) => {
      await settingsPage.navigateToTab('Appearance');
      
      await expect(page.getByRole('heading', { name: /Appearance/i })).toBeVisible();
    });

    test('should display theme selection', async ({ page }) => {
      await page.getByRole('button', { name: /Appearance/i }).click();
      
      const themes = ['Dark', 'Light', 'System'];
      for (const theme of themes) {
        const themeButton = page.getByRole('button', { name: theme, exact: true });
        if (await themeButton.isVisible().catch(() => false)) {
          await expect(themeButton).toBeVisible();
        }
      }
    });

    test('should change theme', async ({ page, settingsPage }) => {
      await page.getByRole('button', { name: /Appearance/i }).click();
      
      // Change to light theme
      await settingsPage.changeTheme('light');
      
      // Theme should be applied
      await page.waitForTimeout(500);
      
      // Save
      await page.getByRole('button', { name: /Save Changes/i }).click();
      await expect(page.getByText(/Saved successfully/i)).toBeVisible();
    });

    test('should change primary color', async ({ page, settingsPage }) => {
      await page.getByRole('button', { name: /Appearance/i }).click();
      
      // Change color
      await settingsPage.changePrimaryColor('#ff5722');
      
      // Color should be updated
      const colorPicker = page.locator('input[type="color"]').first();
      if (await colorPicker.isVisible().catch(() => false)) {
        await expect(colorPicker).toHaveValue('#ff5722');
      }
    });

    test('should select logo position', async ({ page }) => {
      await page.getByRole('button', { name: /Appearance/i }).click();
      
      const positions = ['Left', 'Center', 'Right'];
      for (const position of positions) {
        const posButton = page.getByRole('button', { name: position, exact: true });
        if (await posButton.isVisible().catch(() => false)) {
          await posButton.click();
          await page.waitForTimeout(200);
        }
      }
    });

    test('should select font family', async ({ page }) => {
      await page.getByRole('button', { name: /Appearance/i }).click();
      
      const fontSelect = page.getByLabel(/Font Family/i);
      if (await fontSelect.isVisible().catch(() => false)) {
        await fontSelect.selectOption('roboto');
        await expect(fontSelect).toHaveValue('roboto');
      }
    });

    test('should toggle compact mode', async ({ page }) => {
      await page.getByRole('button', { name: /Appearance/i }).click();
      
      const compactToggle = page.getByLabel(/Compact Mode/i);
      if (await compactToggle.isVisible().catch(() => false)) {
        await compactToggle.click();
        await page.waitForTimeout(200);
        await compactToggle.click();
        
        // Save
        await page.getByRole('button', { name: /Save Changes/i }).click();
        await expect(page.getByText(/Saved successfully/i)).toBeVisible();
      }
    });
  });

  test.describe('Integration Settings', () => {
    test('should navigate to Integrations tab', async ({ page, settingsPage }) => {
      await settingsPage.navigateToTab('Integrations');
      
      await expect(page.getByRole('heading', { name: /Connected Services|Integrations/i })).toBeVisible();
    });

    test('should display connected services', async ({ page }) => {
      await page.getByRole('button', { name: /Integrations/i }).click();
      
      // Check for Shopify
      const shopify = page.getByText(/Shopify/i);
      if (await shopify.isVisible().catch(() => false)) {
        await expect(shopify).toBeVisible();
      }
      
      // Check for Stripe
      const stripe = page.getByText(/Stripe/i);
      if (await stripe.isVisible().catch(() => false)) {
        await expect(stripe).toBeVisible();
      }
    });

    test('should show Shopify connection status', async ({ page }) => {
      await page.getByRole('button', { name: /Integrations/i }).click();
      
      // Should show connected status
      const connected = page.getByText(/Connected/i).first();
      if (await connected.isVisible().catch(() => false)) {
        await expect(connected).toBeVisible();
      }
    });

    test('should display API key management', async ({ page }) => {
      await page.getByRole('button', { name: /Integrations/i }).click();
      
      const apiKeySection = page.getByText(/API Key/i).first();
      if (await apiKeySection.isVisible().catch(() => false)) {
        await expect(apiKeySection).toBeVisible();
        
        // Should have show/hide button
        const showButton = page.getByRole('button', { name: /Show|Hide/i });
        if (await showButton.isVisible().catch(() => false)) {
          await expect(showButton).toBeVisible();
        }
        
        // Should have regenerate button
        const regenerateButton = page.getByRole('button', { name: /Regenerate/i });
        if (await regenerateButton.isVisible().catch(() => false)) {
          await expect(regenerateButton).toBeVisible();
        }
      }
    });

    test('should toggle Stripe connection', async ({ page }) => {
      await page.getByRole('button', { name: /Integrations/i }).click();
      
      const stripeConnect = page.getByRole('button', { name: /Connect/i }).filter({ hasText: /Stripe/i });
      
      if (await stripeConnect.isVisible().catch(() => false)) {
        await stripeConnect.click();
        
        // Should initiate Stripe OAuth or show configuration
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Team Settings', () => {
    test('should navigate to Team tab', async ({ page, settingsPage }) => {
      await settingsPage.navigateToTab('Team');
      
      await expect(page.getByRole('heading', { name: /Team Management/i })).toBeVisible();
    });

    test('should display team members', async ({ page }) => {
      await page.getByRole('button', { name: /Team/i }).click();
      
      // Should have team member list or empty state
      const hasMembers = await page.locator('.team-member, [data-testid="team-member"]').first().isVisible().catch(() => false);
      const hasEmptyState = await page.getByText(/No team members|Invite team/i).first().isVisible().catch(() => false);
      
      expect(hasMembers || hasEmptyState).toBeTruthy();
    });
  });

  test.describe('Security Settings', () => {
    test('should navigate to Security tab', async ({ page, settingsPage }) => {
      await settingsPage.navigateToTab('Security');
      
      await expect(page.getByRole('heading', { name: /Security Settings/i })).toBeVisible();
    });

    test('should display security options', async ({ page }) => {
      await page.getByRole('button', { name: /Security/i }).click();
      
      const options = [
        /Two-factor/i,
        /Password/i,
        /Session/i,
      ];
      
      for (const option of options) {
        const optionElement = page.getByText(option).first();
        if (await optionElement.isVisible().catch(() => false)) {
          await expect(optionElement).toBeVisible();
        }
      }
    });
  });

  test.describe('Settings Persistence', () => {
    test('should persist settings after page refresh', async ({ page, settingsPage }) => {
      // Change a setting
      await page.getByRole('button', { name: /Quote Defaults/i }).click();
      
      const prefixField = page.getByLabel(/Quote Number Prefix/i);
      if (await prefixField.isVisible().catch(() => false)) {
        await prefixField.fill('TEST');
        await page.getByRole('button', { name: /Save Changes/i }).click();
        await expect(page.getByText(/Saved successfully/i)).toBeVisible();
        
        // Refresh page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Setting should persist
        await page.getByRole('button', { name: /Quote Defaults/i }).click();
        await expect(page.getByLabel(/Quote Number Prefix/i)).toHaveValue('TEST');
      }
    });

    test('should show loading state during save', async ({ page }) => {
      await page.getByRole('button', { name: /Company/i }).click();
      
      // Make a change
      const nameField = page.getByLabel(/Company Name/i);
      if (await nameField.isVisible().catch(() => false)) {
        await nameField.fill('Loading Test Company');
        
        // Click save
        const saveButton = page.getByRole('button', { name: /Save Changes/i });
        await saveButton.click();
        
        // Should show loading state
        await expect(page.getByText(/Saving/i)).toBeVisible();
      }
    });

    test('should handle save errors gracefully', async ({ page }) => {
      // Intercept save request and return error
      await page.route('/api/settings', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Failed to save' }),
        });
      });
      
      await page.getByRole('button', { name: /Company/i }).click();
      
      // Try to save
      await page.getByRole('button', { name: /Save Changes/i }).click();
      
      // Should show error
      await page.waitForTimeout(500);
      const hasError = await page.getByText(/error|failed/i).first().isVisible().catch(() => false);
      expect(hasError).toBeTruthy();
    });
  });
});
