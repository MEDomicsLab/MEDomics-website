import { expect, test, type Page } from '@playwright/test';
import { scrollToY, settle } from './helpers';

const header = (page: Page) => page.locator('header');

test.describe('desktop header', () => {
  test('the Platform menu lists the four layers and closes with Escape', async ({ page }) => {
    await page.goto('/en/about/');
    await settle(page);
    await header(page).getByRole('button', { name: 'Platform' }).click();
    const panel = page.locator('.nm-viewport');
    for (const anchor of ['design', 'development', 'collaborate', 'deployment']) {
      await expect(panel.locator(`a[href="/en/platform/#${anchor}"]`)).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(panel.locator('a[href="/en/platform/#design"]')).toBeHidden();
  });

  test('header links navigate and the new page opens at the top', async ({ page }) => {
    await page.goto('/en/platform/');
    await settle(page);
    await scrollToY(page, 1500);
    await header(page).getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/about\/$/);
    await expect(header(page).getByRole('link', { name: 'About', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await header(page).getByRole('link', { name: 'Download' }).click();
    await expect(page).toHaveURL(/\/en\/download\/$/);
    await expect(page.locator('main h1')).toBeVisible();
  });

  test('footer links open their page at the top', async ({ page }) => {
    await page.goto('/en/');
    await settle(page);
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.locator('footer').getByRole('link', { name: 'Platform', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/platform\/$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('the header switches to its blue palette over blue sections', async ({ page }) => {
    await page.goto('/en/');
    await settle(page);
    // the pinned hero adds its scroll length once it has set up: measure after that
    await expect(page.locator('.hl')).toHaveClass(/is-pinned/);
    const html = page.locator('html');
    /** Puts the top of a section 40px under the header's bottom edge. */
    const under = async (selector: string) => {
      const target = () =>
        page.evaluate((sel) => {
          const top = document.querySelector(sel)!.getBoundingClientRect().top + window.scrollY;
          return Math.round(top - document.querySelector('header')!.offsetHeight + 40);
        }, selector);
      await scrollToY(page, await target());
      // re-measure once scrolled (images and reveals above can still shift the section)
      await scrollToY(page, await target());
    };
    await under('#open-source');
    await expect(html).toHaveAttribute('data-nav-on-blue', '');
    await under('#faq');
    await expect(html).not.toHaveAttribute('data-nav-on-blue', '');
  });

  test('the language switch marks English as current and French as coming soon', async ({ page }) => {
    await page.goto('/en/about/');
    const lang = page.getByRole('group', { name: 'Language' });
    await expect(lang).toBeVisible();
    await expect(lang.locator('[aria-current="true"]')).toHaveText(/en/i);
    await expect(lang.locator('[lang="fr"]')).toHaveAttribute('aria-disabled', 'true');
  });

  test('the skip link is the first focusable element and targets the main content', async ({ page }) => {
    await page.goto('/en/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute('href', '#main');
    await expect(page.locator('#main')).toHaveCount(1);
  });
});

test.describe('phone menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens a sheet with every destination and closes back onto its trigger', async ({ page }) => {
    await page.goto('/en/');
    await settle(page);
    const trigger = page.getByRole('button', { name: 'Open menu' });
    await trigger.click();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await sheet.getByRole('button', { name: 'Platform' }).click();
    await expect(sheet.locator('a[href="/en/platform/#design"]')).toBeVisible();
    await expect(sheet.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en/about/');
    await expect(sheet.getByRole('link', { name: 'Download' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
  });

  test('following a link closes the sheet', async ({ page }) => {
    await page.goto('/en/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('dialog').getByRole('link', { name: 'Download' }).click();
    await expect(page).toHaveURL(/\/en\/download\/$/);
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});
