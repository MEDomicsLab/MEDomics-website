'use client';
import { useEffect } from 'react';
import { prefersReduced } from '@/lib/motion';

/**
 * Mounted once per page (in template.tsx): every `.reveal` fades and lifts in when its top
 * crosses 85% of the viewport. Elements entering together are staggered by 120ms.
 * IntersectionObserver + CSS only, so no animation library ships for this.
 */
export function Reveals() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (prefersReduced() || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        entering
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
          .forEach((el, i) => {
            el.style.transitionDelay = `${i * 120}ms`;
            el.classList.add('is-in');
            io.unobserve(el);
          });
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
