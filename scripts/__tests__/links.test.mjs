import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { extractIds, extractRefs, resolveInternal } from '../lib/links.mjs';

const OUT = join('/', 'site', 'out');

test('extractRefs reads href, src and every srcset candidate', () => {
  const html =
    '<a href="/en/about/">x</a><img src="/a.png" srcset="/a-1.avif 1x, /a-2.avif 2x"><source srcSet="/b.webp 960w,/c.webp 1920w">';
  assert.deepEqual(extractRefs(html), ['/en/about/', '/a.png', '/a-1.avif', '/a-2.avif', '/b.webp', '/c.webp']);
});

test('extractRefs decodes HTML-escaped ampersands', () => {
  assert.deepEqual(extractRefs('<a href="/x?a=1&amp;b=2">'), ['/x?a=1&b=2']);
});

test('extractIds collects element ids for fragment checks', () => {
  assert.deepEqual([...extractIds('<section id="faq"><h2 id="a-b">')], ['faq', 'a-b']);
});

test('resolveInternal ignores external and non-http links', () => {
  for (const ref of ['https://github.com', '//cdn.example', 'mailto:a@b.c', 'tel:+1', 'data:image/png;base64,x', 'javascript:void(0)']) {
    assert.equal(resolveInternal(ref, '/en/', OUT), null, ref);
  }
});

test('resolveInternal maps trailing-slash routes to index.html', () => {
  assert.deepEqual(resolveInternal('/en/about/#team', '/en/', OUT), {
    file: join(OUT, 'en', 'about', 'index.html'),
    path: '/en/about/',
    fragment: 'team',
  });
});

test('resolveInternal resolves relative links and plain files', () => {
  assert.equal(resolveInternal('../download/', '/en/about/', OUT).file, join(OUT, 'en', 'download', 'index.html'));
  assert.equal(resolveInternal('/images/home-960.avif', '/en/', OUT).file, join(OUT, 'images', 'home-960.avif'));
});

test('resolveInternal keeps same-page fragments on the current page', () => {
  const r = resolveInternal('#get-started', '/en/', OUT);
  assert.equal(r.file, join(OUT, 'en', 'index.html'));
  assert.equal(r.fragment, 'get-started');
});
