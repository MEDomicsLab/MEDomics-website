import { rng } from './rng';

/**
 * 8-bit "pixel dissolve" driven by a progress value (0 = intact, 1 = gone).
 *
 * Markup: a positioned wrapper holding the content plus one `<canvas class="dz-canvas text-bg">`
 * that covers it. The canvas paints squares in the background colour over the content, in a
 * seeded random order, so the element breaks into blocks instead of fading. Cells are ranked
 * in short horizontal runs (1–4 cells), which reads as glitchy fragments rather than noise.
 * Pure function of progress, so scrolling back up rebuilds the element exactly.
 */
type Opts = { cell?: number; run?: number; seed?: number; biasX?: number; biasY?: number };
type Grid = { w: number; h: number; cols: number; rows: number; cell: number; ranks: Float32Array; color: string; last: number };

const grids = new WeakMap<HTMLCanvasElement, Grid>();

function prepare(c: HTMLCanvasElement, o: Required<Opts>): Grid | null {
  const w = c.offsetWidth;
  const h = c.offsetHeight;
  if (!w || !h) return null;
  const old = grids.get(c);
  if (old && old.w === w && old.h === h) return old;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  c.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cols = Math.ceil(w / o.cell);
  const rows = Math.ceil(h / o.cell);
  const r = rng(o.seed);
  const ranks = new Float32Array(cols * rows);
  const noise = 1 - o.biasX - o.biasY;
  for (let y = 0; y < rows; y++) {
    let x = 0;
    while (x < cols) {
      const run = 1 + Math.floor(r() * o.run);
      const v = noise * r() + o.biasX * (x / cols) + o.biasY * (y / rows);
      for (let k = 0; k < run && x < cols; k++, x++) ranks[y * cols + x] = v;
    }
  }
  const g = { w, h, cols, rows, cell: o.cell, ranks, color: getComputedStyle(c).color, last: -1 };
  grids.set(c, g);
  return g;
}

export function dissolve(wrap: HTMLElement | null, q: number, opts: Opts = {}) {
  const c = wrap?.querySelector<HTMLCanvasElement>(':scope > .dz-canvas');
  if (!wrap || !c) return;
  const o = { cell: 8, run: 4, seed: 7, biasX: 0, biasY: 0, ...opts };
  const p = Math.max(0, Math.min(1, q));
  const g = prepare(c, o);
  if (!g || g.last === p) return;
  g.last = p;
  const ctx = c.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, g.w, g.h);
  if (p > 0) {
    ctx.fillStyle = g.color;
    // ranks span [0, 1); scale so p = 1 covers every cell
    const cut = p * 1.0001;
    for (let y = 0; y < g.rows; y++) {
      for (let x = 0; x < g.cols; x++) {
        // slight overlap so fractional DPR never leaves hairline seams
        if (g.ranks[y * g.cols + x] < cut) ctx.fillRect(x * g.cell - 0.25, y * g.cell - 0.25, g.cell + 0.5, g.cell + 0.5);
      }
    }
  }
  // fully dissolved content leaves the tab order and the accessibility tree
  const gone = p >= 1;
  for (const child of Array.from(wrap.children) as HTMLElement[]) {
    if (child === c) continue;
    child.style.visibility = gone ? 'hidden' : '';
    child.inert = gone;
  }
}

/** Restore a dissolve wrapper to its untouched state (used on teardown). */
export function resetDissolve(wrap: HTMLElement | null) {
  const c = wrap?.querySelector<HTMLCanvasElement>(':scope > .dz-canvas');
  if (!wrap || !c) return;
  c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
  grids.delete(c);
  for (const child of Array.from(wrap.children) as HTMLElement[]) {
    if (child === c) continue;
    child.style.visibility = '';
    child.inert = false;
  }
}
