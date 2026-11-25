import type { Metadata } from 'next';
import { getDict } from '@/lib/i18n';
import { pageMeta } from '@/lib/site';
import { LegalPage } from '@/components/sections/LegalPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, 'privacy', getDict(locale).legal.privacy.meta);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = getDict(locale).legal;
  return <LegalPage title={l.privacy.title} body={l.privacy.body} note={l.draftNote} />;
}
