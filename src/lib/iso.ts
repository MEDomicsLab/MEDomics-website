/**
 * Isometric projection helpers (30°). World axes: x → right-down, y → left-down, z → up.
 * All illustrations are generated from these, so they share one consistent angle.
 */
const C = Math.cos(Math.PI / 6); // 0.866
const S = 0.5;

export type P3 = [number, number, number];

export function iso([x, y, z]: P3): [number, number] {
  return [(x - y) * C, (x + y) * S - z];
}

export function pts(points: P3[]) {
  return points
    .map((p) =>
      iso(p)
        .map((n) => +n.toFixed(2))
        .join(','),
    )
    .join(' ');
}

/** Faces of a box at origin o with size w (x), d (y), h (z). */
export function box(o: P3, w: number, d: number, h: number) {
  const [x, y, z] = o;
  return {
    top: pts([
      [x, y, z + h],
      [x + w, y, z + h],
      [x + w, y + d, z + h],
      [x, y + d, z + h],
    ]),
    right: pts([
      [x + w, y, z],
      [x + w, y + d, z],
      [x + w, y + d, z + h],
      [x + w, y, z + h],
    ]),
    left: pts([
      [x, y + d, z],
      [x + w, y + d, z],
      [x + w, y + d, z + h],
      [x, y + d, z + h],
    ]),
  };
}

/** Polyline on the top plane z, for drawing interface sketches onto a slab's top face. */
export function onTop(z: number, points: [number, number][]) {
  return pts(points.map(([x, y]) => [x, y, z] as P3));
}
