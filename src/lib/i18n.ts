import { en } from '@/content/en';
import type { Dict } from '@/content/types';

/** Release 1 ships English only; adding 'fr' here (with a French dictionary) enables Release 2. */
export const locales = ['en'] as const;
export type Locale = 'en' | 'fr';
export const defaultLocale: Locale = 'en';

const dicts: Partial<Record<Locale, Dict>> = { en };

export function getDict(locale: string): Dict {
  return dicts[locale as Locale] ?? en;
}

export const isExternal = (h: string) => /^(https?:|mailto:)/.test(h);

/** 'platform#design' → '/en/platform/#design'; external URLs pass through. */
export function href(locale: string, path = '') {
  if (isExternal(path)) return path;
  const [p, hash] = path.split('#');
  const clean = p.replace(/^\/+|\/+$/g, '');
  return `/${locale}/${clean ? clean + '/' : ''}${hash ? '#' + hash : ''}`;
}

/** Replace {key} placeholders. */
export function fill(s: string, vars: Record<string, string>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}
