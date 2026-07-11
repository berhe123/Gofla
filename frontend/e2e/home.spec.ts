import { test, expect } from '@playwright/test';

test('home page loads with hero and navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /shop smarter/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Gofla' }).first()).toBeVisible();
});

test('can navigate to shop', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /start shopping/i }).first().click();
  await expect(page).toHaveURL(/\/shop/);
});
