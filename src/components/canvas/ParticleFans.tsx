'use client';
import { useEffect, useRef } from 'react';
import { rng } from '@/lib/rng';
import { prefersReduced } from '@/lib/motion';
import { FAN_INPUTS as INPUTS, FAN_GHOSTS as GHOSTS, FAN_OUTPUTS as OUTPUTS } from '@/content/fans';

/** A fan curve, resampled for constant-speed travel: `xs/ys` are dense points, `len[i]` the arc length up to point i. */
type Curve = {
  pts: [number, number][];
  xs: Float32Array;
  ys: Float32Array;
  len: Float32Array;
  total: number;
  ghost: boolean;
  label?: string;
};
/** A particle's position is a pure function of time: s = (offset + speed · t) mod curve length. */
type Particle = { curve: number; offset: number; label?: string };

/** Travel speed in rem per second, shared by every particle and the link nodes, so the flow reads as one stream. */
const SPEED_REM = 3.5;
const DENSE = 240; // samples per curve for the arc-length table

function bezier(p0: number[], p1: number[], p2: number[], p3: number[], n: number) {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

/** Point at arc length `s` along a curve (binary search + linear interpolation, so motion is continuous). */
function pointAt(c: Curve, s: number): [number, number] {
  const { len, xs, ys } = c;
  let lo = 0;
  let hi = len.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (len[mid] <= s) lo = mid;
    else hi = mid;
  }
  const span = len[hi] - len[lo] || 1;
  const f = (s - len[lo]) / span;
  return [xs[lo] + (xs[hi] - xs[lo]) * f, ys[lo] + (ys[hi] - ys[lo]) * f];
}

/**
 * Inputs stream in from the left edge along dotted curves and converge on the step row;
 * a mirrored fan carries outputs to the right edge. Step positions come from the DOM
 * (`[data-fan-step]`), so the canvas always lines up with the step icons.
 * Ghost curves (disabled extraction inputs) are drawn faint and carry no particles.
 *
 * Animation: every moving mark travels at the same speed in px/s (arc-length parametrised),
 * positions are computed from the clock rather than accumulated per frame, and everything
 * static (dotted curves, links, ghost labels) is pre-rendered once per layout.
 *
 * Geometry, in rem so it follows the fluid root size:
 * - `tipGapRem`: gap between each fan's point and the first / last icon box;
 * - `clearRem`: free space between an icon drawing and the links to its neighbours.
 */
export function ParticleFans({
  className,
  tipGapRem = 4.25,
  clearRem = 2.5,
}: {
  className?: string;
  tipGapRem?: number;
  clearRem?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = prefersReduced();
    const bg = document.createElement('canvas'); // static layer
    const bgx = bg.getContext('2d');
    let curves: Curve[] = [];
    let particles: Particle[] = [];
    let links: [number, number][] = [];
    let w = 0;
    let h = 0;
    let lineY = 0;
    let speed = 70; // px/s, recomputed from the root size
    let ink = '#000';
    let font = '11px monospace';
    let raf = 0;
    let visible = false;

    /** Colour and font are read once per layout, never per frame (getComputedStyle can force a style recalc). */
    const readStyle = () => {
      const cs = getComputedStyle(host);
      ink = cs.color;
      font = `11px ${cs.getPropertyValue('--fan-font').trim() || 'monospace'}`;
    };

    const paintStatic = () => {
      if (!bgx) return;
      bgx.setTransform(1, 0, 0, 1, 0, 0);
      bgx.clearRect(0, 0, bg.width, bg.height);
      const dpr = bg.width / (w || 1);
      bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bgx.fillStyle = ink;
      for (const c of curves) {
        bgx.globalAlpha = c.ghost ? 0.18 : 0.45;
        for (let i = 0; i < c.pts.length; i += 2) bgx.fillRect(c.pts[i][0] - 0.75, c.pts[i][1] - 0.75, 1.5, 1.5);
        if (c.ghost && c.label) {
          bgx.globalAlpha = 0.3;
          bgx.font = font;
          bgx.fillText(c.label, c.pts[0][0] + 6, c.pts[0][1] - 6);
        }
      }
      bgx.globalAlpha = 0.6;
      for (const [x0, x1] of links) for (let x = x0; x < x1; x += 5) bgx.fillRect(x, lineY - 0.5, 2, 1);
      bgx.globalAlpha = 1;
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = host.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = bg.width = Math.round(w * dpr);
      canvas.height = bg.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readStyle();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      speed = SPEED_REM * rem;
      const steps = Array.from(host.querySelectorAll<HTMLElement>('[data-fan-step]')).map((el) => el.getBoundingClientRect());
      const a = steps[0];
      const b = steps[steps.length - 1];
      // the fans narrow to a point a little before the first icon / after the last one
      const ax = a ? a.left - r.left - tipGapRem * rem : w * 0.2;
      const bx = b ? b.right - r.left + tipGapRem * rem : w * 0.8;
      lineY = a ? a.top - r.top + a.height / 2 : h * 0.4;
      // one dotted link per pair of neighbouring icons, kept clear of the drawings
      links = steps.slice(0, -1).map((s, i) => {
        const next = steps[i + 1];
        const half = s.width * 0.43; // the drawing fills ~86% of its box
        return [s.left - r.left + s.width / 2 + half + clearRem * rem, next.left - r.left + next.width / 2 - half - clearRem * rem];
      });
      const rand = rng(9);
      curves = [];
      const make = (side: 'l' | 'r', count: number, labels: string[], ghosts: string[]) => {
        const total = count + ghosts.length;
        for (let i = 0; i < total; i++) {
          const ghost = i >= count;
          const y0 = h * 0.04 + ((h * 0.92) / (total - 1)) * i + (rand() - 0.5) * 18;
          const edge = side === 'l' ? 0 : w;
          const anchor = side === 'l' ? ax : bx;
          const span = Math.abs(anchor - edge);
          const c1 = [edge + (side === 'l' ? 1 : -1) * span * (0.35 + rand() * 0.2), y0];
          const c2 = [anchor - (side === 'l' ? 1 : -1) * span * (0.3 + rand() * 0.15), lineY];
          const [p0, p1, p2, p3] = side === 'l' ? [[edge, y0], c1, c2, [anchor, lineY]] : [[anchor, lineY], c2, c1, [edge, y0]];
          const pts = bezier(p0, p1, p2, p3, 90); // the dotted look (unchanged)
          const dense = bezier(p0, p1, p2, p3, DENSE); // the travel path
          const xs = new Float32Array(dense.length);
          const ys = new Float32Array(dense.length);
          const len = new Float32Array(dense.length);
          dense.forEach(([x, y], k) => {
            xs[k] = x;
            ys[k] = y;
            if (k) len[k] = len[k - 1] + Math.hypot(x - xs[k - 1], y - ys[k - 1]);
          });
          const label = ghost ? ghosts[i - count] : i % 2 === 0 ? labels[(i / 2) % labels.length] : undefined;
          curves.push({ pts, xs, ys, len, total: len[len.length - 1], ghost, label });
        }
      };
      make('l', 12, INPUTS, GHOSTS);
      make('r', 10, OUTPUTS, []);
      // 2–3 particles per curve, evenly spaced along it from a random phase
      particles = [];
      curves.forEach((c, ci) => {
        if (c.ghost) return;
        const n = 2 + Math.floor(rand() * 2);
        const phase = rand();
        for (let k = 0; k < n; k++) {
          particles.push({ curve: ci, offset: ((phase + k / n) % 1) * c.total, label: k === 0 ? c.label : undefined });
        }
      });
      paintStatic();
    };

    const draw = (now: number) => {
      const time = now / 1000;
      ctx.clearRect(0, 0, w, h);
      if (bg.width) ctx.drawImage(bg, 0, 0, w, h);
      ctx.fillStyle = ink;
      ctx.globalAlpha = 1;
      // link nodes: three evenly spaced squares per link, at the shared speed
      for (const [x0, x1] of links) {
        const len = x1 - x0;
        if (len <= 0) continue;
        for (let k = 0; k < 3; k++) {
          const x = x0 + ((time * speed + (k * len) / 3) % len);
          ctx.fillRect(x - 2, lineY - 2, 4, 4);
        }
      }
      // particles (sub-pixel positions: rounding to whole pixels makes slow motion judder)
      ctx.font = font;
      for (const p of particles) {
        const c = curves[p.curve];
        const s = (p.offset + time * speed) % c.total;
        const [x, y] = pointAt(c, s);
        ctx.globalAlpha = 1;
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        if (p.label) {
          const t = s / c.total;
          const fade = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;
          ctx.globalAlpha = Math.max(0, fade);
          ctx.fillText(p.label, x + 6, y - 5);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (reduced || raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(loop);
    };

    layout();
    draw(reduced ? 0 : performance.now());
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      layout();
      draw(reduced ? 0 : performance.now());
    });
    ro.observe(host);
    const onVis = () => start();
    document.addEventListener('visibilitychange', onVis);
    document.fonts?.ready.then(() => {
      readStyle();
      paintStatic();
      draw(reduced ? 0 : performance.now());
    });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [tipGapRem, clearRem]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
