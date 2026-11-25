'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Dialog from '@radix-ui/react-dialog';
import * as Accordion from '@radix-ui/react-accordion';
import type { Dict } from '@/content/types';
import { links } from '@/content/links';
import { href, locales } from '@/lib/i18n';

/** Languages in the switch. A language becomes a link once it is in `locales` (i18n.ts); until then it shows as coming soon. */
const LANGS = [
  { code: 'en', name: 'English', soon: 'coming soon' },
  { code: 'fr', name: 'Français', soon: 'bientôt disponible' },
];
import { LogoMark } from '@/components/illustrations/LogoMark';
import { GitHubMark } from '@/components/illustrations/GitHubMark';
import { PixelIcon } from '@/components/illustrations/pixel/PixelIcon';
import type { IconName } from '@/components/illustrations/pixel/icons';
import { PixelMosaic } from '@/components/illustrations/PixelMosaic';
import { PixelFill } from '@/components/ui/PixelFill';

function Chevron() {
  return (
    <svg className="chev size-[0.75rem]" width="12" height="12" viewBox="0 0 10 10" aria-hidden>
      <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function Brand() {
  return (
    <span className="inline-flex items-center gap-[0.55rem]">
      <span className="logo-color">
        <LogoMark size={26} className="h-auto w-[1.7rem]" />
      </span>
      <span className="logo-mono">
        <LogoMark size={26} mono className="h-auto w-[1.7rem]" />
      </span>
      <span className="font-heading text-[1.3rem] leading-none tracking-[-0.01em]">MEDomics</span>
    </span>
  );
}

/** Header palette follows whatever section sits under its bottom edge (pin-proof hit test). */
function useNavSwap(ref: React.RefObject<HTMLElement | null>, pathname: string, forceIvory: boolean) {
  useEffect(() => {
    const header = ref.current;
    const html = document.documentElement;
    if (!header) return;
    let raf = 0;
    let settle = 0; // trailing re-check: pinned scenes move layers in the same frame as the scroll event
    const check = () => {
      raf = 0;
      if (forceIvory) {
        html.removeAttribute('data-nav-on-blue');
        return;
      }
      const y = header.getBoundingClientRect().bottom + 1;
      // skip the header itself and the first-visit preloader overlay, so the page beneath decides
      const hit = document.elementsFromPoint(window.innerWidth / 2, y).find((el) => !header.contains(el) && !el.closest('.preloader'));
      const tone = hit?.closest('[data-tone]')?.getAttribute('data-tone');
      if (tone === 'blue') html.setAttribute('data-nav-on-blue', '');
      else html.removeAttribute('data-nav-on-blue');
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
      clearTimeout(settle);
      settle = window.setTimeout(check, 120);
    };
    html.setAttribute('data-nav-instant', '');
    check();
    const t = window.setTimeout(() => html.removeAttribute('data-nav-instant'), 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(t);
      clearTimeout(settle);
    };
  }, [ref, pathname, forceIvory]);
}

export function Header({ dict, locale }: { dict: Dict; locale: string }) {
  const n = dict.nav;
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState('');
  const [offset, setOffset] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  useNavSwap(ref, pathname, open);

  // close the mobile sheet when the route changes (adjusting state during render, not in an effect)
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOpen(false);
  }

  // the dropdown panel opens directly under its trigger cell and glides between them
  const onMenuChange = (v: string) => {
    setMenu(v);
    const trigger = listRef.current?.querySelector<HTMLElement>(`[data-menu="${v}"]`);
    if (trigger) setOffset(trigger.offsetLeft);
  };

  // rem: the header grows with the fluid root size like the rest of the page
  const cell = 'nav-cell flex h-full items-center border-r border-guide px-[1.1rem] text-[0.875rem] lg:text-[0.9375rem]';

  return (
    <header ref={ref} className="nav-surface sticky top-0 z-50 h-[var(--header-h)] border-b border-guide bg-bg text-fg">
      <a href="#main" className="sr-only-focusable absolute left-2 top-2 z-[60] bg-fg px-3 py-2 text-inv">
        {n.skip}
      </a>
      <div className="flex h-full">
        <Link
          href={href(locale)}
          aria-label={n.home}
          className="nav-cell flex h-full items-center border-r border-guide px-[1.1rem] lg:pr-[1.4rem]"
        >
          <Brand />
        </Link>

        <NavigationMenu.Root value={menu} onValueChange={onMenuChange} className="relative hidden lg:flex" delayDuration={80}>
          <NavigationMenu.List ref={listRef} className="flex h-full">
            <NavigationMenu.Item value="platform">
              <NavigationMenu.Trigger data-menu="platform" className={`${cell} group gap-[0.5rem]`}>
                <span className="lines">{n.platform}</span>
                <Chevron />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="nm-content w-[64rem] max-w-[calc(100vw-12rem)]">
                <div className="grid grid-cols-[21.25rem_1fr]">
                  <div className="flex flex-col justify-between border-r border-guide p-6">
                    <div>
                      <p className="font-heading text-h4">{n.platformIntro.title}</p>
                      <p className="mt-2 text-body text-muted">{n.platformIntro.text}</p>
                    </div>
                    <PixelMosaic className="mt-6 h-[5rem] w-full" seed={7} />
                  </div>
                  <ul className="grid grid-cols-2">
                    {n.platformItems.map((it, i) => (
                      <li
                        key={it.anchor}
                        className={`${i % 2 === 0 ? 'border-r border-dashed border-guide' : ''} ${i < 2 ? 'border-b border-dashed border-guide' : ''}`}
                      >
                        <NavigationMenu.Link asChild>
                          <Link
                            href={href(locale, `platform#${it.anchor}`)}
                            className="group flex h-full items-start justify-between gap-4 p-6 hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]"
                          >
                            <span>
                              <span className="lines font-heading text-h4">{it.title}</span>
                              <span className="mt-2 block text-[0.8125rem] text-muted">{it.text}</span>
                            </span>
                            <PixelIcon name={it.icon as IconName} size={28} />
                          </Link>
                        </NavigationMenu.Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Item value="resources">
              <NavigationMenu.Trigger data-menu="resources" className={`${cell} group gap-[0.5rem]`}>
                <span className="lines">{n.resources}</span>
                <Chevron />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="nm-content w-[47.5rem]">
                <div className="grid grid-cols-[18.75rem_1fr]">
                  <div className="flex flex-col justify-between border-r border-guide p-6">
                    <div>
                      <p className="font-heading text-h4">{n.resourcesIntro.title}</p>
                      <p className="mt-2 text-body text-muted">{n.resourcesIntro.text}</p>
                    </div>
                    <PixelMosaic className="mt-6 h-[4rem] w-full" seed={3} />
                  </div>
                  <ul>
                    {n.resourcesItems.map((it, i) => (
                      <li key={it.title} className={i < n.resourcesItems.length - 1 ? 'border-b border-dashed border-guide' : ''}>
                        <NavigationMenu.Link asChild>
                          <a
                            href={it.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-5 px-6 py-5 hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]"
                          >
                            <PixelIcon name={it.icon as IconName} size={28} />
                            <span>
                              <span className="lines font-heading text-h4">{it.title}</span>
                              <span className="mt-1 block text-[0.8125rem] text-muted">{it.text}</span>
                            </span>
                            <span aria-hidden className="ml-auto">
                              ↗
                            </span>
                            <span className="sr-only"> {dict.common.external}</span>
                          </a>
                        </NavigationMenu.Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavigationMenu.Link asChild>
                <Link href={href(locale, '#open-source')} className={`${cell} group`}>
                  <span className="lines">{n.openSource}</span>
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link asChild>
                <Link
                  href={href(locale, 'about')}
                  className={`${cell} group`}
                  aria-current={pathname.includes('/about') ? 'page' : undefined}
                >
                  <span className="lines">{n.about}</span>
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>

          {/* overflow-hidden clips the slide-down so the panel never passes over its own
              trigger (which would make Radix see a pointer-leave and close the menu) */}
          <div
            className="absolute top-full z-50 overflow-hidden transition-[left] duration-300 ease-out"
            style={{ left: offset } as CSSProperties}
          >
            <NavigationMenu.Viewport className="nm-viewport -ml-px overflow-hidden border border-t-0 border-guide bg-bg" />
          </div>
        </NavigationMenu.Root>

        <div className="flex-1" />

        <div
          role="group"
          aria-label={n.language}
          className="nav-cell flex h-full items-center gap-[0.65rem] border-l border-guide px-[1rem] font-pixel text-[0.8125rem] uppercase"
        >
          {LANGS.map((l) =>
            l.code === locale ? (
              <span key={l.code} lang={l.code} aria-current="true" className="underline decoration-1 underline-offset-[5px]">
                {l.code}
                <span className="sr-only"> ({l.name})</span>
              </span>
            ) : (locales as readonly string[]).includes(l.code) ? (
              <Link
                key={l.code}
                href={pathname.replace(/^\/[a-z]{2}(?=\/|$)/, `/${l.code}`)}
                lang={l.code}
                hrefLang={l.code}
                className="text-muted hover:text-fg"
              >
                {l.code}
                <span className="sr-only"> ({l.name})</span>
              </Link>
            ) : (
              <span
                key={l.code}
                lang={l.code}
                aria-disabled="true"
                title={`${l.name}: ${l.soon}`}
                className="cursor-not-allowed text-muted"
              >
                {l.code}
                <span className="sr-only">
                  {' '}
                  ({l.name}, {l.soon})
                </span>
              </span>
            ),
          )}
        </div>

        <a href={links.github} target="_blank" rel="noopener noreferrer" className={`${cell} group hidden gap-[0.5rem] border-l sm:flex`}>
          <GitHubMark size={18} className="h-auto w-[1.15rem]" />
          <span className="lines">{n.github}</span>
          <span className="sr-only"> {dict.common.external}</span>
        </a>
        <Link
          href={href(locale, 'download')}
          className="btn nav-cta hidden h-full min-h-0 border-0 border-l px-[1.6rem] sm:inline-flex max-[23rem]:hidden!"
        >
          <PixelFill />
          <span className="btn-label">{n.download}</span>
        </Link>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger
            className="nav-cell flex h-full w-[56px] items-center justify-center border-l border-guide lg:hidden"
            aria-label={open ? n.close : n.menu}
          >
            <span className="relative block h-3 w-5" aria-hidden>
              <span
                className={`absolute left-0 h-px w-5 bg-current transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0.5'}`}
              />
              <span
                className={`absolute left-0 h-px w-5 bg-current transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-2.5'}`}
              />
            </span>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Content
              data-tone="ivory"
              className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-bg text-fg lg:hidden"
              aria-describedby={undefined}
            >
              <Dialog.Title className="sr-only">{n.menu}</Dialog.Title>
              <nav className="flex min-h-full flex-col">
                <Accordion.Root type="single" collapsible>
                  {[
                    {
                      key: 'platform',
                      label: n.platform,
                      items: n.platformItems.map((it) => ({ title: it.title, href: href(locale, `platform#${it.anchor}`) })),
                    },
                    { key: 'resources', label: n.resources, items: n.resourcesItems.map((it) => ({ title: it.title, href: it.href })) },
                  ].map((g, gi) => (
                    <Accordion.Item
                      key={g.key}
                      value={g.key}
                      className="sheet-row border-b border-guide"
                      style={{ '--i': gi } as CSSProperties}
                    >
                      <Accordion.Header>
                        <Accordion.Trigger className="flex w-full items-center justify-between px-5 py-4 text-[15px]">
                          {g.label}
                          <Chevron />
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Content className="acc-content">
                        <ul className="pb-3">
                          {g.items.map((it) => (
                            <li key={it.title}>
                              <a
                                href={it.href}
                                className="block border-l border-dashed border-guide py-2.5 pl-4 ml-5 text-[15px] text-muted"
                                {...(it.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                              >
                                {it.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
                {[
                  { label: n.openSource, to: href(locale, '#open-source') },
                  { label: n.about, to: href(locale, 'about') },
                  { label: n.github, to: links.github },
                ].map((r, i) => (
                  <a
                    key={r.label}
                    href={r.to}
                    className="sheet-row block border-b border-guide px-5 py-4 text-[15px]"
                    style={{ '--i': i + 2 } as CSSProperties}
                    {...(r.to.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {r.label}
                  </a>
                ))}
                <div className="mt-auto p-5 sheet-row" style={{ '--i': 6 } as CSSProperties}>
                  <Link href={href(locale, 'download')} className="btn w-full">
                    <span className="btn-label">{n.download}</span>
                  </Link>
                </div>
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
