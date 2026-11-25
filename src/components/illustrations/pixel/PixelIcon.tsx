import { icons, type IconName } from './icons';

/** Renders a bitmap icon as merged horizontal runs of rects (crisp at any integer scale). */
export function PixelIcon({ name, size = 24, className, title }: { name: IconName; size?: number; className?: string; title?: string }) {
  const rows = icons[name];
  const w = rows[0].length;
  const h = rows.length;
  const rects: string[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      if (row[x] === '#') {
        let e = x;
        while (e < w && row[e] === '#') e++;
        rects.push(`M${x} ${y}h${e - x}v1h-${e - x}z`);
        x = e;
      } else x++;
    }
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={(size * h) / w}
      className={className}
      shapeRendering="crispEdges"
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={rects.join('')} />
    </svg>
  );
}
