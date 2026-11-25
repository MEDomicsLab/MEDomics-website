#!/usr/bin/env node
/**
 * Fails if a production dependency (anything shipped to visitors) has a licence outside the
 * allow-list. Dev tooling is not checked: it never reaches the built site.
 */
import { init } from 'license-checker-rseidelsohn';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

const ALLOWED = ['MIT', 'ISC', 'Apache-2.0', 'BSD', 'BSD-2-Clause', 'BSD-3-Clause', '0BSD', 'CC0-1.0', 'CC-BY-4.0', 'Unlicense', 'MPL-2.0'];

/** Accepted case by case. Use the package name without version; the value is a note for reviewers. */
const ALLOW_PACKAGES = new Map([['gsap', 'GSAP Standard "no charge" License: free for all uses, including commercial websites']]);

/** Optional native binaries that never reach the browser. */
const ALLOW_PREFIXES = new Map([
  ['@img/sharp-', 'libvips binaries pulled in by next for server image optimisation; unused here (images.unoptimized) and never shipped'],
]);

const isAllowed = (license) => {
  if (!license) return false;
  // "(MIT OR Apache-2.0)" passes if any alternative is allowed; "MIT AND X" needs all of them
  const cleaned = String(license).replace(/[()*]/g, '');
  if (/\sAND\s/i.test(cleaned)) return cleaned.split(/\s+AND\s+/i).every((p) => ALLOWED.includes(p.trim()));
  return cleaned.split(/\s+OR\s+/i).some((p) => ALLOWED.includes(p.trim()));
};

init({ start: ROOT, production: true, excludePrivatePackages: true }, (err, packages) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const bad = [];
  for (const [id, info] of Object.entries(packages)) {
    const name = id.slice(0, id.lastIndexOf('@'));
    if (ALLOW_PACKAGES.has(name) || [...ALLOW_PREFIXES.keys()].some((p) => name.startsWith(p))) continue;
    const licenses = Array.isArray(info.licenses) ? info.licenses.join(' OR ') : info.licenses;
    if (!isAllowed(licenses)) bad.push(`${id}: ${licenses ?? 'UNKNOWN'}`);
  }
  if (bad.length) {
    console.error(`[licenses] ${bad.length} production package(s) outside the allow-list:\n  ${bad.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`[licenses] ${Object.keys(packages).length} production packages checked`);
});
