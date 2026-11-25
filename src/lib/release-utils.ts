/** Pure release helpers (no JSON import), safe to use in client components. */
export type Asset = { name: string; url: string; size: number; os: 'windows' | 'linux' | 'mac' | 'other' };
export type Release = {
  tag: string;
  name: string;
  date: string;
  prerelease: boolean;
  url: string;
  channel: 'app' | 'client' | 'server';
  assets: Asset[];
};

export const version = (r?: Release) => (r ? r.tag.replace(/^v/, '') : '');

const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
};

/** Deterministic (no Intl), so server and browser render the same string. */
export function formatDate(iso: string, locale = 'en') {
  const d = new Date(iso);
  const m = (locale === 'fr' ? MONTHS.fr : MONTHS.en)[d.getUTCMonth()];
  return locale === 'fr' ? `${d.getUTCDate()} ${m} ${d.getUTCFullYear()}` : `${m} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function mb(bytes: number) {
  return `${Math.round(bytes / 1048576)} MB`;
}

/** Preferred installer per OS for a release. */
export function installers(r: Release) {
  const pick = (os: Asset['os'], prefer: RegExp[]) => {
    const list = r.assets.filter((a) => a.os === os && !/PythonEnv|old|autoupdate/i.test(a.name));
    for (const re of prefer) {
      const hit = list.find((a) => re.test(a.name));
      if (hit) return hit;
    }
    return list[0];
  };
  return {
    windows: pick('windows', [/\.exe$/]),
    linux: pick('linux', [/ubuntu\.deb$/, /\.deb$/]),
    macPkg: pick('mac', [/\.pkg$/]),
    macDmg: pick('mac', [/\.dmg$/]),
  };
}
