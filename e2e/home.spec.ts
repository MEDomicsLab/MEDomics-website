import { expect, test, type Page } from '@playwright/test';
import { scrollToY, settle } from './helpers';

/** Scroll budget of the pinned hero, in viewport heights (src/components/sections/home/HeroLayers.tsx). */
const stepAt = (i: number) => (i === 0 ? 1.3 : 2.1 + (i - 1));

async function pinStart(page: Page) {
  return page.evaluate(() => {
    const pin = document.querySelector('.hl')!;
    return pin.getBoundingClientRect().top + window.scrollY - document.querySelector('header')!.offsetHeight;
  });
}

const states = (page: Page) => page.locator('.layer-item').evaluateAll((items) => items.map((li) => li.getAttribute('data-state')));

test.describe('pinned hero → three layers scene (desktop, full motion)', () => {
  test('each scroll step opens the next layer, and scrolling back reverses every step', async ({ page }) => {
    await page.goto('/en/');
    await settle(page);
    await expect(page.locator('.hl')).toHaveClass(/is-pinned/);
    const start = await pinStart(page);
    const vh = await page.evaluate(() => window.innerHeight);
    const at = (d: number) => scrollToY(page, start + d * vh);

    await expect.poll(() => states(page)).toEqual(['hidden', 'hidden', 'hidden', 'hidden']);
    const expected = [
      ['open', 'hidden', 'hidden', 'hidden'],
      ['closed', 'open', 'hidden', 'hidden'],
      ['closed', 'closed', 'open', 'hidden'],
      ['closed', 'closed', 'closed', 'open'],
    ];
    for (let i = 0; i < 4; i++) {
      await at(stepAt(i) + 0.3);
      await expect.poll(() => states(page)).toEqual(expected[i]);
    }
    for (let i = 2; i >= 0; i--) {
      await at(stepAt(i) + 0.3);
      await expect.poll(() => states(page)).toEqual(expected[i]);
    }
    await at(0);
    await expect.poll(() => states(page)).toEqual(['hidden', 'hidden', 'hidden', 'hidden']);
    await expect(page.locator('.hl')).toHaveAttribute('data-in', 'false');
  });

  test('the heading of an earlier layer scrolls back to its step', async ({ page }) => {
    await page.goto('/en/');
    await settle(page);
    await expect(page.locator('.hl')).toHaveClass(/is-pinned/);
    await scrollToY(page, (await pinStart(page)) + (stepAt(2) + 0.3) * (await page.evaluate(() => window.innerHeight)));
    await expect.poll(() => states(page)).toEqual(['closed', 'closed', 'open', 'hidden']);
    // layers not reached yet are inert; the ones already passed stay clickable
    await expect(page.locator('.layer-item').nth(3)).toHaveAttribute('inert', '');
    await page.locator('.layer-item').nth(0).getByRole('button').click();
    await expect.poll(() => states(page), { timeout: 10_000 }).toEqual(['open', 'hidden', 'hidden', 'hidden']);
  });
});

test.describe('without the pin (reduced motion)', () => {
  test.use({ reducedMotion: 'reduce' });

  test('every layer is reachable as a plain accordion', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('.hl')).not.toHaveClass(/is-pinned/);
    const items = page.locator('.layer-item');
    await expect(items).toHaveCount(4);
    await items.nth(2).getByRole('button').click();
    await expect(items.nth(2)).toHaveAttribute('data-state', 'open');
    await expect(items.nth(2).getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });
});

/** Visible stage of the final-CTA scene (the container query hides the other layout). */
const stage = (page: Page) => page.locator('#get-started .ps-stage').filter({ visible: true });
const opacity = (page: Page, selector: string) =>
  stage(page)
    .locator(selector)
    .evaluateAll((els) => els.map((e) => Number(getComputedStyle(e).opacity) * (getComputedStyle(e).visibility === 'hidden' ? 0 : 1)));

test.describe('final CTA pipeline scene', () => {
  test('plays when it scrolls into view, ends on the results, and rewinds when it leaves', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/en/');
    await settle(page);
    await page.locator('#get-started .ps').scrollIntoViewIfNeeded();
    // the nodes are dropped one by one…
    await expect.poll(() => opacity(page, '[data-node]'), { timeout: 10_000 }).toContain(1);
    // …then all of them run and the results panel shows the metrics
    await expect.poll(() => opacity(page, '.ps-done'), { timeout: 25_000 }).toEqual([1, 1, 1, 1, 1]);
    await expect.poll(() => opacity(page, '.ps-metric'), { timeout: 8_000 }).not.toContain(0);
    // leaving the viewport rewinds it, so the next visit plays it again
    await scrollToY(page, 0);
    await expect.poll(() => opacity(page, '[data-node]')).toEqual([0, 0, 0, 0, 0]);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('shows the finished experiment as a still image', async ({ page }) => {
      await page.goto('/en/');
      await page.locator('#get-started .ps').scrollIntoViewIfNeeded();
      expect(await opacity(page, '[data-node]')).toEqual([1, 1, 1, 1, 1]);
      expect(await opacity(page, '.ps-metric')).not.toContain(0);
      await expect(page.locator('#get-started .ps')).toHaveAttribute('role', 'img');
      await expect(page.locator('#get-started .ps')).toHaveAttribute('aria-label', /ROC curve/);
    });
  });
});

test.describe('ambient animations', () => {
  test('the open-source tree carries pixels that move along its branches', async ({ page }) => {
    await page.goto('/en/');
    await settle(page);
    await page.locator('#open-source [data-branch]').first().scrollIntoViewIfNeeded();
    const positions = () =>
      page
        .locator('.tree-pulse')
        .evaluateAll((els) => els.filter((e) => getComputedStyle(e).visibility === 'visible').map((e) => e.style.transform));
    await expect.poll(async () => (await positions()).length).toBeGreaterThan(0);
    const first = await positions();
    await expect.poll(positions).not.toEqual(first);
  });

  test('the workflow particle fans animate', async ({ page }) => {
    await page.goto('/en/');
    await settle(page);
    const canvas = page.locator('#workflow canvas');
    await canvas.scrollIntoViewIfNeeded();
    const frame = () => canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
    const first = await frame();
    await expect.poll(frame).not.toBe(first);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('the tree has no moving pixels and the fans hold still', async ({ page }) => {
      await page.goto('/en/');
      await settle(page);
      await page.locator('#open-source').scrollIntoViewIfNeeded();
      await expect(page.locator('.tree-pulse')).toHaveCount(0);
      const canvas = page.locator('#workflow canvas');
      await canvas.scrollIntoViewIfNeeded();
      const first = await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL());
      await page.waitForTimeout(600);
      expect(await canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL())).toBe(first);
    });
  });
});

test('the final CTA board and the footer strip carry logo-coloured pixels; the 404 board stays plain', async ({ page }) => {
  const coloured = (selector: string) =>
    page.locator(selector).evaluateAll((els) => els.filter((e) => e.getAttribute('fill')?.startsWith('var(--acc-')).length);
  await page.goto('/en/');
  const board = await coloured('#get-started svg rect');
  const footer = await coloured('footer svg rect');
  const total = await page.locator('#get-started svg rect').count();
  expect(board).toBeGreaterThan(0);
  expect(board / total).toBeLessThan(0.25); // accents, not a new main colour
  expect(footer).toBeGreaterThan(0);
  await page.goto('/en/this-page-does-not-exist/');
  expect(await coloured('svg rect')).toBe(0);
});

test.describe('hero falling blocks', () => {
  test.use({ reducedMotion: 'reduce' });
  test('a few blocks take a logo colour', async ({ page }) => {
    await page.goto('/en/');
    const canvas = page.locator('.hl-board canvas');
    await expect(canvas).toBeVisible();
    const logoPixels = () =>
      canvas.evaluate((c: HTMLCanvasElement) => {
        const css = getComputedStyle(c);
        const logo = ['green', 'blue', 'orange', 'red', 'yellow'].map((k) => {
          const h = css.getPropertyValue(`--acc-${k}`).trim();
          return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
        });
        const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
        let n = 0;
        for (let i = 0; i < d.length; i += 16)
          if (logo.some((l) => Math.abs(l[0] - d[i]) + Math.abs(l[1] - d[i + 1]) + Math.abs(l[2] - d[i + 2]) < 12)) n++;
        return n;
      });
    await expect.poll(logoPixels).toBeGreaterThan(0);
  });
});
