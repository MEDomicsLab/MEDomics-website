import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

const PAGES = ['', 'platform', 'download', 'about', 'privacy', 'terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((l) =>
    PAGES.map((p) => ({
      url: `${SITE_URL}/${l}/${p ? p + '/' : ''}`,
      changeFrequency: p === 'download' ? 'weekly' : 'monthly',
      priority: p === '' ? 1 : p === 'download' ? 0.9 : 0.6,
    })),
  );
}
