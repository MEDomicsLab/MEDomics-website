import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { Release } from '../src/lib/release-utils';

/** Every indexable page of Release 1. Keep in sync with src/app/sitemap.ts (the SEO spec checks it). */
export const ROUTES = ['/en/', '/en/platform/', '/en/download/', '/en/about/', '/en/privacy/', '/en/terms/'];

/** The canonical origin, read from src/lib/site.ts so the tests follow a domain change. */
export const SITE_URL = readFileSync('src/lib/site.ts', 'utf8').match(/SITE_URL = '([^']+)'/)![1];

/** Breakpoints the layout is designed for, phone to wide desktop. */
export const WIDTHS = [320, 390, 768, 1024, 1440, 1905];

/** Same data and rule as src/lib/releases.ts (`latest`). */
export function releases() {
  const all = (JSON.parse(readFileSync('src/content/releases.json', 'utf8')) as { releases: Release[] }).releases;
  const app = all.filter((r) => r.channel === 'app' && r.assets.length > 0);
  return { app, latest: app.find((r) => !r.prerelease) ?? app[0] };
}

/** Collects page errors, console errors and failed same-origin requests while a test runs. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && new URL(r.url()).host === new URL(page.url() || 'http://localhost:4173').host) {
      errors.push(`${r.status()} ${r.url()}`);
    }
  });
  return errors;
}

/** Waits until fonts are loaded, so layout measurements are final. */
export async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Scrolls to an absolute position and waits until the page (and Lenis) has settled there.
 * The scroll is re-issued on every poll: right after a page load, the smooth-scroll setup can
 * reset the position to the top once, which would otherwise undo a single early scroll.
 */
export async function scrollToY(page: Page, y: number) {
  await expect
    .poll(
      async () => {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        return page.evaluate(() => Math.round(window.scrollY));
      },
      { timeout: 5_000 },
    )
    .toBeGreaterThanOrEqual(Math.round(y) - 2);
}

/** Horizontal overflow in px (0 when the page fits its viewport). */
export function overflowX(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}
