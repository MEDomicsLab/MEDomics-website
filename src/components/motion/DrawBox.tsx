'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A bordered box whose four 1px edges draw themselves in (ease "trace"), clockwise,
 * when it scrolls into view; its content fades in afterwards. Static without JS.
 */
export function DrawBox({ children, className, contentClassName }: { children: ReactNode; className?: string; contentClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.draw = 'pending';
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.draw = 'done';
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn('drawbox relative', className)}>
      <span aria-hidden className="db-edge db-t" />
      <span aria-hidden className="db-edge db-r" />
      <span aria-hidden className="db-edge db-b" />
      <span aria-hidden className="db-edge db-l" />
      <div className={cn('db-content', contentClassName)}>{children}</div>
    </div>
  );
}
