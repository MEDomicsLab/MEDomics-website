// Visual review: serves out/ and captures scroll-step screenshots (desktop 1440×900, mobile 390×844),
// the same method used to analyse the design reference.
// Usage: node scripts/capture.mjs [route=/en/] [outDir=captures] [--reduced] [--steps=N]
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = fileURLToPath(new URL('../out', import.meta.url));
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));
const route = args[0] || '/en/';
const outDir = args[1] || fileURLToPath(new URL('../captures', import.meta.url));
const reduced = flags.includes('--reduced');
const maxSteps = Number((flags.find((f) => f.startsWith('--steps=')) || '--steps=80').split('=')[1]);
// Playwright's own Chromium (npm run test:e2e:install); CHROME_PATH overrides it
const EXE = process.env.CHROME_PATH || undefined;
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(ROOT, p);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'content-type': 'text/html' });
    res.end(await readFile(join(ROOT, '404.html')));
  }
});
await new Promise((r) => server.listen(4179, r));
const base = 'http://localhost:4179';
const p2 = (n) => String(n).padStart(2, '0');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: EXE });
const errors = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`[desktop ${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[desktop pageerror] ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`[desktop ${r.status()}] ${r.url()}`);
  });
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${outDir}/d-00a-preloader.png` });
  await page.waitForTimeout(3600);
  await page.screenshot({ path: `${outDir}/d-00b-hero.png` });
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = 0; y < H + 900 && i < maxSteps; y += 450) {
    await page.mouse.move(720, 600);
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(650);
    await page.screenshot({ path: `${outDir}/d-s-${p2(i++)}.png` });
  }
  await ctx.close();

  const m = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  const mp = await m.newPage();
  mp.on('pageerror', (e) => errors.push(`[mobile pageerror] ${e.message}`));
  await mp.goto(base + route, { waitUntil: 'networkidle' });
  await mp.waitForTimeout(4200);
  const mH = await mp.evaluate(() => document.documentElement.scrollHeight);
  let mi = 0;
  for (let y = 0; y < mH && mi < maxSteps; y += 760) {
    await mp.evaluate((yy) => window.scrollTo(0, yy), y);
    await mp.waitForTimeout(500);
    await mp.screenshot({ path: `${outDir}/m-s-${p2(mi++)}.png` });
  }
  await m.close();
  console.log(JSON.stringify({ route, desktopHeight: H, mobileHeight: mH, desktopShots: i, mobileShots: mi }));
} finally {
  await browser.close();
  server.close();
  if (errors.length) console.log('CONSOLE:\n' + [...new Set(errors)].join('\n'));
}
