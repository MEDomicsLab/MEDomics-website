'use client';
import { useEffect, useRef } from 'react';
import { rng } from '@/lib/rng';
import { accentPicker } from '@/lib/accents';
import { canFullMotion } from '@/lib/motion';

type Cell = { c: number; r: number; y: number; target: number; start: number; done: boolean; fill?: string };

/**
 * Hero board: ink cells drop one by one (constant speed, 0.9s per 20 cells) and lock into
 * a seeded skyline rising toward the bottom-left, like rows accumulating into a dataset.
 * Starts when the element with `waitFor` id reports `roll:done`. Static on touch/reduced motion.
 */
export function FallingBlocks({ className, waitFor, seed = 42 }: { className?: string; waitFor?: string; seed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cells: Cell[] = [];
    let size = 58;
    let cols = 0;
    let rows = 0;
    let w = 0;
    let h = 0;
    let raf = 0;
    let t0 = 0;
    let running = false;
    let visible = true;
    let finished = false;
    const animate = canFullMotion();

    const color = () => getComputedStyle(canvas).color;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // column count adapts to the board's aspect ratio (16…40)
      cols = Math.max(8, Math.min(40, Math.round(w / 58 / 4) * 4 || 8));
      size = w / cols;
      rows = Math.ceil(h / size);
      const r = rng(seed);
      const heights = Array.from({ length: cols }, (_, c) => {
        const base = Math.pow(1 - c / cols, 1.5) * rows * 0.72;
        return Math.max(0, Math.round(base + (r() - 0.5) * 2.2));
      });
      // fill order: bottom row first, random column order inside a row
      const order: Cell[] = [];
      for (let row = 0; row < rows; row++) {
        const inRow: Cell[] = [];
        for (let c = 0; c < cols; c++) {
          if (heights[c] > row) inRow.push({ c, r: row, y: -size * 2, target: h - (row + 1) * size, start: 0, done: false });
        }
        inRow.sort(() => r() - 0.5);
        order.push(...inRow);
      }
      // few pieces in flight at once, so it reads as stacking rather than rain
      const gap = Math.max(60, 4200 / Math.max(order.length, 1));
      order.forEach((cell, i) => (cell.start = i * gap));
      // about one block in seven takes a logo colour (CSS tokens resolved once: canvas needs real colours)
      const accent = accentPicker(seed);
      const css = getComputedStyle(canvas);
      order.forEach((cell) => {
        const token = accent();
        cell.fill = token && css.getPropertyValue(token.slice(4, -1)).trim();
      });
      cells = order;
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const ink = color();
      const pad = size * 0.025; // squares drawn at 95% of the cell: a 2–3px blue gap between them
      const speed = (20 * size) / 600; // px per ms: 20 cells in 0.6s
      let all = true;
      for (const cell of cells) {
        let y = cell.target;
        if (!finished) {
          const t = now - t0 - cell.start;
          if (t < 0) {
            all = false;
            continue;
          }
          y = Math.min(cell.target, -size + t * speed);
          if (y < cell.target) all = false;
        }
        ctx.fillStyle = cell.fill || ink;
        ctx.fillRect(cell.c * size + pad, y + pad, size - pad * 2, size - pad * 2);
      }
      return all;
    };

    const loop = (now: number) => {
      if (!visible) {
        running = false;
        return;
      }
      if (draw(now)) {
        finished = true;
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (finished || running) return;
      if (!t0) t0 = performance.now();
      running = true;
      raf = requestAnimationFrame(loop);
    };

    layout();
    if (!animate) {
      finished = true;
      draw(0);
    } else {
      ctx.clearRect(0, 0, w, h); // empty board until the headline settles
    }

    const target = waitFor ? document.getElementById(waitFor) : null;
    const onDone = () => start();
    if (animate) {
      if (!target || target.dataset.state === 'done') start();
      else target.addEventListener('roll:done', onDone, { once: true });
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && t0 && !finished) start();
    });
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      if (Math.abs(rect.width - w) < 2 && Math.abs(rect.height - h) < 2) return;
      layout();
      finished = finished || !animate;
      if (finished) draw(0);
    });
    ro.observe(canvas);

    // repaint when the section palette changes (theme inversion)
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      target?.removeEventListener('roll:done', onDone);
    };
  }, [seed, waitFor]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
