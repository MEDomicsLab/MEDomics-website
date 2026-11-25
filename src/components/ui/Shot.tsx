import images from '@/content/images.json';
import { cn } from '@/lib/cn';

type Name = keyof typeof images;

/** Pre-optimised screenshot (AVIF → WebP) with intrinsic size, so it never shifts layout. */
export function Shot({
  name,
  sizes = '100vw',
  className,
  priority = false,
  alt,
}: {
  name: Name;
  sizes?: string;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const img = images[name];
  const set = (list: { src: string; w: number }[]) => list.map((s) => `${s.src} ${s.w}w`).join(', ');
  const fallback = img.webp[img.webp.length - 1].src;
  return (
    <picture>
      <source type="image/avif" srcSet={set(img.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={set(img.webp)} sizes={sizes} />
      <img
        src={fallback}
        alt={alt ?? img.alt}
        width={img.width}
        height={img.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' as const } : {})}
        className={cn('h-auto w-full', className)}
      />
    </picture>
  );
}

/** Browser/app window mock: three outlined dots, a hairline, an optional hatched offset shadow. */
export function WindowFrame({
  children,
  className,
  shadow = false,
  title,
  rounded = true,
}: {
  children: React.ReactNode;
  className?: string;
  shadow?: boolean;
  title?: string;
  rounded?: boolean;
}) {
  return (
    <div className={cn('relative', className)}>
      {shadow && (
        <div
          aria-hidden
          className={cn(
            'hatch absolute inset-0 translate-x-[0.625rem] translate-y-[0.625rem] text-fg opacity-70',
            rounded && 'rounded-2xl',
          )}
        />
      )}
      <div className={cn('off-blue relative overflow-hidden border border-fg bg-bg text-fg', rounded && 'rounded-2xl')}>
        <div className="flex h-9 items-center gap-1.5 border-b border-fg px-4">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full border border-fg" />
          ))}
          {title && <span className="ml-3 font-code text-[0.75rem] text-muted">{title}</span>}
        </div>
        {children}
      </div>
    </div>
  );
}
