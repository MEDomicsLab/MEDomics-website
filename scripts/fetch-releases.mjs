// Build-time: read public GitHub releases into src/content/releases.json.
// If the network is unavailable, the committed copy is kept, so builds stay offline-safe.
// Set GITHUB_TOKEN to avoid the anonymous API rate limit (CI does this).
import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { normalise } from './lib/releases.mjs';

const OUT = fileURLToPath(new URL('../src/content/releases.json', import.meta.url));
const API = 'https://api.github.com/repos/MEDomicsLab/MEDomics/releases?per_page=100';

try {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'medomics-site-build' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(API, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const releases = normalise(await res.json());
  // leave the file untouched when nothing changed, so local builds keep the working tree clean
  const previous = await readFile(OUT, 'utf8')
    .then(JSON.parse)
    .catch(() => null);
  if (previous && JSON.stringify(previous.releases) === JSON.stringify(releases)) {
    console.log(`[releases] ${releases.length} releases, unchanged`);
  } else {
    await writeFile(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), releases }, null, 2) + '\n');
    console.log(`[releases] ${releases.length} releases written`);
  }
} catch (err) {
  try {
    await readFile(OUT);
    console.warn(`[releases] fetch failed (${err.message}); keeping committed copy`);
  } catch {
    await writeFile(OUT, JSON.stringify({ fetchedAt: null, releases: [] }, null, 2) + '\n');
    console.warn(`[releases] fetch failed (${err.message}); wrote empty fallback`);
  }
}
