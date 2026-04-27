import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
  test('redirects to login when accessing protected route unauthenticated', async ({ page }) => {
    await page.goto('/employer/dashboard');

    // Should be redirected to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects to login when accessing seeker dashboard unauthenticated', async ({ page }) => {
    await page.goto('/seeker/dashboard');

    // Should be redirected to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects to login when accessing admin dashboard unauthenticated', async ({ page }) => {
    await page.goto('/admin/dashboard');

    // Should be redirected to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('guest routes are accessible without authentication', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
  });
});
