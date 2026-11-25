#!/usr/bin/env node
/**
 * Internal link check over the static export (run after `npm run build`).
 *
 * For every HTML page in out/, each internal href / src / srcset must resolve to a file in out/,
 * and each #fragment must match an id on the target page. Every URL in sitemap.xml must also
 * resolve to a page. External links are not fetched (they would make CI depend on third parties).
 *
 * Exits 1 and lists every broken reference.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractIds, extractRefs, resolveInternal } from '../lib/links.mjs';

const OUT = fileURLToPath(new URL('../../out', import.meta.url));
if (!existsSync(OUT)) {
  console.error('[links] out/ is missing: run `npm run build` first.');
  process.exit(1);
}

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== '_next') yield* htmlFiles(p);
    } else if (name.endsWith('.html')) yield p;
  }
}

/** URL path a file is served at: out/en/about/index.html → /en/about/ */
const urlPathOf = (file) =>
  '/' +
  relative(OUT, file)
    .split(sep)
    .join('/')
    .replace(/index\.html$/, '');

const idsCache = new Map();
const idsOf = (file) => {
  if (!idsCache.has(file)) idsCache.set(file, extractIds(readFileSync(file, 'utf8')));
  return idsCache.get(file);
};

const broken = [];
let checked = 0;
for (const file of htmlFiles(OUT)) {
  const from = urlPathOf(file);
  const html = readFileSync(file, 'utf8');
  for (const ref of new Set(extractRefs(html))) {
    const target = resolveInternal(ref, from, OUT);
    if (!target) continue;
    checked++;
    if (!existsSync(target.file) || statSync(target.file).isDirectory()) {
      broken.push(`${from} → ${ref} (no file)`);
    } else if (target.fragment && target.file.endsWith('.html') && !idsOf(target.file).has(target.fragment)) {
      broken.push(`${from} → ${ref} (no element with id "${target.fragment}")`);
    }
  }
}

// Every sitemap URL must be a page of this build
const sitemap = join(OUT, 'sitemap.xml');
if (existsSync(sitemap)) {
  for (const [, loc] of readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const target = resolveInternal(new URL(loc).pathname, '/', OUT);
    checked++;
    if (!existsSync(target.file)) broken.push(`sitemap.xml → ${loc} (no page)`);
  }
} else broken.push('sitemap.xml is missing');

if (broken.length) {
  console.error(`[links] ${broken.length} broken internal reference(s):\n  ${broken.join('\n  ')}`);
  process.exit(1);
}
console.log(`[links] ${checked} internal references checked, none broken`);
