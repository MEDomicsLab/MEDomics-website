// Helpers for scripts/check/links.mjs, kept free of I/O so they can be unit-tested.
import { join } from 'node:path';

/** Every href / src / srcset URL in an HTML document (srcset candidates are split). */
export function extractRefs(html) {
  const refs = [];
  for (const m of html.matchAll(/\s(href|src)="([^"]*)"/g)) refs.push(m[2]);
  for (const m of html.matchAll(/\ssrcset="([^"]*)"/gi)) {
    for (const part of m[1].split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (url) refs.push(url);
    }
  }
  return refs.map((r) => r.replaceAll('&amp;', '&'));
}

/** Every id="…" in an HTML document, for #fragment checks. */
export function extractIds(html) {
  return new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
}

/**
 * Splits an internal reference into the file it should resolve to inside `outDir`
 * and its fragment. Returns null for external, mailto:, tel:, data: and javascript: URLs.
 * `fromPath` is the URL path of the page the reference appears on (for relative links).
 */
export function resolveInternal(ref, fromPath, outDir) {
  if (!ref || /^(https?:)?\/\//i.test(ref) || /^(mailto|tel|data|javascript):/i.test(ref)) return null;
  const url = new URL(ref, `http://site${fromPath}`);
  let path = decodeURIComponent(url.pathname);
  const fragment = url.hash ? decodeURIComponent(url.hash.slice(1)) : '';
  // trailingSlash: true → /en/about/ is served from /en/about/index.html
  if (path.endsWith('/')) path += 'index.html';
  return { file: join(outDir, ...path.split('/').filter(Boolean)), path: url.pathname, fragment };
}
