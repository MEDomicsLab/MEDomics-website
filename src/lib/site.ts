import type { Metadata } from 'next';
import { getDict } from './i18n';

export const SITE_URL = 'https://medomics.app';

/** Per-page metadata with canonical + hreflang alternates. */
export function pageMeta(locale: string, path: string, m: { title?: string; description: string }): Metadata {
  const d = getDict(locale);
  const p = path ? `${path.replace(/^\/|\/$/g, '')}/` : '';
  const url = `/${locale}/${p}`;
  const title = m.title ? `${m.title} · MEDomics` : d.meta.title;
  return {
    title,
    description: m.description,
    alternates: { canonical: url, languages: { en: `/en/${p}`, 'x-default': `/en/${p}` } },
    openGraph: {
      title,
      description: m.description,
      url,
      siteName: 'MEDomics',
      type: 'website',
      images: [{ url: '/og/og-default.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description: m.description, images: ['/og/og-default.png'] },
  };
}
