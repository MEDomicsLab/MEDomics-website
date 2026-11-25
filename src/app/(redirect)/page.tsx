import { defaultLocale } from '@/lib/i18n';

/** "/" — the layout's inline script redirects immediately; this link is only seen if it can't. */
export default function RootRedirect() {
  return (
    <p>
      <a href={`/${defaultLocale}/`} style={{ color: 'inherit' }}>
        MEDomics →
      </a>
    </p>
  );
}
