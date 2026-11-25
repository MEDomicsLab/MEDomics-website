import { box, iso, onTop, type P3 } from '@/lib/iso';

/**
 * Isometric line-art kit, generated from code (lib/iso.ts).
 * Fills read --background and strokes read currentColor, so every drawing
 * inverts with its section. Wrap in `.off-blue` for ivory-on-blue islands.
 */
const S = { stroke: 'currentColor', strokeWidth: 1.25, vectorEffect: 'non-scaling-stroke' as const, strokeLinejoin: 'round' as const };
const FILL = 'var(--background)';
/** Shaded side face, resolved per element (an SVG <pattern> id would leak colors across sections). */
const SHADE = 'color-mix(in srgb, var(--foreground) 14%, var(--background))';

export function Box({
  o,
  w,
  d,
  h,
  hatch = false,
  fill = FILL,
}: {
  o: P3;
  w: number;
  d: number;
  h: number;
  hatch?: boolean;
  fill?: string;
}) {
  const f = box(o, w, d, h);
  return (
    <g>
      <polygon points={f.left} fill={fill} {...S} />
      <polygon points={f.right} fill={fill} style={hatch ? { fill: SHADE } : undefined} {...S} />
      <polygon points={f.top} fill={fill} {...S} />
    </g>
  );
}

const line = (z: number, p: [number, number][], extra?: Record<string, unknown>) => (
  <polyline points={onTop(z, p)} fill="none" {...S} {...extra} />
);
const rectTop = (z: number, x: number, y: number, w: number, d: number, fill = 'none') => (
  <polygon
    points={onTop(z, [
      [x, y],
      [x + w, y],
      [x + w, y + d],
      [x, y + d],
    ])}
    fill={fill}
    {...S}
  />
);

/* ───────── top-face sketches for a 200×200 plate ───────── */
export type Face = 'table' | 'canvas' | 'network' | 'form' | 'shap' | 'play';

export function FaceDrawing({ face, z }: { face: Face; z: number }) {
  switch (face) {
    case 'table':
      return (
        <g>
          {rectTop(z, 24, 24, 152, 152)}
          {rectTop(z, 24, 24, 152, 30, 'currentColor')}
          {[76, 98, 120, 142].map((y) => (
            <g key={y}>
              {line(z, [
                [24, y],
                [176, y],
              ])}
            </g>
          ))}
          {[70, 112, 146].map((x) => (
            <g key={x}>
              {line(z, [
                [x, 54],
                [x, 176],
              ])}
            </g>
          ))}
          {rectTop(z, 30, 60, 30, 8, 'currentColor')}
          {rectTop(z, 78, 60, 24, 8)}
          {rectTop(z, 118, 60, 20, 8)}
        </g>
      );
    case 'canvas':
      return (
        <g>
          {rectTop(z, 20, 20, 160, 160)}
          {line(
            z,
            [
              [44, 20],
              [44, 180],
            ],
            { strokeDasharray: '2 3' },
          )}
          {rectTop(z, 54, 30, 46, 22, 'currentColor')}
          {rectTop(z, 110, 64, 50, 22)}
          {rectTop(z, 54, 98, 46, 22)}
          {rectTop(z, 110, 136, 50, 22, 'currentColor')}
          {line(z, [
            [100, 41],
            [106, 41],
            [106, 75],
            [110, 75],
          ])}
          {line(z, [
            [135, 86],
            [135, 92],
            [96, 92],
            [96, 98],
          ])}
          {line(z, [
            [100, 109],
            [124, 109],
            [124, 136],
          ])}
        </g>
      );
    case 'network': {
      const nodes: [number, number][] = [
        [30, 30],
        [154, 30],
        [30, 154],
        [154, 154],
        [92, 18],
        [92, 166],
      ];
      return (
        <g>
          {nodes.map(([x, y], i) => (
            <g key={i}>
              {line(
                z,
                [
                  [x + 8, y + 8],
                  [100, 100],
                ],
                { strokeDasharray: '2 3' },
              )}
              {rectTop(z, x, y, 16, 16, 'currentColor')}
            </g>
          ))}
          {rectTop(z, 84, 84, 32, 32)}
          {rectTop(z, 92, 92, 16, 16, 'currentColor')}
        </g>
      );
    }
    case 'form':
      return (
        <g>
          {[28, 58, 88].map((y) => (
            <g key={y}>
              {rectTop(z, 28, y, 144, 20)}
              {rectTop(z, 34, y + 7, 30, 6, 'currentColor')}
            </g>
          ))}
          {rectTop(z, 28, 124, 60, 22, 'currentColor')}
          {rectTop(z, 104, 124, 68, 48)}
          {line(z, [
            [120, 148],
            [132, 160],
            [156, 134],
          ])}
        </g>
      );
    case 'shap':
      return (
        <g>
          {line(z, [
            [40, 24],
            [40, 176],
          ])}
          {[140, 104, 80, 58, 40].map((w, i) => (
            <g key={i}>{rectTop(z, 40, 30 + i * 30, w, 16, i === 0 ? 'currentColor' : 'none')}</g>
          ))}
        </g>
      );
    case 'play':
      return (
        <g>
          {rectTop(z, 24, 24, 152, 152)}
          <polygon
            points={onTop(z, [
              [78, 62],
              [140, 100],
              [78, 138],
            ])}
            fill="currentColor"
            {...S}
          />
        </g>
      );
  }
}

/** A thick plate with a sketch on its top face. */
export function Plate({ face, z = 0, h = 18 }: { face?: Face; z?: number; h?: number }) {
  return (
    <g>
      <Box o={[0, 0, z]} w={200} d={200} h={h} hatch />
      {face && <FaceDrawing face={face} z={z + h} />}
    </g>
  );
}

/** Standalone single-plate illustration (mobile cards, thumbnails). */
export function PlateArt({ face, className }: { face: Face; className?: string }) {
  return (
    <svg viewBox="-182 -30 364 240" className={className} aria-hidden>
      <Plate face={face} />
    </svg>
  );
}

/* ───────── small objects for step icons ───────── */
export function Cylinder({ cx, cy, z, r, h }: { cx: number; cy: number; z: number; r: number; h: number }) {
  const [tx, ty] = iso([cx, cy, z + h]);
  const [, by] = iso([cx, cy, z]);
  const rx = r * 1.2247;
  const ry = r * 0.7071;
  return (
    <g>
      <path d={`M${tx - rx} ${ty} L${tx - rx} ${by} A${rx} ${ry} 0 0 0 ${tx + rx} ${by} L${tx + rx} ${ty}`} fill={FILL} {...S} />
      <ellipse cx={tx} cy={ty} rx={rx} ry={ry} fill={FILL} {...S} />
    </g>
  );
}

/**
 * One brain hemisphere as an outline on the ground plane: a half-ellipse whose rim is
 * scalloped into five lobes (|sin| gives round lobes with sharp creases between them),
 * closed by a straight inner edge along the fissure. `side` mirrors it across x = 0.
 */
const BRAIN = { a: 36, b: 29, gap: 1.6 }; // half length (world y), hemisphere width (world x), half fissure width

/** Point of a hemisphere at angle phi and radius share r (1 = the outer rim). */
const brainAt = (side: 1 | -1, phi: number, r: number): [number, number] => [
  side * (BRAIN.gap + BRAIN.b * Math.cos(phi) * r),
  BRAIN.a * Math.sin(phi) * r,
];

function hemisphere(side: 1 | -1): [number, number][] {
  const n = 80;
  const ring: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const phi = -Math.PI / 2 + (Math.PI * i) / n;
    const rr = 0.85 + 0.15 * Math.sqrt(Math.abs(Math.sin(5 * phi)));
    ring.push(brainAt(side, phi, rr));
  }
  return ring;
}

/**
 * Sulci drawn on a hemisphere's top face, splitting it into gyri:
 * - four short grooves running inward from the creases between the rim lobes, each with a slight S-bend;
 * - one wavy groove running front to back through the middle of the hemisphere.
 * The grooves stop short of the rim and of each other, as in hand-drawn line art.
 */
function sulci(side: 1 | -1): [number, number][][] {
  const out: [number, number][][] = [];
  for (let k = 1; k <= 4; k++) {
    const crease = -Math.PI / 2 + (k * Math.PI) / 5; // where the rim dips between two lobes
    const bend = k % 2 ? 1 : -1;
    const line: [number, number][] = [];
    for (let j = 0; j <= 10; j++) {
      const t = j / 10;
      line.push(brainAt(side, crease + bend * 0.07 * Math.sin(t * Math.PI * 1.5), 0.79 - t * 0.2));
    }
    out.push(line);
  }
  const mid: [number, number][] = [];
  for (let j = 0; j <= 24; j++) {
    const t = j / 24;
    const y = BRAIN.a * (t - 0.5) * 1.05;
    const x = BRAIN.gap + BRAIN.b * (0.36 + 0.07 * Math.sin(t * Math.PI * 4));
    mid.push([side * x, y]);
  }
  out.push(mid);
  return out;
}

/**
 * A flat outline extruded to height h: bottom contour (only its front part stays visible),
 * opaque fill layers for the side wall, silhouette verticals at the screen-x extremes, then the top face.
 */
function Extruded({ ring, h, marks = [] }: { ring: [number, number][]; h: number; marks?: [number, number][][] }) {
  const at = (z: number) => ring.map(([x, y]) => iso([x, y, z]));
  const str = (ps: [number, number][]) => ps.map((p) => `${+p[0].toFixed(2)},${+p[1].toFixed(2)}`).join(' ');
  const top = at(h);
  const bottom = at(0);
  let lo = 0;
  let hi = 0;
  top.forEach((p, i) => {
    if (p[0] < top[lo][0]) lo = i;
    if (p[0] > top[hi][0]) hi = i;
  });
  const layers = Array.from({ length: h * 2 - 1 }, (_, k) => (k + 1) / 2);
  return (
    <g>
      <polygon points={str(bottom)} fill={FILL} {...S} />
      {layers.map((z) => (
        <polygon key={z} points={str(at(z))} fill={FILL} />
      ))}
      {[lo, hi].map((i) => (
        <line key={i} x1={top[i][0]} y1={top[i][1]} x2={bottom[i][0]} y2={bottom[i][1]} {...S} />
      ))}
      <polygon points={str(top)} fill={FILL} {...S} />
      {marks.map((m, i) => (
        <polyline key={i} points={onTop(h, m)} fill="none" {...S} strokeLinecap="round" />
      ))}
    </g>
  );
}

export type StepIconName = 'prepare' | 'explore' | 'learn' | 'evaluate';

export function StepIcon({ name, className }: { name: StepIconName; className?: string }) {
  return (
    <svg viewBox="-60 -62 120 112" className={className} aria-hidden>
      {name === 'prepare' && (
        <g>
          <Box o={[-30, -30, 0]} w={60} d={60} h={8} hatch />
          <Box o={[-22, -22, 16]} w={44} d={44} h={8} hatch />
          <Box o={[-14, -14, 32]} w={28} d={28} h={8} hatch />
        </g>
      )}
      {name === 'explore' && (
        <g>
          <Box o={[-32, -32, 0]} w={64} d={64} h={10} hatch />
          <Box o={[-24, 8, 10]} w={12} d={12} h={18} hatch />
          <Box o={[-6, 8, 10]} w={12} d={12} h={34} hatch />
          <Box o={[12, 8, 10]} w={12} d={12} h={24} hatch />
        </g>
      )}
      {name === 'learn' && (
        // brain: two extruded hemispheres split by the fissure (back one first, painter's order)
        <g transform="translate(0 9)">
          <Extruded ring={hemisphere(-1)} h={15} marks={sulci(-1)} />
          <Extruded ring={hemisphere(1)} h={15} marks={sulci(1)} />
        </g>
      )}
      {name === 'evaluate' && (
        <g>
          <Cylinder cx={0} cy={0} z={0} r={30} h={8} />
          <Cylinder cx={0} cy={0} z={14} r={30} h={8} />
          <Cylinder cx={0} cy={0} z={28} r={30} h={8} />
        </g>
      )}
    </svg>
  );
}

/** Federated network: hospital cubes around an aggregation server. */
export function HospitalNet({ className }: { className?: string }) {
  const sites: P3[] = [
    [-110, -40, 0],
    [-40, -110, 0],
    [60, -100, 0],
    [100, 0, 0],
    [40, 90, 0],
    [-70, 70, 0],
  ];
  return (
    <svg viewBox="-150 -110 300 210" className={className} aria-hidden>
      {sites.map((p, i) => {
        const [x1, y1] = iso([p[0] + 14, p[1] + 14, 0]);
        const [x2, y2] = iso([12, 12, 0]);
        return <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} {...S} strokeDasharray="2 3" />;
      })}
      {/* painter's order: farther boxes (smaller x+y) first */}
      {[...sites.map((o) => ({ o, s: 28, h: 22 })), { o: [-8, -8, 0] as P3, s: 40, h: 40 }]
        .sort((a, b) => a.o[0] + a.o[1] - (b.o[0] + b.o[1]))
        .map((b, i) => (
          <Box key={i} o={b.o} w={b.s} d={b.s} h={b.h} hatch />
        ))}
    </svg>
  );
}

/**
 * Growing stack for the layers scene. Each step drops a new plate ON TOP (it enters from the
 * upper right and travels down-left along the iso axis); the plate it covers fades to an
 * outline, and the whole stack eases down to stay centred. Plate states are data attributes
 * styled in CSS (`.iso-plate[data-state]`), so a step change is one cheap re-render and
 * every transition reverses when the step goes back.
 * `active` -1 = intro state (one plate, no step selected yet).
 */
export function IsoStack({ faces, active, className }: { faces: Face[]; active: number; className?: string }) {
  const H = 18;
  const SP = H + 16; // plate pitch along z
  const count = Math.max(1, active + 1);
  const shift = ((count - 1) * SP) / 2 + (active >= 0 ? 10 : 0);
  return (
    <svg viewBox="-182 -66 364 336" overflow="visible" className={className} aria-hidden>
      <g className="iso-shift" style={{ transform: `translateY(${shift}px)` }}>
        {faces.map((f, i) => {
          const b = box([0, 0, i * SP], 200, 200, H);
          const state = i < count - 1 ? 'ghost' : i === count - 1 ? 'top' : 'out';
          return (
            <g key={f} className="iso-plate" data-state={state}>
              <polygon className="iso-side" points={b.left} {...S} />
              <polygon className="iso-side iso-shade" points={b.right} {...S} />
              <polygon className="iso-side" points={b.top} {...S} />
              <g className="iso-face">
                <FaceDrawing face={f} z={i * SP + H} />
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
