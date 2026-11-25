// Turns the GitHub Releases API payload into the shape stored in src/content/releases.json.
// Kept free of I/O so it can be unit-tested (scripts/__tests__/releases.test.mjs).

/** Operating system of a release asset, from its file name. */
export function osOf(name) {
  const n = name.toLowerCase();
  // Order matters: "darwin" contains "win", so macOS is tested first.
  if (n.endsWith('.dmg') || n.endsWith('.pkg') || /mac|darwin/.test(n)) return 'mac';
  if (n.endsWith('.deb') || /linux|ubuntu/.test(n)) return 'linux';
  if (n.endsWith('.exe') || /win32|win64|-win\./.test(n)) return 'windows';
  return 'other';
}

/** Release channel, from the tag: `client-…` and `server-…` are the Remote MEDomics builds. */
export function channelOf(tag) {
  if (tag.startsWith('client-')) return 'client';
  if (tag.startsWith('server-')) return 'server';
  return 'app';
}

/** Checksums, update manifests and block maps are not downloads a visitor needs. */
export const SKIPPED_ASSET = /\.(blockmap|yml|yaml|sha\d*|txt)$/i;

export function normalise(raw) {
  return raw
    .filter((r) => !r.draft)
    .map((r) => ({
      tag: r.tag_name,
      name: r.name || r.tag_name,
      date: r.published_at,
      prerelease: r.prerelease,
      url: r.html_url,
      channel: channelOf(r.tag_name),
      assets: r.assets
        .filter((a) => !SKIPPED_ASSET.test(a.name))
        .map((a) => ({ name: a.name, url: a.browser_download_url, size: a.size, os: osOf(a.name) })),
    }));
}
