import { expect, test } from '@playwright/test';
import { installers } from '../src/lib/release-utils';
import { releases } from './helpers';

test('the download cells point to the latest release’s installers', async ({ page }) => {
  const { latest } = releases();
  const ins = installers(latest);
  await page.goto('/en/download/');
  await expect(page.locator('#version')).toHaveValue(latest.tag);
  for (const file of [ins.windows, ins.linux, ins.macPkg, ins.macDmg].filter(Boolean)) {
    const link = page.locator(`a[href="${file!.url}"]`);
    await expect(link, file!.name).toBeVisible();
    await expect(link).toHaveAttribute('download', '');
    await expect(page.getByText(file!.name, { exact: false }).first()).toBeVisible();
  }
});

test('the version picker lists every release and swaps the links', async ({ page }) => {
  const { app } = releases();
  await page.goto('/en/download/');
  await expect(page.locator('#version option')).toHaveCount(app.length);
  const older = app.find((r, i) => i > 0 && installers(r).windows);
  test.skip(!older, 'no older release with a Windows installer');
  await page.locator('#version').selectOption(older!.tag);
  await expect(page.locator(`a[href="${installers(older!).windows!.url}"]`)).toBeVisible();
});

test('the release card on the home page names the latest version', async ({ page }) => {
  const { latest } = releases();
  await page.goto('/en/');
  await expect(page.locator('.hl-dz-card')).toContainText(latest.tag.replace(/^v/, ''));
});
