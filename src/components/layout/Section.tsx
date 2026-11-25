import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Section({
  tone = 'ivory',
  id,
  className,
  children,
  flush = false,
  label,
}: {
  tone?: 'ivory' | 'blue';
  id?: string;
  className?: string;
  children: ReactNode;
  flush?: boolean;
  label?: string;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      data-tone={tone}
      className={cn(tone === 'blue' && 'on-blue', 'bg-bg text-fg', !flush && 'section-y', className)}
    >
      {children}
    </section>
  );
}

/** Split-header grid (12 columns): the 2-line title spans 1–7, the intro paragraph 8–12. */
export const SPLIT_GRID = 'grid gap-6 lg:grid-cols-12 lg:gap-0';
export const SPLIT_TITLE = 'lg:col-span-7 lg:pr-8';
export const SPLIT_INTRO = 'lg:col-span-5 lg:pt-[0.4em]';

/** The split-header pattern: 2-line title on the left, intro paragraph starting at column 8. */
export function SplitHeader({
  title,
  intro,
  as: As = 'h2',
  className,
  children,
}: {
  title: ReactNode;
  intro?: ReactNode;
  as?: 'h1' | 'h2';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn('container-x', SPLIT_GRID, className)}>
      <As className={cn(As === 'h1' ? 'text-h1' : 'text-h2', SPLIT_TITLE)}>{title}</As>
      {(intro || children) && (
        <div className={SPLIT_INTRO}>
          {intro && <p className="text-body">{intro}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

/** Title lines rendered as explicit line breaks. */
export function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className="block">
          {l}
        </span>
      ))}
    </>
  );
}
