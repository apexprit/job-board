import { test, expect } from '@playwright/test';

test('debug - check what renders on login page', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  const pageErrors: string[] = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  const responses: string[] = [];
  page.on('response', res => {
    if (res.status() >= 400) responses.push(`${res.status()} ${res.url()}`);
  });

  await page.goto('/login', { timeout: 15000, waitUntil: 'domcontentloaded' });
  
  // Wait for React to render
  await page.waitForTimeout(5000);
  
  const rootHTML = await page.locator('#root').innerHTML({ timeout: 5000 }).catch(() => 'EMPTY');
  const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => 'EMPTY');
  
  console.log('=== LOGIN ROOT HTML (first 500 chars) ===');
  console.log(typeof rootHTML === 'string' ? rootHTML.substring(0, 500) : rootHTML);
  console.log('=== BODY TEXT (first 300 chars) ===');
  console.log(typeof bodyText === 'string' ? bodyText.substring(0, 300) : bodyText);
  console.log('=== CONSOLE ERRORS ===');
  console.log(consoleErrors);
  console.log('=== PAGE ERRORS ===');
  console.log(pageErrors);
  console.log('=== FAILED RESPONSES ===');
  console.log(responses);
});
