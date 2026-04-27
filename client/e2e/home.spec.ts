import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads home page successfully', async ({ page }) => {
    await page.goto('/');

    // Page should have a title
    await expect(page).toHaveTitle(/job/i);

    // Navbar should be visible
    await expect(page.locator('nav')).toBeVisible();

    // Footer should be visible
    await expect(page.locator('footer')).toBeVisible();
  });

  test('displays find your dream job heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/find your dream job/i)).toBeVisible();
  });
});
