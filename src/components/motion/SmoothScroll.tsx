'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { prefersReduced } from '@/lib/motion';
import { setLenis, getLenis } from '@/lib/lenis';

/** Ask scroll-driven scenes to recompute (fonts loaded, route changed, images in). */
export const requestRefresh = () => window.dispatchEvent(new Event('md:refresh'));

/**
 * One Lenis instance for the whole app (lerp .08, anchor offset −80px). It runs its own
 * rAF so GSAP is never needed up front; the desktop pinned scene loads GSAP on demand and
 * subscribes to Lenis itself. Disabled for reduced motion.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add('js-motion');
    document.fonts?.ready.then(requestRefresh);
    window.addEventListener('load', requestRefresh);
    if (prefersReduced()) return () => window.removeEventListener('load', requestRefresh);
    const lenis = new Lenis({ lerp: 0.08, anchors: { offset: -80 }, autoRaf: true });
    setLenis(lenis);
    return () => {
      window.removeEventListener('load', requestRefresh);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // New route: jump to top (or to the hash) and let scenes recompute.
  useEffect(() => {
    const lenis = getLenis();
    const hash = window.location.hash;
    const target = hash ? document.querySelector(hash) : null;
    if (target) {
      requestAnimationFrame(() =>
        lenis ? lenis.scrollTo(target as HTMLElement, { offset: -80, immediate: true }) : target.scrollIntoView(),
      );
    } else {
      lenis?.scrollTo(0, { immediate: true });
    }
    const id = requestAnimationFrame(requestRefresh);
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
