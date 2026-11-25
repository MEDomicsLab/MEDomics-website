import type { Metadata } from 'next';
import Link from 'next/link';
import '@/styles/globals.css';
import { fontVars } from '@/lib/fonts';
import { en } from '@/content/en';
import { LogoMark } from '@/components/illustrations/LogoMark';
import { PixelBoardStrip } from '@/components/illustrations/PixelBoardStrip';

export const metadata: Metadata = {
  title: 'Page not found · MEDomics',
  description: en.notFound.text,
};

/** Served for any unmatched URL (static export writes it to 404.html). */
export default function GlobalNotFound() {
  const t = en.notFound;
  return (
    <html lang="en" className={fontVars}>
      <body suppressHydrationWarning>
        <main data-tone="blue" className="on-blue relative flex min-h-screen flex-col bg-bg text-fg">
          <div className="container-x flex items-center gap-2 border-b border-guide py-3">
            <LogoMark mono size={22} />
            <Link href="/en/" className="font-heading text-[1.0625rem]">
              MEDomics
            </Link>
          </div>
          <div className="container-x flex flex-1 flex-col justify-center py-24">
            <p className="font-pixel text-[clamp(4rem,12vw,10rem)] leading-none">404</p>
            <h1 className="mt-8 text-display">
              {t.title.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-[28.75rem]">{t.text}</p>
            <div className="mt-8">
              <Link href="/en/" className="btn btn-secondary">
                <span className="btn-label">{t.home}</span>
              </Link>
            </div>
          </div>
          <PixelBoardStrip className="h-[7.5rem] w-full text-fg" seed={404} />
        </main>
      </body>
    </html>
  );
}
