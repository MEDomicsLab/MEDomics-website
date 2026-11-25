'use client';
import { useEffect, useRef, useState } from 'react';
import type { Dict } from '@/content/types';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FULL_MOTION } from '@/lib/motion';
import { scrollToY, getLenis } from '@/lib/lenis';
import { fill } from '@/lib/i18n';
import { dissolve, resetDissolve } from '@/lib/dissolve';
import { RollingText } from '@/components/motion/RollingText';
import { MaskLines, MaskWords, indexLines } from '@/components/motion/Masks';
import { FallingBlocks } from '@/components/canvas/FallingBlocks';
import { Button, TertiaryLink } from '@/components/ui/Button';
import { PixelIcon } from '@/components/illustrations/pixel/PixelIcon';
import { IsoStack, PlateArt, type Face } from '@/components/illustrations/iso/Iso';
import { SPLIT_GRID, SPLIT_TITLE, SPLIT_INTRO } from '@/components/layout/Section';
import { links } from '@/content/links';

const FACES: Face[] = ['table', 'canvas', 'network', 'form'];

/*
 * Scroll budget, in viewport heights from the start of the pin (HERO_SCROLL_ANALYSIS.md §4–5):
 *   0 → 1    hero exit, scrubbed and linear (the corner travels to the top-left);
 *   1        handover: the layers heading, intro and first plate play in (timed);
 *   1.3      step 1: the accordion box draws in with item 1;
 *   2.1, 3.1, 4.1   steps 2–4: a plate lands on the stack, the next item opens;
 *   +1       hold after the last step, then the pin releases.
 * Every threshold is two-way: scrolling back up crosses it again and the CSS transitions reverse.
 */
const EXIT = 1;
const stepAt = (i: number) => (i === 0 ? 1.3 : 2.1 + (i - 1));
const totalFor = (steps: number) => stepAt(steps - 1) + 1;
const seg = (p: number, a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));

/**
 * Hero split + "three layers" scene. On capable desktops both live in one pinned
 * ScrollTrigger (see the scroll budget above). Everywhere else it degrades to two plain
 * stacked sections with a click-driven accordion.
 */
export function HeroLayers({
  dict,
  locale,
  release,
}: {
  dict: Dict;
  locale: string;
  release: { version: string; date: string; url: string };
}) {
  const h = dict.hero;
  const l = dict.layers;
  const root = useRef<HTMLDivElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(0);
  const inRef = useRef(false);
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const steps = l.steps.length;

  // GSAP is fetched only when the full-motion gate matches (capable desktops).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mq = window.matchMedia(FULL_MOTION);
    let teardown: (() => void) | null = null;
    let loading = false;
    let alive = true;

    const setup = async () => {
      loading = true;
      const { ScrollTrigger } = await import('@/lib/gsap');
      loading = false;
      if (!alive || !mq.matches || teardown) return;

      const q = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!;
      const band = q('.hl-band');
      const board = q('.hl-board');
      const col = q('.hl-col');
      const cell = q('.hl-cell');
      const cellIn = q('.hl-cell > div');
      const dzCard = q('.hl-dz-card');
      const dzBtns = q('.hl-dz-btns');
      const dzArrow = q('.hl-dz-arrow');
      const total = totalFor(steps);

      // geometry at p = 0, re-measured on every refresh (resize, fonts)
      let bandH = 0;
      let x0 = 0;
      let cellH = 0;
      let lastP = -1;

      const measure = () => {
        bandH = band.offsetHeight;
        el.style.setProperty('--band-h', `${bandH}px`);
        col.style.left = '';
        x0 = col.offsetLeft;
        cellH = cellIn.offsetHeight;
        indexLines(el);
        lastP = -1;
      };

      /*
       * The single scrubbed variable: the corner where the right column's left border meets
       * the rule under its top cell. It travels linearly from (x0, bandH + cellH) to (0, 0).
       * - vertical edge: column `left`; the board slides left by the same amount (pushed, not scaled);
       * - horizontal edge: first collapses the top cell, then pushes the ivory band up under the header.
       */
      const paint = (p: number) => {
        if (p === lastP) return;
        lastP = p;
        const X = x0 * (1 - p);
        const Y = (bandH + cellH) * (1 - p);
        const top = Math.min(bandH, Y);
        band.style.transform = `translate3d(0,${top - bandH}px,0)`;
        board.style.transform = `translate3d(${X - x0}px,0,0)`;
        col.style.left = `${X}px`;
        col.style.top = `${top}px`;
        cell.style.height = `${Y - top}px`;
        dissolve(dzCard, seg(p, 0.05, 0.27), { biasY: 0.35, seed: 11 });
        dissolve(dzBtns, seg(p, 0.05, 0.3), { biasX: 0.45, seed: 23 });
        dissolve(dzArrow, seg(p, 0.48, 0.62), { cell: 6, run: 1, seed: 5 });
      };

      const update = (self: ScrollTrigger) => {
        const d = self.progress * total; // viewport heights scrolled into the pin
        paint(Math.min(1, d / EXIT));
        const isIn = d >= EXIT - 0.002;
        let a = -1;
        for (let i = 0; i < steps; i++) if (d >= stepAt(i)) a = i;
        if (isIn !== inRef.current) {
          inRef.current = isIn;
          setEntered(isIn);
        }
        if (a !== activeRef.current) {
          activeRef.current = a;
          setActive(a);
        }
      };

      el.classList.add('is-pinned');
      setPinned(true);
      activeRef.current = -1;
      setActive(-1);
      measure();
      paint(0);

      const trigger = ScrollTrigger.create({
        trigger: q('.hl-pin'),
        start: () => `top ${document.querySelector('header')?.offsetHeight ?? 44}px`,
        end: () => `+=${Math.round(window.innerHeight * total)}`,
        pin: true,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure();
          update(self);
        },
        onUpdate: update,
      });
      st.current = trigger;
      update(trigger);

      const offLenis = getLenis()?.on('scroll', ScrollTrigger.update);
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('md:refresh', refresh);
      document.fonts?.ready.then(() => alive && refresh());

      teardown = () => {
        window.removeEventListener('md:refresh', refresh);
        offLenis?.();
        trigger.kill();
        for (const n of [band, board, col, cell]) n.removeAttribute('style');
        for (const n of [dzCard, dzBtns, dzArrow]) resetDissolve(n);
        el.style.removeProperty('--band-h');
        el.classList.remove('is-pinned');
        st.current = null;
        inRef.current = false;
        activeRef.current = 0;
        setPinned(false);
        setEntered(false);
        setActive(0);
      };
    };

    const apply = () => {
      if (mq.matches && !teardown && !loading) setup();
      else if (!mq.matches && teardown) {
        teardown();
        teardown = null;
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => {
      alive = false;
      mq.removeEventListener('change', apply);
      teardown?.();
    };
  }, [steps]);

  /** Accordion headers jump to their step (pinned) or simply open it (plain layout). */
  const go = (i: number) => {
    const t = st.current;
    if (t) {
      scrollToY(t.start + ((stepAt(i) + 0.2) / totalFor(steps)) * (t.end - t.start));
    } else {
      activeRef.current = i;
      setActive(i);
    }
  };

  const stateOf = (i: number) => (i === active ? 'open' : i < active || !pinned ? 'closed' : 'hidden');

  return (
    <div ref={root} className="hl relative" data-in={entered}>
      <div className="hl-pin relative">
        {/* ── Hero ── */}
        <div className="hl-hero flex flex-col">
          <div className="hl-band bg-bg text-fg" data-tone="ivory">
            <div className="container-x grid gap-6 pt-10 pb-8 lg:grid-cols-[1fr_calc(var(--hero-aside)-var(--gutter))] lg:gap-16 lg:pt-12 lg:pb-11">
              <RollingText lines={h.title} id="hero-title" className="text-display" />
              <div className="lg:pt-2 lg:pl-6">
                <p className="text-body">{h.text}</p>
                <div className="mt-6 lg:hidden">
                  <Button href="download" locale={locale} className="w-full">
                    {h.cta}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="hl-field on-blue relative flex-1 bg-bg text-fg" data-tone="blue">
            <div className="hl-grid grid h-full lg:grid-cols-[minmax(0,1fr)_var(--hero-aside)]">
              <div className="hl-board relative order-2 h-[16.25rem] sm:h-[21.25rem] lg:order-1 lg:h-auto">
                <FallingBlocks className="absolute inset-0 h-full w-full text-fg" waitFor="hero-title" />
              </div>
              <div className="hl-col order-1 flex flex-col border-guide bg-bg lg:order-2 lg:border-l">
                <div className="hl-cell border-b border-guide">
                  <div className="hl-dz-card relative p-5 lg:p-6">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-pixel text-[0.8125rem] uppercase tracking-wider text-muted">{h.releaseLabel}</p>
                          <p className="mt-2 font-heading text-h3">{fill(h.releaseTitle, { version: release.version })}</p>
                        </div>
                        <span className="border border-fg px-2 py-1 font-pixel text-[0.8125rem]">v{release.version}</span>
                      </div>
                      <p className="mt-3 text-[0.8125rem] text-muted">{fill(h.releaseNote, { date: release.date })}</p>
                      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-pixel text-[0.8125rem]" aria-label="Platforms">
                        <li>Windows</li>
                        <li aria-hidden>·</li>
                        <li>Ubuntu</li>
                        <li aria-hidden>·</li>
                        <li>macOS</li>
                      </ul>
                      <TertiaryLink href={release.url} locale={locale} className="mt-4">
                        {h.releaseLink}
                      </TertiaryLink>
                    </div>
                    <canvas aria-hidden className="dz-canvas text-bg" />
                  </div>
                </div>
                <div className="relative hidden flex-1 lg:block">
                  {/* rides the corner: 1.6rem right of the split, 1.5rem under the rule */}
                  <div className="hl-dz-arrow nudge absolute left-[1.6rem] top-[1.5rem]">
                    <PixelIcon name="arrow" size={72} className="block" />
                    <canvas aria-hidden className="dz-canvas text-bg" />
                  </div>
                </div>
                <div className="hl-dz-btns relative hidden justify-end gap-2 p-6 lg:flex">
                  <Button href={links.youtube} locale={locale} variant="secondary">
                    {h.secondary}
                  </Button>
                  <Button href="download" locale={locale} icon={<PixelIcon name="download" size={12} />}>
                    {h.cta}
                  </Button>
                  <canvas aria-hidden className="dz-canvas text-bg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Layers ── */}
        <section id="layers" className="hl-layers on-blue bg-bg text-fg" data-tone="blue" aria-labelledby="layers-title">
          <div className="hl-head container-x py-16 lg:py-10">
            <div className={SPLIT_GRID}>
              <h2 id="layers-title" className={`text-h2 ${SPLIT_TITLE}`}>
                <MaskLines lines={l.title} />
              </h2>
              <p className={`hl-intro text-body ${SPLIT_INTRO}`}>
                <MaskWords text={l.intro} />
              </p>
            </div>
          </div>
          <div className="container-x grid gap-10 pb-16 lg:grid-cols-[minmax(0,46%)_1fr] lg:gap-16 lg:pb-0">
            <ol className="layer-box flex flex-col self-start" data-drawn={active >= 0}>
              {l.steps.map((s, i) => {
                const state = stateOf(i);
                const shut = pinned && state !== 'open';
                return (
                  <li
                    key={s.key}
                    className="layer-item relative"
                    data-on={i === active}
                    data-state={state}
                    inert={pinned && state === 'hidden'}
                  >
                    {i > 0 && <span aria-hidden className="layer-rule" />}
                    <div className="layer-row">
                      <div>
                        <h3>
                          <button
                            type="button"
                            onClick={() => go(i)}
                            aria-expanded={i === active}
                            className="flex w-full items-center gap-4 px-5 py-5 text-left lg:min-h-[4.75rem] lg:px-9"
                          >
                            <span className="font-pixel text-[0.8125rem] text-muted">0{i + 1}</span>
                            <span className="font-pixel text-[0.8125rem] uppercase tracking-wider">{s.tag}</span>
                            <span className="layer-rowtitle ml-auto hidden text-h4 lg:inline">{s.title}</span>
                          </button>
                        </h3>
                        <div className="layer-body" inert={shut}>
                          <div>
                            <div className="px-5 pb-6 lg:px-9 lg:pb-9">
                              <div className="off-blue mb-6 border border-fg bg-bg p-4 text-fg lg:hidden">
                                <PlateArt face={FACES[i]} className="mx-auto h-auto w-full max-w-[20rem]" />
                              </div>
                              <p className="text-h3">
                                <MaskWords text={s.title} />
                              </p>
                              <p className="mt-4 text-body">
                                <MaskWords text={s.text} delay={0.08} />
                              </p>
                              <div className="layer-btns mt-6 flex flex-col gap-2 sm:flex-row">
                                <Button href={s.primary.href} locale={locale}>
                                  {s.primary.label}
                                </Button>
                                <Button href={s.secondary.href} locale={locale} variant="secondary">
                                  {s.secondary.label}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="hidden items-start justify-center lg:flex">
              <div className="hl-stack w-full max-w-[36rem] text-fg">
                <IsoStack faces={FACES} active={active} className="h-auto w-full" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
