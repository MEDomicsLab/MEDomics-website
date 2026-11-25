// Renders public/og/og-default.png (1200×630) with the real site fonts via headless Chromium.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

// fonts are inlined: a setContent() page cannot fetch file:// URLs
const font = (f) =>
  `data:font/woff2;base64,${readFileSync(fileURLToPath(new URL(`../src/fonts/${f}`, import.meta.url))).toString('base64')}`;
const OUT = fileURLToPath(new URL('../public/og/', import.meta.url));
mkdirSync(OUT, { recursive: true });
// Playwright's own Chromium (npm run test:e2e:install); CHROME_PATH overrides it
const EXE = process.env.CHROME_PATH || undefined;

let cells = '';
let h = 2;
for (let x = 0; x < 40; x++) {
  h = Math.max(0, Math.min(6, h + Math.round((Math.sin(x * 1.7) + Math.cos(x * 0.9)) * 0.9)));
  const lift = x < 4 ? 6 : h;
  for (let y = 0; y < lift; y++) cells += `<i style="left:${x * 30 + 1}px;bottom:${y * 30 + 1}px"></i>`;
}

const html = `<!doctype html><html><head><style>
@font-face{font-family:H;src:url(${font('GeneralSans-Regular.woff2')})}
@font-face{font-family:B;src:url(${font('Inter-latin.woff2')})}
@font-face{font-family:P;src:url(${font('GeistPixel-Square.woff2')})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#F4F2E8;color:#0755B5;font-family:B;position:relative;overflow:hidden}
.top{position:absolute;inset:0 0 auto 0;height:56px;border-bottom:1px solid rgba(7,85,181,.4);display:flex;align-items:center;padding:0 40px;gap:12px;font-family:H;font-size:24px}
h1{position:absolute;left:40px;top:120px;font-family:H;font-weight:400;font-size:84px;line-height:1.02;letter-spacing:-.01em}
p{position:absolute;right:40px;top:132px;width:330px;font-size:20px;line-height:1.5}
.tag{position:absolute;right:40px;top:300px;font-family:P;font-size:20px;border:1px solid #0755B5;padding:6px 10px}
.board{position:absolute;left:0;right:0;bottom:0;height:200px;background:#0755B5}
.board i{position:absolute;width:28px;height:28px;background:#F4F2E8}
</style></head><body>
<div class="top"><svg width="30" height="28" viewBox="0 0 100 94"><g stroke="#0755B5" stroke-width="4"><line x1="49.2" y1="59.2" x2="46.2" y2="12.8"/><line x1="49.2" y1="59.2" x2="12.5" y2="32.2"/><line x1="49.2" y1="59.2" x2="76.3" y2="35.8"/><line x1="49.2" y1="59.2" x2="13.7" y2="78.3"/><line x1="49.2" y1="59.2" x2="87" y2="81.2"/></g><circle cx="46.2" cy="12.8" r="12.2" fill="#2e9e44"/><circle cx="12.5" cy="32.2" r="9.5" fill="#d0383a"/><circle cx="76.3" cy="35.8" r="7.5" fill="#c9a40a"/><circle cx="13.7" cy="78.3" r="12.5" fill="#1f74d1"/><circle cx="87" cy="81.2" r="8.7" fill="#e0581f"/><circle cx="49.2" cy="59.2" r="9.7" fill="#F4F2E8" stroke="#0755B5" stroke-width="4"/></svg>MEDomics</div>
<h1>Medical data in.<br>Trusted models out.</h1>
<p>Open-source desktop platform for building validated, explainable clinical models.</p>
<span class="tag">GPL-3.0 · Windows · Ubuntu · macOS</span>
<div class="board">${cells}</div>
</body></html>`;

// the full Chromium build (not the headless shell), which can screenshot a setContent() page
const browser = await chromium.launch(EXE ? { executablePath: EXE } : { channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `${OUT}og-default.png` });
await browser.close();
console.log('og image written');
