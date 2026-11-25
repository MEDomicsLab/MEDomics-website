import { rng } from '@/lib/rng';
import { accentPicker } from '@/lib/accents';

/** Irregular skyline of ink squares across the bottom of the final call to action. */
export function PixelBoardStrip({
  className,
  seed = 21,
  cols = 72,
  rows = 8,
  accents = false,
}: {
  className?: string;
  seed?: number;
  cols?: number;
  rows?: number;
  /** about one cell in seven takes a logo colour */
  accents?: boolean;
}) {
  const r = rng(seed);
  const accent = accents ? accentPicker(seed) : () => undefined;
  const cells = [];
  let hgt = 2;
  for (let x = 0; x < cols; x++) {
    hgt = Math.max(0, Math.min(rows, hgt + Math.round((r() - 0.5) * 3)));
    // heavier on the left, where it continues down into the footer strip
    const lift = x < 6 ? rows : x < 12 ? Math.max(hgt, rows - 3) : hgt;
    for (let y = 0; y < lift; y++) {
      if (r() > 0.08) cells.push(<rect key={`${x}-${y}`} x={x + 0.05} y={rows - 1 - y + 0.05} width={0.9} height={0.9} fill={accent()} />);
    }
  }
  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      preserveAspectRatio="xMinYMax slice"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden
    >
      {cells}
    </svg>
  );
}
