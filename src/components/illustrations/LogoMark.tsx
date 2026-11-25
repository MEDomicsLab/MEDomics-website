/**
 * Flat rendition of the MEDomics molecule mark (derived from media/logo.png).
 * `mono` draws everything in currentColor for blue sections; otherwise the
 * outer atoms keep the brand colors.
 */
const atoms = [
  { cx: 46.2, cy: 12.8, r: 12.2, c: 'var(--acc-green)' },
  { cx: 12.5, cy: 32.2, r: 9.5, c: 'var(--acc-red)' },
  { cx: 76.3, cy: 35.8, r: 7.5, c: 'var(--acc-yellow)' },
  { cx: 13.7, cy: 78.3, r: 12.5, c: 'var(--acc-blue)' },
  { cx: 87, cy: 81.2, r: 8.7, c: 'var(--acc-orange)' },
];
const center = { cx: 49.2, cy: 59.2, r: 9.7 };

export function LogoMark({ size = 24, mono = false, className }: { size?: number; mono?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 100 94" width={size} height={size * 0.94} className={className} aria-hidden>
      {atoms.map((a, i) => (
        <line key={i} x1={center.cx} y1={center.cy} x2={a.cx} y2={a.cy} stroke="currentColor" strokeWidth={3.2} />
      ))}
      {atoms.map((a, i) => (
        <circle key={i} cx={a.cx} cy={a.cy} r={a.r} fill={mono ? 'currentColor' : a.c} />
      ))}
      <circle cx={center.cx} cy={center.cy} r={center.r} fill="var(--background)" stroke="currentColor" strokeWidth={3.2} />
    </svg>
  );
}
