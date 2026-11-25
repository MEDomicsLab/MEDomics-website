import type { Dict } from '@/content/types';
import { SmartLink } from '@/components/ui/SmartLink';
import { LogoMark } from '@/components/illustrations/LogoMark';
import { PixelStrip } from '@/components/illustrations/PixelStrip';

export function Footer({ dict, locale }: { dict: Dict; locale: string }) {
  const f = dict.footer;
  return (
    <footer data-tone="blue" className="on-blue relative overflow-hidden bg-bg text-fg">
      <PixelStrip accents className="absolute inset-y-0 left-0 hidden w-[72px] sm:block lg:w-[96px]" seed={11} />
      <div className="container-x relative pt-16 pb-10 sm:pl-[calc(var(--gutter)+56px)] lg:pl-[calc(var(--gutter)+3.5rem)]">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:gap-8">
          <div>
            <h2 className="text-h3">{f.contactTitle}</h2>
            <p className="mt-4 text-[0.9375rem] text-muted">{f.contactText}</p>
            <p className="mt-6 text-[0.9375rem]">
              {f.lab.before}
              <SmartLink href={f.lab.href} locale={locale} className="underline decoration-1 underline-offset-4 hover:decoration-2">
                {f.lab.label}
              </SmartLink>
            </p>
            <p className="mt-1 text-[0.9375rem]">{f.location}</p>
          </div>
          {f.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-h4">{col.title}</h2>
              <ul className="mt-4">
                {col.links.map((l) => (
                  <li key={l.label} className="leading-9">
                    <SmartLink href={l.href} locale={locale} className="group text-[0.9375rem] text-muted hover:text-fg">
                      <span className="lines">{l.label}</span>
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-8 border-t border-guide pt-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-end gap-4" aria-hidden>
            <LogoMark mono size={84} className="hidden h-auto w-[clamp(5rem,8vw,10rem)] sm:block" />
            <span className="font-heading text-[clamp(3.5rem,13vw,20rem)] leading-[0.8] tracking-[-0.03em]">MEDomics</span>
          </div>
          <ul className="flex flex-col gap-1 text-caption text-muted lg:items-end">
            {f.legal.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
