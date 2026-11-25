import { expect, test } from '@playwright/test';
import { ROUTES, SITE_URL, releases } from './helpers';

/** Reads the metadata of the server HTML, exactly as a crawler receives it (no JavaScript). */
async function metadata(request: import('@playwright/test').APIRequestContext, path: string) {
  const response = await request.get(path);
  expect(response.status(), path).toBe(200);
  const html = await response.text();
  const all = (re: RegExp) => [...html.matchAll(re)].map((m) => m[1]);
  return {
    html,
    titles: all(/<title>([^<]*)<\/title>/g),
    descriptions: all(/<meta name="description" content="([^"]*)"/g),
    canonicals: all(/<link rel="canonical" href="([^"]*)"/g),
    alternates: [...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]),
    ogImage: html.match(/<meta property="og:image" content="([^"]*)"/)?.[1],
    jsonLd: all(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map((s) => JSON.parse(s)),
    h1: all(/<h1[^>]*>([\s\S]*?)<\/h1>/g),
  };
}

test('every page ships unique metadata, a canonical URL and hreflang alternates', async ({ request }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const path of ROUTES) {
    const m = await metadata(request, path);
    expect(m.titles, path).toHaveLength(1);
    expect(m.titles[0], path).toMatch(/MEDomics/);
    expect(titles.has(m.titles[0]), `duplicate title on ${path}`).toBe(false);
    titles.add(m.titles[0]);

    expect(m.descriptions, path).toHaveLength(1);
    expect(m.descriptions[0].length, path).toBeGreaterThan(50);
    expect(descriptions.has(m.descriptions[0]), `duplicate description on ${path}`).toBe(false);
    descriptions.add(m.descriptions[0]);

    expect(m.canonicals, path).toEqual([`${SITE_URL}${path}`]);
    expect(m.alternates, path).toEqual(
      expect.arrayContaining([
        ['en', `${SITE_URL}${path}`],
        ['x-default', `${SITE_URL}${path}`],
      ]),
    );
    expect(m.h1, `${path} needs exactly one h1`).toHaveLength(1);
    expect(m.ogImage, path).toBeTruthy();
    const image = await request.head(new URL(m.ogImage!).pathname);
    expect(image.status(), m.ogImage).toBe(200);
  }
});

test('the home page describes the software with JSON-LD that matches the latest release', async ({ request }) => {
  const { latest } = releases();
  const m = await metadata(request, '/en/');
  const app = m.jsonLd.find((d) => d['@type'] === 'SoftwareApplication');
  expect(app).toBeTruthy();
  expect(app.softwareVersion).toBe(latest.tag.replace(/^v/, ''));
  expect(app.url).toBe(`${SITE_URL}/en/`);
  expect(app.downloadUrl.length).toBeGreaterThan(0);
  for (const url of app.downloadUrl) expect(latest.assets.map((a) => a.url)).toContain(url);
});

test('sitemap.xml lists exactly the indexable pages, and robots.txt points to it', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  expect(urls).toEqual(ROUTES.map((p) => `${SITE_URL}${p}`).sort());
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  expect(robots).not.toMatch(/Disallow: \/\s*$/m);
});

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });
  for (const path of ROUTES) {
    test(`${path} content is readable`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('main h1').first()).toBeVisible();
      const text = await page.locator('main').innerText();
      expect(text.length, path).toBeGreaterThan(300);
    });
  }
});
