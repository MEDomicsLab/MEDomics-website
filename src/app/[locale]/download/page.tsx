import type { Metadata } from 'next';
import { getDict } from '@/lib/i18n';
import { pageMeta } from '@/lib/site';
import { appReleases, serverRelease, clientRelease, mb } from '@/lib/releases';
import { links } from '@/content/links';
import { Section, SplitHeader, Lines } from '@/components/layout/Section';
import { DownloadCells, InstallTabs } from '@/components/sections/download/Downloads';
import { Button, TertiaryLink } from '@/components/ui/Button';
import { PixelIcon } from '@/components/illustrations/pixel/PixelIcon';
import { HospitalNet } from '@/components/illustrations/iso/Iso';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, 'download', getDict(locale).download.meta);
}

export default async function DownloadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getDict(locale);
  const t = d.download;
  const pkgs = [
    { label: t.remote.server, rel: serverRelease },
    { label: t.remote.client, rel: clientRelease },
  ].filter((p) => p.rel);

  return (
    <>
      <Section>
        <SplitHeader as="h1" title={<Lines lines={t.title} />} intro={t.intro} />
        <div className="container-x mt-12">
          <DownloadCells dict={d} locale={locale} releases={appReleases} />
          <div className="mt-6 flex justify-end">
            <TertiaryLink href={links.releases} locale={locale}>
              {t.allReleases}
            </TertiaryLink>
          </div>
        </div>
      </Section>

      <Section label={t.reqTitle}>
        <SplitHeader title={t.reqTitle} />
        <div
          className="container-x mt-10 overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label={`${t.reqTitle}: ${t.reqHead[1]} / ${t.reqHead[2]}`}
        >
          <table className="w-full min-w-[35rem] border border-fg text-left text-[0.9375rem]">
            <thead>
              <tr className="border-b border-fg">
                {t.reqHead.map((h, i) => (
                  <th key={i} scope="col" className="px-5 py-3 font-pixel text-[0.8125rem] font-normal uppercase tracking-wider">
                    {h || <span className="sr-only">{t.reqComponent}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.req.map((row) => (
                <tr key={row[0]} className="border-b border-dotted border-fg last:border-b-0">
                  <th scope="row" className="px-5 py-4 font-normal">
                    {row[0]}
                  </th>
                  <td className="px-5 py-4">{row[1]}</td>
                  <td className="px-5 py-4">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section label={t.stepsTitle}>
        <SplitHeader title={t.stepsTitle} />
        <div className="container-x mt-10">
          <InstallTabs dict={d} />
        </div>
      </Section>

      <Section tone="blue" id="remote" label={t.remote.title}>
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-h2">{t.remote.title}</h2>
              <span className="border border-fg px-2 py-1 font-pixel text-[0.75rem] uppercase">{t.remote.badge}</span>
            </div>
            <p className="mt-5">{t.remote.text}</p>
            <ul className="mt-8 flex flex-col gap-3">
              {pkgs.map((p) => (
                <li key={p.label} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-dotted border-fg pb-3">
                  <span className="text-h4">{p.label}</span>
                  <span className="font-pixel text-[0.8125rem] text-muted">{p.rel!.tag}</span>
                  <span className="ml-auto flex flex-wrap gap-3">
                    {p.rel!.assets.map((a) => (
                      <a key={a.name} href={a.url} className="group text-[0.8125rem]" download>
                        <span className="lines">{a.os === 'mac' ? 'macOS' : a.os === 'linux' ? 'Linux' : 'Windows'}</span>{' '}
                        <span className="text-muted">({mb(a.size)})</span>
                      </a>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button href={links.remoteConnect} locale={locale} variant="secondary" icon={<PixelIcon name="book" size={12} />}>
                {t.remote.guide}
              </Button>
            </div>
          </div>
          <div className="off-blue reveal mx-auto w-full max-w-[40rem] text-fg">
            <HospitalNet className="h-auto w-full" />
          </div>
        </div>
      </Section>
    </>
  );
}
