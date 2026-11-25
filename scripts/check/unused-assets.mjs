#!/usr/bin/env node
/**
 * Flags files under public/ that nothing references, and screenshots in the image manifest
 * (src/content/images.json) that no page uses.
 *
 * - A public file is "used" when its URL path (/images/home-960.avif) appears in src/ or in
 *   the manifest. Files that browsers or crawlers request by convention are always kept.
 * - A manifest entry is "used" when its key appears as a string in src/ (e.g. <Shot name="home">
 *   or { name: 'home' }).
 *
 * Exits 1 if anything is unused. Add intentional exceptions to ALLOW below, with a reason.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const PUBLIC = join(ROOT, 'public');
const SRC = join(ROOT, 'src');
const MANIFEST = join(SRC, 'content', 'images.json');

/** Requested by browsers or crawlers without a reference in the code. */
const ALLOW = new Set(['/favicon.ico', '/robots.txt']);

function* files(dir, test = () => true) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p, test);
    else if (test(p)) yield p;
  }
}

const manifestText = readFileSync(MANIFEST, 'utf8');
const manifest = JSON.parse(manifestText);
const sources = [...files(SRC, (p) => /\.(tsx?|css|json)$/.test(p) && p !== MANIFEST)].map((p) => readFileSync(p, 'utf8')).join('\n');

const unused = [];
for (const file of files(PUBLIC)) {
  const url = '/' + relative(PUBLIC, file).split(sep).join('/');
  if (ALLOW.has(url) || sources.includes(url) || manifestText.includes(`"${url}"`)) continue;
  unused.push(`public${url}`);
}
for (const key of Object.keys(manifest)) {
  if (!sources.includes(`'${key}'`) && !sources.includes(`"${key}"`)) unused.push(`images.json → "${key}" (no page uses it)`);
}

if (unused.length) {
  console.error(`[assets] ${unused.length} unused asset(s):\n  ${unused.join('\n  ')}`);
  console.error('Delete them, or add an intentional exception to ALLOW in scripts/check/unused-assets.mjs.');
  process.exit(1);
}
console.log('[assets] every public file and manifest image is referenced');
