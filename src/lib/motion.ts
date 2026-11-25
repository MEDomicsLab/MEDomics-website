/** The reference's gate for heavy effects. */
export const FULL_MOTION = '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
export const REDUCED = '(prefers-reduced-motion: reduce)';

export function canFullMotion() {
  return typeof window !== 'undefined' && window.matchMedia(FULL_MOTION).matches;
}
export function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED).matches;
}
