import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { href as toHref, isExternal } from '@/lib/i18n';

type Props = Omit<ComponentProps<'a'>, 'href'> & { href: string; locale: string; children: ReactNode };

/** Internal paths get the locale prefix; external URLs open in a new tab with a screen-reader hint. */
export function SmartLink({ href, locale, children, ...rest }: Props) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={toHref(locale, href)} {...rest}>
      {children}
    </Link>
  );
}
