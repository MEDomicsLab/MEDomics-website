import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SmartLink } from './SmartLink';
import { PixelFill } from './PixelFill';

type Variant = 'primary' | 'secondary';

export function Button({
  href,
  locale,
  children,
  variant = 'primary',
  className,
  icon,
  download,
}: {
  href: string;
  locale: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: ReactNode;
  download?: boolean;
}) {
  return (
    <SmartLink
      href={href}
      locale={locale}
      className={cn('btn', variant === 'secondary' && 'btn-secondary', className)}
      {...(download ? { download: '' } : {})}
    >
      <PixelFill />
      <span className="btn-label">
        {icon}
        {children}
      </span>
    </SmartLink>
  );
}

export function TertiaryLink({
  href,
  locale,
  children,
  className,
  arrow = '↗',
}: {
  href: string;
  locale: string;
  children: ReactNode;
  className?: string;
  arrow?: string;
}) {
  return (
    <SmartLink href={href} locale={locale} className={cn('link-tertiary', className)}>
      {children}
      <span aria-hidden>{arrow}</span>
    </SmartLink>
  );
}
