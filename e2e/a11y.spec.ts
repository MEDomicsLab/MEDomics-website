import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ROUTES, settle } from './helpers';

/**
 * axe-core on every page, on desktop and on a phone, with reduced motion so content is in its
 * final state. Fails on serious and critical violations, colour contrast included.
 */
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
];

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' });
    for (const path of [...ROUTES, '/en/this-page-does-not-exist/']) {
      test(`a11y: ${path} has no serious or critical axe violations`, async ({ page }) => {
        await page.goto(path, { waitUntil: 'networkidle' });
        await settle(page);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        expect(
          blocking,
          blocking.map((v) => `${v.impact} ${v.id}: ${v.help}\n${v.nodes.map((n) => `    ${n.target.join(' ')}`).join('\n')}`).join('\n'),
        ).toEqual([]);
      });
    }
  });
}
