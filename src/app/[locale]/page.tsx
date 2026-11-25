import type { Metadata } from 'next';
import { getDict } from '@/lib/i18n';
import { pageMeta, SITE_URL } from '@/lib/site';
import { latest, version, formatDate, installers } from '@/lib/releases';
import { links } from '@/content/links';
import { Section, SplitHeader, Lines } from '@/components/layout/Section';
import { UpdateToast } from '@/components/layout/UpdateToast';
import { HeroLayers } from '@/components/sections/home/HeroLayers';
import { Workflow } from '@/components/sections/home/Workflow';
import { Proof } from '@/components/sections/home/Proof';
import { ResourcesBento } from '@/components/sections/home/ResourcesBento';
import { OpenSource } from '@/components/sections/home/OpenSource';
import { FaqList } from '@/components/sections/home/Faq';
import { FinalCta } from '@/components/sections/home/FinalCta';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, '', { description: getDict(locale).meta.description });
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getDict(locale);
  const v = version(latest);
  const ins = latest ? installers(latest) : null;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MEDomics',
    description: d.meta.description,
    url: `${SITE_URL}/${locale}/`,
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Machine learning for medical research',
    operatingSystem: 'Windows 10, Windows 11, Ubuntu 22.04, Ubuntu 24.04, macOS',
    softwareVersion: v,
    datePublished: latest?.date,
    downloadUrl: [ins?.windows?.url, ins?.linux?.url, ins?.macPkg?.url].filter(Boolean),
    license: 'https://www.gnu.org/licenses/gpl-3.0.html',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    codeRepository: links.github,
  };

  return (
    <>
      <HeroLayers
        dict={d}
        locale={locale}
        release={{ version: v, date: latest ? formatDate(latest.date, locale) : '', url: latest?.url ?? links.releases }}
      />
      <Workflow dict={d} />
      <Proof dict={d} locale={locale} />
      <ResourcesBento dict={d} locale={locale} />
      <OpenSource dict={d} locale={locale} />
      <Section id="faq" label={d.faq.title.join(' ')}>
        <SplitHeader title={<Lines lines={d.faq.title} />} intro={d.faq.intro} />
        <div className="container-x mt-12">
          <FaqList categories={d.faq.categories} />
        </div>
      </Section>
      <FinalCta dict={d} locale={locale} version={v} />
      {latest && <UpdateToast dict={d} locale={locale} version={v} date={latest.date} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
