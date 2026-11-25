import { expect, test } from '@playwright/test';
import { ROUTES, watchErrors } from './helpers';

for (const path of ROUTES) {
  test(`${path} renders without errors or failed requests`, async ({ page }) => {
    const errors = watchErrors(page);
    const response = await page.goto(path, { waitUntil: 'networkidle' });
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    expect(errors, errors.join('\n')).toEqual([]);
  });
}

test('/ redirects to the English home page', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/en\/$/);
});

test('paths without a trailing slash redirect to the canonical one', async ({ request }) => {
  const response = await request.get('/en/download', { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe('/en/download/');
});

test('an unknown URL returns the branded 404 page', async ({ page }) => {
  const response = await page.goto('/en/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('main')).toContainText('404');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.getByRole('link', { name: /home/i }).last().click();
  await expect(page).toHaveURL(/\/en\/$/);
});
