import { test } from 'node:test';
import assert from 'node:assert/strict';
import { channelOf, normalise, osOf } from '../lib/releases.mjs';

test('osOf recognises every installer format MEDomics ships', () => {
  assert.equal(osOf('MEDomics-1.8.1-win.exe'), 'windows');
  assert.equal(osOf('MEDomics-1.8.1-mac.dmg'), 'mac');
  assert.equal(osOf('MEDomics-1.8.1-mac.pkg'), 'mac');
  assert.equal(osOf('MEDomics-1.8.1-mac.zip'), 'mac');
  assert.equal(osOf('MEDomics-1.8.1-ubuntu.deb'), 'linux');
  assert.equal(osOf('MEDomicsLab-PythonEnv-linux.zip'), 'linux');
  assert.equal(osOf('MEDomicsLab-Server-1.8.0-win32.zip'), 'windows');
  assert.equal(osOf('notes.pdf'), 'other');
});

test('osOf does not mistake "darwin" for Windows', () => {
  assert.equal(osOf('MEDomicsLab-Server-1.8.0-darwin.zip'), 'mac');
});

test('channelOf separates the Remote MEDomics client and server builds', () => {
  assert.equal(channelOf('v1.8.1'), 'app');
  assert.equal(channelOf('client-v1.8.0'), 'client');
  assert.equal(channelOf('server-v1.8.0'), 'server');
});

test('normalise drops drafts and non-download assets, and keeps the API order', () => {
  const asset = (name) => ({ name, browser_download_url: `https://github.com/MEDomicsLab/MEDomics/releases/download/v1/${name}`, size: 1 });
  const out = normalise([
    { tag_name: 'v2', name: '', draft: true, prerelease: false, published_at: 'x', html_url: 'u', assets: [] },
    {
      tag_name: 'v1',
      name: 'MEDomics v1',
      draft: false,
      prerelease: false,
      published_at: '2026-01-01T00:00:00Z',
      html_url: 'https://github.com/MEDomicsLab/MEDomics/releases/tag/v1',
      assets: [asset('a-win.exe'), asset('a-win.exe.blockmap'), asset('latest.yml'), asset('a-mac.dmg')],
    },
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].tag, 'v1');
  assert.equal(out[0].channel, 'app');
  assert.deepEqual(
    out[0].assets.map((a) => [a.name, a.os]),
    [
      ['a-win.exe', 'windows'],
      ['a-mac.dmg', 'mac'],
    ],
  );
});

test('normalise falls back to the tag when a release has no name', () => {
  const [r] = normalise([{ tag_name: 'v3', name: null, draft: false, prerelease: true, published_at: 'd', html_url: 'u', assets: [] }]);
  assert.equal(r.name, 'v3');
  assert.equal(r.prerelease, true);
});
