import type Lenis from 'lenis';

let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};
export const getLenis = () => instance;

/** Smooth-scroll to a y position (falls back to native scrolling). */
export function scrollToY(y: number) {
  if (instance) instance.scrollTo(y, { duration: 1.1 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}
