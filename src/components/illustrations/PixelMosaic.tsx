import { rng } from '@/lib/rng';

/** Low-res "noise" swatch: squares in five close shades of the current ink. */
export function PixelMosaic({
  className,
  seed = 1,
  cols = 16,
  rows = 4,
}: {
  className?: string;
  seed?: number;
  cols?: number;
  rows?: number;
}) {
  const r = rng(seed);
  const shades = [1, 0.82, 0.66, 0.5, 0.36];
  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const o = shades[Math.floor(r() * shades.length)];
      cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" opacity={o} />);
    }
  }
  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} preserveAspectRatio="none" className={className} shapeRendering="crispEdges" aria-hidden>
      {cells}
    </svg>
  );
}
