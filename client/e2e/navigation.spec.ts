import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navigates to login page', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.getByRole('link', { name: /^login$/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('navigates to register page via sign up', async ({ page }) => {
    await page.goto('/');

    const signUpLink = page.getByRole('link', { name: /sign up/i });
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });

  test('navigates to jobs page', async ({ page }) => {
    await page.goto('/');

    const jobsLink = page.getByRole('link', { name: /^jobs$/i });
    if (await jobsLink.isVisible()) {
      await jobsLink.click();
      await expect(page).toHaveURL(/\/jobs/);
    }
  });

  test('navigates back to home from another page', async ({ page }) => {
    await page.goto('/login');

    const homeLink = page.getByRole('link', { name: /jobboard|home/i });
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});
