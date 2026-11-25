import type { Dict } from '@/content/types';
import { links } from '@/content/links';
import { Section, SplitHeader, Lines } from '@/components/layout/Section';
import { Button, TertiaryLink } from '@/components/ui/Button';
import { PixelIcon } from '@/components/illustrations/pixel/PixelIcon';
import { PlateArt, HospitalNet } from '@/components/illustrations/iso/Iso';

function IsoGrid() {
  // faint isometric grid behind illustrations
  const lines = [];
  for (let i = -12; i <= 12; i++) {
    lines.push(<line key={`a${i}`} x1={i * 30 - 300} y1={-200} x2={i * 30 + 300} y2={146} />);
    lines.push(<line key={`b${i}`} x1={i * 30 + 300} y1={-200} x2={i * 30 - 300} y2={146} />);
  }
  return (
    <svg
      viewBox="-200 -150 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full text-guide"
      stroke="currentColor"
      strokeWidth={0.5}
      aria-hidden
    >
      {lines}
    </svg>
  );
}

export function Proof({ dict, locale }: { dict: Dict; locale: string }) {
  const p = dict.proof;
  return (
    <Section id="proof" label={p.title.join(' ')}>
      <SplitHeader title={<Lines lines={p.title} />} intro={p.intro} />
      <div className="mt-12 dotted-x w-full text-fg" aria-hidden />

      <div className="container-x">
        {/* Row 1: questionnaire PoC */}
        <div className="grid border-b border-dotted border-fg lg:grid-cols-[33%_1fr]">
          <div className="relative flex min-h-[16.25rem] items-center justify-center overflow-hidden border-dotted border-fg py-10 lg:border-r">
            <IsoGrid />
            <PlateArt face="shap" className="relative h-auto w-[60%] max-w-[22rem]" />
          </div>
          <figure className="reveal relative flex flex-col p-6 lg:p-10">
            <PixelIcon name="quote" size={28} className="absolute right-6 top-6 lg:right-10 lg:top-10" />
            <p className="font-pixel text-[0.8125rem] uppercase tracking-wider text-muted">{p.feature.label}</p>
            <blockquote className="mt-6 text-h4 leading-[1.45]">{p.feature.finding}</blockquote>
            <div className="mt-8 dotted-x w-full" aria-hidden />
            <figcaption className="mt-4 flex items-center justify-between gap-4">
              <span className="font-pixel text-[0.8125rem]">{p.feature.source}</span>
              <TertiaryLink href={links.pocParis} locale={locale}>
                {p.feature.link}
              </TertiaryLink>
            </figcaption>
          </figure>
        </div>

        {/* Row 2: stats, federated PoC, CTA block */}
        <div className="grid lg:grid-cols-[33%_1fr_1fr]">
          <dl className="grid grid-cols-2 border-b border-dotted border-fg lg:block lg:border-r lg:border-b-0">
            {p.stats.map((s, i) => (
              <div
                key={s.label}
                className={`reveal p-6 lg:p-8 ${i === 0 ? 'border-r border-dotted border-fg lg:border-r-0 lg:border-b' : ''}`}
              >
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-pixel text-[clamp(2.5rem,4vw,3.875rem)] leading-none">{s.value}</span>
                  <span className="mt-3 block text-[0.8125rem] text-muted">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
          <figure className="reveal flex flex-col border-b border-dotted border-fg p-6 lg:border-b-0 lg:p-8">
            <div className="text-fg">
              <HospitalNet className="h-[9.375rem] w-full" />
            </div>
            <blockquote className="mt-6 text-body">{p.second.finding}</blockquote>
            <figcaption className="mt-auto flex items-center justify-between gap-4 pt-6">
              <span className="font-pixel text-[0.8125rem]">{p.second.source}</span>
              <TertiaryLink href={links.pocEndToEnd} locale={locale}>
                {p.second.link}
              </TertiaryLink>
            </figcaption>
          </figure>
          <div
            className="on-blue relative -mx-[var(--gutter)] flex flex-col justify-between gap-8 bg-bg p-6 text-fg lg:mx-0 lg:mr-[calc(-1*var(--gutter))] lg:p-8"
            data-tone="blue"
          >
            <p className="text-h3">{p.cta.title}</p>
            <div className="off-blue mx-auto w-[13.75rem] bg-transparent text-fg">
              <PlateArt face="play" className="h-auto w-full" />
            </div>
            <div>
              <Button href={links.youtube} locale={locale} icon={<PixelIcon name="youtube" size={12} />}>
                {p.cta.button}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="dotted-x w-full text-fg" aria-hidden />
    </Section>
  );
}
