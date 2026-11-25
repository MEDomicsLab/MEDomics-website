import { PlateArt, type Face } from './iso/Iso';

const TONES = {
  green: ['var(--acc-green)', '#278a3a'],
  red: ['var(--acc-red)', '#b93032'],
  blue: ['var(--acc-blue)', '#1a65b8'],
  orange: ['var(--acc-orange)', '#c94e1b'],
  yellow: ['var(--acc-yellow)', '#b08f08'],
  /* community chat card: the platform's own blurple, so it reads as Discord at a glance */
  discord: ['#7289da', '#5a6fbf'],
} as const;

/**
 * Thumbnail tile: a flat field in one of the logo's colours with a two-shade diamond
 * pattern, and an ivory iso plate in dark line art on top.
 */
export function RhombusTile({ tone, face, className }: { tone: keyof typeof TONES; face: Face; className?: string }) {
  const [base, shade] = TONES[tone];
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={{ background: base }} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(45deg, ${shade} 25%, transparent 25%, transparent 75%, ${shade} 75%), linear-gradient(-45deg, ${shade} 25%, transparent 25%, transparent 75%, ${shade} 75%)`,
          backgroundSize: '34px 20px',
          opacity: 0.55,
        }}
      />
      <div className="off-blue absolute inset-0 flex items-center justify-center p-6 text-[#1b2433] [--background:var(--ivory)] [--foreground:#1b2433]">
        <PlateArt
          face={face}
          className="h-full max-h-[86%] w-auto drop-shadow-none transition-transform duration-500 group-hover:-translate-y-1"
        />
      </div>
    </div>
  );
}
