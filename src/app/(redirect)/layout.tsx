import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { defaultLocale, locales } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site';

/**
 * Root layout for "/" only (a separate root layout from `[locale]`). Static hosts have no server,
 * so this page picks the language in the browser and replaces the URL before first paint.
 * Built as out/index.html; also served by `next dev`, which never serves public/index.html at "/".
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'MEDomics',
  robots: { index: false, follow: true },
  alternates: { canonical: `/${defaultLocale}/` },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
};

const REDIRECT = `(function(){var s=${JSON.stringify(locales)},d=${JSON.stringify(defaultLocale)};try{var l=(navigator.languages||[navigator.language||d]).map(function(x){return String(x).slice(0,2).toLowerCase()});for(var i=0;i<l.length;i++){if(s.indexOf(l[i])>-1){d=l[i];break}}}catch(e){}location.replace('/'+d+'/'+location.hash)})();`;

export default function RedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLocale}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: REDIRECT }} />
        {/* No-JS fallback */}
        <meta httpEquiv="refresh" content={`0; url=/${defaultLocale}/`} />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#F4F2E8',
          color: '#0755B5',
          font: '15px/1.6 Arial, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
