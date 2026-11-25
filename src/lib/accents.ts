import { rng } from './rng';

/** The five logo colours (tokens in globals.css), used as accents in the pixel art. */
const LOGO_ACCENTS = ['var(--acc-green)', 'var(--acc-blue)', 'var(--acc-orange)', 'var(--acc-red)', 'var(--acc-yellow)'];

/**
 * Returns a picker that gives about one cell in `every` a logo colour (and `undefined`, i.e. the
 * ink colour, otherwise). It runs on its own seeded sequence, so the art's shape is unchanged and
 * the server and browser render the same cells.
 */
export function accentPicker(seed: number, every = 7) {
  const r = rng(seed * 7919 + 1);
  return () => (r() < 1 / every ? LOGO_ACCENTS[Math.floor(r() * LOGO_ACCENTS.length)] : undefined);
}
