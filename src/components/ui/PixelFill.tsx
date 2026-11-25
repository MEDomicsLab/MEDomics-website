'use client';
import { useEffect, useRef } from 'react';
import { FULL_MOTION } from '@/lib/motion';

const CELL = 8;
const MAX = 420;

/**
 * Attaches the pixel-ripple hover to its parent `.btn`: on pointerenter the button is
 * split into 8×8 cells whose delays grow with distance from the entry point (max 420ms).
 * Opacity snaps per cell (0s duration) for the stepped 8-bit look; leaving reverses it.
 */
export function PixelFill() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const btn = layer?.parentElement;
    if (!layer || !btn) return;
    const mq = window.matchMedia(FULL_MOTION);
    let size = '';

    const enable = () => {
      if (mq.matches) btn.setAttribute('data-px', '');
      else btn.removeAttribute('data-px');
    };
    enable();
    mq.addEventListener('change', enable);

    const build = (r: DOMRect) => {
      const cols = Math.ceil(r.width / CELL);
      const rows = Math.ceil(r.height / CELL);
      const key = `${cols}x${rows}`;
      if (key !== size) {
        size = key;
        layer.textContent = '';
        const frag = document.createDocumentFragment();
        for (let i = 0; i < cols * rows; i++) {
          const c = document.createElement('i');
          c.style.left = `${(i % cols) * CELL}px`;
          c.style.top = `${Math.floor(i / cols) * CELL}px`;
          frag.appendChild(c);
        }
        layer.appendChild(frag);
      }
      return { cols, rows };
    };

    const spread = (px: number, py: number) => {
      const r = btn.getBoundingClientRect();
      const { cols, rows } = build(r);
      const cx = Math.min(cols - 1, Math.max(0, Math.floor((px - r.left) / CELL)));
      const cy = Math.min(rows - 1, Math.max(0, Math.floor((py - r.top) / CELL)));
      const far = Math.hypot(Math.max(cx, cols - 1 - cx), Math.max(cy, rows - 1 - cy)) || 1;
      const cells = layer.children;
      for (let i = 0; i < cells.length; i++) {
        const x = i % cols;
        const y = Math.floor(i / cols);
        (cells[i] as HTMLElement).style.setProperty('--d', `${Math.round((Math.hypot(x - cx, y - cy) / far) * MAX)}ms`);
      }
      requestAnimationFrame(() => btn.classList.add('is-filled'));
    };

    const onEnter = (e: PointerEvent) => {
      if (!mq.matches || e.pointerType !== 'mouse') return;
      spread(e.clientX, e.clientY);
    };
    const onLeave = () => btn.classList.remove('is-filled');
    const onFocus = () => {
      if (!mq.matches || !btn.matches(':focus-visible')) return;
      const r = btn.getBoundingClientRect();
      spread(r.left, r.top + r.height / 2);
    };

    btn.addEventListener('pointerenter', onEnter);
    btn.addEventListener('pointerleave', onLeave);
    btn.addEventListener('focus', onFocus);
    btn.addEventListener('blur', onLeave);
    return () => {
      mq.removeEventListener('change', enable);
      btn.removeEventListener('pointerenter', onEnter);
      btn.removeEventListener('pointerleave', onLeave);
      btn.removeEventListener('focus', onFocus);
      btn.removeEventListener('blur', onLeave);
    };
  }, []);

  return <span ref={ref} className="px-fill" aria-hidden />;
}
