'use client';
import { useEffect, useId, useRef } from 'react';
import { prefersReduced } from '@/lib/motion';

/*
 * A scripted lookalike of MEDomics' Learning-module canvas (a React Flow scene in the app):
 * a cursor drags five nodes from the palette, wires them into a pipeline, presses Run, and the
 * results panel opens with a ROC curve (plus the metrics table and confusion matrix when there
 * is room). Everything is one SVG per layout, so text, nodes, links and cursor share a single
 * coordinate system and scale together. The server renders the final frame (no-JS and
 * reduced-motion visitors see the finished experiment); the client rewinds it and plays the
 * timeline each time the scene scrolls into view.
 *
 * Example numbers (illustrative, internally consistent): holdout n = 200 (80 positive),
 * TP 66 · FN 14 · FP 18 · TN 102 → accuracy .8400, recall .8250, precision .7857, F1 .8049,
 * kappa .6694, MCC .6700. ROC: binormal curve (b = 0.75) with AUC .9124, passing through the
 * operating point (FPR .15, TPR .825).
 */

type Kind = 'dataset' | 'split' | 'model' | 'train' | 'analysis';
type Pt = [number, number];
type Rect = { x: number; y: number; w: number; h: number };

const KINDS: Kind[] = ['dataset', 'split', 'model', 'train', 'analysis'];
const NODE: Record<Kind, { type: string; id: string; field?: string }> = {
  dataset: { type: 'Dataset', id: 'Dataset', field: 'Custom data file' },
  split: { type: 'Split', id: 'Split' },
  model: { type: 'Model', id: 'LogR', field: 'Logistic Regression' },
  train: { type: 'Train model', id: 'Train Model' },
  analysis: { type: 'Analysis', id: 'Analysis', field: 'Plot metric: auc' },
};

const ROC: Pt[] = [
  [0, 0],
  [0.001, 0.267],
  [0.003, 0.357],
  [0.006, 0.425],
  [0.01, 0.48],
  [0.015, 0.527],
  [0.02, 0.561],
  [0.03, 0.612],
  [0.04, 0.649],
  [0.05, 0.678],
  [0.065, 0.712],
  [0.08, 0.739],
  [0.1, 0.768],
  [0.125, 0.797],
  [0.15, 0.821],
  [0.175, 0.84],
  [0.2, 0.856],
  [0.25, 0.883],
  [0.3, 0.903],
  [0.35, 0.92],
  [0.4, 0.934],
  [0.5, 0.955],
  [0.6, 0.97],
  [0.7, 0.982],
  [0.8, 0.99],
  [0.9, 0.996],
  [0.95, 0.998],
  [1, 1],
];
const OPERATING: Pt = [0.15, 0.825];
const METRICS: [string, string][] = [
  ['Accuracy', '0.8400'],
  ['AUC', '0.9124'],
  ['Recall', '0.8250'],
  ['Prec.', '0.7857'],
  ['F1', '0.8049'],
  ['Kappa', '0.6694'],
  ['MCC', '0.6700'],
];

/* app palette (light UI, React Flow defaults) */
const C = {
  canvas: '#ffffff',
  dot: '#d4d4d8',
  rail: '#f4f4f5',
  line: '#e4e4e7',
  node: '#f4f4f5',
  nodeLine: '#d4d4d8',
  text: '#3f3f46',
  mute: '#71717a',
  edge: '#b1b1b7',
  accent: '#3b82f6',
  tab: '#6366f1',
  ok: '#22c55e',
};

type Layout = {
  key: 'wide' | 'compact';
  W: number;
  H: number;
  dir: 'lr' | 'tb';
  nodeW: number;
  rail: Rect;
  chips: Rect[];
  chipLabels: boolean;
  canvas: Rect;
  nodes: Pt[];
  run: Pt;
  panel: Rect;
  full: boolean;
  cursor0: Pt;
};

const WIDE: Layout = {
  key: 'wide',
  W: 820,
  H: 520,
  dir: 'lr',
  nodeW: 138,
  rail: { x: 0, y: 0, w: 100, h: 520 },
  chips: KINDS.map((_, i) => ({ x: 8, y: 40 + i * 40, w: 84, h: 30 })),
  chipLabels: true,
  canvas: { x: 100, y: 0, w: 720, h: 520 },
  nodes: [
    [114, 62],
    [254, 170],
    [394, 62],
    [534, 170],
    [674, 62],
  ],
  run: [778, 12],
  panel: { x: 116, y: 272, w: 692, h: 236 },
  full: true,
  cursor0: [610, 470],
};

const COMPACT: Layout = {
  key: 'compact',
  W: 400,
  H: 660,
  dir: 'tb',
  nodeW: 170,
  rail: { x: 0, y: 0, w: 400, h: 44 },
  chips: KINDS.map((_, i) => ({ x: 6 + i * 78, y: 8, w: 74, h: 28 })),
  chipLabels: true,
  canvas: { x: 0, y: 44, w: 400, h: 616 },
  nodes: [
    [100, 66],
    [130, 172],
    [100, 242],
    [130, 348],
    [100, 418],
  ],
  run: [362, 56],
  panel: { x: 12, y: 512, w: 376, h: 136 },
  full: false,
  cursor0: [300, 600],
};

const nodeH = (k: Kind) => (NODE[k].field ? 78 : 44);

function handle(l: Layout, i: number, side: 'in' | 'out'): Pt {
  const [x, y] = l.nodes[i];
  const h = nodeH(KINDS[i]);
  if (l.dir === 'lr') return side === 'in' ? [x, y + h / 2] : [x + l.nodeW, y + h / 2];
  return side === 'in' ? [x + l.nodeW / 2, y] : [x + l.nodeW / 2, y + h];
}

/** React Flow-style bezier between a source and a target handle. */
function edgePath(a: Pt, b: Pt, dir: 'lr' | 'tb') {
  if (dir === 'lr') {
    const off = Math.max(36, Math.abs(b[0] - a[0]) * 0.5);
    return `M${a[0]} ${a[1]} C${a[0] + off} ${a[1]} ${b[0] - off} ${b[1]} ${b[0]} ${b[1]}`;
  }
  const off = Math.max(18, Math.abs(b[1] - a[1]) * 0.5);
  return `M${a[0]} ${a[1]} C${a[0]} ${a[1] + off} ${b[0]} ${b[1] - off} ${b[0]} ${b[1]}`;
}

/* ───────── small app-like glyphs (20×20 box) ───────── */
function Glyph({ kind, x, y, s = 1 }: { kind: Kind; x: number; y: number; s?: number }) {
  const st = { fill: 'none', stroke: C.text, strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {kind === 'dataset' && (
        <g {...st}>
          <ellipse cx={10} cy={4.5} rx={7} ry={2.6} fill={C.text} />
          <path d="M3 4.5v11c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-11M3 8.2c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6M3 11.9c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6" />
        </g>
      )}
      {kind === 'split' && (
        <g {...st}>
          <circle cx={10} cy={10.5} r={7.5} />
          <path d="M10 10.5V3a7.5 7.5 0 0 1 7.5 7.5Z" fill={C.text} />
        </g>
      )}
      {kind === 'model' && (
        <g {...st}>
          <path d="M3 16 9 3l8 13ZM9 3l1 13M3 16l14-6" />
        </g>
      )}
      {kind === 'train' && (
        <g {...st}>
          {[4, 10, 16].map((yy) => (
            <circle key={`a${yy}`} cx={4} cy={yy} r={1.6} fill={C.text} />
          ))}
          {[7, 13].map((yy) => (
            <circle key={`b${yy}`} cx={16} cy={yy} r={1.6} fill={C.text} />
          ))}
          <path d="M5.6 4 14.4 7M5.6 4l8.8 9M5.6 10l8.8-3M5.6 10l8.8 3M5.6 16l8.8-9M5.6 16l8.8-3" strokeWidth={0.9} />
        </g>
      )}
      {kind === 'analysis' && (
        <g {...st}>
          <path d="M3 17h14" />
          <rect x={4.5} y={10} width={3} height={7} fill={C.text} />
          <rect x={9} y={5} width={3} height={12} fill={C.text} />
          <rect x={13.5} y={8} width={3} height={9} fill={C.text} />
        </g>
      )}
    </g>
  );
}

/** One node card at the origin, with handles, a running ring and a done badge. */
function Card({ kind, w, dir }: { kind: Kind; w: number; dir: 'lr' | 'tb' }) {
  const n = NODE[kind];
  const h = nodeH(kind);
  const hasIn = kind !== 'dataset';
  const hasOut = kind !== 'analysis';
  const hp = (side: 'in' | 'out'): Pt => (dir === 'lr' ? [side === 'in' ? 0 : w, h / 2] : [w / 2, side === 'in' ? 0 : h]);
  return (
    <g>
      <rect x={1} y={2} width={w} height={h} rx={4} fill="#000" opacity={0.07} />
      <rect width={w} height={h} rx={4} fill={C.node} stroke={C.nodeLine} />
      <Glyph kind={kind} x={9} y={12} />
      <text x={37} y={18} fontSize={10} fill={C.mute}>
        {n.type}
      </text>
      <text x={37} y={33} fontSize={10.5} fill={C.text}>
        ID: <tspan fontWeight={600}>{n.id}</tspan>
      </text>
      <path d={`M${w - 14} 9l6 6m0-6-6 6`} stroke={C.mute} strokeWidth={1.2} />
      {hasOut && <path d={`M${w - 13} 27v7l6-3.5Z`} fill="none" stroke={C.mute} strokeWidth={1} />}
      {n.field && (
        <g>
          <rect x={8} y={46} width={w - 16} height={24} rx={3} fill="#fff" stroke={C.line} />
          <text x={15} y={62} fontSize={10} fill={C.text}>
            {n.field}
          </text>
          {kind !== 'analysis' && <path d={`M${w - 20} 56l4 4 4-4`} fill="none" stroke={C.mute} strokeWidth={1.2} />}
        </g>
      )}
      {hasIn && <circle className="ps-hin" cx={hp('in')[0]} cy={hp('in')[1]} r={3.5} fill={C.text} />}
      {hasOut && <circle className="ps-hout" cx={hp('out')[0]} cy={hp('out')[1]} r={3.5} fill={C.text} />}
      <rect
        className="ps-ring"
        x={-3}
        y={-3}
        width={w + 6}
        height={h + 6}
        rx={6}
        fill="none"
        stroke={C.accent}
        strokeWidth={2}
        opacity={0}
      />
      <g className="ps-done" transform={`translate(${w - 2} -2)`}>
        <circle r={7} fill={C.ok} />
        <path d="M-3 0l2 2 4-4" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

const rocPath = (x0: number, y0: number, s: number) =>
  ROC.map(([f, t], i) => `${i ? 'L' : 'M'}${(x0 + f * s).toFixed(1)} ${(y0 + s - t * s).toFixed(1)}`).join(' ');

/** ROC plot: axes, chance line, area, curve (drawn by the timeline), operating point. */
function RocPlot({ x, y, s, ticks }: { x: number; y: number; s: number; ticks: boolean }) {
  const line = rocPath(x, y, s);
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} fill="#fafafa" stroke={C.line} />
      {ticks &&
        [0.25, 0.5, 0.75].map((t) => (
          <g key={t} stroke={C.line}>
            <line x1={x + t * s} y1={y} x2={x + t * s} y2={y + s} />
            <line x1={x} y1={y + s - t * s} x2={x + s} y2={y + s - t * s} />
          </g>
        ))}
      <line x1={x} y1={y + s} x2={x + s} y2={y} stroke="#a1a1aa" strokeDasharray="3 3" />
      <path className="ps-roc-area" d={`${line} L${x + s} ${y + s} L${x} ${y + s} Z`} fill={C.accent} opacity={0.1} />
      <path
        className="ps-roc-line"
        d={line}
        pathLength={1}
        strokeDasharray="1 1"
        fill="none"
        stroke={C.accent}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle
        className="ps-roc-dot"
        cx={x + OPERATING[0] * s}
        cy={y + s - OPERATING[1] * s}
        r={3.5}
        fill="#fff"
        stroke={C.accent}
        strokeWidth={1.6}
      />
      <g fontSize={9} fill={C.mute}>
        <text x={x} y={y + s + 12} textAnchor="middle">
          0
        </text>
        <text x={x + s} y={y + s + 12} textAnchor="middle">
          1
        </text>
        <text x={x - 5} y={y + 3} textAnchor="end">
          1
        </text>
        {ticks && (
          <text x={x + s / 2} y={y + s + 12} textAnchor="middle">
            0.5
          </text>
        )}
        {ticks && (
          <text x={x - 5} y={y + s / 2 + 3} textAnchor="end">
            0.5
          </text>
        )}
      </g>
    </g>
  );
}

function Results({ l }: { l: Layout }) {
  const p = l.panel;
  return (
    <g transform={`translate(${p.x} ${p.y})`}>
      <g className="ps-results">
        <rect x={1} y={3} width={p.w} height={p.h} rx={6} fill="#000" opacity={0.07} />
        <rect width={p.w} height={p.h} rx={6} fill="#fff" stroke={C.line} />
        {l.full ? (
          <g>
            {/* header: pipeline name + node tabs, as in the app's results panel */}
            <path d="M12 15l4 4 4-4" fill="none" stroke={C.text} strokeWidth={1.4} />
            <text x={28} y={22} fontSize={12} fontWeight={700} fill={C.text}>
              Pipeline 1
            </text>
            {['Dataset', 'Split', 'LogR', 'Train Model', 'Analysis'].map((t, i) => {
              const on = t === 'Analysis';
              return (
                <g key={t} transform={`translate(${110 + i * 70} 6)`}>
                  <rect width={66} height={22} rx={4} fill={on ? C.tab : '#fff'} stroke={on ? C.tab : C.line} />
                  <text x={33} y={15} fontSize={10} textAnchor="middle" fill={on ? '#fff' : C.text}>
                    {t}
                  </text>
                </g>
              );
            })}
            <line x1={0} y1={34} x2={p.w} y2={34} stroke={C.line} />
            {/* ROC */}
            <text x={34} y={50} fontSize={10} fontWeight={600} fill={C.text}>
              ROC curve · holdout set
            </text>
            <RocPlot x={46} y={60} s={142} ticks />
            <text x={117} y={228} fontSize={9.5} textAnchor="middle" fill={C.mute}>
              False positive rate
            </text>
            <text transform="translate(18 131) rotate(-90)" fontSize={9.5} textAnchor="middle" fill={C.mute}>
              True positive rate
            </text>
            <g transform="translate(100 182)">
              <line x1={0} y1={-3} x2={12} y2={-3} stroke={C.accent} strokeWidth={2} />
              <text x={16} y={0} fontSize={9.5} fill={C.text}>
                LogR · AUC 0.912
              </text>
            </g>
            {/* metrics table (one row per model, as in the app) */}
            <g className="ps-metric" transform="translate(240 46)">
              <rect width={436} height={22} fill="#fafafa" stroke={C.line} />
              <text x={8} y={15} fontSize={9.5} fontWeight={700} fill={C.text}>
                Name
              </text>
              {METRICS.map(([k], i) => (
                <text key={k} x={150 + i * 44} y={15} fontSize={9.5} fontWeight={700} textAnchor="middle" fill={C.text}>
                  {k}
                </text>
              ))}
              <rect y={22} width={436} height={24} fill="#fff" stroke={C.line} />
              <text x={8} y={38} fontSize={10} fill={C.text}>
                Logistic Regression
              </text>
              {METRICS.map(([k, v], i) => (
                <text key={k} x={150 + i * 44} y={38} fontSize={10} textAnchor="middle" fill={C.text} fontWeight={k === 'AUC' ? 700 : 400}>
                  {v}
                </text>
              ))}
            </g>
            {/* confusion matrix + rates */}
            <g className="ps-metric" transform="translate(240 108)">
              <text x={0} y={0} fontSize={10} fontWeight={600} fill={C.text}>
                Confusion matrix · n = 200
              </text>
              {[
                { r: 0, c: 0, v: 102, a: 0.85 },
                { r: 0, c: 1, v: 18, a: 0.15 },
                { r: 1, c: 0, v: 14, a: 0.12 },
                { r: 1, c: 1, v: 66, a: 0.55 },
              ].map((cell) => (
                <g key={`${cell.r}${cell.c}`} transform={`translate(${62 + cell.c * 46} ${12 + cell.r * 46})`}>
                  <rect width={46} height={46} fill={C.accent} fillOpacity={cell.a} stroke="#fff" />
                  <text x={23} y={27} fontSize={11} textAnchor="middle" fontWeight={600} fill={cell.a > 0.5 ? '#fff' : C.text}>
                    {cell.v}
                  </text>
                </g>
              ))}
              <g fontSize={9} fill={C.mute}>
                <text x={56} y={39} textAnchor="end">
                  Actual 0
                </text>
                <text x={56} y={85} textAnchor="end">
                  Actual 1
                </text>
                <text x={85} y={116} textAnchor="middle">
                  Pred. 0
                </text>
                <text x={131} y={116} textAnchor="middle">
                  Pred. 1
                </text>
              </g>
              <g fontSize={10} fill={C.text}>
                <text x={186} y={34}>
                  Sensitivity <tspan fontWeight={700}>0.8250</tspan>
                </text>
                <text x={186} y={54}>
                  Specificity <tspan fontWeight={700}>0.8500</tspan>
                </text>
                <text x={186} y={74}>
                  Threshold optimised for F1
                </text>
                <text x={186} y={94} fill={C.mute}>
                  Model ready to finalize as .medmodel
                </text>
              </g>
            </g>
          </g>
        ) : (
          <g>
            <text x={12} y={18} fontSize={11} fontWeight={700} fill={C.text}>
              Pipeline 1 · Analysis
            </text>
            <line x1={0} y1={26} x2={p.w} y2={26} stroke={C.line} />
            <RocPlot x={34} y={34} s={88} ticks={false} />
            <text transform="translate(18 78) rotate(-90)" fontSize={9} textAnchor="middle" fill={C.mute}>
              TPR
            </text>
            <g className="ps-metric" transform="translate(150 50)">
              <text fontSize={10} fill={C.mute}>
                ROC · Logistic Regression
              </text>
              <text y={30} fontSize={22} fontWeight={600} fill={C.text}>
                AUC 0.912
              </text>
              <text y={52} fontSize={10} fill={C.mute}>
                Holdout set · n = 200
              </text>
              <text y={68} fontSize={10} fill={C.mute}>
                Accuracy 0.840 · F1 0.805
              </text>
            </g>
          </g>
        )}
      </g>
    </g>
  );
}

function Stage({ l, uid }: { l: Layout; uid: string }) {
  const grid = `${uid}-${l.key}-grid`;
  const clip = `${uid}-${l.key}-clip`;
  return (
    <svg viewBox={`0 0 ${l.W} ${l.H}`} className={`ps-stage ps-${l.key} block h-auto w-full`} aria-hidden data-layout={l.key}>
      <defs>
        <pattern id={grid} width={16} height={16} patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={0.9} fill={C.dot} />
        </pattern>
        <clipPath id={clip}>
          <rect width={l.W} height={l.H} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width={l.W} height={l.H} fill={C.canvas} />
        <rect x={l.canvas.x} y={l.canvas.y} width={l.canvas.w} height={l.canvas.h} fill={`url(#${grid})`} />
        <rect className="ps-progress" x={l.canvas.x} y={l.canvas.y} width={l.canvas.w} height={3} fill={C.accent} opacity={0} />

        {/* node palette */}
        <rect x={l.rail.x} y={l.rail.y} width={l.rail.w} height={l.rail.h} fill={C.rail} />
        <line x1={l.dir === 'lr' ? l.rail.w : 0} y1={l.dir === 'lr' ? 0 : l.rail.h} x2={l.rail.w} y2={l.rail.h} stroke={C.line} />
        {l.dir === 'lr' && (
          <text x={12} y={24} fontSize={11} fontWeight={700} fill={C.text}>
            Nodes
          </text>
        )}
        {l.chips.map((c, i) => (
          <g key={i} data-chip={i} transform={`translate(${c.x} ${c.y})`}>
            <rect width={c.w} height={c.h} rx={4} fill="#fff" stroke={C.line} />
            <Glyph kind={KINDS[i]} x={l.key === 'wide' ? 6 : 4} y={(c.h - 16) / 2} s={0.8} />
            {l.chipLabels && (
              <text x={l.key === 'wide' ? 26 : 22} y={c.h / 2 + 3.5} fontSize={l.key === 'wide' ? 10.5 : 9} fill={C.text}>
                {NODE[KINDS[i]].type}
              </text>
            )}
          </g>
        ))}

        {/* run button (top right of the canvas) */}
        <g className="ps-run" transform={`translate(${l.run[0]} ${l.run[1]})`}>
          <g className="ps-run-btn">
            <rect width={28} height={28} rx={6} fill={C.accent} />
            <path d="M11 8.5v11l9-5.5Z" fill="#fff" />
          </g>
        </g>

        {/* links (under the nodes) */}
        {KINDS.slice(0, -1).map((_, i) => (
          <path
            key={i}
            data-edge={i}
            className="ps-edge"
            d={edgePath(handle(l, i, 'out'), handle(l, i + 1, 'in'), l.dir)}
            fill="none"
            stroke={C.edge}
            strokeWidth={1.6}
          />
        ))}

        {/* nodes */}
        {KINDS.map((k, i) => (
          <g key={k} transform={`translate(${l.nodes[i][0]} ${l.nodes[i][1]})`}>
            <g data-node={i} className="ps-card">
              <Card kind={k} w={l.nodeW} dir={l.dir} />
            </g>
          </g>
        ))}

        <Results l={l} />

        {/* cursor (hotspot at its origin) */}
        <g className="ps-cursor" opacity={0}>
          <g className="ps-cursor-art">
            <path d="M0 0v17l4.6-4.2 3.2 7 3-1.3-3.2-6.8H14Z" fill="#fff" stroke="#18181b" strokeWidth={1.2} strokeLinejoin="round" />
          </g>
          <circle className="ps-press" r={9} fill="none" stroke={C.accent} strokeWidth={1.5} opacity={0} />
        </g>
      </g>
    </svg>
  );
}

type Gsap = typeof import('gsap').gsap;

/** Build the animation for one rendered layout. Returns [reset, timeline]. */
function build(gsap: Gsap, svg: SVGSVGElement, l: Layout) {
  const q = <T extends Element>(s: string) => Array.from(svg.querySelectorAll<T>(s));
  const cards = KINDS.map((_, i) => svg.querySelector<SVGGElement>(`[data-node="${i}"]`)!);
  const edges = q<SVGPathElement>('.ps-edge');
  const cursor = svg.querySelector<SVGGElement>('.ps-cursor')!;
  const art = svg.querySelector<SVGGElement>('.ps-cursor-art')!;
  const press = svg.querySelector<SVGCircleElement>('.ps-press')!;
  const runBtn = svg.querySelector<SVGGElement>('.ps-run-btn')!;
  const progress = svg.querySelector<SVGRectElement>('.ps-progress')!;
  const results = svg.querySelector<SVGGElement>('.ps-results')!;
  const rings = q<SVGRectElement>('.ps-ring');
  const dones = q<SVGGElement>('.ps-done');
  const rocLine = q<SVGPathElement>('.ps-roc-line');
  const rocArea = q<SVGPathElement>('.ps-roc-area');
  const rocDot = q<SVGCircleElement>('.ps-roc-dot');
  const metrics = q<SVGGElement>('.ps-metric');
  const finalD = edges.map((e) => e.getAttribute('d') ?? '');

  const reset = () => {
    gsap.set(cards, { autoAlpha: 0, x: 0, y: 0, scale: 1 });
    gsap.set(edges, { autoAlpha: 0, stroke: C.edge });
    edges.forEach((e, i) => {
      e.classList.remove('ps-flow');
      e.setAttribute('d', finalD[i]);
    });
    gsap.set(cursor, { x: l.cursor0[0], y: l.cursor0[1], autoAlpha: 1 });
    gsap.set(art, { scale: 1, transformOrigin: '0 0' });
    gsap.set(press, { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%' });
    gsap.set(runBtn, { scale: 1, transformOrigin: '50% 50%' });
    gsap.set(progress, { attr: { width: 0 }, autoAlpha: 0 });
    gsap.set(results, { y: l.H - l.panel.y + 12 });
    gsap.set(rings, { autoAlpha: 0 });
    gsap.set(dones, { autoAlpha: 0, scale: 0.3, transformOrigin: '50% 50%' });
    gsap.set(rocLine, { strokeDashoffset: 1 });
    gsap.set([...rocArea, ...rocDot, ...metrics], { autoAlpha: 0 });
  };

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  const move = (p: Pt, d = 0.45) => tl.to(cursor, { x: p[0], y: p[1], duration: d });
  const click = () =>
    tl
      .to(art, { scale: 0.82, duration: 0.07, ease: 'power1.out' })
      .fromTo(press, { autoAlpha: 0.9, scale: 0.4 }, { autoAlpha: 0, scale: 1.4, duration: 0.35, ease: 'power1.out' }, '<')
      .to(art, { scale: 1, duration: 0.1 }, '<0.07');

  tl.to({}, { duration: 0.3 });

  // 1. drag each node from the palette onto the canvas
  KINDS.forEach((_, i) => {
    const c = l.chips[i];
    const grab: Pt = [c.x + 20, c.y + c.h / 2];
    const [nx, ny] = l.nodes[i];
    const off: Pt = [18, 16]; // where the cursor holds the card
    move(grab, i ? 0.36 : 0.5);
    tl.to(art, { scale: 0.85, duration: 0.07 })
      .set(cards[i], { x: grab[0] - off[0] - nx, y: grab[1] - off[1] - ny, scale: 0.92, transformOrigin: `${off[0]}px ${off[1]}px` })
      .to(cards[i], { autoAlpha: 0.75, duration: 0.08 })
      .addLabel(`drop${i}`)
      .to(cursor, { x: nx + off[0], y: ny + off[1], duration: 0.48 }, `drop${i}`)
      .to(cards[i], { x: 0, y: 0, duration: 0.48 }, `drop${i}`)
      .to(cards[i], { autoAlpha: 1, scale: 1, duration: 0.14, ease: 'back.out(2)' })
      .to(art, { scale: 1, duration: 0.07 }, '<');
  });

  // 2. wire them: drag from each source handle to the next node's target handle
  edges.forEach((e, i) => {
    const a = handle(l, i, 'out');
    const b = handle(l, i + 1, 'in');
    const p = { t: 0 };
    move(a, 0.32);
    tl.to(art, { scale: 0.85, duration: 0.07 })
      .set(e, { autoAlpha: 1, stroke: C.accent, attr: { d: edgePath(a, a, l.dir) } })
      .to(p, {
        t: 1,
        duration: 0.42,
        onUpdate: () => {
          const pt: Pt = [a[0] + (b[0] - a[0]) * p.t, a[1] + (b[1] - a[1]) * p.t];
          e.setAttribute('d', edgePath(a, pt, l.dir));
          gsap.set(cursor, { x: pt[0], y: pt[1] });
        },
      })
      .set(e, { attr: { d: finalD[i] } })
      .to(e, { stroke: C.edge, duration: 0.2 })
      .to(art, { scale: 1, duration: 0.07 }, '<');
  });

  // 3. press Run
  move([l.run[0] + 15, l.run[1] + 16], 0.55);
  click();
  tl.to(runBtn, { scale: 0.88, duration: 0.08 }, '<')
    .to(runBtn, { scale: 1, duration: 0.15 })
    .addLabel('run')
    .to(cursor, { x: l.cursor0[0], y: l.cursor0[1], autoAlpha: 0, duration: 0.6 }, 'run')
    .set(progress, { autoAlpha: 1 }, 'run')
    .to(progress, { attr: { width: l.canvas.w }, duration: 2.1, ease: 'power1.inOut' }, 'run')
    .call(() => edges.forEach((e) => e.classList.add('ps-flow')), undefined, 'run')
    .to(edges, { stroke: C.accent, duration: 0.2 }, 'run');
  // nodes run one after another: blue ring while running, green check when done
  KINDS.forEach((_, i) => {
    const at = `run+=${0.1 + i * 0.4}`;
    tl.to(rings[i], { autoAlpha: 1, duration: 0.12 }, at)
      .to(rings[i], { autoAlpha: 0, duration: 0.15 }, `${at}+=0.38`)
      .to(dones[i], { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(3)' }, `${at}+=0.38`);
  });
  tl.call(() => edges.forEach((e) => e.classList.remove('ps-flow')), undefined, 'run+=2.15')
    .to(edges, { stroke: C.edge, duration: 0.3 }, 'run+=2.15')
    .to(progress, { autoAlpha: 0, duration: 0.25 }, 'run+=2.15');

  // 4. results panel: slides up, ROC draws, numbers appear
  tl.addLabel('res', 'run+=2.2')
    .to(results, { y: 0, duration: 0.6, ease: 'power3.out' }, 'res')
    .to(rocLine, { strokeDashoffset: 0, duration: 1, ease: 'power1.inOut' }, 'res+=0.45')
    .to(rocArea, { autoAlpha: 0.1, duration: 0.6 }, 'res+=0.9')
    .to(rocDot, { autoAlpha: 1, duration: 0.2 }, 'res+=1.3')
    .to(metrics, { autoAlpha: 1, duration: 0.35, stagger: 0.18, ease: 'power1.out' }, 'res+=0.7');

  return { reset, tl };
}

/**
 * The final-CTA scene. Plays once each time it comes into view (and rewinds when it leaves);
 * reduced-motion visitors keep the static final frame.
 */
export function PipelineScene({ label, className }: { label: string; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;
    let alive = true;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let current: { key: string; reset: () => void; tl: gsap.core.Timeline } | null = null;

    import('gsap').then(({ gsap }) => {
      if (!alive) return;
      let inView = false;
      /** The layout shown by the container query (the other one is display:none). */
      const pick = () => {
        const svg = Array.from(el.querySelectorAll<SVGSVGElement>('.ps-stage')).find((s) => s.getBoundingClientRect().width > 0);
        const key = svg?.dataset.layout;
        if (!svg || !key || current?.key === key) return;
        current?.tl.kill();
        const { reset, tl } = build(gsap, svg, key === 'wide' ? WIDE : COMPACT);
        current = { key, reset, tl };
        reset();
        if (inView) tl.restart();
      };
      pick();
      ro = new ResizeObserver(pick);
      ro.observe(el);
      io = new IntersectionObserver(
        ([e]) => {
          if (!current) return;
          if (e.isIntersecting && !inView) {
            inView = true;
            current.reset();
            current.tl.restart();
          } else if (!e.isIntersecting && inView) {
            inView = false;
            current.tl.pause();
            current.reset();
          }
        },
        { threshold: 0.35 },
      );
      io.observe(el);
    });

    return () => {
      alive = false;
      io?.disconnect();
      ro?.disconnect();
      current?.tl.kill();
    };
  }, []);

  return (
    <div ref={root} className={`ps ${className ?? ''}`} role="img" aria-label={label}>
      <Stage l={WIDE} uid={uid} />
      <Stage l={COMPACT} uid={uid} />
    </div>
  );
}
