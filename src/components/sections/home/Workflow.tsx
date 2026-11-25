import type { CSSProperties } from 'react';
import type { Dict } from '@/content/types';
import { Section, SplitHeader, Lines } from '@/components/layout/Section';
import { ParticleFans } from '@/components/canvas/ParticleFans';
import { StepIcon, type StepIconName } from '@/components/illustrations/iso/Iso';
import { FAN_INPUTS, FAN_GHOSTS, FAN_OUTPUTS } from '@/content/fans';

const ICONS: StepIconName[] = ['prepare', 'explore', 'learn', 'evaluate'];
/** Icons and cards share one grid so each drop line lands on its card: 90% of the content width (the fans use the sides), 12px gaps. */
const STEP_GRID = 'mx-auto grid w-[90%] grid-cols-4 gap-3';

function Chips({ label, items, ghost = [] }: { label: string; items: string[]; ghost?: string[] }) {
  return (
    <div>
      <p className="font-pixel text-[0.8125rem] uppercase tracking-wider text-muted">{label}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((t) => (
          <li key={t} className="border border-fg px-2 py-1 font-pixel text-[0.8125rem]">
            {t}
          </li>
        ))}
        {ghost.map((t) => (
          <li key={t} className="border border-dashed border-guide px-2 py-1 font-pixel text-[0.8125rem] text-muted">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Workflow({ dict }: { dict: Dict }) {
  const w = dict.workflow;
  return (
    <Section id="workflow" label={w.title.join(' ')}>
      <SplitHeader title={<Lines lines={w.title} />} intro={w.intro} />

      {/* Desktop: particle fans converge on the four steps.
          Geometry (rem, so it follows the fluid root; px values are at 1900px wide):
          - fan box 26rem (~455px) with the icon row at its middle (13rem): the fans spread
            ±13rem around the icons, since the canvas fills its box;
          - drop lines start 1.625rem (~29px) under the icon box and stop 0.9rem (~16px) above the cards;
          - cards start 11.5rem (~202px) below the icon centre, overlapping the fan box by 1.5rem. */}
      <div
        className="relative mt-12 hidden h-[26rem] lg:block"
        style={{ '--fan-font': 'var(--font-pixel-face), monospace' } as CSSProperties}
      >
        <ParticleFans className="absolute inset-0 h-full w-full" />
        <div className="container-x absolute inset-x-0 top-[9.5rem]">
          <div className={STEP_GRID}>
            {w.steps.map((s, i) => (
              <div key={s.title} className="flex flex-col items-center">
                <div className="flex size-[7rem] items-center justify-center bg-bg" data-fan-step={i}>
                  <StepIcon name={ICONS[i]} className="h-[6rem] w-[6rem]" />
                </div>
                <span aria-hidden className="dotted-y mt-[1.625rem] h-[5.475rem] bg-repeat-y" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="container-x relative -mt-[1.5rem] hidden lg:block">
        <ol className={STEP_GRID}>
          {w.steps.map((s) => (
            <li key={s.title} className="reveal border border-fg bg-bg p-6">
              <h3 className="text-h3">{s.title}</h3>
              <p className="mt-3 text-body">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Mobile / tablet: inputs → timeline → outputs */}
      <div className="container-x mt-12 lg:hidden">
        <Chips label={w.inputsLabel} items={FAN_INPUTS} ghost={FAN_GHOSTS} />
        <ol className="relative mt-8">
          <span aria-hidden className="dotted-y absolute left-[2.4375rem] top-0 bottom-0" />
          {w.steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-5 pb-6">
              <div className="z-10 flex size-20 flex-none items-center justify-center bg-bg">
                <StepIcon name={ICONS[i]} className="size-16" />
              </div>
              <div className="flex-1 border border-fg p-4">
                <p className="font-pixel text-[0.8125rem] text-muted">0{i + 1}</p>
                <h3 className="mt-2 text-h4">{s.title}</h3>
                <p className="mt-1 text-[0.9375rem] leading-6">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <Chips label={w.outputsLabel} items={FAN_OUTPUTS} />
      </div>
    </Section>
  );
}
