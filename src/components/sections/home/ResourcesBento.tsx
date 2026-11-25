import type { Dict } from '@/content/types';
import { links } from '@/content/links';
import { Section, SplitHeader, Lines } from '@/components/layout/Section';
import { TertiaryLink } from '@/components/ui/Button';
import { RhombusTile } from '@/components/illustrations/RhombusTile';

const ART = { red: 'play', green: 'table', blue: 'network', orange: 'form', discord: 'network' } as const;

export function ResourcesBento({ dict, locale }: { dict: Dict; locale: string }) {
  const r = dict.resources;
  return (
    <Section id="resources" label={r.title.join(' ')}>
      <SplitHeader title={<Lines lines={r.title} />} intro={r.intro} />
      <div className="container-x mt-12">
        <div className="grid gap-px border border-fg bg-fg lg:grid-cols-2">
          <a href={r.feature.href} target="_blank" rel="noopener noreferrer" className="group reveal flex flex-col bg-bg">
            <RhombusTile tone="blue" face="canvas" className="aspect-[16/9] w-full" />
            <div className="border-t border-fg p-6 lg:p-8">
              <h3 className="text-h3">
                <span className="lines">{r.feature.title}</span>
              </h3>
              <p className="mt-3 text-body">{r.feature.text}</p>
            </div>
            <span className="sr-only"> {dict.common.external}</span>
          </a>
          <div className="grid gap-px bg-fg sm:grid-cols-2">
            {r.cards.map((c) => (
              <a key={c.title} href={c.href} target="_blank" rel="noopener noreferrer" className="group reveal flex flex-col bg-bg">
                <RhombusTile tone={c.tone as keyof typeof ART} face={ART[c.tone as keyof typeof ART]} className="aspect-[16/9] w-full" />
                <div className="flex flex-1 items-start justify-between gap-3 border-t border-fg p-6">
                  <h3 className="text-h4">
                    <span className="lines">{c.title}</span>
                  </h3>
                  <span aria-hidden>↗</span>
                </div>
                <span className="sr-only"> {dict.common.external}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <TertiaryLink href={links.docs} locale={locale}>
            {r.all}
          </TertiaryLink>
        </div>
      </div>
    </Section>
  );
}
