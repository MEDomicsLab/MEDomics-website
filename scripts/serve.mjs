#!/usr/bin/env node
/**
 * Serves the static export (out/) the way Vercel does with vercel.json:
 * its redirects, `trailingSlash: true` (/en/about → /en/about/), index.html for folders,
 * and out/404.html with a 404 status for anything else.
 * Used by `npm run serve` and by Playwright (playwright.config.ts → webServer).
 *
 * Usage: node scripts/serve.mjs [--port=4173]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../out', import.meta.url));
const VERCEL = JSON.parse(await readFile(fileURLToPath(new URL('../vercel.json', import.meta.url)), 'utf8'));
const PORT = Number((process.argv.find((a) => a.startsWith('--port=')) || '--port=4173').split('=')[1]);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const isFile = async (p) => (await stat(p).catch(() => null))?.isFile() ?? false;

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let path;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  const redirect = VERCEL.redirects?.find((r) => r.source === path);
  if (redirect) {
    res.writeHead(redirect.permanent ? 308 : 307, { location: redirect.destination + url.search }).end();
    return;
  }
  const file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT + sep) && file !== ROOT) {
    res.writeHead(403).end();
    return;
  }
  // trailingSlash: true → a folder path without its slash is redirected, as on Vercel
  if (VERCEL.trailingSlash && !path.endsWith('/') && !extname(path) && (await isFile(join(file, 'index.html')))) {
    res.writeHead(308, { location: `${path}/${url.search}` }).end();
    return;
  }
  const target = path.endsWith('/') ? join(file, 'index.html') : file;
  if (await isFile(target)) {
    res.writeHead(200, { 'content-type': TYPES[extname(target)] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : await readFile(target));
    return;
  }
  res.writeHead(404, { 'content-type': TYPES['.html'] });
  res.end(await readFile(join(ROOT, '404.html')));
});

server.listen(PORT, () => console.log(`[serve] out/ on http://localhost:${PORT}/`));
