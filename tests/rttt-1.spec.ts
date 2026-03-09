import { test, expect } from '@playwright/test';

test.describe('RTTT-1', () => {
  test('should successfully login with registered email and correct password', { tag: ['@functional', '@critical', '@login'] }, async ({ page }) => {
    // Navigate to login page
    await page.goto('/');

    // Enter registered email
    await page.fill('input[type="email"], input[name="email"], #email', process.env.TEST_USER_EMAIL!);

    // Enter correct password
    await page.fill('input[type="password"], input[name="password"], #password', process.env.TEST_USER_PASSWORD!);

    // Click login button
    await page.click('button[type="submit"], button:has-text("Login"), input[type="submit"]');

    // Verify redirection to dashboard
    await page.waitForURL(/\/dashboard/i);

    // Additional assertion to confirm dashboard page loaded
    await expect(page).toHaveURL(/\/dashboard/i);
  });
});
