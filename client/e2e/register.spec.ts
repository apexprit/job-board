import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('displays registration form', async ({ page }) => {
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.getByRole('button', { name: /create account/i }).click();

    // Should show validation error messages
    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/^password/i).fill('Password1!');
    await page.getByLabel(/confirm password/i).fill('Password1!');
    await page.getByRole('button', { name: /create account/i }).click();

    // Should show email validation error
    await expect(page.getByText(/invalid email|valid email/i)).toBeVisible();
  });

  test('has link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /login/i });
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('registration form inputs are interactive', async ({ page }) => {
    const firstNameInput = page.getByLabel(/first name/i);
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/^password/i);

    await firstNameInput.fill('Test');
    await expect(firstNameInput).toHaveValue('Test');

    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');

    await passwordInput.fill('Password1!');
    await expect(passwordInput).toHaveValue('Password1!');
  });
});
