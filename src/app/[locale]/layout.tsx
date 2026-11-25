import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import 'lenis/dist/lenis.css';
import '@/styles/globals.css';
import { fontVars } from '@/lib/fonts';
import { getDict, locales } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { Preloader } from '@/components/layout/Preloader';

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getDict(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: d.meta.title,
    description: d.meta.description,
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-32.png', sizes: '32x32' },
      ],
      apple: '/apple-touch-icon.png',
    },
  };
}

export const viewport: Viewport = { themeColor: '#F4F2E8', width: 'device-width', initialScale: 1 };

/**
 * Runs before paint: decides whether the first-visit preloader plays
 * (home page only, once per session, never with reduced motion).
 */
const PRELOADER_GATE = `(function(){try{var d=document.documentElement;var home=/^\\/(en|fr)\\/?$/.test(location.pathname);var seen=sessionStorage.getItem('md-pre');var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;d.setAttribute('data-preloader',(home&&!seen&&!rm)?'on':'off');}catch(e){}})();`;

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDict(locale);
  return (
    <html lang={locale} className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRELOADER_GATE }} />
      </head>
      {/* Browser extensions (Grammarly, ColorZilla, LanguageTool…) inject attributes on <body>
          before React hydrates. This only silences attribute diffs on <body> itself, not its children. */}
      <body suppressHydrationWarning>
        <SmoothScroll />
        <Preloader />
        <Header dict={dict} locale={locale} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer dict={dict} locale={locale} />
      </body>
    </html>
  );
}
