'use client';
import { useEffect, useRef } from 'react';
import { Box } from '@/components/illustrations/iso/Iso';

const PLATES = [0, 30, 60];
const TOTAL_MS = 2150; // drop ×3 → wordmark rise → curtain lift (see globals.css §7)

/**
 * First visit only (the gate script in the layout decides): three ghost layer outlines are
 * filled one by one by solid plates dropping in, the wordmark rises, then the curtain lifts.
 * Pure CSS keyframes; a CSS failsafe hides it after 3.2s even if JS stalls.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const el = ref.current;
    if (!el || html.dataset.preloader !== 'on') return;
    try {
      sessionStorage.setItem('md-pre', '1');
    } catch {}
    el.classList.add('is-run');
    const t = window.setTimeout(() => {
      html.dataset.preloader = 'off';
      window.dispatchEvent(new Event('preloader:done'));
    }, TOTAL_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div ref={ref} className="preloader on-blue fixed inset-0 z-[100] bg-bg text-fg" aria-hidden>
      <div className="flex h-full items-center justify-center">
        <svg viewBox="-110 -110 220 200" className="w-[180px] overflow-visible sm:w-[220px]">
          {PLATES.map((z) => (
            <g key={`g${z}`} opacity={0.4}>
              <Box o={[0, 0, z]} w={90} d={90} h={14} fill="transparent" />
            </g>
          ))}
          {PLATES.map((z, i) => (
            <g key={`s${z}`} className="pl-solid off-blue text-fg" style={{ animationDelay: `${i * 260}ms` }}>
              <Box o={[0, 0, z]} w={90} d={90} h={14} hatch />
            </g>
          ))}
        </svg>
      </div>
      <div className="absolute bottom-6 right-6 overflow-hidden sm:bottom-10 sm:right-10">
        <span className="pl-word block font-heading text-[clamp(40px,7vw,88px)] leading-none">MEDomics</span>
      </div>
    </div>
  );
}
