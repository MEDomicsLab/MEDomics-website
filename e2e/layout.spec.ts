import { expect, test } from '@playwright/test';
import { overflowX, ROUTES, settle, WIDTHS } from './helpers';

/** Every page fits every breakpoint: no sideways scrolling, with motion on and off. */
for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(`motion: ${reducedMotion}`, () => {
    test.use({ reducedMotion });
    for (const path of ROUTES) {
      test(`${path} has no horizontal overflow from ${WIDTHS[0]} to ${WIDTHS.at(-1)}px`, async ({ page }) => {
        for (const width of WIDTHS) {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(path);
          await settle(page);
          await expect.poll(() => overflowX(page), { message: `${path} at ${width}px` }).toBeLessThanOrEqual(0);
        }
      });
    }
  });
}

test.describe('tap targets on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  for (const path of ROUTES) {
    test(`${path} buttons are at least 44px tall`, async ({ page }) => {
      await page.goto(path);
      await settle(page);
      const small = await page.locator('main .btn').evaluateAll((els) =>
        els
          .filter((e) => (e as HTMLElement).offsetParent !== null)
          .map((e) => [e.textContent?.trim(), Math.round(e.getBoundingClientRect().height)] as const)
          .filter(([, h]) => h < 44),
      );
      expect(small).toEqual([]);
    });
  }
});
