'use client';
import { useEffect, useRef } from 'react';
import { rng } from '@/lib/rng';
import { prefersReduced } from '@/lib/motion';

/** Travel speed in rem per second, and the time between two pixels leaving the root. */
const SPEED_REM = 7;
const INTERVAL = 0.75;
const SIZE = 3; // px, the pixel's side
const SEQ = 64; // length of the (seeded) branch sequence, repeated

/**
 * Pixels that run down the tree's trunk and turn into a branch, ending at the item's icon.
 * Branches are the elements marked `[data-branch]` inside the parent element (which must be
 * `position: relative`; render this component as its last child). Their geometry is measured
 * from the DOM, so the pixels follow the dotted lines at every breakpoint. Positions are a pure function of the clock, so frames
 * never accumulate drift and the flow resumes seamlessly after being paused offscreen.
 */
export function TreePulses() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const list = layer?.parentElement;
    if (!layer || !list || prefersReduced()) return;

    const rand = rng(17);
    let trunkX = 0;
    let branches: { y: number; x1: number }[] = [];
    const seq: number[] = [];
    let speed = 120;
    let pool: HTMLSpanElement[] = [];
    let raf = 0;
    let visible = false;

    const layout = () => {
      const r = list.getBoundingClientRect();
      const els = Array.from(list.querySelectorAll<HTMLElement>('[data-branch]'));
      branches = els.map((el) => {
        const b = el.getBoundingClientRect();
        return { y: b.top - r.top, x1: b.right - r.left };
      });
      trunkX = els[0] ? els[0].getBoundingClientRect().left - r.left : 0;
      speed = SPEED_REM * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
      if (!seq.length && branches.length) {
        // a shuffled-looking order that never sends two pixels in a row to the same branch
        for (let k = 0; k < SEQ; k++) {
          let i = Math.floor(rand() * branches.length);
          if (branches.length > 1 && i === seq[k - 1]) i = (i + 1) % branches.length;
          seq.push(i);
        }
      }
      // enough pixels for the longest trip
      const longest = Math.max(0, ...branches.map((b) => b.y + b.x1 - trunkX));
      const need = Math.ceil(longest / speed / INTERVAL) + 1;
      while (pool.length < need) {
        const s = document.createElement('span');
        s.className = 'tree-pulse';
        layer.appendChild(s);
        pool.push(s);
      }
    };

    const draw = (now: number) => {
      const t = now / 1000;
      const k1 = Math.floor(t / INTERVAL);
      let used = 0;
      for (let k = k1; k > k1 - pool.length && used < pool.length; k--) {
        const b = branches[seq[((k % SEQ) + SEQ) % SEQ]];
        if (!b) break;
        const d = (t - k * INTERVAL) * speed; // distance travelled
        const run = b.x1 - trunkX;
        if (d > b.y + run) continue; // arrived: gone
        const x = d < b.y ? trunkX : trunkX + (d - b.y);
        const y = Math.min(d, b.y);
        const s = pool[used++];
        s.style.transform = `translate3d(${Math.round(x + 0.5 - SIZE / 2)}px,${Math.round(y + 0.5 - SIZE / 2)}px,0)`;
        s.style.visibility = 'visible';
      }
      for (let i = used; i < pool.length; i++) pool[i].style.visibility = 'hidden';
    };

    const loop = (now: number) => {
      draw(now);
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    layout();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(list);
    const ro = new ResizeObserver(layout);
    ro.observe(list);
    document.addEventListener('visibilitychange', start);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', start);
      pool.forEach((s) => s.remove());
      pool = [];
    };
  }, []);

  return <span ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-[1] text-fg" />;
}
