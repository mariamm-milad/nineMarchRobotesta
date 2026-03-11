import { test, expect } from '@playwright/test';

test.describe('RTTT-1', () => {
  test('should display mandatory Email and Password input fields on login screen', { tag: ['@functional', '@critical', '@ui'] }, async ({ page }) => {
      // Navigate to login page
      await page.goto('/');

      // Verify Email input field is present and visible
      const emailField = page.locator('input[type="email"], input[name="email"], #email');
      await expect(emailField).toBeVisible();

      // Verify Password input field is present and visible
      const passwordField = page.locator('input[type="password"], input[name="password"], #password');
      await expect(passwordField).toBeVisible();

      // Verify Email field has appropriate label or placeholder
      await expect(emailField).toHaveAttribute('type', 'email');

      // Verify Password field has appropriate type for masking
      await expect(passwordField).toHaveAttribute('type', 'password');

      // Verify both fields are required (mandatory)
      await expect(emailField).toHaveAttribute('required', '');
      await expect(passwordField).toHaveAttribute('required', '');
    });
});
