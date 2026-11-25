import type { Metadata } from 'next';
import { getDict } from '@/lib/i18n';
import { pageMeta } from '@/lib/site';
import { LegalPage } from '@/components/sections/LegalPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, 'terms', getDict(locale).legal.terms.meta);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = getDict(locale).legal;
  return <LegalPage title={l.terms.title} body={l.terms.body} note={l.draftNote} />;
}
