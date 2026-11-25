import type { ReactNode } from 'react';
import { Reveals } from '@/components/motion/Reveals';

/**
 * Re-mounts on every navigation: fades the new page in and re-arms the reveals.
 * Opacity only, because a transform here would break position:fixed pinning inside.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="page-appear">
      {children}
      <Reveals />
    </div>
  );
}
