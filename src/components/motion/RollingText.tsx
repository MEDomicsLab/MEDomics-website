'use client';
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { rng, seedOf } from '@/lib/rng';
import { prefersReduced } from '@/lib/motion';
import { cn } from '@/lib/cn';

const GLYPHS = 'ABCDEFGHJKLMNOPRSTUVWXYZabcdefghkmnoprstuvwxyz0123456789';

/**
 * Odometer headline: every letter is a clipped reel of seeded random glyphs ending on
 * the real letter. Each reel has its own delay, duration and ease, so mid-animation the
 * line looks jumbled before it snaps to a clean baseline. Seeded → SSR === CSR.
 * Fires a bubbling `roll:done` event (detail: id) when finished.
 */
export function RollingText({
  lines,
  as: As = 'h1',
  id,
  className,
  trigger = 'load',
}: {
  lines: readonly string[];
  as?: 'h1' | 'h2' | 'p';
  id?: string;
  className?: string;
  trigger?: 'load' | 'view';
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  const { content, total } = useMemo(() => {
    const r = rng(seedOf(lines.join('|')));
    let idx = 0;
    let total = 0;
    const content = lines.map((line, li) => (
      <span className="roll-line" key={li}>
        {line.split(' ').map((word, wi, arr) => (
          <span key={wi}>
            <span className="roll-word">
              {[...word].map((ch, ci) => {
                const n = 3 + Math.floor(r() * 3);
                const d = Math.round(li * 160 + idx * 26 + r() * 180);
                const t = Math.round(720 + r() * 520);
                const x1 = (0.18 + r() * 0.3).toFixed(2);
                idx++;
                total = Math.max(total, d + t);
                const strip = Array.from({ length: n - 1 }, () => GLYPHS[Math.floor(r() * GLYPHS.length)]);
                const style = { '--d': `${d}ms`, '--t': `${t}ms`, '--x1': x1, '--n': n } as CSSProperties;
                return (
                  <span className="reel" key={ci} style={style}>
                    <span className="reel-size">{ch}</span>
                    <span className="reel-strip">
                      {strip.map((g, gi) => (
                        <span key={gi}>{g}</span>
                      ))}
                      <span>{ch}</span>
                    </span>
                  </span>
                );
              })}
            </span>
            {wi < arr.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    ));
    return { content, total };
  }, [lines]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const done = () => {
      el.dataset.state = 'done';
      el.dispatchEvent(new CustomEvent('roll:done', { bubbles: true, detail: id }));
    };
    const start = () => {
      el.dataset.state = 'run';
      timer = window.setTimeout(done, total + 60);
    };
    if (prefersReduced()) {
      done();
      return;
    }
    if (trigger === 'view') {
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            io.disconnect();
            start();
          }
        },
        { threshold: 0.4 },
      );
      io.observe(el);
      return () => {
        io.disconnect();
        clearTimeout(timer);
      };
    }
    const html = document.documentElement;
    if (html.dataset.preloader === 'on') {
      const onPre = () => start();
      window.addEventListener('preloader:done', onPre, { once: true });
      return () => {
        window.removeEventListener('preloader:done', onPre);
        clearTimeout(timer);
      };
    }
    const raf = requestAnimationFrame(start);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [id, total, trigger]);

  return (
    <As ref={ref} id={id} className={cn('roll', className)} data-state="idle">
      <span className="sr-only">{lines.join(' ')}</span>
      <span aria-hidden>{content}</span>
    </As>
  );
}
