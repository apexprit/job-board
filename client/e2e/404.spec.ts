import { test, expect } from '@playwright/test';

test.describe('404 Page', () => {
  test('displays 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText(/doesn't exist|not found/i)).toBeVisible();
  });

  test('has link to go back home from 404 page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    const homeLink = page.getByRole('link', { name: /go back|home/i });
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});
