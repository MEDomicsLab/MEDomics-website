import { rng } from '@/lib/rng';
import { accentPicker } from '@/lib/accents';

/**
 * Vertical checker strip of ink squares: dense near the left edge, thinning out to the right.
 * Continues the pixel board of the final call to action down into the footer.
 */
export function PixelStrip({
  className,
  seed = 1,
  cols = 6,
  rows = 60,
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
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const p = 1 - x / cols; // density falls off to the right
      if (r() < p * 0.85) cells.push(<rect key={`${x}-${y}`} x={x + 0.04} y={y + 0.04} width={0.92} height={0.92} fill={accent()} />);
    }
  }
  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      preserveAspectRatio="xMinYMin slice"
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden
    >
      {cells}
    </svg>
  );
}
