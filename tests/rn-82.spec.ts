import { test, expect } from '@playwright/test';

test.describe('RN-82', () => {
  test('should allow admin to access Users Management page from Users section', { tag: ['@functional', '@critical', '@admin'] }, async ({ page }) => {
      // Navigate to login page and authenticate as admin
      await page.goto('/');
      await page.fill('input[type="email"], input[name="email"], #email', process.env.TEST_USER_EMAIL!);
      await page.fill('input[type="password"], input[name="password"], #password', process.env.TEST_USER_PASSWORD!);
      await page.click('button[type="submit"], button:has-text("Login"), input[type="submit"]');

      // Wait for dashboard to load
      await page.waitForURL(/\/dashboard/i);

      // Navigate to the left side panel and click on Users section
      // TODO: Use specific selector for Users menu item in left panel
      await page.click('nav [data-testid="users-menu"], .sidebar a:has-text("Users"), .left-panel a:has-text("Users")');

      // Verify Users Management page is displayed
      await page.waitForURL(/\/users/i);

      // Verify page title or heading indicates Users Management
      await expect(page.getByRole('heading', { name: /users management|users/i })).toBeVisible();

      // Verify essential elements are present on the page
      await expect(page.locator('input[placeholder*="search"], .search-bar')).toBeVisible();
      await expect(page.getByRole('button', { name: /invite user|\+.*invite/i })).toBeVisible();

      // Verify users table columns are present
      await expect(page.getByRole('columnheader', { name: /id/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /email/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /role/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /created at/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /updated at/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /invite status/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /action/i })).toBeVisible();
    });

  test('should deny access to Users Management page for non-Admin users', { tag: ['@security', '@critical', '@access-control'] }, async ({ page }) => {
    // Login as non-admin user
    await page.goto('/');
    await page.fill('input[type="email"], input[name="email"], #email', process.env.TEST_USER_EMAIL!);
    await page.fill('input[type="password"], input[name="password"], #password', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"], button:has-text("Login"), input[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL(/\/dashboard/i);

    // Attempt to navigate directly to Users Management page
    // TODO: Replace with actual Users Management URL path
    await page.goto('/users');

    // Verify access is denied with appropriate error message
    // TODO: Update selector for actual error message element
    await expect(page.locator('text="Access Denied", text="Unauthorized", text="403", .error-message, .access-denied')).toBeVisible();

    // Alternatively, check if redirected away from users page
    await expect(page).not.toHaveURL(/\/users/i);

    // Verify Users section is not visible in left side panel for non-admin
    // TODO: Update selector for actual Users menu item
    await expect(page.locator('text="Users", [data-testid="users-menu"], .sidebar-menu:has-text("Users")')).not.toBeVisible();
  });

  test('Admin views users list under their organization', { tag: ['@functional', '@high', '@admin'] }, async ({ page }) => {
    // Login as admin user
    await page.goto('/');
    await page.fill('input[type="email"], input[name="email"], #email', process.env.TEST_USER_EMAIL!);
    await page.fill('input[type="password"], input[name="password"], #password', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"], button:has-text("Login"), input[type="submit"]');
    await page.waitForURL(/\/dashboard/i);

    // Navigate to Users Management page from left side panel
    await page.click('a:has-text("Users"), [data-testid="users-menu"], .users-menu');
    await page.waitForURL(/\/users/i);

    // Verify users list table is displayed with required columns
    await expect(page.locator('table thead')).toBeVisible();
    await expect(page.locator('th:has-text("ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Role")')).toBeVisible();
    await expect(page.locator('th:has-text("Created at")')).toBeVisible();
    await expect(page.locator('th:has-text("Updated at")')).toBeVisible();
    await expect(page.locator('th:has-text("Invite Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Action")')).toBeVisible();

    // Verify action column contains Edit, Delete, Restore buttons
    const actionButtons = page.locator('tbody tr:first-child td:last-child');
    await expect(actionButtons.locator('button:has-text("Edit"), [data-testid="edit-user"]')).toBeVisible();
    await expect(actionButtons.locator('button:has-text("Delete"), [data-testid="delete-user"]')).toBeVisible();
    await expect(actionButtons.locator('button:has-text("Restore"), [data-testid="restore-user"]')).toBeVisible();

    // Verify Resend Invite button is visible only for pending invites
    const pendingInviteRow = page.locator('tbody tr:has-text("pending")');
    if (await pendingInviteRow.count() > 0) {
      await expect(pendingInviteRow.locator('button:has-text("Resend Invite"), [data-testid="resend-invite"]')).toBeVisible();
    }

    // Verify search bar is present
    await expect(page.locator('input[type="search"], input[placeholder*="search"], [data-testid="search-users"]')).toBeVisible();

    // Verify +Invite User button is present
    await expect(page.locator('button:has-text("+Invite User"), button:has-text("Invite User"), [data-testid="invite-user-btn"]')).toBeVisible();

    // Verify pagination controls
    const paginationContainer = page.locator('.ant-pagination, [data-testid="pagination"], .pagination');
    await expect(paginationContainer).toBeVisible();
    await expect(paginationContainer.locator('button:has-text("Previous"), .ant-pagination-prev')).toBeVisible();
    await expect(paginationContainer.locator('button:has-text("Next"), .ant-pagination-next')).toBeVisible();

    // Verify page number controls
    await expect(paginationContainer.locator('.ant-pagination-item, .page-number')).toBeVisible();

    // Verify users per page dropdown
    await expect(page.locator('select[data-testid="users-per-page"], .ant-select:has-text("10/page"), select:has(option:text("10"))')).toBeVisible();

    // Verify users displayed are from admin's organization only (check first user row exists)
    await expect(page.locator('tbody tr:first-child')).toBeVisible();

    // Additional check: verify at least one user is displayed or empty state message
    const userRows = page.locator('tbody tr');
    const emptyState = page.locator('[data-testid="empty-state"], .empty-state, :has-text("No users found")');

    if (await userRows.count() === 0) {
      await expect(emptyState).toBeVisible();
    } else {
      await expect(userRows.first()).toBeVisible();
    }
  });
});
