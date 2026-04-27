import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('displays login form', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show validation error messages
    await expect(page.getByText(/required|invalid|enter/i)).toBeVisible();
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('Password1!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show email validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('has link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /register/i });
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('login form inputs are interactive', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');

    await passwordInput.fill('Password1!');
    await expect(passwordInput).toHaveValue('Password1!');
  });
});
