import type { Metadata } from 'next';
import { getDict } from '@/lib/i18n';
import { pageMeta } from '@/lib/site';
import { links } from '@/content/links';
import { Section, SplitHeader, Lines } from '@/components/layout/Section';
import { Button, TertiaryLink } from '@/components/ui/Button';
import { Shot } from '@/components/ui/Shot';
import { GitHubMark } from '@/components/illustrations/GitHubMark';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, 'about', getDict(locale).about.meta);
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getDict(locale);
  const a = d.about;
  return (
    <>
      <Section>
        <SplitHeader as="h1" title={<Lines lines={a.title} />} intro={a.intro} />
      </Section>

      <Section label={a.historyTitle}>
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="grid grid-cols-2 gap-px border border-fg bg-fg">
            <div className="bg-bg p-6">
              <Shot name="lab-logo" sizes="300px" className="mx-auto max-w-[16rem]" />
              <p className="mt-3 text-center font-pixel text-[0.8125rem] text-muted">2024 · MEDomicsLab</p>
            </div>
            <div className="bg-bg p-6">
              <Shot name="logo" sizes="300px" className="mx-auto max-w-[16rem]" />
              <p className="mt-3 text-center font-pixel text-[0.8125rem] text-muted">Today · MEDomics</p>
            </div>
          </div>
          <div>
            <h2 className="text-h2">{a.historyTitle}</h2>
            <p className="mt-5">{a.history}</p>
            <h2 className="mt-12 text-h3">{a.labTitle}</h2>
            <p className="mt-4">{a.labText}</p>
            <div className="mt-6">
              <Button href={links.lab} locale={locale} variant="secondary">
                {a.labCta} ↗
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="blue" label={a.leadsTitle}>
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-16">
          {[
            { title: a.leadsTitle, list: a.leads },
            { title: a.supportTitle, list: a.support },
          ].map((g) => (
            <div key={g.title}>
              <h2 className="text-h2">{g.title}</h2>
              <ul className="mt-8 border-t border-fg">
                {g.list.map((p) => (
                  <li
                    key={p.name}
                    className="reveal flex flex-wrap items-baseline justify-between gap-2 border-b border-dotted border-fg py-5"
                  >
                    <span className="text-h4">{p.name}</span>
                    <span className="font-pixel text-[0.8125rem] text-muted">{p.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section label={a.toolsTitle}>
        <SplitHeader title={a.toolsTitle} intro={a.toolsIntro} />
        <div className="container-x mt-10">
          <ul className="flex flex-wrap gap-2">
            {a.tools.map((t) => (
              <li key={t} className="border border-fg px-3 py-2 font-pixel text-[0.8125rem]">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button href={links.collaboration} locale={locale} icon={<GitHubMark size={13} />}>
              {a.contribute}
            </Button>
          </div>
        </div>
      </Section>

      <Section id="design-credit" label={a.designTitle}>
        <SplitHeader title={a.designTitle} intro={a.designIntro} />
        <div className="container-x mt-10">
          <dl className="grid gap-px border border-fg bg-fg lg:grid-cols-3">
            {a.design.map((item) => (
              <div key={item.title} className="bg-bg p-6 lg:p-8">
                <dt className="text-h4">{item.title}</dt>
                <dd className="mt-3 text-body">{item.text}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <TertiaryLink href={links.designSource} locale={locale}>
              {a.designLink}
            </TertiaryLink>
          </div>
        </div>
      </Section>
    </>
  );
}
