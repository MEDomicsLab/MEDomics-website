import type { Metadata } from 'next';
import { getDict } from '@/lib/i18n';
import { pageMeta } from '@/lib/site';
import { Section, SplitHeader, Lines } from '@/components/layout/Section';
import { TertiaryLink, Button } from '@/components/ui/Button';
import { Shot, WindowFrame } from '@/components/ui/Shot';
import { PlateArt, type Face } from '@/components/illustrations/iso/Iso';
import { PixelIcon } from '@/components/illustrations/pixel/PixelIcon';

const SHOTS = {
  'data-table': { name: 'data-table', title: 'Input module' },
  exploratory: { name: 'exploratory', title: 'Exploratory module' },
  canvas: { name: 'canvas', title: 'Learning module · scene.medml' },
  results: { name: 'results-analysis', title: 'Analysis panel' },
  notebook: { name: 'notebook', title: 'Workspace · notebooks' },
} as const;
const FALLBACK: Record<string, Face> = { deployment: 'form', collaborate: 'network' };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = getDict(locale).platform.meta;
  return pageMeta(locale, 'platform', m);
}

export default async function PlatformPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getDict(locale);
  const p = d.platform;

  return (
    <>
      <Section>
        <SplitHeader as="h1" title={<Lines lines={p.title} />} intro={p.intro} />
        <div className="container-x mt-12">
          <WindowFrame shadow rounded className="reveal" title="MEDomics">
            <Shot name="home" sizes="(min-width: 1344px) 1248px, 100vw" priority />
          </WindowFrame>
        </div>
      </Section>

      {p.layers.map((layer, li) => {
        const blue = li % 2 === 0;
        return (
          <Section key={layer.id} id={layer.id} tone={blue ? 'blue' : 'ivory'} label={layer.title}>
            <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="font-pixel text-[0.8125rem] uppercase tracking-wider text-muted">
                  0{li + 1} · {layer.tag}
                </p>
                <h2 className="mt-4 text-h2">{layer.title}</h2>
                <p className="mt-5">{layer.text}</p>
                <ul className="mt-8 border-t border-fg">
                  {layer.modules.map((m) => (
                    <li
                      key={m.name}
                      className="reveal grid gap-2 border-b border-dotted border-fg py-5 sm:grid-cols-[11.25rem_1fr] sm:gap-6"
                    >
                      <h3 className="text-h4 sm:text-[1.0625rem] sm:leading-6">{m.name}</h3>
                      <p className="text-[0.9375rem] leading-6">{m.text}</p>
                    </li>
                  ))}
                </ul>
                <TertiaryLink href={layer.doc} locale={locale} className="mt-6">
                  {d.common.readGuide}
                </TertiaryLink>
              </div>
              <div className="flex flex-col gap-6">
                {layer.shots.length > 0 ? (
                  layer.shots.map((s) => {
                    const shot = SHOTS[s as keyof typeof SHOTS];
                    return (
                      <WindowFrame key={s} title={shot.title} rounded={false} className="reveal">
                        <Shot name={shot.name} sizes="(min-width: 1024px) 600px, 100vw" />
                      </WindowFrame>
                    );
                  })
                ) : (
                  <div className="off-blue reveal flex items-center justify-center border border-fg bg-bg p-10 text-fg">
                    <PlateArt face={FALLBACK[layer.id] ?? 'form'} className="h-auto w-full max-w-[34rem]" />
                  </div>
                )}
              </div>
            </div>
          </Section>
        );
      })}

      <Section label={p.guardrails.title}>
        <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <PixelIcon name="shield" size={36} />
            <h2 className="mt-6 text-h2">{p.guardrails.title}</h2>
            <p className="mt-5">{p.guardrails.text}</p>
          </div>
          <WindowFrame title="Training box" rounded={false} className="reveal mx-auto w-full max-w-[40rem]">
            <Shot name="guardrail" sizes="460px" />
          </WindowFrame>
        </div>
      </Section>

      <Section label={p.filesTitle}>
        <SplitHeader title={p.filesTitle} intro={p.filesIntro} />
        <div className="container-x mt-12">
          <dl className="grid gap-px border border-fg bg-fg sm:grid-cols-2 lg:grid-cols-3">
            {p.files.map((f) => (
              <div key={f.ext} className="reveal bg-bg p-6">
                <dt className="font-pixel text-[clamp(1.625rem,2.4vw,2.125rem)] leading-none">{f.ext}</dt>
                <dd className="mt-4 text-[0.9375rem] leading-6">{f.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section tone="blue" label={p.toolsTitle}>
        <SplitHeader title={p.toolsTitle} />
        <div className="container-x mt-12">
          <ul className="grid gap-px border border-fg bg-fg sm:grid-cols-2 lg:grid-cols-4">
            {p.tools.map((t) => (
              <li key={t.name} className="reveal bg-bg p-6">
                <h3 className="text-h4">{t.name}</h3>
                <p className="mt-3 text-[0.9375rem] leading-6">{t.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 border border-dashed border-guide p-4 text-[0.8125rem] text-muted">{p.comingBack}</p>
          <div className="mt-10">
            <Button href="download" locale={locale} icon={<PixelIcon name="download" size={12} />}>
              {d.nav.download}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
